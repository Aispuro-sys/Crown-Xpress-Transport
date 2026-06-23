-- Verify and add signature columns if they don't exist
-- Run this script to ensure all signature columns are present

-- Operator signature columns
ALTER TABLE inspections
ADD COLUMN IF NOT EXISTS operator_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS operator_signature TEXT;

-- Supervisor name column (supervisor_signature and supervisor_signed_at should already exist)
ALTER TABLE inspections
ADD COLUMN IF NOT EXISTS supervisor_name VARCHAR(255);
