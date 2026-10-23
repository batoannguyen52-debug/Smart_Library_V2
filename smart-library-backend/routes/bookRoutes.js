const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', bookController.getAllBooks);
router.post('/copy', authenticateToken, authorizeRoles('super_admin', 'library_manager', 'librarian'), bookController.addBookCopy);
// ... (các import cũ)
router.post('/', authenticateToken, authorizeRoles('super_admin', 'library_manager', 'librarian'), bookController.createBook);
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'library_manager', 'librarian'), bookController.updateBook);
router.delete('/:id', authenticateToken, authorizeRoles('super_admin', 'library_manager'), bookController.deleteBook);

module.exports = router;