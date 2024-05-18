// Import necessary modules
const { DataTypes } = require("sequelize");

const appointment = (sequelize) => {
  const Appointment = sequelize.define("Appointments", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    motifPatient: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    timezone:{
      type: DataTypes.STRING,
    }
  });


  return Appointment;
};

module.exports = {
  appointment,
};
