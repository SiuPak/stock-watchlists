# Implementation Plan - Stock Watchlists \& Financial Charts Web Application

Create a modern, responsive web application for managing stock watchlists, monitoring latest prices, and visualizing interactive candlestick and area price charts with flexible time-range controls.

## User Review Required

> \[!IMPORTANT]
> \*\*Stock Data Source Recommendation\*\*:
> We recommend using the \*\*Yahoo Finance v8 Public API\*\* (via our backend proxy with in-memory caching).
> - \*\*Zero API Keys \& Free\*\*: No sign-up, credit card, or token configuration required.
> - \*\*Full Intraday Data\*\*: Provides 1-minute, 2-minute, and 5-minute interval candles for the \*\*current or latest transaction day\*\* (satisfies your default period requirement).
> - \*\*Wide Time Ranges\*\*: Supports 1D, 5D, 1M, 3M, 6M, 1Y, 5Y, and MAX history.
> - \*\*Autocomplete Search\*\*: Built-in symbol and company name lookup.
> - \*\*Coverage\*\*: US stocks, ETFs, indices (S\&P 500, Nasdaq), and global equities.

> \[!TIP]
> \*\*Runtime \& Performance with Bun\*\*:
> You have \*\*Bun v1.4.0\*\* installed! We will use \*\*Bun\*\* instead of Node.js:
> - \*\*Lightning-fast native HTTP\*\*: Powered by `Bun.serve` and Hono, achieving up to 3x-5x faster API throughput and sub-millisecond route latency.
> - \*\*Blazing fast package management\*\*: Instant `bun install` without npm overhead.
> - \*\*Native TypeScript \& ESM execution\*\*: Zero transpile step needed for the backend.

> \[!TIP]
> For the charting engine, we propose using \*\*TradingView's Lightweight Charts\*\* (`lightweight-charts`). It is open-source (Apache 2.0), extremely fast (Canvas-based), and specifically designed for financial candlesticks, area charts, volume bars, and crosshair inspection.

\---

## Key Features \& User Experience

1. **Watchlist Management (CRUD)**:

   * Create new custom watchlists (e.g. "Tech Giants", "Semiconductors", "Dividend Aristocrats").
   * Rename existing watchlists inline.
   * Delete watchlists with confirmation.
   * Switch active watchlists instantly from a clean sidebar / tab switcher.
   * Persistent storage: Saved to a server-side JSON database (`data/watchlists.json`) with client-side state synchronization.
   * Pre-populated default watchlists ("Tech Titans", "Broad Market ETFs") on first run.
2. **Stock Management within Watchlists**:

   * **Autocomplete Search Bar**: Search by ticker (e.g., `NVDA`, `AAPL`) or company name (e.g., `Nvidia`, `Apple`) with live suggestions.
   * Add stock to the current list.
   * Remove stock from the current list.
   * Quick symbol status (e.g., showing if already in the list).
3. **Stock Prices \& Table / Card View**:

   * Live/latest prices for all stocks in the active list.
   * Price Change ($) and Percentage Change (%) with green/red badges.
   * Key daily metrics: Day High, Day Low, Previous Close, Volume, Market Cap / Currency.
   * Highlight the currently selected stock.
   * Refresh button and optional auto-refresh toggle (every 30s during market hours).
4. **Interactive Financial Chart**:

   * **Default Time Range**: **1D (Current or Latest Transaction Day)** using 2m/5m intraday intervals.
   * **Time Range Controls**: `1D` (Intraday), `5D` (Intraday 15m), `1M` (Daily), `3M` (Daily), `6M` (Daily), `1Y` (Daily), `5Y` (Weekly), `MAX` (Monthly).
   * **Chart Style Toggle**: Switch between **Candlestick** and **Area/Line** chart.
   * **Volume Histogram**: Integrated volume bars at the bottom with color matching price direction.
   * **Interactive Crosshair \& Tooltip**: Displays Date/Time, Open, High, Low, Close, and Volume on hover.
   * **Summary Header**: Selected company name, symbol, current price, change, market status (Regular, Pre-market, Post-market, Closed).

\---

## Proposed Architecture

```
stock-watchlists/
├── package.json              # Unified scripts and project dependencies
├── server/
│   ├── index.js              # Express API server (port 3001)
│   ├── routes/
│   │   ├── stocks.js         # /api/stocks/search, /api/stocks/quotes, /api/stocks/chart
│   │   └── watchlists.js     # /api/watchlists CRUD routes
│   ├── services/
│   │   └── yahooFinance.js   # Stock data fetcher, quote extractor, cache layer
│   └── storage/
│       └── watchlists.json   # Persistent JSON file storage for watchlists
├── src/                      # Frontend (Vite + React + Tailwind CSS)
│   ├── components/
│   │   ├── Header.jsx        # Navigation, market status, global refresh
│   │   ├── WatchlistSidebar.jsx # List of watchlists, create/edit/delete modals
│   │   ├── StockSearch.jsx   # Autocomplete search for adding symbols
│   │   ├── StockTable.jsx    # Quotes table with price, change %, high/low
│   │   ├── StockChart.jsx    # TradingView Lightweight Charts component
│   │   ├── TimeRangeSelector.jsx # 1D, 5D, 1M, 3M, 6M, 1Y, 5Y, MAX buttons
│   │   └── StockStats.jsx    # Detailed stats card (52w high/low, volume, etc.)
│   ├── services/
│   │   └── api.js            # API client for backend
│   ├── App.jsx               # Main dashboard layout
│   ├── index.css             # Tailwind styling \& dark financial theme
│   └── main.jsx              # React root entry point
├── vite.config.js            # Vite config with API proxy to port 3001
└── tailwind.config.js        # Tailwind CSS config
```

