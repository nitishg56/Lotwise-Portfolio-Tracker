-- create tables
CREATE TABLE IF NOT EXISTS trades (
  id serial PRIMARY KEY,
  symbol text NOT NULL,
  qty integer NOT NULL,
  price numeric NOT NULL,
  ts timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lots (
  id serial PRIMARY KEY,
  symbol text NOT NULL,
  qty_original integer NOT NULL,
  qty_remaining integer NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS realized_pnl (
  id serial PRIMARY KEY,
  symbol text NOT NULL,
  qty integer NOT NULL,
  sell_price numeric NOT NULL,
  cost_basis numeric NOT NULL,
  pnl numeric NOT NULL,
  ts timestamptz NOT NULL DEFAULT now(),
  details text
);

-- optional: seed test scenario
INSERT INTO trades(symbol, qty, price, ts) VALUES
('AAPL', 100, 150, now()),
('AAPL', 50, 160, now()),
('AAPL', -80, 170, now());

-- Note: worker must run to turn trades into lots/realized_pnl
