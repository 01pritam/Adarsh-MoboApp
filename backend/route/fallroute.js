const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Multer setup for file upload
const upload = multer({ dest: "uploads/" });

router.post("/analyze-video", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: "error", message: "No video uploaded." });
  }

  const videoPath = path.join(__dirname, "..", req.file.path);
  const python = spawn("python3", ["fall-detector.py", videoPath]);

  let result = "";
  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error("Python Error:", data.toString());
  });

  python.on("close", (code) => {
    fs.unlinkSync(videoPath); // Clean up uploaded file
    try {
      const jsonResult = JSON.parse(result);
      res.json(jsonResult);
    } catch (err) {
      res.status(500).json({ status: "error", message: "Failed to parse Python output." });
    }
  });
});

module.exports = router;
