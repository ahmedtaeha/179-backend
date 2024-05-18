const catchAsync = require("../utils/catchAsync");
const clinicDB = require("../config/DB/index");
const httpStatus = require("http-status");
const validator = require("validator");
const { QueryTypes } = require("sequelize");

exports.getTests = async (req, res, next) => {
  try {
    // const tests = await clinicDB.test.findAll();
    let query = `select * from Tests`

    let tests = await clinicDB.sequelize.query(query, {
      type: QueryTypes.SELECT,
      // attributes: { exclude: ["password"] },
    });

    // Respond with the list of test
    return res.status(200).json({ data: { tests } });
  } catch (error) {
    next(error);
  }
};

exports.addTest = async (req, res, next) => {
  try {
    // const { name, description, procedure, cost, duration,uploads } = req.body; // Drug data to be added
    const { name, description, uploads } = req.body; // Drug data to be added

    if (!Array.isArray(uploads)) {
      return res.status(404).json({
        message: "Uploads should be an array",
      });
    }

    const uploadsJson = JSON.stringify(uploads);

    // Create a new drug in the database
    const newTest = await clinicDB.test.create({
      name,
      description,
      uploads:uploadsJson
    });

    // Respond with success message
    return res.status(201).json({
      data: {
        message: "Test added successfully",
        data: newTest,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.editTest = async (req, res, next) => {
  try {
    const { id } = req.params; // Assuming the drug ID is passed as a URL parameter
    const { name, description, uploads } = req.body; // Updated drug data

    const test = await clinicDB.test.findByPk(id);
    if (!test) {
      return res.status(404).json({ message: "test not found" });
    }

    if (!Array.isArray(uploads)) {
      return res.status(404).json({
        message: "Uploads should be an array",
      });
    }

    const uploadsJson = JSON.stringify(uploads);

    let params = {};

    if (name) params["name"] = name;
    if (description) params["description"] = description;
    if(uploads) params["uploads"] = uploadsJson

    await clinicDB.test.update(params, {
      where: {
        id,
      },
    });

    // Respond with success message
    return res.status(200).json({
      message: "Test updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTest = async (req, res, next) => {
  try {
    const { id } = req.params; // Assuming the drug ID is passed as a URL parameter

    // Find the drug by ID and delete it
    const test = await clinicDB.test.findByPk(id);
    if (!test) {
      return res.status(404).json({ message: "Drug not found" });
    }
    await test.destroy();

    // Respond with success message
    return res.status(200).json({
      message: "Test deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
