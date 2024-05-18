const express = require('express');
const { getMedicines, addMedicine, editMediciine, deleteMedicine } = require('../controllers/medicines');

const router = express.Router();
const { body } = require('express-validator');

router.get('/get-drugs/', getMedicines);
router.post('/add-drug/', addMedicine);
router.put('/drug/:id', editMediciine);
router.delete('/delete-drug/:id', deleteMedicine);

module.exports = router;
