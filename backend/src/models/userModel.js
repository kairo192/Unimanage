import pool from '../config/db.js';

export const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase();

export const findUserByEmail = async (email) => {
  const norm = normalizeEmail(email);
  const result = await pool.query('SELECT * FROM users WHERE LOWER(TRIM(email)) = $1', [norm]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const createUser = async (name, email, password, role = 'staff') => {
  const query = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, avatar, created_at
  `;
  const result = await pool.query(query, [name, email, password, role]);
  return result.rows[0];
};

export const getAllUsers = async () => {
  const result = await pool.query('SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC');
  return result.rows;
};

export const deleteUserById = async (id) => {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
};

export const updateUserById = async (id, name, email, role, hashedPassword = null) => {
  if (hashedPassword) {
    const query = `
      UPDATE users 
      SET name = $1, email = $2, role = $3, password = $4
      WHERE id = $5
      RETURNING id, name, email, role, avatar, created_at
    `;
    const result = await pool.query(query, [name, email, role, hashedPassword, id]);
    return result.rows[0];
  } else {
    const query = `
      UPDATE users 
      SET name = $1, email = $2, role = $3
      WHERE id = $4
      RETURNING id, name, email, role, avatar, created_at
    `;
    const result = await pool.query(query, [name, email, role, id]);
    return result.rows[0];
  }
};

export const updateUserProfile = async (id, name, avatarUrl = null, hashedPassword = null) => {
  let query;
  let params;

  if (hashedPassword && avatarUrl) {
    query = `
      UPDATE users 
      SET name = $1, avatar = $2, password = $3
      WHERE id = $4
      RETURNING id, name, email, role, avatar, created_at
    `;
    params = [name, avatarUrl, hashedPassword, id];
  } else if (hashedPassword) {
    query = `
      UPDATE users 
      SET name = $1, password = $2
      WHERE id = $3
      RETURNING id, name, email, role, avatar, created_at
    `;
    params = [name, hashedPassword, id];
  } else if (avatarUrl) {
    query = `
      UPDATE users 
      SET name = $1, avatar = $2
      WHERE id = $3
      RETURNING id, name, email, role, avatar, created_at
    `;
    params = [name, avatarUrl, id];
  } else {
    query = `
      UPDATE users 
      SET name = $1
      WHERE id = $2
      RETURNING id, name, email, role, avatar, created_at
    `;
    params = [name, id];
  }

  const result = await pool.query(query, params);
  return result.rows[0];
};

