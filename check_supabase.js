const { Client } = require('pg');

const client = new Client({
  user: 'postgres.jmmszinwlkzkslddldzq',
  host: 'aws-0-ap-northeast-1.pooler.supabase.com',
  database: 'postgres',
  password: 'MohitTMS@2026',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

  console.log('\n--- Table Row Counts in Supabase ---');
  for (const row of tablesRes.rows) {
    const tableName = row.table_name;
    try {
      const countRes = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
      console.log(`${tableName}: ${countRes.rows[0].count}`);
    } catch (e) {
      console.log(`${tableName}: Error (${e.message})`);
    }
  }

  await client.end();
}

check().catch(console.error);
