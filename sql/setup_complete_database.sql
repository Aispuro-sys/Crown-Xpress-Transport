-- =====================================================
-- CROWN XPRESS TRANSPORT - SETUP COMPLETO DE BASE DE DATOS
-- Ejecutar en Neon PostgreSQL
-- =====================================================
-- Este script combina todos los esquemas y datos necesarios
-- para el sistema de inspección de 20 puntos

-- =====================================================
-- EXTENSIONES REQUERIDAS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA DE LOCATIONS (YARDAS)
-- =====================================================
CREATE TABLE IF NOT EXISTS locations (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL UNIQUE,
    address         VARCHAR(255),
    active          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar yardas iniciales
INSERT INTO locations (id, name, active) VALUES
(1, 'Yard A - Laredo', true),
(2, 'Yard B - El Paso', true),
(3, 'Yard C - Dallas', true),
(4, 'Yard D - Houston', true),
(5, 'Yard E - San Antonio', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- TABLA DE USERS (EMPLOYEES)
-- Renombrada de users a employees para mantener consistencia con el código
-- =====================================================
CREATE TABLE IF NOT EXISTS employees (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(60)  UNIQUE,
    password_hash   VARCHAR(255),
    full_name       VARCHAR(120) NOT NULL,
    email           VARCHAR(120),
    role            VARCHAR(20)  NOT NULL DEFAULT 'operator'
                    CHECK (role IN ('operator','guard','inspector','auditor','admin')),
    location_id     INT REFERENCES locations(id) ON DELETE SET NULL,
    location_name   VARCHAR(120),
    active          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(active);

-- =====================================================
-- TABLA DE OPERADORES (ADICIONAL PARA OPERADORES DE CAMIONES)
-- =====================================================
CREATE TABLE IF NOT EXISTS operators (
    id SERIAL PRIMARY KEY,
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50),
    license_expiry DATE,
    phone VARCHAR(20),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operators_employee_number ON operators(employee_number);
CREATE INDEX IF NOT EXISTS idx_operators_status ON operators(status);

-- Insertar operadores de ejemplo
INSERT INTO operators (employee_number, full_name, license_number, license_expiry, phone, status) VALUES
('EMP001', 'JUAN CARLOS RODRIGUEZ MARTINEZ', 'CDL-TX-123456', '2027-06-15', '956-555-0101', 'active'),
('EMP002', 'MIGUEL ANGEL HERNANDEZ LOPEZ', 'CDL-TX-234567', '2026-12-20', '956-555-0102', 'active'),
('EMP003', 'JOSE LUIS GARCIA SANCHEZ', 'CDL-TX-345678', '2027-03-10', '956-555-0103', 'active'),
('EMP004', 'FRANCISCO JAVIER MARTINEZ PEREZ', 'CDL-TX-456789', '2026-09-25', '956-555-0104', 'active'),
('EMP005', 'ROBERTO CARLOS GONZALEZ RAMIREZ', 'CDL-TX-567890', '2027-08-30', '956-555-0105', 'active')
ON CONFLICT (employee_number) DO NOTHING;

-- =====================================================
-- TABLA DE YARDS (GESTIÓN DE YARDAS CON CAPACIDADES)
-- =====================================================
CREATE TABLE IF NOT EXISTS yards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('PHYSICAL', 'VIRTUAL')),
  description TEXT,
  address TEXT,
  max_trailers INTEGER DEFAULT 0,
  max_trucks INTEGER DEFAULT 0,
  max_boxes INTEGER DEFAULT 0,
  max_platforms INTEGER DEFAULT 0,
  max_machinery INTEGER DEFAULT 0,
  min_trailers INTEGER DEFAULT 0,
  min_trucks INTEGER DEFAULT 0,
  min_boxes INTEGER DEFAULT 0,
  min_platforms INTEGER DEFAULT 0,
  min_machinery INTEGER DEFAULT 0,
  current_trailers INTEGER DEFAULT 0,
  current_trucks INTEGER DEFAULT 0,
  current_boxes INTEGER DEFAULT 0,
  current_platforms INTEGER DEFAULT 0,
  current_machinery INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar yardas iniciales
INSERT INTO yards (name, code, type, description, max_trailers, max_trucks, max_boxes, max_platforms, min_trailers, min_trucks, min_boxes, min_platforms) VALUES
('Yard A - Laredo', 'YDA', 'PHYSICAL', 'Main yard in Laredo, TX', 50, 30, 100, 20, 10, 5, 20, 5),
('Yard B - El Paso', 'YDB', 'PHYSICAL', 'Secondary yard in El Paso, TX', 30, 20, 60, 15, 5, 3, 12, 3),
('Yard C - Dallas', 'YDC', 'PHYSICAL', 'Yard in Dallas, TX', 40, 25, 80, 18, 8, 4, 16, 4),
('Yard D - Houston', 'YDH', 'PHYSICAL', 'Yard in Houston, TX', 35, 22, 70, 16, 6, 3, 14, 3),
('Yard E - San Antonio', 'YDS', 'PHYSICAL', 'Yard in San Antonio, TX', 25, 15, 50, 12, 4, 2, 10, 2),
('Virtual Yard 1', 'VY1', 'VIRTUAL', 'Virtual yard for overflow management', 100, 60, 200, 40, 20, 10, 40, 8),
('Virtual Yard 2', 'VY2', 'VIRTUAL', 'Virtual yard for peak hours', 80, 50, 160, 32, 16, 8, 32, 6)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- TABLA DE YARD ASSIGNMENTS (ASIGNACIÓN DE YARDAS A GUARDIAS)
-- =====================================================
CREATE TABLE IF NOT EXISTS yard_assignments (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  yard_id INTEGER NOT NULL REFERENCES yards(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  assigned_by INTEGER REFERENCES employees(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(employee_id, yard_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA DE INSPECCIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS inspections (
    id                  SERIAL PRIMARY KEY,
    inspection_uuid     UUID DEFAULT gen_random_uuid() UNIQUE,
    -- Unit info
    trailer_number      VARCHAR(50),
    seal_number         VARCHAR(50),
    lock_number         VARCHAR(50),
    driver_name         VARCHAR(120),
    odometer            VARCHAR(20),
    location            VARCHAR(120),
    location_id         INT REFERENCES locations(id) ON DELETE SET NULL,
    inspection_date     TIMESTAMPTZ,
    -- Reconfirmation link
    original_inspection_id  INT REFERENCES inspections(id) ON DELETE SET NULL,
    reconfirmation_reason   TEXT,
    is_reconfirmation       BOOLEAN DEFAULT FALSE,
    high_security_seal  BOOLEAN,
    seal_affixed        BOOLEAN,
    language            VARCHAR(2)  DEFAULT 'es',
    -- Operator
    operator_id         INT REFERENCES employees(id) ON DELETE SET NULL,
    operator_name       VARCHAR(120),
    -- Guard
    guard_id            INT REFERENCES employees(id) ON DELETE SET NULL,
    guard_name          VARCHAR(120),
    guard_signed_at     TIMESTAMPTZ,
    -- Auditor
    auditor_id          INT REFERENCES employees(id) ON DELETE SET NULL,
    auditor_name        VARCHAR(120),
    auditor_signed_at   TIMESTAMPTZ,
    -- Status
    status              VARCHAR(20) DEFAULT 'completed'
                        CHECK (status IN ('draft','completed','audited','rejected','reconfirmed','superseded')),
    total_good          INT DEFAULT 0,
    total_bad           INT DEFAULT 0,
    total_pending       INT DEFAULT 0,
    -- PDF
    pdf_filename        VARCHAR(200),
    pdf_data            BYTEA,
    pdf_size_bytes      INT,
    -- Forensics
    created_ip          VARCHAR(64),
    created_user_agent  TEXT,
    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspections_created_at  ON inspections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspections_trailer     ON inspections(trailer_number);
CREATE INDEX IF NOT EXISTS idx_inspections_status      ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_uuid        ON inspections(inspection_uuid);
CREATE INDEX IF NOT EXISTS idx_inspections_guard       ON inspections(guard_id);
CREATE INDEX IF NOT EXISTS idx_inspections_location    ON inspections(location_id);

-- =====================================================
-- TABLA DE INSPECTION POINTS (20 PUNTOS POR INSPECCIÓN)
-- =====================================================
CREATE TABLE IF NOT EXISTS inspection_points (
    id              SERIAL PRIMARY KEY,
    inspection_id   INT NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    point_number    INT NOT NULL CHECK (point_number BETWEEN 1 AND 20),
    status          VARCHAR(10) CHECK (status IN ('good','bad')),
    issue_id        INT,
    issue_text      VARCHAR(500),
    has_photo       BOOLEAN DEFAULT FALSE,
    UNIQUE(inspection_id, point_number)
);

CREATE INDEX IF NOT EXISTS idx_points_inspection ON inspection_points(inspection_id);

-- =====================================================
-- TABLA DE AUDIT LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id              SERIAL PRIMARY KEY,
    inspection_id   INT REFERENCES inspections(id) ON DELETE CASCADE,
    user_id         INT REFERENCES employees(id) ON DELETE SET NULL,
    user_name       VARCHAR(120),
    role            VARCHAR(20),
    action          VARCHAR(50) NOT NULL,
    details         JSONB,
    ip_address      VARCHAR(64),
    user_agent      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_inspection ON audit_log(inspection_id);
CREATE INDEX IF NOT EXISTS idx_audit_action     ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created    ON audit_log(created_at DESC);

-- =====================================================
-- ÍNDICES PARA YARDS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_yards_type ON yards(type);
CREATE INDEX IF NOT EXISTS idx_yards_active ON yards(is_active);
CREATE INDEX IF NOT EXISTS idx_yard_assignments_employee ON yard_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_yard_assignments_yard ON yard_assignments(yard_id);
CREATE INDEX IF NOT EXISTS idx_yard_assignments_active ON yard_assignments(is_active);

-- =====================================================
-- VISTAS AUXILIARES
-- =====================================================
CREATE OR REPLACE VIEW v_inspections_list AS
SELECT
    id, inspection_uuid,
    trailer_number, seal_number, lock_number, driver_name, location, location_id,
    inspection_date, language, status,
    operator_name, guard_id, guard_name, guard_signed_at,
    auditor_name, auditor_signed_at,
    total_good, total_bad, total_pending,
    pdf_filename, pdf_size_bytes,
    original_inspection_id, is_reconfirmation, reconfirmation_reason,
    created_ip, created_at, updated_at
FROM inspections;

CREATE OR REPLACE VIEW v_inspection_chains AS
SELECT
    COALESCE(original_inspection_id, id) AS chain_root_id,
    id, trailer_number, seal_number, guard_name, location,
    status, is_reconfirmation, reconfirmation_reason,
    total_good, total_bad, created_at
FROM inspections
ORDER BY chain_root_id, created_at ASC;

-- =====================================================
-- USUARIOS DE EJEMPLO (SEEDS)
-- =====================================================
-- Guardias
INSERT INTO employees (id, username, password_hash, full_name, role, location_id, location_name, active) VALUES
(101, 'guardia01', '1234', 'Carlos Mendoza', 'guard', 1, 'Yard A - Laredo', true),
(102, 'guardia02', '1234', 'Luis Hernandez', 'guard', 1, 'Yard A - Laredo', true),
(103, 'guardia03', '1234', 'Miguel Torres', 'guard', 2, 'Yard B - El Paso', true),
(104, 'guardia04', '1234', 'Pedro Ramirez', 'guard', 2, 'Yard B - El Paso', true),
(105, 'guardia05', '1234', 'Juan Lopez', 'guard', 3, 'Yard C - Dallas', true),
(106, 'guardia06', '1234', 'Antonio Garcia', 'guard', 3, 'Yard C - Dallas', true),
(107, 'guardia07', '1234', 'Roberto Diaz', 'guard', 4, 'Yard D - Houston', true),
(108, 'guardia08', '1234', 'Francisco Ruiz', 'guard', 4, 'Yard D - Houston', true),
(109, 'guardia09', '1234', 'Javier Morales', 'guard', 5, 'Yard E - San Antonio', true),
(110, 'guardia10', '1234', 'Ricardo Silva', 'guard', 5, 'Yard E - San Antonio', true)
ON CONFLICT (username) DO NOTHING;

-- Inspectores
INSERT INTO employees (id, username, password_hash, full_name, role, location_id, location_name, active) VALUES
(201, 'inspector01', '1234', 'Alberto Vargas', 'inspector', 1, 'Yard A - Laredo', true),
(202, 'inspector02', '1234', 'Daniel Castro', 'inspector', 2, 'Yard B - El Paso', true),
(203, 'inspector03', '1234', 'Oscar Mendez', 'inspector', 3, 'Yard C - Dallas', true),
(204, 'inspector04', '1234', 'Sergio Aguilar', 'inspector', 4, 'Yard D - Houston', true),
(205, 'inspector05', '1234', 'Fernando Paredes', 'inspector', 5, 'Yard E - San Antonio', true)
ON CONFLICT (username) DO NOTHING;

-- Auditores
INSERT INTO employees (id, username, password_hash, full_name, role, location_id, location_name, active) VALUES
(301, 'auditor01', '1234', 'Roberto Sanchez', 'auditor', 1, 'Yard A - Laredo', true),
(302, 'auditor02', '1234', 'Guillermo Ortiz', 'auditor', 1, 'Yard A - Laredo', true),
(303, 'auditor03', '1234', 'Eduardo Mora', 'auditor', 1, 'Yard A - Laredo', true)
ON CONFLICT (username) DO NOTHING;

-- Admin
INSERT INTO employees (id, username, password_hash, full_name, role, location_id, location_name, active) VALUES
(401, 'admin', 'admin', 'Admin Crown', 'admin', 1, 'Yard A - Laredo', true)
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- ASIGNACIONES DE YARDAS INICIALES
-- =====================================================
INSERT INTO yard_assignments (employee_id, yard_id, assigned_by) VALUES
(101, 1, 401), -- guardia01 -> Yard A
(102, 1, 401), -- guardia02 -> Yard A
(103, 2, 401), -- guardia03 -> Yard B
(104, 2, 401), -- guardia04 -> Yard B
(105, 3, 401), -- guardia05 -> Yard C
(106, 3, 401), -- guardia06 -> Yard C
(107, 4, 401), -- guardia07 -> Yard D
(108, 4, 401), -- guardia08 -> Yard D
(109, 5, 401), -- guardia09 -> Yard E
(110, 5, 401)  -- guardia10 -> Yard E
ON CONFLICT (employee_id, yard_id) DO NOTHING;

-- =====================================================
-- COMENTARIOS DE TABLAS
-- =====================================================
COMMENT ON TABLE locations IS 'Yardas/Ubicaciones para Crown Xpress Transport';
COMMENT ON TABLE employees IS 'Usuarios del sistema (guardias, inspectores, auditores, admin)';
COMMENT ON TABLE operators IS 'Operadores de camiones con licencias y datos de contacto';
COMMENT ON TABLE yards IS 'Yardas con capacidades y gestión de equipos';
COMMENT ON TABLE yard_assignments IS 'Asignación de yardas a guardias';
COMMENT ON TABLE inspections IS 'Registros de inspección de 20 puntos';
COMMENT ON TABLE inspection_points IS '20 puntos evaluados en cada inspección';
COMMENT ON TABLE audit_log IS 'Registro de acciones de usuarios en el sistema';

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================
-- Descomentar para verificar después de ejecutar
/*
SELECT 'Locations' as table, COUNT(*) as count FROM locations;
SELECT 'Employees' as table, COUNT(*) as count FROM employees;
SELECT 'Operators' as table, COUNT(*) as count FROM operators;
SELECT 'Yards' as table, COUNT(*) as count FROM yards;
SELECT 'Yard Assignments' as table, COUNT(*) as count FROM yard_assignments;

-- Ver usuarios por rol
SELECT role, COUNT(*) as count FROM employees GROUP BY role ORDER BY role;

-- Ver yardas por tipo
SELECT type, COUNT(*) as count FROM yards GROUP BY type ORDER BY type;

-- Ver asignaciones activas
SELECT ya.employee_id, e.full_name, e.username, y.name as yard_name, ya.assigned_at
FROM yard_assignments ya
JOIN employees e ON ya.employee_id = e.id
JOIN yards y ON ya.yard_id = y.id
WHERE ya.is_active = true
ORDER BY ya.assigned_at;
*/
