// ecommerce-backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username & password required" });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "Username already taken" });

    const hashed = bcrypt.hashSync(password, 8);
    const newUser = new User({ username, password: hashed, role: role || "user" });
    await newUser.save();

    res.json({ message: "User registered", userId: newUser._id, role: newUser.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username & password required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const validPass = bcrypt.compareSync(password, user.password);
    if (!validPass) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Extended to 24 hours
    );

    res.json({ 
      message: "Login successful", 
      token, 
      role: user.role,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    // Check if username is taken by another user
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { username },
      { new: true, select: '-password' }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const validPass = bcrypt.compareSync(currentPassword, user.password);
    if (!validPass) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 8);
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  // Temporary admin creation (use only once)


};
exports.createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if admin already exists
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: "Admin already exists" });

    const hashed = bcrypt.hashSync(password, 8);
    const admin = new User({
      username,
      password: hashed,
      role: "admin"
    });

    await admin.save();
    res.json({ message: "Admin created successfully", username: admin.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};