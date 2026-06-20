const axios = require("axios");
// const mockResponse =
// require("../../mocks/skillforge-response.json");
const {
    buildSkillForgePayload
} = require("./skillForge.helper");

/**
 * Actual API Call
 */
async function getCourseReport(payload) {

    try {

        const response = await axios.post(
            `${process.env.SKILLFORGE_URL}/api/external/course-report`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key":
                        process.env.SKILLFORGE_API_KEY
                }
            }
        );

        return response.data?.data || [];

    } catch (error) {

        console.log(
            "Skill Forge Error:",
            error.response?.data ||
            error.message
        );

        throw error;
    }
}

/**
 * Report Layer Entry Point
 */
async function fetchSkillForgeData(
    employees
) {

    // return mockResponse;
    const payload =
        buildSkillForgePayload(
            employees
        );

    console.log(
        "Calling Skill Forge..."
    );

    const records =
        await getCourseReport(
            payload
        );

    console.log(
        "Skill Forge Records:",
        records.length
    );

    return records;
}

module.exports = {
    getCourseReport,
    fetchSkillForgeData
};