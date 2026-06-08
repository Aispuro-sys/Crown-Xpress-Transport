import sql from '../../db.js'

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  try {
    const {
      reason,
      points,
      guardSignature,
      language,
      pdfBase64,
      pdfFilename
    } = req.body

    // Get original inspection
    const [original] = await sql`
      SELECT * FROM inspections WHERE id = ${id}
    `

    if (!original) {
      return res.status(404).json({ error: 'Original inspection not found' })
    }

    // Count modifications
    let modifications = 0
    if (points && typeof points === 'object') {
      for (const [pointId, pointData] of Object.entries(points)) {
        if (pointData.modified) {
          modifications++
        }
      }
    }

    // Calculate counts from points
    let goodCount = 0
    let badCount = 0
    let pendingCount = 0
    
    if (points && typeof points === 'object') {
      for (const pointData of Object.values(points)) {
        if (pointData.status === 'good') goodCount++
        else if (pointData.status === 'bad') badCount++
        else pendingCount++
      }
    }

    // Insert reconfirmation as new inspection linked to original
    const [reconfirmation] = await sql`
      INSERT INTO inspections (
        trailer_number, container_number, seal_number, lock_number,
        driver_name, odometer, location, inspection_date,
        high_security_seal, seal_affixed,
        guard_name, guard_signature, guard_signed_at,
        seal_photo, pdf_data, pdf_filename,
        language, good_count, bad_count, pending_count,
        status, original_inspection_id
      ) VALUES (
        ${original.trailer_number},
        ${original.container_number},
        ${original.seal_number},
        ${original.lock_number},
        ${original.driver_name},
        ${original.odometer},
        ${original.location},
        ${new Date()},
        ${original.high_security_seal},
        ${original.seal_affixed},
        ${guardSignature?.name || original.guard_name},
        ${guardSignature?.signature || null},
        ${guardSignature?.signedAt ? new Date(guardSignature.signedAt) : new Date()},
        ${original.seal_photo},
        ${pdfBase64 || null},
        ${pdfFilename || null},
        ${language || 'es'},
        ${goodCount},
        ${badCount},
        ${pendingCount},
        'reconfirmed',
        ${id}
      )
      RETURNING id, uuid, created_at
    `

    // Insert reconfirmation points
    if (points && typeof points === 'object') {
      for (const [pointId, pointData] of Object.entries(points)) {
        await sql`
          INSERT INTO inspection_points (
            inspection_id, point_id, status, issue_id, issue_text, photo
          ) VALUES (
            ${reconfirmation.id},
            ${parseInt(pointId)},
            ${pointData.status || null},
            ${pointData.issueId || null},
            ${pointData.issueText || null},
            ${pointData.photo || null}
          )
        `
      }
    }

    // Create audit log
    await sql`
      INSERT INTO audit_logs (inspection_id, action, actor_name, details)
      VALUES (
        ${reconfirmation.id},
        'reconfirmed',
        ${guardSignature?.name || 'Unknown'},
        ${JSON.stringify({ 
          reason, 
          modifications,
          original_id: id,
          good_count: goodCount,
          bad_count: badCount
        })}
      )
    `

    return res.status(201).json({
      success: true,
      id: reconfirmation.id,
      uuid: reconfirmation.uuid,
      createdAt: reconfirmation.created_at,
      modifications,
      original_id: id
    })

  } catch (error) {
    console.error('Reconfirm API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
