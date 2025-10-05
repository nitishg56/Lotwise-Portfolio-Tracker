const express = require('express');
const router = express.Router();
const db = require('../db');
const { Kafka } = require('kafkajs');
const dotenv = require('dotenv');
dotenv.config();

const kafka = new Kafka({ brokers: (process.env.KAFKA_BROKERS||'localhost:9092').split(',') });
const producer = kafka.producer();

let producerReady = false;
const ensureProducer = async () => {
  if (!producerReady) {
    await producer.connect();
    producerReady = true;
  }
};

router.post('/', async (req, res) => {
  const { symbol, qty, price, ts } = req.body;
  if (!symbol || qty === undefined || price === undefined) return res.status(400).json({ error: 'symbol, qty, price required' });

  try {
    const insert = await db.query(
      'INSERT INTO trades(symbol, qty, price, ts) VALUES($1,$2,$3,$4) RETURNING *',
      [symbol, qty, price, ts || new Date()]
    );
    const trade = insert.rows[0];

    // publish to kafka
    await ensureProducer();
    await producer.send({
      topic: process.env.KAFKA_TOPIC || 'trades',
      messages: [ { value: JSON.stringify(trade) } ]
    });

    res.json({ ok: true, trade });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
