const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Không có middleware authenticateToken vì ai cũng có thể tìm kiếm
router.get('/search', publicController.searchCatalog);

module.exports = router;