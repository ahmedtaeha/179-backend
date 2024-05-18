const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const clinicDB = require("../config/DB/index");
const httpStatus = require("http-status");
const validator = require("validator");
const bcrypt = require("bcrypt");
const AppError = require("../utils/ApiError");
const { sendEmail } = require("./../utils/emailNotification");
const { sendOtp } = require("./../utils/smsNotification");
const { status } = require("./../utils/Status");
const { QueryTypes, Op } = require("sequelize");
const { schedule } = require('./../utils/Status');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output but will not from database
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.login = catchAsync(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("User with this email does not exist", 400));
    }

    // Check if user exists in the User model
    const user = await clinicDB.users.findOne({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      // If user exists and password matches, generate JWT
      const token = jwt.sign(
        { id: user.id, role: "user" },
        process.env.JWT_SECRET
      );
      if (user.status != status.VERIFY) {
        return res.status(403).json({
          status: "failure",
          message: "Please verify Eamil and Mobile Both.",
          profileStatus: user.status,
        });
      }
      return res.status(200).json({
        data: {
          id: user?.id,
          token,
          name: `${user?.firstName} ${user?.lastName}`,
          image: user?.image,
          role: user?.userRole,
          bio: user?.bio,
          gender: user?.gender,
          email: user?.email,
          languages: user?.languages,
          mobileNo: user?.mobileNo,
          address: user?.address,
          status: user?.status,
        },
        message:"Login Successful"
      });
      // createSendToken(user, 200, res);
    }

    // Check if user exists in the Patient model
    const patient = await clinicDB.patient.findOne({ where: { email } });
    if (patient && (await bcrypt.compare(password, patient.password))) {
      // If patient exists and password matches, generate JWT
      const token = jwt.sign(
        { id: patient.id, role: "patient" },
        process.env.JWT_SECRET
      );
      return res.status(200).json({
        data: {
          token,
        },
      });
      // createSendToken(user, 200, res);
    }

    // If user exists in the database but password is incorrect
    if (user || patient) {
      return next(new AppError("email or password Not exist in db.", 403));
    }

    // If no user or patient found, return error
    return res.status(401).json({ message: "User doesn't exists" });
  } catch (error) {
    return next(error);
  }
});

exports.registerUser = catchAsync(async (req, res, next) => {
  let {
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
    if (user.status == status.VERIFY) {
      return res.status(403).json({
        status: "failure",
        message: "user already exists",
      });
    }
    if (user.status != status.VERIFY) {
      return res.status(402).json({
        status: "failure",
        message:
          "you are already registered. Please verify you email and mobile number both!",
        profileStatus: user.status,
      });
    }
  }

  const languagesString = languages;

  const emailOtp = String(Math.floor(100000 + Math.random() * 900000)).padStart(
    6,
    "0"
  );

  const mobileOtp = String(
    Math.floor(100000 + Math.random() * 900000)
  ).padStart(6, "0");

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
    emailOtp,
    status: status.PHONE_VERIFY,
    appointment_interval:30,
    schedule:JSON.stringify(schedule),
    mobileOtp,
  });

  let emailSendData, mobileSendData;
  if (newUser) {
    emailSendData = await sendEmail(
      email,
      "Welcome to MedCal App. Please verify Your Details",
      `Your Email Otp is ${emailOtp} to Verify Details.`
    );
    // mobileSendData = await sendOtp(
    //   mobileNo,
    //   `This message from Medical App. Your One Time Password (OTP) ${mobileOtp} is the verification code. Please DO NOT SHARE this code with anyone. If you did not request this OTP, please ignore this message.`
    // );
  }

  console.log(emailSendData);
  // console.log(mobileSendData);

  // Respond with success message
  // if (emailSendData?.success == true && mobileSendData?.success == true) {
  //   res.status(201).json({
  //     status: "success",
  //     message: "Otp send to your email Id, mobile Number",
  //     // data: newUser,
  //   });
  // } 
  if (emailSendData?.success == true) {
    res.status(201).json({
      status: "success",
      message: "Email OTP send successfully",
    });
  } 
  // if (mobileSendData?.success == true) {
  //   res.status(201).json({
  //     status: "success",
  //     message: "Mobile OTP send successfully",
  //   });
  // } 
  
  else {
    const errorMessage = "Otp not send";
    const statusCode = 500;
    const errorObject = {
      status: "error",
      message: errorMessage,
      error: emailSendData?.error,
    };

    if (newUser) {
      errorObject.message = `newUser is created but ${errorMessage}`;
    }

    return res.status(statusCode).json(errorObject);
    }
});

