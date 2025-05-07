const { getDB } = require('../database');

exports.dashboard = async (req, res) => {
    const db = getDB();
    try {
        const [[result]] = await db.query(`
            SELECT
                (SELECT COUNT(*) FROM teachers) AS total_teachers,
                (SELECT COUNT(*) FROM students) AS total_students,
                (SELECT COUNT(*) FROM classes) AS total_classes
        `);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Admin dashboard error' });
    }
};

exports.getAllTeachers = async (req, res) => {
    const db = getDB();
    try {
        const [rows] = await db.query(`SELECT * FROM teachers`);
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
