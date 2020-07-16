const express = require('express');
const router = express.Router();
const upload = require('../config/upload-config');
const sharp = require('sharp');
const path = require('path');


// -------------------------------------------------------------------- //
/* POST request inits image upload + processing */
// -------------------------------------------------------------------- //
router.post('/', upload.single('masterImg'), async (req, res, next) => {
  try {

    let newImgPath = path.resolve(req.file.destination, `${req.file.originalname}-480x270.jpg`);

    await sharp(req.file.path)
      .resize(480, 270)
      .toFormat('jpeg')
      .toFile(newImgPath, (err, info) => {
        if (err) {
          throw new Error('Error processing image with sharp');
          // console.log('err: ', err);
        } else {
          res.json({info: info})
        }
      })

  } catch (err) {
    res.sendStatus(400);
  }
})

module.exports = router;
