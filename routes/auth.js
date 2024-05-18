const express = require('express');
const {login,registerUser,registerPatient, verifyEmail, verifyMobilePhone} = require('../controllers/auth');

const router = express.Router();
const { body } = require('express-validator');

//Authentication Routers
router.post('/login', login);
router.post('/register-user', registerUser);
router.post('/add-patient', registerPatient);

// verify the email & otp details.
router.post('/verify-email',verifyEmail);
router.post('/verify-mobile',verifyMobilePhone);

module.exports = router;
