const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Public to authenticated authors and admins
router.get('/', authenticateToken, ticketController.getTickets);
router.post('/', authenticateToken, ticketController.createTicket);
router.get('/:id', authenticateToken, ticketController.getTicketById);
router.post('/:id/messages', authenticateToken, ticketController.addMessage);

// Admin-only management routes
router.patch('/:id', authenticateToken, requireAdmin, ticketController.updateTicket);
router.post('/:id/notes', authenticateToken, requireAdmin, ticketController.addInternalNote);
router.post('/:id/ai-draft', authenticateToken, requireAdmin, ticketController.generateAiDraft);

module.exports = router;
