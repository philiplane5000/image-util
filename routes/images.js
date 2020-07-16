const express = require('express');
const router = express.Router();

/* GET image upload page */
router.get('/', function(req, res, next) {
  res.render('images', { title: 'Image Uploader' });
});

module.exports = router;
