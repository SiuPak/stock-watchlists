// src/components/StockDetailHeader.jsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Globe, Building } from 'lucide-react';

function formatVolume(val) {
  if (!val) return '--';
  if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
  if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
  if (val >= 1e3) return (val / 1e3).toFixed(1) + 'K';
  return val.toLocaleString();
}

export default function StockDetailHeader({ stock, chartMeta }) {
  if (!stock && !chartMeta) return null;

  const symbol = stock?.symbol || chartMeta?.symbol;
  const name = stock?.name || chartMeta?.shortName || chartMeta?.longName || symbol;
  const price = stock?.price ?? chartMeta?.regularMarketPrice;
  const change = stock?.change ?? (chartMeta?.fulldayChange ?? chartMeta?.regularMarketChange);
  const changePercent = stock?.changePercent ?? (chartMeta?.fulldayChangePercent ?? chartMeta?.regularMarketChangePercent);
  const isPositive = (change ?? 0) >= 0;

  const dayHigh = stock?.dayHigh ?? chartMeta?.regularMarketDayHigh;
  const dayLow = stock?.dayLow ?? chartMeta?.regularMarketDayLow;
  const prevClose = stock?.previousClose ?? chartMeta?.previousClose;
  const volume = stock?.volume ?? chartMeta?.regularMarketVolume;
  const high52 = stock?.fiftyTwoWeekHigh ?? chartMeta?.fiftyTwoWeekHigh;
  const low52 = stock?.fiftyTwoWeekLow ?? chartMeta?.fiftyTwoWeekLow;
  const currency = stock?.currency || chartMeta?.currency || 'USD';
  const exchange = stock?.exchange || chartMeta?.fullExchangeName || chartMeta?.exchangeName || '';

  return (
    <div className="bg-[#0d131f] border border-gray-800 rounded-2xl p-5 mb-4 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Symbol & Name */}
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black font-mono-finance text-white tracking-tight">
              {symbol}
            </h2>
            {exchange && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700/60 uppercase">
                {exchange}
              </span>
            )}
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              {currency}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-400 mt-1 truncate max-w-md">
            {name}
          </p>
        </div>

        {/* Right: Big Price & Change */}
        <div className="flex items-baseline md:items-end flex-col">
          <div className="text-3xl font-black font-mono-finance text-gray-100 tracking-tight">
            ${price != null ? price.toFixed(2) : '--'}
          </div>
          <div
            className={`flex items-center space-x-1.5 mt-1 text-sm font-semibold font-mono-finance px-2.5 py-0.5 rounded-lg ${
              isPositive
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-red-400 bg-red-500/10'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {change != null ? change.toFixed(2) : '--'}
            </span>
            <span>
              ({isPositive ? '+' : ''}
              {changePercent != null ? changePercent.toFixed(2) : '--'}%)
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-gray-800/80 text-xs">
        <div className="bg-gray-900/40 rounded-xl p-2.5 border border-gray-800/40">
          <span className="text-[11px] text-gray-400 block mb-0.5">Previous Close</span>
          <span className="font-mono-finance font-semibold text-gray-200">
            ${prevClose != null ? prevClose.toFixed(2) : '--'}
          </span>
        </div>

        <div className="bg-gray-900/40 rounded-xl p-2.5 border border-gray-800/40">
          <span className="text-[11px] text-gray-400 block mb-0.5">Day Range</span>
          <span className="font-mono-finance font-semibold text-gray-200">
            ${dayLow != null ? dayLow.toFixed(2) : '--'} - ${dayHigh != null ? dayHigh.toFixed(2) : '--'}
          </span>
        </div>

        <div className="bg-gray-900/40 rounded-xl p-2.5 border border-gray-800/40">
          <span className="text-[11px] text-gray-400 block mb-0.5">52-Week Range</span>
          <span className="font-mono-finance font-semibold text-gray-200">
            ${low52 != null ? low52.toFixed(2) : '--'} - ${high52 != null ? high52.toFixed(2) : '--'}
          </span>
        </div>

        <div className="bg-gray-900/40 rounded-xl p-2.5 border border-gray-800/40">
          <span className="text-[11px] text-gray-400 block mb-0.5">Volume</span>
          <span className="font-mono-finance font-semibold text-gray-200">
            {formatVolume(volume)}
          </span>
        </div>
      </div>
    </div>
  );
}
