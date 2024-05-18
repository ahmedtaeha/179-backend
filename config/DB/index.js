const Sequelize = require('sequelize');
const { CONSTANTS } = require('../../Constants');

const host = process.env.MYSQL_DB_HOST;
const dbName = process.env.MYSQL_DB_NAME;
const user = process.env.MYSQL_DB_USER;
const password = process.env.MYSQL_DB_PASSWORD;
const dialect = CONSTANTS.DB_DIALECT;

const { User } = require('./../../models/user'); // Import User model
const { Patient } = require('./../../models/patient'); // Import Patient model
const { Medicines } = require('./../../models/medicines'); // Import medicines model
const { Test } = require('./../../models/tests'); // Import Tests model
const { Prescription } = require('./../../models/prescriptions'); // Import prescription model
const { Invoice } = require('./../../models/invoice'); // Import invoice model
const { appointment } = require('./../../models/appointment'); // Import appointment model

const clinicSequelize = new Sequelize(dbName, user, password, {
  host,
  dialect,
  pool: { max: 10, min: 0, idle: 10000 },
});

clinicSequelize
  .authenticate()
  .then(() => {
    console.log('Connected with DB');
  })
  .catch((err) => {
    throw err;
  });

const clinicDB = {};

clinicDB.sequelize = clinicSequelize;
clinicDB.Sequelize = Sequelize;
clinicDB.users = User(clinicSequelize);
clinicDB.patient = Patient(clinicSequelize);
clinicDB.drug = Medicines(clinicSequelize);
clinicDB.test = Test(clinicSequelize);
clinicDB.prescription = Prescription(clinicSequelize);
clinicDB.invoice = Invoice(clinicSequelize);
clinicDB.appointment = appointment(clinicSequelize);

clinicDB.sequelize
  .sync()
  .then(() => {
    console.log('Db Synced!');
  })
  .catch((err) => {
    throw err;
  });

module.exports = clinicDB;