const { sendOtp } = require("../utils/smsNotification");

const smsNotify = async (mobileNo,user_name, patient_name) => {
  console.log("Sending Email");

    if(!mobileNo || !user_name || !patient_name){
      return  {};
    }

  let data = await sendOtp(
    mobileNo,
    `Hi ${user_name}, you have appointment in next 30 minutes with ${patient_name}`
  );

  console.log(`email notification sent to ${email}`,  data);
};

module.exports = {
  smsNotify,
};
