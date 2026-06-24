const express = require("express");

const multer = require("multer");

const {
  uploadReport, getLearningUpdateColumns
} = require("../controllers/report.controller");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.get(
    "/learningUpdates/columns", getLearningUpdateColumns
);

router.post(
  "/upload",
  upload.single("file"),
  uploadReport
);
router.get('/health',(req,res)=>{
  res.send('working')
})


module.exports = router;