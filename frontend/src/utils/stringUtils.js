function convertToUnderscore(str) {
  return str.trim().replace(/\s+/g, '_');
}

export { convertToUnderscore };