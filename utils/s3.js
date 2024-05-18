const fs = require('fs');
// const S3 = require('aws-sdk/clients/s3');
const { S3Client, ListBucketsCommand } =  require("@aws-sdk/client-s3");

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3Client({
  region,
  accessKeyId,
  secretAccessKey,
});

// uploads a file to s3
function uploadFile(file) {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename,
    content_type: 'image/png',
  };

  //s3.putObject(bucketName, 'test.png', fileStream, { logRequests:true });
  return s3.upload(uploadParams).promise();
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

exports.s3 = s3;
