const { generateReport } = require("../services/report.service");
const path = require("path");

async function uploadReport(req, res) {
  console.log("API HIT");
  try {
    const outputFile = await generateReport(req.file.path);

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

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  uploadReport,
};