const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Chỉ Library Manager mới xem được thông số sách, tiền bạc
router.get('/manager', authenticateToken, authorizeRoles('library_manager'), dashboardController.getManagerDashboard);

// Chỉ Super Admin (IT) mới xem được tình trạng server, user
router.get('/admin', authenticateToken, authorizeRoles('super_admin'), dashboardController.getAdminDashboard);

// Patron
router.get('/patron', authenticateToken, authorizeRoles('patron'), dashboardController.getPatronDashboard);

module.exports = router;