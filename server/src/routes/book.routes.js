const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/', authenticateToken, bookController.getBooks);
router.get('/:id', authenticateToken, bookController.getBookById);

module.exports = router;
