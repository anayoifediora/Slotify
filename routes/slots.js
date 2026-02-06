const express = require("express");
const slots = express.Router();
const { readSlots, writeSlots } = require("../utils/store");
const { authMiddleWare, requireAdmin } = require("../utils/auth");
const uuid = require("../helpers/uuid");

//GET request to get all slots
slots.get("/", authMiddleWare, async (req, res) => {
  try {
    const allSlots = await readSlots();
    console.log(req.user);
    return res.status(200).json(allSlots);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

//POST request to create a slot
slots.post("/",  async (req, res) => {
    
  try {
    
    const { date, startTime, endTime, doctor } = req.body;
    if (!date || !startTime || !endTime || !doctor) {
      return res
        .status(400)
        .json({
          message: "Please insert date, Start time, End time and doctor!",
        });
    }
    if (startTime >= endTime) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }
    const allSlots = await readSlots();

    const slotExists = allSlots.some(
      (slot) =>
        slot.date === date &&
        slot.startTime === startTime &&
        slot.doctor === doctor,
    );
    //Check to prevent the duplication of slots.
    if (slotExists) {
      return res.status(409).json({ message: "Slot already exists" });
    }
    const newSlot = {
      id: uuid(),
      date,
      startTime,
      endTime,
      isBooked: false,
      doctor,
      createdAt: new Date(),
    };
    allSlots.push(newSlot);
    await writeSlots(allSlots);
    return res
      .status(201)
      .json({ message: "Slot successfully created!", data: newSlot });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

//DELETE request to delete a slot
slots.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const allSlots = await readSlots();
        const slotToDelete = allSlots.find((slot) => String(slot.id) === id);
        if (!slotToDelete) {
            return res.status(404).json({ message: "No slot found with this id"})
        }
        const updatedSlots = allSlots.filter((item) => String(item.id) !== id );
        await writeSlots(updatedSlots);
        return res.status(201).json({ message: `Slot with id ${slotToDelete.id} has been deleted` });
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" })
    }
})

//PUT request to update a slot
slots.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { startTime, endTime, isBooked, doctor } = req.body;
        const allSlots = await readSlots();
        const slotIndex = allSlots.findIndex((item) => String(item.id) === id);
        if (slotIndex === -1) {
            return res.status(404).json({ message: "No slot found with this id!"});
        }
        allSlots[slotIndex] = {
            ...allSlots[slotIndex],
            //fields to update.
            startTime,
            endTime,
            isBooked,
            doctor,
            updatedAt: new Date().toLocaleString()
        };
        await writeSlots(allSlots);
        return res.status(201).json({ message: "Slot successfully updated!", data: allSlots[slotIndex] })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" })
    }

})
module.exports = slots;
