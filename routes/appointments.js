const express = require("express");
const appointments = express.Router();
const {
  readAppointments,
  writeAppointments,
  readSlots,
  writeSlots,
  readUsers,
  writeUsers,
} = require("../utils/store");
const uuid = require("../helpers/uuid");
const { authMiddleWare, requireAdmin } = require("../utils/auth");

//GET request to get all appointments
appointments.get("/", async (req, res) => {
  try {
    const allAppointments = await readAppointments();
    return res.status(200).json(allAppointments);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
});

//POST request to create an appointment.
appointments.post("/:id", authMiddleWare, async (req, res) => {
  try {
    const { id } = req.params;
    const allSlots = await readSlots();

    const selectedSlotIndex = allSlots.findIndex(
      (slot) => String(slot.id) === String(id),
    );

    const newAppointment = {
      id: uuid(),
      userId: req.user.id,
      status: "booked",
      //gotten from slot
      slotId: id,
      date: allSlots[selectedSlotIndex].date,
      startTime: allSlots[selectedSlotIndex].startTime,
      endTime: allSlots[selectedSlotIndex].endTime,
      doctor: allSlots[selectedSlotIndex].doctor,
      createdAt: new Date().toLocaleString(),
    };
    //Find the user by id
    const allUsers = await readUsers();

    const userIndex = allUsers.findIndex((user) => user.id === req.user.id);
    //update the users appointment field by adding this appointment.
    allUsers[userIndex].appointments.push(newAppointment);
    writeUsers(allUsers);
    //Add this appointment to the list of all appointments
    const allAppointments = await readAppointments();
    allAppointments.push(newAppointment);
    writeAppointments(allAppointments);
    //Change slot status to true
    allSlots[selectedSlotIndex].isBooked = true;
    writeSlots(allSlots);
    res
      .status(200)
      .json({ message: "Appointment confirmed!", data: newAppointment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error!" });
  }
});

//PUT request to cancel (update status) an appointment.
appointments.put(
  "/:appointment_id",
  authMiddleWare,
  requireAdmin,
  async (req, res) => {
    try {
      //Destructure to obtain appointment id
      const { appointment_id } = req.params;

      let allAppointments = await readAppointments();

      //Find the appointment to get the user's id
      const appointment = allAppointments.find(
        (item) => String(item.id) === appointment_id,
      );
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      if (appointment.status === "cancelled") {
        return res
          .status(400)
          .json({ message: "Appointment already cancelled" });
      }
      //Find the appointment to update, then change the status to "cancelled" from "booked" which was the default
      allAppointments = allAppointments.map((a) =>
        String(a.id) === appointment_id ? { ...a, status: "cancelled" } : a,
      );

      //Update the slot status so another user can book that slot
      let allSlots = await readSlots();
      allSlots = allSlots.map((slot) =>
        String(slot.id) === appointment.slotId
          ? { ...slot, isBooked: false }
          : slot,
      );
      //update that particular appointment in the appointment array of the user
      let allUsers = await readUsers();
      allUsers = allUsers.map((user) =>
        String(user.id) === String(appointment.userId)
          ? {
              ...user,
              appointments: user.appointments.filter(
                (a) => String(a.id) !== String(appointment_id),
              ),
            }
          : user,
      );
      //Save to database
      writeAppointments(allAppointments);
      writeUsers(allUsers);
      writeSlots(allSlots);
      res
        .status(200)
        .json({ message: "Appointment cancelled!", data: appointment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = appointments;
