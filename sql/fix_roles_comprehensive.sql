-- Script completo para arreglar roles y crear constraint
-- Paso 1: Ver todos los roles existentes
SELECT role, COUNT(*) as count 
FROM employees 
GROUP BY role 
ORDER BY role;

-- Paso 2: Actualizar usuarios con rol 'inspector' a 'supervisor'
UPDATE employees 
SET role = 'supervisor' 
WHERE role = 'inspector';

-- Paso 3: Actualizar cualquier otro rol inválido a 'guard' (o revisar manualmente)
-- Si hay roles como 'auditor' u otros, actualizarlos
UPDATE employees 
SET role = 'supervisor' 
WHERE role NOT IN ('operator','guard','supervisor','admin');

-- Paso 4: Eliminar constraint existente
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_role_check;

-- Paso 5: Crear nueva constraint
ALTER TABLE employees 
ADD CONSTRAINT employees_role_check 
CHECK (role IN ('operator','guard','supervisor','admin'));

-- Paso 6: Verificar cambios finales
SELECT role, COUNT(*) as count 
FROM employees 
GROUP BY role 
ORDER BY role;
