require('dotenv').config();
const jwt = require('jsonwebtoken');

const authMiddleWare = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = user;
    next();

  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};


const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden" })
    }
    next();
}

module.exports = { authMiddleWare, requireAdmin }