const status = {
  UN_VERIFY: "unVerify",
  EMAIL_VERIFY: "emailVerify",
  PHONE_VERIFY: "phoneVerify",
  VERIFY: "verify",
};

let schedule = [
  { day: "Monday", startTime: "10:00", endTime: "17:00" },
  { day: "Tuesday", startTime: "10:00", endTime: "17:00" },
  { day: "Wednesday", startTime: "10:00", endTime: "17:00" },
  { day: "Thursday", startTime: "", endTime: "17:00" },
  { day: "Friday", startTime: "17:00", endTime: "17:00" },
];

module.exports = {
  status,
  schedule,
};
