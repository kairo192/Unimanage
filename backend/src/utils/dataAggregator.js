import pool from '../config/db.js';

export const getFullStats = async () => {
  const [
    studentCount,
    roomCount,
    ticketStats,
    activeTicketCount,
    roomsByBloc,
    studentsByLevel,
    studentsByFaculty,
    cateringItems,
    cateringExpiring,
    expiredCatering,
    cateringLowStock,
    housingItems,
    housingLowStock,
    recentTransfers,
    itServiceCount,
    itDeviceCount,
    itOpenIssues,
    itIssuesBySeverity,
    userCount,
    recentActivity,
  ] = await Promise.all([
    pool.query('SELECT COUNT(*) as count FROM students'),
    pool.query('SELECT COUNT(*) as count FROM rooms'),
    pool.query('SELECT status, COUNT(*) as count FROM tickets GROUP BY status'),
    pool.query("SELECT COUNT(*) as count FROM tickets WHERE status != 'resolved'"),
    pool.query(`
      SELECT r.building as name, 
             COUNT(r.id) as total_rooms,
             COALESCE(SUM(r.capacity), 0) as total_beds,
             COALESCE((
               SELECT COUNT(st.id) 
               FROM students st 
               JOIN rooms rm ON st.room_id = rm.id 
               WHERE rm.building = r.building
             ), 0) as occupied_beds
      FROM rooms r
      GROUP BY r.building
    `),
    pool.query("SELECT COALESCE(study_year, 'Unknown') as name, COUNT(*) as value FROM students GROUP BY study_year ORDER BY value DESC"),
    pool.query("SELECT COALESCE(faculty, 'Unknown') as name, COUNT(*) as value FROM students GROUP BY faculty ORDER BY value DESC"),
    pool.query('SELECT COUNT(*) as count FROM catering_inventory'),
    pool.query("SELECT COUNT(*) as count FROM catering_inventory WHERE expiry_date > CURRENT_DATE AND expiry_date <= CURRENT_DATE + 7"),
    pool.query("SELECT COUNT(*) as count FROM catering_inventory WHERE expiry_date <= CURRENT_DATE"),
    pool.query("SELECT COUNT(*) as count FROM catering_inventory WHERE quantity <= min_alert_threshold"),
    pool.query('SELECT COUNT(*) as count FROM housing_inventory'),
    pool.query("SELECT COUNT(*) as count FROM housing_inventory WHERE quantity <= min_alert_threshold"),
    pool.query("SELECT COUNT(*) as count FROM housing_transfers WHERE transferred_at >= NOW() - INTERVAL '30 days'"),
    pool.query('SELECT COUNT(*) as count FROM it_services'),
    pool.query('SELECT COUNT(*) as count FROM it_devices'),
    pool.query("SELECT COUNT(*) as count FROM it_issues WHERE status = 'open'"),
    pool.query("SELECT severity, COUNT(*) as count FROM it_issues WHERE status = 'open' GROUP BY severity"),
    pool.query('SELECT COUNT(*) as count FROM users'),
    pool.query("SELECT action, details, created_at FROM activity_logs ORDER BY created_at DESC LIMIT 10"),
  ]);

  const stats = {
    students: parseInt(studentCount.rows[0].count) || 0,
    rooms: parseInt(roomCount.rows[0].count) || 0,
    occupancyRate: 0,
    activeTickets: parseInt(activeTicketCount.rows[0].count) || 0,
    ticketStatusBreakdown: ticketStats.rows,
    roomsByBloc: roomsByBloc.rows,
    studentsByLevel: studentsByLevel.rows,
    studentsByFaculty: studentsByFaculty.rows,
    catering: {
      totalItems: parseInt(cateringItems.rows[0].count) || 0,
      expiringWithin7Days: parseInt(cateringExpiring.rows[0].count) || 0,
      expired: parseInt(expiredCatering.rows[0].count) || 0,
      lowStock: parseInt(cateringLowStock.rows[0].count) || 0,
    },
    housing: {
      totalItems: parseInt(housingItems.rows[0].count) || 0,
      lowStock: parseInt(housingLowStock.rows[0].count) || 0,
      transfersLast30Days: parseInt(recentTransfers.rows[0].count) || 0,
    },
    it: {
      services: parseInt(itServiceCount.rows[0].count) || 0,
      devices: parseInt(itDeviceCount.rows[0].count) || 0,
      openIssues: parseInt(itOpenIssues.rows[0].count) || 0,
      issuesBySeverity: itIssuesBySeverity.rows,
    },
    staff: parseInt(userCount.rows[0].count) || 0,
    recentActivity: recentActivity.rows,
  };

  const totalBeds = roomsByBloc.rows.reduce((sum, r) => sum + parseInt(r.total_beds), 0);
  const occupied = roomsByBloc.rows.reduce((sum, r) => sum + parseInt(r.occupied_beds), 0);
  stats.occupancyRate = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;

  return stats;
};

