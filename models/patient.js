// Import necessary modules
const { DataTypes } = require("sequelize");

// Define Patient model
const Patient = (sequelize) => {
  const patient = sequelize.define("Patients", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthday: {
      type: DataTypes.DATEONLY,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
    },
    mobileNo: {
      type: DataTypes.STRING,
    },
    bloodGroup: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'),
    },
    weight: {
      type: DataTypes.FLOAT,
    },
    height: {
      type: DataTypes.FLOAT,
    },
    address: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    // knownDiseases: {
    //   type: DataTypes.STRING,
    // },
    healthConditions: {
      type: DataTypes.STRING,
    },
    currentIllnesses: {
      type: DataTypes.STRING,
    },
    previousIllnesses: {
      type: DataTypes.STRING,
    },
    SpecificAllergies: {
      type: DataTypes.STRING,
    },
    period: {
      type: DataTypes.STRING,
    },
    familyHistory: {
      type: DataTypes.STRING,
    },
    patientHistory: {
      type: DataTypes.STRING,
    },
    diseases: {
      type: DataTypes.STRING,
    },
    martialStatus:{
      type:DataTypes.STRING
    }
  });

  return patient;
};

module.exports = {
  Patient
};
