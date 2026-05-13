// awsConfig.js
const AWS = require('aws-sdk');

const configureAWS = () => {
    AWS.config.update({
        accessKeyId: process.env.ACCESSKEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        region: process.env.REGION,
    });
};

module.exports = configureAWS;
