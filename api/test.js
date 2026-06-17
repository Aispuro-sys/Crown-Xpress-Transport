export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  console.log('Test endpoint called:', req.method, req.url)
  
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'Test endpoint working',
      method: 'GET',
      url: req.url,
      timestamp: new Date().toISOString()
    })
  }

  if (req.method === 'POST') {
    console.log('POST body:', req.body)
    return res.status(200).json({ 
      message: 'Test POST endpoint working',
      method: 'POST',
      url: req.url,
      body: req.body,
      timestamp: new Date().toISOString()
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
