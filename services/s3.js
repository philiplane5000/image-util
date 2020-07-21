require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
  region: 'us-west-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

module.exports = {
  downloadFile: async (bucketName, s3FilePath = '', localSavePath, cb = () => {}) => {
    // call S3 to retrieve upload file to specified bucket
    const params = { Bucket: bucketName, Key: s3FilePath };
    const filePath = path.resolve(localSavePath);

    s3.getObject(params, (err, data) => {
      if (err) console.error(err);
      fs.writeFileSync(filePath, data.Body.toString());
      console.log(`[S3] Downloaded file to ${filePath}`);
      cb(filePath, data);
    });
  },

  uploadFile: (bucketName, sourcePath, s3DestinationPath) => new Promise((resolve,reject) => {
    const file = path.resolve(sourcePath);
    // call S3 to retrieve upload file to specified bucket
    const uploadParams = {
      Bucket: bucketName,
      Key: s3DestinationPath || path.basename(file),
      Body: ''
    };

    // Configure the file stream and obtain the upload parameters
    const fileStream = fs.createReadStream(file);
    fileStream.on('error', (err) => console.log('File Stream Error', err));
    uploadParams.Body = fileStream;
    // uploadParams.Key = path.basename(file);

    // call S3 to retrieve upload file to specified bucket
    s3.upload(uploadParams, function (err, data) {
      if (err) {
        console.log('[S3] Upload Error', err);
        reject(err)
      }

      if (data) {
        console.log('[S3] Upload file to:', data.Location);
        resolve(data);
      }
    });
  }),

};
