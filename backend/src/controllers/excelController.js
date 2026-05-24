import xlsx from 'xlsx';
import pool from '../config/db.js';

export const parseHeaders = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Get headers list from the first row
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const headers = data[0] || [];
    
    // Get a sample row
    const sampleRow = data[1] || [];
    const sample = {};
    headers.forEach((h, idx) => {
      sample[h] = sampleRow[idx] !== undefined ? sampleRow[idx] : null;
    });

    res.status(200).json({ headers, sample });
  } catch (error) {
    console.error('Header parsing error:', error);
    res.status(500).json({ error: 'Failed to parse file headers' });
  }
};

export const importStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let mappings = {};
    if (req.body.mappings) {
      try {
        mappings = typeof req.body.mappings === 'string' ? JSON.parse(req.body.mappings) : req.body.mappings;
      } catch (err) {
        console.error('Failed to parse mappings:', err);
      }
    }

    let inserted = 0;
    let skipped = 0;
    let errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      const getVal = (field) => {
        const mappedName = mappings[field];
        if (mappedName && row[mappedName] !== undefined) return row[mappedName];
        return row[field];
      };

      const full_name = getVal('full_name');
      const first_name = getVal('first_name');
      const last_name = getVal('last_name');
      const email = getVal('email');
      const date_of_birth = getVal('date_of_birth');
      const gender = getVal('gender');
      const phone = getVal('phone');
      const wilaya = getVal('wilaya');
      const baladiya = getVal('baladiya');
      const national_id = getVal('national_id');
      const student_number = getVal('student_number');
      const department = getVal('department');
      const speciality = getVal('speciality');
      const study_year = getVal('study_year');
      const faculty = getVal('faculty');

      const name = full_name || `${first_name || ''} ${last_name || ''}`.trim();

      // Ignore empty rows
      if (!name && !student_number) continue;

      if (!name || !student_number) {
        skipped++;
        errors.push(`Row ${i + 2}: Missing required fields (Name or student_number)`);
        continue;
      }

      // Smart Room Assignment
      let final_room_id = null;
      try {
        const query = `
          SELECT r.id,
                 COUNT(s.id) as occupants,
                 SUM(CASE WHEN s.speciality = $1 OR s.study_year = $2 THEN 1 ELSE 0 END) as match_score
          FROM rooms r
          LEFT JOIN students s ON s.room_id = r.id
          GROUP BY r.id, r.building, r.room_number, r.capacity
          HAVING COUNT(s.id) < r.capacity
          ORDER BY match_score DESC, occupants DESC, r.building ASC
          LIMIT 1;
        `;
        const roomResult = await pool.query(query, [speciality || '', study_year || '']);
        if (roomResult.rows.length > 0) {
          final_room_id = roomResult.rows[0].id;
        }
      } catch (err) {
        console.error('Smart match error during bulk import:', err);
        errors.push(`Row ${i + 2}: Room auto-assignment failed (${err.message})`);
      }

      try {
        await pool.query(
          `INSERT INTO students (
            name, first_name, last_name, email, date_of_birth, gender,
            phone, wilaya, baladiya, national_id, student_number,
            department, speciality, study_year, faculty, room_id, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [
            name, first_name || null, last_name || null, email || null, date_of_birth || null, gender || null,
            String(phone || ''), wilaya || null, baladiya || null, String(national_id || ''), String(student_number),
            department || null, speciality || null, study_year || null, faculty || null, final_room_id, 'active'
          ]
        );
        inserted++;
      } catch (err) {
        console.error(`Bulk student import row ${i + 2} error:`, err);
        if (err.code === '23505') { // unique violation
          skipped++;
          errors.push(`Row ${i + 2}: Duplicate student_number or national_id`);
        } else {
          skipped++;
          errors.push(`Row ${i + 2}: Database formatting or constraint error`);
        }
      }
    }

    res.status(200).json({ inserted, skipped, errors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to import students' });
  }
};

export const importRooms = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let mappings = {};
    if (req.body.mappings) {
      try {
        mappings = typeof req.body.mappings === 'string' ? JSON.parse(req.body.mappings) : req.body.mappings;
      } catch (err) {
        console.error('Failed to parse mappings:', err);
      }
    }

    let inserted = 0;
    let skipped = 0;
    let errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      const getVal = (field) => {
        const mappedName = mappings[field];
        if (mappedName && row[mappedName] !== undefined) return row[mappedName];
        return row[field];
      };

      const room_number = getVal('room_number');
      const building = getVal('building');
      const capacity = getVal('capacity');

      // Ignore empty rows
      if (!room_number && !building && !capacity) continue;

      if (!room_number) {
        skipped++;
        errors.push(`Row ${i + 2}: Missing room_number`);
        continue;
      }

      try {
        await pool.query(
          `INSERT INTO rooms (room_number, building, capacity) VALUES ($1, $2, $3)`,
          [String(room_number), building || null, parseInt(capacity) || 2]
        );
        inserted++;
      } catch (err) {
        if (err.code === '23505') {
          skipped++;
          errors.push(`Row ${i + 2}: Duplicate room_number ${room_number}`);
        } else {
          skipped++;
          errors.push(`Row ${i + 2}: Database error`);
        }
      }
    }

    res.status(200).json({ inserted, skipped, errors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to import rooms' });
  }
};

export const exportStudents = async (req, res) => {
  try {
    const query = `
      SELECT s.name as "Student Name", s.student_number as "Student Number", 
             s.faculty as "Faculty", s.status as "Status", r.room_number as "Room Number"
      FROM students s
      LEFT JOIN rooms r ON s.room_id = r.id
    `;
    const result = await pool.query(query);

    const ws = xlsx.utils.json_to_sheet(result.rows);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Students');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename="students_export.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export students' });
  }
};

export const exportTickets = async (req, res) => {
  try {
    const query = `
      SELECT t.id as "Ticket ID", r.room_number as "Room Number", 
             t.type as "Type", t.description as "Description", 
             t.priority as "Priority", t.status as "Status", t.created_at as "Reported Date"
      FROM tickets t
      LEFT JOIN rooms r ON t.room_id = r.id
    `;
    const result = await pool.query(query);

    const data = result.rows.map(row => ({
      ...row,
      "Reported Date": row["Reported Date"] ? new Date(row["Reported Date"]).toISOString().split('T')[0] : ''
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Tickets');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename="tickets_export.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export tickets' });
  }
};

export const exportDashboardReport = async (req, res) => {
  try {
    const studentCount = await pool.query('SELECT COUNT(*) FROM students');
    const roomsCount = await pool.query('SELECT COUNT(*), SUM(capacity) as total_beds FROM rooms');
    const occupiedBeds = await pool.query('SELECT COUNT(*) FROM students WHERE room_id IS NOT NULL');
    const activeTicketsCount = await pool.query("SELECT COUNT(*) FROM tickets WHERE status != 'resolved'");
    const resolvedTicketsCount = await pool.query("SELECT COUNT(*) FROM tickets WHERE status = 'resolved'");

    const totalRooms = parseInt(roomsCount.rows[0].count) || 0;
    const totalBeds = parseInt(roomsCount.rows[0].total_beds) || 0;
    const assignedBeds = parseInt(occupiedBeds.rows[0].count) || 0;
    const occupancyRate = totalBeds > 0 ? `${((assignedBeds / totalBeds) * 100).toFixed(1)}%` : '0%';

    const activeTickets = parseInt(activeTicketsCount.rows[0].count) || 0;
    const resolvedTickets = parseInt(resolvedTicketsCount.rows[0].count) || 0;

    const reportData = [
      { Metric: "Total Students", Value: parseInt(studentCount.rows[0].count) },
      { Metric: "Total Rooms", Value: totalRooms },
      { Metric: "Occupancy Rate", Value: occupancyRate },
      { Metric: "Active Tickets", Value: activeTickets },
      { Metric: "Resolved Tickets", Value: resolvedTickets }
    ];

    const ws = xlsx.utils.json_to_sheet(reportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Dashboard Report');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename="dashboard_report.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export dashboard report' });
  }
};
