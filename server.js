const express = require('express');
const cors = require('cors');
const path = require('path');

const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Ensure CORS is set up before routes
app.use(express.json());

// Serve static files (like index.html)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/admin', adminRoutes); // Check here: /admin/students will be handled by this route

// Fallback for unmatched routes
app.use((req, res) => {
    res.status(404).send('Endpoint not found');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
