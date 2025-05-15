const express = require('express');
const router = express.Router();
const sequelize = require('../config/db');

// GET distinct concerned persons from orders table
router.get('/', async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT DISTINCT concernedPerson AS name 
      FROM orders 
      WHERE concernedPerson IS NOT NULL AND concernedPerson != ''
    `);
    const names = results.map(r => r.name);
    res.json(names);
  } catch (err) {
    console.error('Error fetching concerned persons from orders:', err);
    res.status(500).json({ error: 'Failed to fetch concerned persons' });
  }
});

module.exports = router;
