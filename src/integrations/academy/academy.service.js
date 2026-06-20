const axios = require("axios");

const {
    buildAcademyLookup
} = require("./academy.mapper");

const BATCH_SIZE =
    Number(process.env.MOODLE_BATCH_SIZE || 5);

const client = axios.create({
    baseURL: process.env.ACADEMY_URL,
    timeout: 60000
});

/**
 * =========================================
 * Generic Moodle Call
 * =========================================
 */
async function callMoodle(wsfunction, params = {}) {

    const response =
        await client.get(
            "/webservice/rest/server.php",
            {
                params: {
                    wstoken: process.env.ACADEMY_TOKEN,
                    moodlewsrestformat: "json",
                    wsfunction,
                    ...params
                }
            }
        );
    // console.log("Response", response.data);
    return response.data;
}

/**
 * =========================================
 * API 1: Course Contents
 * =========================================
 */
async function getCourseContents(courseId) {

    return callMoodle(
        "core_course_get_contents",
        { courseid: courseId }
    );
}

/**
 * =========================================
 * API 2: Enrolled Users
 * =========================================
 */
async function getEnrolledUsers(courseId) {

    return callMoodle(
        "core_enrol_get_enrolled_users",
        { courseid: courseId }
    );
}

/**
 * =========================================
 * API 3: Grades
 * =========================================
 */
async function getGrades(courseId) {

    return callMoodle(
        "gradereport_user_get_grade_items",
        { courseid: courseId }
    );
}

/**
 * =========================================
 * Batch Executor
 * =========================================
 */
async function runBatches(items, batchSize, fn) {

    const result = [];

    for (let i = 0; i < items.length; i += batchSize) {

        const batch = items.slice(i, i + batchSize);

        const batchResult =
            await Promise.all(
                batch.map(fn)
            );

        result.push(...batchResult);
    }

    return result;
}

/**
 * =========================================
 * MAIN FUNCTION
 * =========================================
 */
async function getAcademyData(courseIds) {
    console.log("getAcademyData courseIds", courseIds);
    const courseContents = [];
    const courseUsers = [];
    const courseGrades = [];

    await runBatches(
        courseIds,
        BATCH_SIZE,
        async (courseId) => {

            try {

                const [
                    contents,
                    users,
                    grades
                ] = await Promise.all([
                    getCourseContents(courseId),
                    getEnrolledUsers(courseId),
                    getGrades(courseId)
                ]);

                // console.log("Academy contents =>", contents);
                // console.log("Academy users =>", users);
                // console.log("Academy grades =>", JSON.stringify(grades, null, 4));

                /**
                 * IMPORTANT:
                 * Keep RAW structure as mapper expects it
                 */
                courseContents.push({
                    courseId,
                    data: contents
                });

                courseUsers.push({
                    courseId,
                    data: users
                });

                courseGrades.push({
                    courseId,
                    data: grades
                });

            } catch (err) {

                console.error(
                    "Academy Error:",
                    courseId,
                    err.response?.data || err.message
                );

                courseContents.push({
                    courseId,
                    data: []
                });

                courseUsers.push({
                    courseId,
                    data: []
                });

                courseGrades.push({
                    courseId,
                    data: { usergrades: [] }
                });
            }
        }
    );

    // console.log("courseContents", courseContents);
    // console.log("courseUsers", courseUsers);
    // console.log("courseGrades", courseGrades);

    /**
     * SINGLE RESPONSIBILITY:
     * Just return raw data to mapper
     */
    return buildAcademyLookup({
        courseContents,
        courseUsers,
        courseGrades
    });
}

module.exports = {
    getAcademyData
};