export const getModuleStats = async (module) => {
  switch (module) {
    case 'residence': {
      const [studentCount, roomCount, roomsByBloc, studentsByLevel, studentsByFaculty, occupiedRooms] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM students'),
        pool.query('SELECT COUNT(*) as count FROM rooms'),
        pool.query(`
          SELECT r.building as name, COUNT(r.id) as total_rooms, COALESCE(SUM(r.capacity), 0) as total_beds,
            COALESCE((SELECT COUNT(st.id) FROM students st JOIN rooms rm ON st.room_id = rm.id WHERE rm.building = r.building), 0) as occupied_beds
          FROM rooms r GROUP BY r.building
        `),
        pool.query("SELECT COALESCE(study_year, 'Unknown') as name, COUNT(*) as value FROM students GROUP BY study_year ORDER BY value DESC"),
        pool.query("SELECT COALESCE(faculty, 'Unknown') as name, COUNT(*) as value FROM students GROUP BY faculty ORDER BY value DESC"),
        pool.query('SELECT COUNT(DISTINCT room_id) as count FROM students WHERE room_id IS NOT NULL'),
      ]);
      const total = parseInt(studentCount.rows[0].count) || 0;
      const rooms = parseInt(roomCount.rows[0].count) || 0;
      const occupied = parseInt(occupiedRooms.rows[0].count) || 0;
      return { students: total, rooms, occupancyRate: rooms > 0 ? Math.round((occupied / rooms) * 100) : 0, roomsByBloc: roomsByBloc.rows, studentsByLevel: studentsByLevel.rows, studentsByFaculty: studentsByFaculty.rows };
    }
    case 'maintenance': {
      const [ticketStats, ticketTypePriority, recentTickets, pendingHigh] = await Promise.all([
        pool.query('SELECT status, COUNT(*) as count FROM tickets GROUP BY status'),
        pool.query("SELECT type, priority, COUNT(*) as count FROM tickets WHERE status != 'resolved' GROUP BY type, priority"),
        pool.query("SELECT COUNT(*) as count FROM tickets WHERE created_at >= NOW() - INTERVAL '24 hours'"),
        pool.query("SELECT t.*, r.room_number, r.building FROM tickets t JOIN rooms r ON t.room_id = r.id WHERE t.status = 'pending' AND t.priority = 'high' LIMIT 10"),
      ]);
      return { ticketStatusBreakdown: ticketStats.rows, unresolvedByType: ticketTypePriority.rows, last24h: parseInt(recentTickets.rows[0].count) || 0, criticalPending: pendingHigh.rows };
    }
    case 'catering': {
      const [inventory, expired, expiring, lowStock, consumption] = await Promise.all([
        pool.query('SELECT * FROM catering_inventory ORDER BY expiry_date ASC'),
        pool.query("SELECT COUNT(*) as count FROM catering_inventory WHERE expiry_date <= CURRENT_DATE"),
        pool.query("SELECT COUNT(*) as count FROM catering_inventory WHERE expiry_date > CURRENT_DATE AND expiry_date <= CURRENT_DATE + 7"),
        pool.query("SELECT COUNT(*) as count FROM catering_inventory WHERE quantity <= min_alert_threshold"),
        pool.query("SELECT COUNT(*) as count FROM catering_consumption WHERE used_at >= NOW() - INTERVAL '30 days'"),
      ]);
      return { inventory: inventory.rows, expired: parseInt(expired.rows[0].count) || 0, expiringWithin7Days: parseInt(expiring.rows[0].count) || 0, lowStock: parseInt(lowStock.rows[0].count) || 0, consumption30Days: parseInt(consumption.rows[0].count) || 0 };
    }
    case 'housing': {
      const [inventory, lowStock, transfers] = await Promise.all([
        pool.query('SELECT * FROM housing_inventory ORDER BY category ASC, name ASC'),
        pool.query("SELECT COUNT(*) as count FROM housing_inventory WHERE quantity <= min_alert_threshold"),
        pool.query("SELECT t.*, hi.name AS item_name, hi.unit AS item_unit, u.name AS user_name FROM housing_transfers t JOIN housing_inventory hi ON t.item_id = hi.id LEFT JOIN users u ON t.transferred_by_user_id = u.id ORDER BY t.transferred_at DESC LIMIT 50"),
      ]);
      return { inventory: inventory.rows, lowStock: parseInt(lowStock.rows[0].count) || 0, recentTransfers: transfers.rows };
    }
    case 'it': {
      const [services, devices, issues] = await Promise.all([
        pool.query("SELECT s.*, COUNT(DISTINCT d.id) FILTER (WHERE d.device_type = 'pc') AS pc_count, COUNT(DISTINCT d.id) FILTER (WHERE d.device_type = 'printer') AS printer_count, COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'open') AS open_issues FROM it_services s LEFT JOIN it_devices d ON d.service_id = s.id LEFT JOIN it_issues i ON i.device_id = d.id GROUP BY s.id ORDER BY s.created_at ASC"),
        pool.query("SELECT d.*, s.name AS service_name, COUNT(i.id) FILTER (WHERE i.status = 'open') AS open_issues_count FROM it_devices d LEFT JOIN it_services s ON s.id = d.service_id LEFT JOIN it_issues i ON i.device_id = d.id GROUP BY d.id, s.name ORDER BY d.device_type, d.created_at ASC"),
        pool.query("SELECT i.*, d.pc_code, d.device_type, d.ip_address, s.name AS service_name FROM it_issues i LEFT JOIN it_devices d ON d.id = i.device_id LEFT JOIN it_services s ON s.id = d.service_id ORDER BY CASE i.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, i.created_at DESC"),
      ]);
      return { services: services.rows, devices: devices.rows, issues: issues.rows };
    }
    case 'activity': {
      const logs = await pool.query("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100");
      return { logs: logs.rows };
    }
    default:
      return null;
  }
};

export const storeSnapshot = async (stats) => {
  await pool.query(
    'INSERT INTO stats_snapshots (snapshot_date, data) VALUES (CURRENT_DATE, $1)',
    [JSON.stringify(stats)]
  );
};

export const getLatestSnapshots = async (limit = 5) => {
  const result = await pool.query(
    'SELECT id, snapshot_date, data FROM stats_snapshots ORDER BY snapshot_date DESC, created_at DESC LIMIT $1',
    [limit]
  );
  return result.rows.map(r => ({ id: r.id, snapshot_date: r.snapshot_date, data: r.data }));
};
