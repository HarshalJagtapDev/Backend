function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

// function normalizePath(path = "") {
//   return path.trim().toLowerCase();
// }

function normalizePath(path = "") {
  return path
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[–—]/g, "-");
}

function buildKey(email, path) {
  return `${normalizeEmail(email)}|${normalizePath(path)}`;
}

module.exports = {
  normalizeEmail,
  normalizePath,
  buildKey,
};