// const { generateReport } = require("../services/report.service");
const {
    getReportGenerator
} = require("../reports/factory/reportFactory");
const path = require("path");

async function uploadReport(req, res) {
  console.log("API HIT");
  try {
    const reportType = req.body.reportType;
    const selectedColumns = JSON.parse(req.body.selectedColumns || "[]")
    const generator = getReportGenerator(reportType);
    let outputFile;
    if(reportType == "learningUpdates"){
      outputFile = await generator.generateReport(req.file.path, selectedColumns);
    } else {
      outputFile = await generator.generateReport(req.file.path);
    }

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

async function getLearningUpdateColumns(req, res) {
  try {
    const columns = [

      {
        id: "employeeId",
        label: "Employee ID"
      },

      {
        id: "employeeName",
        label: "Employee Name"
      },

      {
        id: "employeeEmail",
        label: "Email ID"
      },
      {
        id: "bu",
        label: "BU"
      },
      {
        id: "du",
        label: "DU"
      },
      {
        id: "techStack1",
        label: "Tech Stack 1"
      },
      {
        id: "techStack2",
        label: "Tech Stack 2"
      },
      {
        id: "skillCompetencyGroup",
        label: "Skill/Competency Group"
      },
      {
        id: "designation",
        label: "Designation"
      },
      {
        id: "designationGroup",
        label: "Designation Group"
      },
      {
        id: "availableBandwidth",
        label: "Available Bandwidth"
      },
      {
        id: "requestNumber",
        label: "Learning request no."
      },
      {
        id: "learningType",
        label: "Learning Type"
      },
      {
        id: "learningProgram",
        label: "Learning Program/Path"
      },
      {
        id: "curriculum",
        label: "Curriculum"
      },
      {
        id: "startDate",
        label: "Start Date"
      },
      {
        id: "expectedCompletionDate",
        label: "Expected Completion Date"
      },
      {
        id: "progress",
        label: "Progress %"
      },
      {
        id: "learningStatus",
        label: "Learning Status"
      },
      {
        id: "comments",
        label: "Current Stage"
      },
      {
        id: "revisedCompletionDate",
        label: "Revised Completion Date"
      },
      {
        id: "revisionReason",
        label: "Reason for Revision/Extension"
      },
      {
        id: "averageScore",
        label: "Average Score"
      },
      {
        id: "assessmentScores",
        label: "Assessment/Assignment Score"
      },
      {
        id: "assessmentStatuses",
        label: "Assignment Status"
      },
      {
        id: "overallResult",
        label: "Result"
      },
      {
        id: "certificationStatus",
        label: "Certification Status if any"
      },
      {
        id: "deploymentReadiness",
        label: "Deployment Readiness After Completion"
      },
      {
        id: "capDevRemarks",
        label: "CapDev Remarks"
      },
      {
        id: "learningHours",
        label: "Learning hrs."
      },
      {
        id: "mentorName",
        label: "Mentor Name"
      },
      {
        id: "mentorEmail",
        label: "Mentor mail id"
      },
      {
        id: "requestCreatedBy",
        label: "Request created by"
      },
      {
        id: "accountName",
        label: "Account name"
      },
      {
        id: "projectName",
        label: "Project name"
      },
      {
        id: "requestApprovedBySpocDate",
        label: "Request approved by SPOC date"
      }
    ];
    return res.status(200).json(columns);
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch available columns." });
  }
};

module.exports = {
  uploadReport,
  getLearningUpdateColumns
};