require("dotenv").config();
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { uploadFile } = require("../services/s3");
// -------------------------------------------------------------------- //
/* POST request to upload images to S3 bucket */
// -------------------------------------------------------------------- //
router.post("/", async (req, res, next) => {
  try {
    const imgsToUpload = req.body.Uploads;
    const promises = [];

    for (img of imgsToUpload) {
      let { filename, format, size } = img;
      
      const pathToImg = path.format({
        dir: "./uploads",
        base: filename,
      });
      
      promises.push(
        uploadFile(process.env.AWS_BUCKET_NAME, pathToImg, filename)
      );
    }

    Promise.all(promises)
      .then((metadata) => {
        res.json(metadata);     
      })
      .catch((err) => {
        throw new Error("Error upploading files");
      });

  } catch (err) {
    res.sendStatus(400);
  }

});

module.exports = router;
