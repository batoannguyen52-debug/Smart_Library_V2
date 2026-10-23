const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/my-fines', authenticateToken, authorizeRoles('patron'), fineController.getMyFines);
router.post('/pay', authenticateToken, authorizeRoles('librarian'), fineController.payFine);

module.exports = router;