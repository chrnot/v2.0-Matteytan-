import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../icons';

type PrefixPower = 12 | 9 | 6 | 3 | 2 | 1 | 0 | -1 | -2 | -3 | -6 | -9;

interface PrefixDef {
  symbol: string;
  name: string;
  power: PrefixPower;
  multiplier: string;
  powerLabel: string;
  color: string;
  example: string;
  description: string;
}

const PREFIXES: PrefixDef[] = [
  { symbol: 'T', name: 'Tera', power: 12, multiplier: '1 000 000 000 000', powerLabel: '10¹²', color: 'bg-red-600', description: 'Biljon', example: 'En hårddisk på 2 TB rymmer 2 biljoner bytes.' },
  { symbol: 'G', name: 'Giga', power: 9, multiplier: '1 000 000 000', powerLabel: '10⁹', color: 'bg-orange-600', description: 'Miljard', example: 'Ett USB-minne på 16 GB rymmer 16 miljarder bytes.' },
  { symbol: 'M', name: 'Mega', power: 6, multiplier: '1 000 000', powerLabel: '10⁶', color: 'bg-amber-500', description: 'Miljon', example: 'En bild på 12 MP består av 12 miljoner pixlar.' },
  { symbol: 'k', name: 'Kilo', power: 3, multiplier: '1 000', powerLabel: '10³', color: 'bg-yellow-500', description: 'Tusen', example: 'Ett mjölkpaket väger ca 1 kg (1000 gram).' },
  { symbol: 'h', name: 'Hekto', power: 2, multiplier: '100', powerLabel: '10²', color: 'bg-lime-500', description: 'Hundra', example: 'En påse godis väger ofta 1 hg (100 gram).' },
  { symbol: 'da', name: 'Deka', power: 1, multiplier: '10', powerLabel: '10¹', color: 'bg-emerald-500', description: 'Tio', example: 'En dekameter är 10 meter.' },
  { symbol: '', name: 'Grund', power: 0, multiplier: '1', powerLabel: '10⁰', color: 'bg-slate-400', description: 'Enhet', example: 'Grundenheten (t.ex. meter, gram eller liter).' },
  { symbol: 'd', name: 'Deci', power: -1, multiplier: '0,1', powerLabel: '10⁻¹', color: 'bg-cyan-500', description: 'Tiondel', example: 'En kaffekopp rymmer ca 2 dl (2 tiondels liter).' },
  { symbol: 'c', name: 'Centi', power: -2, multiplier: '0,01', powerLabel: '10⁻²', color: 'bg-sky-500', description: 'Hundradel', example: 'En myra är ca 1 cm lång (1 hundradels meter).' },
  { symbol: 'm', name: 'Milli', power: -3, multiplier: '0,001', powerLabel: '10⁻³', color: 'bg-blue-600', description: 'Tusendel', example: 'Ett regndroppe är ca 2 mm bred.' },
  { symbol: 'µ', name: 'Mikro', power: -6, multiplier: '0,000 001', powerLabel: '10⁻⁶', color: 'bg-indigo-600', description: 'Miljondel', example: 'En bakterie är ca 2 µm (2 miljondels meter).' },
  { symbol: 'n', name: 'Nano', power: -9, multiplier: '0,000 000 001', powerLabel: '10⁻⁹', color: 'bg-violet-600', description: 'Miljarddel', example: 'Ett DNA-strå är ca 2 nm brett.' },
];

const Exponent = ({ base, exp, className = "" }: { base: string | number, exp: number | string, className?: string }) => (
  <span className={`inline-flex items-baseline ${className}`}>
    <span>{base}</span>
    <span className="text-[0.55em] leading-none -top-[0.5em] relative font-black tracking-normal">
      {exp}
    </span>
  </span>
);

