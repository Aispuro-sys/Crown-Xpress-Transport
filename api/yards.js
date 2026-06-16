import sql from './db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // GET - List all yards or get specific yard
    if (req.method === 'GET') {
      const { id } = req.query
      
      if (id) {
        // Get specific yard
        const [yard] = await sql`
          SELECT * FROM yards 
          WHERE id = ${parseInt(id)} AND is_active = true
        `
        if (!yard) {
          return res.status(404).json({ error: 'Yard not found' })
        }
        
        // Get current counts
        const [counts] = await sql`
          SELECT 
            current_trailers, current_trucks, current_boxes, 
            current_platforms, current_machinery
          FROM yards WHERE id = ${parseInt(id)}
        `
        
        return res.status(200).json({ 
          success: true, 
          yard: { ...yard, ...counts }
        })
      } else {
        // List all yards
        const yards = await sql`
          SELECT * FROM yards 
          WHERE is_active = true 
          ORDER BY type, name
        `
        return res.status(200).json({ 
          success: true, 
          data: yards 
        })
      }
    }

    // POST - Create new yard
    if (req.method === 'POST') {
      const { 
        name, code, type, description, address,
        max_trailers, max_trucks, max_boxes, max_platforms, max_machinery,
        min_trailers, min_trucks, min_boxes, min_platforms, min_machinery
      } = req.body

      if (!name || !code || !type) {
        return res.status(400).json({ error: 'Name, code, and type are required' })
      }

      if (!['PHYSICAL', 'VIRTUAL'].includes(type)) {
        return res.status(400).json({ error: 'Type must be PHYSICAL or VIRTUAL' })
      }

      const [yard] = await sql`
        INSERT INTO yards (
          name, code, type, description, address,
          max_trailers, max_trucks, max_boxes, max_platforms, max_machinery,
          min_trailers, min_trucks, min_boxes, min_platforms, min_machinery
        ) VALUES (
          ${name}, ${code}, ${type}, ${description || null}, ${address || null},
          ${max_trailers || 0}, ${max_trucks || 0}, ${max_boxes || 0}, ${max_platforms || 0}, ${max_machinery || 0},
          ${min_trailers || 0}, ${min_trucks || 0}, ${min_boxes || 0}, ${min_platforms || 0}, ${min_machinery || 0}
        )
        RETURNING id, name, code, type, description, address, 
               max_trailers, max_trucks, max_boxes, max_platforms, max_machinery,
               min_trailers, min_trucks, min_boxes, min_platforms, min_machinery,
               is_active, created_at
      `

      return res.status(201).json({ 
        success: true, 
        yard 
      })
    }

    // PUT - Update yard
    if (req.method === 'PUT') {
      const { 
        id, name, code, type, description, address,
        max_trailers, max_trucks, max_boxes, max_platforms, max_machinery,
        min_trailers, min_trucks, min_boxes, min_platforms, min_machinery,
        is_active
      } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Yard ID required' })
      }

      const [yard] = await sql`
        UPDATE yards SET
          name = ${name || sql`name`},
          code = ${code || sql`code`},
          type = ${type || sql`type`},
          description = ${description !== undefined ? description : sql`description`},
          address = ${address !== undefined ? address : sql`address`},
          max_trailers = ${max_trailers !== undefined ? max_trailers : sql`max_trailers`},
          max_trucks = ${max_trucks !== undefined ? max_trucks : sql`max_trucks`},
          max_boxes = ${max_boxes !== undefined ? max_boxes : sql`max_boxes`},
          max_platforms = ${max_platforms !== undefined ? max_platforms : sql`max_platforms`},
          max_machinery = ${max_machinery !== undefined ? max_machinery : sql`max_machinery`},
          min_trailers = ${min_trailers !== undefined ? min_trailers : sql`min_trailers`},
          min_trucks = ${min_trucks !== undefined ? min_trucks : sql`min_trucks`},
          min_boxes = ${min_boxes !== undefined ? min_boxes : sql`min_boxes`},
          min_platforms = ${min_platforms !== undefined ? min_platforms : sql`min_platforms`},
          min_machinery = ${min_machinery !== undefined ? min_machinery : sql`min_machinery`},
          is_active = ${is_active !== undefined ? is_active : sql`is_active`},
          updated_at = NOW()
        WHERE id = ${parseInt(id)}
        RETURNING id, name, code, type, description, address,
               max_trailers, max_trucks, max_boxes, max_platforms, max_machinery,
               min_trailers, min_trucks, min_boxes, min_platforms, min_machinery,
               is_active, updated_at
      `

      if (!yard) {
        return res.status(404).json({ error: 'Yard not found' })
      }

      return res.status(200).json({ 
        success: true, 
        yard 
      })
    }

    // DELETE - Deactivate yard (soft delete)
    if (req.method === 'DELETE') {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({ error: 'Yard ID required' })
      }

      await sql`UPDATE yards SET is_active = false, updated_at = NOW() WHERE id = ${parseInt(id)}`

      return res.status(200).json({ 
        success: true, 
        message: 'Yard deactivated successfully' 
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Yards API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
