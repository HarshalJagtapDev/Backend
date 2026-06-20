// const { generateReport } = require("../services/report.service");
const {
    getReportGenerator
} = require("../reports/factory/reportFactory");
const path = require("path");

async function uploadReport(req, res) {
  console.log("API HIT");
  try {
    const reportType = req.body.reportType;
    const generator = getReportGenerator(reportType);
    const outputFile = await generator.generateReport(req.file.path);

    console.log("Report Generated", outputFile);

    const fileName = path.basename(outputFile);

    // Use express res.download which sets appropriate headers.
    // Ensure we pass a clean filename so clients receive a .xlsx file.
    return res.download(outputFile, fileName, (err) => {
      if (err) {
        console.log("Download error:", err);
        if (!res.headersSent) {
          return res.status(500).json({ success: false, message: err.message });
        }
      }
    });
  } catch (error) {
    console.log("ERROR", error);

    if (error.isValidationError) {
      return res.status(400).json({
        success: false,
        message: "File validation failed",
        errors: error.validationErrors
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  uploadReport,
};