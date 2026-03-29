/**
 * Official (Police) Model Schema
 *
 * In production, use MongoDB with Mongoose or PostgreSQL with Sequelize.
 * Currently using in-memory storage via config/database.js
 *
 * Schema:
 * {
 *   id:        String  (UUID v4)
 *   name:      String  (full name)
 *   badgeId:   String  (e.g. HYD-001, unique identifier for login)
 *   email:     String  (unique, official government email)
 *   password:  String  (bcrypt hashed, never stored in plain text)
 *   rank:      String  (Constable | Head Constable | Sub-Inspector | Inspector | DSP | SP | Superintendent | DGP)
 *   station:   String  (police station name)
 *   role:      String  (always "police")
 *   createdAt: ISO Date
 * }
 *
 * Demo credentials (pre-seeded):
 *   Badge: HYD-001  Password: Police@123
 *   Badge: HYD-002  Password: Police@456
 */

const RANKS = [
  "Constable",
  "Head Constable",
  "Sub-Inspector",
  "Inspector",
  "Deputy Superintendent",
  "Superintendent",
  "Deputy Inspector General",
  "Inspector General",
  "Director General",
];

const validateOfficial = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length < 3) errors.push("Name must be at least 3 characters.");
  if (!data.badgeId || !/^[A-Z]{2,5}-\d{3,6}$/.test(data.badgeId)) errors.push("Badge ID format: XX-000 (e.g. HYD-001).");
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push("Valid email is required.");
  if (!data.password || data.password.length < 8) errors.push("Password must be at least 8 characters.");
  if (!data.rank || !RANKS.includes(data.rank)) errors.push(`Rank must be one of: ${RANKS.join(", ")}`);
  if (!data.station || data.station.trim().length < 3) errors.push("Station name is required.");
  return errors;
};

module.exports = { RANKS, validateOfficial };
