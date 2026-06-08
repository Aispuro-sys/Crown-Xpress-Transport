import sql from '../db.js'

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { employee_number } = req.query

  try {
    if (!employee_number) {
      return res.status(400).json({ error: 'Employee number is required' })
    }

    // Search for operator by employee number (exact match)
    const [operator] = await sql`
      SELECT id, employee_number, full_name, license_number, license_expiry, phone, status
      FROM operators
      WHERE employee_number = ${employee_number.toUpperCase()}
      AND status = 'active'
    `

    if (!operator) {
      return res.status(404).json({ error: 'Operator not found' })
    }

    return res.status(200).json({
      success: true,
      operator: {
        id: operator.id,
        employeeNumber: operator.employee_number,
        fullName: operator.full_name,
        licenseNumber: operator.license_number,
        licenseExpiry: operator.license_expiry,
        phone: operator.phone,
        status: operator.status
      }
    })

  } catch (error) {
    console.error('Operator search error:', error)
    return res.status(500).json({ error: error.message })
  }
}
