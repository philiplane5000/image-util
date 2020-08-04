const express = require('express');
const router = express.Router();

/* GET image upload page */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image Uploader' });
});

module.exports = router;
