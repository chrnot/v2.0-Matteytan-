import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './icons';
import { WidgetType, MathArea } from '../types';
import { WIDGET_SEARCH_INDEX, SearchableWidget } from '../data/widgetSearchIndex';
import { MATH_AREAS } from './MathAreaConfig';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (type: WidgetType) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onAddWidget }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchableWidget[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on load
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setQuery('');
      // Show some recommendations initially
      setResults([]);
    }
  }, [isOpen]);

  // Handle Search logic
  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const filtered = WIDGET_SEARCH_INDEX.filter((widget) => {
      // 1. Matches name/title
      const titleMatch = widget.title.toLowerCase().includes(trimmed);
      
      // 2. Matches description
      const descMatch = widget.description.toLowerCase().includes(trimmed);
      
      // 3. Matches categorization
      const categoryMatch = widget.category.some(cat => {
        const config = MATH_AREAS.find(c => c.id === cat);
        return config?.label.toLowerCase().includes(trimmed);
      });

      // 4. Matches search tags / curriculum keywords from 'i' modal
      const tagMatch = widget.searchTerms.some(term => 
        term.toLowerCase().includes(trimmed)
      );

      return titleMatch || descMatch || categoryMatch || tagMatch;
    });

    // Score or sort match results (prioritize title match first)
    const sorted = [...filtered].sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().startsWith(trimmed);
      const bTitleMatch = b.title.toLowerCase().startsWith(trimmed);
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      return a.title.localeCompare(b.title);
    });

    setResults(sorted);
  }, [query]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectWidget = (type: WidgetType) => {
    onAddWidget(type);
    onClose();
  };

  // Pre-configured recommendations
  const recommendations = WIDGET_SEARCH_INDEX.filter((w) =>
    [WidgetType.NUMBER_OF_DAY, WidgetType.CENTIKUB_BOX, WidgetType.EQUATION, WidgetType.FRACTION].includes(w.type)
  );

  return (
    <div 
      className="fixed inset-0 z-[4000] flex items-start justify-center p-4 sm:p-10 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--surface-primary)] w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-[var(--sidebar-border)] mt-12 max-h-[82vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header container */}
        <div className="p-5 border-b border-[var(--sidebar-border)] flex items-center justify-between gap-4 bg-[var(--brand-secondary)]">
          <div className="flex-1 flex items-center gap-3 bg-[var(--surface-primary)] border border-[var(--sidebar-border)] rounded-2xl px-4 py-3 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Icons.Search size={20} className="text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Sök bland tallinjer, bråkdelar, pärlband, ekvationsvåg..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none text-[var(--text-main)] placeholder:text-slate-400 text-sm focus:outline-none focus:ring-0 font-medium"
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="p-1 hover:bg-[var(--sidebar-hover)] rounded-full text-slate-400 hover:text-[var(--text-main)] transition-colors"
              >
                <Icons.Close size={16} />
              </button>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-[var(--sidebar-hover)] rounded-full text-slate-400 transition-colors flex-shrink-0"
            title="Stäng sök modal"
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* Scrollable Results viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-[var(--text-main)] max-h-[60vh]">
          {query.trim().length > 0 ? (
            results.length > 0 ? (
              <div className="space-y-3">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2">
                  Hittat ({results.length} st)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.map((widget) => {
                    return (
                      <button
                        key={widget.type}
                        onClick={() => handleSelectWidget(widget.type)}
                        className="w-full text-left p-4 rounded-2xl border border-[var(--sidebar-border)] hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-500/[0.02] hover:to-indigo-500/[0.02] bg-[var(--brand-secondary)]/30 hover:shadow-md active:scale-[0.98] transition-all group flex flex-col justify-between"
                      >
                        <div>
                          {/* Card header */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-sm text-[var(--text-main)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {widget.title}
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {widget.category.map((cat) => {
                                const areaMeta = MATH_AREAS.find(x => x.id === cat);
                                return areaMeta ? (
                                  <span 
                                    key={cat} 
                                    className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 border border-slate-200/40"
                                    title={areaMeta.label}
                                  >
                                    {areaMeta.label.split(' ')[0]}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                          {/* Widget description */}
                          <p className="text-xs text-slate-400 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium mb-3">
                            {widget.description}
                          </p>
                        </div>

                        {/* Matching search tag context */}
                        <div className="mt-auto flex items-center justify-between text-[10px]">
                          <span className="text-slate-350 dark:text-slate-650 font-mono truncate max-w-[70%] group-hover:text-slate-450">
                            {widget.searchTerms.slice(0, 4).join(', ')}
                          </span>
                          <span className="font-black text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            LÄGG TILL <Icons.Plus size={12} />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Empty results state */
              <div className="text-center py-12 flex flex-col items-center justify-center space-y-3">
                <div className="text-4xl">🔍</div>
                <h4 className="font-bold text-sm text-[var(--text-main)]">Inga verktyg matchade din sökning</h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Provade du didaktiska begrepp som <span className="font-bold italic text-blue-500">tiokompisar</span>, <span className="font-bold italic text-blue-500">volym</span> or <span className="font-bold italic text-blue-500">bas-klossar</span>?
                </p>
              </div>
            )
          ) : (
            /* Recommendations Default View */
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-3">
                  Populära verktyg
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendations.map((widget) => {
                    return (
                      <button
                        key={widget.type}
                        onClick={() => handleSelectWidget(widget.type)}
                        className="w-full text-left p-4 rounded-2xl border border-[var(--sidebar-border)] hover:border-blue-500 bg-[var(--brand-secondary)]/30 hover:bg-slate-500/[0.015] hover:shadow-sm active:scale-[0.98] transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-sm text-[var(--text-main)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {widget.title}
                            </h3>
                            <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-405 rounded border border-blue-100/30">
                              Tips
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                            {widget.description}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-[10px]">
                          <span className="text-slate-350 dark:text-slate-600 font-mono">
                            {widget.searchTerms.slice(0, 3).join(', ')}
                          </span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Välj <Icons.ArrowRight size={12} />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Suggestion Pills */}
              <div className="border-t border-[var(--sidebar-border)] pt-4">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2">
                  Vanliga sökord
                </h5>
                <div className="flex flex-wrap gap-1.5 pl-0.5">
                  {[
                    'Tiokompisar', 'Volym', 'Omvandling', 'Balansvåg', 'Bråkdelar', 
                    'Geometri', 'Sannolikhet', 'Medelvärde', 'Diagram', 'Procent', 'Platsvärde'
                  ].map((word) => (
                    <button
                      key={word}
                      onClick={() => setQuery(word)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[var(--sidebar-hover)]/30 hover:bg-blue-500/10 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 border border-[var(--sidebar-border)] transition-all cursor-pointer"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
