require("dotenv").config();
const express = require("express");
const router = express.Router();
const { getObject, listObjects, deleteObject } = require("../services/s3");
// -------------------------------------------------------------------- //
/* GET req to get single object in S3 via key specified thru params     */
// -------------------------------------------------------------------- //
router.get("/object/:yyyy/:mm/:dd/:key", getObject);

// -------------------------------------------------------------------- //
/* GET req to list objects in S3 bucket via date specified thru params  */
// -------------------------------------------------------------------- //
router.get("/list/:yyyy/:mm/:dd/:filename?/:maxkeys?", listObjects);
/* Note: question marks above set preceding parameter as optional       */

// -------------------------------------------------------------------- //
/* DELETE req to delete object in S3 via key specified as query str     */
// -------------------------------------------------------------------- //
router.delete("/object", deleteObject);

module.exports = router;
