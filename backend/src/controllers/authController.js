import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { findUserByEmail, createUser, findUserById, getAllUsers, updateUserById, deleteUserById, updateUserProfile, normalizeEmail } from '../models/userModel.js';
import { logActivity } from '../utils/activityLogger.js';
import pool from '../config/db.js';
import { parseUserAgent, getIpLocation } from '../utils/sessionHelper.js';
import { uploadToCloud } from '../utils/storage.js';

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128);
const emailSchema = z.string().email('Invalid email format').max(255);

const generateToken = (id, role, sessionId) => {
  return jwt.sign({ id, role, sessionId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const emailNorm = normalizeEmail(email);
    if (!emailNorm) {
      return res.status(400).json({ error: 'Please provide a valid email' });
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      return res.status(400).json({ error: passwordResult.error.errors[0].message });
    }

    const userExists = await findUserByEmail(emailNorm);
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await createUser(name, emailNorm, hashedPassword, role || 'staff');

    // Log registration action
    await logActivity(req, req.user ? req.user.id : null, 'Create Staff', `Created staff account: ${name} (${emailNorm}) with role: ${role || 'staff'}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set; login cannot issue tokens.');
      return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET missing' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const stored = user.password ?? '';
    let isMatch = await bcrypt.compare(password, stored);

    // Legacy: password stored as plain text (or wrong hash) — re-hash on successful plain match
    if (!isMatch && stored && !/^\$2[aby]?\$\d{2}\$/.test(stored) && stored === password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);
      user.password = hashedPassword;
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);

    // Capture IP
    let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    if (ipAddress.includes('::ffff:')) {
      ipAddress = ipAddress.split('::ffff:')[1];
    }

    // Parse UA and location
    const { browser, os } = parseUserAgent(req.headers['user-agent']);
    const location = getIpLocation(ipAddress);

    // Store in DB
    await pool.query(
      `INSERT INTO user_sessions (user_id, session_id, browser, os, ip_address, location)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, sessionId, browser, os, ipAddress, location]
    );

    const token = generateToken(user.id, user.role, sessionId);

    // Log successful login action
    await logActivity(req, user.id, 'Login', `User ${user.name} (${user.email}) logged in successfully.`);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const generateStudentToken = (id, tokenVersion) => {
  return jwt.sign({ id, role: 'student', token_version: tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const studentLogin = async (req, res) => {
  try {
    const { email, password, student_number } = req.body;
    if ((!email && !student_number) || !password) {
      return res.status(400).json({ error: 'Please provide email or student number and password' });
    }

    const result = await pool.query(
      email
        ? 'SELECT id, name, email, password, room_id, student_number, token_version FROM students WHERE email = $1'
        : 'SELECT id, name, email, password, room_id, student_number, token_version FROM students WHERE student_number = $1',
      [email || student_number]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const student = result.rows[0];
    if (!student.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const tokenVersion = student.token_version || 0;
    const token = generateStudentToken(student.id, tokenVersion);

    // Get room info
    const roomResult = await pool.query('SELECT room_number, building FROM rooms WHERE id = $1', [student.room_id]);
    const room = roomResult.rows[0] || null;

    res.status(200).json({
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        studentNumber: student.student_number,
        room: room ? `${room.building || ''} ${room.room_number}`.trim() : 'Not assigned',
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const studentChangePassword = async (req, res) => {
  try {
    if (!req.student) {
      return res.status(403).json({ error: 'Only students can change their password here' });
    }

    const { current_password, new_password } = req.body;
    const studentId = req.student.id;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Please provide current_password and new_password' });
    }

    const passwordResult = passwordSchema.safeParse(new_password);
    if (!passwordResult.success) {
      return res.status(400).json({ error: passwordResult.error.errors[0].message });
    }

    const result = await pool.query('SELECT password FROM students WHERE id = $1', [studentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const stored = result.rows[0].password;
    const isMatch = await bcrypt.compare(current_password, stored);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);
    await pool.query('UPDATE students SET password = $1, token_version = token_version + 1 WHERE id = $2', [hashedPassword, studentId]);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Student change password error:', error);
    res.status(500).json({ error: 'Server error while changing password' });
  }
};

export const directorResetStudentPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ error: 'Please provide new_password' });
    }

    const passwordResult = passwordSchema.safeParse(new_password);
    if (!passwordResult.success) {
      return res.status(400).json({ error: passwordResult.error.errors[0].message });
    }

    const studentCheck = await pool.query('SELECT id, name, email FROM students WHERE id = $1', [id]);
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);
    await pool.query('UPDATE students SET password = $1, token_version = token_version + 1 WHERE id = $2', [hashedPassword, id]);

    const s = studentCheck.rows[0];
    await logActivity(req, req.user.id, 'Reset Student Password', `Reset password for student: ${s.name} (${s.email})`);

    res.status(200).json({ message: 'Student password reset successfully' });
  } catch (error) {
    console.error('Director reset student password error:', error);
    res.status(500).json({ error: 'Server error while resetting student password' });
  }
};

export const studentRegister = async (req, res) => {
  try {
    const { student_id, password } = req.body;
    if (!student_id || !password) {
      return res.status(400).json({ error: 'Please provide student_id and password' });
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      return res.status(400).json({ error: passwordResult.error.errors[0].message });
    }

    const studentCheck = await pool.query('SELECT id, name, email FROM students WHERE id = $1', [student_id]);
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await pool.query('UPDATE students SET password = $1, token_version = COALESCE(token_version, 0) + 1 WHERE id = $2', [hashedPassword, student_id]);

    const s = studentCheck.rows[0];
    await logActivity(req, req.user.id, 'Activate Student Account', `Activated account for student: ${s.name} (${s.email})`);

    res.status(200).json({ message: 'Student account activated successfully' });
  } catch (error) {
    console.error('Student register error:', error);
    res.status(500).json({ error: 'Server error while activating student account' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const { id } = req.params;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const updated = await updateUserById(id, name, email, role, hashedPassword);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log update action
    await logActivity(req, req.user.id, 'Modify Staff', `Modified staff account ID ${id}: set details to ${name} (${email}) with role: ${role}`);

    res.status(200).json({ message: 'User updated successfully', user: updated });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error during user update' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const deleted = await deleteUserById(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log delete action
    await logActivity(req, req.user.id, 'Delete Staff', `Deleted staff account ID: ${id}`);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error during user deletion' });
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 500');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch activity logs error:', error);
    res.status(500).json({ error: 'Server error while fetching activity logs' });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await pool.query(
      `SELECT session_id AS id, browser, os, ip_address AS ip, location, created_at, last_active, is_revoked 
       FROM user_sessions 
       WHERE user_id = $1 AND is_revoked = FALSE 
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    const mapped = sessions.rows.map(row => ({
      ...row,
      is_current: row.id === req.user.sessionId
    }));
    res.status(200).json(mapped);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Server error while fetching sessions' });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }
    // Ensure the session belongs to the user
    const { rows } = await pool.query(
      'SELECT id FROM user_sessions WHERE session_id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    await pool.query(
      'UPDATE user_sessions SET is_revoked = TRUE WHERE session_id = $1',
      [sessionId]
    );
    res.status(200).json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ error: 'Server error while revoking session' });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user?.sessionId) {
      await pool.query(
        'UPDATE user_sessions SET is_revoked = TRUE WHERE session_id = $1 AND user_id = $2',
        [req.user.sessionId, req.user.id]
      );
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Please provide a name' });
    }

    let hashedPassword = null;
    if (password && password.trim() !== '') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        return res.status(400).json({ error: passwordResult.error.errors[0].message });
      }
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    let avatarUrl = null;
    if (req.file) {
      const cloudUrl = await uploadToCloud(req.file.path, `avatars/${req.file.filename}`);
      avatarUrl = cloudUrl || `/uploads/avatars/${req.file.filename}`;
    }

    const updatedUser = await updateUserProfile(userId, name, avatarUrl, hashedPassword);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log update action
    await logActivity(req, userId, 'Update Profile', `User ${updatedUser.name} (${updatedUser.email}) updated their profile details.`);

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        created_at: updatedUser.created_at,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error during profile update' });
  }
};

