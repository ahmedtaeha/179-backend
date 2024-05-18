const catchAsync = require("../utils/catchAsync");
const clinicDB = require("../config/DB/index");
const httpStatus = require("http-status");
const validator = require("validator");
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const ApiError = require("./../utils/ApiError");

exports.getListOfUsers = catchAsync(async (req, res, next) => {
  try {
    let { email } = req.query;
    let query = `select id, firstName,lastName,gender,email,userRole, languages,mobileNo,address,image,bio from Users where email<>:email`;

    let users = await clinicDB.sequelize.query(query, {
      replacements: { email },
      type: QueryTypes.SELECT,
    });

    res.status(200).json({ data: { users } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

exports.addUser = catchAsync(async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      email,
      languages,
      mobileNo,
      address,
      userRole,
      image,
      bio,
      password,
    } = req.body;

    const user = await clinicDB.users.findOne({ where: { email } });

    if (user) {
      return next(new ApiError("User already exists", 403));
    }

    const languagesString = languages;

    // Create the user in the database
    const newUser = await clinicDB.users.create({
      firstName,
      lastName,
      gender,
      email,
      languages: languagesString,
      mobileNo,
      address,
      userRole,
      image,
      bio,
      password: bcrypt.hashSync(password, 10),
    });

    // Respond with success message
    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

exports.updateUser = catchAsync(async (req, res, next) => {
  try {
    let { id } = req.params;
    const {
      firstName,
      lastName,
      gender,
      languages,
      mobileNo,
      address,
      userRole,
      image,
      bio,
    } = req.body;

    const users = await clinicDB.users.findByPk(id);
    if (!users) {
      return res.status(404).json({ message: "users not found" });
    }

    let parmas = {} 
    if(firstName) parmas['firstName'] = firstName
    if(lastName) parmas['lastName'] = lastName
    if(gender) parmas['gender'] = gender
    if(languages) parmas['languages'] = languages
    if(mobileNo) parmas['mobileNo'] = mobileNo
    if(address) parmas['address'] = address
    if(userRole) parmas['userRole'] = userRole
    if(image) parmas['image'] = image
    if(bio) parmas['bio'] = bio

    await clinicDB.patient.update(parmas, {
      where: {
        id,
      },
    });

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  try {
    let { id } = req.params;
    const user = await clinicDB.users.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.destroy();
    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
