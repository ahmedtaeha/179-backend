const { QueryTypes } = require("sequelize");
const clinicDB = require("../config/DB");

async function getRole(req, res, next) {
  let { email } = req.query;

  let query = `SELECT * FROM Users WHERE email = :email`;

  let users = await clinicDB.sequelize.query(query, {
    type: QueryTypes.SELECT,
    replacements: { email },
  });

  if (users?.[0]?.userRole != "admin") {
    return res.status(401).json({
      data: {
        message: "Unauthorized access",
      },
    });
  }
  next();
}

module.exports = {
  getRole,
};
