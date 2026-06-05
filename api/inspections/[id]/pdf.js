import sql from '../../db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { id } = req.query

  try {
    if (req.method === 'GET') {
      const isUuid = id && id.includes('-')
      
      let inspections
      if (isUuid) {
        inspections = await sql`SELECT pdf_data, pdf_filename FROM inspections WHERE uuid = ${id}`
      } else {
        const numId = parseInt(id)
        if (isNaN(numId)) {
          return res.status(400).json({ error: 'Invalid inspection ID' })
        }
        inspections = await sql`SELECT pdf_data, pdf_filename FROM inspections WHERE id = ${numId}`
      }

      if (!inspections || inspections.length === 0) {
        return res.status(404).json({ error: 'Inspection not found' })
      }

      const { pdf_data, pdf_filename } = inspections[0]
      
      if (!pdf_data) {
        return res.status(404).json({ error: 'PDF data not available for this inspection' })
      }

      // Remove data URI prefix if present and convert to buffer
      let base64Data = pdf_data
      if (typeof pdf_data === 'string') {
        // Handle various base64 formats
        if (pdf_data.includes('base64,')) {
          base64Data = pdf_data.split('base64,')[1]
        } else if (pdf_data.startsWith('data:')) {
          base64Data = pdf_data.replace(/^data:[^;]+;base64,/, '')
        }
      }
      
      try {
        const pdfBuffer = Buffer.from(base64Data, 'base64')
        
        if (pdfBuffer.length === 0) {
          return res.status(500).json({ error: 'PDF buffer is empty' })
        }

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${pdf_filename || 'inspection.pdf'}"`)
        res.setHeader('Content-Length', pdfBuffer.length)

        return res.send(pdfBuffer)
      } catch (bufferError) {
        console.error('Buffer conversion error:', bufferError)
        return res.status(500).json({ error: 'Failed to convert PDF data' })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('PDF API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
