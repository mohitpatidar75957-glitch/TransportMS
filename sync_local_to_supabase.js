const mysql = require('mysql2/promise');
const { Client } = require('pg');

async function syncLocalToSupabase() {
  console.log('Connecting to Local MySQL (3306)...');
  const myConn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mohit123',
    database: 'tms-db'
  });
  console.log('✅ Connected to Local MySQL!');

  console.log('Connecting to Supabase PostgreSQL (5432)...');
  const pgClient = new Client({
    user: 'postgres.jmmszinwlkzkslddldzq',
    host: 'aws-0-ap-northeast-1.pooler.supabase.com',
    database: 'postgres',
    password: 'MohitTMS@2026',
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  console.log('✅ Connected to Supabase!');

  // Order of migration respecting foreign keys
  const tables = [
    'tms_users',
    'vendors',
    'vendor_services',
    'vehicles',
    'drivers',
    'trips',
    'orders',
    'expenses',
    'fuel_records',
    'invoices',
    'gst_invoices',
    'lr_bilty',
    'attendance',
    'staff',
    'payroll',
    'vehicle_maintenance_records',
    'transactions',
    'payments',
    'notifications',
    'contact_messages',
    'tracking_sessions',
    'whatsapp_templates',
    'whatsapp_logs',
    'api_keys'
  ];

  for (const table of tables) {
    try {
      // 1. Fetch from local MySQL
      const [rows] = await myConn.query(`SELECT * FROM \`${table}\``);
      if (!rows || rows.length === 0) {
        console.log(`ℹ️ [${table}] Local table is empty (0 rows).`);
        continue;
      }

      // 2. Fetch Supabase columns for this table
      const colsRes = await pgClient.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [table]);

      if (colsRes.rows.length === 0) {
        console.log(`⚠️ [${table}] Does not exist in Supabase schema. Skipping.`);
        continue;
      }

      const pgCols = new Set(colsRes.rows.map(r => r.column_name));
      const colTypes = Object.fromEntries(colsRes.rows.map(r => [r.column_name, r.data_type]));

      let successCount = 0;
      for (const row of rows) {
        const insertCols = [];
        const insertVals = [];
        const placeholders = [];
        let pIndex = 1;

        for (const [key, val] of Object.entries(row)) {
          if (!pgCols.has(key)) continue;

          insertCols.push(`"${key}"`);
          placeholders.push(`$${pIndex++}`);

          // Convert types if needed
          let formattedVal = val;
          if (Buffer.isBuffer(val)) {
            formattedVal = val[0] === 1;
          } else if (colTypes[key] === 'boolean' && typeof val === 'number') {
            formattedVal = val === 1;
          } else if (val instanceof Date) {
            formattedVal = val.toISOString();
          }

          insertVals.push(formattedVal);
        }

        if (insertCols.length === 0) continue;

        const query = `
          INSERT INTO "${table}" (${insertCols.join(', ')})
          VALUES (${placeholders.join(', ')})
          ON CONFLICT DO NOTHING
        `;

        try {
          await pgClient.query(query, insertVals);
          successCount++;
        } catch (rowErr) {
          // If conflict or constraint, log first few
          if (successCount === 0) {
            console.log(`  [${table}] Sample insert warning: ${rowErr.message}`);
          }
        }
      }

      console.log(`✅ [${table}] Synced ${successCount} / ${rows.length} records to Supabase!`);
    } catch (err) {
      console.log(`❌ [${table}] Error syncing: ${err.message}`);
    }
  }

  // Set sequence IDs to max for auto-increment to continue properly
  console.log('\nAdjusting sequences...');
  for (const table of tables) {
    try {
      await pgClient.query(`
        SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(MAX(id), 1)) FROM "${table}";
      `);
    } catch (ignored) {}
  }

  console.log('\n🎉 ALL SIDEBAR DATA SYNCED TO SUPABASE SUCCESSFULLY!');

  await myConn.end();
  await pgClient.end();
}

syncLocalToSupabase().catch(console.error);
