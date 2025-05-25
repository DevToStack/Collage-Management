const express = require('express');
const router = express.Router();
const login = require('../controllers/loginController');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/adminController');

router.get('/profile', authenticate, controller.getProfile); // GET /admin/profile

router.post('/login', login.login);

module.exports = router;
