const { getDB } = require('../database');

exports.getProfile = async (req, res) => {
  try {
    const db = getDB();
console.log('User from auth middleware:', req.user); // Add this line
    // You get userId from JWT middleware: req.user
    const [rows] = await db.query('SELECT user_id, full_name, email, role FROM users WHERE user_id = ?', [req.user.userId]);

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
    const collegeCode = req.user.college_code; // More descriptive variable name
    
    try {
        // Validate college code exists
        if (!collegeCode) {
            return res.status(400).json({ error: 'College code is required' });
        }

        // Single query with parameterized values for security
        const query = `
            SELECT
                (SELECT COUNT(*) FROM teachers WHERE collage_code = ?) AS total_teachers,
                (SELECT COUNT(*) FROM students WHERE collage_code = ?) AS total_students,
                (SELECT COUNT(*) FROM classes WHERE collage_code = ?) AS total_classes,
                (SELECT COUNT(*) FROM announcements WHERE collage_code = ?) AS total_announcements,
                (SELECT COUNT(*) FROM staff WHERE collage_code = ?) AS total_staff
        `;
        
        // Execute query with parameter binding
        const [results] = await db.query(query, [collegeCode, collegeCode, collegeCode, collegeCode, collegeCode]);
        
        // Check if we got results (should always get one row, but good to verify)
        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'No data found for this college' });
        }

        // Return the first (and only) row of results
        res.json(results[0]);
        
    } catch (err) {
        console.error('Dashboard error:', err); // Log the actual error for debugging
        res.status(500).json({ 
            error: 'Failed to fetch dashboard data',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

exports.getAllTeachers = async (req, res) => {
    const db = getDB();
    try {
        const [rows] = await db.query(`SELECT * FROM teachers where college_code= ? `,[req.user.college_code]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Teachers fetch error' });
    }
};

exports.getAllStudents = async (req, res) => {
    const db = getDB();
    try {
        const [rows] = await db.query(`SELECT * FROM students`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Students fetch error' });
    }
};

exports.getAllClasses = async (req, res) => {
    const db = getDB();
    try {
        const [rows] = await db.query(`SELECT * FROM classes`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Classes fetch error' });
    }
};

exports.getAllStaff = async (req, res) => {
    const db = getDB();
    try {
        const [rows] = await db.query(`SELECT * FROM staff`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Staff fetch error' });
    }
};
exports.getActivities = async (req, res) => {
    const db = getDB();
    try {
        const [rows] = await db.query(`SELECT * FROM admin_activities`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'activities fetch error' });
    }
};

exports.addStudent = async (req, res) => {
    const db = getDB();
    const { name, email, grade } = req.query;

    if (!name || !email || !grade) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const values = [name, email, grade];
        const query = await db.query(`INSERT INTO students (name, email, grade) VALUES (?, ?, ?)`,values);

        res.status(201).json({ message: 'Student added successfully.' });
    } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({ message: 'Failed to add student.' });
    }
};