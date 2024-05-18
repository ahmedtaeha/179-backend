const { User, Patient } = require('../models');
const jwt = require('jsonwebtoken');

// Login endpoint
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists in the User model
    const user = await User.findOne({ where: { email } });
    if (user && await user.comparePassword(password)) {
      // If user exists and password matches, generate JWT
      const token = jwt.sign({ id: user.id, role: 'user' }, process.env.JWT_SECRET);
      return res.status(200).json({ token });
    }

    // Check if user exists in the Patient model
    const patient = await Patient.findOne({ where: { email } });
    if (patient && await patient.comparePassword(password)) {
      // If patient exists and password matches, generate JWT
      const token = jwt.sign({ id: patient.id, role: 'patient' }, process.env.JWT_SECRET);
      return res.status(200).json({ token });
    }

    // If no user or patient found, return error
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  login
};
