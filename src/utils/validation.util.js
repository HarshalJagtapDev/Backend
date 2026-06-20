function validateData(employees, mandatoryColumns) {
    if (!employees || !employees.length) {
        throw new Error("Input file is empty or missing data rows.");
    }

    const errors = [];
    const missingColumns = new Set();
    const headers = Object.keys(employees[0]).map(h => h.trim());

    // 1. Check for missing mandatory columns
    for (const col of mandatoryColumns) {
        if (!headers.includes(col)) {
            missingColumns.add(col);
        }
    }

    if (missingColumns.size > 0) {
        errors.push(`Missing mandatory columns: ${Array.from(missingColumns).join(", ")}`);
    }

    // 2. If no missing columns, check for missing data in mandatory columns
    if (errors.length === 0) {
        const columnsWithMissingData = new Set();

        employees.forEach((row) => {
            for (const col of mandatoryColumns) {
                const val = row[col];
                // Check if value is undefined, null, or empty string (after trimming)
                if (val === undefined || val === null || val.toString().trim() === "") {
                    columnsWithMissingData.add(col);
                }
            }
        });

        if (columnsWithMissingData.size > 0) {
            errors.push(`Missing data in columns: ${Array.from(columnsWithMissingData).join(", ")}`);
        }
    }

    if (errors.length > 0) {
        const error = new Error("Validation Failed");
        error.validationErrors = errors;
        error.isValidationError = true;
        throw error;
    }
}

module.exports = {
    validateData
};
