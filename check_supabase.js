const { Client } = require('pg');

const client = new Client({
  user: process.env.SUPABASE_DB_USER || 'postgres.jmmszinwlkzkslddldzq',
  host: process.env.SUPABASE_DB_HOST || 'aws-0-ap-northeast-1.pooler.supabase.com',
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || process.env.SPRING_DATASOURCE_PASSWORD || 'MohitTMS@2026',
  port: parseInt(process.env.SUPABASE_DB_PORT || '5432', 10),
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
