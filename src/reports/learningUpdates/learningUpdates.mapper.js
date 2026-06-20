const {
    buildHeaders
} = require("./learningUpdates.template");

function generateOutputRows({ skillForgeRecords, academyLookup, employeeRecords }) {

    const rows = [];

    rows.push(buildHeaders());
    //console.log("Type of skillForgeRecords", typeof skillForgeRecords)
    // console.log("skillForgeRecords", skillForgeRecords)
    // console.log("Type of academyLookup", typeof academyLookup)
    // console.log("academyLookup", JSON.stringify(academyLookup, null, 4))
    const employeeLookup = new Map();
    for (const emp of employeeRecords) {
        const key = `${emp["Email ID"]}|${emp["DGF Request ID"]}`;
        // console.log("Employee Key", key);
        employeeLookup.set(key, emp);
        // console.log("Employee employeeLookup", employeeLookup);

    }
    for (const [key, sfArray] of skillForgeRecords) {
        const employee = employeeLookup.get(key);
        // console.log("employee", employee);

        for (const sf of sfArray) {
            const courseId = sf["Course ID"];
            //console.log("Course id from skill forge", courseId);
            const email = sf["Employee Email"]?.trim().toLowerCase();
            const curriculum = academyLookup.courseContentsMap[courseId];
            const curriculumTitles = Array.isArray(curriculum)
                ? curriculum
                    .map((item, index) => `${index + 1}.${item.title.trim()}`)
                    .join("\n")
                : "";
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
            rows.push([
                sf["Employee ID"],
                employee?.["Employee Name"],
                sf["Employee Email"],
                employee?.["BU"], // BU
                employee?.["DU"], // DU
                employee?.["Tech Stack 1"], // Tech Stack 1
                employee?.["Tech Stack 2"], // Tech Stack 2
                employee?.["Skill/Competency Group"],
                employee?.["Designation"],
                employee?.["Designation Group"],
                sf["Available Bandwidth"], // ["Available Bandwidth"]
                sf["Request Number"],
                sf["Learning Type"],
                sf["Learning Program/Path"],
                curriculumTitles || "",
                sf["Start Date"],
                sf["Expected Completion Date"],
                sf["Progress %"],
                sf["Learning Status"],
                sf["Comments"],
                employee?.["Revised Completion Date"],
                employee?.["Reason for Revision/Extension"],
                averageScore,
                assessmentScores,
                assessmentStatuses,
                grade?.result || "",
                employee?.["Certification Status if any"],
                employee?.["Deployment Readiness After Completion"],
                employee?.["CapDev Remarks"],
                sf["Learning hrs."],
                sf["Mentor Name"],
                sf["Mentor mail id"]
            ]);
        }
    }

    return rows;
}

module.exports = {
    generateOutputRows
};