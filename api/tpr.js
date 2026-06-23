import { getSql } from './_lib/db.js'
import { Client } from '@neondatabase/serverless'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    try {
      const { type, date, yardCode } = req.query

      // Verificar si DATABASE_URL_NBCW está configurada
      const externalUrl = process.env.DATABASE_URL_NBCW
      
      if (!externalUrl) {
        console.error('DATABASE_URL_NBCW not configured')
        return res.status(500).json({
          error: 'DATABASE_URL_NBCW not configured',
          details: 'Please configure the DATABASE_URL_NBCW environment variable in Vercel to connect to the NBCW database'
        })
      }

      // Si hay URL configurada, intentar conectar a la base de datos real
      const client = new Client(externalUrl)
      try {
        await client.connect()
        
        let query = `
          SELECT 
            drvcode as driver_code,
            wono as work_order,
            blno as bill_of_lading,
            fecha as date,
            fromd as from_code,
            fromcity as from_city,
            fromedo as from_state,
            tod as to_code,
            tocity as to_city,
            toedo as to_state,
            tipmov as movement_type,
            status,
            el as equipment_type,
            eqpcode as equipment_code,
            deldate as delivery_date,
            cstmer as customer,
            timearrv as arrival_time,
            timedepar as departure_time,
            oper as operator,
            truckid as truck_id,
            seal,
            instruc1 as instructions_1,
            instruc2 as instructions_2,
            amount,
            tablecode as table_code
          FROM tpr 
          WHERE 1=1
        `

        // Filtrar por tipo de movimiento (salidas pendientes)
        // Usar TRIM() porque status es VARCHAR con espacios de padding
        if (type === 'pending') {
          query += ` AND TRIM(status) = 'OPEN'`
        } else if (type === 'empty') {
          query += ` AND (eqpcode LIKE '%** Botada **%' OR TRIM(tablecode) = 'BOTADA')`
        }

        // Filtrar por yarda (fromd) si se proporciona (soporta múltiples códigos separados por coma)
        if (yardCode) {
          const yardCodes = yardCode.split(',').map(c => c.trim().toUpperCase()).filter(Boolean)
          if (yardCodes.length > 0) {
            const yardCodesStr = yardCodes.map(c => `'${c}'`).join(', ')
            query += ` AND TRIM(fromd) IN (${yardCodesStr})`
            console.log('TPR - Filtering by yard codes:', yardCodes)
          }
        }

        // Filtrar por fecha si se proporciona
        if (date) {
          query += ` AND fecha = '${date}'`
        }

        // Ordenar por fecha y hora
        query += ` ORDER BY fecha DESC, timearrv DESC`

        // Ejecutar query usando Client.query() para queries dinamicas
        const result = await client.query(query)
        const allMovements = result.rows

        await client.end()

        // Cross-filter: get already inspected trailer/seal numbers from local PostgreSQL
        let inspectedSet = new Set()
        try {
          const localSql = getSql()
          const inspected = await localSql`
            SELECT DISTINCT
              UPPER(TRIM(trailer_number)) AS trailer_number,
              UPPER(TRIM(seal_number))    AS seal_number,
              UPPER(TRIM(lock_number))    AS lock_number
            FROM inspections
            WHERE status NOT IN ('superseded')
              AND created_at >= NOW() - INTERVAL '30 days'
          `
          for (const row of inspected) {
            if (row.trailer_number) inspectedSet.add(row.trailer_number)
            if (row.seal_number)    inspectedSet.add(row.seal_number)
            if (row.lock_number)    inspectedSet.add(row.lock_number)
          }
        } catch (localErr) {
          console.warn('Could not query local inspections for cross-filter:', localErr.message)
        }

        // Mark each movement: already_inspected = true if its BLNO, seal or truck_id was already inspected
        const movements = allMovements.map(m => {
          const blno  = m.bill_of_lading?.toString().trim().toUpperCase()
          const seal  = m.seal?.toString().trim().toUpperCase()
          const truck = m.truck_id?.toString().trim().toUpperCase()
          const already = !!(blno && inspectedSet.has(blno)) ||
                          !!(seal  && inspectedSet.has(seal))  ||
                          !!(truck && inspectedSet.has(truck))
          return { ...m, already_inspected: already }
        })

        // Pending count = only non-inspected
        const pendingCount = movements.filter(m => !m.already_inspected).length

        // Extract host from connection URL for debugging (strip credentials)
        let dbHost = 'unknown'
        try {
          const urlObj = new URL(externalUrl)
          dbHost = urlObj.hostname
        } catch {}

        return res.status(200).json({
          success: true,
          data: movements,
          count: movements.length,
          pending_count: pendingCount,
          last_updated: new Date().toISOString(),
          _db_host: dbHost // Remove this after confirming correct DB
        })
      } catch (dbError) {
        await client.end().catch(() => {})
        console.error('Database connection error:', dbError)
        return res.status(500).json({
          error: 'Failed to connect to NBCW database',
          details: dbError.message
        })
      }

    } catch (error) {
      console.error('TPR Query Error:', error)
      return res.status(500).json({ 
        error: 'Failed to query TPR database',
        details: error.message 
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
