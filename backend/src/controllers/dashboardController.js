import pool from '../config/db.js';

export const getOverview = async (req, res) => {
  try {
    const [studentCount, roomCount, ticketStats, occupiedRooms, studentsByLevel, roomsByBloc] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM students'),
      pool.query('SELECT COUNT(*) as count FROM rooms'),
      pool.query('SELECT status, COUNT(*) as count FROM tickets GROUP BY status'),
      pool.query('SELECT COUNT(DISTINCT room_id) as count FROM students WHERE room_id IS NOT NULL'),
      pool.query("SELECT COALESCE(study_year, 'Unknown') as name, COUNT(*) as value FROM students GROUP BY study_year ORDER BY value DESC"),
      pool.query(`
        SELECT r.building as name, 
               COUNT(r.id) as total, 
               COALESCE(SUM(r.capacity), 0) as total_beds,
               COALESCE((
                 SELECT COUNT(st.id) 
                 FROM students st 
                 JOIN rooms rm ON st.room_id = rm.id 
                 WHERE rm.building = r.building
               ), 0) as occupied,
               COALESCE(SUM(CASE WHEN r.status = 'full' THEN 1 ELSE 0 END), 0) as full_rooms
        FROM rooms r
        GROUP BY r.building
      `)
    ]);

    const totalRooms = parseInt(roomCount.rows[0].count) || 0;
    const occupied   = parseInt(occupiedRooms.rows[0].count) || 0;
    const occupancyRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

    let activeTickets = 0;
    let resolvedTickets = 0;
    ticketStats.rows.forEach(row => {
      if (row.status === 'pending' || row.status === 'in_progress') activeTickets += parseInt(row.count);
      if (row.status === 'resolved') resolvedTickets += parseInt(row.count);
    });

    res.status(200).json({
      students: parseInt(studentCount.rows[0].count) || 0,
      rooms: totalRooms,
      occupancyRate,
      activeTickets,
      resolvedTickets,
      chartStudents: studentsByLevel.rows,
      chartRooms: roomsByBloc.rows.map(r => ({
        name: r.name || 'Main',
        Total: parseInt(r.total),
        Full: parseInt(r.full_rooms)
      }))
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Server error while fetching dashboard overview' });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const alerts = [];

    const [
      studentCount, 
      roomCount, 
      recentTickets, 
      blockIssues,
      expiredCatering,
      expiringCatering,
      lowStockCatering,
      overoccupiedRooms,
      pendingHighTickets,
      lowStockHousing
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM students'),
      pool.query('SELECT COUNT(*) as count FROM rooms'),
      pool.query(`SELECT COUNT(*) as count FROM tickets WHERE created_at >= NOW() - INTERVAL '24 hours'`),
      pool.query(`
        SELECT r.building, COUNT(t.id) as issues
        FROM tickets t
        JOIN rooms r ON t.room_id = r.id
        WHERE t.status != 'resolved'
        GROUP BY r.building
        HAVING COUNT(t.id) >= 5
      `),
      pool.query(`SELECT *, (expiry_date - CURRENT_DATE) as days FROM catering_inventory WHERE expiry_date <= CURRENT_DATE LIMIT 5`),
      pool.query(`SELECT *, (expiry_date - CURRENT_DATE) as days FROM catering_inventory WHERE expiry_date > CURRENT_DATE AND expiry_date <= CURRENT_DATE + 7 LIMIT 5`),
      pool.query(`SELECT * FROM catering_inventory WHERE quantity <= min_alert_threshold LIMIT 5`),
      pool.query(`
        SELECT r.room_number, r.building, r.capacity, COUNT(s.id) as occupied
        FROM rooms r
        JOIN students s ON s.room_id = r.id
        GROUP BY r.id, r.room_number, r.building, r.capacity
        HAVING COUNT(s.id) > r.capacity
        LIMIT 5
      `),
      pool.query(`
        SELECT t.*, r.room_number, r.building 
        FROM tickets t 
        JOIN rooms r ON t.room_id = r.id 
        WHERE t.status = 'pending' AND t.priority = 'high' 
        LIMIT 5
      `),
      pool.query(`SELECT * FROM housing_inventory WHERE quantity <= min_alert_threshold LIMIT 5`)
    ]);

    const s = parseInt(studentCount.rows[0].count) || 0;
    const r = parseInt(roomCount.rows[0].count) || 0;

    // 1. General occupancy warning
    if (r > 0 && (s / r) > 0.95) {
      alerts.push({ type: 'warning', message: 'Capacity nearing 100% — consider room redistribution' });
    }

    // 2. Ticket spike
    if (parseInt(recentTickets.rows[0].count) > 20) {
      alerts.push({ type: 'danger', message: 'Spike in maintenance tickets in the last 24 hours' });
    }

    // 3. Block level unresolved issues
    blockIssues.rows.forEach(row => {
      if (row.building) {
        alerts.push({ type: 'danger', message: `Building ${row.building}: ${row.issues} unresolved maintenance issues` });
      }
    });

    // 4. Food Safety alerts (Expired)
    expiredCatering.rows.forEach(item => {
      alerts.push({ type: 'danger', message: `Food Safety: Perished batch of ${item.name} detected at ${item.location || 'Depot'}!` });
    });

    // 5. Food Expiry alerts (Expiring soon)
    expiringCatering.rows.forEach(item => {
      alerts.push({ type: 'warning', message: `Food Expiry: ${item.name} at ${item.location || 'Depot'} expires in ${item.days} days!` });
    });

    // 6. Food Stock Level alerts (Low stock)
    lowStockCatering.rows.forEach(item => {
      alerts.push({ type: 'warning', message: `Low Stock: Only ${item.quantity} ${item.unit} of ${item.name} left at ${item.location || 'Depot'}!` });
    });

    // 7. Overpopulation alerts
    overoccupiedRooms.rows.forEach(row => {
      alerts.push({ type: 'danger', message: `Overcapacity Warning: Room ${row.building}-${row.room_number} exceeds its capacity of ${row.capacity}!` });
    });

    // 8. Unresolved Critical Maintenance Tickets
    pendingHighTickets.rows.forEach(ticket => {
      alerts.push({ type: 'danger', message: `Critical Issue: Room ${ticket.building}-${ticket.room_number} needs ${ticket.type} - "${ticket.description}"` });
    });

    // 9. Housing Stock alerts (Low stock)
    lowStockHousing.rows.forEach(item => {
      alerts.push({ type: 'warning', message: `Housing Stock: Only ${item.quantity} ${item.unit} of ${item.name} remaining at ${item.location || 'Depot'}!` });
    });

    res.status(200).json(alerts);
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ error: 'Server error while fetching alerts' });
  }
};

