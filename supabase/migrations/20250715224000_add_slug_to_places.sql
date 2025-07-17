-- Add slug column to places table
-- This allows places to be found by both Google Place ID and URL-friendly slug

-- Add slug column
ALTER TABLE places ADD COLUMN slug TEXT;

-- Create unique index on slug (excluding deleted records)
CREATE UNIQUE INDEX idx_places_slug ON places (slug) WHERE slug IS NOT NULL AND is_deleted = false;

-- Create index for slug lookups
CREATE INDEX idx_places_slug_lookup ON places (slug) WHERE is_deleted = false;

-- Add constraint to ensure slug format
ALTER TABLE places ADD CONSTRAINT slug_format CHECK (slug IS NULL OR (length(slug) >= 2 AND length(slug) <= 100));

-- Update existing places with slugs based on their names
UPDATE places
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'))
WHERE slug IS NULL AND name IS NOT NULL;

-- Replace spaces with hyphens in slugs
UPDATE places
SET slug = REGEXP_REPLACE(slug, '\s+', '-', 'g')
WHERE slug IS NOT NULL;

-- Remove multiple consecutive hyphens
UPDATE places
SET slug = REGEXP_REPLACE(slug, '-+', '-', 'g')
WHERE slug IS NOT NULL;

-- Remove leading/trailing hyphens
UPDATE places
SET slug = TRIM(BOTH '-' FROM slug)
WHERE slug IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN places.slug IS 'URL-friendly slug for places, generated from the place name';