const academyConfig = {
  baseUrl: process.env.MOODLE_BASE_URL,
  token: process.env.MOODLE_TOKEN,

  batchSize: 5,

  wsFunctions: {
    courseContents: "core_course_get_contents",
    enrolledUsers: "core_enrol_get_enrolled_users",
    grades: "gradereport_user_get_grade_items"
  }
};

module.exports = academyConfig;