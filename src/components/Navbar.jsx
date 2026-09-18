// src/components/Navbar.jsx
import React from 'react';
import { TrendingUp, RefreshCw, Clock } from 'lucide-react';

export default function Navbar({
  onRefresh,
  isRefreshing,
  autoRefresh,
  setAutoRefresh,
  countdown,
}) {
  return (
    <header className="border-b border-gray-800 bg-[#0d131f]/90 backdrop-blur sticky top-0 z-30 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-gray-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">StockWatch</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">Real-Time Watchlists & Interactive Financial Charts</p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center space-x-3">
          {/* Market Status Pill */}
          <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-gray-800/80 border border-gray-700/60 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-gray-300 font-medium">Free Live Feed</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">Yahoo Finance</span>
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
              autoRefresh
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-gray-800/60 text-gray-400 border-gray-700 hover:text-gray-200'
            }`}
            title="Toggle 30-second auto refresh"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto-refresh</span>
            {autoRefresh && (
              <span className="font-mono-finance text-[11px] font-bold text-emerald-300">
                {countdown}s
              </span>
            )}
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 active:scale-95 transition disabled:opacity-50"
            title="Refresh Quotes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
}
