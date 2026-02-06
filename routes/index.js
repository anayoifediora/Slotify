const express = require('express');
const usersRouter = require('./users');
const slotsRouter = require('./slots');
const appointmentsRouter = require('./appointments');
const app = express()

app.use('/users', usersRouter);
app.use('/slots', slotsRouter);
app.use('/appointments', appointmentsRouter);

module.exports = app;