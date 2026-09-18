// server/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import stocksApp from './routes/stocks';
import watchlistsApp from './routes/watchlists';

const app = new Hono();

// Middlewares
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Routes
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    runtime: 'Bun',
    version: Bun.version,
  });
});

app.route('/api/stocks', stocksApp);
app.route('/api/watchlists', watchlistsApp);

const PORT = Number(process.env.PORT) || 3001;

console.log(`🚀 Stock Watchlists Backend Server running on http://localhost:${PORT} with Bun ${Bun.version}`);

export default {
  port: PORT,
  fetch: app.fetch,
};
