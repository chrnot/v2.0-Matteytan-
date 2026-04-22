import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  onToggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onOpenChange, 
  onAddWidget, 
  widgetMetadata, 
  onPiClick, 
  isDarkMode,
  onToggleDarkMode
}) => {
  const [activeArea, setActiveArea] = useState<MathArea | null>(null);

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

        {/* Categories */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-2 space-y-1">
          {MATH_AREAS.map((area) => (
            <button
              key={area.id}
              onClick={() => setActiveArea(activeArea === area.id ? null : area.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                activeArea === area.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : `hover:bg-[var(--sidebar-hover)] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`
              }`}
              title={area.label}
            >
              <div className={`p-2 rounded-lg ${
                activeArea === area.id 
                  ? 'bg-white/20' 
                  : isDarkMode ? 'bg-slate-800 group-hover:bg-slate-700' : 'bg-slate-100 group-hover:bg-white'
              } transition-colors`}>
                <area.icon size={20} />
              </div>
              {isOpen && (
                <div className="flex-1 text-left">
                  <div className="text-xs font-black uppercase tracking-widest leading-none mb-0.5">{area.label}</div>
                  <div className={`text-[9px] line-clamp-1 ${activeArea === area.id ? 'text-blue-100' : 'text-slate-400'}`}>
                    {area.description}
                  </div>
                </div>
              )}
              {isOpen && <Icons.ChevronRight size={14} className={`transition-transform ${activeArea === area.id ? 'rotate-90' : ''}`} />}
            </button>
          ))}
        </div>

        {/* Footer Settings / Mattelab / Dark Mode toggle */}
        <div className="p-4 border-t border-[var(--sidebar-border)] bg-[var(--sidebar-hover)]/30 mt-auto flex flex-col gap-4">
          <a
            href="/mattelab"
            className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
              isDarkMode 
                ? 'hover:bg-slate-800 text-slate-300' 
                : 'hover:bg-white text-slate-700 bg-white/50 border border-slate-200'
            }`}
            title="Gå till Mattelab"
          >
            <div className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-indigo-900/30 text-indigo-400 group-hover:bg-indigo-900/50' : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'
            }`}>
              <Icons.Lab size={20} />
            </div>
            {isOpen && (
              <div className="flex-1 text-left">
                <div className="text-xs font-black uppercase tracking-widest leading-none mb-0.5">Mattelab</div>
                <div className="text-[9px] text-slate-400 line-clamp-1">Laborativ miljö</div>
              </div>
            )}
            {isOpen && <Icons.ArrowRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />}
          </a>

          <a
            href="https://gemini.google.com/gem/1IJSJChUR2EHRw5PTn_-pvF_hJdPs2PRS?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
              isDarkMode 
                ? 'hover:bg-slate-800 text-slate-300' 
                : 'hover:bg-white text-slate-700 bg-white/50 border border-slate-200'
            }`}
            title="Gå till Concept Cartoons"
          >
            <div className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-amber-900/30 text-amber-400 group-hover:bg-amber-900/50' : 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'
            }`}>
              <Icons.Feedback size={20} />
            </div>
            {isOpen && (
              <div className="flex-1 text-left">
                <div className="text-xs font-black uppercase tracking-widest leading-none mb-0.5">Concept Cartoons</div>
                <div className="text-[9px] text-slate-400 line-clamp-1">Diskutera matematik</div>
              </div>
            )}
            {isOpen && <Icons.Maximize size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0" />}
          </a>

          <div className={`flex items-center gap-3 ${isOpen ? 'justify-between pb-2' : 'justify-center pb-2'}`}>
            {isOpen && (
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Ljust / Mörkt
              </span>
            )}
            <button 
              onClick={onToggleDarkMode}
              className={`p-2 rounded-xl transition-all shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' 
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
              title={isDarkMode ? 'Växla till ljust läge' : 'Växla till mörkt läge'}
            >
              {isDarkMode ? <Icons.Moon size={20} /> : <Icons.Sun size={20} />}
            </button>
          </div>
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
    </div>
  );
};
