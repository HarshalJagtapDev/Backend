const auraReport2 =
    require("../aura2/auraReport.service");

const learningUpdatesReport =
    require("../learningUpdates/learningUpdates.service");

function getReportGenerator(
    reportType
) {

    switch (reportType) {

        case "aura2":
            return auraReport2;

        case "learningUpdates":
            return learningUpdatesReport;

        default:
            throw new Error(
                `Unsupported report type: ${reportType}`
            );
    }
}

module.exports = {
    getReportGenerator
};