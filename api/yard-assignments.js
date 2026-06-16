import sql from './db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // GET - List assignments
    if (req.method === 'GET') {
      const { employee_id, yard_id } = req.query
      
      let query = `
        SELECT 
          ya.id, ya.employee_id, ya.yard_id, ya.assigned_at, ya.assigned_by, ya.is_active,
          e.full_name as employee_name, e.username as employee_username,
          y.name as yard_name, y.code as yard_code, y.type as yard_type
        FROM yard_assignments ya
        JOIN employees e ON ya.employee_id = e.id
        JOIN yards y ON ya.yard_id = y.id
        WHERE ya.is_active = true
      `
      
      const params = []
      
      if (employee_id) {
        query += ` AND ya.employee_id = $${params.length + 1}`
        params.push(employee_id)
      }
      
      if (yard_id) {
        query += ` AND ya.yard_id = $${params.length + 1}`
        params.push(yard_id)
      }
      
      query += ` ORDER BY ya.assigned_at DESC`
      
      const assignments = await sql.query(query, params)
      
      return res.status(200).json({ 
        success: true, 
        data: assignments 
      })
    }

    // POST - Create new assignment
    if (req.method === 'POST') {
      const { employee_id, yard_id, assigned_by } = req.body

      if (!employee_id || !yard_id) {
        return res.status(400).json({ error: 'Employee ID and Yard ID are required' })
      }

      // Check if assignment already exists
      const existing = await sql`
        SELECT id FROM yard_assignments 
        WHERE employee_id = ${employee_id} AND yard_id = ${yard_id} AND is_active = true
      `
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Assignment already exists' })
      }

      // Deactivate any existing assignments for this employee
      await sql`
        UPDATE yard_assignments 
        SET is_active = false, updated_at = NOW() 
        WHERE employee_id = ${employee_id} AND is_active = true
      `

      // Create new assignment
      const [assignment] = await sql`
        INSERT INTO yard_assignments (employee_id, yard_id, assigned_by)
        VALUES (${employee_id}, ${yard_id}, ${assigned_by || null})
        RETURNING id, employee_id, yard_id, assigned_at, assigned_by, is_active
      `

      return res.status(201).json({ 
        success: true, 
        assignment 
      })
    }

    // PUT - Update assignment
    if (req.method === 'PUT') {
      const { id, is_active } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Assignment ID required' })
      }

      const [assignment] = await sql`
        UPDATE yard_assignments 
        SET is_active = ${is_active !== undefined ? is_active : sql`is_active`}, updated_at = NOW()
        WHERE id = ${parseInt(id)}
        RETURNING id, employee_id, yard_id, assigned_at, assigned_by, is_active, updated_at
      `

      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' })
      }

      return res.status(200).json({ 
        success: true, 
        assignment 
      })
    }

    // DELETE - Deactivate assignment (soft delete)
    if (req.method === 'DELETE') {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({ error: 'Assignment ID required' })
      }

      await sql`
        UPDATE yard_assignments 
        SET is_active = false, updated_at = NOW() 
        WHERE id = ${parseInt(id)}
      `

      return res.status(200).json({ 
        success: true, 
        message: 'Assignment deactivated successfully' 
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Yard Assignments API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
