const express = require('express');
const { getTests, addTest, editTest, deleteTest } = require('../controllers/tests');

const router = express.Router();
const { body } = require('express-validator');

router.get('/get-tests', getTests);
router.post('/add-test', addTest);
router.put('/edit-test/:id', editTest);
router.delete('/delete-test/:id', deleteTest);

module.exports = router;
