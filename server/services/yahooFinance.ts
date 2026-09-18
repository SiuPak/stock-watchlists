// server/services/yahooFinance.ts

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  currency: string;
  exchange: string;
  marketState?: string;
  regularMarketTime?: number;
}

export interface CandleData {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartResponse {
  symbol: string;
  name: string;
  currency: string;
  exchange: string;
  range: string;
  interval: string;
  meta: any;
  candles: CandleData[];
  previousClose: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  quoteType: string;
  typeDisp: string;
}

/**
 * Maps frontend range to Yahoo range & interval.
 * Default range is 1d with 5m candles (current or latest transaction day).
 */
export function normalizeRangeAndInterval(range: string = '1d', interval?: string) {
  const r = range.toLowerCase();
  
  if (interval) {
    return { range: r === '1m' ? '1mo' : r, interval };
  }

  switch (r) {
    case '1d':
      return { range: '1d', interval: '5m' };
    case '5d':
      return { range: '5d', interval: '15m' };
    case '1m':
    case '1mo':
      return { range: '1mo', interval: '1d' };
    case '3m':
    case '3mo':
      return { range: '3mo', interval: '1d' };
    case '6m':
    case '6mo':
      return { range: '6mo', interval: '1d' };
    case '1y':
      return { range: '1y', interval: '1d' };
    case '5y':
      return { range: '5y', interval: '1wk' };
    case 'max':
      return { range: 'max', interval: '1mo' };
    default:
      return { range: '1d', interval: '5m' };
  }
}

/**
 * Fetch chart & latest quote metadata for a single symbol
 */
export async function fetchStockChart(
  rawSymbol: string,
  userRange: string = '1d',
  userInterval?: string
): Promise<ChartResponse> {
  const symbol = rawSymbol.trim().toUpperCase();
  const { range, interval } = normalizeRangeAndInterval(userRange, userInterval);
  const cacheKey = `chart:${symbol}:${range}:${interval}`;

  const cached = getCached<ChartResponse>(cacheKey);
  if (cached) return cached;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': '*/*',
    },
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance error (${res.status}): failed to fetch chart for ${symbol}`);
  }

  const json = await res.json();
  const chartResult = json?.chart?.result?.[0];

  if (!chartResult) {
    const errorMsg = json?.chart?.error?.description || `No chart data found for ${symbol}`;
    throw new Error(errorMsg);
  }

  const meta = chartResult.meta || {};
  const timestamps: number[] = chartResult.timestamp || [];
  const quote = chartResult.indicators?.quote?.[0] || {};
  const opens = quote.open || [];
  const highs = quote.high || [];
  const lows = quote.low || [];
  const closes = quote.close || [];
  const volumes = quote.volume || [];

  const candles: CandleData[] = [];
  const seenTimestamps = new Set<number>();

  for (let i = 0; i < timestamps.length; i++) {
    const time = timestamps[i];
    const open = opens[i];
    const high = highs[i];
    const low = lows[i];
    const close = closes[i];
    const volume = volumes[i] || 0;

    // Filter out null or incomplete candles and duplicate timestamps
    if (
      time &&
      open != null &&
      high != null &&
      low != null &&
      close != null &&
      !seenTimestamps.has(time)
    ) {
      seenTimestamps.add(time);
      candles.push({
        time,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.round(volume),
      });
    }
  }

  // Ensure candles are sorted ascending by time
  candles.sort((a, b) => a.time - b.time);

  const prevClose = meta.previousClose || meta.chartPreviousClose || (candles[0]?.open ?? 0);

  const result: ChartResponse = {
    symbol,
    name: meta.shortName || meta.longName || symbol,
    currency: meta.currency || 'USD',
    exchange: meta.fullExchangeName || meta.exchangeName || '',
    range,
    interval,
    meta,
    candles,
    previousClose: Number(prevClose.toFixed(2)),
  };

  // Cache: 15s for 1d, 2 mins for other ranges
  const ttl = range === '1d' ? 15000 : 120000;
  setCached(cacheKey, result, ttl);

  return result;
}

/**
 * Fetch latest quote summary for a single symbol
 */
export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  const chartData = await fetchStockChart(symbol, '1d', '5m');
  const meta = chartData.meta;
  const candles = chartData.candles;

  const latestCandle = candles[candles.length - 1];
  const price = meta.regularMarketPrice ?? latestCandle?.close ?? chartData.previousClose;
  const prevClose = meta.previousClose || meta.chartPreviousClose || price;
  const change = price - prevClose;
  const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return {
    symbol: chartData.symbol,
    name: chartData.name,
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    previousClose: Number(prevClose.toFixed(2)),
    dayHigh: Number((meta.regularMarketDayHigh ?? latestCandle?.high ?? price).toFixed(2)),
    dayLow: Number((meta.regularMarketDayLow ?? latestCandle?.low ?? price).toFixed(2)),
    volume: meta.regularMarketVolume ?? latestCandle?.volume ?? 0,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ? Number(meta.fiftyTwoWeekHigh.toFixed(2)) : undefined,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ? Number(meta.fiftyTwoWeekLow.toFixed(2)) : undefined,
    currency: chartData.currency,
    exchange: chartData.exchange,
    regularMarketTime: meta.regularMarketTime,
  };
}

/**
 * Fetch quotes for multiple symbols concurrently
 */
export async function fetchBatchQuotes(symbols: string[]): Promise<StockQuote[]> {
  const cleanSymbols = Array.from(new Set(symbols.map(s => s.trim().toUpperCase()))).filter(Boolean);
  
  const results = await Promise.allSettled(
    cleanSymbols.map(sym => fetchStockQuote(sym))
  );

  const quotes: StockQuote[] = [];
  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    if (res.status === 'fulfilled') {
      quotes.push(res.value);
    } else {
      console.warn(`Failed to fetch quote for ${cleanSymbols[i]}:`, res.reason);
      // Add a placeholder quote if network fails for one symbol
      quotes.push({
        symbol: cleanSymbols[i],
        name: cleanSymbols[i],
        price: 0,
        change: 0,
        changePercent: 0,
        previousClose: 0,
        dayHigh: 0,
        dayLow: 0,
        volume: 0,
        currency: 'USD',
        exchange: '',
      });
    }
  }

  return quotes;
}

/**
 * Search ticker symbols / company names via Yahoo search
 */
export async function searchSymbols(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const cacheKey = `search:${q.toLowerCase()}`;
  const cached = getCached<SearchResult[]>(cacheKey);
  if (cached) return cached;

  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': '*/*',
    },
  });

  if (!res.ok) {
    return [];
  }

  const json = await res.json();
  const rawQuotes = json?.quotes || [];

  const results: SearchResult[] = rawQuotes
    .filter((item: any) => item.symbol && (item.isYahooFinance !== false))
    .map((item: any) => ({
      symbol: item.symbol,
      name: item.shortname || item.longname || item.symbol,
      exchange: item.exchange || item.exchDisp || '',
      quoteType: item.quoteType || '',
      typeDisp: item.typeDisp || item.quoteType || 'Equity',
    }));

  setCached(cacheKey, results, 300000); // 5 min cache
  return results;
}
