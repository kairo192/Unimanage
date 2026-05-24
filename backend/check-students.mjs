import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ connectionString: 'postgresql://postgres.eljyjujwwvlzupvloeki:LASTkiro%40009@aws-0-eu-west-1.pooler.supabase.com:6543/postgres' });
try {
  const r = await pool.query('SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname=\'public\'');
  console.log('Tables:', r.rows.map(x => x.tablename).join(', '));
  const r1 = await pool.query('SELECT id, name, email FROM students ORDER BY id LIMIT 20');
  console.log('\n=== STUDENTS ===');
  console.table(r1.rows);
  const r2 = await pool.query('SELECT id, name, email, role FROM users ORDER BY id LIMIT 20');
  console.log('\n=== USERS ===');
  console.table(r2.rows);
} catch(e) { console.error('DB Error:', e.message); }
pool.end();
