// Import necessary modules
// import { DataTypes } from 'sequelize';
const { DataTypes } = require("sequelize");

// Define User model
const Prescription = (sequelize) => {
  const prescription = sequelize.define("Prescriptions", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    drugs: {
      type: DataTypes.JSON,
    },
    tests: {
      type: DataTypes.JSON,
    },
  });

  return prescription;
};

module.exports = {
    Prescription,
};
