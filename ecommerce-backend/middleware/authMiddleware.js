// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

    if (!token) {
      return res.status(401).json({ error: "Access denied. Token missing." });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, username, role, iat, exp }
    console.log("Decoded token payload:", payload); // 👀 Debug
    return next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

exports.isAdmin = (req, res, next) => {
  console.log("isAdmin check:", req.user); // 👀 Debug
  if (req.user && req.user.role?.toLowerCase() === "admin") {
    next();
  } else {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
};