export const PrefixConverterWidget: React.FC = () => {
  const [value, setValue] = useState<number>(5);
  const [inputValue, setInputValue] = useState<string>("5");
  const [currentPrefix, setCurrentPrefix] = useState<PrefixDef>(PREFIXES.find(p => p.power === 3)!); // Default Kilo
  const [isPowerMode, setIsPowerMode] = useState(false);
  const [isUnpacked, setIsUnpacked] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [scrollPos, setScrollPos] = useState(0);
  const [hoveredPrefix, setHoveredPrefix] = useState<PrefixDef | null>(null);
  const [conversionArc, setConversionArc] = useState<{ from: PrefixDef; to: PrefixDef } | null>(null);
  const [unit, setUnit] = useState('m');
  const [task, setTask] = useState<{ from: PrefixDef; to: PrefixDef; value: number; unit: string } | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const getFullUnitName = (prefixName: string, unitCode: string) => {
    const baseNames: Record<string, string> = {
      'm': 'meter',
      'g': 'gram',
      'l': 'liter'
    };
    const base = baseNames[unitCode] || unitCode;
    if (prefixName === 'Grund') return base;
    return prefixName.toLowerCase() + base;
  };

  const generateTask = () => {
    const units = ['m', 'g', 'l'];
    const selectedUnit = units[Math.floor(Math.random() * units.length)];
    // Pick two random prefixes within a reasonable range
    const available = PREFIXES.filter(p => p.power >= -3 && p.power <= 3);
    const from = available[Math.floor(Math.random() * available.length)];
    let to = available[Math.floor(Math.random() * available.length)];
    while (to.power === from.power) {
      to = available[Math.floor(Math.random() * available.length)];
    }
    const val = Math.floor(Math.random() * 10) * 10 + 10;
    setTask({ from, to, value: val, unit: selectedUnit });
    setUnit(selectedUnit);
    setCurrentPrefix(from);
    setValue(val);
    setInputValue(val.toString());
    setIsUnpacked(false);
    setShowFeedback(null);
  };

  const checkTask = () => {
    if (!task) return;
    if (currentPrefix.power === task.to.power) {
      setShowFeedback('correct');
      setTimeout(() => {
        setTask(null);
        setShowFeedback(null);
      }, 2000);
    } else {
      setShowFeedback('wrong');
      setTimeout(() => setShowFeedback(null), 1000);
    }
  };

  const scaleRef = useRef<HTMLDivElement>(null);

  const handleUnpack = () => {
    setIsUnpacked(!isUnpacked);
  };

  const handlePrefixClick = (p: PrefixDef) => {
    if (p.power === currentPrefix.power) {
      handleUnpack();
    } else {
      setConversionArc({ from: currentPrefix, to: p });
      // Center the new prefix on the scale
      setScrollPos(-getXPos(p.power));
      
      const powerDiff = currentPrefix.power - p.power;
      const newValue = value * Math.pow(10, powerDiff);
      const formattedValue = Number(newValue.toFixed(9));
      
      setTimeout(() => {
        setValue(formattedValue);
        setInputValue(formattedValue.toString());
        setCurrentPrefix(p);
        setConversionArc(null);
        setIsUnpacked(false);
      }, 1500);
    }
  };

  const getXPos = (power: number) => {
    // Map power to x position on the scale
    const baseGap = 120 * zoom;
    const largeGap = 350 * zoom;
    
    if (power === 0) return 0;
    
    const sortedPrefixes = [...PREFIXES].sort((a, b) => a.power - b.power);
    const zeroIdx = sortedPrefixes.findIndex(p => p.power === 0);
    const targetIdx = sortedPrefixes.findIndex(p => p.power === power);
    
    let pos = 0;
    if (power > 0) {
      for (let i = zeroIdx + 1; i <= targetIdx; i++) {
        const diff = Math.abs(sortedPrefixes[i].power - sortedPrefixes[i-1].power);
        pos += diff === 1 ? baseGap : largeGap;
      }
    } else {
      for (let i = zeroIdx - 1; i >= targetIdx; i--) {
        const diff = Math.abs(sortedPrefixes[i].power - sortedPrefixes[i+1].power);
        pos -= diff === 1 ? baseGap : largeGap;
      }
    }
    
    return pos;
  };

  // Drag to scroll logic
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(x - scrollPos);
  };

  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setScrollPos(x - startX);
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  const formatDisplayValue = (val: number) => {
    // Avoid scientific notation for large/small numbers if possible
    if (Math.abs(val) < 1e-10 && val !== 0) return "0";
    return val.toLocaleString('sv-SE', { 
      maximumFractionDigits: 10,
      useGrouping: true 
    });
  };

  return (
    <div className="flex flex-col h-full bg-white select-none overflow-hidden font-sans relative">
      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-50">
        <button 
          onClick={() => setShowHelp(true)}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
          title="Hjälp"
        >
          <Icons.Info size={20} />
        </button>
      </div>

      {/* Workspace Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-gradient-to-b from-slate-50/50 to-white">
        <div className="flex flex-col items-center gap-12">
          <div className="flex items-center gap-6">
            <motion.div 
              layout
              className="flex flex-col items-center"
            >
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Värde</span>
              <div className="flex items-baseline gap-2">
                <span className={`font-black text-slate-900 tracking-tighter transition-all duration-300 ${
                  value.toString().length > 12 ? 'text-4xl' : 
                  value.toString().length > 8 ? 'text-6xl' : 'text-8xl'
                }`}>
                  {formatDisplayValue(value)}
                </span>
                <span className="text-4xl font-black text-slate-400">
                  {unit}
                </span>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {!isUnpacked ? (
                <motion.button
                  key="prefix"
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
                  onClick={handleUnpack}
                  className={`px-8 py-4 rounded-[32px] text-7xl font-black text-white shadow-2xl ${currentPrefix.color} hover:scale-105 active:scale-95 transition-transform relative group`}
                >
                  {currentPrefix.symbol || 'unit'}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] font-black text-slate-400 uppercase tracking-widest">Klicka för att packa upp</div>
                </motion.button>
              ) : (
                <motion.div
                  key="multiplier"
                  initial={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  onClick={handleUnpack}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-8 bg-blue-50/50 p-8 rounded-[40px] border-2 border-blue-100 shadow-inner">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Värde</span>
                      <span className="text-5xl font-black text-slate-700">{formatDisplayValue(value)}</span>
                    </div>
                    <span className="text-4xl font-black text-blue-300">×</span>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Prefix-värde</span>
                      <span className="text-5xl font-black text-blue-600">
                        {isPowerMode ? <Exponent base="10" exp={currentPrefix.power} /> : currentPrefix.multiplier}
                      </span>
                    </div>
                    <span className="text-4xl font-black text-emerald-300">=</span>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Resultat</span>
                      <span className="text-6xl font-black text-emerald-600">
                        {formatDisplayValue(value * Math.pow(10, currentPrefix.power))}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 mt-1">
                        {unit === 'm' ? 'meter' : unit === 'g' ? 'gram' : 'liter'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsPowerMode(!isPowerMode)}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 ${
                isPowerMode 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {isPowerMode ? 'Grundpotens-läge' : 'Standard-läge'}
            </button>

            <button 
              onClick={task ? checkTask : generateTask}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border-2 shadow-lg ${
                task 
                  ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              {task ? 'Kontrollera svar' : 'Ny Utmaning'}
            </button>

            {task && (
              <button 
                onClick={() => setShowHelp(!showHelp)}
                className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
              >
                <Icons.Info size={24} />
              </button>
            )}
            
            <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] border-2 border-slate-100 shadow-sm">
              <select 
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="bg-slate-50 px-3 py-2 rounded-xl font-black text-xs outline-none text-slate-600 border-none appearance-none cursor-pointer"
              >
                <option value="m">meter (m)</option>
                <option value="g">gram (g)</option>
                <option value="l">liter (l)</option>
              </select>
              <div className="w-px h-8 bg-slate-100 mx-1" />
              <button 
                onClick={() => {
                  const newVal = Math.max(0, value - 1);
                  setValue(newVal);
                  setInputValue(newVal.toString());
                }}
                className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <Icons.Minus size={24} />
              </button>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.');
                  setInputValue(val);
                  const parsed = parseFloat(val);
                  if (!isNaN(parsed)) {
                    setValue(parsed);
                  }
                }}
                onBlur={() => {
                  setInputValue(value.toString());
                }}
                className="w-32 bg-transparent text-center font-black text-3xl outline-none text-slate-800"
              />
              <button 
                onClick={() => {
                  const newVal = value + 1;
                  setValue(newVal);
                  setInputValue(newVal.toString());
                }}
                className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <Icons.Plus size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Help Overlay */}
        <AnimatePresence>
          {showHelp && task && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-[110] flex items-center justify-center p-8"
            >
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowHelp(false)} />
              <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-lg relative z-10 border border-slate-100">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  <Icons.X size={24} />
                </button>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                    <Icons.Lightbulb size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-4">Hur gör man?</h3>
                  <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
                    <p>
                      Varje steg på skalan är en <span className="text-blue-600 font-black">10-gånger</span> förändring.
                    </p>
                    <div className="bg-slate-50 p-6 rounded-3xl text-sm space-y-2">
                      <p>⬅️ Gå till <span className="font-bold">vänster</span>: Flytta kommatecknet till <span className="font-bold">höger</span> (talet blir större).</p>
                      <p>➡️ Gå till <span className="font-bold">höger</span>: Flytta kommatecknet till <span className="font-bold">vänster</span> (talet blir mindre).</p>
                    </div>
                    <p className="text-sm">
                      För att lösa uppgiften: Klicka på rätt prefix på skal-linjen längst ner så att enheten matchar målet!
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowHelp(false)}
                    className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                  >
                    Jag fattar!
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task Overlay */}
        <AnimatePresence>
          {task && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-52 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-8 py-4 rounded-3xl border-2 border-blue-500 shadow-2xl flex flex-col items-center gap-2 z-40"
            >
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Utmaning</div>
              <div className="text-2xl font-black text-slate-800 text-center">
                Gör om <span className="text-blue-600">{task.value} {task.from.symbol}{task.unit}</span> till <span className="text-emerald-600">{getFullUnitName(task.to.name, task.unit)}</span>
              </div>
              <div className="text-xs font-bold text-slate-400">Använd skalan för att växla prefix</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Overlay */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className={`absolute inset-0 flex items-center justify-center z-[100] pointer-events-none`}
            >
              <div className={`px-12 py-6 rounded-full text-4xl font-black text-white shadow-2xl ${showFeedback === 'correct' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                {showFeedback === 'correct' ? 'Snyggt! 🎉' : 'Försök igen! 🧐'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversion Arc Overlay */}
        <AnimatePresence>
          {conversionArc && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
              <svg className="w-full h-full max-w-4xl max-h-[400px]">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  d="M 100 300 Q 400 50 700 300"
                  fill="none"
                  stroke="url(#arcGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="1 20"
                />
                <defs>
                  <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={conversionArc.from.color.replace('bg-', '#')} />
                    <stop offset="100%" stopColor={conversionArc.to.color.replace('bg-', '#')} />
                  </linearGradient>
                </defs>
                <motion.g
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <rect x="300" y="80" width="200" height="60" rx="30" fill="white" className="shadow-xl" />
                  <text x="400" y="120" textAnchor="middle" className="fill-slate-900 font-black text-xl">
                    × 10
                  </text>
                  <text x="435" y="110" textAnchor="start" className="fill-slate-900 font-black text-xs">
                    {currentPrefix.power - conversionArc.to.power}
                  </text>
                </motion.g>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prefix Info Card (Hover) */}
        <AnimatePresence>
          {hoveredPrefix && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute top-8 right-8 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-50 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-16 h-16 ${hoveredPrefix.color} opacity-10 rounded-bl-full`} />
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${hoveredPrefix.color} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                  {hoveredPrefix.symbol || '1'}
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Prefix</div>
                  <div className="text-xl font-black text-slate-800 leading-none">{hoveredPrefix.name}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Värde</div>
                  <div className="text-sm font-bold text-slate-600">{hoveredPrefix.description} ({isPowerMode ? hoveredPrefix.powerLabel : hoveredPrefix.multiplier})</div>
                </div>
                <div className="h-px bg-slate-100" />
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Exempel</div>
                  <p className="text-xs text-slate-500 leading-relaxed italic">"{hoveredPrefix.example}"</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scale Area */}
      <div className="h-48 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
        <div className="absolute top-4 left-8 flex items-center gap-4 z-10">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Skal-Linjen</div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1 hover:bg-slate-50 rounded"><Icons.Minus size={14}/></button>
            <div className="text-[9px] font-black w-8 text-center">{Math.round(zoom * 100)}%</div>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1 hover:bg-slate-50 rounded"><Icons.Plus size={14}/></button>
          </div>
        </div>

        <div 
          ref={scaleRef}
          className="h-full flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${scrollPos}px)` }}
        >
          <div className="relative flex items-center">
            {/* Main Axis Line */}
            <div className="absolute h-1 bg-slate-200 rounded-full w-[5000px] -translate-x-1/2" />

            {PREFIXES.map((p) => {
              const x = getXPos(p.power);
              const isActive = currentPrefix.power === p.power;
              
              return (
                <motion.div
                  key={p.name}
                  className="absolute flex flex-col items-center"
                  style={{ left: x }}
                >
                  {/* Tick */}
                  <div className={`w-1 h-4 rounded-full mb-4 ${isActive ? 'bg-blue-600' : 'bg-slate-300'}`} />
                  
                  {/* Button */}
                  <motion.button
                    onMouseEnter={() => setHoveredPrefix(p)}
                    onMouseLeave={() => setHoveredPrefix(null)}
                    onClick={() => handlePrefixClick(p)}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    className={`
                      w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg transition-all
                      ${isActive ? `${p.color} text-white ring-4 ring-white` : 'bg-white text-slate-400 hover:text-slate-600'}
                    `}
                  >
                    {p.symbol || '1'}
                  </motion.button>

                  <div className={`mt-3 text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                    {p.name}
                  </div>
                  <div className="text-[8px] font-bold text-slate-300 mt-1">
                    {isPowerMode ? (
                      <Exponent base="10" exp={p.power} />
                    ) : (
                      p.multiplier
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Scroll Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
          <Icons.ChevronLeft size={12} />
          Dra för att utforska skalan
          <Icons.ChevronRight size={12} />
        </div>
      </div>
    </div>
  );
};
