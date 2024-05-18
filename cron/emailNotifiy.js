const { sendEmail } = require("../utils/emailNotification");

const emailNotify = async (email, patient_email, patient_name) => {
  console.log("Sending Email");

    if(!email || !patient_email || !patient_name){
      return  'Not Found'
    }

  let data = await sendEmail(
    email,
    "Appointments in the next 30 minutes.",
    `Your appointment is with ${patient_name} on ${patient_email} in next 30 minutes. Don't forget to check your schedule!`
  );

  console.log(`email notification sent to ${email}`,  data);
};

module.exports = {
  emailNotify,
};
