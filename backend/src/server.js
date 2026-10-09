import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. RFID Scan Endpoint (Called by RFID Reader / Simulator)
app.post('/api/scan', async (req, res) => {
  const { rfid_tag } = req.body;

  if (!rfid_tag) {
    return res.status(400).json({ success: false, message: 'RFID tag is required' });
  }

  try {
    // Find student matching tag
    const studentQuery = await pool.query(
      'SELECT * FROM students WHERE rfid_tag = $1',
      [rfid_tag]
    );

    if (studentQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Unknown RFID Card! Student not registered.',
        tag: rfid_tag,
      });
    }

    const student = studentQuery.rows[0];

    // Log attendance
    const attendanceInsert = await pool.query(
      'INSERT INTO attendance_logs (student_id, status) VALUES ($1, $2) RETURNING *',
      [student.id, 'PRESENT']
    );

    return res.json({
      success: true,
      message: `Welcome, ${student.first_name} ${student.last_name}!`,
      student,
      log: attendanceInsert.rows[0],
    });
  } catch (error) {
    console.error('Scan processing error:', error);
    res.status(500).json({ success: false, message: 'Server error during scan' });
  }
});

// 2. Get All Students
app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Student RFID Attendance System API',
    version: '1.0.0',
    endpoints: {
      students: '/api/students',
      attendanceLogs: '/api/logs'
    }
  });
});

// 3. Register New Student
app.post('/api/students', async (req, res) => {
  const { rfid_tag, student_id, first_name, last_name, email, department } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO students (rfid_tag, student_id, first_name, last_name, email, department)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [rfid_tag, student_id, first_name, last_name, email, department || 'General']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.detail || 'Failed to register student' });
  }
});

// 4. Get Attendance History
app.get('/api/attendance', async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id, 
        a.scanned_at, 
        a.status,
        s.first_name, 
        s.last_name, 
        s.student_id, 
        s.rfid_tag,
        s.department
      FROM attendance_logs a
      JOIN students s ON a.student_id = s.id
      ORDER BY a.scanned_at DESC
      LIMIT 100
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance logs' });
  }
});

// 5. Quick Stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalStudents = await pool.query('SELECT COUNT(*) FROM students');
    const todayAttendance = await pool.query(
      "SELECT COUNT(*) FROM attendance_logs WHERE DATE(scanned_at) = CURRENT_DATE"
    );

    res.json({
      totalStudents: parseInt(totalStudents.rows[0].count),
      todayAttendance: parseInt(todayAttendance.rows[0].count),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});