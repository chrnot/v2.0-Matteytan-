import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../icons';

type ViewMode = 'BAR' | 'PIE' | 'SORTED';

const COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

const MAX_BLOCKS = 10;
const MAX_COLUMNS = 10;

export const BasicStatisticianWidget: React.FC = () => {
  const [data, setData] = useState<number[]>([3, 1, 4, 2, 5]);
  const [labels, setLabels] = useState<string[]>(['A', 'B', 'C', 'D', 'E']);
  const [viewMode, setViewMode] = useState<ViewMode>('BAR');
  const [showMean, setShowMean] = useState(false);
  const [showMedian, setShowMedian] = useState(false);
  const [showMode, setShowMode] = useState(false);
  const [isEveningOut, setIsEveningOut] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Mean calculation
  const mean = useMemo(() => {
    const total = data.reduce((acc, val) => acc + val, 0);
    return data.length > 0 ? total / data.length : 0;
  }, [data]);

  // Mode calculation (Most frequent value)
  const modeInfo = useMemo(() => {
    const counts: Record<number, number> = {};
    let maxFreq = 0;
    
    // Count frequencies of each height (ignoring 0)
    data.forEach(val => {
      if (val === 0) return;
      counts[val] = (counts[val] || 0) + 1;
      if (counts[val] > maxFreq) maxFreq = counts[val];
    });
    
    // Find all values that have the maximum frequency
    const modeValues = Object.entries(counts)
      .filter(([_, freq]) => freq === maxFreq && maxFreq > 1)
      .map(([val]) => Number(val));
    
    const hasMode = modeValues.length > 0;
    
    return { modeValues, maxFreq, hasMode };
  }, [data]);

  // Median calculation
  const medianInfo = useMemo(() => {
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    let medianValue: number;
    let indices: number[] = [];

    if (sorted.length % 2 === 0) {
      medianValue = (sorted[mid - 1] + sorted[mid]) / 2;
      indices = [mid - 1, mid];
    } else {
      medianValue = sorted[mid];
      indices = [mid];
    }

    return { medianValue, indices };
  }, [data]);

  const handleBlockClick = (colIdx: number, rowIdx: number) => {
    if (viewMode === 'SORTED' || isEveningOut) return;
    
    const newData = [...data];
    if (rowIdx < data[colIdx]) {
      newData[colIdx] = rowIdx;
    } else {
      newData[colIdx] = rowIdx + 1;
    }
    setData(newData);
  };

  const addColumn = () => {
    if (data.length >= MAX_COLUMNS) return;
    setData([...data, 0]);
    setLabels([...labels, String.fromCharCode(65 + labels.length)]);
  };

  const removeColumn = (idx: number) => {
    if (data.length <= 1) return;
    const newData = [...data];
    const newLabels = [...labels];
    newData.splice(idx, 1);
    newLabels.splice(idx, 1);
    setData(newData);
    setLabels(newLabels);
  };

  const updateLabel = (idx: number, newLabel: string) => {
    const newLabels = [...labels];
    newLabels[idx] = newLabel;
    setLabels(newLabels);
  };

  const evenOut = () => {
    setIsEveningOut(true);
    setShowMean(true);
    setTimeout(() => {
      setIsEveningOut(false);
    }, 2000);
  };

  const sortedData = useMemo(() => {
    return data.map((val, originalIdx) => ({ val, label: labels[originalIdx], originalIdx }))
               .sort((a, b) => a.val - b.val);
  }, [data, labels]);

  const totalSum = data.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-full bg-[var(--surface-primary)] text-[var(--text-main)] select-none font-sans overflow-hidden">
      {/* Header - View Selector */}
      <div className="flex items-center gap-2 p-4 border-b border-[var(--sidebar-border)] bg-[var(--sidebar-hover)]/10 shrink-0">
        <div className="flex gap-1">
          <button
            onClick={() => { setViewMode('BAR'); setIsEveningOut(false); }}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'BAR' && !isEveningOut ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-[var(--brand-secondary)] text-slate-400 hover:text-slate-600'}`}
          >
            <Icons.BarChart2 size={12} /> Stapel
          </button>
          <button
            onClick={() => { setViewMode('PIE'); setIsEveningOut(false); }}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'PIE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-[var(--brand-secondary)] text-slate-400 hover:text-slate-600'}`}
          >
            <Icons.PieChart size={12} /> Cirkel
          </button>
          <button
            onClick={() => { setViewMode('SORTED'); setIsEveningOut(false); }}
            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'SORTED' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-[var(--brand-secondary)] text-slate-400 hover:text-slate-600'}`}
          >
            <Icons.Grid size={12} /> Sorterad
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-2" />

        <button
          onClick={addColumn}
          disabled={data.length >= MAX_COLUMNS || viewMode === 'SORTED'}
          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-30`}
        >
          <Icons.Plus size={12} /> Lägg till
        </button>

        <button
          onClick={() => setShowInfo(true)}
          className="ml-auto w-10 h-10 rounded-xl bg-[var(--brand-secondary)] text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center shrink-0"
        >
          <Icons.Info size={18} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="flex-1 relative flex items-center justify-center p-4 overflow-x-auto overflow-y-hidden bar-scroll">
          {viewMode === 'PIE' ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-8">
              <svg viewBox="0 0 100 100" className="w-64 h-64 drop-shadow-2xl">
                {totalSum === 0 ? (
                  <circle cx="50" cy="50" r="45" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
                ) : (
                  (() => {
                    let startAngle = 0;
                    return data.map((val, i) => {
                      if (val === 0) return null;
                      const percentage = val / totalSum;
                      const endAngle = startAngle + percentage * 2 * Math.PI;
                      
                      const x1 = 50 + 45 * Math.sin(startAngle);
                      const y1 = 50 - 45 * Math.cos(startAngle);
                      const x2 = 50 + 45 * Math.sin(endAngle);
                      const y2 = 50 - 45 * Math.cos(endAngle);
                      
                      const largeArcFlag = percentage > 0.5 ? 1 : 0;
                      const pathData = `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                      
                      const currentStart = startAngle;
                      startAngle = endAngle;
                      
                      return (
                        <motion.path
                          key={i}
                          d={pathData}
                          fill={COLORS[i % COLORS.length]}
                          stroke="white"
                          strokeWidth="1"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        />
                      );
                    });
                  })()
                )}
              </svg>

              {/* Legend for Pie Chart */}
              <div className="flex flex-wrap justify-center gap-4 max-w-sm">
                {data.map((val, i) => val > 0 && (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{labels[i]}: {val}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-end justify-center gap-3 sm:gap-4 h-full w-full max-w-2xl relative pt-16 pb-12">
              {/* Grid Background */}
              <div className="absolute inset-0 flex flex-col justify-end pointer-events-none opacity-10 pb-12">
                {Array.from({ length: MAX_BLOCKS }).map((_, i) => (
                  <div key={i} className="h-7 w-full border-t border-slate-400" />
                ))}
              </div>

              {/* Mean Line */}
              <AnimatePresence>
                {showMean && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '100%', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="absolute left-0 z-20 border-t-4 border-dashed border-emerald-500 flex items-center"
                    style={{ bottom: `${mean * 28 + 82}px` }} 
                  >
                    <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full absolute -left-12">
                      MEDEL: {mean.toFixed(1)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bars */}
              {(viewMode === 'SORTED' ? sortedData : data.map((val, idx) => ({ val, label: labels[idx], originalIdx: idx }))).map((item, displayIdx) => {
                const isMedian = viewMode === 'SORTED' && showMedian && medianInfo.indices.includes(displayIdx);
                const isMode = showMode && modeInfo.modeValues.includes(item.val);
                
                return (
                  <div key={item.originalIdx} className="flex flex-col items-center gap-2 z-10 transition-all duration-500 relative group" style={{ width: `${Math.min(60, 600 / data.length)}px` }}>
                    <div className="flex flex-col-reverse gap-1 h-[280px] w-full items-center">
                      {Array.from({ length: MAX_BLOCKS }).map((_, blockIdx) => {
                        const isActive = isEveningOut ? blockIdx < Math.round(mean) : blockIdx < item.val;
                        
                        return (
                          <motion.div
                            key={blockIdx}
                            onClick={() => handleBlockClick(item.originalIdx, blockIdx)}
                            layout
                            initial={false}
                            animate={{
                              backgroundColor: isActive ? COLORS[item.originalIdx % COLORS.length] : 'transparent',
                              borderColor: isActive ? 'rgba(255,255,255,0.3)' : 'rgba(148, 163, 184, 0.2)',
                              opacity: isActive ? 1 : 1,
                              scale: isActive ? 1 : 0.95,
                            }}
                            whileHover={viewMode === 'BAR' && !isEveningOut ? { scale: 1.05, backgroundColor: isActive ? COLORS[item.originalIdx % COLORS.length] : 'rgba(148, 163, 184, 0.1)' } : {}}
                            className={`w-full h-[24px] rounded-md border-2 ${isActive ? 'border-solid' : 'border-dashed border-slate-300'} cursor-pointer transition-colors relative flex items-center justify-center`}
                          >
                            {/* Stjärna för Typvärde */}
                            {isMode && blockIdx === item.val - 1 && (
                              <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-white text-xl drop-shadow-md"
                              >
                                ⭐
                              </motion.span>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    {/* Label area */}
                    <div className={`mt-2 flex flex-col items-center gap-1 shrink-0 pb-1 w-full transition-all duration-500 ${isMedian ? 'scale-110 mb-4' : ''}`}>
                      <div className="relative w-full flex justify-center group/label">
                        <input
                          type="text"
                          value={viewMode === 'SORTED' ? item.label : labels[item.originalIdx]}
                          onChange={(e) => updateLabel(item.originalIdx, e.target.value)}
                          disabled={viewMode === 'SORTED'}
                          className={`w-full max-w-[50px] text-[9px] font-black uppercase tracking-widest text-center bg-slate-50 rounded-md py-1 border border-slate-200 focus:border-blue-500 outline-none transition-all ${viewMode === 'SORTED' ? 'text-slate-400 opacity-50' : 'text-slate-600 hover:bg-white'}`}
                          placeholder="..."
                        />
                        {viewMode !== 'SORTED' && (
                          <div className="absolute -right-1 top-1 text-slate-300 pointer-events-none">
                            <Icons.Pencil size={8} />
                          </div>
                        )}
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow-md transition-all ${isMedian ? 'bg-amber-500 ring-4 ring-amber-200' : 'bg-slate-800'}`}>
                        {item.val}
                      </div>

                      {viewMode !== 'SORTED' && (
                        <button 
                          onClick={() => removeColumn(item.originalIdx)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm mt-1"
                          title="Ta bort stapel"
                        >
                          <Icons.X size={12} />
                        </button>
                      )}

                      {isMedian && (
                        <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest text-center">Median</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side Panel for Stats */}
        <div className="w-64 border-l border-[var(--sidebar-border)] bg-[var(--brand-secondary)]/5 overflow-y-auto p-4 flex flex-col gap-4 shrink-0">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lägesmått</h2>
          
          <button
            onClick={() => setShowMode(!showMode)}
            className={`w-full flex flex-col items-center p-4 rounded-2xl border-2 transition-all text-left ${showMode ? 'bg-white border-blue-500 shadow-md ring-4 ring-blue-500/10' : 'bg-transparent border-slate-200 text-slate-400 hover:bg-white/50'}`}
          >
            <span className="w-full text-[9px] font-black uppercase tracking-widest mb-1">Typvärde</span>
            <span className={`w-full text-base font-black ${showMode ? 'text-blue-600' : ''}`}>
              {modeInfo.hasMode ? modeInfo.modeValues.join(', ') : '?'}
            </span>
            <div className="w-full mt-2 text-[9px] font-medium text-slate-400 italic leading-tight">
              {modeInfo.hasMode 
                ? `Värdet ${modeInfo.modeValues.join(' & ')} förekommer flest gånger (${modeInfo.maxFreq} st).`
                : 'Inget värde förekommer mer än en gång.'}
            </div>
          </button>

          <button
            onClick={() => {
              if (viewMode !== 'SORTED') setViewMode('SORTED');
              setShowMedian(!showMedian);
            }}
            className={`w-full flex flex-col items-center p-4 rounded-2xl border-2 transition-all text-left ${showMedian ? 'bg-white border-amber-500 shadow-md ring-4 ring-amber-500/10' : 'bg-transparent border-slate-200 text-slate-400 hover:bg-white/50'}`}
          >
            <span className="w-full text-[9px] font-black uppercase tracking-widest mb-1">Median</span>
            <span className={`w-full text-base font-black ${showMedian ? 'text-amber-600' : ''}`}>
              {medianInfo.medianValue}
            </span>
            <div className="w-full mt-2 text-[9px] font-medium text-slate-400 italic leading-tight">
              {(() => {
                const sorted = [...data].sort((a, b) => a - b).join(', ');
                return `Sorterat: ${sorted}. Mittenvärdet.`;
              })()}
            </div>
          </button>

          <button
            onClick={() => {
              if (isEveningOut) {
                setIsEveningOut(false);
                setShowMean(false);
              } else {
                evenOut();
              }
            }}
            className={`w-full flex flex-col items-center p-4 rounded-2xl border-2 transition-all text-left ${showMean ? 'bg-white border-emerald-500 shadow-md ring-4 ring-emerald-500/10' : 'bg-transparent border-slate-200 text-slate-400 hover:bg-white/50'}`}
          >
            <span className="w-full text-[9px] font-black uppercase tracking-widest mb-1">Medelvärde</span>
            <span className={`w-full text-base font-black ${showMean ? 'text-emerald-600' : ''}`}>
              {mean.toFixed(1)}
            </span>
            <div className="w-full mt-2 text-[9px] font-medium text-slate-400 italic leading-tight">
              Summa: {data.reduce((a, b) => a + b, 0)} <br />
              Antal: {data.length} <br />
              {data.reduce((a, b) => a + b, 0)} / {data.length} = {mean.toFixed(1)}
            </div>
          </button>
        </div>
      </div>

      {/* Footer - Small Controls */}
      <div className="p-4 border-t border-[var(--sidebar-border)] bg-[var(--brand-secondary)]/10 shrink-0">
        <div className="max-w-xl mx-auto flex justify-center">
          <button
            onClick={() => { setData([0,0,0,0,0]); setLabels(['A','B','C','D','E']); setShowMean(false); setShowMedian(false); setShowMode(false); setIsEveningOut(false); }}
            className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center gap-2"
          >
            <Icons.Trash size={14} /> Återställ
          </button>
        </div>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowInfo(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />
              <button 
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-all"
              >
                <Icons.X size={20} />
              </button>

              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Icons.Info className="text-blue-500" />
                Så funkar Bas-statistikern
              </h3>

              <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
                <section>
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-blue-500 mb-2">1. Bygg diagram</h4>
                  <p>Klicka i de streckade rutorna för att lägga till klossar. Klicka på en befintlig kloss för att ta bort den. Du kan också namnge varje stapel genom att klicka på bokstaven under klossen.</p>
                </section>

                <section>
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-amber-500 mb-2">2. Se lägesmått</h4>
                  <p>Aktivera <strong>Typvärde</strong> för att hitta det vanligaste värdet (markerad med ⭐). Aktivera <strong>Median</strong> för att automatiskt sortera staplarna och hitta den i mitten.</p>
                </section>

                <section>
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-emerald-500 mb-2">3. Jämna ut (Medelvärde)</h4>
                  <p>Klicka på <strong>Medelvärde</strong> för att se klossarna fördelas jämnt över alla staplar. Linjen visar den genomsnittliga höjden.</p>
                </section>
              </div>

              <button 
                onClick={() => setShowInfo(false)}
                className="w-full mt-8 py-3 rounded-2xl bg-slate-800 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all"
              >
                Jag fattar!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
