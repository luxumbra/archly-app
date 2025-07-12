// 1. Slugify: Converts a string to a URL-friendly slug
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with a dash
    .replace(/^-+|-+$/g, '');  // Remove leading and trailing dashes
}

function unslugify(slug) {
  if (!slug) return null
  // Replace hyphens or underscores with spaces
  let result = slug.replace(/[-_]/g, ' ');

  // Capitalize the first letter of each word
  result = result.replace(/\b\w/g, (char) => char.toUpperCase());

  return result;
}

// 2. Capitalize: Capitalize the first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// 3. Truncate: Truncate a string to a certain length and add ellipsis
function truncate(str, length) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// 4. Convert to Underscore: Convert spaces to underscores
function toUnderscore(str) {
  return str.trim().replace(/\s+/g, '_');
}

// 5. CamelCase to Sentence: Convert camelCase string to sentence case
function camelToSentence(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')  // Add space before uppercase letters
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')  // Handle abbreviations
    .toLowerCase();
}

// Export all utility functions
module.exports = {
  slugify,
  unslugify,
  capitalize,
  truncate,
  toUnderscore,
  camelToSentence,
};
