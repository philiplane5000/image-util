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
    const { lgMediaWidth, lgMediaHeight, mdMediaWidth, mdMediaHeight, smMediaWidth, smMediaHeight, xsMediaWidth, xsMediaHeight, imageFit } = req.body;
    const { fieldname, originalname, encoding, mimetype, filename, size, destination } = req.file;
    // TODO: Convert below to utils function generateFileName(filename, dimensions = {width: -, height: -,})
    const lgMediaFileName = `${filename.slice(0,filename.length-4)}-${lgMediaWidth}x${lgMediaHeight}${mimeToExt[mimetype]}`;
    const mdMediaFileName = `${filename.slice(0,filename.length-4)}-${mdMediaWidth}x${mdMediaHeight}${mimeToExt[mimetype]}`;
    const smMediaFileName = `${filename.slice(0,filename.length-4)}-${smMediaWidth}x${smMediaHeight}${mimeToExt[mimetype]}`;
    const xsMediaFileName = `${filename.slice(0,filename.length-4)}-${xsMediaWidth}x${xsMediaHeight}${mimeToExt[mimetype]}`;
    const lgMediaPath = path.resolve(destination, lgMediaFileName);
    const mdMediaPath = path.resolve(destination, mdMediaFileName);
    const smMediaPath = path.resolve(destination, smMediaFileName);
    const xsMediaPath = path.resolve(destination, xsMediaFileName);
    const promises = [];

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

module.exports = router;
