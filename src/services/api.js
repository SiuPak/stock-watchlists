// src/services/api.js

const BASE_URL = '/api';

/**
 * Fetch all watchlists
 */
export async function getWatchlists() {
  const res = await fetch(`${BASE_URL}/watchlists`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch watchlists');
  return data.watchlists;
}

/**
 * Create a new watchlist
 */
export async function createWatchlist(name, symbols = []) {
  const res = await fetch(`${BASE_URL}/watchlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, symbols }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to create watchlist');
  return data.watchlist;
}

/**
 * Update watchlist name or symbols
 */
export async function updateWatchlist(id, updateData) {
  const res = await fetch(`${BASE_URL}/watchlists/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to update watchlist');
  return data.watchlist;
}

/**
 * Delete a watchlist
 */
export async function deleteWatchlist(id) {
  const res = await fetch(`${BASE_URL}/watchlists/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to delete watchlist');
  return data.watchlists;
}

/**
 * Add a stock symbol to a watchlist
 */
export async function addStockToWatchlist(watchlistId, symbol) {
  const res = await fetch(`${BASE_URL}/watchlists/${encodeURIComponent(watchlistId)}/stocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to add stock');
  return data.watchlist;
}

/**
 * Remove a stock symbol from a watchlist
 */
export async function removeStockFromWatchlist(watchlistId, symbol) {
  const res = await fetch(
    `${BASE_URL}/watchlists/${encodeURIComponent(watchlistId)}/stocks/${encodeURIComponent(symbol)}`,
    { method: 'DELETE' }
  );
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to remove stock');
  return data.watchlist;
}

/**
 * Search ticker symbols / company names
 */
export async function searchStocks(query) {
  if (!query || !query.trim()) return [];
  const res = await fetch(`${BASE_URL}/stocks/search?q=${encodeURIComponent(query.trim())}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Search failed');
  return data.results || [];
}

/**
 * Get batch quotes for symbols
 */
export async function getQuotes(symbols = []) {
  if (!symbols || symbols.length === 0) return [];
  const res = await fetch(`${BASE_URL}/stocks/quotes?symbols=${encodeURIComponent(symbols.join(','))}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch quotes');
  return data.quotes || [];
}

/**
 * Get chart data for a symbol and time range
 */
export async function getStockChart(symbol, range = '1d', interval) {
  if (!symbol) return null;
  let url = `${BASE_URL}/stocks/chart/${encodeURIComponent(symbol)}?range=${encodeURIComponent(range)}`;
  if (interval) {
    url += `&interval=${encodeURIComponent(interval)}`;
  }
  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to fetch chart');
  return data.chart;
}
