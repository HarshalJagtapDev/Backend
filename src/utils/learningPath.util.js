
function extractLearningPaths(lpValue) {
  if (!lpValue) {
    return [];
  }

  const text = lpValue
    .toString()
    .replace(/\r/g, "")
    .trim();

  // Only treat as multi-LP if it starts with numbering
  if (!/^\s*1\./.test(text)) {
    return [text];
  }

  return text
    .split(/\n?\s*\d+\.\s+/)
    .map((lp) => lp.trim())
    .filter(Boolean);
}

module.exports = {
  extractLearningPaths,
};