import pool from './src/config/db.js';

async function check() {
  try {
    const users = await pool.query("SELECT id, name, email, role FROM users");
    console.log("Users:", users.rows);

    const sessions = await pool.query("SELECT * FROM user_sessions");
    console.log("Sessions:", sessions.rows);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

check();
