const express = require('express');
const {getPatient, editPaitent, deletePaitent, updateSettings, getSettings} = require('../controllers/users');

const router = express.Router();
const { body } = require('express-validator');

router.get('/get-patients/:userId', getPatient);
router.put('/edit-patient/:id', editPaitent);
router.delete('/delete-patient/:id', deletePaitent);

router.put('/settings/:id', updateSettings);
router.get('/settings/:id', getSettings);


module.exports = router;
