function formatExcelDate(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue);
     console.log(
        "Input:", dateValue,
        "| Output:", date,
        "| Is Date:", date instanceof Date
    )

    if (isNaN(date.getTime())) {
        return dateValue;
    }

    return date;
}
module.exports = {
    formatExcelDate
}