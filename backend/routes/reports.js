const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const upload = require("../middleware/upload");
const path = require("path");
const aiService = require("../services/aiVerification");

// Helper: get AI confidence score from a report (null if not yet analyzed)
function getConfidenceScore(report) {
  if (!report.aiVerification) return null;
  if (report.aiVerification.overall && report.aiVerification.overall.overallScore !== undefined) {
    return report.aiVerification.overall.overallScore;
  }
  return null;
}

// Helper: check if report passes the 50% confidence threshold
function passesConfidenceThreshold(report) {
  const score = getConfidenceScore(report);
  // If AI hasn't analyzed yet, don't filter it out (give it time)
  if (score === null) return true;
  return score >= 50;
}

// POST /api/reports — public: submit anonymous report
router.post("/", upload.array("files", 5), async (req, res) => {
  try {
    const { crimeType, description, address, landmark, priority } = req.body;
    if (!crimeType || !address) {
      return res.status(400).json({ success: false, message: "Crime type and address are required." });
    }
    const files = (req.files || []).map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      url: `/uploads/${f.filename}`,
    }));

    const report = db.addReport({
      crimeType,
      description: description || "",
      address,
      landmark: landmark || "",
      priority: priority || "Medium",
      files,
    });

    if (files.length === 0) {
      // No evidence submitted — confidence is straight zero
      db.updateReport(report.id, {
        aiVerification: {
          analyzedAt: new Date().toISOString(),
          reportId: report.id,
          textAndImage: {
            credibilityScore: 0,
            imageMatchScore: 0,
            aiGeneratedImageRisk: 0,
            verdict: "no_evidence",
            reasons: ["No images or videos were submitted as evidence. Confidence is 0%."],
            recommendation: "review",
            status: "completed",
            imagesAnalyzed: 0
          },
          video: null,
          overall: {
            verdict: "no_evidence",
            recommendation: "review",
            overallScore: 0,
            verifiedBy: []
          },
          summary: {
            totalImagesAnalyzed: 0,
            totalVideosAnalyzed: 0,
            hasVideoAnalysis: false,
            hasImageAnalysis: false
          }
        }
      });
    } else {
      const imageFiles = files.filter(f => f.mimetype.startsWith("image/")).map(f => path.join(__dirname, "..", "uploads", f.filename));
      const videoFiles = files.filter(f => f.mimetype.startsWith("video/")).map(f => path.join(__dirname, "..", "uploads", f.filename));

      try {
        const result = await aiService.analyzeReport({ crimeType, description, address, imageFiles, videoFiles, reportId: report.id });
        db.updateReport(report.id, { aiVerification: result });
      } catch (err) {
        console.error("AI analysis error:", err);
      }
    }

    // Refresh report to get inserted AI data
    const updatedReport = db.getReportById(report.id);
    const confidenceScore = getConfidenceScore(updatedReport);
    const likelyFake = confidenceScore !== null && confidenceScore < 50;

    res.status(201).json({
      success: true,
      message: likelyFake ? "Report analyzed." : "Report submitted successfully. Your identity is protected.",
      trackingId: report.trackingId,
      reportId: report.id,
      confidenceScore: confidenceScore,
      likelyFake: likelyFake
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to submit report.", error: err.message });
  }
});

// GET /api/reports/stats — protected: dashboard statistics
router.get("/stats", authenticateToken, (req, res) => {
  let reps = db.getAllReports();
  if (req.user.role !== "dgp") {
    reps = reps.filter((r) => r.currentLevel === req.user.role);
  }
  // Only count reports with confidence >= 50% (or not yet analyzed)
  reps = reps.filter(passesConfidenceThreshold);
  res.json({ success: true, stats: {
    total: reps.length,
    pending: reps.filter((r) => r.status === "Pending").length,
    underReview: reps.filter((r) => r.status === "Under Review").length,
    resolved: reps.filter((r) => r.status === "Resolved").length,
    rejected: reps.filter((r) => r.status === "Rejected").length,
  } });
});

