import pool from '../config/db.js';

/**
 * Logs a user action or system event to the audit trail activity_logs table.
 * 
 * @param {Object} req Express request object (optional, for IP/user tracking)
 * @param {Number|null} userId User ID of the actor (optional)
 * @param {String} action The event name (e.g. 'Login', 'Create Staff')
 * @param {String} details Event description and audit information
 * @param {Object|null} manualUserInfo Override user metadata if user is not in database anymore
 */
export const logActivity = async (req, userId, action, details, manualUserInfo = null) => {
  try {
    let name = manualUserInfo?.name || null;
    let email = manualUserInfo?.email || null;
    let role = manualUserInfo?.role || null;
    let resolvedUserId = userId || (req && req.user ? req.user.id : null);

    if (resolvedUserId && (!name || !email || !role)) {
      const userRes = await pool.query('SELECT name, email, role FROM users WHERE id = $1', [resolvedUserId]);
      if (userRes.rows[0]) {
        name = userRes.rows[0].name;
        email = userRes.rows[0].email;
        role = userRes.rows[0].role;
      }
    }

    // Capture standard remote IPv4 or IPv6
    let ipAddress = req ? req.headers['x-forwarded-for'] || req.socket.remoteAddress : null;
    if (ipAddress && ipAddress.includes('::ffff:')) {
      ipAddress = ipAddress.split('::ffff:')[1];
    }

    const query = `
      INSERT INTO activity_logs (user_id, user_name, user_email, user_role, action, details, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    await pool.query(query, [
      resolvedUserId || null,
      name,
      email,
      role,
      action,
      details,
      ipAddress
    ]);
  } catch (err) {
    console.error('Failed to log activity audit trail:', err.message);
  }
};
