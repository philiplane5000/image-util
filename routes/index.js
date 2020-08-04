const express = require('express');
const router = express.Router();

/* GET image upload page */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image Uploader' });
});

/* GET manage-dashboard page */
router.get('/manage', function(req, res, next) {
  res.render('manage-dashboard', { title: 'Manage Dashboard' });
});

module.exports = router;
