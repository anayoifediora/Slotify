const express = require('express');
const appointments = express.Router();
const { readAppointments, writeAppointments, readSlots, readUsers } = require('../utils/store')
const uuid = require('../helpers/uuid')
const { authMiddleWare, requireAdmin } = require('../utils/auth')

//GET request to get all appointments
appointments.get('/',async (req, res) => {
    try {
        const allAppointments = await readAppointments();
        return res.status(200).json(allAppointments);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
})

//POST request to create an appointment.
appointments.post('/:slot_id', authMiddleWare, async (req, res) => {
    try {
        const allSlots = await readSlots();
        
        const { id } = req.params.slot_id;
        const selectedSlot = allSlots.find((slot) => String(slot.id) === id);
        const { date, startTime, endTime } = selectedSlot;
        
        const newAppointment = {
            id: uuid(),
            userId: req.user.id,
            //gotten from slot
            slotId: id,
            date,
            startTime,
            endTime,
            isBooked: true,
            createdAt: new Date().toLocaleString()
        }
        //Find the user by id
        //update the users appointment field by adding this appointment.
        //Add this appointment to the list of all appointments
        //Change slot status to true
        selectedSlot.isBooked = true;
        const allAppointments = await readAppointments();
        allAppointments.push(newAppointment);
        res.status(200).json({ message: "Appointment confirmed!", data: newAppointment})
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error!" });
    }
})

module.exports = appointments;