const db = require('./database')
const express = require('express');
const router = express.Router();
const cors = require('cors');
const path = require('path');
const adminRoutes = require('./routes/adminRoutes');
const commonRoutes = require('./routes/commonRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Ensure CORS is set up before routes
app.use(express.json());

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/admin', adminRoutes); // Check here: /admin/students will be handled by this route
app.use("/common",commonRoutes);
app.use("/student",studentRoutes);
app.use("/teacher",teacherRoutes);

// Fallback for unmatched routes
app.use((req, res) => {
    res.status(404).send('Endpoint not found');
});
(async () => {
    try {
        await db.initializeDatabase();  // ✅ This ensures tables are created at server launch
        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to initialize database or start server:', err);
        process.exit(1);
    }
})();


