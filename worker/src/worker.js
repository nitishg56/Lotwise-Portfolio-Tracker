const { Kafka } = require('kafkajs');
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const kafka = new Kafka({ brokers: (process.env.KAFKA_BROKERS||'localhost:9092').split(',') });
const topic = process.env.KAFKA_TOPIC || 'trades';
const consumer = kafka.consumer({ groupId: process.env.GROUP_ID || 'lotwise-worker' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const val = message.value.toString();
      let trade;
      try { trade = JSON.parse(val); } catch(e){ console.error('invalid json', e); return; }
      console.log('worker got trade', trade);

      if (trade.qty > 0) {
        // buy -> create lot
        await pool.query('INSERT INTO lots(symbol, qty_original, qty_remaining, price) VALUES($1,$2,$3,$4)', [trade.symbol, trade.qty, trade.qty, trade.price]);
        console.log('created lot');
      } else if (trade.qty < 0) {
        // sell -> close lots FIFO
        const sellQty = Math.abs(trade.qty);
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          let remaining = sellQty;
          const res = await client.query('SELECT * FROM lots WHERE symbol=$1 AND qty_remaining>0 ORDER BY created_at FOR UPDATE', [trade.symbol]);
          for (const lot of res.rows) {
            if (remaining <= 0) break;
            const available = parseInt(lot.qty_remaining,10);
            const matched = Math.min(available, remaining);
            const cost_basis = parseFloat(lot.price) * matched;
            const pnl = (parseFloat(trade.price) - parseFloat(lot.price)) * matched;
            await client.query('INSERT INTO realized_pnl(symbol, qty, sell_price, cost_basis, pnl, details) VALUES($1,$2,$3,$4,$5,$6)', [trade.symbol, matched, trade.price, cost_basis, pnl, `matched_lot:${lot.id}`]);
            await client.query('UPDATE lots SET qty_remaining = qty_remaining - $1 WHERE id=$2', [matched, lot.id]);
            remaining -= matched;
          }

          if (remaining > 0) {
            await client.query('INSERT INTO realized_pnl(symbol, qty, sell_price, cost_basis, pnl, details) VALUES($1,$2,$3,$4,$5,$6)', [trade.symbol, remaining, trade.price, 0, remaining * parseFloat(trade.price), 'unmatched_sell']);
          }

          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          console.error('worker txn error', err);
        } finally {
          client.release();
        }
      } else {
        console.log('zero qty trade ignored');
      }
    }
  });
};

run().catch(e => { console.error(e); process.exit(1); });
