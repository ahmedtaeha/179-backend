const express = require("express");
const app = express();
const http = require("http").Server(app); // Require http module
const io = require("socket.io")(http); // Require socket.io module

const browserNotify = (socket,userId, email, patient_email, patient_name, patient_image,date,start_time, end_time) => {
  console.log("Notify socket");

  socket.emit(email, {
    // image, date, start_time, end_time 
    email: patient_email,
    patient_name: patient_name,
    paintent_image: patient_image,
    date:date,
    start_time:start_time,
    end_time:end_time
  });

};

module.exports = {
  browserNotify,
};
