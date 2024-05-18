const catchAsync = require("../utils/catchAsync");
const clinicDB = require("../config/DB/index");
const { QueryTypes } = require("sequelize");
const ApiError = require("../utils/ApiError");

exports.getInvoice = catchAsync(async (req, res, next) => {
  try {
    // let query = `SELECT i.id,patientId , i.currency, paymentMode ,paymentStatus ,invoiceTitle ,   amount ,i.createdAt ,i.updatedAt ,p.firstName ,    p.lastName ,p.birthday ,p.email ,p.gender , p.mobileNo ,    p.bloodGroup ,p.weight ,p.height ,p.address ,p.image ,p.period ,p.familyHistory ,p.diseases,p.patientHistory,p.martialStatus    from Invoices i     join Patients p on i.patientId = p.id`;

    let {userId} = req.params;
    if (!userId) {
      return res.status(404).json({
        data: {
          error: `Please enter userId`,
        },
      });
    }

    let query = `SELECT
    i.id,
    i.patientId,
    i.currency,
    i.paymentMode,
    i.paymentStatus,
    i.invoiceTitle,
    i.amount,
    i.createdAt,
    i.updatedAt,
    JSON_OBJECT(
        'id', p.id,
        'firstName', p.firstName,
        'lastName', p.lastName,
        'birthday', p.birthday,
        'email', p.email,
        'gender', p.gender,
        'mobileNo', p.mobileNo,
        'bloodGroup', p.bloodGroup,
        'weight', p.weight,
        'height', p.height,
        'address', p.address,
        'image', p.image,
        'period', p.period,
        'familyHistory', p.familyHistory,
        'diseases', p.diseases,
        'patientHistory', p.patientHistory,
        'martialStatus', p.martialStatus
    ) AS patient
    FROM
    Invoices i
    JOIN
    Patients p ON i.patientId = p.id
    where i.userId = :userId
    `;
    
    const invoices = await clinicDB.sequelize.query(query, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({ data: { invoices } });

  } catch (error) {
    next(error);
  }
});

exports.addInvoices = catchAsync(async (req, res, next) => {
  let {userId} = req.params;
  if (!userId) {
    return res.status(404).json({
      data: {
        error: `Please enter userId`,
      },
    });
  }
  const { patientId, paymentMode, paymentStatus, invoiceTitle, amount,currency } =
    req.body;

  let query = `select * from Patients where id =:patientId`;

  const patient = await clinicDB.sequelize.query(query, {
    replacements: { patientId },
    type: QueryTypes.SELECT,
  });

  if (!patient || patient.length == 0) {
    return res.status(404).json({
      data: {
        message: "Patient not found",
      },
    });
  }

  const invoice = await clinicDB.invoice.create({
    patientId,
    paymentMode,
    paymentStatus,
    invoiceTitle,
    amount,
    userId,
    currency
  });
  return res.status(200).json({ data: { invoice } });
});

exports.deleteInvoices = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const invoice = await clinicDB.invoice.findByPk(id);
  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found" });
  }
  await invoice.destroy();
  return res.status(200).json({ message: "Invoice deleted successfully" });
});

exports.updateInvoicesStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const invoice = await clinicDB.invoice.findByPk(id);
  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found" });
  }
  if (status.paymentStatus == "paid") {
    return res.status(400).json({
      message: "Invoice is Already Paid.",
    });
  }
  invoice.paymentStatus = status;
  await invoice.save();
  return res.status(200).json({
    message: "Invoice status updated successfully",
  });
});
