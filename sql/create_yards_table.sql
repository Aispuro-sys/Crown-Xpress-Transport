-- Create yards table for Crown Xpress Transport
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

-- Create yard_assignments table to track which guards are assigned to which yards
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

-- Insert initial yards data
INSERT INTO yards (name, code, type, description, max_trailers, max_trucks, max_boxes, max_platforms, min_trailers, min_trucks, min_boxes, min_platforms) VALUES
('Yard A - Laredo', 'YDA', 'PHYSICAL', 'Main yard in Laredo, TX', 50, 30, 100, 20, 10, 5, 20, 5),
('Yard B - El Paso', 'YDB', 'PHYSICAL', 'Secondary yard in El Paso, TX', 30, 20, 60, 15, 5, 3, 12, 3),
('Yard C - Dallas', 'YDC', 'PHYSICAL', 'Yard in Dallas, TX', 40, 25, 80, 18, 8, 4, 16, 4),
('Yard D - Houston', 'YDH', 'PHYSICAL', 'Yard in Houston, TX', 35, 22, 70, 16, 6, 3, 14, 3),
('Yard E - San Antonio', 'YDS', 'PHYSICAL', 'Yard in San Antonio, TX', 25, 15, 50, 12, 4, 2, 10, 2),
('Virtual Yard 1', 'VY1', 'VIRTUAL', 'Virtual yard for overflow management', 100, 60, 200, 40, 20, 10, 40, 8),
('Virtual Yard 2', 'VY2', 'VIRTUAL', 'Virtual yard for peak hours', 80, 50, 160, 32, 16, 8, 32, 6);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_yards_type ON yards(type);
CREATE INDEX IF NOT EXISTS idx_yards_active ON yards(is_active);
CREATE INDEX IF NOT EXISTS idx_yard_assignments_employee ON yard_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_yard_assignments_yard ON yard_assignments(yard_id);
CREATE INDEX IF NOT EXISTS idx_yard_assignments_active ON yard_assignments(is_active);

-- Add comment to tables
COMMENT ON TABLE yards IS 'Yards management table for Crown Xpress Transport';
COMMENT ON TABLE yard_assignments IS 'Tracks which guards are assigned to which yards';
