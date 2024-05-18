const fs = require("fs");
const util = require("util");
const multer = require("multer");
const { uploadFile, getFileLink } = require("../utils/s3Public");
const catchAsync = require("./../utils/catchAsync");
const { s3 } = require("../utils/s3");
const ApiError = require("../utils/ApiError");
const unlinkFile = util.promisify(fs.unlink);

const bucketName = process.env.AWS_TEMP_MODERATION_BUCKET;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

// exports.uploadFile = multer({ dest: "uploads/" });
exports.uploadFile = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf", "video/mp4"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Please upload a valid image, PDF, or video file"), false); // Reject the file
    }
  },
});


exports.upload = catchAsync(async (req, res, next) => {
  try{
    const file = req.file;
    const result = await uploadFile(file);
    await unlinkFile(file.path);
  
    // await unlinkFile('uploads/' + file.filename);
  
    res.status(200).json({
      status: "success",
      data: {
        key: result.key,
        filePath:`${process.env.CLOUDFRONT_URL}/${result.key}`,
        filetype:file?.mimetype
      },
    });
  }catch(e){
    res.status(500).json({
      status: "failure",
      message:e.message,
    })
  }
});

exports.download = async (req, res) => {
  // let response = await getFileLink(req.query.filename);
  // res.send(response);
  // res.end();

  res.status(200).json({
    status: "success",
    data: {
      filePath:`${process.env.CLOUDFRONT_URL}/${req.query.filename}`
    },
  });


};