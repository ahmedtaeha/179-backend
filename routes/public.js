/* eslint-disable */
const express = require('express');
const publicController = require('../controllers/handleCaching');

const router = express.Router();

//Authentication Routers

router.post(
  '/upload',
  publicController.uploadFile.single('file'),
  publicController.upload
);

router.get('/download/', publicController.download);

module.exports = router;
