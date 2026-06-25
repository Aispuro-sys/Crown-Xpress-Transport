-- Agregar columnas faltantes a la tabla inspections

-- Agregar columna equipment_nomenclature
ALTER TABLE inspections 
ADD COLUMN IF NOT EXISTS equipment_nomenclature TEXT;

-- Agregar columna tractor_number
ALTER TABLE inspections 
ADD COLUMN IF NOT EXISTS tractor_number TEXT;

-- Agregar columna container_number
ALTER TABLE inspections 
ADD COLUMN IF NOT EXISTS container_number TEXT;

-- Agregar columna customer_prefix
ALTER TABLE inspections 
ADD COLUMN IF NOT EXISTS customer_prefix TEXT;

-- Agregar columna crown_fleet
ALTER TABLE inspections 
ADD COLUMN IF NOT EXISTS crown_fleet TEXT;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'inspections' 
  AND column_name IN ('equipment_nomenclature', 'tractor_number', 'container_number', 'customer_prefix', 'crown_fleet')
ORDER BY column_name;
