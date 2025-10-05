const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req,res) => {
  try {
    const rows = (await db.query('SELECT * FROM realized_pnl ORDER BY ts DESC')).rows;
    const summary = {};
    rows.forEach(r => {
      if (!summary[r.symbol]) summary[r.symbol] = { symbol: r.symbol, realized: 0 };
      summary[r.symbol].realized += parseFloat(r.pnl);
    });
    res.json({ rows, summary: Object.values(summary) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
