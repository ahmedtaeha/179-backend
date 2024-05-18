const express = require('express');
const { getAppointments, addAppointment, deleteAppointment, updateAppointment, updateAppointmentStatus, getAppointmentsList } = require('../controllers/appointment');

const router = express.Router();

router.get('/get-appointments/:userId', getAppointments);
router.post('/add-appointment/:userId', addAppointment);
router.delete('/delete-appointment/:id',deleteAppointment);
router.put('/update-appointment/:userId',updateAppointment);
router.patch('/update-status/:id',updateAppointmentStatus);

router.get('/get/:userId/:day', getAppointmentsList);

module.exports = router;
