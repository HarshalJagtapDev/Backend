const path = require("path");

const {
    readExcel
} = require("../../services/excel.service");

const {
    fetchSkillForgeData
} = require("../../integrations/skillForge/skillForge.service");

const {
    buildSkillForgeLookup,
    extractUniqueCourseIds
} = require("../../integrations/skillForge/skillForge.mapper");

const {
    generateOutputRows
} = require("./learningUpdates.mapper");

const {
    createWorkbook
} = require("./learningUpdates.excel");

const {
    getAcademyData
} = require("../../integrations/academy/academy.service");

async function generateReport(
    inputFilePath
) {

    console.log(
        "STEP 1 - Reading Input File"
    );

    const employees =
        readExcel(inputFilePath);

    if (!employees.length) {
        throw new Error(
            "Input file is empty"
        );
    }

    console.log(
        "Employees Loaded:",
        employees.length
    );

    /**
     * Skill Forge
     */
    const skillForgeData =
        await fetchSkillForgeData(
            employees
        );

    const skillForgeLookup =
        buildSkillForgeLookup(
            skillForgeData
        );

    /**
     * Academy
     * (Coming Next)
     */
    const uniqueCourseIds =
        extractUniqueCourseIds(
            skillForgeData
        );

    console.log(
        "Unique Course IDs:",
        uniqueCourseIds.length
    );

    const academyData =
        await getAcademyData(
            uniqueCourseIds
        );

    /**
     * Output Rows
     */
    const outputRows = generateOutputRows({
        skillForgeRecords: skillForgeLookup,
        academyLookup: academyData,
        employeeRecords: employees
    });

    /**
     * Output File
     */
    const dateStr = new Date().toISOString().split('T')[0];
    const outputPath = path.join(
        process.cwd(),
        "generated",
        `Learning_Updates_${dateStr}.xlsx`
    );

    createWorkbook(
        outputRows,
        outputPath
    );

    console.log(
        "Report Generated:",
        outputPath
    );

    return outputPath;
}

module.exports = {
    generateReport
};