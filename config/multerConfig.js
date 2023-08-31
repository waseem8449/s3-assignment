const fs = require('fs');
const path = require('path');
const multer = require("multer");

//Multer that handle File Uploads
exports.upload = () => {
    return imageUpload = multer({
      storage: multer.diskStorage({
        destination: function (req, file, cb) {
          const bucketName = req.query.bucketName;
          console.log(bucketName,"88888", );
          const path = `S3Service/${bucketName}/`;
          fs.mkdirSync(path, { recursive: true })
          cb(null, path);
        },
        filename: function (req, file, cb) {
          cb(null, `${Date.now()}${file.originalname}`);
        }
      }),
      limits: { fileSize: 10000000 },
      fileFilter: function (req, file, cb) {
        cb(null, true);
      }
    })
  }