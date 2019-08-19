# Install
```js
yarn add alioss-upload-symlink -d
```
or
```js
npm install alioss-upload-symlink -D
```

# Usage
create a config file in the root directory, for example: ali-oss-config.js
```javascript
const {
    BUCKET, REGION, ACCESSKEYID, ACCESSKEYSECRET,
} = process.env;

const ossInfo = {
    bucket: BUCKET,
    region: REGION,
    accessKeyId: ACCESSKEYID,
    accessKeySecret: ACCESSKEYSECRET,
    output?: 'dist',
    isSetSymlink?: false
};

module.exports = ossInfo;

```
add a script to package.json
```json
"scripts": {
    "publish": "oss-publish --config ali-oss-config.js"
}
```
