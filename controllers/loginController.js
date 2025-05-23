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

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
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

    const token = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name || '',
        email: user.email,
        role: user.role || 'user'
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { login };
