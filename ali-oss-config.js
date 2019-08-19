const {
    BUCKET, REGION, ACCESSKEYID, ACCESSKEYSECRET,
} = process.env;

const ossInfo = {
    bucket: BUCKET,
    region: REGION,
    accessKeyId: ACCESSKEYID,
    accessKeySecret: ACCESSKEYSECRET,
    isSetSymlink: false,
};


module.exports = ossInfo;
