const express = require('express');
const router = express.Router();
const { seedDatabase, db } = require('../database/db');

router.get('/health', (req, res) => {
  try {
    const authorCount = db.prepare('SELECT COUNT(*) AS count FROM authors').get().count;
    const ticketCount = db.prepare('SELECT COUNT(*) AS count FROM tickets').get().count;

    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      database: {
        engine: 'SQLite (better-sqlite3)',
        connected: true,
        authors: authorCount,
        tickets: ticketCount
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

router.post('/reset-seed', (req, res) => {
  try {
    const result = seedDatabase(true);
    res.json({
      success: true,
      message: 'System database successfully reset and seeded to initial dataset.',
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
