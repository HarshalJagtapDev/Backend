function buildHeaders(selectedColumns, COLUMN_MAP) {
    console.log("SELECTED COLUMNS ", selectedColumns);
    console.log("COLUMN MAP", COLUMN_MAP)
    return selectedColumns.map(
        column => COLUMN_MAP[column].header
    );

}

module.exports = {
    buildHeaders
};