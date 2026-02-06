require("dotenv").config();
const express = require('express');
const app = express();
const path = require('path');
const { readUsers, writeUsers } = require('./utils/store');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const api = require('./routes/index');
const uuid = require('./helpers/uuid');
const { authMiddleWare } = require("./utils/auth");

const expiration = "15m"


const PORT = 3005;

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));


//POST request to create a user
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email and password required!' })
        }
        const allUsers = await readUsers();

        const newUser = {
            id: uuid(),
            username,
            email,
            password: hashedPassword,
            role: 'user',
            appointments: [],
            createdAt: new Date().toLocaleString(),
            updatedAt: new Date().toLocaleString()
        }
        allUsers.push(newUser);
        writeUsers(allUsers);
        res.status(201).json({ message: "Signed up successfully 👍!", info: newUser })
    } catch (err) {
        console.error(err)
    }
})

app.post('/login', async (req, res) => {
    try {
        
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({ message: "Email and password required!" })
        }
        //Find the user
        const allUsers = await readUsers();
        const user = allUsers.find((item) => item.email === req.body.email);
        if (!user) {
            return res.status(400).json({ message: "Incorrect credentials" });
        }
        //Check that the password is correct
        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
        //If password is not correct, inform client
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Incorrect Credentials" });
        }

        const payload = { id: user.id, email: user.email, role: user.role, username: user.username };
        const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: expiration });
        return res.status(200).json({ message: "Successful Login!", accessToken: token })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error" });
    }
});

app.use('/api', api);

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})