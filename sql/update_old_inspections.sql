-- Update old inspections to set inspection_type based on tractor_number
-- If tractor_number is present and trailer_number is null/empty, it's BOBTAIL
-- If trailer_number is present, it's LOADED (default for old inspections)
UPDATE inspections
SET inspection_type = CASE
  WHEN tractor_number IS NOT NULL AND tractor_number != '' AND (trailer_number IS NULL OR trailer_number = '') THEN 'BOBTAIL'
  ELSE 'LOADED'
END
WHERE inspection_type IS NULL OR inspection_type = '';

-- Also update trailer_type for old inspections based on equipment patterns
-- This is a heuristic - you may need to adjust based on your data
UPDATE inspections
SET trailer_type = CASE
  WHEN trailer_number ~* '^CXT' OR trailer_number ~* '^ABBA' OR trailer_number ~* '^RBX' OR trailer_number ~* '^JGB' THEN 'BOX'
  WHEN trailer_number ~* '^CXC' OR trailer_number ~* '^[A-Z]{4}-\d{6}-\d$' THEN 'CONTAINER'
  WHEN trailer_number ~* '^R\d' THEN 'RABON'
  ELSE 'OTHER'
END
WHERE trailer_type IS NULL OR trailer_type = '';
