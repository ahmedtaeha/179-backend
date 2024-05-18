const catchAsync = require("../utils/catchAsync");
const clinicDB = require("../config/DB/index");
const httpStatus = require("http-status");
const validator = require("validator");
const { QueryTypes } = require("sequelize");

exports.getPrescription = catchAsync(async (req, res, next) => {
  try {
    // const prescriptions = await clinicDB.prescription.findAll();

    // let query = `select Prescriptions.id,patientId,drugs,tests,firstName,lastName, Prescriptions.createdAt,Prescriptions.updatedAt, period, familyHistory, diseases, birthday, email,gender,mobileNo,bloodGroup,weight,height,address from Prescriptions join Patients on Prescriptions.patientId = Patients.id`;
    let {userId} = req.params

    if (!userId) {
      return res.status(404).json({
        data: {
          error: `Please enter userId`,
        },
      });
    }

    let query = `SELECT
    Prescriptions.id,
    Prescriptions.patientId,
    Prescriptions.drugs,
    Prescriptions.tests,
    Prescriptions.createdAt AS prescriptionCreatedAt,
    Prescriptions.updatedAt AS prescriptionUpdatedAt,
    JSON_OBJECT(
        'firstName', Patients.firstName,
        'lastName', Patients.lastName,
        'birthday', Patients.birthday,
        'email', Patients.email,
        'gender', Patients.gender,
        'mobileNo', Patients.mobileNo,
        'bloodGroup', Patients.bloodGroup,
        'weight', Patients.weight,
        'height', Patients.height,
        'address', Patients.address,
        'period', Patients.period,
        'familyHistory', Patients.familyHistory,
        'diseases', Patients.diseases
    ) AS patient
FROM
    Prescriptions
JOIN
    Patients ON Prescriptions.patientId = Patients.id
    where Prescriptions.userId = ${userId}
    ;`


    const prescriptions = await clinicDB.sequelize.query(query, {
      type: QueryTypes.SELECT,
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({ data: { prescriptions } });
  } catch (error) {
    next(error);
  }
});

exports.addPrescription = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { patientId, drugs, tests } = req.body;

  if (!userId || !patientId) {
    return res.status(404).json({
      data: {
        message: "User Id or patient Id not found",
      },
    });
  }

  const [user, patient] = await Promise.all([
    clinicDB.users.findByPk(userId),
    clinicDB.patient.findByPk(patientId),
  ]);

  if (!user || !patient) {
    return res.status(404).json({
      data: {
        message: "User or patient not found",
      },
    });
  }

  const prescription = await clinicDB.prescription.create({
    patientId,
    drugs,
    tests,
    userId,
  });

  return res.status(201).json({
    data: {
      message: "Prescription added successfully",
      data: prescription,
    },
  });
});

exports.deletePrescription = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;

    const prescription = await clinicDB.prescription.findOne({ where: { id } });
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }
    await prescription.destroy();

    // Respond with success message
    return res.status(200).json({
      message: "prescription deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});
