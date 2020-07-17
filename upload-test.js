require('dotenv').config();
const { uploadFile } = require('./services/s3');
// const fs = require('fs');
const path = require('path');

let imgPath = path.format({
  dir: './uploads',
  base: '07172020--boardwalk-960x540.jpg'
});

let imgResolved = path.resolve(__dirname, '07172020--boardwalk-960x540.jpg');
console.log('imgResolved', imgResolved);
const { base } = path.parse(imgResolved);

console.log(base);
// Returns: '/file.txt'

uploadFile(process.env.AWS_BUCKET_NAME, imgPath, `${base}`, (data) => {
  console.log('[S3] Data: ', data);
})

// const localFile = path.resolve(destination, 'boardwalk');


// uploadFile(process.env.AWS_BUCKET_NAME)
