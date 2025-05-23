const bcrypt = require('bcrypt');
const { getDB } = require('../database');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function login(req, res) {
  const db = getDB();

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Only select needed fields
    const [rows] = await db.query(
      `SELECT user_id, email, password, college_code, role, full_name 
       FROM users WHERE email = ?`,
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    // Consistent spelling: "college_code" (correct spelling)
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        college_code: user.college_code,  // Fixed typo here
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,  // Consistent field name
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        college_code: user.college_code  // Include in response
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}
module.exports = { login };
