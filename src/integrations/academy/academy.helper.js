/**
 * =====================================================
 * Assignment Status
 * =====================================================
 *
 * Current Business Logic
 *
 * Submitted + Graded
 * Submitted - Awaiting Grading
 * Not Submitted
 *
 * Can easily be modified later.
 */

function getAssignmentStatus(gradeItem) {

    if (!gradeItem) {
        return "";
    }

    if (
        gradeItem.gradedatesubmitted &&
        gradeItem.gradedategraded
    ) {
        return "Submitted";
    }

    if (
        gradeItem.gradedatesubmitted &&
        !gradeItem.gradedategraded
    ) {
        return "Submitted - Awaiting Grading";
    }

    return "Not Submitted";
}

/**
 * =====================================================
 * Valid Grade Items
 * =====================================================
 *
 * Ignore course summary rows.
 * Keep only actual Moodle activities.
 *
 * Examples:
 *
 * assign
 * quiz
 * url
 * scorm
 * lesson
 * etc.
 */

function getValidGradeItems(gradeItems = []) {

    return gradeItems.filter(item =>
        item.itemtype === "mod"
    );

}

/**
 * =====================================================
 * Assessment Score
 * =====================================================
 *
 * Business decided to use
 *
 * percentageformatted
 */

function getAssessmentScore(gradeItem) {

    if (!gradeItem) {
        return "";

    }

    return gradeItem.percentageformatted || "";

}

/**
 * =====================================================
 * Curriculum Formatter
 * =====================================================
 *
 * Convert
 *
 * [
 *   {title:"HTML"},
 *   {title:"Bootstrap"}
 * ]
 *
 * into
 *
 * HTML
 * Bootstrap
 */

function formatCurriculum(modules = []) {

    return modules
        .map(module => module.title)
        .filter(Boolean)
        .join("\n");

}

/**
 * =====================================================
 * Assessment Names
 * =====================================================
 *
 * Useful for future reports.
 *
 * Currently not required
 * but keeping helper ready.
 */

function formatAssessmentNames(gradeItems = []) {

    return gradeItems
        .map(item => item.assessmentName)
        .filter(Boolean)
        .join("\n");

}

/**
 * =====================================================
 * Assessment Status
 * =====================================================
 *
 * Join all assignment statuses.
 */

function formatAssignmentStatus(gradeItems = []) {

    return gradeItems
        .map(getAssignmentStatus)
        .filter(Boolean)
        .join("\n");

}

/**
 * =====================================================
 * Assessment Scores
 * =====================================================
 *
 * Join all percentages.
 */

function formatAssessmentScores(gradeItems = []) {

    return gradeItems
        .map(getAssessmentScore)
        .filter(Boolean)
        .join("\n");

}

/**
 * =====================================================
 * Extract Unique Course IDs
 * =====================================================
 *
 * Input:
 *
 * Skill Forge Records
 *
 * Output:
 *
 * [1778,1779,1880]
 */

function extractUniqueCourseIds(records = []) {

    return [

        ...new Set(

            records
                .map(record => record.courseId)
                .filter(Boolean)

        )

    ];

}

module.exports = {

    getAssignmentStatus,

    getValidGradeItems,

    getAssessmentScore,

    formatCurriculum,

    formatAssessmentNames,

    formatAssignmentStatus,

    formatAssessmentScores,

    extractUniqueCourseIds

};