export const getStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.name, s.student_number, s.faculty, s.status,
             r.room_number, r.building
      FROM students s
      LEFT JOIN rooms r ON s.room_id = r.id
      ORDER BY s.name ASC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Server error while fetching students' });
  }
};

export const getRooms = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.room_number, r.building, r.capacity,
             (SELECT COUNT(*) FROM students st WHERE st.room_id = r.id) as occupied_count,
             CASE WHEN (SELECT COUNT(*) FROM students st WHERE st.room_id = r.id) >= r.capacity THEN 'full' ELSE 'available' END as status,
             COALESCE(
               (SELECT json_agg(json_build_object('id', st.id, 'name', st.name, 'speciality', st.speciality, 'study_year', st.study_year))
                FROM students st WHERE st.room_id = r.id), '[]'
             ) as students,
             COALESCE(
               (SELECT json_agg(json_build_object('id', t.id, 'type', t.type, 'description', t.description, 'priority', t.priority, 'status', t.status))
                FROM tickets t WHERE t.room_id = r.id AND t.status != 'resolved'), '[]'
             ) as tickets
      FROM rooms r
      ORDER BY r.building ASC, r.room_number ASC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Server error while fetching rooms' });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { building, room_number, capacity } = req.body;

    if (!building || !room_number) {
      return res.status(400).json({ error: 'Building and room number are required.' });
    }

    const check = await pool.query('SELECT id FROM rooms WHERE building = $1 AND room_number = $2', [building, room_number]);
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'This room already exists in this block.' });
    }

    const result = await pool.query(
      'INSERT INTO rooms (building, room_number, capacity, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [building, room_number, capacity || 2, 'available']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Server error while creating room' });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { building, room_number, capacity, status } = req.body;
    const result = await pool.query(
      'UPDATE rooms SET building=$1, room_number=$2, capacity=$3, status=$4 WHERE id=$5 RETURNING *',
      [building, room_number, capacity, status || 'available', id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ error: 'Server error while updating room' });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM rooms WHERE id=$1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Room not found' });
    res.status(200).json({ message: 'Room deleted' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Server error while deleting room' });
  }
};
