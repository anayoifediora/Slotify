const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, "../db/users.json");
const slotsFilePath = path.join(__dirname, '../db/slots.json');
const appointmentsFilePath = path.join(__dirname, "../db/appointments.json");

const readUsers = () => {
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(data);
}
const writeUsers = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

const readSlots = () => {
    const data = fs.readFileSync(slotsFilePath, 'utf-8');
    return JSON.parse(data);
}

const writeSlots = (slots) => {
    fs.writeFileSync(slotsFilePath, JSON.stringify(slots), null, 2)
}

const readAppointments = () => {
    const data = fs.readFileSync(appointmentsFilePath, 'utf-8');
    return JSON.parse(data);
}

const writeAppointments = (appointments) => {
    fs.writeFileSync(appointmentsFilePath, JSON.stringify(appointments, null, 2));
}
module.exports = { readUsers, writeUsers, readSlots, writeSlots, readAppointments, writeAppointments }