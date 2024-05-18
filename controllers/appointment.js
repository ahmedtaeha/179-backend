const catchAsync = require("../utils/catchAsync");
const clinicDB = require("../config/DB/index");
const httpStatus = require("http-status");
const validator = require("validator");
const { QueryTypes } = require("sequelize");

// Get all bookings for a specific date
exports.getAppointments = catchAsync(async (req, res) => {
  try {
    // let query = `SELECT a.id,date,timeSlot,patientId,motifPatient,a.status as appointmentStatus, a.createdAt,a.updatedAt,firstName,lastName,birthday,email,gender,mobileNo,bloodGroup,weight,height,address,image,period,familyHistory,diseases,p.patientHistory,p.martialStatus from Appointments a join Patients p on a.patientId = p.id`;

    let { userId } = req.params;
    if (!userId) {
      return res.status(404).json({
        data: {
          error: `Please enter userId`,
        },
      });
    }

    let query = `SELECT
a.id,
a.date,
a.start_time,
a.end_time,
a.patientId,
a.motifPatient,
a.timezone,
a.status AS appointmentStatus,
a.createdAt,
a.updatedAt,
JSON_OBJECT(
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
Appointments a
JOIN
Patients p ON a.patientId = p.id

where a.userId = :userId
;`;

    const appointments = await clinicDB.sequelize.query(query, {
      replacements: { userId },
      type: QueryTypes.SELECT,
    });

    res.status(200).json({ data: { appointments } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a new booking
exports.addAppointment = catchAsync(async (req, res) => {
  try {
    let { userId } = req.params;
    const { date, start_time, end_time, patientId, motifPatient, timezone } =
      req.body;

    if (
      !date ||
      !start_time ||
      !end_time ||
      !patientId ||
      !motifPatient ||
      !userId ||
      !timezone
    ) {
      return res.status(400).json({
        data: {
          message: "All fields are required",
        },
      });
    }

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

    const moment = require("moment-timezone"); // Install moment-timezone library
    const utcDate = moment(date).tz(`${timezone}`).format("YYYY-MM-DD"); // Convert date to UTC
    const utcStartTime = moment(`${date} ${start_time}`)
      .tz(`${timezone}`)
      .format("HH:mm:ss"); // Convert start time to UTC
    const utcEndTime = moment(`${date} ${end_time}`)
      .tz(`${timezone}`)
      .format("HH:mm:ss"); // Convert end time to UTC

    const query1 = `SELECT * from Appointments where date = :utcDate AND (start_time < :utcEndTime AND end_time > :utcStartTime) AND userId = :userId`;
    const appointmentWithSameTime = await clinicDB.sequelize.query(query1, {
      replacements: { utcDate, utcStartTime, utcEndTime, userId },
      type: QueryTypes.SELECT,
    });

    if (appointmentWithSameTime && appointmentWithSameTime.length > 0) {
      return res.status(400).json({
        data: {
          message: "Appointment with same time is already taken",
        },
      });
    }

    const appointment = await clinicDB.appointment.create({
      date: utcDate, // Store date in UTC
      start_time: utcStartTime, // Store start time in UTC
      end_time: utcEndTime, // Store end time in UTC
      patientId,
      motifPatient,
      status: "pending",
      userId,
      timezone,
    });

    return res.status(201).json({ data: { appointment, message: "Appointment has been created successfully" } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a booking
exports.deleteAppointment = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await clinicDB.appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    await appointment.destroy();
    res.status(200).json({
      data: { message: "Appointment deleted successfully" },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a booking
exports.updateAppointment = catchAsync(async (req, res) => {
  try {

    // if can not reschulde in the same day then cancel 
    

    const { userId } = req.params;
    const { date, appointmentId, start_time, end_time, motifPatient,calenderFlag } =
      req.body;

    if (!appointmentId || !userId) {
      return res.status(400).json({
        data: {
          message: "please give appointmentId and userId",
        },
      });
    }

    if (start_time && end_time && new Date(start_time) > new Date(end_time)) {
      return res.status(400).json({
        data: {
          message: "start_time must be less than end_time",
        },
      });
    }

    const appointment = await clinicDB.appointment.findByPk(appointmentId);
    if (!appointment || appointment.userId !== parseInt(userId)) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const moment = require("moment-timezone"); // Install moment-timezone library
    let utcDate, utcStartTime, utcEndTime;
    let parmas = {};

    if (date) {
      utcDate = moment(date).tz(`${appointment.timezone}`).format("YYYY-MM-DD");
      parmas["date"] = utcDate;
    }
    if (start_time) {
      utcStartTime = moment(`${date} ${start_time}`)
        .tz(`${appointment.timezone}`)
        .format("HH:mm:ss");
      parmas["start_time"] = utcStartTime;
    }
    if (end_time) {
      utcEndTime = moment(`${date} ${end_time}`)
        .tz(`${appointment.timezone}`)
        .format("HH:mm:ss"); // Convert end time to UTC
      parmas["end_time"] = utcEndTime;
    }
    if (motifPatient) parmas["motifPatient"] = motifPatient;

    if (calenderFlag == true) {
      let utcNextDate, utcNextStartTime, utcNextEndTime;
      const nextDate = moment(date).add(1, "days").format("YYYY-MM-DD");
      const nextStartTime = moment(`${nextDate} ${start_time}`).format(
        "HH:mm:ss"
      );
      const nextEndTime = moment(`${nextDate} ${end_time}`).format("HH:mm:ss");

      const query1 = `SELECT * from Appointments where date = :utcNextDate AND (start_time >= :utcNextStartTime AND start_time <= :utcNextEndTime) AND userId = :userId`;

      const appointmentWithSameTimeNextDay = await clinicDB.sequelize.query(
        query1,
        {
          replacements: {
            utcNextDate,
            utcNextStartTime,
            utcNextEndTime,
            userId,
          },
          type: QueryTypes.SELECT,
        }
      );

      if (appointmentWithSameTimeNextDay.length === 0) {
        utcNextDate = moment(nextDate)
          .tz(`${appointment.timezone}`)
          .format("YYYY-MM-DD");
        utcNextStartTime = moment(`${nextDate} ${start_time}`)
          .tz(`${appointment.timezone}`)
          .format("HH:mm:ss");
        utcNextEndTime = moment(`${nextDate} ${end_time}`)
          .tz(`${appointment.timezone}`)
          .format("HH:mm:ss");

        await clinicDB.appointment.create({
          date: utcNextDate, // Store date in UTC
          start_time: utcNextStartTime, // Store start time in UTC
          end_time: utcNextEndTime, // Store end time in UTC
          patientId,
          motifPatient,
          userId,
          timezone: appointment.timezone,
        });
      } else {
        const startTimeDiff = moment.duration(
          moment(nextStartTime, "HH:mm:ss").diff(
            moment(appointmentWithSameTimeNextDay[0].start_time, "HH:mm:ss")
          )
        );
        const endTimeDiff = moment.duration(
          moment(nextEndTime, "HH:mm:ss").diff(
            moment(
              appointmentWithSameTimeNextDay[
                appointmentWithSameTimeNextDay.length - 1
              ].end_time,
              "HH:mm:ss"
            )
          )
        );

        if (startTimeDiff.asMinutes() !== 0 || endTimeDiff.asMinutes() !== 0) {
          let startTimeInterval = Math.abs(startTimeDiff.asMinutes());
          let endTimeInterval = Math.abs(endTimeDiff.asMinutes());

          const slotDuration = Math.max(startTimeInterval, endTimeInterval);

          const startTime = moment(
            `${nextDate} ${appointmentWithSameTimeNextDay[0].start_time}`
          )
            .add(slotDuration, "m")
            .format("HH:mm:ss");
          const endTime = moment(
            `${nextDate} ${
              appointmentWithSameTimeNextDay[
                appointmentWithSameTimeNextDay.length - 1
              ].end_time
            }`
          )
            .add(slotDuration, "m")
            .format("HH:mm:ss");

          utcNextDate = moment(nextDate)
            .tz(`${appointment.timezone}`)
            .format("YYYY-MM-DD");
          utcNextStartTime = moment(`${nextDate} ${startTime}`)
            .tz(`${appointment.timezone}`)
            .format("HH:mm:ss");
          utcNextEndTime = moment(`${nextDate} ${endTime}`)
            .tz(`${appointment.timezone}`)
            .format("HH:mm:ss");

          await clinicDB.appointment.create({
            date: utcNextDate, // Store date in UTC
            start_time: utcNextStartTime, // Store start time in UTC
            end_time: utcNextEndTime, // Store end time in UTC
            patientId: appointment?.patientId,
            motifPatient,
            userId,
            timezone: appointment.timezone,
          });
          return res.status(403).json({
            data: {
              message:
                "No slots available to next day, please choose another date",
            },
          });
        } else {
          return res.status(403).json({
            data: {
              message:
                "No slots available to next day, please choose another date",
            },
          });
        }
      }
    }

    await clinicDB.appointment.update(parmas, {
      where: {
        id: appointmentId,
      },
    });

    return res.status(200).json({
      data: {
        message: "Appointment updated successfully",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

exports.updateAppointmentStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const appointment = await clinicDB.appointment.findByPk(id);
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }
  appointment.status = status;
  await appointment.save();
  return res.status(200).json({
    message: "Appointment status updated successfully",
  });
});

const splitIntoslots = (appointment_interval, schedule) => {
  try {
    let slots = [];

    const { startTime, endTime } = schedule;
    const start =
      parseInt(startTime.split(":")[0]) * 60 +
      parseInt(startTime.split(":")[1]);
    const end =
      parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);
    const totalSlots = Math.ceil((end - start) / appointment_interval);
    for (let i = 0; i < totalSlots; i++) {
      const currentStart = start + i * appointment_interval;
      const currentEnd = currentStart + appointment_interval;

      if (currentStart < start || currentEnd > end) {
        continue;
      }

      const startTime = new Date(
        0,
        0,
        0,
        Math.floor(currentStart / 60),
        currentStart % 60
      );
      const endTime = new Date(
        0,
        0,
        0,
        Math.floor(currentEnd / 60),
        currentEnd % 60
      );

      slots.push({
        day: schedule.day,
        duration: appointment_interval,
        startTime: startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
      });
    }

    return slots;
  } catch (e) {
    return e.message;
  }
};

exports.getAppointmentsList = catchAsync(async (req, res, next) => {
  try {
    const { userId, day } = req.params;

    const user = await clinicDB.users.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        data: {
          error: `Invalid User`,
        },
      });
    }

    let { appointment_interval, schedule } = user;

    if (schedule) schedule = JSON.parse(schedule);
    let today = new Date().getDay();
    let days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let dayOfWeek = day;

    let todaySchedule;

    if (schedule && schedule.length > 0) {
      todaySchedule = schedule.find((day) => {
        if (day.day == dayOfWeek) return day;
      });
    }

    if(todaySchedule){
      let slots = splitIntoslots(appointment_interval, todaySchedule);
  
      return res.status(200).json({
        data: {
          appointmentsList: { slots },
        },
      });
    }
    else{
      return res.status(500).json({ message: `No Schedule Found` });
    }
  } catch (error) {
    return res.status(500).json({ message: error?.message });
  }
});
