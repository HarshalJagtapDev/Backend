const path = require("path");

const { buildKey, normalizePath } = require("../../utils/normalize.util");

const { readExcel, writeAOASheet } = require("../../services/excel.service");

const { getAllUserPathActivities } = require("../../integrations/udemy/udemy.service");

const { extractLearningPaths } = require("../../utils/learningPath.util");

const { validateData } = require("../../utils/validation.util");
const XLSX = require("xlsx-js-style");

const { formatExcelDate } = require("../../utils/dateFormat.util")

// const AURA_MANDATORY_COLUMNS = [
//     "Harbinger Business Unit", "Employee ID", "Employee Name", "Designation Group",
//     "Designation", "Email", "LP given", "Date of Initiation", "Target Due Date", "Groups", "Remarks"
// ];

async function generateReport(inputFilePath) {
    console.log("STEP 1 - Reading file");

    const employees = readExcel(inputFilePath).map((row) => {
        const normalized = {};

        Object.keys(row).forEach((key) => {
            normalized[key.trim()] = row[key];
        });

        return normalized;
    });

    console.log("STEP 2 - Employees loaded:", employees.length);

    // validateData(employees, AURA_MANDATORY_COLUMNS);

    const udemyRecords = await getAllUserPathActivities();

    console.log("STEP 4 - Udemy records received:", udemyRecords.length);

    const lookup = new Map();
    const minutesLookup = new Map();

    console.log("STEP 5 - Building lookup");

    for (const record of udemyRecords) {
        const key = buildKey(record.user_email, record.path_title);
        lookup.set(key, record.completion_ratio || 0);
        minutesLookup.set(key, record.path_consumed_minutes ?? 0);
    }

    const sections = [];
    let currentSection = [];

    console.log("STEP 6 - Creating report rows");

    for (const row of employees) {
        if (row["Employee ID"] === "Employee ID" || row["Email"] === "Email") {
            if (currentSection.length) sections.push(currentSection);
            currentSection = [];
            continue;
        }
        currentSection.push(row);
    }

    if (currentSection.length) sections.push(currentSection);

    const allUsersSheetData = [];

    for (const section of sections) {
        const lpColumns = [];
        const sampleLP = section[0]["LP given"];
        const learningPaths = extractLearningPaths(sampleLP);
        for (const lp of learningPaths) {
            lpColumns.push(lp);

            lpColumns.push(
                `Path Consumed Minutes (${lp})`
            );
        }
        const isMultiLP = learningPaths.length > 1;
        if (isMultiLP) {
            const headers = [
                "Harbinger Business Unit",
                "Employee ID",
                "Employee Name",
                "Designation Group",
                "Designation",
                "Email",
                "LP given",
                "Date of Initiation",
                "Target Due Date",
                "Groups",
                "Remarks",
                "Average of Learning Path Progress",
                "Total Path Consumed Minutes",
                ...lpColumns,
            ];

            allUsersSheetData.push(headers);

            for (const emp of section) {

                const employeeLP = (emp["LP given"] || "")
                    .toString()
                    .trim()
                    .toUpperCase();

                // Employee has NO Learning Program assigned
                if (
                    !employeeLP ||
                    employeeLP === "NA" ||
                    employeeLP === "N/A"
                ) {
                    allUsersSheetData.push([
                        emp["Harbinger Business Unit"],
                        emp["Employee ID"],
                        emp["Employee Name"],
                        emp["Designation Group"],
                        emp["Designation"],
                        emp["Email"],
                        emp["LP given"],
                        formatExcelDate(emp["Date of Initiation"]),
                        formatExcelDate(emp["Target Due Date"]),
                        emp["Groups"],
                        emp["Remarks"],
                        "NA", // Average Progress
                        "NA", // Total path consume minutes
                        ...learningPaths.flatMap(() => ["NA", "NA"]),
                    ]);

                    continue;
                }

                let total = 0;
                let totalPathConsumedMinutes = 0;
                const lpValues = [];
                const progresses = [];

                for (const lp of learningPaths) {
                    const key = buildKey(emp.Email, lp);

                    const progress = Number(lookup.get(key) ?? 0);

                    const minutes = minutesLookup.get(key) ?? 0;

                    total += progress;
                    totalPathConsumedMinutes += minutes;
                    progresses.push(progress);

                    lpValues.push(progress);
                    lpValues.push(minutes);
                }

                const average =
                    progresses.length
                        ? Number(
                            (
                                total /
                                progresses.length
                            ).toFixed(2)
                        )
                        : "NA";

                allUsersSheetData.push([
                    emp["Harbinger Business Unit"],
                    emp["Employee ID"],
                    emp["Employee Name"],
                    emp["Designation Group"],
                    emp["Designation"],
                    emp["Email"],
                    emp["LP given"],
                    formatExcelDate(emp["Date of Initiation"]),
                    formatExcelDate(emp["Target Due Date"]),
                    emp["Groups"],
                    emp["Remarks"],
                    average,
                    totalPathConsumedMinutes,
                    ...lpValues,
                ]);
            }

            allUsersSheetData.push([]);
            continue;
        }
        // SINGLE Learning Program
        const headers = [
            "Harbinger Business Unit",
            "Employee ID",
            "Employee Name",
            "Designation Group",
            "Designation",
            "Email",
            "LP given",
            "Date of Initiation",
            "Target Due Date",
            "Groups",
            "Remarks",
            "Current Progress",
            "Path Consumed Minutes"
        ];

        allUsersSheetData.push(headers);

        for (const emp of section) {
            const learningPath = (emp["LP given"] || "").toString().trim();

            let progress;
            let pathConsumedMinutes = "NA";

            if (!learningPath || learningPath.toUpperCase() === "NA") {
                progress = "NA";
            } else {
                const key = buildKey(
                    emp.Email,
                    learningPath
                );

                if (!lookup.has(key)) {
                    const matchingEmailRecords = udemyRecords.filter(
                        (r) =>
                            r.user_email &&
                            r.user_email.trim().toLowerCase() ===
                            emp.Email.trim().toLowerCase()
                    );

                    console.log("================================");
                    console.log("NOT FOUND");

                    console.log("Employee Email:");
                    console.log(JSON.stringify(emp.Email));

                    console.log("Employee LP:");
                    console.log(JSON.stringify(learningPath));

                    console.log("Generated Key:");
                    console.log(key);

                    console.log(
                        "Records found for this email:",
                        matchingEmailRecords.length
                    );

                    matchingEmailRecords.forEach((r) => {
                        console.log("-------------------");

                        console.log(
                            "Udemy Email:",
                            JSON.stringify(r.user_email)
                        );

                        console.log(
                            "Udemy LP:",
                            JSON.stringify(r.path_title)
                        );

                        console.log(
                            "LP Equal?",
                            learningPath === r.path_title
                        );

                        console.log(
                            "Normalized LP Equal?",
                            normalizePath(learningPath) ===
                            normalizePath(r.path_title)
                        );

                        console.log(
                            "Lookup Key from Udemy:",
                            buildKey(
                                r.user_email,
                                r.path_title
                            )
                        );
                    });

                    console.log("================================");

                    progress = "Not Found";
                    pathConsumedMinutes = "Not Found";
                } else {
                    progress = lookup.get(key);
                    pathConsumedMinutes = minutesLookup.get(key) ?? 0;
                }
            }

            allUsersSheetData.push([
                emp["Harbinger Business Unit"],
                emp["Employee ID"],
                emp["Employee Name"],
                emp["Designation Group"],
                emp["Designation"],
                emp["Email"],
                emp["LP given"],
                formatExcelDate(emp["Date of Initiation"]),
                formatExcelDate(emp["Target Due Date"]),
                emp["Groups"],
                emp["Remarks"],
                progress,
                pathConsumedMinutes
            ]);
        }

        allUsersSheetData.push([]);
    }

    // ======================================================
    // CLEAN DATA FOR SUMMARY
    // ======================================================

    const summaryMap = new Map();

    let currentColumnMapForSummary = {};

    for (const row of allUsersSheetData) {

        // Detect section header
        if (
            Array.isArray(row) &&
            row.length &&
            row[0] === "Harbinger Business Unit"
        ) {

            currentColumnMapForSummary = {};

            row.forEach((header, index) => {
                currentColumnMapForSummary[header] = index;
            });

            continue;
        }

        if (!Array.isArray(row) || row.length === 0) {
            continue;
        }

        const GROUP_IDX =
            currentColumnMapForSummary["Groups"];

        const LP_IDX =
            currentColumnMapForSummary["LP given"];

        const PROGRESS_IDX =
            currentColumnMapForSummary["Current Progress"] ??
            currentColumnMapForSummary[
            "Average of Learning Path Progress"
            ];

        const PATH_MINUTES_IDX =
            currentColumnMapForSummary["Path Consumed Minutes"];

        const TOTAL_PATH_MINUTES_IDX =
            currentColumnMapForSummary["Total Path Consumed Minutes"];

        const group = (row[GROUP_IDX] || "")
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean)
            .join(", ");
        const lp = row[LP_IDX];
        const lpValue = (lp || "")
            .toString()
            .trim()
            .toUpperCase();

        if (
            !group ||
            !lpValue ||
            lpValue === "NA" ||
            lpValue === "N/A"
        ) {
            continue;
        }

        // const progressRaw = (row[PROGRESS_IDX] || "")
        //     .toString()
        //     .trim();
        const progressRaw = String(row[PROGRESS_IDX] ?? "").trim();

        const progressUpper =
            progressRaw.toUpperCase();

        const isValidProgress =
            progressRaw !== "" &&
            progressUpper !== "NA" &&
            progressUpper !== "N/A" &&
            progressUpper !== "NOT FOUND";

        const progress =
            isValidProgress
                ? Number(progressRaw)
                : null;

        let pathConsumedMinutes = 0;

        if (
            TOTAL_PATH_MINUTES_IDX !== undefined
        ) {
            pathConsumedMinutes = Number(
                row[TOTAL_PATH_MINUTES_IDX] ?? 0
            );
        } else if (
            PATH_MINUTES_IDX !== undefined
        ) {
            pathConsumedMinutes = Number(
                row[PATH_MINUTES_IDX] ?? 0
            );
        }
        //         console.log(
        //             "SUMMARY CHECK",
        //             {
        //                 progressRaw,
        //                 progress,
        //                 pathConsumedMinutes
        //             }
        // );
        const key = group;

        if (!summaryMap.has(key)) {
            summaryMap.set(key, {
                group,
                learningPaths: new Set(),
                initiated: 0,
                inProgress: 0,
                completed: 0,
                notCompleted: 0,
            });
        }

        const record = summaryMap.get(key);

        record.learningPaths.add(lp);

        // Initiated
        record.initiated += 1;
        //console.log("Progress data ", { group, progress, pathConsumedMinutes });
        if (progress !== null) {

            // Completed
            if (progress === 100) {
                record.completed += 1;
            }

            // In Progress
            else if (
                progress > 0 &&
                progress < 100
            ) {
                record.inProgress += 1;
            }

            // Started but still 0%
            else if (
                progress === 0 &&
                pathConsumedMinutes > 0
            ) {
                record.inProgress += 1;
            }

            // Never started
            else if (
                progress === 0 &&
                pathConsumedMinutes === 0
            ) {
                record.notCompleted += 1;
            }
        }
    }
    const summarySheetData = [
        [
            "Groups",
            "AURA 2.0 Learning Paths assigned",
            "Initiated",
            "In progress",
            "Completed",
            "Not Completed",
            "Completion %",
        ],
    ];

    let totalInitiated = 0;
    let totalCompleted = 0;
    let totalInprogress = 0;
    let totalNotCompleted = 0;
    for (const value of summaryMap.values()) {
        totalInitiated += value.initiated;
        totalCompleted += value.completed;
        totalInprogress += value.inProgress;
        totalNotCompleted += value.notCompleted;

        summarySheetData.push([
            value.group,
            Array.from(value.learningPaths).join("\n"),
            value.initiated,
            value.inProgress,
            value.completed,
            value.notCompleted,
            '',
        ]);
    }

    const overallCompletion =
        totalInitiated > 0
            ? Number(((totalCompleted / totalInitiated) * 100).toFixed(2))
            : 0;

    summarySheetData.push([]);

    summarySheetData.push([
        "OVERALL",
        "",
        totalInitiated,
        totalInprogress,
        totalCompleted,
        totalNotCompleted,
        overallCompletion,
    ]);

    // ======================================================
    // CORE / DPU SHEETS
    // ======================================================

    const CORE_DPU_HEADERS = [
        "Harbinger Business Unit",
        "Employee ID",
        "Employee Name",
        "Designation Group",
        "Designation",
        "Email",
        "LP given",
        "Date of Initiation",
        "Target Due Date",
        "Groups",
        "Remarks",
        "Current Progress",
    ];

    // Find header rows dynamically
    const allHeaderRows = allUsersSheetData.filter(
        (row) =>
            Array.isArray(row) &&
            row.length &&
            row[0] === "Harbinger Business Unit"
    );

    // Create normalized rows
    const normalizedRows = [];

    let currentColumnMap = {};

    for (const row of allUsersSheetData) {

        if (
            Array.isArray(row) &&
            row.length &&
            row[0] === "Harbinger Business Unit"
        ) {

            currentColumnMap = {};

            row.forEach((header, index) => {
                currentColumnMap[header] = index;
            });

            continue;
        }

        if (!Array.isArray(row) || row.length === 0) {
            continue;
        }

        const progressIndex =
            currentColumnMap[
            "Average of Learning Path Progress"
            ] ?? currentColumnMap["Current Progress"];

        normalizedRows.push({
            bu:
                row[
                currentColumnMap[
                "Harbinger Business Unit"
                ]
                ],

            values: [
                row[currentColumnMap["Harbinger Business Unit"]],
                row[currentColumnMap["Employee ID"]],
                row[currentColumnMap["Employee Name"]],
                row[currentColumnMap["Designation Group"]],
                row[currentColumnMap["Designation"]],
                row[currentColumnMap["Email"]],
                row[currentColumnMap["LP given"]],
                row[currentColumnMap["Date of Initiation"]],
                row[currentColumnMap["Target Due Date"]],
                row[currentColumnMap["Groups"]],
                row[currentColumnMap["Remarks"]],
                row[progressIndex],
            ],
        });
    }

    const coreRows = normalizedRows
        .filter((r) => r.bu === "Core")
        .map((r) => r.values);

    const dpuRows = normalizedRows
        .filter(
            (r) =>
                r.bu === "Digital Publishing(DP)"
        )
        .map((r) => r.values);

    // ======================================================
    // WRITE FILE
    // ======================================================

    const dateStr = new Date().toISOString().split('T')[0];
    const outputPath = path.join(
        process.cwd(),
        "generated",
        `Aura_Report_${dateStr}.xlsx`
    );

    const workbook = XLSX.utils.book_new();

    writeAOASheet(
        workbook,
        "All Users VS LP Progress",
        allUsersSheetData
    );

    writeAOASheet(
        workbook,
        "Summary",
        summarySheetData
    );

    writeAOASheet(workbook, "CORE", [
        CORE_DPU_HEADERS,
        ...coreRows,
    ]);

    writeAOASheet(workbook, "DPU", [
        CORE_DPU_HEADERS,
        ...dpuRows,
    ]);

    XLSX.writeFile(workbook, outputPath);
    console.log("STEP 8 - Excel written:", outputPath);
    return outputPath;
}

module.exports = {
    generateReport,
};