const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/printers', async (req, res) => {
  try {
    const [results] = await db.query("SELECT name FROM printers ORDER BY name ASC");
    res.json(results);
  } catch (err) {
    console.error("Failed to fetch printers:", err);
    res.status(500).json({ error: "Failed to fetch printers" });
  }
});

router.post('/printers/add', async (req, res) => {
  const { name } = req.body;
  try {
    // Avoid duplicates
    await db.query('INSERT IGNORE INTO printers (name) VALUES (?)', {
      replacements: [name],
    });
    res.status(201).json({ success: true, name });
  } catch (err) {
    console.error("Error adding printer:", err);
    res.status(500).json({ success: false, message: 'Failed to add printer' });
  }
});

module.exports = router;
