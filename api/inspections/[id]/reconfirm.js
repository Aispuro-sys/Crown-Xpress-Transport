import sql from '../../db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { id } = req.query

  try {
    if (req.method === 'POST') {
      const {
        reason,
        modifiedPoints,
        guardSignature,
        language
      } = req.body

      if (!reason || reason.length < 10) {
        return res.status(400).json({ error: 'Reason must be at least 10 characters' })
      }

      // Get original inspection
      const isUuid = id && id.includes('-')
      let originalInspection
      
      if (isUuid) {
        const results = await sql`SELECT * FROM inspections WHERE uuid = ${id}`
        originalInspection = results[0]
      } else {
        const numId = parseInt(id)
        if (isNaN(numId)) {
          return res.status(400).json({ error: 'Invalid inspection ID' })
        }
        const results = await sql`SELECT * FROM inspections WHERE id = ${numId}`
        originalInspection = results[0]
      }

      if (!originalInspection) {
        return res.status(404).json({ error: 'Original inspection not found' })
      }

      // Create reconfirmation record (new inspection linked to original)
      const [reconfirmation] = await sql`
        INSERT INTO inspections (
          trailer_number, container_number, seal_number, lock_number,
          driver_name, odometer, location, inspection_date,
          high_security_seal, seal_affixed,
          guard_name, guard_signature, guard_signed_at,
          language, good_count, bad_count, pending_count,
          status, original_inspection_id, reconfirm_reason
        ) VALUES (
          ${originalInspection.trailer_number},
          ${originalInspection.container_number},
          ${originalInspection.seal_number},
          ${originalInspection.lock_number},
          ${originalInspection.driver_name},
          ${originalInspection.odometer},
          ${originalInspection.location},
          ${new Date()},
          ${originalInspection.high_security_seal},
          ${originalInspection.seal_affixed},
          ${guardSignature?.name || originalInspection.guard_name},
          ${guardSignature?.signature || null},
          ${guardSignature?.signedAt ? new Date(guardSignature.signedAt) : new Date()},
          ${language || 'es'},
          ${originalInspection.good_count},
          ${originalInspection.bad_count},
          ${originalInspection.pending_count},
          'reconfirmed',
          ${originalInspection.id},
          ${reason}
        )
        RETURNING id, uuid, created_at
      `

      // Copy original points and apply modifications
      const originalPoints = await sql`
        SELECT * FROM inspection_points WHERE inspection_id = ${originalInspection.id}
      `

      for (const point of originalPoints) {
        const modification = modifiedPoints?.find(m => m.pointId === point.point_id)
        
        await sql`
          INSERT INTO inspection_points (
            inspection_id, point_id, status, issue_id, issue_text, photo
          ) VALUES (
            ${reconfirmation.id},
            ${point.point_id},
            ${modification ? modification.newStatus : point.status},
            ${modification ? null : point.issue_id},
            ${modification ? null : point.issue_text},
            ${point.photo}
          )
        `
      }

      // Create audit log
      await sql`
        INSERT INTO audit_logs (inspection_id, action, actor_name, details)
        VALUES (
          ${reconfirmation.id},
          'reconfirmed',
          ${guardSignature?.name || 'Unknown'},
          ${JSON.stringify({ 
            originalId: originalInspection.id,
            reason,
            modifiedPoints: modifiedPoints?.length || 0
          })}
        )
      `

      // Update original inspection status
      await sql`
        UPDATE inspections 
        SET status = 'has_reconfirmation'
        WHERE id = ${originalInspection.id}
      `

      return res.status(201).json({
        success: true,
        id: reconfirmation.id,
        uuid: reconfirmation.uuid,
        originalId: originalInspection.id,
        createdAt: reconfirmation.created_at
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Reconfirm API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
