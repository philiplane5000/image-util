require("dotenv").config();
const express = require("express");
const router = express.Router();
const upload = require("../config/upload-config");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { uploadFile } = require("../controller/controller");
const { mimeToExt } = require("../utils/utils");
// -------------------------------------------------------------------- //
/* POST request to upload images for processing via sharp library       */
// -------------------------------------------------------------------- //
router.post("/sharp", upload.single("originalImg"), async (req, res, next) => {
  try {
    const { lgMediaWidth, lgMediaHeight, mdMediaWidth, mdMediaHeight, smMediaWidth, smMediaHeight, xsMediaWidth, xsMediaHeight, imageFit } = req.body;
    const { fieldname, originalname, encoding, mimetype, filename, size, destination } = req.file;
    // TODO: Convert below to utils function generateFileName(filename, dimensions = {width: -, height: -,})
    const lgMediaFileName = `${filename.slice(0,filename.length-4)}.${lgMediaWidth}x${lgMediaHeight}.lg.${mimeToExt[mimetype]}`;
    const mdMediaFileName = `${filename.slice(0,filename.length-4)}.${mdMediaWidth}x${mdMediaHeight}.md.${mimeToExt[mimetype]}`;
    const smMediaFileName = `${filename.slice(0,filename.length-4)}.${smMediaWidth}x${smMediaHeight}.sm.${mimeToExt[mimetype]}`;
    const xsMediaFileName = `${filename.slice(0,filename.length-4)}.${xsMediaWidth}x${xsMediaHeight}.xs.${mimeToExt[mimetype]}`;
    const lgMediaPath = path.resolve(destination, lgMediaFileName);
    const mdMediaPath = path.resolve(destination, mdMediaFileName);
    const smMediaPath = path.resolve(destination, smMediaFileName);
    const xsMediaPath = path.resolve(destination, xsMediaFileName);
    const promises = [];

    // TODO: Change parameters to single options object with 'width' and 'height' specified
    promises.push(
      sharp(req.file.path)
        .resize(parseInt(lgMediaWidth, 10), parseInt(lgMediaHeight, 10), { fit: imageFit.toLowerCase() })
        .jpeg({ quality: 100})
        .toFile(lgMediaPath)
    );

    promises.push(
      sharp(req.file.path)
        .resize(parseInt(mdMediaWidth, 10), parseInt(mdMediaHeight, 10), { fit: imageFit.toLowerCase() })
        .jpeg({ quality: 100})
        .toFile(mdMediaPath)
    );

    promises.push(
      sharp(req.file.path)
        .resize(parseInt(smMediaWidth, 10), parseInt(smMediaHeight, 10), { fit: imageFit.toLowerCase() })
        .jpeg({ quality: 100})
        .toFile(smMediaPath)
    );

    promises.push(
      sharp(req.file.path)
        .resize(parseInt(xsMediaWidth, 10), parseInt(xsMediaHeight, 10), { fit: imageFit.toLowerCase() })
        .jpeg({ quality: 100})
        .toFile(xsMediaPath)
    );

    /* The default behaviour, when .withMetadata() is not used, is to convert  */
    /* to the device-independent sRGB colour space and strip all metadata,     */
    /* including the removal of any ICC profile.                               */
      
    Promise.all(promises)
      .then(images => {
        images[0].filename = lgMediaFileName;
        images[0].device = "large";
        images[1].filename = mdMediaFileName;
        images[1].device = "medium";
        images[2].filename = smMediaFileName;
        images[2].device = "small";
        images[3].filename = xsMediaFileName;
        images[3].device = "tiny";
        // res.json(images);
        res.render('upload-dashboard', {images: images});
      })
      .catch(err => {
        console.error("Error processing files: ", err);
        try {
          fs.unlinkSync(lgMediaPath);
          fs.unlinkSync(mdMediaPath);
          fs.unlinkSync(smMediaPath);
          fs.unlinkSync(xsMediaPath);
        } catch (e) {
          console.log(e);
        }
      });

  } catch (err) {
    res.sendStatus(400);
  }
});

// -------------------------------------------------------------------- //
/* POST request to upload images to S3 bucket                           */
// -------------------------------------------------------------------- //
router.post("/s3", async (req, res, next) => {
  try {
    const imgsToUpload = req.body.Uploads;
    const promises = [];

    for (img of imgsToUpload) {
      let { filename, format, size } = img, s3FilePath = '';
      const pathToImg = path.format({
        dir: "./uploads",
        base: filename,
      });
      // Convert underscores in source filename to backslashes for S3
      s3FilePath = filename.replace(/_/g, '/');
      
      promises.push(
        uploadFile(process.env.AWS_BUCKET_NAME, pathToImg, s3FilePath)
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
