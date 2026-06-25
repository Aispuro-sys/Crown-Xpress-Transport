import { getSql } from '../_lib/db.js'
import { createInspection } from '../_lib/handlers.js'

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const sql = getSql()
    
    if (req.method === 'GET') {
      // List inspections
      const limit = parseInt(req.query.limit) || 50
      const offset = parseInt(req.query.offset) || 0
      const yardCode = req.query.yardCode

      let inspections
      let countResult

      if (yardCode && yardCode.trim() !== '') {
        inspections = await sql`
          SELECT
            id, uuid, trailer_number, tractor_number, container_number, seal_number, lock_number,
            driver_name, odometer, location, inspection_date,
            high_security_seal, seal_affixed,
            guard_name, guard_signed_at,
            auditor_name, auditor_signed_at,
            total_good, total_bad, total_pending,
            status, language, created_at, original_inspection_id, wono, inspection_type, trailer_type,
            equipment_nomenclature, customer_prefix, crown_fleet
          FROM inspections
          WHERE location = ${yardCode}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
        countResult = await sql`SELECT COUNT(*) as total FROM inspections WHERE location = ${yardCode}`
      } else {
        inspections = await sql`
          SELECT
            id, uuid, trailer_number, tractor_number, container_number, seal_number, lock_number,
            driver_name, odometer, location, inspection_date,
            high_security_seal, seal_affixed,
            guard_name, guard_signed_at,
            auditor_name, auditor_signed_at,
            total_good, total_bad, total_pending,
            status, language, created_at, original_inspection_id, wono, inspection_type, trailer_type,
            equipment_nomenclature, customer_prefix, crown_fleet
          FROM inspections
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
        countResult = await sql`SELECT COUNT(*) as total FROM inspections`
      }

      const total = parseInt(countResult[0]?.total || 0)

      return res.status(200).json({
        data: inspections,
        limit,
        offset,
        total
      })
    }

    if (req.method === 'POST') {
      return createInspection(req, res)
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
