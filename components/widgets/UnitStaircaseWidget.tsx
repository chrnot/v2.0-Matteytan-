import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../icons';

type UnitType = 'LENGTH' | 'WEIGHT' | 'VOLUME';
type Dimension = 1 | 2 | 3;
type Phase = 'EXPLORER' | 'PUZZLE' | 'ADVANCED';

interface Step {
  id: string;
  prefix: string;
  label: string;
  power: number;
}

const STEPS: Step[] = [
  { id: 'kilo', prefix: 'k', label: 'Kilo', power: 3 },
  { id: 'hekto', prefix: 'h', label: 'Hekto', power: 2 },
  { id: 'deka', prefix: 'da', label: 'Deka', power: 1 },
  { id: 'grund', prefix: '', label: 'Grundenhet', power: 0 },
  { id: 'deci', prefix: 'd', label: 'Deci', power: -1 },
  { id: 'centi', prefix: 'c', label: 'Centi', power: -2 },
  { id: 'milli', prefix: 'm', label: 'Milli', power: -3 },
];

const UNIT_LABELS: Record<UnitType, string> = {
  LENGTH: 'm',
  WEIGHT: 'g',
  VOLUME: 'l'
};

const UNIT_TITLES: Record<UnitType, string> = {
  LENGTH: 'Längd',
  WEIGHT: 'Vikt',
  VOLUME: 'Volym'
};

