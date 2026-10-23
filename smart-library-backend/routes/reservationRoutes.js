const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRoles('patron'), reservationController.createReservation);
router.put('/:reservationId', authenticateToken, authorizeRoles('librarian', 'library_manager'), reservationController.updateReservationStatus);

module.exports = router;