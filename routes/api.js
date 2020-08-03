require("dotenv").config();
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const AWS = require('aws-sdk');
// const { uploadFile } = require("../services/s3");
const s3 = new AWS.S3({
  region: 'us-west-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
// -------------------------------------------------------------------- //
/* GET request to list objects in S3 bucket */
// -------------------------------------------------------------------- //
router.get("/list", async (req, res, next) => {
  try {
    console.log('---------------------------')
    console.log(req.query)
    console.log('---------------------------')
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjects-property
    var params = {
      Bucket: process.env.AWS_BUCKET_NAME, 
      MaxKeys: 100,
      Prefix: req.query.year ? req.query.year : ''
     };
     s3.listObjectsV2(params, function(err, data) {
       if (err) {
        throw new Error("[S3] 'listObjectsV2' operation failed");
       } else {
        res.json(data);
       }
     });

  } catch (err) {
    res.sendStatus(400);
  }

});

module.exports = router;
