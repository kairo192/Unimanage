import pkg from 'pg';
import bcrypt from 'bcryptjs';
const { Pool } = pkg;
const pool = new Pool({ connectionString: 'postgresql://postgres.eljyjujwwvlzupvloeki:LASTkiro%40009@aws-0-eu-west-1.pooler.supabase.com:6543/postgres' });

try {
  // Check if test student exists
  const existing = await pool.query("SELECT id, name, email FROM students WHERE email = 'student@test.com'");
  let studentId;
  if (existing.rows.length > 0) {
    studentId = existing.rows[0].id;
    console.log('Student already exists, ID:', studentId);
  } else {
    // Find a room to assign
    const rooms = await pool.query('SELECT id, room_number FROM rooms LIMIT 1');
    let roomId = null;
    if (rooms.rows.length > 0) roomId = rooms.rows[0].id;
    
    const r = await pool.query(
      `INSERT INTO students (name, email, student_number, room_id) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Test Student', 'student@test.com', 'STU001', roomId]
    );
    studentId = r.rows[0].id;
    console.log('Created student ID:', studentId);
  }

  // Set password
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash('test1234', salt);
  await pool.query('UPDATE students SET password = $1 WHERE id = $2', [hashed, studentId]);
  console.log('Password set to: test1234');

  // Verify
  const verify = await pool.query("SELECT id, name, email, student_number FROM students WHERE id = $1 AND password IS NOT NULL", [studentId]);
  console.log('Account ready:', verify.rows[0]);
} catch(e) { console.error('Error:', e.message); }
pool.end();
