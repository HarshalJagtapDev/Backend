const {
    getValidGradeItems,
    getAssignmentStatus
} = require("./academy.helper");

/**
 * =====================================================
 * Build Course Contents Map
 * =====================================================
 *
 * Structure
 *
 * {
 *    courseId: [
 *      {
 *          section,
 *          title,
 *          type
 *      }
 *    ]
 * }
 */

function buildCourseContentsMap(courseContents = []) {

    const map = {};

    for (const course of courseContents) {

        const modules = [];

        for (const section of (course.data || [])) {

            for (const module of (section.modules || [])) {

                modules.push({

                    section: section.name,

                    title: module.name,

                    type: module.modname

                });

            }

        }
        // console.log("buildCourseContentsMap modules", modules)
        map[course.courseId] = modules;
        // console.log("buildCourseContentsMap map", map)
    }

    return map;
}

/**
 * =====================================================
 * Build Course User Map
 * =====================================================
 *
 * Structure
 *
 * {
 *    courseId:{
 *        email : userId
 *    }
 * }
 */

function buildCourseUserMap(courseUsers = []) {

    const map = {};

    for (const course of courseUsers) {

        map[course.courseId] = {};

        for (const user of (course.data || [])) {

            if (!user.email) {
                continue;
            }

            map[course.courseId][
                user.email.trim().toLowerCase()
            ] = user.id;

        }

    }
    // console.log("Course user map", map);
    return map;

}

/**
 * =====================================================
 * Build Course Grades Map
 * =====================================================
 *
 * Structure
 *
 * {
 *    courseId:{
 *
 *       userId:[
 *
 *          {
 *              assessmentName,
 *              assessmentType,
 *              score,
 *              graderaw,
 *              gradedatesubmitted,
 *              gradedategraded
 *          }
 *
 *       ]
 *
 *    }
 * }
 */

function buildCourseGradesMap(courseGrades = []) {

    const map = {};

    for (const course of courseGrades) {

        map[course.courseId] = {};

        const userGrades =
            course.data?.usergrades || [];

        for (const user of userGrades) {

            const validItems =
                getValidGradeItems(
                    user.gradeitems
                );

            map[course.courseId][user.userid] =
                validItems.map(item => ({

                    assessmentName:
                        item.itemname,

                    assessmentType:
                        item.itemmodule,

                    score:
                        item.percentageformatted,

                    graderaw:
                        item.graderaw,

                    gradedatesubmitted:
                        item.gradedatesubmitted,

                    gradedategraded:
                        item.gradedategraded,

                    assignmentStatus:
                        getAssignmentStatus(item)

                }));
        }

    }
    // console.log('buildCourseGradesMap map', map)
    return map;

}

/**
 * =====================================================
 * Build Academy Lookup
 * =====================================================
 */

function buildAcademyLookup(rawAcademyData) {

    return {

        courseContentsMap:
            buildCourseContentsMap(
                rawAcademyData.courseContents
            ),

        courseUserMap:
            buildCourseUserMap(
                rawAcademyData.courseUsers
            ),

        courseGradesMap:
            buildCourseGradesMap(
                rawAcademyData.courseGrades
            )

    };

}

module.exports = {

    buildCourseContentsMap,

    buildCourseUserMap,

    buildCourseGradesMap,

    buildAcademyLookup

};