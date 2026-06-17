import { getNbcwSql } from './_lib/db.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    try {
      // Get user info from Authorization header or query
      const authHeader = req.headers.authorization
      const userLocation = req.query.location || req.headers['x-user-location']
      
      if (!userLocation) {
        return res.status(400).json({ 
          error: 'User location is required' 
        })
      }

      const sql = getNbcwSql()
      
      // Extract yard code from location (e.g., 'cxt6' from 'CXT6 Yard')
      const yardCode = userLocation.toLowerCase().replace(/\s+/g, '')
      
      // Query TPR table for this yard's data
      const outputs = await sql`
        SELECT 
          DRVCODE,
          WONO,
          BLNO,
          FECHA,
          FROMD,
          FROMCITY,
          FROMEDO,
          TOD,
          TOCITY,
          TOEDO,
          TIPMOV,
          STATUS,
          EL,
          EQPCODE,
          DELDATE,
          CSTMER,
          TIMEARRV,
          TIMEDEPAR,
          OPER,
          USTIMEIN,
          USTIMEOUT,
          MXMXCSTIN,
          MXUSCSTIN,
          MXTIMEOUT,
          TRUCKID,
          BLTIME,
          TARRFROM,
          USRUPDD,
          USRUPDT,
          USRUPDD,
          USRUPDT,
          USRADD,
          USRADDD,
          USRADDT,
          INSTRUC1,
          INSTRUC2,
          RL,
          AMOUNT,
          TABLECODE,
          TRXCODE,
          SEAL
        FROM tpr 
        WHERE FROMD = ${yardCode.toUpperCase()}
        ORDER BY FECHA DESC, TIMEARRV DESC
        LIMIT 50
      `

      return res.status(200).json({
        success: true,
        yardCode: yardCode.toUpperCase(),
        data: outputs,
        count: outputs.length
      })

    } catch (error) {
      console.error('NBCW Outputs Error:', error)
      return res.status(500).json({ 
        error: 'Failed to fetch NBCW outputs',
        details: error.message 
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
