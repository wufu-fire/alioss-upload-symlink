const { promisify } = require('util');
const fsp = require('fs-promise');

const OSS = require('ali-oss');
const chalk = require('chalk');
const debug = require('debug')("oss-upload");

const log = console.log;
const pat = /\.(exe|blockmap|yml)$/;
let fileList:[string];


interface CONFIG {
    accessKeyId: string,
    accessKeySecret: string,
    bucket: string,
    region: string,
    path: string,
    output?: string,
    stsToken?: string,
    endpoint?: string,
    internal?: boolean,
    cname?: boolean,
    isRequestPay?: boolean,
    secure?: boolean,
    timeout?: string
}

async function multipartUpload(fileList:[string], client:any, output:string) {
    for(let file of fileList) {
        try {
            let result = await client.multipartUpload(file, `${output}/${file}`, {
                progress(p:number){
                    log(chalk.blue(`${file}上传中: ${100 * p}%`));
                }
            });
            debug(`upload ${file} result is: ${result}`);
            let head = await client.head('object-name');
            debug(`upload ${file} head is: ${head}`);
        } catch (e) {
            log(chalk.red(`upload ${file} error: ${JSON.stringify(e)}`));
        }
    }
}

const preUpload = (config: CONFIG) => {
    const { output='dist' } = config;

    (async () => {
        try {
            const files = await fsp.readdir(output);
            debug(`dist contains: ${fileList}`);
            files.forEach((file:string) => {
                if(pat.test(file)){
                    fileList.push(file)
                }
            });
        } catch (e) {
            log(chalk(`'error: '${JSON.stringify(e)}`));
        }
    })();
    debug(`dist after filter contains: ${fileList}`);
    const client = new OSS(config);

    multipartUpload(fileList, client, output)
}

const readConfigFile = (configPath:string) => {
    debug(`configuration file path is: ${configPath}`);
    if(!configPath){
        log(chalk.blue('configuration file ') + chalk.red('alioss-config.js/alioss-config.json') + chalk.blue(' is not found!'));
        return;
    }
    const config = require(configPath);
    debug(`configuration file content is: ${config}`);
    preUpload(config);
}


module.exports = readConfigFile;
