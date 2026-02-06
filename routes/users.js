const { readUsers, writeUsers } = require("../utils/store");
const express = require("express");
const users = express.Router();
const bcrypt = require("bcrypt");
const uuid = require("../helpers/uuid");
const { all } = require(".");

//GET request to get all users
users.get("/", async (req, res) => {
  try {
    const data = await readUsers();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
  }
});

//GET request to get a single user
users.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const allUsers = await readUsers();
    const singleUser = allUsers.find((user) => String(user.id) === String(id));
    if (!singleUser) {
      return res.status(404).json({ message: "No user found with this id!" });
    }
    return res.status(200).json(singleUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

//PUT request to update a user
users.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;
    const allUsers = await readUsers();
    const singleUserIndex = allUsers.findIndex(
      (user) => String(user.id) === String(id),
    );
    if (singleUserIndex === -1) {
      return res.status(404).json({ message: "No user with this id" });
    }
    //Update the user
    allUsers[singleUserIndex] = {
      //Keep existing fields
      ...allUsers[singleUserIndex],
      //overwrite with new
      username,
      email,
      role,
      updatedAt: new Date().toLocaleString(), //update timestamp
    };
    writeUsers(allUsers);
    return res.status(200).json({
      message: "User updated successfully",
      data: allUsers[singleUserIndex],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});

//DELETE request to delete a user
users.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    //Find the user
    const allUsers = readUsers();
    const updatedUsers = allUsers.filter((user) => String(user.id) !== id);
    if (updatedUsers.length === allUsers.length) {
      return res.status(404).json({ message: "User not found" });
    }
    writeUsers(updatedUsers);
    return res.status(200).json({ message: "Successfully deleted!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
});
module.exports = users;
