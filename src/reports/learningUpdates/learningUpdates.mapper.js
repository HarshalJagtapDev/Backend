const {
    buildHeaders
} = require("./learningUpdates.template");

const { formatExcelDate } = require("../../utils/dateFormat.util");

const COLUMN_MAP = {

    employeeId: {
        header: "Employee ID",
        value: ({ sf }) => sf["Employee ID"]
    },

    employeeName: {
        header: "Employee Name",
        value: ({ employee }) => employee?.["Employee Name"]
    },

    employeeEmail: {
        header: "Employee Email",
        value: ({ employee }) => employee?.["Email ID"]
    },

    bu: {
        header: "BU",
        value: ({ employee }) => employee?.["BU"]
    },

    du: {
        header: "DU",
        value: ({ employee }) => employee?.["DU"]
    },

    techStack1: {
        header: "Tech Stack 1",
        value: ({ employee }) => employee?.["Tech Stack 1"]
    },

    techStack2: {
        header: "Tech Stack 2",
        value: ({ employee }) => employee?.["Tech Stack 2"]
    },

    skillCompetencyGroup: {
        header: "Skill/Competency Group",
        value: ({ employee }) => employee?.["Skill/Competency Group"]
    },

    designation: {
        header: "Designation",
        value: ({ employee }) => employee?.["Designation"]
    },

    designationGroup: {
        header: "Designation Group",
        value: ({ employee }) => employee?.["Designation Group"]
    },

    availableBandwidth: {
        header: "Available Bandwidth",
        value: ({ sf }) => sf["Available Bandwidth"]
    },

    requestNumber: {
        header: "Learning Request Number",
        value: ({ sf }) => sf["Request Number"]
    },

    learningType: {
        header: "Learning Type",
        value: ({ sf }) => sf["Learning Type"]
    },

    learningProgram: {
        header: "Learning Program/Path",
        value: ({ sf }) => sf["Learning Program/Path"]
    },

    curriculum: {
        header: "Curriculum",
        value: ({ curriculumTitles }) => curriculumTitles || ""
    },

    startDate: {
        header: "Start Date",
        value: ({ sf }) => formatExcelDate(sf["Start Date"])
    },

    expectedCompletionDate: {
        header: "Expected Completion Date",
        value: ({ sf }) => formatExcelDate(sf["Expected Completion Date"])
    },

    progress: {
        header: "Progress %",
        value: ({ sf }) => sf["Progress %"]
    },

    learningStatus: {
        header: "Learning Status",
        value: ({ sf }) => sf["Learning Status"]
    },

    comments: {
        header: "Current Stage",
        value: ({ sf }) => sf["Comments"]
    },

    revisedCompletionDate: {
        header: "Revised Completion Date",
        value: ({ employee }) => formatExcelDate(employee?.["Revised Completion Date"])
    },

    revisionReason: {
        header: "Reason for Revision/Extension",
        value: ({ employee }) => employee?.["Reason for Revision/Extension"]
    },

    averageScore: {
        header: "Average Score",
        value: ({ averageScore }) => averageScore
    },

    assessmentScores: {
        header: "Assessment Scores",
        value: ({ assessmentScores }) => assessmentScores
    },

    assessmentStatuses: {
        header: "Assessment Statuses",
        value: ({ assessmentStatuses }) => assessmentStatuses
    },

    overallResult: {
        header: "Overall Result",
        value: ({ grade }) => grade?.result || ""
    },

    certificationStatus: {
        header: "Certification Status if any",
        value: ({ employee }) => employee?.["Certification Status if any"]
    },

    deploymentReadiness: {
        header: "Deployment Readiness After Completion",
        value: ({ employee }) => employee?.["Deployment Readiness After Completion"]
    },

    capDevRemarks: {
        header: "CapDev Remarks",
        value: ({ employee }) => employee?.["CapDev Remarks"]
    },

    learningHours: {
        header: "Learning hrs.",
        value: ({ sf }) => sf["Learning hrs."]
    },

    mentorName: {
        header: "Mentor Name",
        value: ({ sf }) => sf["Mentor Name"]
    },

    mentorEmail: {
        header: "Mentor mail id",
        value: ({ sf }) => sf["Mentor mail id"]
    },
    requestCreatedBy: {
        header: "Request created by",
        value: ({ sf }) => sf["Request Created By"]
    },
    accountName: {
        header: "Account name",
        value: ({ sf }) => sf["Account Name"]
    },

    projectName: {
        header: "Project name",
        value: ({ sf }) => sf["Project Name"]
    },

    requestApprovedBySpocDate: {
        header: "Request approved by SPOC date",
        value: ({ sf }) => formatExcelDate(sf["Request Approved By SPOC Date"])
    }
};



