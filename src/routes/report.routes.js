const express = require("express");

const multer = require("multer");

const {
  uploadReport,
} = require("../controllers/report.controller");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post(
  "/upload",
  upload.single("file"),
  uploadReport
);

module.exports = router;