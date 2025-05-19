const { getDB } = require('../database');

exports.getAnnouncements = async (req, res) => {
    const db = getDB();
    try {
        const [rows] = await db.query(`SELECT * FROM announcements`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Announcement fetch error' });
    }
};