import pool from '../config/db.js';

// ── Helper: log activity ─────────────────────────────────────────────────────
const logActivity = async (req, action, details) => {
  try {
    const userId = req.user?.id || null;
    let name = 'System', email = '', role = '';
    if (userId) {
      const userRes = await pool.query('SELECT name, email, role FROM users WHERE id = $1', [userId]);
      if (userRes.rows[0]) {
        name = userRes.rows[0].name;
        email = userRes.rows[0].email;
        role = userRes.rows[0].role;
      }
    } else if (req.user) {
      name = req.user.name || 'System';
      email = req.user.email || '';
      role = req.user.role || '';
    }
    await pool.query(
      `INSERT INTO activity_logs (user_id, user_name, user_email, user_role, action, details)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [userId, name, email, role, action, details]
    );
  } catch (err) {
    console.error('IT activity log error:', err);
  }
};

// ══════════════════════════════════════════════════════════════
// SERVICES CRUD
// ══════════════════════════════════════════════════════════════

export const getServices = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT s.*,
        COUNT(DISTINCT d.id) FILTER (WHERE d.device_type = 'pc')       AS pc_count,
        COUNT(DISTINCT d.id) FILTER (WHERE d.device_type = 'printer')   AS printer_count,
        COUNT(DISTINCT d.id) FILTER (WHERE d.device_type IN ('router','switch','access_point')) AS network_count,
        COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'open')           AS open_issues
      FROM it_services s
      LEFT JOIN it_devices d ON d.service_id = s.id
      LEFT JOIN it_issues  i ON i.device_id  = d.id
      GROUP BY s.id
      ORDER BY s.created_at ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('getServices error:', err);
    res.status(500).json({ error: 'Server error while fetching services.' });
  }
};

export const createService = async (req, res) => {
  const { name, name_ar, name_fr, floor, room_number, description, map_x, map_y } = req.body;
  if (!name) return res.status(400).json({ error: 'Service name is required.' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO it_services (name, name_ar, name_fr, floor, room_number, description, map_x, map_y)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, name_ar || null, name_fr || null, floor || null, room_number || null, description || null, map_x || 200, map_y || 200]
    );
    await logActivity(req, 'IT Service Created', `Added service: ${name}`);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createService error:', err);
    res.status(500).json({ error: 'Server error while creating service.' });
  }
};

export const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, name_ar, name_fr, floor, room_number, description, map_x, map_y } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE it_services SET name=$1, name_ar=$2, name_fr=$3, floor=$4, room_number=$5, description=$6, map_x=$7, map_y=$8
       WHERE id=$9 RETURNING *`,
      [name, name_ar, name_fr, floor, room_number, description, map_x, map_y, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Service not found.' });
    await logActivity(req, 'IT Service Updated', `Updated service: ${rows[0].name}`);
    res.json(rows[0]);
  } catch (err) {
    console.error('updateService error:', err);
    res.status(500).json({ error: 'Server error while updating service.' });
  }
};

export const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('DELETE FROM it_services WHERE id=$1 RETURNING name', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Service not found.' });
    await logActivity(req, 'IT Service Deleted', `Deleted service: ${rows[0].name}`);
    res.json({ message: 'Service deleted.' });
  } catch (err) {
    console.error('deleteService error:', err);
    res.status(500).json({ error: 'Server error while deleting service.' });
  }
};

// ══════════════════════════════════════════════════════════════
// DEVICES CRUD
// ══════════════════════════════════════════════════════════════

export const getDevices = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT d.*,
        s.name AS service_name,
        c.pc_code AS connected_to_code,
        c.device_type AS connected_to_type,
        c.ip_address AS connected_to_ip,
        COUNT(i.id) FILTER (WHERE i.status = 'open') AS open_issues_count
      FROM it_devices d
      LEFT JOIN it_services s ON s.id = d.service_id
      LEFT JOIN it_devices  c ON c.id = d.connected_to_id
      LEFT JOIN it_issues   i ON i.device_id = d.id
      GROUP BY d.id, s.name, c.pc_code, c.device_type, c.ip_address
      ORDER BY d.device_type, d.created_at ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error('getDevices error:', err);
    res.status(500).json({ error: 'Server error while fetching devices.' });
  }
};

