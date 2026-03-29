const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../config/database");
const { authenticateToken, generateToken } = require("../middleware/auth");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { badgeId, password } = req.body;
    if (!badgeId || !password) {
      return res.status(400).json({ success: false, message: "Badge ID and password are required." });
    }
    const official = db.findOfficialByBadge(badgeId.toUpperCase());
    if (!official) {
      return res.status(401).json({ success: false, message: "Invalid badge ID or password." });
    }
    const isMatch = await bcrypt.compare(password, official.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid badge ID or password." });
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
    const { name, badgeId, email, password, rank, station } = req.body;
    if (!name || !badgeId || !email || !password || !rank || !station) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    if (db.findOfficialByBadge(badgeId.toUpperCase())) {
      return res.status(409).json({ success: false, message: "Badge ID already registered." });
    }
    if (db.findOfficialByEmail(email.toLowerCase())) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newOfficial = db.addOfficial({
      name, badgeId: badgeId.toUpperCase(), email: email.toLowerCase(),
      password: hashedPassword, rank, station, role: "police",
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

module.exports = router;
