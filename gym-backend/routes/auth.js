const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Путь: /api/auth/register
router.post('/register', authController.register);

// Путь: /api/auth/login
router.post('/login', authController.login);

module.exports = router;