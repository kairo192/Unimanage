import bcrypt from 'bcryptjs';
import app from './app.js';
import pool from './config/db.js';
import { ensureBucket } from './utils/storage.js';

const PORT = process.env.PORT || 5000;

const createTables = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(50) DEFAULT 'staff',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id SERIAL PRIMARY KEY,
      room_number VARCHAR(20) UNIQUE NOT NULL,
      capacity INT DEFAULT 2,
      status VARCHAR(20) DEFAULT 'available'
    );

    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      room_id INT REFERENCES rooms(id) ON DELETE SET NULL,
      enrollment_date TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      student_id INT REFERENCES students(id) ON DELETE CASCADE,
      room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
      type VARCHAR(50),
      description TEXT,
      priority VARCHAR(20) DEFAULT 'low',
      status VARCHAR(30) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      user_name VARCHAR(100),
      user_email VARCHAR(150),
      user_role VARCHAR(50),
      action VARCHAR(100) NOT NULL,
      details TEXT,
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT NOW()
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);
    ALTER TABLE rooms ADD COLUMN IF NOT EXISTS building VARCHAR(100);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS student_number VARCHAR(50) UNIQUE;
    ALTER TABLE students ADD COLUMN IF NOT EXISTS faculty VARCHAR(100);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    ALTER TABLE students ALTER COLUMN email DROP NOT NULL;
    
    -- New Comprehensive Student Fields
    ALTER TABLE students ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE;
    ALTER TABLE students ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS wilaya VARCHAR(100);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS baladiya VARCHAR(100);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS national_id VARCHAR(100) UNIQUE;
    ALTER TABLE students ADD COLUMN IF NOT EXISTS department VARCHAR(100);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS speciality VARCHAR(150);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS study_year VARCHAR(20);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS residence VARCHAR(100);
    ALTER TABLE students ADD COLUMN IF NOT EXISTS password TEXT;
    ALTER TABLE students ADD COLUMN IF NOT EXISTS token_version INTEGER DEFAULT 0;
    ALTER TABLE tickets ADD COLUMN IF NOT EXISTS image_url TEXT;

    CREATE TABLE IF NOT EXISTS catering_inventory (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(50) NOT NULL,
      quantity DECIMAL(10,2) DEFAULT 0.00,
      unit VARCHAR(20) DEFAULT 'kg',
      min_alert_threshold DECIMAL(10,2) DEFAULT 10.00,
      expiry_date DATE NOT NULL,
      supplier VARCHAR(150),
      location VARCHAR(100) DEFAULT 'Central Kitchen Cold Store',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS catering_consumption (
      id SERIAL PRIMARY KEY,
      item_id INT REFERENCES catering_inventory(id) ON DELETE CASCADE,
      quantity_used DECIMAL(10,2) NOT NULL,
      used_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
      residence_name VARCHAR(100) DEFAULT 'Hassan Khira Dining Hall',
      used_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS housing_inventory (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      category VARCHAR(50) NOT NULL,
      quantity DECIMAL(10,2) DEFAULT 0.00,
      unit VARCHAR(20) DEFAULT 'pcs',
      min_alert_threshold DECIMAL(10,2) DEFAULT 10.00,
      supplier VARCHAR(150),
      location VARCHAR(100) DEFAULT 'Central DOU Warehouse B',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS housing_transfers (
      id SERIAL PRIMARY KEY,
      item_id INT REFERENCES housing_inventory(id) ON DELETE CASCADE,
      transfer_type VARCHAR(50) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      destination_residence VARCHAR(150) NOT NULL,
      transferred_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
      transferred_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS it_services (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      name_ar VARCHAR(200),
      name_fr VARCHAR(200),
      floor VARCHAR(50),
      room_number VARCHAR(50),
      description TEXT,
      map_x DECIMAL(8,2) DEFAULT 200,
      map_y DECIMAL(8,2) DEFAULT 200,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS it_devices (
      id SERIAL PRIMARY KEY,
      service_id INT REFERENCES it_services(id) ON DELETE SET NULL,
      device_type VARCHAR(50) NOT NULL,
      pc_code VARCHAR(100),
      brand VARCHAR(100),
      model VARCHAR(100),
      os_version VARCHAR(100),
      ip_address VARCHAR(50),
      mac_address VARCHAR(50),
      status VARCHAR(50) DEFAULT 'operational',
      connected_to_id INT REFERENCES it_devices(id) ON DELETE SET NULL,
      notes TEXT,
      map_x DECIMAL(8,2) DEFAULT 200,
      map_y DECIMAL(8,2) DEFAULT 200,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS it_issues (
      id SERIAL PRIMARY KEY,
      device_id INT REFERENCES it_devices(id) ON DELETE CASCADE,
      issue_type VARCHAR(100),
      description TEXT,
      severity VARCHAR(50) DEFAULT 'medium',
      status VARCHAR(50) DEFAULT 'open',
      reported_by VARCHAR(200),
      resolved_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      session_id VARCHAR(100) UNIQUE NOT NULL,
      browser VARCHAR(100),
      os VARCHAR(100),
      ip_address VARCHAR(45),
      location VARCHAR(150),
      created_at TIMESTAMP DEFAULT NOW(),
      last_active TIMESTAMP DEFAULT NOW(),
      is_revoked BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS stats_snapshots (
      id SERIAL PRIMARY KEY,
      snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(queryText);
    console.log('Database tables ensured.');
  } catch (err) {
    console.error('Error creating tables:', err.message);
  }
};

/** Create default admin if DB has no matching user */
const ensureDefaultAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@blida2.dz';
  const plain = process.env.DEFAULT_ADMIN_PASSWORD;
  if (!plain) {
    console.warn('DEFAULT_ADMIN_PASSWORD not set — skipping default admin creation');
    return;
  }
  try {
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE LOWER(TRIM(email)) = $1',
      [email]
    );
    if (rows.length > 0) return;
    const hashed = await bcrypt.hash(plain, 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'admin')`,
      ['Admin Principal', email, hashed]
    );
    console.log(`Default admin created: ${email}`);
  } catch (err) {
    console.error('ensureDefaultAdmin:', err.message);
  }
};

// Try to connect to DB, but start server regardless
pool.query('SELECT NOW()')
  .then(async () => {
    console.log('Database connection successful.');
    await createTables();
    await ensureDefaultAdmin();
    await ensureBucket();
  })
  .catch((err) => {
    console.error('Warning: Failed to connect to the database. Please check your DATABASE_URL in .env.', err.message);
  });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
