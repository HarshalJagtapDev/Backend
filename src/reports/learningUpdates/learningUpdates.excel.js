const XLSX = require("xlsx-js-style");

const {writeAOASheet} = require("../../services/excel.service");

function createWorkbook(
    outputRows,
    outputPath
) {

    const workbook =
        XLSX.utils.book_new();

    writeAOASheet(
        workbook,
        "Learning Updates",
        outputRows
    );

    XLSX.writeFile(
        workbook,
        outputPath
    );
}

module.exports = {
    createWorkbook
};