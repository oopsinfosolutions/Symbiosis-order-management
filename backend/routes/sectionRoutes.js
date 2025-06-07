const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/sections

router.get('/sections', async (req, res) => {
  try {
    const [results] = await db.query("SELECT name FROM sections ORDER BY name ASC");
    res.json(results);
  } catch (err) {
    console.error("Failed to fetch sections:", err);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
});
// router.get("/sections", async (req, res) => {
//   const query = "SELECT * FROM sections ORDER BY name";
//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching sections:", err);
//       return res.status(500).json({ message: "Database error" });
//     }
//     res.json(results);
//   });
// });

module.exports = router;
