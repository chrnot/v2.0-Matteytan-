import React, { memo } from 'react';
import { Icons } from './icons';

interface SelectionToolbarProps {
  selectedCount: number;
  totalWidgets: number;
  hasGroupedSelected: boolean;
  onGroup: () => void;
  onUngroupSelected: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isDarkMode?: boolean;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = memo(({
  selectedCount,
  totalWidgets,
  hasGroupedSelected,
  onGroup,
  onUngroupSelected,
  onSelectAll,
  onClearSelection,
  isDarkMode = false
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-[2600] flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-bottom-3 duration-200 transition-all select-none bg-white/95 dark:bg-slate-900/95 border-blue-400/60 dark:border-blue-500/50 text-slate-800 dark:text-slate-100">
      
      {/* Selection count badge */}
      <div className="flex items-center gap-2 pr-2 border-r border-slate-200 dark:border-slate-700">
        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
          {selectedCount}
        </div>
        <span className="text-xs sm:text-sm font-bold tracking-tight">
          {selectedCount === 1 ? '1 widget vald' : `${selectedCount} widgetar valda`}
        </span>
      </div>

      {/* Group button */}
      <button
        onClick={onGroup}
        disabled={selectedCount < 2}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:scale-105 active:scale-95"
        title={selectedCount < 2 ? 'Välj minst 2 widgetar för att gruppera' : 'Gruppera markerade widgetar'}
      >
        <Icons.Link size={16} />
        <span>Gruppera</span>
      </button>

      {/* Ungroup button if any selected is grouped */}
      {hasGroupedSelected && (
        <button
          onClick={onUngroupSelected}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all border border-rose-300 dark:border-rose-700/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:scale-105 active:scale-95"
          title="Dela upp markerade grupperade widgetar"
        >
          <Icons.Unlink size={16} />
          <span>Avgruppera</span>
        </button>
      )}

      {/* Select all toggle */}
      {selectedCount < totalWidgets && (
        <button
          onClick={onSelectAll}
          className="hidden md:flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Markera alla widgetar på whiteboarden"
        >
          <Icons.BoxSelect size={14} />
          <span>Välj alla</span>
        </button>
      )}

      {/* Clear selection */}
      <button
        onClick={onClearSelection}
        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors ml-1"
        title="Avbryt markering (Esc)"
      >
        <Icons.Close size={18} />
      </button>
    </div>
  );
});
