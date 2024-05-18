// Import necessary modules
const { DataTypes } = require("sequelize");

// Define Invoice model
const Invoice = (sequelize) => {
  const invoice = sequelize.define("Invoice", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    patientId: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentMode: {
      type: DataTypes.ENUM('cash', 'cheque'),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('paid', 'unpaid'),
      allowNull: false,
    },
    invoiceTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING, // You can adjust the length according to your requirements
      allowNull: false,
      defaultValue: 'USD', // Set a default value if needed
    }
  });

  return invoice;
};

module.exports = {
  Invoice
};
