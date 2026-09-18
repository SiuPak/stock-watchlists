// src/App.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import WatchlistSidebar from './components/WatchlistSidebar';
import StockSearch from './components/StockSearch';
import StockTable from './components/StockTable';
import StockChart from './components/StockChart';
import TimeRangeSelector from './components/TimeRangeSelector';
import StockDetailHeader from './components/StockDetailHeader';
import {
  getWatchlists,
  createWatchlist,
  updateWatchlist,
  deleteWatchlist,
  addStockToWatchlist,
  removeStockFromWatchlist,
  getQuotes,
  getStockChart,
} from './services/api';
import { AlertCircle, PlusCircle, TrendingUp } from 'lucide-react';

export default function App() {
  const [watchlists, setWatchlists] = useState([]);
  const [activeWatchlistId, setActiveWatchlistId] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [chartData, setChartData] = useState(null);

  // Chart configuration state - Default period: '1d' (current/latest transaction day)
  const [timeRange, setTimeRange] = useState('1d');
  const [chartType, setChartType] = useState('candlestick');
  const [showVolume, setShowVolume] = useState(true);

  // Loading states
  const [isLoadingWatchlists, setIsLoadingWatchlists] = useState(true);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [chartError, setChartError] = useState(null);
  const [globalError, setGlobalError] = useState(null);

  // Auto refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);

  const activeWatchlist = watchlists.find((w) => w.id === activeWatchlistId);

  // 1. Initial Load: Fetch watchlists
  useEffect(() => {
    async function init() {
      try {
        setIsLoadingWatchlists(true);
        const lists = await getWatchlists();
        setWatchlists(lists);
        if (lists.length > 0) {
          setActiveWatchlistId(lists[0].id);
          if (lists[0].symbols?.length > 0) {
            setSelectedSymbol(lists[0].symbols[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load watchlists:', err);
        setGlobalError('Unable to connect to backend server. Make sure it is running.');
      } finally {
        setIsLoadingWatchlists(false);
      }
    }
    init();
  }, []);

  // 2. Fetch quotes when active watchlist changes
  const fetchActiveQuotes = useCallback(async (symbols) => {
    if (!symbols || symbols.length === 0) {
      setQuotes([]);
      return;
    }
    try {
      setIsLoadingQuotes(true);
      const data = await getQuotes(symbols);
      setQuotes(data);
    } catch (err) {
      console.error('Failed to fetch quotes:', err);
    } finally {
      setIsLoadingQuotes(false);
    }
  }, []);

  useEffect(() => {
    if (activeWatchlist) {
      fetchActiveQuotes(activeWatchlist.symbols);
      // Ensure selected symbol is valid for this watchlist
      if (
        activeWatchlist.symbols.length > 0 &&
        (!selectedSymbol || !activeWatchlist.symbols.includes(selectedSymbol))
      ) {
        setSelectedSymbol(activeWatchlist.symbols[0]);
      } else if (activeWatchlist.symbols.length === 0) {
        setSelectedSymbol(null);
        setChartData(null);
      }
    }
  }, [activeWatchlistId, activeWatchlist?.symbols?.join(','), fetchActiveQuotes]);

  // 3. Fetch chart data when selected symbol or time range changes
  const fetchChart = useCallback(async (symbol, range) => {
    if (!symbol) {
      setChartData(null);
      return;
    }
    try {
      setIsLoadingChart(true);
      setChartError(null);
      const data = await getStockChart(symbol, range);
      setChartData(data);
    } catch (err) {
      console.error(`Failed to load chart for ${symbol}:`, err);
      setChartError(err.message || 'Failed to load chart data');
    } finally {
      setIsLoadingChart(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      fetchChart(selectedSymbol, timeRange);
    }
  }, [selectedSymbol, timeRange, fetchChart]);

  // 4. Auto Refresh timer (every 30s)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger refresh
          if (activeWatchlist?.symbols?.length) {
            fetchActiveQuotes(activeWatchlist.symbols);
          }
          if (selectedSymbol && timeRange === '1d') {
            fetchChart(selectedSymbol, timeRange);
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, activeWatchlist?.symbols, selectedSymbol, timeRange, fetchActiveQuotes, fetchChart]);

  // Manual refresh handler
  const handleManualRefresh = async () => {
    setCountdown(30);
    if (activeWatchlist?.symbols?.length) {
      await fetchActiveQuotes(activeWatchlist.symbols);
    }
    if (selectedSymbol) {
      await fetchChart(selectedSymbol, timeRange);
    }
  };

  // Watchlist Actions
  const handleCreateWatchlist = async (name) => {
    try {
      const created = await createWatchlist(name, []);
      setWatchlists((prev) => [...prev, created]);
      setActiveWatchlistId(created.id);
      setSelectedSymbol(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRenameWatchlist = async (id, newName) => {
    try {
      const updated = await updateWatchlist(id, { name: newName });
      setWatchlists((prev) => prev.map((w) => (w.id === id ? updated : w)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteWatchlist = async (id) => {
    try {
      const remaining = await deleteWatchlist(id);
      setWatchlists(remaining);
      if (activeWatchlistId === id && remaining.length > 0) {
        setActiveWatchlistId(remaining[0].id);
        if (remaining[0].symbols?.length > 0) {
          setSelectedSymbol(remaining[0].symbols[0]);
        } else {
          setSelectedSymbol(null);
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Stock Actions
  const handleAddStock = async (symbol) => {
    if (!activeWatchlistId) return;
    try {
      const updated = await addStockToWatchlist(activeWatchlistId, symbol);
      setWatchlists((prev) => prev.map((w) => (w.id === activeWatchlistId ? updated : w)));
      setSelectedSymbol(symbol.toUpperCase());
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveStock = async (symbol) => {
    if (!activeWatchlistId) return;
    try {
      const updated = await removeStockFromWatchlist(activeWatchlistId, symbol);
      setWatchlists((prev) => prev.map((w) => (w.id === activeWatchlistId ? updated : w)));
      if (selectedSymbol === symbol) {
        const remainingSymbols = updated.symbols;
        setSelectedSymbol(remainingSymbols.length > 0 ? remainingSymbols[0] : null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const selectedStockQuote = quotes.find((q) => q.symbol === selectedSymbol);

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onRefresh={handleManualRefresh}
        isRefreshing={isLoadingQuotes || isLoadingChart}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        countdown={countdown}
      />

      {/* Global Error Banner if any */}
      {globalError && (
        <div className="bg-red-950/80 border-b border-red-800 p-3 px-6 text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{globalError}</span>
          </div>
          <button
            onClick={() => setGlobalError(null)}
            className="text-red-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Watchlist Sidebar */}
        <WatchlistSidebar
          watchlists={watchlists}
          activeWatchlistId={activeWatchlistId}
          onSelectWatchlist={setActiveWatchlistId}
          onCreateWatchlist={handleCreateWatchlist}
          onRenameWatchlist={handleRenameWatchlist}
          onDeleteWatchlist={handleDeleteWatchlist}
        />

        {/* Dashboard Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-[1600px] w-full mx-auto space-y-5">
          {/* Header Bar: Active Watchlist Title & Search to Add Stock */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800/80">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  {activeWatchlist?.name || 'Watchlist'}
                </h2>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                  {activeWatchlist?.symbols?.length || 0} stocks
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Select a stock below to inspect live prices and interactive historical charts
              </p>
            </div>

            {/* Autocomplete Search to Add Stock */}
            <div className="w-full sm:w-auto">
              <StockSearch
                activeWatchlist={activeWatchlist}
                onAddStock={handleAddStock}
              />
            </div>
          </div>

          {/* If there is a selected stock, show the Chart & Financial Highlights */}
          {selectedSymbol ? (
            <section className="space-y-4">
              {/* Selected Stock Overview Card */}
              <StockDetailHeader
                stock={selectedStockQuote}
                chartMeta={chartData?.meta}
              />

              {/* Time Range Selector & View Controls */}
              <TimeRangeSelector
                selectedRange={timeRange}
                onSelectRange={setTimeRange}
                chartType={chartType}
                onChangeChartType={setChartType}
                showVolume={showVolume}
                onToggleVolume={() => setShowVolume(!showVolume)}
              />

              {/* Interactive TradingView Lightweight Chart */}
              <StockChart
                chartData={chartData}
                timeRange={timeRange}
                chartType={chartType}
                showVolume={showVolume}
                isLoading={isLoadingChart}
                error={chartError}
              />
            </section>
          ) : (
            <div className="p-12 text-center bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
              <TrendingUp className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-200">No stock selected</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Search and add stocks to this watchlist or click on a stock from the table to inspect its price chart.
              </p>
            </div>
          )}

          {/* Stocks Table */}
          <section className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-200 flex items-center space-x-2">
                <span>Watchlist Stocks</span>
                <span className="text-xs text-gray-500 font-normal">
                  (Click any row to display chart)
                </span>
              </h3>
            </div>

            <StockTable
              stocks={quotes}
              selectedSymbol={selectedSymbol}
              onSelectStock={(sym) => setSelectedSymbol(sym)}
              onRemoveStock={handleRemoveStock}
              isLoading={isLoadingQuotes}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