function generateOutputRows({ skillForgeRecords, academyLookup, employeeRecords, selectedColumns }) {

    const rows = [];

    rows.push(buildHeaders(selectedColumns, COLUMN_MAP));
    //console.log("Type of skillForgeRecords", typeof skillForgeRecords)
    // console.log("skillForgeRecords", skillForgeRecords-)
    // console.log("Type of academyLookup", typeof academyLookup)
    // console.log("academyLookup", JSON.stringify(academyLookup, null, 4))
    const employeeLookup = new Map();
    for (const emp of employeeRecords) {
        const email = (emp["Email ID"] || "").trim().toLowerCase();

        const key = `${email}|${emp["Learning Request Number"]}`;
        //console.log("Employee Key", key);
        employeeLookup.set(key, emp);
        //console.log("Employee employeeLookup", employeeLookup);

    }
    for (const [key, sfArray] of skillForgeRecords) {
        const employee = employeeLookup.get(key);
        //console.log("employee", employee);

        for (const sf of sfArray) {
            const courseId = sf["Course ID"];
            //console.log("Course id from skill forge", courseId);
            const email = sf["Employee Email"]?.trim().toLowerCase();
            const curriculum = academyLookup.courseContentsMap[courseId];
            let curriculumTitles = "";

            if (curriculum) {
                const lines = [];
                lines.push(`Course URL: ${curriculum.courseUrl}`);
                lines.push("");
                curriculum.modules.forEach((item, index) => {
                    lines.push(
                        `${index + 1}. ${item.title.trim()}`
                    );
                });
                curriculumTitles = lines.join("\n");
            }

            const userId = academyLookup.courseUserMap[courseId]?.[email];
            const grade = academyLookup.courseGradesMap[courseId]?.[userId];
            let assessmentScores = "";
            let assessmentStatuses = "";
            let averageScore = "";

            if (!userId) {
                // Scenario A: User is not found in Moodle enrolled users
                assessmentScores = "Not Enrolled";
                assessmentStatuses = "Not Enrolled";
                averageScore = "Not Enrolled";

            } else if (!Array.isArray(grade) || grade.length === 0) {
                // Scenario B: User is enrolled, but the Moodle course has no gradable items
                assessmentScores = "No Assignments";
                assessmentStatuses = "No Assignments";
                averageScore = "No Assignments";

            } else {
                // Scenario C: User is enrolled and assignments exist
                const gradedAssignments = grade.filter(g => g.graderaw != null);
                const pendingAssignments = grade.filter(g => g.assignmentStatus === "Submitted - Awaiting Grading");
                const submittedAssignments = grade.filter(g => g.assignmentStatus !== "Not Submitted");

                // 1. Average Score Logic
                if (gradedAssignments.length > 0) {
                    averageScore = (gradedAssignments.reduce((sum, g) => sum + g.graderaw, 0) / gradedAssignments.length).toFixed(2) + " %";
                } else if (pendingAssignments.length > 0) {
                    averageScore = "Pending Grading";
                } else if (submittedAssignments.length === 0) {
                    averageScore = "Not Submitted";
                } else {
                    averageScore = "N/A";
                }

                // 2. Assessment Scores Logic (use N/A instead of - to avoid confusing "- -" output)
                assessmentScores = grade.map((g, index) => {
                    const displayScore = (g.score === "-" || g.score == null) ? "N/A" : g.score;
                    return `${index + 1}. ${g.assessmentName} - ${displayScore}`;
                }).join("\n");

                // 3. Assessment Statuses Logic
                assessmentStatuses = grade.map((g, index) => {
                    const status = g.assignmentStatus || "Unknown";
                    return `${index + 1}. ${g.assessmentName} - ${status}`;
                }).join("\n");
            }

            // console.log("curriculum", curriculum)
            // console.log("userId", userId)
            //console.log("grade", grade)
            // rows.push([
            //     sf["Employee ID"],
            //     employee?.["Employee Name"],
            //     sf["Employee Email"],
            //     employee?.["BU"], // BU
            //     employee?.["DU"], // DU
            //     employee?.["Tech Stack 1"], // Tech Stack 1
            //     employee?.["Tech Stack 2"], // Tech Stack 2
            //     employee?.["Skill/Competency Group"],
            //     employee?.["Designation"],
            //     employee?.["Designation Group"],
            //     sf["Available Bandwidth"], // ["Available Bandwidth"]
            //     sf["Request Number"],
            //     sf["Learning Type"],
            //     sf["Learning Program/Path"],
            //     curriculumTitles || "",
            //     sf["Start Date"],
            //     sf["Expected Completion Date"],
            //     sf["Progress %"],
            //     sf["Learning Status"],
            //     sf["Comments"],
            //     employee?.["Revised Completion Date"],
            //     employee?.["Reason for Revision/Extension"],
            //     averageScore,
            //     assessmentScores,
            //     assessmentStatuses,
            //     grade?.result || "",
            //     employee?.["Certification Status if any"],
            //     employee?.["Deployment Readiness After Completion"],
            //     employee?.["CapDev Remarks"],
            //     sf["Learning hrs."],
            //     sf["Mentor Name"],
            //     sf["Mentor mail id"]
            // ]);

            const row = selectedColumns.map(column =>
                COLUMN_MAP[column].value({
                    sf,
                    employee,
                    grade,
                    curriculumTitles,
                    averageScore,
                    assessmentScores,
                    assessmentStatuses
                })
            );

            rows.push(row);
        }
    }

    return rows;
}

module.exports = {
    generateOutputRows
};