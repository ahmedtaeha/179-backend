const fs = require("fs");
// const S3 = require('aws-sdk/clients/s3');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const awsCloudFront = require("aws-cloudfront-sign");
const path = require("path");
const crypto = require("crypto");
const bucketName = process.env.AWS_TEMP_MODERATION_BUCKET;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const sharp = require("sharp");

// Input and output file paths
const inputImagePath = "input.jpg"; // Replace with the path to your input image
const outputImagePath = "output.jpg"; // Replace with the desired output path

// Compression options
const targetSizeKB = 500; // Target size in kilobytes (adjust as needed)
let quality = 60; // Initial quality value (adjust as needed)
const maxIterations = 1; // Maximum number of iterations (adjust as needed)

let iterations = 0; // Initialize the iteration count

const compressImage = async (inputImagePath) => {
  return new Promise((resolve, reject) => {
    let quality = 80; // Set your initial quality value here
    let iterations = 0;
    const maxIterations = 10; // Set your maximum number of compression iterations here
    const targetSizeKB = 1024; // Set your target size in kilobytes here

    function compress() {
      sharp(inputImagePath)
        .jpeg({ quality })
        .toBuffer((err, data, info) => {
          if (err) {
            reject(err);
          } else {
            const currentSizeKB = Buffer.byteLength(data) / 1024;
            console.log(
              `Quality: ${quality}, Size: ${currentSizeKB} KB, Iteration: ${iterations}`
            );

            if (
              currentSizeKB > targetSizeKB &&
              quality - 5 > 1 &&
              iterations < maxIterations
            ) {
              quality -= 5;
              iterations++;
              compress(); // Continue compression recursively
            } else {
              resolve(data); // Resolve the Promise with the compressed image data
            }
          }
        });
    }

    compress(); // Start the compression process
  });
};

// Modified uploadFile function
async function uploadFile(file) {
  try {
    // const file = req.file;

    const input = {
      Body: fs.createReadStream(file.path),
      Bucket: bucketName, // required
      Key: file.filename, // required
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(input);
    const response = await s3.send(command);

    return {response,key:file.filename};

    // return res.status(200).json({
    //   status: "success",
    //   data: {
    //     key: response.Key,
    //     filePath: `${process.env.CLOUDFRONT_URL}/${response.Key}`,
    //   },
    // });

    // const compressedImageBuffer = await compressImage(file.path);
    // const outputImagePath =
    //   crypto.randomBytes(60).toString("hex") + "output.jpg"; // Define your output image path
    // console.log("before compression", outputImagePath);
    // // Save the compressed image to the output file
    // await sharp(compressedImageBuffer).toFile(outputImagePath);
    // console.log("Image compressed successfully.", outputImagePath);

    // // Now you can proceed to S3 upload
    // file.path = outputImagePath;
    // file.originalname = "output.jpg";

    // const fileStream = fs.createReadStream(file.path);

    // const input = {
    //   // PutObjectRequest
    //   Body: fileStream, // see \@smithy/types -> StreamingBlobPayloadInputTypes
    //   Bucket: bucketName, // required
    //   Key: file.filename, // required
    //   ContentType:file.mimetype,
    // };

    // const command = new PutObjectCommand(input);
    // const response = await s3.send(command);

    // return {response,key:file.filename};
  } catch (error) {
    console.error("Error:", error);
    throw error; // Rethrow the error for error handling upstream
  }
}
exports.uploadFile = uploadFile;
// downloads a file from s3
function getFileStream(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).createReadStream();
}
exports.getFileStream = getFileStream;

function getFile(fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName,
  };

  return s3.getObject(downloadParams).promise();
}
exports.getFile = getFile;

async function getUrl(fileKey) {
  const data = s3
    .getObject({
      Bucket: bucketName,
      Key: fileKey,
    })
    .promise();
  return data;
}
exports.getUrl = getUrl;

//function to remove url parameters
function removeParam(key, sourceURL) {
  var rtn = sourceURL.split("?")[0],
    param,
    params_arr = [],
    queryString = sourceURL.indexOf("?") !== -1 ? sourceURL.split("?")[1] : "";
  if (queryString !== "") {
    params_arr = queryString.split("&");
    for (var i = params_arr.length - 1; i >= 0; i -= 1) {
      param = params_arr[i].split("=")[0];
      if (param === key) {
        params_arr.splice(i, 1);
      }
    }
    if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
  }
  return rtn;
}

// gets image from cloudfront
async function getFileLink(filename) {
  return new Promise(function (resolve, reject) {
    const options = {
      keypairId: process.env.CLOUDFRONT_ACCESS_KEY_ID,
      privateKeyPath: process.env.CLOUDFRONT_PRIVATE_KEY_PATH,
    };
    const signedUrl = awsCloudFront.getSignedUrl(
      process.env.CLOUDFRONT_URL + filename,
      options
    );
    let url = signedUrl;
    const params = ["Policy", "Expires", "Signature", "Key-Pair-Id"];
    for (let i = 0; i < 4; i++) {
      url = removeParam(params[i], url);
    }
    resolve(url);
  });
}
exports.getFileLink = getFileLink;