export const UnitStaircaseWidget: React.FC = () => {
  const [value, setValue] = useState<number>(1);
  const [inputValue, setInputValue] = useState<string>("1");
  const [unitType, setUnitType] = useState<UnitType>('LENGTH');
  const [dimension, setDimension] = useState<Dimension>(1);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(3); // Default to 'Grund'
  const [phase, setPhase] = useState<Phase>('EXPLORER');
  const [challenge, setChallenge] = useState<{ from: number, to: number, value: number } | null>(null);
  const [feedback, setFeedback] = useState<'Correct' | 'Wrong' | null>(null);
  const [animation, setAnimation] = useState<'Multiplying' | 'Dividing' | null>(null);

  // Sound simulation logic
  const playClick = useCallback(() => {
    // In a real app we'd play an audio file.
    // For now, visual feedback is handled by animation state.
  }, []);

  const currentUnit = useMemo(() => {
    const symbol = UNIT_LABELS[unitType];
    if (dimension === 2) return `${symbol}²`;
    if (dimension === 3) return `${symbol}³`;
    return symbol;
  }, [unitType, dimension]);

  const stepFactor = useMemo(() => Math.pow(10, dimension), [dimension]);

  const movePlatform = (direction: 'UP' | 'DOWN') => {
    if (direction === 'UP' && currentStepIndex > 0) {
      setAnimation('Dividing');
      setValue(prev => prev / stepFactor);
      setCurrentStepIndex(prev => prev - 1);
      playClick();
      setTimeout(() => setAnimation(null), 1000);
    } else if (direction === 'DOWN' && currentStepIndex < STEPS.length - 1) {
      setAnimation('Multiplying');
      setValue(prev => prev * stepFactor);
      setCurrentStepIndex(prev => prev + 1);
      playClick();
      setTimeout(() => setAnimation(null), 1000);
    }
  };

  const generateChallenge = () => {
    const from = Math.floor(Math.random() * STEPS.length);
    let to = Math.floor(Math.random() * STEPS.length);
    while (to === from) to = Math.floor(Math.random() * STEPS.length);
    
    const val = parseFloat((Math.random() * 10).toFixed(1));
    setChallenge({ from, to, value: val });
    setCurrentStepIndex(from);
    setValue(val);
    setInputValue(val.toString());
    setFeedback(null);
  };

  const checkChallenge = () => {
    if (challenge && currentStepIndex === challenge.to) {
      setFeedback('Correct');
      setTimeout(() => {
        setFeedback(null);
        setChallenge(null);
        setPhase('EXPLORER');
      }, 2000);
    } else {
      setFeedback('Wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  useEffect(() => {
    if (phase === 'PUZZLE' && !challenge) {
      generateChallenge();
    }
  }, [phase, challenge]);

  // Positions-maskinen row logic
  const displayValue = value.toFixed(10).replace(/\.?0+$/, "");
  const parts = displayValue.split('.');
  const integerPart = parts[0] || '0';
  const decimalPart = parts[1] || '';

  return (
    <div className="flex flex-col h-full bg-[var(--surface-primary)] text-[var(--text-main)] select-none overflow-hidden font-sans relative">
      {/* Header - Top Row with Selectors */}
      <div className="h-14 border-b border-[var(--sidebar-border)] flex items-center justify-between px-6 bg-[var(--sidebar-hover)]/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--brand-secondary)] p-1 rounded-xl">
            {(['EXPLORER', 'PUZZLE', 'ADVANCED'] as Phase[]).map(p => (
              <button
                key={p}
                onClick={() => setPhase(p)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${phase === p ? 'bg-[var(--surface-primary)] shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {p === 'EXPLORER' ? 'Utforskaren' : p === 'PUZZLE' ? 'Pusslet' : 'Area/Volym'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {phase === 'PUZZLE' && (
            <button 
              onClick={generateChallenge}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
            >
              Ny uppgift
            </button>
          )}
          <div className="flex bg-[var(--brand-secondary)] p-1 rounded-xl">
            {(['LENGTH', 'WEIGHT', 'VOLUME'] as UnitType[]).map(ut => (
              <button
                key={ut}
                onClick={() => setUnitType(ut)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${unitType === ut ? 'bg-[var(--surface-primary)] shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {UNIT_TITLES[ut]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: The Staircase */}
        <div className="flex-1 flex flex-col items-center justify-start p-6 relative bg-[var(--surface-primary)] overflow-y-auto">
          {/* Challenge Box */}
          <AnimatePresence>
            {challenge && phase === 'PUZZLE' && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-xl font-black text-sm z-50 ring-4 ring-blue-500/20 text-center"
              >
                UPPDRAG: Gör om {challenge.value} {STEPS[challenge.from].prefix}{UNIT_LABELS[unitType]} till {STEPS[challenge.to].label.toLowerCase()}{UNIT_LABELS[unitType]}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative w-[110%] -left-[5%] aspect-[1.3/1]">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 850 550">
              {/* Background guide lines */}
              {STEPS.map((_, idx) => (
                <line 
                  key={`guide-${idx}`}
                  x1="-50" y1={idx * 68 + 105} x2="900" y2={idx * 68 + 105}
                  className="stroke-slate-200/40 stroke-1"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Stair Steps */}
              {STEPS.map((step, idx) => {
                const isActive = currentStepIndex === idx;
                const x = idx * 105 + 20;
                const y = idx * 68 + 100;
                
                return (
                  <g 
                    key={step.id} 
                    className="cursor-pointer group"
                    onClick={() => {
                      const powerDiff = (STEPS[currentStepIndex].power * dimension) - (step.power * dimension);
                      const newValue = value * Math.pow(10, powerDiff);
                      setValue(newValue);
                      setInputValue(newValue.toFixed(5).replace(/\.?0+$/, ""));
                      setCurrentStepIndex(idx);
                      playClick();
                    }}
                  >
                    <rect x={x + 5} y={y + 5} width="120" height="40" rx="8" className="fill-slate-900/5 blur-sm" />
                    <rect x={x} y={y + 10} width="120" height="30" rx="8" className={`transition-all duration-300 ${isActive ? 'fill-blue-700' : 'fill-slate-300'}`} />
                    <rect x={x} y={y} width="120" height="15" rx="8" className={`transition-all duration-300 ${isActive ? 'fill-blue-500 shadow-md' : 'fill-slate-200'} group-hover:fill-blue-400`} />
                    <text x={x + 60} y={y - 15} textAnchor="middle" className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'fill-blue-600' : 'fill-slate-400'}`}>{step.label}</text>
                    <text x={x + 60} y={y + 32} textAnchor="middle" className={`text-[14px] font-black tracking-widest ${isActive ? 'fill-white' : 'fill-slate-500'}`}>
                      {step.prefix}{UNIT_LABELS[unitType]}{dimension > 1 ? (dimension === 2 ? '²' : '³') : ''}
                    </text>
                  </g>
                );
              })}

              {/* Connecting Dashes */}
              {STEPS.map((_, idx) => idx < STEPS.length - 1 && (
                <line 
                  key={`riser-${idx}`}
                  x1={(idx + 1) * 105 + 20 + 115} y1={idx * 68 + 100 + 35}
                  x2={(idx + 1) * 105 + 20 + 115} y2={(idx + 1) * 68 + 100}
                  className="stroke-slate-200/50 stroke-1"
                  strokeDasharray="2 2"
                />
              ))}

              {/* High Visibility Operation Badges */}
              {STEPS.map((_, idx) => idx < STEPS.length - 1 && (
                <g key={`arrow-${idx}`} className="pointer-events-none">
                  <path d={`M ${idx * 105 + 140} ${idx * 68 + 115} Q ${idx * 105 + 190} ${idx * 68 + 155} ${idx * 105 + 140} ${idx * 68 + 195}`} className="stroke-slate-300/60 stroke-2 fill-none" strokeDasharray="4 4" />
                  <g transform={`translate(${idx * 105 + 195}, ${idx * 68 + 140})`}>
                    <circle r="22" className="fill-white stroke-emerald-500 stroke-2 shadow-sm" />
                    <text textAnchor="middle" dy=".3em" className="fill-emerald-600 font-black text-[11px]">×{stepFactor}</text>
                  </g>
                  <g transform={`translate(${idx * 105 + 195}, ${idx * 68 + 190})`}>
                    <circle r="22" className="fill-white stroke-rose-500 stroke-2 shadow-sm" />
                    <text textAnchor="middle" dy=".3em" className="fill-rose-600 font-black text-[11px]">÷{stepFactor}</text>
                  </g>
                </g>
              ))}

              {/* The Marker */}
              <motion.g animate={{ x: currentStepIndex * 105 + 20, y: currentStepIndex * 68 + 88 }} className="drop-shadow-[0_12px_24px_rgba(37,99,235,0.4)]">
                <rect width="120" height="10" rx="4" className="fill-blue-600" />
                <rect x="10" y="-18" width="100" height="26" rx="13" className="fill-white stroke-blue-600 stroke-2" />
                <text x="60" y="1" textAnchor="middle" className="fill-blue-700 font-black text-[14px]">
                  {STEPS[currentStepIndex].prefix}{UNIT_LABELS[unitType]}{dimension > 1 ? (dimension === 2 ? '²' : '³') : ''}
                </text>
                <AnimatePresence>
                  {animation && (
                    <motion.circle initial={{ scale: 0, opacity: 0 }} animate={{ scale: 2.5, opacity: 0.4 }} exit={{ scale: 3.5, opacity: 0 }} cx="60" cy="0" r="22" className={animation === 'Multiplying' ? 'fill-emerald-400' : 'fill-rose-400'} />
                  )}
                </AnimatePresence>
              </motion.g>
            </svg>

            {/* Vertical Controls */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-4">
              <button onClick={() => movePlatform('UP')} disabled={currentStepIndex === 0} className={`p-5 rounded-full shadow-xl transition-all ${currentStepIndex === 0 ? 'bg-slate-100 text-slate-300' : 'bg-white text-rose-500 hover:scale-110 active:scale-95 hover:bg-rose-50 border border-rose-100'}`}>
                <Icons.ChevronUp size={40} />
              </button>
              <button onClick={() => movePlatform('DOWN')} disabled={currentStepIndex === STEPS.length - 1} className={`p-5 rounded-full shadow-xl transition-all ${currentStepIndex === STEPS.length - 1 ? 'bg-slate-100 text-slate-300' : 'bg-white text-emerald-500 hover:scale-110 active:scale-95 hover:bg-emerald-50 border border-emerald-100'}`}>
                <Icons.ChevronDown size={40} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Data Panel */}
        <div className="w-96 border-l border-[var(--sidebar-border)] bg-[var(--brand-secondary)]/10 p-8 flex flex-col gap-8 overflow-y-auto">
          {/* Dimension Selector for Advanced Mode */}
          {phase === 'ADVANCED' && (
            <div className="bg-[var(--surface-primary)] p-4 rounded-3xl border border-[var(--sidebar-border)] shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 text-center">Dimension</span>
              <div className="flex bg-[var(--brand-secondary)] p-1 rounded-xl">
                {[1, 2, 3].map(d => (
                  <button
                    key={d}
                    onClick={() => setDimension(d as Dimension)}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${dimension === d ? 'bg-[var(--surface-primary)] shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {d === 1 ? 'Längd' : d === 2 ? 'Area' : 'Volym'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-[var(--surface-primary)] p-6 rounded-3xl border border-[var(--sidebar-border)] shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4 text-center">Skriv in värde</span>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-3">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => {
                    const val = e.target.value.replace(',', '.');
                    setInputValue(val);
                    const parsed = parseFloat(val);
                    if (!isNaN(parsed)) setValue(parsed);
                  }}
                  className="bg-transparent border-b-4 border-blue-500 font-black text-4xl w-full text-center outline-none text-[var(--text-main)]"
                />
              </div>
              <div className="text-xl font-black text-slate-400 text-center">
                {STEPS[currentStepIndex].prefix}{UNIT_LABELS[unitType]}{dimension > 1 ? (dimension === 2 ? '²' : '³') : ''}
              </div>
            </div>
            
            {phase === 'PUZZLE' && challenge && (
              <button 
                onClick={checkChallenge}
                className="w-full mt-6 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                Kolla svaret
              </button>
            )}
          </div>

          {/* Positions Machine Area */}
          <div className="flex flex-col gap-4">
            <div className="bg-[var(--surface-primary)] p-6 rounded-3xl border border-[var(--sidebar-border)] shadow-md overflow-hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 text-center">Positions-maskinen</span>
              <div className="flex flex-col items-center gap-3">
                {/* Visualizer Row */}
                <div className="flex gap-0.5 scale-[0.85] origin-center">
                  {integerPart.padStart(5, ' ').split('').map((char, i) => (
                    <div key={`int-${i}`} className={`w-8 h-12 rounded-lg flex items-center justify-center font-black text-xl border-2 transition-all ${char === ' ' ? 'border-dashed border-slate-100 text-transparent opacity-10' : 'bg-white border-blue-500 text-blue-600 shadow-sm'}`}>
                      {char}
                    </div>
                  ))}
                  <div className="w-4 h-12 flex items-end justify-center font-black text-3xl text-blue-600 pb-1">.</div>
                  {decimalPart.padEnd(5, ' ').split('').map((char, i) => (
                    <div key={`dec-${i}`} className={`w-8 h-12 rounded-lg flex items-center justify-center font-black text-xl border-2 transition-all ${char === ' ' ? 'border-dashed border-slate-100 text-transparent opacity-10' : 'bg-white border-rose-500 text-rose-600 shadow-sm'}`}>
                      {char}
                    </div>
                  ))}
                </div>

                <div className="h-px w-full bg-slate-100 my-2" />

                <div className="w-full space-y-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Grundpotensform</span>
                    <div className="text-lg font-bold font-mono text-slate-600">
                      {value !== 0 ? (
                        <>
                          {value.toExponential(2).split('e')[0]} × 10
                          <sup className="text-xs">{value.toExponential(2).split('e')[1].replace('+', '')}</sup>
                        </>
                      ) : '0'}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-blue-50 rounded-2xl border border-blue-100">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Totalt</span>
                    <div className="text-lg font-black text-blue-600 text-center break-all whitespace-normal">
                      {displayValue} {UNIT_LABELS[unitType]}{dimension > 1 ? (dimension === 2 ? '²' : '³') : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none"
          >
            <div className={`px-12 py-6 rounded-3xl text-4xl font-black text-white shadow-2xl ${feedback === 'Correct' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              {feedback === 'Correct' ? 'RÄTT! 🎉' : 'NÄRA! 🧐'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
