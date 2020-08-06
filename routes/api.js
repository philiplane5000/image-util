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
router.get("/list/:date", async (req, res, next) => {
  try {
    let { date } = req.params;
    console.log('[S3] date: ', date);
    let prefix = date.replace(/-/g, '/');
    console.log('[S3] prefix: ', prefix);

    var params = {
      Bucket: process.env.AWS_BUCKET_NAME, 
      MaxKeys: 100,
      Prefix: prefix
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

router.delete("/object", async (req, res, next) => {
  console.log(req.query);
  let key = req.query.key;
  // const { key } = req.params;
  console.log('key: ', key);

  try {
    var params = {
      Bucket: process.env.AWS_BUCKET_NAME, 
      Key: key
    };
    s3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err, err.stack); // an error occurred
      } else {
        res.json(data);
      }
    });    
  } catch (err) {
    res.sendStatus(400);
  }
})

router.get("/object/:key", async (req, res, next) => {
  try {
    res.json({INDEV: true})
  } catch (err) {
    res.sendStatus(400);
  }
})



module.exports = router;