// GET /api/reports/track/:trackingId — public: track report by ID
router.get("/track/:trackingId", (req, res) => {
  const report = db.getReportByTrackingId(req.params.trackingId.toUpperCase());
  if (!report) return res.status(404).json({ success: false, message: "Report not found. Check your tracking ID." });
  
  const handledByMap = {
    ci: "Circle Inspector",
    sp: "Superintendent of Police",
    dgp: "Director General of Police"
  };

  // Check inaction escalation eligibility
  const inactionInfo = db.canEscalateForInaction(report.id);

  const confidenceScore = getConfidenceScore(report);
  const likelyFake = confidenceScore !== null && confidenceScore < 50;

  res.json({
    success: true,
    report: {
      trackingId: report.trackingId,
      crimeType: report.crimeType,
      address: report.address,
      status: likelyFake ? "Rejected — Low Credibility" : report.status,
      currentLevel: report.currentLevel,
      handledBy: handledByMap[report.currentLevel] || "Unknown",
      corruptionFlagRaised: report.corruptionFlagRaised,
      submittedAt: report.submittedAt,
      updatedAt: report.updatedAt,
      statusChangedAt: report.statusChangedAt,
      // AI confidence info
      confidenceScore: confidenceScore,
      likelyFake: likelyFake,
      // Inaction escalation info
      canEscalateForInaction: inactionInfo.canEscalate || false,
      inactionDaysElapsed: inactionInfo.daysElapsed || 0,
      inactionDeadline: inactionInfo.deadline || null,
      inactionDaysRemaining: inactionInfo.daysRemaining || null,
      inactionMessage: inactionInfo.message || null,
    },
  });
});

// GET /api/reports — protected: get all reports
router.get("/", authenticateToken, (req, res) => {
  const { status, crimeType, priority, search, level } = req.query;
  let reports = db.getAllReports();
  if (req.user.role !== "dgp") {
    reports = reports.filter((r) => r.currentLevel === req.user.role);
  } else if (level) {
    reports = reports.filter((r) => r.currentLevel === level);
  }
  // Hide reports with confidence < 50% from officers
  reports = reports.filter(passesConfidenceThreshold);
  if (status) reports = reports.filter((r) => r.status === status);
  if (crimeType) reports = reports.filter((r) => r.crimeType === crimeType);
  if (priority) reports = reports.filter((r) => r.priority === priority);
  if (search) {
    const q = search.toLowerCase();
    reports = reports.filter(
      (r) =>
        r.trackingId.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.crimeType.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }
  res.json({ success: true, count: reports.length, reports });
});

// GET /api/reports/:id — protected: single report
router.get("/:id", authenticateToken, (req, res) => {
  const report = db.getReportById(req.params.id);
  if (!report) return res.status(404).json({ success: false, message: "Report not found." });
  // Block access to low-confidence reports
  if (!passesConfidenceThreshold(report)) {
    return res.status(403).json({ success: false, message: "This report has been flagged as low credibility (confidence below 50%). It is not available for review." });
  }
  if (req.user.role !== "dgp" && report.currentLevel !== req.user.role) {
    return res.status(403).json({ success: false, message: "Access denied. Report is handling by another authority level." });
  }
  res.json({ success: true, report });
});

// GET /api/reports/:id/history — protected: single report history
router.get("/:id/history", authenticateToken, (req, res) => {
  const report = db.getReportById(req.params.id);
  if (!report) return res.status(404).json({ success: false, message: "Report not found." });
  if (req.user.role !== "dgp" && report.currentLevel !== req.user.role) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }
  res.json({ success: true, history: report.escalationHistory || [] });
});

// PATCH /api/reports/:id — protected: update status/notes
router.patch("/:id", authenticateToken, (req, res) => {
  const report = db.getReportById(req.params.id);
  if (!report) return res.status(404).json({ success: false, message: "Report not found." });
  if (req.user.role !== "dgp" && report.currentLevel !== req.user.role) {
    return res.status(403).json({ success: false, message: "Access denied. Report is handling by another authority level." });
  }

  const { status, officerNotes, priority, assignedTo } = req.body;
  const allowed = ["Pending", "Under Review", "Resolved", "Rejected"];
  if (status && !allowed.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(", ")}` });
  }
  const updated = db.updateReport(req.params.id, {
    ...(status && { status }),
    ...(officerNotes !== undefined && { officerNotes }),
    ...(priority && { priority }),
    ...(assignedTo && { assignedTo }),
  });
  if (!updated) return res.status(404).json({ success: false, message: "Report not found." });
  res.json({ success: true, message: "Report updated successfully.", report: updated });
});

module.exports = router;
