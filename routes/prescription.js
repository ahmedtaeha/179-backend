const express = require('express');
const { getPrescription, addPrescription, deletePrescription } = require('../controllers/prescription');

const router = express.Router();
const { body } = require('express-validator');

router.get('/get-prescription/:userId', getPrescription);
router.post('/add-prescription/:userId', addPrescription);
router.delete('/delete-prescription/:id',deletePrescription);

module.exports = router;
