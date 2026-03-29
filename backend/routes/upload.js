const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/", upload.array("files", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded." });
    }
    const uploaded = req.files.map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      url: `/uploads/${f.filename}`,
      isVideo: f.mimetype.startsWith("video/"),
      isImage: f.mimetype.startsWith("image/"),
    }));
    res.json({ success: true, message: `${uploaded.length} file(s) uploaded.`, files: uploaded });
  } catch (err) {
    res.status(500).json({ success: false, message: "File upload failed.", error: err.message });
  }
});

module.exports = router;
