# StockWatch - Real-Time Stock Watchlists & Financial Charts

A high-performance web application for managing stock watchlists, monitoring live prices, and visualizing interactive candlestick and area price charts with custom time ranges, powered by **Bun**, **Hono**, **React**, and **TradingView Lightweight Charts**.

## Features

- **Watchlist Management**:
  - Add, rename, and delete custom watchlists.
  - Persistent storage across server restarts (`server/storage/watchlists.json`).
  - Pre-configured starter lists: *Tech Titans*, *Market ETFs*, and *Blue Chip & Value*.
- **Stock Management & Quotes**:
  - Autocomplete search by ticker symbol or company name (e.g. `NVDA`, `Apple`).
  - Add and remove stocks to/from any watchlist with a single click.
  - Real-time/latest price quotes with 24-hour price change ($ and %), day high/low, and volume.
  - Auto-refresh toggle (every 30 seconds) with countdown indicator and manual refresh button.
- **Interactive Financial Charts**:
  - Powered by **TradingView's Lightweight Charts** (open-source Apache 2.0).
  - **Default Time Range**: **1D** (current or latest transaction day with 5-minute intraday candles).
  - **Time Range Controls**: `1D`, `5D`, `1M`, `3M`, `6M`, `1Y`, `5Y`, and `MAX`.
  - **Chart Modes**: Toggle between **Candlestick** and **Area/Line** charts.
  - **Volume Histogram**: Integrated volume bars at the bottom with matching bullish/bearish colors.
  - **Crosshair Tooltip**: Displays Date/Time, Open, High, Low, Close, and Volume on hover.
  - **Detailed Statistics**: 52-week range, day range, volume, previous close, exchange, and currency.
- **Free & Open-Source Stock Data**:
  - Powered by Yahoo Finance's public v8 endpoints via our ultra-fast backend proxy with in-memory caching.
  - **No API keys or paid accounts needed**.
- **High Performance Runtime**:
  - Powered by **Bun v1.4.0** and **Hono** for sub-millisecond API response times and native HTTP handling.

---

## Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (v1.0+)

### 1. Install Dependencies
```bash
bun install
```

### 2. Start Both Backend & Frontend in Development Mode
```bash
bun run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

### 3. Build for Production
```bash
bun run build
```

---

## API Endpoints

- `GET /api/health` - Health check and runtime information
- `GET /api/watchlists` - Get all saved watchlists
- `POST /api/watchlists` - Create a new watchlist (`{ name: string }`)
- `PUT /api/watchlists/:id` - Rename or update watchlist
- `DELETE /api/watchlists/:id` - Delete a watchlist
- `POST /api/watchlists/:id/stocks` - Add a ticker symbol to a watchlist (`{ symbol: string }`)
- `DELETE /api/watchlists/:id/stocks/:symbol` - Remove a ticker symbol from a watchlist
- `GET /api/stocks/search?q=:query` - Autocomplete ticker and company search
- `GET /api/stocks/quotes?symbols=AAPL,NVDA,TSLA` - Fetch batch price quotes
- `GET /api/stocks/chart/:symbol?range=1d&interval=5m` - Fetch OHLCV candlestick and volume data

---

## Tech Stack

- **Runtime & Package Manager**: Bun
- **Backend Framework**: Hono
- **Frontend Framework**: React 19 + Vite
- **Styling**: Tailwind CSS with dark financial palette
- **Charts**: TradingView Lightweight Charts (`lightweight-charts`)
- **Icons**: Lucide React
