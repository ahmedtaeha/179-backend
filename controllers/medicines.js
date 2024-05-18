const catchAsync = require("../utils/catchAsync");
const clinicDB = require("../config/DB/index");
const httpStatus = require("http-status");
const validator = require("validator");

exports.getMedicines = async (req, res, next) => {
  try {
    // Fetch all drugs from the database
    const drugs = await clinicDB.drug.findAll();

    // Respond with the list of medicine
    return res.status(200).json({ data: { drugs } });
  } catch (error) {
    next(error);
  }
};

exports.addMedicine = async (req, res, next) => {
  try {
    const {name,genericName,note} = req.body; // Drug data to be added

    // Create a new drug in the database
    const newMedicine = await clinicDB.drug.create({
      name,genericName,note
    });

    // Respond with success message
    return res.status(201).json({
      data: {
        message: "drug added successfully",
        data: newMedicine,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.editMediciine = async (req, res, next) => {
  try {
    const { id } = req.params; // Assuming the drug ID is passed as a URL parameter
    const { name, genericName,note } = req.body; // Updated drug data

    const drug = await clinicDB.drug.findByPk(id);
    if (!drug) {
      return res.status(404).json({ message: "drug not found" });
    }

    let params = {};

    if (name) params["name"] = name;
    if(genericName) params['genericName'] = genericName
    if(note) params['note'] = note

    await clinicDB.drug.update(params, {
      where: {
        id,
      },
    });
    
    // Respond with success message
    return res.status(200).json({
      message: "Drug updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMedicine = async (req, res, next) => {
  try {
    const { id } = req.params; // Assuming the drug ID is passed as a URL parameter

    // Find the drug by ID and delete it
    const drug = await clinicDB.drug.findByPk(id);
    if (!drug) {
      return res.status(404).json({ message: "Drug not found" });
    }
    await drug.destroy();

    // Respond with success message
    return res.status(200).json({
      message: "Drug deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
