// server/routes/watchlists.ts
import { Hono } from 'hono';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_PATH = join(import.meta.dir, '..', 'storage', 'watchlists.json');

const DEFAULT_WATCHLISTS: Watchlist[] = [
  {
    id: 'tech-leaders',
    name: 'Tech Titans',
    symbols: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'market-etfs',
    name: 'Market ETFs',
    symbols: ['SPY', 'QQQ', 'DIA', 'IWM'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'blue-chips',
    name: 'Blue Chip & Value',
    symbols: ['BRK-B', 'JPM', 'V', 'WMT', 'JNJ'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function loadWatchlists(): Watchlist[] {
  try {
    if (!existsSync(STORAGE_PATH)) {
      saveWatchlists(DEFAULT_WATCHLISTS);
      return DEFAULT_WATCHLISTS;
    }
    const raw = readFileSync(STORAGE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_WATCHLISTS;
  } catch (err) {
    console.error('Failed to read watchlists.json, using defaults:', err);
    return DEFAULT_WATCHLISTS;
  }
}

function saveWatchlists(lists: Watchlist[]): void {
  try {
    writeFileSync(STORAGE_PATH, JSON.stringify(lists, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write watchlists.json:', err);
  }
}

const watchlistsApp = new Hono();

// GET all watchlists
watchlistsApp.get('/', (c) => {
  const lists = loadWatchlists();
  return c.json({ success: true, watchlists: lists });
});

// POST create new watchlist
watchlistsApp.post('/', async (c) => {
  const body = await c.req.json();
  const name = body.name?.trim();
  if (!name) {
    return c.json({ success: false, error: 'Watchlist name is required' }, 400);
  }

  const lists = loadWatchlists();
  const newId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
  const now = new Date().toISOString();

  const newWatchlist: Watchlist = {
    id: newId,
    name,
    symbols: Array.isArray(body.symbols)
      ? body.symbols.map((s: string) => s.trim().toUpperCase()).filter(Boolean)
      : [],
    createdAt: now,
    updatedAt: now,
  };

  lists.push(newWatchlist);
  saveWatchlists(lists);

  return c.json({ success: true, watchlist: newWatchlist }, 201);
});

// PUT update watchlist (name or symbols)
watchlistsApp.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const lists = loadWatchlists();

  const index = lists.findIndex((w) => w.id === id);
  if (index === -1) {
    return c.json({ success: false, error: 'Watchlist not found' }, 404);
  }

  if (body.name && body.name.trim()) {
    lists[index].name = body.name.trim();
  }
  if (Array.isArray(body.symbols)) {
    lists[index].symbols = Array.from(
      new Set(body.symbols.map((s: string) => s.trim().toUpperCase()).filter(Boolean))
    );
  }
  lists[index].updatedAt = new Date().toISOString();

  saveWatchlists(lists);
  return c.json({ success: true, watchlist: lists[index] });
});

// DELETE watchlist
watchlistsApp.delete('/:id', (c) => {
  const id = c.req.param('id');
  let lists = loadWatchlists();

  const exists = lists.some((w) => w.id === id);
  if (!exists) {
    return c.json({ success: false, error: 'Watchlist not found' }, 404);
  }

  lists = lists.filter((w) => w.id !== id);
  if (lists.length === 0) {
    // Keep at least one default watchlist
    lists = [
      {
        id: 'default',
        name: 'My Watchlist',
        symbols: ['AAPL', 'MSFT', 'NVDA'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  saveWatchlists(lists);
  return c.json({ success: true, watchlists: lists });
});

// POST add stock to watchlist
watchlistsApp.post('/:id/stocks', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const symbol = body.symbol?.trim().toUpperCase();

  if (!symbol) {
    return c.json({ success: false, error: 'Stock symbol is required' }, 400);
  }

  const lists = loadWatchlists();
  const target = lists.find((w) => w.id === id);

  if (!target) {
    return c.json({ success: false, error: 'Watchlist not found' }, 404);
  }

  if (!target.symbols.includes(symbol)) {
    target.symbols.push(symbol);
    target.updatedAt = new Date().toISOString();
    saveWatchlists(lists);
  }

  return c.json({ success: true, watchlist: target });
});

// DELETE remove stock from watchlist
watchlistsApp.delete('/:id/stocks/:symbol', (c) => {
  const id = c.req.param('id');
  const symbol = c.req.param('symbol')?.trim().toUpperCase();

  const lists = loadWatchlists();
  const target = lists.find((w) => w.id === id);

  if (!target) {
    return c.json({ success: false, error: 'Watchlist not found' }, 404);
  }

  target.symbols = target.symbols.filter((s) => s !== symbol);
  target.updatedAt = new Date().toISOString();
  saveWatchlists(lists);

  return c.json({ success: true, watchlist: target });
});

export default watchlistsApp;
