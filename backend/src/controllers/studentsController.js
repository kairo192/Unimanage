import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

// Get all students with their room details
export const getStudents = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT s.id, s.name, s.email, s.student_number, s.room_id, s.enrollment_date, s.residence,
             r.room_number, r.building,
             CASE WHEN s.password IS NOT NULL AND s.password != '' THEN true ELSE false END as has_password
      FROM students s
      LEFT JOIN rooms r ON s.room_id = r.id
      ORDER BY s.name ASC
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Create a new student
export const createStudent = async (req, res) => {
  try {
    const {
      first_name, last_name, email, date_of_birth, gender,
      phone, wilaya, baladiya, national_id, student_number,
      department, speciality, study_year, faculty, status,
      residence, building, room_number
    } = req.body;

    const fullName = `${first_name} ${last_name}`;

    let final_room_id = null;
    if (building && room_number) {
      const roomCheck = await pool.query(
        'SELECT id, capacity, (SELECT COUNT(*) FROM students WHERE room_id = rooms.id) as occupied FROM rooms WHERE building = $1 AND room_number = $2',
        [building, room_number]
      );
      if (roomCheck.rows.length > 0) {
        const room = roomCheck.rows[0];
        if (parseInt(room.occupied) >= parseInt(room.capacity)) {
          return res.status(400).json({ error: `Room ${building}-${room_number} is already at full capacity!` });
        }
        final_room_id = room.id;
      } else {
        const newRoom = await pool.query('INSERT INTO rooms (building, room_number, capacity, status) VALUES ($1, $2, 2, $3) RETURNING id', [building, room_number, 'available']);
        final_room_id = newRoom.rows[0].id;
      }
    }

    let hashedPassword = null;
    const pwd = req.body.password;
    if (pwd && typeof pwd === 'string' && pwd.trim().length > 0) {
      if (pwd.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(pwd, salt);
    }

    const query = `
      INSERT INTO students (
        name, first_name, last_name, email, date_of_birth, gender,
        phone, wilaya, baladiya, national_id, student_number,
        department, speciality, study_year, room_id, faculty, status, residence, password, token_version
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 0
      ) RETURNING *
    `;

    const values = [
      fullName, first_name, last_name, email || null, date_of_birth || null, gender || null,
      phone || null, wilaya || null, baladiya || null, national_id || null, student_number || null,
      department || null, speciality || null, study_year || null, final_room_id, faculty || null, status || 'active', residence || null,
      hashedPassword
    ];

    const { rows } = await pool.query(query, values);
    const { password: _, ...student } = rows[0];
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    if (error.code === '23505') { // unique violation
      return res.status(400).json({ error: 'A student with this Student Number, National ID, or Email already exists.' });
    }
    res.status(500).json({ error: 'Failed to create student' });
  }
};

// Update a student
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name, last_name, email, date_of_birth, gender,
      phone, wilaya, baladiya, national_id, student_number,
      department, speciality, study_year, faculty, status,
      residence, building, room_number
    } = req.body;

    const fullName = `${first_name} ${last_name}`;

    let final_room_id = null;
    if (building && room_number) {
      const roomCheck = await pool.query(
        'SELECT id, capacity, (SELECT COUNT(*) FROM students WHERE room_id = rooms.id AND id != $3) as occupied FROM rooms WHERE building = $1 AND room_number = $2',
        [building, room_number, id]
      );
      if (roomCheck.rows.length > 0) {
        const room = roomCheck.rows[0];
        if (parseInt(room.occupied) >= parseInt(room.capacity)) {
          return res.status(400).json({ error: `Room ${building}-${room_number} is already at full capacity!` });
        }
        final_room_id = room.id;
      } else {
        const newRoom = await pool.query('INSERT INTO rooms (building, room_number, capacity, status) VALUES ($1, $2, 2, $3) RETURNING id', [building, room_number, 'available']);
        final_room_id = newRoom.rows[0].id;
      }
    }

    let hashedPassword = null;
    const pwd = req.body.password;
    if (pwd && typeof pwd === 'string' && pwd.trim().length > 0) {
      if (pwd.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(pwd, salt);
    }

    const passwordClause = hashedPassword ? ', password=$20, token_version = token_version + 1' : '';
    const query = `
      UPDATE students SET
        name=$1, first_name=$2, last_name=$3, email=$4, date_of_birth=$5, gender=$6,
        phone=$7, wilaya=$8, baladiya=$9, national_id=$10, student_number=$11,
        department=$12, speciality=$13, study_year=$14, room_id=$15, faculty=$16, status=$17, residence=$18
        ${passwordClause}
      WHERE id=$19 RETURNING *
    `;

    const values = [
      fullName, first_name, last_name, email || null, date_of_birth || null, gender || null,
      phone || null, wilaya || null, baladiya || null, national_id || null, student_number || null,
      department || null, speciality || null, study_year || null, final_room_id, faculty || null, status || 'active', residence || null,
      id
    ];
    if (hashedPassword) values.push(hashedPassword);

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    const { password: _, ...student } = rows[0];
    res.status(200).json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
};

// Delete a student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM students WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Student not found' });
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

// Smart Match
export const smartAssign = async (req, res) => {
  try {
    const { speciality, study_year } = req.query;
    const query = `
      SELECT r.building, r.room_number,
             COUNT(s.id) as occupants,
             SUM(CASE WHEN s.speciality = $1 OR s.study_year = $2 THEN 1 ELSE 0 END) as match_score
      FROM rooms r
      LEFT JOIN students s ON s.room_id = r.id
      GROUP BY r.id, r.building, r.room_number, r.capacity
      HAVING COUNT(s.id) < r.capacity
      ORDER BY match_score DESC, occupants DESC, r.building ASC
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [speciality || '', study_year || '']);
    if (rows.length > 0) {
      res.status(200).json({ building: rows[0].building, room_number: rows[0].room_number });
    } else {
      res.status(404).json({ error: 'No available rooms found' });
    }
  } catch (error) {
    console.error('smartAssign error:', error);
    res.status(500).json({ error: 'Failed to find a room' });
  }
};

// Unassign
export const unassignStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE students SET room_id = NULL WHERE id = $1', [id]);
    res.status(200).json({ message: 'Unassigned successfully' });
  } catch (error) {
    console.error('unassignStudent error:', error);
    res.status(500).json({ error: 'Failed to unassign student' });
  }
};