\---

## Proposed Changes

### Backend Implementation

#### \[NEW] `server/services/yahooFinance.js`

* Connects to Yahoo Finance public endpoints with custom User-Agent headers:

  * `chart/{symbol}?range={range}\&interval={interval}` for OHLCV candlestick and volume data.
  * Automatically maps requested range to optimal interval (`1d` -> `5m`, `5d` -> `15m`, `1mo` -> `1d`, `1y` -> `1d`, `max` -> `1mo`).
  * `search?q={query}` for ticker and company autocomplete lookup.
* Extracts quote metrics from chart `meta` (latest price, day high/low, previous close, volume, 52-week range, currency, exchange).
* Short in-memory caching (15 seconds) to prevent redundant upstream requests and ensure fast responses.

#### \[NEW] `server/routes/stocks.js`

* `GET /api/stocks/search?q={query}`: Autocomplete search.
* `GET /api/stocks/quotes?symbols={csv}`: Batch fetch latest quote summaries for all symbols in a watchlist.
* `GET /api/stocks/chart/:symbol?range={range}\&interval={interval}`: Chart series data with timestamps, open, high, low, close, volume.

#### \[NEW] `server/routes/watchlists.js` \& `server/storage/watchlists.json`

* Full CRUD for watchlists:

  * List all watchlists.
  * Create new watchlist.
  * Rename watchlist.
  * Delete watchlist.
  * Add stock to watchlist.
  * Remove stock from watchlist.
* File-based persistence ensuring data survives server restarts.

#### \[NEW] `server/index.js`

* Express app setup, CORS, JSON body parser, route mounting, error handling, port 3001.

\---

### Frontend Implementation

#### \[NEW] `src/components/StockChart.jsx`

* Initializes TradingView `lightweight-charts` with dark financial theme.
* Responsive canvas container with auto-resize observer.
* Supports switching between Candlestick and Area line series.
* Secondary volume histogram series.
* Crosshair tooltip with OHLCV readouts.

#### \[NEW] `src/components/TimeRangeSelector.jsx`

* Clean button pills for:

  * **1D (Active by default - Latest/current transaction day)**
  * **5D**
  * **1M**
  * **3M**
  * **6M**
  * **1Y**
  * **5Y**
  * **MAX**

#### \[NEW] `src/components/WatchlistSidebar.jsx`

* Watchlist management UI:

  * List of watchlists with stock counts.
  * "New List" button with inline or modal prompt.
  * Edit name and Delete actions with confirm dialog.
  * Mobile-friendly collapse/drawer.

#### \[NEW] `src/components/StockTable.jsx` \& `src/components/StockSearch.jsx`

* Autocomplete search input with debounced API lookup.
* Stock table showing Symbol, Name, Price, Change ($), Change (%), High/Low, Volume, and Delete action.
* Row selection triggers chart update.

#### \[NEW] `src/App.jsx`

* Coordinates state: active watchlist, stock quotes, selected stock, chart time range, chart type.
* Polls quotes every 30 seconds when enabled.

\---

## Verification Plan

### Automated \& Sanity Tests

1. Verify backend starts cleanly on port 3001:

```powershell
   node server/index.js
   ```

2. Test backend API endpoints via PowerShell `curl` / `Invoke-RestMethod`:

   * `GET http://localhost:3001/api/stocks/search?q=AAPL`
   * `GET http://localhost:3001/api/stocks/quotes?symbols=AAPL,MSFT`
   * `GET http://localhost:3001/api/stocks/chart/AAPL?range=1d\&interval=5m`
   * `GET http://localhost:3001/api/watchlists`
3. Verify Vite client build and development server:

```powershell
   npm run build
   ```

### Manual Verification

1. **Watchlists**:

   * Create a new watchlist named "Semiconductors".
   * Rename it to "Chips \& Semi".
   * Delete it and confirm removal.
2. **Stock Management**:

   * In "Tech Titans", search for "NVDA" and add it.
   * Remove a stock and confirm the list updates.
3. **Price Display**:

   * Confirm latest prices, daily change %, green/red colors, and volume are displayed correctly.
4. **Chart \& Time Range**:

   * Verify that upon selecting a stock, the chart defaults to **1D** (the current or latest trading day session).
   * Switch time ranges: 1D, 5D, 1M, 6M, 1Y, MAX, and verify candles/line update accordingly.
   * Toggle between Candlestick and Area chart.
   * Hover over candles to verify crosshair and tooltip OHLCV values.

