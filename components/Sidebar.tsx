import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MathArea, WidgetType, Difficulty, MathSubArea } from '../types';
import { MATH_AREAS } from './MathAreaConfig';
import { Icons } from './icons';
import { Logo } from './Logo';

interface SidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (type: WidgetType) => void;
  widgetMetadata: Record<WidgetType, { 
    category: MathArea[]; 
    subCategory?: MathSubArea;
    difficulty: Difficulty; 
    title: string;
    klagSupport?: boolean;
  }>;
  onPiClick?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode?: () => void;
  onOpenSearch: () => void;
  isToolsOpen?: boolean;
  onToggleTools?: () => void;
  onCloseTools?: () => void;
  onToolClick?: (tool: any) => void;
  extraTools?: { type: string; icon: any; label: string }[];
  backgrounds?: { type: any; label: string; className?: string }[];
  currentBackground?: any;
  onSetBackground?: (bg: any) => void;
  isDrawingMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onOpenChange, 
  onAddWidget, 
  widgetMetadata, 
  onPiClick, 
  isDarkMode,
  onToggleDarkMode,
  onOpenSearch,
  isToolsOpen = false,
  onToggleTools,
  onCloseTools,
  onToolClick,
  extraTools = [],
  backgrounds = [],
  currentBackground,
  onSetBackground,
  isDrawingMode = false
}) => {
  const [activeArea, setActiveArea] = useState<MathArea | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{ title: string; description: string; top: number } | null>(null);

  const getWidgetsInArea = (area: MathArea) => {
    const list = Object.entries(widgetMetadata)
      .filter(([_, meta]) => meta.category.includes(area))
      .sort((a, b) => {
        const diffSort: Record<Difficulty, number> = {
          [Difficulty.LABORATIVE]: 1,
          [Difficulty.CONCRETIZING]: 2,
          [Difficulty.ABSTRACTING]: 3,
          [Difficulty.FORMAL]: 4,
        };
        return diffSort[a[1].difficulty] - diffSort[b[1].difficulty];
      });

    // Group by subCategory
    const grouped: Record<string, typeof list> = {};
    list.forEach(item => {
      const sub = item[1].subCategory || 'Övrigt';
      if (!grouped[sub]) grouped[sub] = [];
      grouped[sub].push(item);
    });

    return grouped;
  };

  return (
    <div className="fixed left-0 top-0 h-full z-[3000] flex">
      {/* Sidebar Main */}
      <motion.div 
        initial={false}
        animate={{ width: isOpen ? 280 : 80 }}
        className="bg-[var(--sidebar-bg)] backdrop-blur-xl border-r border-[var(--sidebar-border)] h-full flex flex-col shadow-2xl overflow-hidden transition-colors duration-300"
      >
        {/* Toggle / Header */}
        <div className="p-4 flex items-center justify-between border-b border-[var(--sidebar-border)] bg-[var(--sidebar-hover)]/30">
          <div className="flex-1 overflow-hidden transition-all duration-300" style={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}>
             <Logo darkMode={isDarkMode} onPiClick={onPiClick} isSidebar />
          </div>
          <button 
            onClick={() => onOpenChange(!isOpen)}
            className="p-2 hover:bg-[var(--sidebar-hover)] rounded-xl text-slate-500 transition-colors ml-2"
          >
            <Icons.Menu size={24} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
          </button>
        </div>

        {/* Sökverktyget: ovanför "Taluppfattning och tals användning" men under logotypen */}
        <div className={`p-2 border-b border-[var(--sidebar-border)]/60 ${isOpen ? '' : 'flex justify-center'}`}>
          <button
            onClick={() => {
              onOpenSearch();
              setHoveredItem(null);
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem({
                title: 'Sök verktyg',
                description: 'Sök bland alla matematiska verktyg och modeller (Ctrl+K / ⌘K).',
                top: rect.top,
              });
            }}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-center rounded-xl transition-all group border ${
              isOpen ? 'w-full gap-3 p-2.5' : 'justify-center p-2.5'
            } ${
              isDarkMode
                ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 hover:text-blue-600 shadow-2xs hover:shadow-xs'
            }`}
            title="Sök verktyg (Ctrl+K / ⌘K)"
          >
            <div className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode ? 'bg-slate-700 text-blue-400 group-hover:bg-slate-600' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
            }`}>
              <Icons.Search size={18} />
            </div>
            {isOpen && (
              <div className="flex-1 flex items-center justify-between text-left overflow-hidden">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 truncate">Sök verktyg</span>
                <kbd className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ml-1 shrink-0 ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>⌘K</kbd>
              </div>
            )}
          </button>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-2 space-y-1">
          {MATH_AREAS.map((area) => (
            <button
              key={area.id}
              onClick={() => {
                setActiveArea(activeArea === area.id ? null : area.id);
                setHoveredItem(null);
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredItem({
                  title: area.label,
                  description: area.description,
                  top: rect.top,
                });
              }}
              onMouseLeave={() => setHoveredItem(null)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                activeArea === area.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : `hover:bg-[var(--sidebar-hover)] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`
              }`}
              title={area.description}
              aria-label={area.label}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                activeArea === area.id 
                  ? 'bg-white/20' 
                  : isDarkMode ? 'bg-slate-800 group-hover:bg-slate-700' : 'bg-slate-100 group-hover:bg-white'
              } transition-colors`}>
                <area.icon size={20} />
              </div>
              {isOpen && (
                <div className="flex-1 text-left min-w-0">
                  <div className="text-xs font-black uppercase tracking-widest leading-snug">{area.label}</div>
                </div>
              )}
              {isOpen && <Icons.ChevronRight size={14} className={`transition-transform shrink-0 ${activeArea === area.id ? 'rotate-90' : ''}`} />}
            </button>
          ))}
        </div>

        {/* Footer Settings / Mattelab */}
        <div className="p-3 sm:p-4 border-t border-[var(--sidebar-border)] bg-[var(--sidebar-hover)]/30 mt-auto flex flex-col gap-2.5 overflow-y-auto max-h-[55vh] no-scrollbar">
          <a
            href="https://matteytan.se/mattelab"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem({
                title: 'Mattelab',
                description: 'Laborativ miljö för interaktiv matematik.',
                top: rect.top,
              });
            }}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
              isDarkMode 
                ? 'hover:bg-slate-800 text-slate-300' 
                : 'hover:bg-white text-slate-700 bg-white/50 border border-slate-200'
            }`}
            title="Laborativ miljö"
            aria-label="Mattelab"
          >
            <div className={`p-2 rounded-lg shrink-0 transition-colors ${
              isDarkMode ? 'bg-indigo-900/30 text-indigo-400 group-hover:bg-indigo-900/50' : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'
            }`}>
              <Icons.Lab size={20} />
            </div>
            {isOpen && (
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs font-black uppercase tracking-widest leading-snug">Mattelab</div>
              </div>
            )}
            {isOpen && <Icons.ArrowRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0" />}
          </a>

          <a
            href="https://gemini.google.com/gem/1IJSJChUR2EHRw5PTn_-pvF_hJdPs2PRS?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem({
                title: 'Concept Cartoons',
                description: 'Diskutera och fördjupa matematiska begrepp.',
                top: rect.top,
              });
            }}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
              isDarkMode 
                ? 'hover:bg-slate-800 text-slate-300' 
                : 'hover:bg-white text-slate-700 bg-white/50 border border-slate-200'
            }`}
            title="Diskutera matematik"
            aria-label="Concept Cartoons"
          >
            <div className={`p-2 rounded-lg shrink-0 transition-colors ${
              isDarkMode ? 'bg-amber-900/30 text-amber-400 group-hover:bg-amber-900/50' : 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'
            }`}>
              <Icons.Feedback size={20} />
            </div>
            {isOpen && (
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs font-black uppercase tracking-widest leading-snug">Concept Cartoons</div>
              </div>
            )}
            {isOpen && <Icons.Maximize size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0 shrink-0" />}
          </a>

          {/* Verktyg Button */}
          <button
            onClick={() => {
              onToggleTools?.();
              if (activeArea) setActiveArea(null);
              setHoveredItem(null);
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem({
                title: 'Verktyg',
                description: 'Rita, ändra bakgrund och extra funktioner.',
                top: rect.top,
              });
            }}
            onMouseLeave={() => setHoveredItem(null)}
            className={`flex items-center rounded-xl transition-all group ${
              isOpen ? 'w-full gap-3 p-3' : 'justify-center p-3'
            } ${
              isToolsOpen
                ? 'bg-blue-600 text-white shadow-lg'
                : isDarkMode 
                  ? 'hover:bg-slate-800 text-slate-300 bg-slate-800/40 border border-slate-700/50' 
                  : 'hover:bg-white text-slate-700 bg-white/70 border border-slate-200'
            }`}
            title="Rita, bakgrund m.m."
            aria-label="Verktyg"
          >
            <div className={`p-2 rounded-lg shrink-0 transition-colors ${
              isToolsOpen
                ? 'bg-white/20 text-white'
                : isDarkMode ? 'bg-blue-950/50 text-blue-400 group-hover:bg-blue-900/60' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
            }`}>
              <Icons.Tools size={20} />
            </div>
            {isOpen && (
              <div className="flex-1 text-left min-w-0">
                <div className="text-xs font-black uppercase tracking-widest leading-snug">Verktyg</div>
              </div>
            )}
            {isOpen && (
              <Icons.ChevronRight size={14} className={`transition-transform duration-200 shrink-0 ${isToolsOpen ? 'rotate-90' : ''}`} />
            )}
          </button>
        </div>
      </motion.div>

      {/* Floating Submenu - Widgets in Area */}
      <AnimatePresence>
        {activeArea && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="ml-2 mt-4 w-72 bg-[var(--sidebar-bg)] backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-[var(--sidebar-border)] h-fit max-h-[85vh] overflow-hidden flex flex-col transition-colors duration-300"
          >
            <div className="p-4 border-b border-[var(--sidebar-border)] flex items-center justify-between bg-[var(--sidebar-hover)]/30">
              <div className="flex items-center gap-2">
                <div className="text-blue-600">
                  {(() => {
                    const area = MATH_AREAS.find(a => a.id === activeArea);
                    return area ? <area.icon size={18} /> : null;
                  })()}
                </div>
                <h3 className={`font-black uppercase tracking-widest text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {MATH_AREAS.find(a => a.id === activeArea)?.label}
                </h3>
              </div>
              <button 
                onClick={() => setActiveArea(null)} 
                className={`p-1 hover:bg-[var(--sidebar-hover)] rounded ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
              >
                <Icons.X size={14} />
              </button>
            </div>

            <div className="p-2 overflow-y-auto no-scrollbar space-y-4">
              {Object.entries(getWidgetsInArea(activeArea)).map(([sub, items]) => (
                <div key={sub} className="space-y-1">
                  {sub !== 'Övrigt' && (
                    <div className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border-l-2 border-blue-500 ml-1 mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {sub}
                    </div>
                  )}
                  {items.map(([type, meta]) => (
                    <button
                      key={type}
                      onClick={() => {
                        onAddWidget(type as WidgetType);
                        onOpenChange(false);
                        setActiveArea(null);
                      }}
                      className={`w-full p-3 flex items-center justify-between rounded-xl transition-all border border-transparent group ${
                        isDarkMode 
                          ? 'hover:bg-slate-800 text-slate-300 hover:text-white hover:border-slate-700' 
                          : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700 hover:border-blue-100'
                      }`}
                    >
                      <div className="text-left">
                        <div className="text-sm font-bold leading-none mb-1">{meta.title}</div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded ${
                            meta.difficulty === Difficulty.LABORATIVE ? (isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700') :
                            meta.difficulty === Difficulty.CONCRETIZING ? (isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700') :
                            meta.difficulty === Difficulty.ABSTRACTING ? (isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700') :
                            (isDarkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-100 text-rose-700')
                          }`}>
                            {meta.difficulty === Difficulty.LABORATIVE ? 'Laborativ' :
                             meta.difficulty === Difficulty.CONCRETIZING ? 'Konkretiserande' :
                             meta.difficulty === Difficulty.ABSTRACTING ? 'Abstraherande' :
                             'Formell'}
                          </span>
                          {meta.klagSupport && (
                            <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>KLAG</span>
                          )}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Icons.Plus size={16} className="text-blue-500" />
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Tools & Background Menu */}
      <AnimatePresence>
        {isToolsOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="ml-2 mb-4 self-end w-64 bg-[var(--sidebar-bg)] backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[var(--sidebar-border)] overflow-hidden flex flex-col transition-colors duration-300 z-[3200]"
          >
            <div className="p-3 border-b border-[var(--sidebar-border)] flex items-center justify-between bg-[var(--sidebar-hover)]/30">
              <div className="flex items-center gap-2">
                <div className="text-blue-600">
                  <Icons.Tools size={18} />
                </div>
                <h3 className={`font-black uppercase tracking-widest text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  Verktyg & Bakgrund
                </h3>
              </div>
              <button 
                onClick={onCloseTools}
                className="p-1 hover:bg-[var(--sidebar-hover)] rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Icons.Close size={16} />
              </button>
            </div>

            <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Funktioner</div>
              {extraTools.map((tool) => (
                <button
                  key={tool.label}
                  onClick={() => {
                    onToolClick?.(tool);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                    tool.type === 'DRAWING' && isDrawingMode 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : isDarkMode 
                        ? 'hover:bg-slate-800 text-slate-300 hover:text-white' 
                        : 'hover:bg-slate-100 text-slate-700 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tool.icon size={18} />
                    <span>{tool.label}</span>
                  </div>
                  {tool.type === 'DRAWING' && isDrawingMode && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              ))}

              {backgrounds.length > 0 && (
                <>
                  <div className="px-2 pt-3 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-[var(--sidebar-border)] mt-2">
                    Bakgrund
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 p-1">
                    {backgrounds.map(bg => (
                      <button 
                        key={bg.type}
                        onClick={() => onSetBackground?.(bg.type)}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                          currentBackground === bg.type 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                            : isDarkMode
                              ? 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Hover Tooltip for buttons */}
      <AnimatePresence>
        {hoveredItem && !activeArea && !isToolsOpen && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{ 
              top: Math.max(12, Math.min(typeof window !== 'undefined' ? window.innerHeight - 80 : 500, hoveredItem.top)), 
              left: isOpen ? 288 : 88 
            }}
            className="fixed z-[3500] pointer-events-none max-w-xs w-64 p-3 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white shadow-2xl border border-slate-700/80 backdrop-blur-md"
          >
            <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">
              {hoveredItem.title}
            </div>
            <div className="text-xs text-slate-200 leading-snug font-medium">
              {hoveredItem.description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
