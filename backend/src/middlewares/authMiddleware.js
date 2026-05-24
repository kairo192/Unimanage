import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Student tokens: validate token_version to allow revocation
    if (decoded.role === 'student') {
      const studentRes = await pool.query('SELECT token_version FROM students WHERE id = $1', [decoded.id]);
      if (studentRes.rows.length === 0) {
        return res.status(401).json({ error: 'Student not found' });
      }
      if (studentRes.rows[0].token_version !== decoded.token_version) {
        return res.status(401).json({ error: 'Session has been revoked. Please log in again.' });
      }
      req.student = { id: decoded.id, role: 'student' };
      return next();
    }

    if (!decoded.sessionId) {
      return res.status(401).json({ error: 'Invalid token: missing session' });
    }

    const sessionCheck = await pool.query(
      'SELECT is_revoked FROM user_sessions WHERE session_id = $1',
      [decoded.sessionId]
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(401).json({ error: 'Session not found' });
    }
    if (sessionCheck.rows[0].is_revoked) {
      return res.status(401).json({ error: 'Session has been revoked' });
    }

    req.user = { id: decoded.id, role: decoded.role, sessionId: decoded.sessionId };
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

export const isDirector = (req, res, next) => {
  if (req.user && (req.user.role === 'director' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Director role required.' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    const user = req.user || req.student;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
};
