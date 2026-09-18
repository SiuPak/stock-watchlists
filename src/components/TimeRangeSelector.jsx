// src/components/TimeRangeSelector.jsx
import React from 'react';
import { CandlestickChart, LineChart, BarChart2 } from 'lucide-react';

const RANGES = [
  { id: '1d', label: '1D', description: 'Current / Latest Day' },
  { id: '5d', label: '5D', description: '5 Days' },
  { id: '1m', label: '1M', description: '1 Month' },
  { id: '3m', label: '3M', description: '3 Months' },
  { id: '6m', label: '6M', description: '6 Months' },
  { id: '1y', label: '1Y', description: '1 Year' },
  { id: '5y', label: '5Y', description: '5 Years' },
  { id: 'max', label: 'MAX', description: 'All History' },
];

export default function TimeRangeSelector({
  selectedRange,
  onSelectRange,
  chartType,
  onChangeChartType,
  showVolume,
  onToggleVolume,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-gray-900/60 border border-gray-800/80">
      {/* Time Range Buttons */}
      <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
        {RANGES.map((range) => {
          const isActive = selectedRange.toLowerCase() === range.id;
          return (
            <button
              key={range.id}
              onClick={() => onSelectRange(range.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500 text-gray-950 shadow-sm shadow-emerald-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/80'
              }`}
              title={range.description}
            >
              {range.label}
              {range.id === '1d' && !isActive && (
                <span className="ml-1 text-[9px] text-emerald-400">●</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Chart View Toggles (Candlestick / Area & Volume) */}
      <div className="flex items-center space-x-1.5 pl-2 border-l border-gray-800">
        {/* Candlestick Toggle */}
        <button
          onClick={() => onChangeChartType('candlestick')}
          className={`p-1.5 rounded-lg transition ${
            chartType === 'candlestick'
              ? 'bg-gray-800 text-emerald-400 border border-gray-700'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
          }`}
          title="Candlestick Chart"
        >
          <CandlestickChart className="w-4 h-4" />
        </button>

        {/* Line / Area Toggle */}
        <button
          onClick={() => onChangeChartType('area')}
          className={`p-1.5 rounded-lg transition ${
            chartType === 'area'
              ? 'bg-gray-800 text-emerald-400 border border-gray-700'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
          }`}
          title="Area / Line Chart"
        >
          <LineChart className="w-4 h-4" />
        </button>

        {/* Volume Toggle */}
        <button
          onClick={onToggleVolume}
          className={`p-1.5 rounded-lg transition ${
            showVolume
              ? 'bg-gray-800 text-emerald-400 border border-gray-700'
              : 'text-gray-500 hover:text-gray-400 hover:bg-gray-800/50'
          }`}
          title="Toggle Volume Bars"
        >
          <BarChart2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
