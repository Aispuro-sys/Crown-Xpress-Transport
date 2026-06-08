-- =====================================================
-- TABLA DE OPERADORES PARA CROWN XPRESS TRANSPORT
-- Ejecutar en Neon PostgreSQL
-- =====================================================

-- Crear tabla de operadores
CREATE TABLE IF NOT EXISTS operators (
    id SERIAL PRIMARY KEY,
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50),
    license_expiry DATE,
    phone VARCHAR(20),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsqueda rápida por número de empleado
CREATE INDEX IF NOT EXISTS idx_operators_employee_number ON operators(employee_number);
CREATE INDEX IF NOT EXISTS idx_operators_status ON operators(status);

-- =====================================================
-- DATOS DE EJEMPLO - 20 OPERADORES
-- =====================================================

INSERT INTO operators (employee_number, full_name, license_number, license_expiry, phone, status) VALUES
('EMP001', 'JUAN CARLOS RODRIGUEZ MARTINEZ', 'CDL-TX-123456', '2027-06-15', '956-555-0101', 'active'),
('EMP002', 'MIGUEL ANGEL HERNANDEZ LOPEZ', 'CDL-TX-234567', '2026-12-20', '956-555-0102', 'active'),
('EMP003', 'JOSE LUIS GARCIA SANCHEZ', 'CDL-TX-345678', '2027-03-10', '956-555-0103', 'active'),
('EMP004', 'FRANCISCO JAVIER MARTINEZ PEREZ', 'CDL-TX-456789', '2026-09-25', '956-555-0104', 'active'),
('EMP005', 'ROBERTO CARLOS GONZALEZ RAMIREZ', 'CDL-TX-567890', '2027-08-30', '956-555-0105', 'active'),
('EMP006', 'CARLOS ALBERTO LOPEZ FERNANDEZ', 'CDL-TX-678901', '2026-11-15', '956-555-0106', 'active'),
('EMP007', 'PEDRO ANTONIO SANCHEZ TORRES', 'CDL-TX-789012', '2027-02-28', '956-555-0107', 'active'),
('EMP008', 'DAVID ALEJANDRO RAMIREZ CRUZ', 'CDL-TX-890123', '2026-10-05', '956-555-0108', 'active'),
('EMP009', 'JORGE EDUARDO FLORES MENDOZA', 'CDL-TX-901234', '2027-05-20', '956-555-0109', 'active'),
('EMP010', 'MANUEL ANTONIO DIAZ VARGAS', 'CDL-TX-012345', '2026-08-12', '956-555-0110', 'active'),
('EMP011', 'RICARDO ENRIQUE MORALES SILVA', 'CDL-TX-112233', '2027-07-18', '956-555-0111', 'active'),
('EMP012', 'FERNANDO JOSE CASTRO REYES', 'CDL-TX-223344', '2026-04-22', '956-555-0112', 'active'),
('EMP013', 'ALBERTO MANUEL ORTIZ RUIZ', 'CDL-TX-334455', '2027-01-08', '956-555-0113', 'active'),
('EMP014', 'SERGIO IVAN JIMENEZ AGUILAR', 'CDL-TX-445566', '2026-06-30', '956-555-0114', 'active'),
('EMP015', 'ANTONIO RAFAEL ROMERO NAVARRO', 'CDL-TX-556677', '2027-09-14', '956-555-0115', 'active'),
('EMP016', 'LUIS MIGUEL HERRERA MEDINA', 'CDL-TX-667788', '2026-03-25', '956-555-0116', 'active'),
('EMP017', 'OSCAR DANIEL VEGA DOMINGUEZ', 'CDL-TX-778899', '2027-04-11', '956-555-0117', 'active'),
('EMP018', 'RAUL ERNESTO GUERRERO SOTO', 'CDL-TX-889900', '2026-07-08', '956-555-0118', 'active'),
('EMP019', 'HECTOR ARMANDO DELGADO RIOS', 'CDL-TX-990011', '2027-10-22', '956-555-0119', 'active'),
('EMP020', 'VICTOR HUGO ESPINOZA LUNA', 'CDL-TX-001122', '2026-05-17', '956-555-0120', 'active');

-- =====================================================
-- VERIFICAR DATOS INSERTADOS
-- =====================================================
-- SELECT * FROM operators ORDER BY employee_number;
