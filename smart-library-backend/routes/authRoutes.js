const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRequest, authValidationRules } = require('../middleware/validator'); // <-- Thêm dòng này

// Nhét validation vào giữa router và controller
router.post('/register', authValidationRules.register, validateRequest, authController.register);
router.post('/login', authValidationRules.login, validateRequest, authController.login);

module.exports = router;