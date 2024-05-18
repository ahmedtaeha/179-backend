const { DataTypes } = require("sequelize");

const Medicines = (sequelize) => {
  const medicine = sequelize.define("Drugs", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    genericName: {
      type: DataTypes.STRING,
    },
    note: {
      type: DataTypes.TEXT,
    },
  });

  return medicine;
};

module.exports = {
  Medicines,
};
