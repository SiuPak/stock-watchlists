// src/components/WatchlistSidebar.jsx
import React, { useState } from 'react';
import {
  List,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Layers,
} from 'lucide-react';

export default function WatchlistSidebar({
  watchlists,
  activeWatchlistId,
  onSelectWatchlist,
  onCreateWatchlist,
  onRenameWatchlist,
  onDeleteWatchlist,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    onCreateWatchlist(newListName.trim());
    setNewListName('');
    setIsCreating(false);
  };

  const handleStartEdit = (list, e) => {
    e.stopPropagation();
    setEditingId(list.id);
    setEditName(list.name);
  };

  const handleSaveEdit = (id, e) => {
    e?.stopPropagation();
    if (!editName.trim()) return;
    onRenameWatchlist(id, editName.trim());
    setEditingId(null);
    setEditName('');
  };

  const handleCancelEdit = (e) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditName('');
  };

  const handleDeletePrompt = (id, e) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = (id, e) => {
    e.stopPropagation();
    onDeleteWatchlist(id);
    setDeleteConfirmId(null);
  };

  return (
    <aside className="w-full lg:w-64 bg-[#0d131f] border-b lg:border-b-0 lg:border-r border-gray-800 flex flex-col flex-shrink-0">
      {/* Header with Title & Add List Button */}
      <div className="p-4 border-b border-gray-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-gray-300 font-semibold text-sm">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Watchlists</span>
          <span className="text-xs font-mono text-gray-500">({watchlists.length})</span>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
          }}
          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs flex items-center space-x-1 transition"
          title="Create New Watchlist"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="font-medium">New</span>
        </button>
      </div>

      {/* New Watchlist Inline Input Form */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="p-3 bg-gray-800/40 border-b border-gray-800">
          <label className="block text-[11px] font-medium text-gray-400 mb-1">New List Name</label>
          <div className="flex items-center space-x-1.5">
            <input
              type="text"
              autoFocus
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="e.g. AI Stocks"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-2.5 py-1 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!newListName.trim()}
              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md disabled:opacity-40 transition"
              title="Save"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewListName('');
              }}
              className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* Watchlists List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {watchlists.map((list) => {
          const isActive = list.id === activeWatchlistId;
          const isEditing = editingId === list.id;
          const isDeleting = deleteConfirmId === list.id;

          if (isEditing) {
            return (
              <div
                key={list.id}
                className="p-2 rounded-lg bg-gray-800/80 border border-emerald-500/50 flex items-center space-x-1.5"
              >
                <input
                  type="text"
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(list.id, e);
                    if (e.key === 'Escape') handleCancelEdit(e);
                  }}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={(e) => handleSaveEdit(list.id, e)}
                  className="p-1 text-emerald-400 hover:bg-gray-700 rounded"
                  title="Save Name"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-gray-400 hover:bg-gray-700 rounded"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          }

          if (isDeleting) {
            return (
              <div
                key={list.id}
                className="p-2 rounded-lg bg-red-950/40 border border-red-800/60 flex items-center justify-between text-xs"
              >
                <span className="text-red-300 font-medium">Delete "{list.name}"?</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => handleConfirmDelete(list.id, e)}
                    className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold transition"
                  >
                    Yes
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(null);
                    }}
                    className="px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 transition"
                  >
                    No
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={list.id}
              onClick={() => onSelectWatchlist(list.id)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-300 hover:bg-gray-800/60 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate flex-1 mr-2">
                <List className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-500'}`} />
                <span className="truncate">{list.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {list.symbols?.length || 0}
                </span>
              </div>

              {/* Action Buttons (Edit / Delete) */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={(e) => handleStartEdit(list, e)}
                  className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-700/60"
                  title="Rename list"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                {watchlists.length > 1 && (
                  <button
                    onClick={(e) => handleDeletePrompt(list.id, e)}
                    className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-gray-700/60"
                    title="Delete list"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
