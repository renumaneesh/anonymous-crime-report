const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../config/database");
const { authenticateToken, generateToken } = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { officerId, password } = req.body;
    if (!officerId || !password) {
      return res.status(400).json({ success: false, message: "Officer ID and password are required." });
    }
    const official = db.findOfficialByOfficerId(officerId.toUpperCase());
    if (!official) {
      return res.status(401).json({ success: false, message: "Invalid officer ID or password." });
    }
    const isMatch = await bcrypt.compare(password, official.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid officer ID or password." });
    }
    const token = generateToken(official);
    const { password: _, ...officialData } = official;
    res.json({ success: true, message: "Login successful.", token, official: officialData });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error during login.", error: err.message });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, officerId, email, password, rank, station } = req.body;
    if (!name || !officerId || !email || !password || !rank || !station) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    if (db.findOfficialByOfficerId(officerId.toUpperCase())) {
      return res.status(409).json({ success: false, message: "Officer ID already registered." });
    }
    if (db.findOfficialByEmail(email.toLowerCase())) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newOfficial = db.addOfficial({
      name, officerId: officerId.toUpperCase(), email: email.toLowerCase(),
      password: hashedPassword, rank, station, role: "ci", // default to ci or handle better if needed
    });
    const { password: _, ...officialData } = newOfficial;
    res.status(201).json({ success: true, message: "Account registered successfully.", official: officialData });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error during registration.", error: err.message });
  }
});

// GET /api/auth/profile
router.get("/profile", authenticateToken, (req, res) => {
  const official = db.findOfficialById(req.user.id);
  if (!official) return res.status(404).json({ success: false, message: "Official not found." });
  const { password: _, ...data } = official;
  res.json({ success: true, official: data });
});

// POST /api/auth/verify
router.post("/verify", authenticateToken, (req, res) => {
  res.json({ success: true, message: "Token is valid.", user: req.user });
});

// GET /api/auth/officers
router.get("/officers", (req, res) => {
  const officers = db.officials.map(o => {
    const { password, ...rest } = o;
    return rest;
  });
  
  const grouped = {
    ci: officers.filter(o => o.role === "ci"),
    sp: officers.filter(o => o.role === "sp"),
    dgp: officers.filter(o => o.role === "dgp")
  };
  
  res.json({ success: true, officials: grouped });
});

module.exports = router;
