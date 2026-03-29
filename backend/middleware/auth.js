const jwt = require("jsonwebtoken");
const db = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "crime_report_secret_key_2025";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const official = db.findOfficialById(decoded.id);
    if (!official) {
      return res.status(401).json({ success: false, message: "Invalid token. Official not found." });
    }
    req.user = { id: official.id, name: official.name, badgeId: official.badgeId, rank: official.rank, role: official.role };
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid or expired token." });
  }
};

const generateToken = (official) => {
  return jwt.sign(
    { id: official.id, badgeId: official.badgeId, role: official.role },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
};

module.exports = { authenticateToken, generateToken };
