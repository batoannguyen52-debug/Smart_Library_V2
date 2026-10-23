const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRoles('super_admin', 'library_manager'), settingController.getSettings);
router.put('/', authenticateToken, authorizeRoles('super_admin'), settingController.updateSetting);

module.exports = router;