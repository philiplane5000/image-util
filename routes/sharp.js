const express = require("express");
const router = express.Router();
const upload = require("../config/upload-config");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { mimeToExt } = require("../utils/utils");

// -------------------------------------------------------------------- //
/* POST request inits image upload + processing */
// -------------------------------------------------------------------- //
router.post("/", upload.single("originalImg"), async (req, res, next) => {
  try {
    const { tabletWidth, tabletHeight, mobileWidth, mobileHeight } = req.body;
    const { fieldname, originalname, encoding, mimetype, filename, size, destination } = req.file;
    const tabletfilename = `${filename.slice(0,filename.length-4)}-${tabletWidth}x${tabletHeight}${mimeToExt[mimetype]}`;
    const mobilefilename = `${filename.slice(0,filename.length-4)}-${mobileWidth}x${mobileHeight}${mimeToExt[mimetype]}`;
    const tabletImagePath = path.resolve(destination, tabletfilename);
    const mobileImagePath = path.resolve(destination, mobilefilename);
    const promises = [];

    promises.push(
      sharp(req.file.path)
        .resize(parseInt(tabletWidth, 10), parseInt(tabletHeight, 10))
        .jpeg({ quality: 100})
        .toFile(tabletImagePath)
    );

    promises.push(
      sharp(req.file.path)
        .resize(parseInt(mobileWidth, 10), parseInt(mobileHeight, 10))
        .jpeg({ quality: 100})
        .toFile(mobileImagePath)
    );

    /* The default behaviour, when .withMetadata() is not used, is to convert  */
    /* to the device-independent sRGB colour space and strip all metadata,     */
    /* including the removal of any ICC profile.                               */
      
    Promise.all(promises)
      .then(images => {
        images[0].filename = tabletfilename;
        images[0].device = "tablet";
        images[1].filename = mobilefilename;
        images[1].device = "mobile";
        // res.json(images);
        res.render('upload-dashboard', {images: images});
      })
      .catch(err => {
        console.error("Error processing files: ", err);
        try {
          fs.unlinkSync(tabletImagePath);
          fs.unlinkSync(mobileImagePath);
        } catch (e) {
          console.log(e);
        }
      });

  } catch (err) {
    res.sendStatus(400);
  }
});

module.exports = router;
