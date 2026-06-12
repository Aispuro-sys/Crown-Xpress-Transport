-- =====================================================
-- AGREGAR COLUMNA PASSWORD A LA TABLA EMPLOYEES
-- Ejecutar en Neon PostgreSQL
-- =====================================================

-- Agregar columna password si no existe
ALTER TABLE employees ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Actualizar contraseñas existentes con un valor por defecto (cambiar después)
UPDATE employees SET password = 'changeme123' WHERE password IS NULL;

-- Verificar la estructura de la tabla
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employees';
