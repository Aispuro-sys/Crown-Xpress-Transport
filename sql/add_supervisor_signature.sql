-- Add supervisor signature columns to inspections table
ALTER TABLE inspections 
ADD COLUMN IF NOT EXISTS supervisor_signature TEXT,
ADD COLUMN IF NOT EXISTS supervisor_signed_at TIMESTAMP;

-- Add comment to document the purpose
COMMENT ON COLUMN inspections.supervisor_signature IS 'Supervisor name and signature data';
COMMENT ON COLUMN inspections.supervisor_signed_at IS 'Timestamp when supervisor signed the inspection';
