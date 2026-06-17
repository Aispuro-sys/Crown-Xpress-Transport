import { getSql } from './_lib/db.js'

// Datos de prueba para cuando no hay conexión a base de datos
const MOCK_DATA = [
  {
    driver_code: '1455',
    work_order: '785237',
    bill_of_lading: '2',
    date: '6/11/2026',
    from_code: 'GLO11552',
    from_city: 'TIJUANA',
    from_state: 'BCN',
    to_code: 'AVERY',
    to_city: 'TIJUANA',
    to_state: 'BCN',
    movement_type: 'L',
    status: 'OPEN',
    equipment_type: 'L',
    equipment_code: 'ABBA-008',
    delivery_date: '6/11/2026',
    customer: 'AVERYLA',
    arrival_time: '',
    departure_time: '',
    operator: 'JOSE ROSENDO LEAL',
    truck_id: '357',
    seal: '',
    instructions_1: null,
    instructions_2: null,
    amount: '12.00',
    table_code: 'LOC/TJL',
    table_code: 'MOV'
  },
  {
    driver_code: '3208',
    work_order: '785236',
    bill_of_lading: '1',
    date: '6/11/2026',
    from_code: 'FAB58',
    from_city: 'MEXICALI',
    from_state: 'BCN',
    to_code: 'HON280',
    to_city: 'CALEXICO',
    to_state: 'CA',
    movement_type: '3',
    status: 'OPEN',
    equipment_type: 'L',
    equipment_code: 'D24154',
    delivery_date: '6/11/2026',
    customer: 'COR3',
    arrival_time: '',
    departure_time: '',
    operator: 'ANA BERTHA DE LA CRU',
    truck_id: '432',
    seal: '',
    instructions_1: null,
    instructions_2: null,
    amount: '35.00',
    table_code: 'CRUCE/L',
    table_code: 'MOV'
  },
  {
    driver_code: '926',
    work_order: '785209',
    bill_of_lading: '3',
    date: '6/11/2026',
    from_code: 'SEA11002',
    from_city: 'TIJUANA',
    from_state: 'BCN',
    to_code: 'CXT6',
    to_city: 'TIJUANA',
    to_state: 'BCN',
    movement_type: 'L',
    status: 'OPEN',
    equipment_type: 'L',
    equipment_code: 'CXT-5809',
    delivery_date: '6/11/2026',
    customer: 'HEN67',
    arrival_time: '14:17',
    departure_time: '',
    operator: 'CELESTE RODRIGUEZ',
    truck_id: '294',
    seal: '',
    instructions_1: null,
    instructions_2: null,
    amount: '12.00',
    table_code: 'LOC/TJL',
    table_code: 'MOV'
  }
]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    try {
      const { type, date } = req.query

      // Verificar si DATABASE_URL_NBCW está configurada
      const externalUrl = process.env.DATABASE_URL_NBCW
      
      if (!externalUrl) {
        console.warn('DATABASE_URL_NBCW not configured, returning mock data')
        // Retornar datos de prueba para demostración
        let filteredData = [...MOCK_DATA]
        
        if (type === 'pending') {
          filteredData = filteredData.filter(m => m.status === 'OPEN')
        } else if (type === 'empty') {
          filteredData = filteredData.filter(m => 
            m.equipment_code?.includes('** Botada **') || m.table_code === 'BOTADA'
          )
        }
        
        if (date) {
          filteredData = filteredData.filter(m => m.date === date)
        }
        
        return res.status(200).json({
          success: true,
          data: filteredData,
          count: filteredData.length,
          warning: 'Using mock data - DATABASE_URL_NBCW not configured',
          mock: true
        })
      }

      // Si hay URL configurada, intentar conectar a la base de datos real
      try {
        const { neon } = require('@neondatabase/serverless')
        const externalSql = neon(externalUrl)
        
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
        if (type === 'pending') {
          query += ` AND status = 'OPEN'`
        } else if (type === 'empty') {
          query += ` AND (eqpcode LIKE '%** Botada **%' OR tablecode = 'BOTADA')`
        }

        // Filtrar por fecha si se proporciona
        if (date) {
          query += ` AND fecha = '${date}'`
        }

        // Ordenar por fecha y hora
        query += ` ORDER BY fecha DESC, timearrv DESC`

        // Ejecutar query en base de datos externa
        const movements = await externalSql(query)

        return res.status(200).json({
          success: true,
          data: movements,
          count: movements.length
        })
      } catch (dbError) {
        console.error('Database connection error:', dbError)
        // Si falla la conexión, retornar datos de prueba
        return res.status(200).json({
          success: true,
          data: MOCK_DATA,
          count: MOCK_DATA.length,
          warning: 'Database connection failed, using mock data',
          mock: true,
          error: dbError.message
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
