const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const reportRoutes = require("./routes/reports");
const uploadRoutes = require("./routes/upload");
const escalationRoutes = require("./routes/escalation");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", process.env.FRONTEND_URL],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/escalate", escalationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Crime Report API is running", timestamp: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found." }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error.", error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🔒 Anonymous Crime Reporting API`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads at http://localhost:${PORT}/uploads\n`);
});

module.exports = app;
