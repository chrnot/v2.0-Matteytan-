import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { Icons } from '../icons';

type HeaderMode = 'TEXT' | 'FRACTION' | 'DECIMAL';

interface ColumnDef {
  id: string;
  power: number;
  label: string;
  fraction: string;
  decimal: string;
  color: string;
  bgColor: string;
  icon: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'th', power: 3, label: 'Tusental', fraction: '1000/1', decimal: '1000', color: 'var(--math-col-purple)', bgColor: 'var(--math-col-purple-light)', icon: '📦' },
  { id: 'h', power: 2, label: 'Hundratal', fraction: '100/1', decimal: '100', color: 'var(--math-col-green)', bgColor: 'var(--math-col-green-light)', icon: '🟦' },
  { id: 't', power: 1, label: 'Tiotal', fraction: '10/1', decimal: '10', color: 'var(--math-col-blue)', bgColor: 'var(--math-col-blue-light)', icon: '📏' },
  { id: 'e', power: 0, label: 'Ental', fraction: '1/1', decimal: '1', color: 'var(--math-col-orange)', bgColor: 'var(--math-col-orange-light)', icon: '🧊' },
  { id: 'dec', power: -1, label: 'Tiondelar', fraction: '1/10', decimal: '0,1', color: 'var(--math-col-red)', bgColor: 'var(--math-col-red-light)', icon: '🍰' },
  { id: 'hun', power: -2, label: 'Hundradelar', fraction: '1/100', decimal: '0,01', color: 'var(--math-col-pink)', bgColor: 'var(--math-col-pink-light)', icon: '🍪' },
  { id: 'mil', power: -3, label: 'Tusendelar', fraction: '1/1000', decimal: '0,001', color: 'var(--math-col-rose)', bgColor: 'var(--math-col-rose-light)', icon: '✨' },
];

