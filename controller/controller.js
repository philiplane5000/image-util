require("dotenv").config();
const fs = require("fs");
const path = require("path");
const s3 = require("../services/s3");

module.exports = {
  getObject: async (req, res, next) => {
    const { yyyy, mm, dd, filename } = req.params;
    const Key = `${yyyy}\/${mm}\/${dd}\/${filename}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: Key,
    };

    try {
      s3.getObject(params, (err, data) => {
        if (err) {
          console.log(err, err.stack);
          throw new Error("[S3] 'getObject' operation failed");
        } else {
          res.json(data);
        }
      });
    } catch (err) {
      res.sendStatus(400);
    }
  },
  
  getObjectHead: async (req, res, next) => {
    const { yyyy, mm, dd, filename } = req.params;
    const Key = `${yyyy}\/${mm}\/${dd}\/${filename}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: Key,
    };

    try {
      s3.headObject(params, (err, data) => {
        if (err) {
          console.log(err, err.stack);
          throw new Error("[S3] 'headObject' operation failed");
        } else {
          res.json(data);
        }
      });
    } catch (err) {
      res.sendStatus(400);
    }
  },

  listObjects: async (req, res, next) => {
    const { yyyy, mm, dd, filename, maxkeys } = req.params;
    const prefix = filename
      ? `${yyyy}\/${mm}\/${dd}\/${filename}`
      : `${yyyy}\/${mm}\/${dd}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      MaxKeys: maxkeys ? maxkeys : 400,
      Prefix: prefix,
      EncodingType: 'url',
    };

    try {
      s3.listObjectsV2(params, (err, data) => {
        if (err) {
          console.log(err, err.stack);
          throw new Error("[S3] 'listObjectsV2' operation failed");
        } else {
          res.json(data);
        }
      });
    } catch (err) {
      res.sendStatus(400);
    }
  },

  deleteObject: async (req, res, next) => {
    const { key } = req.query;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    try {
      s3.deleteObject(params, (err, data) => {
        if (err) {
          console.log(err, err.stack);
          throw new Error("[S3] 'deleteObject' operation failed");
        } else {
          res.json(data);
        }
      });
    } catch (err) {
      res.sendStatus(400);
    }
  },

  uploadFile: (bucketName, sourcePath, s3DestinationPath) =>
    new Promise((resolve, reject) => {
      const file = path.resolve(sourcePath);
      // call S3 to retrieve upload file to specified bucket
      const uploadParams = {
        Bucket: bucketName,
        Key: s3DestinationPath || path.basename(file),
        Body: "",
      };

      // Configure the file stream and obtain the upload parameters
      const fileStream = fs.createReadStream(file);
      fileStream.on("error", (err) => console.log("File Stream Error", err));
      uploadParams.Body = fileStream;
      // uploadParams.Key = path.basename(file);

      // call S3 to retrieve upload file to specified bucket
      s3.upload(uploadParams, function (err, data) {
        if (err) {
          console.log("[S3] Upload Error", err);
          reject(err);
        } else {
          console.log("[S3] Upload file to:", data.Location);
          resolve(data);
        }
      });
    }),

  /* Below 'downloadFile' method currently not in use but held for reference */
  downloadFile: async (
    bucketName,
    s3FilePath = "",
    localSavePath,
    cb = () => {}
  ) => {
    const params = { Bucket: bucketName, Key: s3FilePath };
    const filePath = path.resolve(localSavePath);

    s3.getObject(params, (err, data) => {
      if (err) console.error(err);
      fs.writeFileSync(filePath, data.Body.toString());
      console.log(`[S3] Downloaded file to ${filePath}`);
      cb(filePath, data);
    });
  },
};
