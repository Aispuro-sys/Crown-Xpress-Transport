-- Actualizar constraint employees_role_check para incluir 'supervisor'
-- Eliminar constraint existente
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_role_check;

-- Crear nueva constraint con todos los roles válidos
ALTER TABLE employees 
ADD CONSTRAINT employees_role_check 
CHECK (role IN ('operator','guard','inspector','supervisor','admin'));