export const PositionsMachineWidget: React.FC = () => {
  const [counts, setCounts] = useState<Record<string, number>>({
    th: 0, h: 0, t: 0, e: 0, dec: 0, hun: 0, mil: 0
  });
  const [headerMode, setHeaderMode] = useState<HeaderMode>('TEXT');
  const [challenge, setChallenge] = useState<{ target: number; text: string } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const totalValue = useMemo(() => {
    return Object.entries(counts).reduce((acc, [id, count]) => {
      const col = COLUMNS.find(c => c.id === id);
      if (!col) return acc;
      return acc + count * Math.pow(10, col.power);
    }, 0);
  }, [counts]);

  const playSound = (type: 'plop' | 'merge' | 'explode') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      if (type === 'plop') {
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
      } else if (type === 'merge') {
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
      }

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  };

  const [errorHint, setErrorHint] = useState<{ colId: string; text: string } | null>(null);

  const addBlock = (id: string) => {
    // Error hint logic
    if (challenge) {
      const col = COLUMNS.find(c => c.id === id);
      if (col) {
        const currentValInCol = counts[id] * Math.pow(10, col.power);
        const targetValInCol = challenge.target; // Simple check: is this column even relevant?
        
        // If they add to a column that makes the total exceed target significantly or is just wrong
        if (totalValue + Math.pow(10, col.power) > challenge.target + 0.001) {
          setErrorHint({ 
            colId: id, 
            text: `Nu skapade du ett för stort värde. Du behöver använda en mindre del.` 
          });
          setTimeout(() => setErrorHint(null), 3000);
        }
      }
    }

    setCounts(prev => {
      const newCount = prev[id] + 1;
      if (newCount >= 10) {
        // Merge logic
        const colIdx = COLUMNS.findIndex(c => c.id === id);
        if (colIdx > 0) {
          const nextId = COLUMNS[colIdx - 1].id;
          playSound('merge');
          return { ...prev, [id]: newCount - 10, [nextId]: prev[nextId] + 1 };
        }
      }
      playSound('plop');
      return { ...prev, [id]: newCount };
    });
  };

  const explodeBlock = (id: string) => {
    if (counts[id] <= 0) return;
    const colIdx = COLUMNS.findIndex(c => c.id === id);
    if (colIdx < COLUMNS.length - 1) {
      const nextId = COLUMNS[colIdx + 1].id;
      playSound('explode');
      setCounts(prev => ({
        ...prev,
        [id]: prev[id] - 1,
        [nextId]: prev[nextId] + 10
      }));
    }
  };

  const removeBlock = (id: string) => {
    if (counts[id] <= 0) return;
    setCounts(prev => ({ ...prev, [id]: prev[id] - 1 }));
    playSound('plop');
  };

  const clearAll = () => {
    setCounts({ th: 0, h: 0, t: 0, e: 0, dec: 0, hun: 0, mil: 0 });
    setCustomInput('');
    playSound('explode');
  };

  const applyCustomNumber = (val: string) => {
    const sanitized = val.replace(',', '.');
    const [integerPart, decimalPart] = sanitized.split('.');
    
    const newCounts: Record<string, number> = {
      th: 0, h: 0, t: 0, e: 0, dec: 0, hun: 0, mil: 0
    };

    if (integerPart) {
      const digits = integerPart.split('').reverse();
      if (digits[0]) newCounts.e = parseInt(digits[0]) || 0;
      if (digits[1]) newCounts.t = parseInt(digits[1]) || 0;
      if (digits[2]) newCounts.h = parseInt(digits[2]) || 0;
      if (digits[3]) newCounts.th = parseInt(digits[3]) || 0;
    }

    if (decimalPart) {
      const digits = decimalPart.split('');
      if (digits[0]) newCounts.dec = parseInt(digits[0]) || 0;
      if (digits[1]) newCounts.hun = parseInt(digits[1]) || 0;
      if (digits[2]) newCounts.mil = parseInt(digits[2]) || 0;
    }

    setCounts(newCounts);
    playSound('merge');
  };

  const generateChallenge = () => {
    const val = (Math.random() * 100).toFixed(2);
    setChallenge({ target: parseFloat(val), text: `Skapa talet ${val.replace('.', ',')}` });
    setFeedback(null);
  };

  useEffect(() => {
    if (challenge && Math.abs(totalValue - challenge.target) < 0.001) {
      setFeedback('Snyggt jobbat! Du skapade rätt tal.');
      setTimeout(() => {
        setChallenge(null);
        setFeedback(null);
      }, 3000);
    }
  }, [totalValue, challenge]);

  return (
    <div className="flex flex-col h-full bg-[var(--surface-primary)] text-[var(--text-main)] select-none overflow-hidden transition-colors duration-300">
      {/* Header Controls */}
      <div className="p-4 border-b border-[var(--sidebar-border)] flex items-center justify-between bg-[var(--brand-secondary)]/50">
        <div className="flex items-center gap-4">
          <div className="flex bg-[var(--surface-primary)] p-1 rounded-xl shadow-sm border border-[var(--sidebar-border)]">
            {(['TEXT', 'FRACTION', 'DECIMAL'] as HeaderMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setHeaderMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  headerMode === mode ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-[var(--sidebar-hover)]'
                }`}
              >
                {mode === 'TEXT' ? 'Namn' : mode === 'FRACTION' ? 'Bråk' : 'Decimal'}
              </button>
            ))}
          </div>
          
          <button
            onClick={generateChallenge}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-primary)] border border-[var(--sidebar-border)] rounded-xl shadow-sm hover:bg-[var(--sidebar-hover)] transition-all active:scale-95"
          >
            <Icons.Trophy size={16} className="text-amber-500" />
            <span className="text-xs font-bold text-[var(--text-main)] opacity-70">Ny utmaning</span>
          </button>

          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-primary)] border border-[var(--sidebar-border)] rounded-xl shadow-sm hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all active:scale-95 text-slate-400"
          >
            <Icons.Trash size={16} />
            <span className="text-xs font-bold">Rensa allt</span>
          </button>

          <div className="flex items-center gap-2 bg-[var(--surface-primary)] border border-[var(--sidebar-border)] rounded-xl px-3 py-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <Icons.Pencil size={14} className="text-slate-400" />
            <input
              type="text"
              value={customInput}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9,.]/g, '');
                setCustomInput(val);
                if (val) applyCustomNumber(val);
              }}
              placeholder="Skriv tal..."
              className="w-24 bg-transparent border-none outline-none text-xs font-bold text-[var(--text-main)] placeholder:text-slate-300"
            />
          </div>

          <button
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className={`p-2 rounded-xl transition-all active:scale-95 flex items-center gap-2 ${
              isInfoOpen 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-[var(--surface-primary)] border border-[var(--sidebar-border)] text-slate-400 hover:text-[var(--text-main)] hover:border-blue-500 shadow-sm'
            }`}
          >
            <Icons.Info size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest pr-1">Hjälp</span>
          </button>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Totalt Värde</div>
          <div className="text-2xl font-black text-[var(--text-main)] tabular-nums">
            {totalValue.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
          </div>
        </div>
      </div>

      {/* Challenge Banner */}
      <AnimatePresence>
        {challenge && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-50 border-b border-amber-100 overflow-hidden"
          >
            <div className="p-3 flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
                  <Icons.Lightbulb size={18} className="text-amber-700" />
                </div>
                <span className="font-black text-amber-900 uppercase tracking-tight">{challenge.text}</span>
              </div>
              {feedback && (
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100"
                >
                  {feedback}
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Machine Area */}
      <div className="flex-1 flex relative p-4 gap-1">
        {/* Info Overlay */}
        <AnimatePresence>
          {isInfoOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center"
              onClick={() => setIsInfoOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-full"
              >
                {/* Header */}
                <div className="p-8 pb-0 flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Instruktioner</div>
                    <h3 className="text-4xl font-light text-slate-900 tracking-tight">Positions-maskinen</h3>
                  </div>
                  <button 
                    onClick={() => setIsInfoOpen(false)}
                    className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                  >
                    <Icons.Close size={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-8 pt-6 overflow-y-auto custom-scrollbar">
                  <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8">
                    Utforska talsystemet genom att bygga, växla och dela upp värden. 
                    Här är de viktigaste kommandona för att bemästra maskinen.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                    {[
                      { 
                        icon: <Icons.Plus size={20} />, 
                        title: 'Bygg', 
                        desc: 'Klicka på plus-knappen eller direkt i en kolumn för att lägga till en kloss.',
                        shortcut: 'Vänsterklick'
                      },
                      { 
                        icon: <Icons.Zap size={20} />, 
                        title: 'Växla Upp', 
                        desc: 'När du har 10 klossar i en kolumn växlas de automatiskt till 1 kloss till vänster.',
                        shortcut: 'Auto'
                      },
                      { 
                        icon: <Icons.Sparkles size={20} />, 
                        title: 'Spräng / Dela', 
                        desc: 'Dela en kloss i 10 mindre delar genom att skicka dem till kolumnen till höger.',
                        shortcut: 'Dubbelklick'
                      },
                      { 
                        icon: <Icons.Trash size={20} />, 
                        title: 'Ta bort', 
                        desc: 'Behöver du rensa en enstaka kloss? Använd högerklick för att plocka bort den.',
                        shortcut: 'Högerklick'
                      },
                      { 
                        icon: <Icons.Pencil size={20} />, 
                        title: 'Skriv Tal', 
                        desc: 'Skriv in ett specifikt tal i rutan för att se hur det fördelas i maskinen.',
                        shortcut: 'Input'
                      },
                      { 
                        icon: <Icons.Trophy size={20} />, 
                        title: 'Utmaningar', 
                        desc: 'Testa dina kunskaper genom att försöka bygga talet som maskinen ber om.',
                        shortcut: 'Pokal'
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                          {item.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{item.title}</h4>
                            <span className="text-[9px] font-mono bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase">{item.shortcut}</span>
                          </div>
                          <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
                  <button
                    onClick={() => setIsInfoOpen(false)}
                    className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-0.5 transition-all active:translate-y-0"
                  >
                    Börja utforska
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {COLUMNS.map((col, idx) => (
          <React.Fragment key={col.id}>
            <motion.div 
              animate={errorHint?.colId === col.id ? { x: [-2, 2, -2, 2, 0] } : {}}
              className="flex-1 flex flex-col rounded-2xl border-2 border-dashed border-[var(--sidebar-border)] relative group transition-colors overflow-hidden"
              style={{ backgroundColor: col.bgColor }}
            >
              {/* Error Hint Bubble */}
              <AnimatePresence>
                {errorHint?.colId === col.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -40 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-1/2 -translate-x-1/2 bg-red-600 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-lg z-50 whitespace-nowrap"
                  >
                    {errorHint.text}
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header */}
              <div className="p-2 text-center border-b border-[var(--sidebar-border)]/50 bg-[var(--surface-primary)]/50 rounded-t-2xl">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter truncate">
                  {headerMode === 'TEXT' ? col.label : headerMode === 'FRACTION' ? col.fraction : col.decimal}
                </div>
              </div>

              {/* Bank Area (Source) */}
              <div className="p-2 flex justify-center border-b border-[var(--sidebar-border)]/30 bg-[var(--surface-primary)]/30">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addBlock(col.id)}
                  className="w-8 h-8 rounded-lg shadow-sm border-2 border-white/20 flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: col.color }}
                >
                  <Icons.Plus size={14} className="text-white" />
                </motion.div>
              </div>

              {/* Background Illustration */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] text-8xl">
                {col.icon}
              </div>

              {/* Blocks Area */}
              <div 
                className="flex-1 p-2 grid grid-cols-2 gap-1 content-end justify-items-center overflow-y-auto no-scrollbar"
                onClick={() => addBlock(col.id)}
              >
                {Array.from({ length: counts[col.id] }).map((_, i) => (
                  <motion.div
                    key={i}
                    layoutId={`${col.id}-${i}`}
                    initial={{ scale: 0.5, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      explodeBlock(col.id);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      removeBlock(col.id);
                    }}
                    className="w-10 h-10 rounded-xl shadow-sm border-2 border-white/20 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                    style={{ backgroundColor: col.color }}
                  >
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-xs">
                      1
                    </div>
                    {/* Hammer Icon for Explosion Hint */}
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white rounded-full p-0.5 shadow-sm">
                        <Icons.Zap size={8} className="text-amber-500" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Digit Display */}
              <div 
                className="p-3 text-center border-t-4 bg-[var(--surface-primary)] rounded-b-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.02)]"
                style={{ borderTopColor: col.color }}
              >
                <div className="text-3xl font-black text-[var(--text-main)] tabular-nums">
                  {counts[col.id]}
                </div>
              </div>

              {/* Add Button Hint */}
              <button 
                onClick={(e) => { e.stopPropagation(); addBlock(col.id); }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/0 hover:bg-white/40 flex items-center justify-center text-slate-300 hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100"
              >
                <Icons.Plus size={24} />
              </button>
            </motion.div>

            {/* Decimal Point */}
            {col.id === 'e' && (
              <div className="flex flex-col justify-end pb-12 px-1">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-6 h-6 rounded-full shadow-lg flex items-center justify-center text-white font-black text-xl leading-none"
                  style={{ backgroundColor: 'var(--math-col-red)' }}
                >
                  ,
                </motion.div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Zoom Ruler */}
      <div className="h-24 bg-[var(--brand-secondary)]/50 border-t border-[var(--sidebar-border)] relative px-12 flex flex-col justify-center">
        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Zoom-Linjalen</div>
        <div className="h-1 bg-[var(--sidebar-border)] rounded-full relative">
          {/* Ticks */}
          {Array.from({ length: 11 }).map((_, i) => {
            const tickValue = Math.floor(totalValue) - 5 + i;
            return (
              <div 
                key={i} 
                className="absolute h-3 w-0.5 bg-[var(--sidebar-border)] -top-1" 
                style={{ left: `${i * 10}%` }}
              >
                <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-400">
                  {tickValue}
                </span>
              </div>
            );
          })}
          
          {/* Marker */}
          <motion.div 
            className="absolute -top-4 w-6 h-6 flex flex-col items-center"
            animate={{ left: `${50 + (totalValue - Math.floor(totalValue)) * 10}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md mb-1 whitespace-nowrap">
              {totalValue.toLocaleString('sv-SE', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}
            </div>
            <div className="w-1 h-4 bg-blue-600 rounded-full" />
          </motion.div>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="p-3 bg-[var(--brand-secondary)] text-[var(--text-main)] opacity-50 text-[10px] font-medium flex justify-center gap-8 border-t border-[var(--sidebar-border)]">
        <div className="flex items-center gap-2">
          <kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-white">Klicka</kbd>
          <span>Lägg till block</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-white">Dubbelklicka</kbd>
          <span>Spräng (Växla ner)</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-white">Högerklicka</kbd>
          <span>Ta bort</span>
        </div>
      </div>
    </div>
  );
};
