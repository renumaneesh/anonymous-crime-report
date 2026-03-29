/**
 * Report Model Schema
 * 
 * In production, this would be a Mongoose schema or Sequelize model.
 * Currently using in-memory storage via config/database.js
 * 
 * Schema:
 * {
 *   id:           String  (UUID v4, primary key)
 *   trackingId:   String  (e.g. CR-2025-001, anonymous reference)
 *   crimeType:    String  (Theft | Assault | Vandalism | Fraud | Drug Activity | Harassment | Other)
 *   description:  String  (optional, citizen's own words)
 *   address:      String  (required, exact location of crime)
 *   landmark:     String  (optional, nearby landmark)
 *   priority:     String  (Low | Medium | High | Critical)
 *   status:       String  (Pending | Under Review | Resolved | Rejected)
 *   files:        Array   [{ filename, originalName, mimetype, size, url }]
 *   officerNotes: String  (internal notes, NOT visible to citizens)
 *   assignedTo:   String  (officer name, internal use)
 *   submittedAt:  ISO Date
 *   updatedAt:    ISO Date
 * }
 * 
 * Privacy guarantee:
 * - No IP address stored
 * - No browser fingerprint stored
 * - No personal identifiers collected
 * - TrackingId is the only link between citizen and report
 */

const CRIME_TYPES = ["Theft", "Assault", "Vandalism", "Fraud", "Drug Activity", "Harassment", "Robbery", "Domestic Violence", "Cybercrime", "Other"];

const STATUSES = ["Pending", "Under Review", "Resolved", "Rejected"];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const validateReport = (data) => {
  const errors = [];
  if (!data.crimeType || !CRIME_TYPES.includes(data.crimeType)) {
    errors.push(`crimeType must be one of: ${CRIME_TYPES.join(", ")}`);
  }
  if (!data.address || data.address.trim().length < 10) {
    errors.push("address must be at least 10 characters.");
  }
  if (data.description && data.description.length > 2000) {
    errors.push("description must not exceed 2000 characters.");
  }
  return errors;
};

module.exports = { CRIME_TYPES, STATUSES, PRIORITIES, validateReport };
