import pool from '../config/db.js';

export const createTicket = async (student_id, room_id, type, description, priority, image_url) => {
  const query = `
    INSERT INTO tickets (student_id, room_id, type, description, priority, status, image_url)
    VALUES ($1, $2, $3, $4, $5, 'pending', $6)
    RETURNING *;
  `;
  const result = await pool.query(query, [student_id, room_id, type, description, priority, image_url || null]);
  return result.rows[0];
};

export const getAllTickets = async () => {
  const query = `
    SELECT t.*, s.name as student_name, s.email as student_email, r.room_number 
    FROM tickets t
    LEFT JOIN students s ON t.student_id = s.id
    LEFT JOIN rooms r ON t.room_id = r.id
    ORDER BY t.created_at DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getTicketsByStudentId = async (studentId) => {
  const query = `
    SELECT t.*, r.room_number, r.building
    FROM tickets t
    LEFT JOIN rooms r ON t.room_id = r.id
    WHERE t.student_id = $1
    ORDER BY t.created_at DESC;
  `;
  const result = await pool.query(query, [studentId]);
  return result.rows;
};

export const updateTicketStatus = async (id, status) => {
  const query = `
    UPDATE tickets
    SET status = $1
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};

export const deleteTicketById = async (id) => {
  const query = `DELETE FROM tickets WHERE id = $1 RETURNING *;`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const checkStudentExists = async (id) => {
  const result = await pool.query('SELECT id FROM students WHERE id = $1', [id]);
  return result.rows.length > 0;
};

export const checkRoomExists = async (id) => {
  const result = await pool.query('SELECT id FROM rooms WHERE id = $1', [id]);
  return result.rows.length > 0;
};
