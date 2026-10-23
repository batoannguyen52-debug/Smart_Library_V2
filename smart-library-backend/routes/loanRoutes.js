const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/borrow', authenticateToken, authorizeRoles('super_admin', 'librarian'), loanController.borrowBook);
router.post('/return', authenticateToken, authorizeRoles('super_admin', 'librarian'), loanController.returnBook);
router.post('/renew', authenticateToken, authorizeRoles('patron'), loanController.renewBook);

module.exports = router;