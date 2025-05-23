const { getDB } = require('../database');

exports.getProfile = async (req, res) => {
  try {
    const db = getDB();
    console.log('User from auth middleware:', req.user); // Debugging

    const [rows] = await db.query(
      'SELECT user_id, full_name, email, role, college_code FROM users WHERE user_id = ?', 
      [req.user.user_id] // Changed to user_id to match your schema
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.dashboard = async (req, res) => {
    const db = getDB();
    const collegeCode = req.user.college_code; // Fixed typo from "collage" to "college"
    
    try {
        if (!collegeCode) {
            return res.status(400).json({ error: 'College code is required' });
        }

        const query = `
            SELECT
                (SELECT COUNT(*) FROM teachers t 
                JOIN users u ON t.user_id = u.user_id 
                WHERE u.college_code = ?) AS total_teachers,
                
                (SELECT COUNT(*) FROM students 
                WHERE college_code = ?) AS total_students,
                
                (SELECT COUNT(*) FROM classes 
                WHERE college_code = ?) AS total_classes,
                
                (SELECT COUNT(*) FROM announcements 
                WHERE college_code = ?) AS total_announcements,
                
                (SELECT COUNT(*) FROM staff s 
                JOIN users u ON s.user_id = u.user_id 
                WHERE u.college_code = ?) AS total_staff;
        `;
        
        const [results] = await db.query(query, 
          [collegeCode, collegeCode, collegeCode, collegeCode, collegeCode]);
        
        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'No data found for this college' });
        }

        res.json(results[0]);
        
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ 
            error: 'Failed to fetch dashboard data',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

exports.getAllTeachers = async (req, res) => {
    const db = getDB();
    try {
        const [rows] = await db.query(`
            SELECT t.*, u.full_name, u.email 
            FROM teachers t
            JOIN users u ON t.user_id = u.user_id
            WHERE u.college_code = ?
        `, [req.user.college_code]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Teachers fetch error' });
    }
};

exports.getAllStudents = async (req, res) => {
    const db = getDB();
    try {
        const [rows] = await db.query(`
            SELECT * FROM students 
            WHERE college_code = ?
        `, [req.user.college_code]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Students fetch error' });
    }
};

exports.getAllClasses = async (req, res) => {
    const db = getDB();
    try {
        const [rows] = await db.query(`
            SELECT * FROM classes 
            WHERE college_code = ?
        `, [req.user.college_code]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Classes fetch error' });
    }
};

exports.getAllStaff = async (req, res) => {
    const db = getDB();
    try {
        const [rows] = await db.query(`
            SELECT s.*, u.full_name, u.email 
            FROM staff s
            JOIN users u ON s.user_id = u.user_id
            WHERE u.college_code = ?
        `, [req.user.college_code]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Staff fetch error' });
    }
};

exports.getActivities = async (req, res) => {
    const db = getDB();
    try {
        const [rows] = await db.query(`
            SELECT * FROM activities 
            WHERE college_code = ?
            ORDER BY created_at DESC
            LIMIT 50
        `, [req.user.college_code]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Activities fetch error' });
    }
};

exports.addStudent = async (req, res) => {
    const db = getDB();
    const { 
        full_name, 
        email, 
        college_code,
        dob,
        // Add all other required fields from your students table
    } = req.body; // Changed from req.query to req.body for better practice

    if (!full_name || !email || !college_code || !dob) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const [result] = await db.query(`
            INSERT INTO students 
            (full_name, email, college_code, dob, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `, [full_name, email, college_code, dob]);

        res.status(201).json({ 
            message: 'Student added successfully.',
            student_id: result.insertId
        });
    } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({ message: 'Failed to add student.' });
    }
};