const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const upload = require("../middleware/upload");

// POST /api/reports — public: submit anonymous report
router.post("/", upload.array("files", 5), (req, res) => {
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
    res.status(201).json({
      success: true,
      message: "Report submitted successfully. Your identity is protected.",
      trackingId: report.trackingId,
      reportId: report.id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to submit report.", error: err.message });
  }
});

// GET /api/reports/stats — protected: dashboard statistics
router.get("/stats", authenticateToken, (req, res) => {
  res.json({ success: true, stats: db.getStats() });
});

// GET /api/reports/track/:trackingId — public: track report by ID
router.get("/track/:trackingId", (req, res) => {
  const report = db.getReportByTrackingId(req.params.trackingId.toUpperCase());
  if (!report) return res.status(404).json({ success: false, message: "Report not found. Check your tracking ID." });
  res.json({
    success: true,
    report: {
      trackingId: report.trackingId,
      crimeType: report.crimeType,
      address: report.address,
      status: report.status,
      submittedAt: report.submittedAt,
      updatedAt: report.updatedAt,
    },
  });
});

// GET /api/reports — protected: get all reports
router.get("/", authenticateToken, (req, res) => {
  const { status, crimeType, priority, search } = req.query;
  let reports = db.getAllReports();
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
  res.json({ success: true, report });
});

// PATCH /api/reports/:id — protected: update status/notes
router.patch("/:id", authenticateToken, (req, res) => {
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
