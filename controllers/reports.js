const catchAsync = require("../utils/catchAsync");
const clinicDB = require("../config/DB/index");
const httpStatus = require("http-status");
const validator = require("validator");
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const ApiError = require("./../utils/ApiError");

exports.getListOfStatitcs = catchAsync(async (req, res, next) => {
  try {
    let {userId} = req.params
    if (!userId) {
      return res.status(404).json({
        data: {
          error: `Please enter userId`,
        },
      });
    }
    // reports ---> revenue (paid invoices),
    let query1 = `select sum(amount) as total_revenue from Invoices where paymentStatus='paid' and userId=${userId}`;

    const revenue = await clinicDB.sequelize.query(query1, {
      type: QueryTypes.SELECT,
    });

    // no of paitent ,

    let query2 = `select count(*) as total_patients from Patients where userId=${userId}`;
    const patients = await clinicDB.sequelize.query(query2, {
      type: QueryTypes.SELECT,
      attributes: { exclude: ["password"] },
    });

    // appointment
    let query3 = `select count(*) as total_appointment from Appointments where userId=${userId}`;
    const appointments = await clinicDB.sequelize.query(query3, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({ data: { revenue, patients, appointments } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
