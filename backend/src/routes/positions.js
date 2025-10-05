const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM lots WHERE qty_remaining != 0 ORDER BY symbol, created_at');
    const groups = {};
    result.rows.forEach(lot => {
      if (!groups[lot.symbol]) groups[lot.symbol] = { symbol: lot.symbol, lots: [], total_qty: 0, total_cost: 0 };
      groups[lot.symbol].lots.push(lot);
      groups[lot.symbol].total_qty += parseInt(lot.qty_remaining,10);
      groups[lot.symbol].total_cost += parseFloat(lot.qty_remaining) * parseFloat(lot.price);
    });
    const out = Object.values(groups).map(g => ({
      symbol: g.symbol,
      total_qty: g.total_qty,
      avg_cost: g.total_qty ? (g.total_cost / g.total_qty) : 0,
      lots: g.lots
    }));
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
