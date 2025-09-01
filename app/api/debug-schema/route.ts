import { NextResponse } from 'next/server'
import { executeQuery, executeQuerySingle } from '@/lib/db'

export async function GET() {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      database: '',
      tables: [],
      certificatesColumns: [],
      studentsColumns: [],
      materialsColumns: [],
      testResults: {}
    }

    // Get database name
    try {
      const dbResult = await executeQuerySingle('SELECT DATABASE() as db_name')
      results.database = dbResult?.db_name || 'unknown'
    } catch (error) { const e = error as any; \n      results.database = Error: \n    }

    // Get all tables
    try {
      const tables = await executeQuery(`
        SELECT TABLE_NAME, TABLE_ROWS
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        ORDER BY TABLE_NAME
      `)
      results.tables = tables.map(t => ({ name: t.TABLE_NAME, rows: t.TABLE_ROWS || 0 }))
    } catch (error) { const e = error as any; \n      results.database = Error: \n    }

    // Check certificates table columns
    try {
      const certCols = await executeQuery(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'certificates'
        ORDER BY ORDINAL_POSITION
      `)
      results.certificatesColumns = certCols.map(col => ({
        name: col.COLUMN_NAME,
        type: col.DATA_TYPE,
        nullable: col.IS_NULLABLE === 'YES',
        default: col.COLUMN_DEFAULT
      }))
    } catch (error) { const e = error as any; \n      results.database = Error: \n    }

    // Check students table columns
    try {
      const studentCols = await executeQuery(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students'
        ORDER BY ORDINAL_POSITION
      `)
      results.studentsColumns = studentCols.map(col => ({
        name: col.COLUMN_NAME,
        type: col.DATA_TYPE,
        nullable: col.IS_NULLABLE === 'YES'
      }))
    } catch (error) { const e = error as any; \n      results.database = Error: \n    }

    // Check materials table columns
    try {
      const materialCols = await executeQuery(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'materials'
        ORDER BY ORDINAL_POSITION
      `)
      results.materialsColumns = materialCols.map(col => ({
        name: col.COLUMN_NAME,
        type: col.DATA_TYPE,
        nullable: col.IS_NULLABLE === 'YES'
      }))
    } catch (error) { const e = error as any; \n      results.database = Error: \n    }

    // Test the failing queries
    results.testResults = {}

    // Test 1: Admin certificates with serial_number
    try {
      await executeQuery(`
        SELECT 
          c.id,
          c.serial_number AS serial,
          su.email AS student_name,
          tu.email AS teacher_name,
          st.name_ar AS stage_name,
          c.grade,
          c.status,
          c.issued_at
        FROM certificates c
        JOIN students s ON c.student_id = s.id
        JOIN users su ON s.user_id = su.id
        JOIN teachers t ON c.teacher_id = t.id
        JOIN users tu ON t.user_id = tu.id
        JOIN stages st ON c.stage_id = st.id
        ORDER BY c.issued_at DESC
        LIMIT 1
      `)
      results.testResults.adminCertsSerialNumber = 'SUCCESS'
    } catch (error) { const e = error as any; \n      results.database = Error: \n    }

    // Test 2: Admin certificates with serial
    try {
      await executeQuery(`
        SELECT 
          c.id,
          c.serial AS serial,
          su.email AS student_name,
          tu.email AS teacher_name,
          st.name_ar AS stage_name,
          c.grade,
          c.status,
          c.issued_at
        FROM certificates c
        JOIN students s ON c.student_id = s.id
        JOIN users su ON s.user_id = su.id
        JOIN teachers t ON c.teacher_id = t.id
        JOIN users tu ON t.user_id = tu.id
        JOIN stages st ON c.stage_id = st.id
        ORDER BY c.issued_at DESC
        LIMIT 1
      `)
      results.testResults.adminCertsSerial = 'SUCCESS'
    } catch (error) { const e = error as any; \n      results.database = Error: \n    }

    // Test 3: Materials query
    try {
      await executeQuery(`
        SELECT 
          m.*,
          u.email as teacher_name,
          st.name_ar as stage_name
        FROM materials m
        JOIN teachers t ON m.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        LEFT JOIN stages st ON m.stage_id = st.id
        LIMIT 1
      `)
      results.testResults.materialsQuery = 'SUCCESS'
    } catch (error) { const e = error as any; \n      results.database = Error: \n    }

    // Test 4: Stage progress with stage_id
    try {
      await executeQuery(`
        SELECT 
          st.name_ar as stage,
          COUNT(s.id) as students
        FROM stages st
        LEFT JOIN students s ON st.id = s.stage_id
        GROUP BY st.id, st.name_ar
        ORDER BY st.id
        LIMIT 1
      `)
      results.testResults.stageProgressStageId = 'SUCCESS'
    } catch (error) { const e = error as any; \n      results.database = Error: \n    }

    // Test 5: Stage progress with current_stage_id
    try {
      await executeQuery(`
        SELECT 
          st.name_ar as stage,
          COUNT(s.id) as students
        FROM stages st
        LEFT JOIN students s ON st.id = s.current_stage_id
        GROUP BY st.id, st.name_ar
        ORDER BY st.id
        LIMIT 1
      `)
      results.testResults.stageProgressCurrentStageId = 'SUCCESS'
    } catch (error) { const e = error as any; \n      results.database = Error: \n    }

    return NextResponse.json(results, { status: 200 })

  } catch (error) { const e = error as any; \n      results.database = Error: \n    },
      { status: 500 }
    )
  }
}