exports.registerPatient = catchAsync(async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      birthday,
      email,
      gender,
      mobileNo,
      bloodGroup,
      weight,
      height,
      address,
      image,
      // knownDiseases,
      period,
      familyHistory,
      diseases,
      martialStatus,
      patientHistory,
      userId,
      healthConditions,
      currentIllnesses,
      previousIllnesses,
      SpecificAllergies
    } = req.body;

    if(!userId || !email){
      return res.status(402).json({ message: `userId and email are required` });
    }

    let query = `select * from Users where id = ${userId}`;

    let user1 = await clinicDB.sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    if (!user1[0] || user1[0].length === 0) {
      return res.status(403).json({
        status: "failure",
        message: "user doesn't exists",
      });
    }

    const user = await clinicDB.patient.findOne({ 
      where: {
        email,
        userId: { [Op.eq]: userId },
        mobileNo: { [Op.eq]: mobileNo }
      }
    });

    if (user) {
      return next(new AppError("Patient already exists", 403));
    }

    let params = {};

    if (martialStatus)
      martialStatus == true
        ? (params["martialStatus"] = "married")
        : (params["martialStatus"] = "unmarried");

    // Create the patient in the database
    const newPatient = await clinicDB.patient.create({
      firstName,
      lastName,
      birthday,
      email,
      gender,
      mobileNo,
      bloodGroup,
      weight,
      height,
      address,
      image,
      // knownDiseases,
      period,
      familyHistory,
      diseases,
      patientHistory,
      martialStatus: params.martialStatus,
      userId,
      healthConditions,
      currentIllnesses,
      previousIllnesses,
      SpecificAllergies
    });

    // Respond with success message
    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: newPatient,
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: error.message,
    });
  }
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  try {
    let { email, emailOtp } = req.body;

    let query = `select * from Users where email=:email`;
    const user = await clinicDB.sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { email },
    });

    if (!user || user.length == 0) {
      return res.status(401).json({ message: "user not found" });
    }

    if (user[0].status == status.VERIFY) {
      return res.status(403).json({
        status: "failure",
        message: "Your Email and registred mobile number already verify.",
      });
    }

    if (user[0].status == status.EMAIL_VERIFY) {
      return res.status(403).json({
        status: "failure",
        message: "Email Already Verify",
      });
    }

    if (user?.[0].emailOtp != emailOtp) {
      return res.status(402).json({
        status: "failure",
        message: "Email Otp doesn't match.",
      });
    }

    if (user?.[0].emailOtp == emailOtp) {
      // user[0].status = status.EMAIL_VERIFY;
      query = `update Users set status='${status.EMAIL_VERIFY}' where email=:email`;
      if (user?.[0].status == status.PHONE_VERIFY) {
        query = `update Users set status='${status.VERIFY}' where email=:email`;
      }
    }

    await clinicDB.sequelize.query(query, {
      replacements: { email },
      type: QueryTypes.UPDATE,
    });

    res.status(200).json({
      status: "success",
      message: "Email Verify Succesfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: error.message,
    });
  }
});

exports.verifyMobilePhone = catchAsync(async (req, res, next) => {
  try {
    let { email, mobileOtp, mobileNo } = req.body;
    let query = `select * from Users where email=:email`;
    const user = await clinicDB.sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { email },
    });
    if (!user || user.length == 0) {
      return res.status(401).json({ message: "Please enter correct Email" });
    }

    if (user?.[0].mobileNo != mobileNo) {
      return res.status(402).json({ message: "Moblie Number doesn't found" });
    }
    if (user?.[0].mobileOtp != mobileOtp) {
      return res.status(402).json({ message: "Otp doesn't match." });
    }

    if (user[0].status == status.VERIFY) {
      return res.status(403).json({
        status: "failure",
        message: "Already Verify",
      });
    }

    if (user[0].status == status.PHONE_VERIFY) {
      return res.status(403).json({
        status: "failure",
        message: "Mobile Already Verify",
      });
    }

    if (user?.[0].mobileOtp == mobileOtp) {
      query = `update Users set status='${status.PHONE_VERIFY}' where email=:email`;

      if (user?.[0].status == status.EMAIL_VERIFY) {
        query = `update Users set status='${status.VERIFY}' where email=:email`;
      }
    }

    await clinicDB.sequelize.query(query, {
      replacements: { email },
      type: QueryTypes.UPDATE,
    });

    res.status(200).json({
      status: "success",
      message: `${
        user.status == status.VERIFY
          ? "User Verify Succesfully"
          : "Mobile Phone Verified"
      }`,
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: error.message,
    });
  }
});
