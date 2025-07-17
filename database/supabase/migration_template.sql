-- Migration: [Description]
-- Date: [YYYY-MM-DD]
-- Purpose: [Brief description of what this migration does]

-- Example migration structure:

-- 1. Schema changes (if any)
-- ALTER TABLE example_table ADD COLUMN IF NOT EXISTS new_column TEXT;

-- 2. Function updates (if any)
-- CREATE OR REPLACE FUNCTION example_function()
-- RETURNS void
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--     -- Function body
-- END;
-- $$;

-- 3. Data migrations (if any)
-- UPDATE example_table SET new_column = 'default_value' WHERE new_column IS NULL;

-- 4. Index updates (if any)
-- CREATE INDEX IF NOT EXISTS idx_example ON example_table (new_column);

-- 5. RLS policy updates (if any)
-- DROP POLICY IF EXISTS old_policy ON example_table;
-- CREATE POLICY new_policy ON example_table FOR SELECT USING (condition);

-- Migration notes:
-- - Always use IF NOT EXISTS / IF EXISTS where appropriate
-- - Use CREATE OR REPLACE for functions
-- - Test migrations on development data first
-- - Keep migrations focused and atomic