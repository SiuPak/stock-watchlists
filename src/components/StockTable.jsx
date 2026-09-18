// src/components/StockTable.jsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Trash2, TrendingUp, AlertCircle } from 'lucide-react';

function formatNumber(num) {
  if (num == null || isNaN(num)) return '-';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toLocaleString();
}

export default function StockTable({
  stocks = [],
  selectedSymbol,
  onSelectStock,
  onRemoveStock,
  isLoading,
}) {
  if (isLoading && stocks.length === 0) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-xl animate-shimmer bg-gray-800/40" />
        ))}
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800 my-4">
        <div className="w-12 h-12 rounded-full bg-gray-800/80 flex items-center justify-center mb-3">
          <TrendingUp className="w-6 h-6 text-gray-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-200">Watchlist is empty</h3>
        <p className="text-xs text-gray-500 max-w-sm mt-1">
          Use the search bar above to look up ticker symbols (e.g. AAPL, NVDA, TSLA) and add them to this list.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800/80 bg-[#0d131f]/60 backdrop-blur">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-800/80 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-900/40">
            <th className="py-3 px-4">Symbol & Name</th>
            <th className="py-3 px-4 text-right">Price</th>
            <th className="py-3 px-4 text-right">24h Change</th>
            <th className="py-3 px-4 text-right hidden sm:table-cell">Day High / Low</th>
            <th className="py-3 px-4 text-right hidden md:table-cell">Volume</th>
            <th className="py-3 px-3 text-center w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50 text-xs">
          {stocks.map((stock) => {
            const isSelected = stock.symbol === selectedSymbol;
            const isPositive = stock.change >= 0;
            const isZero = stock.change === 0;

            return (
              <tr
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className={`group cursor-pointer transition select-none ${
                  isSelected
                    ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500'
                    : 'hover:bg-gray-800/40 border-l-4 border-l-transparent'
                }`}
              >
                {/* Symbol & Name */}
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono-finance font-bold text-sm text-gray-100 group-hover:text-emerald-400 transition">
                      {stock.symbol}
                    </span>
                    {stock.currency && (
                      <span className="text-[10px] text-gray-500 uppercase">{stock.currency}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate max-w-[160px] sm:max-w-[200px]">
                    {stock.name || stock.symbol}
                  </div>
                </td>

                {/* Current / Latest Price */}
                <td className="py-3 px-4 text-right">
                  <div className="font-mono-finance font-bold text-sm text-gray-100">
                    ${stock.price != null ? stock.price.toFixed(2) : '--'}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Prev: ${stock.previousClose?.toFixed(2) ?? '--'}
                  </div>
                </td>

                {/* Change ($ & %) */}
                <td className="py-3 px-4 text-right">
                  <div
                    className={`inline-flex items-center space-x-0.5 px-2 py-0.5 rounded font-mono-finance font-semibold text-xs ${
                      isPositive
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : isZero
                        ? 'text-gray-400 bg-gray-800'
                        : 'text-red-400 bg-red-500/10'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : isZero ? null : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isPositive ? '+' : ''}
                      {stock.changePercent != null ? stock.changePercent.toFixed(2) : '0.00'}%
                    </span>
                  </div>
                  <div
                    className={`text-[11px] font-mono-finance mt-0.5 ${
                      isPositive ? 'text-emerald-500/80' : isZero ? 'text-gray-500' : 'text-red-500/80'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {stock.change != null ? stock.change.toFixed(2) : '--'}
                  </div>
                </td>

                {/* Day High / Low */}
                <td className="py-3 px-4 text-right hidden sm:table-cell font-mono-finance text-[11px] text-gray-300">
                  <div>H: ${stock.dayHigh ? stock.dayHigh.toFixed(2) : '--'}</div>
                  <div className="text-gray-500">L: ${stock.dayLow ? stock.dayLow.toFixed(2) : '--'}</div>
                </td>

                {/* Volume */}
                <td className="py-3 px-4 text-right hidden md:table-cell font-mono-finance text-[11px] text-gray-400">
                  {formatNumber(stock.volume)}
                </td>

                {/* Actions (Remove from list) */}
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveStock(stock.symbol);
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800/80 opacity-0 group-hover:opacity-100 transition"
                    title={`Remove ${stock.symbol} from list`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
