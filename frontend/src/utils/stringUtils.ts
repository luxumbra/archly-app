// 1. Slugify: Converts a string to a URL-friendly slug
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with a dash
    .replace(/^-+|-+$/g, '');  // Remove leading and trailing dashes
}

export function unslugify(slug: string | null): string | null {
  if (!slug) return null
  // Replace hyphens or underscores with spaces
  let result = slug.replace(/[-_]/g, ' ');

  // Capitalize the first letter of each word
  result = result.replace(/\b\w/g, (char) => char.toUpperCase());

  return result;
}

// 2. Capitalize: Capitalize the first letter of a string
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// 3. Truncate: Truncate a string to a certain length and add ellipsis
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// 4. Convert to Underscore: Convert spaces to underscores
export function toUnderscore(str: string): string {
  return str.trim().replace(/\s+/g, '_');
}

// 5. CamelCase to Sentence: Convert camelCase string to sentence case
export function camelToSentence(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')  // Add space before uppercase letters
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')  // Handle abbreviations
    .toLowerCase();
}

// 6. Site Type to Human Readable: Convert database site_type enum to readable text
export function siteTypeToReadable(siteType: string | null): string {
  if (!siteType) return 'Archaeological Site';
  
  const siteTypeMap: { [key: string]: string } = {
    'stone_circle': 'Stone Circle',
    'roman_villa': 'Roman Villa',
    'medieval_castle': 'Medieval Castle',
    'neolithic_monument': 'Neolithic Monument',
    'bronze_age_site': 'Bronze Age Site',
    'iron_age_fort': 'Iron Age Hill Fort',
    'anglo_saxon_site': 'Anglo-Saxon Site',
    'prehistoric_site': 'Prehistoric Site',
    'historic_building': 'Historic Building',
    'archaeological_site': 'Archaeological Site',
    'other': 'Archaeological Site'
  };
  
  return siteTypeMap[siteType] || capitalize(unslugify(siteType) || 'Archaeological Site');
}

// Default export for backward compatibility
const stringUtils = {
  slugify,
  unslugify,
  capitalize,
  truncate,
  toUnderscore,
  camelToSentence,
  siteTypeToReadable,
};

export default stringUtils;