const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { errorHandler, errorConverter } = require("./middleware/errorHandler");
const httpStatus = require("http-status"); // Import httpStatus
const ApiError = require("./utils/ApiError");
const clinicDB = require("./config/DB/index");
const { status } = require("./utils/Status");
const http = require("http").Server(app); // Require http module
// const io = require("socket.io")(http); // Require socket.io module
const io = require(`socket.io`)(http, { cors: { origin: '*' } });
let { notification } = require("./cron/index");
const { QueryTypes } = require("sequelize");
const { browserNotify } = require("./cron/browserNotify");
const moment = require("moment-timezone");

// Require DB index
require("./config/DB/index");

// The server we're using for our MySQL database does not have a valid certificate,
// so we need to disable certificate validation in node.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//To fix cors issues
app.use(cors());

//To parse cookies
app.use(cookieParser());

// Body Parser reading data from body into req.body
app.use(express.json());

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exceptions! Shutting Down");
  console.log(err.name, err.message);
  process.exit(1);
});

const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      data: "Welcome to the Clinic App.",
    },
  });
});

app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/drugs", require("./routes/medicines"));
app.use("/api/v1/test", require("./routes/tests"));
app.use("/api/v1/public", require("./routes/public"));
app.use("/api/v1/prescription", require("./routes/prescription"));
app.use("/api/v1/invoice", require("./routes/invoices"));
app.use("/api/v1/appointment", require("./routes/appointment"));
app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/reports", require("./routes/reports"));
app.use('/api/v1/address', require('./routes/addressRouter'));

// app.listen(port, () => {
//   console.log(`clinic app is running on port ${port}`);
// });

const server = http.listen(port, () => {
  console.log(`clinic app is running on port ${port}`);
});

io.on("connection", function (socket) {
  io.emit("user connected");
  socket.on("join", (userId) => {
    console.log("user Joined: ", userId);
  });

  // socket.on("disconnect", () => {
  //   console.log("User disconnected");
  //   io.emit("disconnect");
  // });

  // NOTIFICATION
  const thirtyMinutesBefore = () => {
    const now = new Date();
    const notificationTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes() - 30
    );
    return notificationTime;
  };

  const notificationInterval = setInterval(async () => {
    const notificationTime = thirtyMinutesBefore();

    const now = new Date();

    const currentDate = moment(now).format("YYYY-MM-DD 00:00:00");
    const currentTime = moment(now).add(30, "m").format("HH:mm:00");  
    console.log(currentTime, currentDate);

    // if (currentTime > notificationTime) {
      let query = `select a.id as appointment_id, u.id as user_id,  u.email as user_email, p.email as patient_email,CONCAT(p.firstName,p.lastName) as patient_name, date, start_time, end_time, a.end_time ,p.image as patient_image, timezone from Appointments a join Users u on u.id = a.userId join Patients p on p.id = a.patientId where date = '2024-04-30 00:00:00' and start_time = '08:30:00'`;

      let appointments = await clinicDB.sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      appointments.forEach((element) => {
        browserNotify(
          socket,
          socket.id,
          element.user_email,
          element.patient_email,
          element.patient_name,
          element.patient_image,
          element.date,
          element.start_time,
          element.end_time,

        );
      });
    // }
  }, 60000);

  socket.on("disconnect", () => {
    clearInterval(notificationInterval);
    console.log("Notification interval cleared");
  });
});

app.use((req, res, next) => {
  next(new ApiError("Not found", httpStatus.NOT_FOUND));
});

// Catching unhandled Rejections [by async functions]
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLER REJECTION! Shutting Down");
  // Remove the following line if you don't have a 'server' defined
  // server.close(() => {
  //   process.exit(1);
  // });
});

notification();

app.use(errorConverter);
app.use(errorHandler);
