const catchAsync = require("../utils/catchAsync");
const clinicDB = require("../config/DB/index");
const httpStatus = require("http-status");
const validator = require("validator");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");

exports.getPatient = catchAsync(async (req, res, next) => {
  try {
    const {userId} = req.params
    if(!userId){
      return res.status(404).json({
        status:'failure',
        message: "Please enter userId", 
      })
    }

    let query = `select id,firstName,lastName,birthday,email, gender, martialStatus, mobileNo,bloodGroup,weight,height,address,period,familyHistory, healthConditions, currentIllnesses, previousIllnesses, SpecificAllergies, image, patientHistory, diseases from Patients where userId=:userId`;

    const users = await clinicDB.sequelize.query(query, {
      replacements:{userId},
      type: QueryTypes.SELECT,
    });

    // Respond with success message
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    console.log(error);
  }
});

exports.editPaitent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    birthday,
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
    healthConditions,
    currentIllnesses,
    previousIllnesses,
    SpecificAllergies
  } = req.body;

  const patient = await clinicDB.patient.findByPk(id);
  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  const params = {};

  if (firstName) params["firstName"] = firstName;
  if (lastName) params["lastName"] = lastName;
  if (birthday) params["birthday"] = birthday;
  if (gender) params["gender"] = gender;
  if (mobileNo) params["mobileNo"] = mobileNo;
  if (bloodGroup) params["bloodGroup"] = bloodGroup;
  if (weight) params["weight"] = weight;
  if (height) params["height"] = height;
  if (address) params["address"] = address;
  if (image) params["image"] = image;
  // if (knownDiseases) params["knownDiseases"] = knownDiseases;
  if (period) params["period"] = period;
  if (familyHistory) params["familyHistory"] = familyHistory;
  if (diseases) params["diseases"] = diseases;
  if (patientHistory) params["patientHistory"] = patientHistory;
  if (martialStatus)
    martialStatus == true
      ? (params["martialStatus"] = "married")
      : (params["martialStatus"] = "unmarried");
  
  if (healthConditions) params["healthConditions"] = healthConditions;
  if (currentIllnesses) params["currentIllnesses"] = currentIllnesses;
  if (previousIllnesses) params["previousIllnesses"] = previousIllnesses;
  if (SpecificAllergies) params["SpecificAllergies"] = SpecificAllergies;

  await clinicDB.patient.update(params, {
    where: {
      id,
    },
  });

  return res.status(200).json({
    data: {
      message: "Patient updated successfully",
    },
  });
});

exports.deletePaitent = catchAsync(async (req, res, next) => {
  const { id } = req.params; // Assuming the patient ID is passed as a URL parameter

  const patient = await clinicDB.patient.findByPk(id);
  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }
  await patient.destroy();

  return res.status(200).json({ message: "Patient deleted successfully" });
});

exports.updateSettings = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { appointment_interval, schedule,firstName,lastName,address,language } = req.body;

    const user = await clinicDB.users.findByPk(id);
    if (!user) {
      return res.status(404).json({
        data: {
          error: `Invalid User`,
        },
      });
    }
    if (appointment_interval && typeof appointment_interval === "number") {
      user.appointment_interval = appointment_interval;
    }
    if (schedule && typeof schedule === "object") {
      const scheduleList = [];
      for (const day in schedule) {
        if (Object.hasOwnProperty.call(schedule, day)) {
          const { startTime, endTime } = schedule[day];
          scheduleList.push({ day, startTime, endTime });
        }
      }
      user.schedule = JSON.stringify(scheduleList);
    }

    if(firstName) user.firstName = firstName
    if(lastName) user.lastName = lastName
    if(address) user.address = address
    if(language) user.languages = language

    await user.save();

    // let query = `select appointment_interval, schedule from Users where id=:id`;

    let query = `select id, concat(firstName,space(1),lastName) as name, image, userRole as role, bio, gender, email, languages, address, status, mobileNo from Users where id=:id`;

    // {
    //   id: user?.id,
    //   name: `${user?.firstName} ${user?.lastName}`,
    //   image: user?.image,
    //   role: user?.userRole,
    //   bio: user?.bio,
    //   gender: user?.gender,
    //   email: user?.email,
    //   languages: user?.languages,
    //   mobileNo: user?.mobileNo,
    //   address: user?.address,
    //   status: user?.status,
    // }

    let users = await clinicDB.sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements:{id}
    });

    users = users?.[0]

    // let token = jwt.sign(
    //   { id: users.id, role: "user" },
    //   process.env.JWT_SECRET
    // );

    res.status(200).json({
      data: {
        status: "User settings updated successfully.",
        user:{...users},
      },
    });
  } catch (error) {
    return res.status(500).json({
      data: {
        error: error?.message,
      },
    });
  }
});


exports.getSettings = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = `select email, appointment_interval, firstName, lastName, gender, languages, mobileNo, address, schedule from Users where id=:id`;

    const users = await clinicDB.sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements:{id}
    });

    res.status(200).json({
      data: users[0],
    });
  } catch (error) {
    return res.status(500).json({
      data: {
        error: error?.message,
      },
    });
  }
});

