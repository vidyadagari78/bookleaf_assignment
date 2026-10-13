const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

router.get('/stats', authenticateToken, requireAdmin, adminController.getDashboardStats);
router.get('/authors', authenticateToken, requireAdmin, adminController.getAuthors);
router.get('/knowledge-base', authenticateToken, requireAdmin, adminController.getKnowledgeBase);
router.post('/reset-seed', authenticateToken, requireAdmin, adminController.resetSeed);

module.exports = router;
