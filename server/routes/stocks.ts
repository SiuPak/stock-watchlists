// server/routes/stocks.ts
import { Hono } from 'hono';
import {
  fetchStockChart,
  fetchBatchQuotes,
  searchSymbols,
} from '../services/yahooFinance';

const stocksApp = new Hono();

// GET /api/stocks/search?q=apple
stocksApp.get('/search', async (c) => {
  const query = c.req.query('q') || '';
  if (!query.trim()) {
    return c.json({ success: true, results: [] });
  }

  try {
    const results = await searchSymbols(query);
    return c.json({ success: true, results });
  } catch (err: any) {
    console.error('Error searching symbols:', err);
    return c.json({ success: false, error: err.message || 'Failed to search symbols' }, 500);
  }
});

// GET /api/stocks/quotes?symbols=AAPL,MSFT,NVDA
stocksApp.get('/quotes', async (c) => {
  const symbolsParam = c.req.query('symbols') || '';
  const symbols = symbolsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (symbols.length === 0) {
    return c.json({ success: true, quotes: [] });
  }

  try {
    const quotes = await fetchBatchQuotes(symbols);
    return c.json({ success: true, quotes });
  } catch (err: any) {
    console.error('Error fetching quotes:', err);
    return c.json({ success: false, error: err.message || 'Failed to fetch quotes' }, 500);
  }
});

// GET /api/stocks/chart/:symbol?range=1d&interval=5m
stocksApp.get('/chart/:symbol', async (c) => {
  const symbol = c.req.param('symbol');
  const range = c.req.query('range') || '1d';
  const interval = c.req.query('interval');

  try {
    const chart = await fetchStockChart(symbol, range, interval);
    return c.json({ success: true, chart });
  } catch (err: any) {
    console.error(`Error fetching chart for ${symbol}:`, err);
    return c.json({ success: false, error: err.message || 'Failed to fetch chart' }, 500);
  }
});

export default stocksApp;
