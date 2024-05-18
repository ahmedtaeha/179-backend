// Import necessary modules
// import { DataTypes } from 'sequelize';
const { DataTypes } = require("sequelize");
const { status } = require("../utils/Status");

// Define User model
const User = (sequelize) => {
  const user = sequelize.define("Users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    languages: {
      type: DataTypes.STRING,
      value: DataTypes.ENUM("arabic", "english", "french", "german"),
    },
    mobileNo: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    userRole: {
      type: DataTypes.STRING,
      value: DataTypes.ENUM(
        "doctors",
        "physicianAssistants",
        "nurses",
        "nursePractitioners"
      ),
    },
    image: {
      type: DataTypes.STRING,
    },
    bio: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    appointment_interval: {
      type: DataTypes.INTEGER,
    },
    schedule: {
      type: DataTypes.JSON,
    },
    emailOtp:{
      type:DataTypes.INTEGER
    },
    mobileOtp:{
      type:DataTypes.INTEGER
    },
    status:{
      type:DataTypes.STRING,
      default:status.UN_VERIFY
    }
  });

  return user;
};

module.exports = {
  User,
};
