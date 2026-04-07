const express = require("express");
const router = express.Router();
const db = require("../config/database");

// POST /api/escalate
router.post("/", (req, res) => {
  try {
    const { trackingId, reason, type = "corruption" } = req.body;
    if (!trackingId || !reason) {
      return res.status(400).json({ success: false, message: "Tracking ID and reason are required." });
    }

    if (!["corruption", "inaction"].includes(type)) {
      return res.status(400).json({ success: false, message: "Type must be 'corruption' or 'inaction'." });
    }

    const report = db.getReportByTrackingId(trackingId.toUpperCase());
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found." });
    }

    if (report.currentLevel === "dgp") {
      return res.status(400).json({ success: false, message: "Already at highest authority. Contact the Chief Minister Grievance Cell." });
    }

    if (report.corruptionFlagRaised) {
      return res.status(400).json({ success: false, message: "A complaint has already been filed for this report." });
    }

    // Validate based on complaint type
    if (type === "corruption") {
      if (report.status !== "Rejected") {
        return res.status(400).json({ success: false, message: "Report has not been rejected. Corruption complaints can only be filed for rejected reports." });
      }
    } else if (type === "inaction") {
      const inactionCheck = db.canEscalateForInaction(report.id);
      if (!inactionCheck.canEscalate) {
        return res.status(400).json({ 
          success: false, 
          message: "Report does not qualify for an inaction complaint. The deadline has not been exceeded yet." 
        });
      }
    }

    const oldLevelLabel = report.currentLevel;
    const updatedReport = db.escalateReport(report.id, reason, type);

    const levelLabels = {
      ci: "Circle Inspector",
      sp: "Superintendent of Police",
      dgp: "Director General of Police"
    };

    const messageMap = {
      corruption: "Your corruption complaint has been filed.",
      inaction: "Your inaction complaint has been filed. The report has been escalated to a higher authority."
    };

    res.json({
      success: true,
      message: messageMap[type],
      type: type,
      previousLevel: oldLevelLabel,
      newLevel: updatedReport.currentLevel,
      newLevelFull: levelLabels[updatedReport.currentLevel],
      trackingId: updatedReport.trackingId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error handling escalation.", error: err.message });
  }
});

module.exports = router;
