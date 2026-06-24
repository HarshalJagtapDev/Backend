function buildSkillForgeLookup(records) {
    // console.log("Records =>", records);
    const lookup = new Map();

    for (const row of records) {
        const email = (row["Employee Email"] || "").trim().toLowerCase();
        const key = `${email}|${row["Request Number"]}`;

        if (!lookup.has(key)) {
            lookup.set(key, []);
        }
        lookup.get(key).push(row);
    }
    // console.log("skill forge lookup =>", lookup);
    return lookup;
}

function extractUniqueCourseIds(records) {

    return [
        ...new Set(
            records
                .map(r => r["Course ID"])
                .filter(Boolean)
        )
    ];
}

module.exports = {
    buildSkillForgeLookup,
    extractUniqueCourseIds
};