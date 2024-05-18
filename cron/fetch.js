const { QueryTypes } = require("sequelize");
const clinicDB = require("../config/DB");
const moment = require("moment-timezone");
const { emailNotify } = require("./emailNotifiy");
const { browserNotify } = require("./browserNotify");
const { smsNotify } = require("./smsNotify");

const fetchAppoinment = async () => {
  console.log("Fetching Appointments expiring in next 30 minutes");

  const now = new Date();

  const currentDate = moment(now).format("YYYY-MM-DD 00:00:00");
  const currentTime = moment(now).add(30, "m").format("HH:mm:00");

  console.log(currentTime, currentDate);

  let query = `select a.id as appointment_id, u.id as user_id, CONCAT(u.firstName,space(1),u.lastName) as user_name, u.mobileNo as user_mobile, u.email as user_email, p.email as patient_email,CONCAT(p.firstName,space(1),p.lastName) as patient_name, date, start_time, end_time,timezone from Appointments a join Users u on u.id = a.userId join Patients p on p.id = a.patientId where date = '${currentDate}' and start_time = '${currentTime}'`;

  console.log(query);
  let appointments = await clinicDB.sequelize.query(query, {
    type: QueryTypes.SELECT,
  });

  console.log("Fetched appointments:", appointments);

  for (let i = 0; i < appointments.length; i++) {
    let appointment = appointments?.[i];

    // send Eamil to user_email
    // let emailResposne = await emailNotify(
    //   appointment?.user_email,
    //   appointment?.patient_email,
    //   appointment?.patient_name
    // );
    
    // send Sms to userNumber

    // let smsResponse = await smsNotify(
    //   appointment?.user_mobile,
    //   appointment?.user_name,
    //   appointment?.patient_name
    // );

    // console.log(`emailResposne`, emailResposne);
    // console.log(`smsResponse`, smsResponse);

    //   send browswer notifcation
    // browserNotify(
    //   appointment.user_id,
    //   appointment?.user_email,
    //   appointment?.patient_email,
    //   appointment?.patient_name
    // );
  }

  //   Fetched appointments:
  //     {
  //       id: 7,
  //       user_email: 'bharatrav8077@gmail.com',
  //       patient_email: 'jane2@example.com',
  //       patient_name: 'Jane Doe',
  //       date: 2024-04-27T00:00:00.000Z,
  //       start_time: '14:11:00',
  //       end_time: '07:30:00',
  //       timezone: 'Asia/Kolkata'
  //     }
};

// Call the function to initiate the appointment fetching process
module.exports = {
  fetchAppoinment,
};
