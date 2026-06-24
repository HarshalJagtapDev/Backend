function buildSkillForgePayload(employees) {

    return employees.map(emp => ({
        emp_email: emp["Email ID"],
        request_number: emp["Learning Request Number"]
    }));
}

module.exports = {
    buildSkillForgePayload
};