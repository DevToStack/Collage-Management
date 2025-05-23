const express = require('express');
const router = express.Router();
const login = require('../controllers/loginController');
const auth = require('../middleware/auth');
const controller = require('../controllers/adminController');

router.get('/profile', auth, controller.getProfile); // GET /admin/profile

router.post('/auth', login.login);

module.exports = router;
