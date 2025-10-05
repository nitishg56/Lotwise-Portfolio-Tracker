const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const tradesRouter = require('./routes/trades');
const positionsRouter = require('./routes/positions');
const pnlRouter = require('./routes/pnl');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/trades', tradesRouter);
app.use('/positions', positionsRouter);
app.use('/pnl', pnlRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on ${port}`));
