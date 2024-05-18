const { DataTypes } = require("sequelize");

const Test = (sequelize) => {
    const test = sequelize.define("Test", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
      },
      // procedure: {
      //   type: DataTypes.STRING,
      // },
      // cost: {
      //   type: DataTypes.FLOAT,
      // },
      // duration: {
      //   type: DataTypes.STRING,
      // },
      uploads: {
        type: DataTypes.TEXT,
        // defaultValue: [],
      },
    });
  
    return test;
  };
  

  module.exports = {
    Test,
  };