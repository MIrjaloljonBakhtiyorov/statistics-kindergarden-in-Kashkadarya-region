-- Baseline marker for the existing runtime schema bootstrap.
-- The current full schema is maintained by src/db/initializeSchema.ts while
-- future schema changes should be added as SQL migrations in this folder.
SELECT 1;
