const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  user: 'postgres.jmmszinwlkzkslddldzq',
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  database: 'postgres',
  password: 'MohitTMS@2026',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  const content = fs.readFileSync('backup_utf8.sql', 'utf8');
  const lines = content.split(/\r?\n/);

  // Extract inserts
  const insertStatements = [];
  for (const line of lines) {
    if (line.startsWith('INSERT INTO `')) {
      insertStatements.push(line);
    }
  }

  console.log(`Found ${insertStatements.length} table insert blocks.`);

  // Drop FK constraints temporarily or ignore conflicts
  await client.query('SET session_replication_role = replica;').catch(err => console.log('Replica mode failed (might be fine):', err.message));

  for (const stmt of insertStatements) {
    // Parse table name
    const endTbl = stmt.indexOf('`', 13);
    const tblName = stmt.substring(13, endTbl);

    // Replace MySQL backticks with double quotes for PostgreSQL
    // Also convert _binary '\0' to false / 0, _binary ' ' to true / 1
    let pgSql = stmt
      .replace(/`([a-zA-Z0-9_]+)`/g, '"$1"')
      .replace(/_binary '\\0'/g, 'false')
      .replace(/_binary ' '/g, 'true')
      .replace(/_binary '\\x01'/g, 'true')
      .replace(/_binary '\\x00'/g, 'false');

    // Add ON CONFLICT DO NOTHING so existing users/vendors don't error
    pgSql = pgSql.trim();
    if (pgSql.endsWith(';')) {
      pgSql = pgSql.substring(0, pgSql.length - 1);
    }
    pgSql += ' ON CONFLICT DO NOTHING;';

    try {
      await client.query(pgSql);
      console.log(`✅ Migrated: ${tblName}`);
    } catch (err) {
      console.error(`❌ Failed migrating ${tblName}:`, err.message);
    }
  }

  await client.query('SET session_replication_role = DEFAULT;').catch(() => {});
  console.log('\nMigration finished!');

  // Verify counts
  const checkTables = ['vehicles', 'drivers', 'trips', 'orders', 'fuel_records', 'invoices', 'lr_bilty', 'attendance', 'payroll', 'staff', 'vehicle_maintenance_records'];
  console.log('\n--- Updated Counts in Supabase ---');
  for (const t of checkTables) {
    const res = await client.query(`SELECT COUNT(*) FROM "${t}"`);
    console.log(`${t}: ${res.rows[0].count}`);
  }

  await client.end();
}

migrate().catch(console.error);
