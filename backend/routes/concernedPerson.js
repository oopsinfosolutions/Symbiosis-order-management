const express = require('express');
const router = express.Router();
const sequelize = require('../config/db'); // This is your Sequelize instance

// GET concerned persons from SignUps table
router.get('/', async (req, res) => {
  try {
    const [results] = await sequelize.query('SELECT fullName AS name FROM SignUps');
    res.json(results);
  } catch (err) {
    console.error('Error fetching concerned persons from SignUps:', err);
    res.status(500).json({ error: 'Failed to fetch concerned persons' });
  }
});

module.exports = router;
