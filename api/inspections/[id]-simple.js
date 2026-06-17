export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { id } = req.query
  console.log('Simple endpoint called:', req.method, req.url, 'ID:', id)

  if (req.method === 'GET') {
    if (req.url.includes('pdf')) {
      console.log('Generating PDF for inspection:', id)
      // Simple PDF response
      const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n/Resources <<\n/Font <<\n/F1 5 0 R\n>>\n>>\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Inspection PDF) Tj\nET\nendstream\nendobj\n5 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000054 00000 n \n0000000123 00000 n \n0000000225 00000 n \n0000000320 00000 n \ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n406\n%%EOF'
      
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="inspection-${id}.pdf"`)
      return res.status(200).send(Buffer.from(pdfContent))
    }

    return res.status(200).json({ 
      message: 'Simple GET working',
      id: id,
      url: req.url
    })
  }

  if (req.method === 'POST') {
    console.log('POST request body:', req.body)
    
    if (req.url.includes('sign-supervisor')) {
      console.log('Processing supervisor signature for inspection:', id)
      return res.status(200).json({ 
        message: 'Supervisor signature working',
        id: id,
        body: req.body,
        timestamp: new Date().toISOString()
      })
    }

    return res.status(200).json({ 
      message: 'Simple POST working',
      id: id,
      url: req.url,
      body: req.body
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
