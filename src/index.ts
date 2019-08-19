const fsp = require('fs-promise');
const path = require('path');

const OSS = require('ali-oss');
const chalk = require('chalk');
const debug = require('debug')('oss-upload');

const { log } = console;
const pat = /\.(exe|blockmap|yml)$/;
const fileList: Array<string> = [];
let uploadAll: boolean = true;

interface CONFIG {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
  path: string;
  output?: string;
  isSetSymlink?: boolean;
  stsToken?: string;
  endpoint?: string;
  internal?: boolean;
  cname?: boolean;
  isRequestPay?: boolean;
  secure?: boolean;
  timeout?: string;
}

const multipartUpload = async (
  fileList: string[],
  client: any,
  output: string,
  isSetSymlink: boolean
) => {
  for (const file of fileList) {
    try {
      const result = await client.multipartUpload(file, `${output}/${file}`, {
        progress(p: number) {
          log(chalk.blue(`${file}上传中: ${100 * p}%`));
        },
      });
      debug(`upload ${file} result is: ${JSON.stringify(result)}`);
      const head = await client.head(file);
      debug(`upload ${file} head is: ${JSON.stringify(head)}`);
    } catch (e) {
      uploadAll = false;
      log(chalk.red(`upload ${file} error: ${JSON.stringify(e)}`));
    }
  }
  if (isSetSymlink && uploadAll) {
    // 执行软链接
    const { version, name } = require(path.resolve('package.json'));
    const linkname = `${name}-latest.exe`;
    const targetname = `${name}-${version}.exe`;
    const symLinkHeader = {
      headers: {
        'Content-Disposition': `attachment;filename="${name}-${version}.exe"`,
      },
      meta: {
        version,
      },
    };

    client.putSymlink = async (
      linkname: string,
      targetname: string,
      options: any = {}
    ) => {
      const selfOptions = options;
      const _targetname = encodeURIComponent(targetname);
      selfOptions.headers = selfOptions.headers || {};
      client._convertMetaToHeaders(selfOptions.meta, selfOptions.headers);
      selfOptions.headers['x-oss-symlink-target'] = _targetname;
      selfOptions.subres = 'symlink';
      if (selfOptions.storageClass) {
        selfOptions.headers['x-oss-storage-class'] = selfOptions.storageClass;
      }
      const method = selfOptions.method || 'PUT';
      const params = client._objectRequestParams(method, linkname, selfOptions);

      params.xmlResponse = true;
      params.successStatuses = [200];
      const result = await client.request(params);
      log(chalk.blue('symlink done!'));
      debug(`symlink done!, the result is ${JSON.stringify(result)}`);
      return result;
    };
    client.putSymlink(linkname, targetname, symLinkHeader);
  }
};

const preUpload = (config: CONFIG) => {
  const { output = 'dist', isSetSymlink = false } = config;
  const outputPath = path.resolve(output);
  (async () => {
    try {
      const files = await fsp.readdir(outputPath);
      debug(`dist contains: ${JSON.stringify(files)}`);
      files.forEach((file: string) => {
        if (pat.test(file)) {
          fileList.push(file);
        }
      });
      debug(`dist after filter contains: ${JSON.stringify(fileList)}`);
      const client = new OSS(config);
      multipartUpload(fileList, client, output, isSetSymlink);
    } catch (e) {
      log(chalk(`'error: '${JSON.stringify(e)}`));
    }
  })();
};

const readConfigFile = (configPath: string) => {
  debug(`configuration file path is: ${JSON.stringify(configPath)}`);
  if (!configPath) {
    log(
      chalk.blue('configuration file ') +
        chalk.red('alioss-config.js/alioss-config.json') +
        chalk.blue(' is not found!')
    );
    return;
  }
  const bsConfigPath = path.resolve(configPath);
  const config = require(bsConfigPath);
  debug(`configuration file content is: ${JSON.stringify(config)}`);
  preUpload(config);
};

module.exports = readConfigFile;
