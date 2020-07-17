const multer = require('multer');
// const { timestamp } = require('../utils/utils');

// -------------------------------------------------------------------- //
/* Multer Config: */
// -------------------------------------------------------------------- //
// -------------------------------------------------------------------- //
/* Storage strategy */
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
})

/* Filter or reject some files if not conform to specific mimetype */
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('mimetype error'), false);
  }
}

/* Pass above options to multer upload options */
// Setting maxFileSize to 10MB:
const maxFileSize = 1024 * 1024 * 10;

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: maxFileSize}
});

module.exports = upload;