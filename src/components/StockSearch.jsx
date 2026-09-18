// src/components/StockSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Check, Loader2, X } from 'lucide-react';
import { searchStocks } from '../services/api';

export default function StockSearch({ activeWatchlist, onAddStock }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const data = await searchStocks(query);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error('Stock search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStock = (symbol) => {
    onAddStock(symbol);
    setQuery('');
    setIsOpen(false);
  };

  const currentSymbols = activeWatchlist?.symbols || [];

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search stock symbol or name (e.g. AAPL, Tesla)..."
          className="w-full bg-[#111827] border border-gray-700/80 rounded-lg pl-9 pr-8 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition shadow-sm"
        />
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin absolute right-3" />
        ) : query ? (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0f172a] border border-gray-700 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-gray-800/60">
          {results.map((item) => {
            const isAlreadyAdded = currentSymbols.includes(item.symbol.toUpperCase());
            return (
              <div
                key={item.symbol}
                className="p-2.5 hover:bg-gray-800/70 transition flex items-center justify-between group cursor-pointer"
                onClick={() => !isAlreadyAdded && handleSelectStock(item.symbol)}
              >
                <div className="flex-1 mr-3 truncate">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono-finance font-bold text-xs text-emerald-400">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 font-medium">
                      {item.exchange || 'US'}
                    </span>
                    {item.typeDisp && (
                      <span className="text-[10px] text-gray-500">({item.typeDisp})</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 truncate mt-0.5">{item.name}</p>
                </div>

                <div>
                  {isAlreadyAdded ? (
                    <span className="flex items-center space-x-1 text-[11px] text-gray-400 bg-gray-800/80 px-2 py-1 rounded">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Added</span>
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectStock(item.symbol);
                      }}
                      className="flex items-center space-x-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 px-2 py-1 rounded transition"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isOpen && query && !isLoading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0f172a] border border-gray-700 rounded-xl shadow-2xl z-50 p-4 text-center text-xs text-gray-400">
          No matching stocks found for "{query}"
        </div>
      )}
    </div>
  );
}