export const createDevice = async (req, res) => {
  const { service_id, device_type, pc_code, brand, model, os_version, ip_address, mac_address, status, connected_to_id, notes } = req.body;
  if (!device_type) return res.status(400).json({ error: 'Device type is required.' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO it_devices (service_id, device_type, pc_code, brand, model, os_version, ip_address, mac_address, status, connected_to_id, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [service_id || null, device_type, pc_code || null, brand || null, model || null, os_version || null, ip_address || null, mac_address || null, status || 'operational', connected_to_id || null, notes || null]
    );
    await logActivity(req, 'IT Device Added', `Added ${device_type}: ${pc_code || ip_address || brand}`);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createDevice error:', err);
    res.status(500).json({ error: 'Server error while creating device.' });
  }
};

export const updateDevice = async (req, res) => {
  const { id } = req.params;
  const { service_id, device_type, pc_code, brand, model, os_version, ip_address, mac_address, status, connected_to_id, notes } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE it_devices SET service_id=$1, device_type=$2, pc_code=$3, brand=$4, model=$5,
       os_version=$6, ip_address=$7, mac_address=$8, status=$9, connected_to_id=$10, notes=$11
       WHERE id=$12 RETURNING *`,
      [service_id, device_type, pc_code, brand, model, os_version, ip_address, mac_address, status, connected_to_id || null, notes, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Device not found.' });
    await logActivity(req, 'IT Device Updated', `Updated ${device_type}: ${pc_code || ip_address}`);
    res.json(rows[0]);
  } catch (err) {
    console.error('updateDevice error:', err);
    res.status(500).json({ error: 'Server error while updating device.' });
  }
};

export const deleteDevice = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('DELETE FROM it_devices WHERE id=$1 RETURNING pc_code, device_type', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Device not found.' });
    await logActivity(req, 'IT Device Deleted', `Removed ${rows[0].device_type}: ${rows[0].pc_code}`);
    res.json({ message: 'Device deleted.' });
  } catch (err) {
    console.error('deleteDevice error:', err);
    res.status(500).json({ error: 'Server error while deleting device.' });
  }
};

// ══════════════════════════════════════════════════════════════
// ISSUES CRUD
// ══════════════════════════════════════════════════════════════

export const getIssues = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT i.*,
        d.pc_code, d.device_type, d.ip_address, d.brand,
        s.name AS service_name
      FROM it_issues i
      LEFT JOIN it_devices  d ON d.id = i.device_id
      LEFT JOIN it_services s ON s.id = d.service_id
      ORDER BY 
        CASE i.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
        i.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('getIssues error:', err);
    res.status(500).json({ error: 'Server error while fetching issues.' });
  }
};

export const createIssue = async (req, res) => {
  const { device_id, issue_type, description, severity, reported_by } = req.body;
  if (!device_id || !description) return res.status(400).json({ error: 'Device and description required.' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO it_issues (device_id, issue_type, description, severity, reported_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [device_id, issue_type || 'other', description, severity || 'medium', reported_by || req.user?.id || 'Admin']
    );
    if (severity === 'critical' || severity === 'high') {
      await pool.query(`UPDATE it_devices SET status='faulty' WHERE id=$1`, [device_id]);
    }
    await logActivity(req, 'IT Issue Reported', `${severity} issue on device #${device_id}: ${description.substring(0, 80)}`);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createIssue error:', err);
    res.status(500).json({ error: 'Server error while creating issue.' });
  }
};

export const resolveIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `UPDATE it_issues SET status='resolved', resolved_at=NOW() WHERE id=$1 RETURNING *`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Issue not found.' });
    // Re-check if device still has open issues; if not → operational
    const remaining = await pool.query(
      `SELECT COUNT(*) FROM it_issues WHERE device_id=$1 AND status='open'`,
      [rows[0].device_id]
    );
    if (parseInt(remaining.rows[0].count) === 0) {
      await pool.query(`UPDATE it_devices SET status='operational' WHERE id=$1`, [rows[0].device_id]);
    }
    await logActivity(req, 'IT Issue Resolved', `Resolved issue #${id}`);
    res.json(rows[0]);
  } catch (err) {
    console.error('resolveIssue error:', err);
    res.status(500).json({ error: 'Server error while resolving issue.' });
  }
};

export const deleteIssue = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM it_issues WHERE id=$1', [id]);
    res.json({ message: 'Issue deleted.' });
  } catch (err) {
    console.error('deleteIssue error:', err);
    res.status(500).json({ error: 'Server error while deleting issue.' });
  }
};

// ══════════════════════════════════════════════════════════════
// TOPOLOGY DATA (for the network map)
// ══════════════════════════════════════════════════════════════

export const getTopology = async (req, res) => {
  try {
    const services = await pool.query(`
      SELECT s.*,
        COUNT(DISTINCT d.id) FILTER (WHERE d.device_type='pc')       AS pc_count,
        COUNT(DISTINCT d.id) FILTER (WHERE d.device_type='printer')  AS printer_count,
        COUNT(DISTINCT d.id) FILTER (WHERE d.device_type IN ('router','switch','access_point')) AS net_count,
        COUNT(DISTINCT i.id) FILTER (WHERE i.status='open' AND i.severity IN ('critical','high')) AS critical_issues
      FROM it_services s
      LEFT JOIN it_devices d ON d.service_id = s.id
      LEFT JOIN it_issues  i ON i.device_id  = d.id
      GROUP BY s.id ORDER BY s.created_at ASC
    `);

    const devices = await pool.query(`
      SELECT d.id, d.service_id, d.device_type, d.pc_code, d.brand, d.model,
             d.os_version, d.ip_address, d.status, d.connected_to_id, d.map_x, d.map_y,
             COUNT(i.id) FILTER (WHERE i.status='open') AS open_issues
      FROM it_devices d
      LEFT JOIN it_issues i ON i.device_id = d.id
      GROUP BY d.id ORDER BY d.device_type, d.id
    `);

    res.json({ services: services.rows, devices: devices.rows });
  } catch (err) {
    console.error('getTopology error:', err);
    res.status(500).json({ error: 'Server error while fetching topology.' });
  }
};

// Update service map position (drag & drop on topology map)
export const updateServicePosition = async (req, res) => {
  const { id } = req.params;
  const { map_x, map_y } = req.body;
  try {
    await pool.query(`UPDATE it_services SET map_x=$1, map_y=$2 WHERE id=$3`, [map_x, map_y, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('updateServicePosition error:', err);
    res.status(500).json({ error: 'Server error while updating service position.' });
  }
};

// Update device map position (drag & drop on topology map)
export const updateDevicePosition = async (req, res) => {
  const { id } = req.params;
  const { map_x, map_y } = req.body;
  try {
    await pool.query(`UPDATE it_devices SET map_x=$1, map_y=$2 WHERE id=$3`, [map_x, map_y, id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('updateDevicePosition error:', err);
    res.status(500).json({ error: 'Server error while updating device position.' });
  }
};
