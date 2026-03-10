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
  const [currentPrefix, setCurrentPrefix] = useState<PrefixDef>(PREFIXES.find(p => p.power === 0)!); // Default Grund
  const [isPowerMode, setIsPowerMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [scrollPos, setScrollPos] = useState(0);
  const [hoveredPrefix, setHoveredPrefix] = useState<PrefixDef | null>(null);
  const [conversionArc, setConversionArc] = useState<{ from: PrefixDef; to: PrefixDef; diff: number } | null>(null);
  const [unit, setUnit] = useState('m');
  const [task, setTask] = useState<{ from: PrefixDef; to: PrefixDef; value: number; unit: string } | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [unpackState, setUnpackState] = useState<'idle' | 'expanded' | 'calculated'>('idle');

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

  const unpackTimeoutRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (unpackTimeoutRef.current) clearTimeout(unpackTimeoutRef.current);
    };
  }, []);

  const handleUnpack = () => {
    if (currentPrefix.power === 0) return;

    if (unpackState === 'idle') {
      setUnpackState('expanded');
      
      unpackTimeoutRef.current = setTimeout(() => {
        setUnpackState('calculated');
        unpackTimeoutRef.current = setTimeout(() => {
          const multiplier = Math.pow(10, currentPrefix.power);
          const newValue = Number((value * multiplier).toFixed(10));
          setValue(newValue);
          setInputValue(newValue.toString());
          setCurrentPrefix(PREFIXES.find(p => p.power === 0)!);
          setUnpackState('idle');
        }, 1000);
      }, 1500);
    } else if (unpackState === 'expanded') {
      if (unpackTimeoutRef.current) clearTimeout(unpackTimeoutRef.current);
      setUnpackState('calculated');
      unpackTimeoutRef.current = setTimeout(() => {
        const multiplier = Math.pow(10, currentPrefix.power);
        const newValue = Number((value * multiplier).toFixed(10));
        setValue(newValue);
        setInputValue(newValue.toString());
        setCurrentPrefix(PREFIXES.find(p => p.power === 0)!);
        setUnpackState('idle');
      }, 1000);
    }
  };

  const generateTask = () => {
    const units = ['m', 'g', 'l'];
    const selectedUnit = units[Math.floor(Math.random() * units.length)];
    const available = PREFIXES.filter(p => p.power >= -3 && p.power <= 3);
    const from = available[Math.floor(Math.random() * available.length)];
    let to = available[Math.floor(Math.random() * available.length)];
    while (to.power === from.power) {
      to = available[Math.floor(Math.random() * available.length)];
    }
    const val = (Math.floor(Math.random() * 9) + 1) * Math.pow(10, Math.floor(Math.random() * 3));
    setTask({ from, to, value: val, unit: selectedUnit });
    setUnit(selectedUnit);
    setCurrentPrefix(from);
    setValue(val);
    setInputValue(val.toString());
    setShowFeedback(null);
    setConversionArc(null);
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

  const handlePrefixClick = (p: PrefixDef) => {
    if (conversionArc) return; // Prevent spamming
    if (p.power === currentPrefix.power) return;

    const powerDiff = currentPrefix.power - p.power;
    setConversionArc({ from: currentPrefix, to: p, diff: powerDiff });
    
    // Center the new prefix on the scale
    setScrollPos(-getXPos(p.power));
    
    const newValue = value * Math.pow(10, powerDiff);
    const formattedValue = Number(newValue.toFixed(10));
    
    setTimeout(() => {
      setValue(formattedValue);
      setInputValue(formattedValue.toString());
      setCurrentPrefix(p);
      setConversionArc(null);
    }, 1200);
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
    <div className="flex flex-col h-full bg-slate-50 select-none overflow-hidden font-sans relative">
      {/* Header / Controls */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setIsPowerMode(false)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isPowerMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Standard
            </button>
            <button 
              onClick={() => setIsPowerMode(true)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isPowerMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Potens
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <select 
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="bg-slate-50 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest outline-none text-slate-600 border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors"
          >
            <option value="m">Meter (m)</option>
            <option value="g">Gram (g)</option>
            <option value="l">Liter (l)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={task ? checkTask : generateTask}
            className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md ${
              task 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            {task ? 'Kontrollera' : 'Ny Utmaning'}
          </button>
          <button 
            onClick={() => setShowHelp(true)}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
          >
            <Icons.Info size={20} />
          </button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Value Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white relative">
          <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
            <div className="w-full flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Aktuellt Värde</span>
              
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center justify-center gap-6 w-full min-h-[120px]">
                  <AnimatePresence mode="wait">
                    {unpackState === 'idle' ? (
                      <motion.div 
                        key="idle"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex items-center gap-6"
                      >
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 mb-2">
                            <button 
                              onClick={() => {
                                const newVal = Math.max(0, value - 1);
                                setValue(newVal);
                                setInputValue(newVal.toString());
                              }}
                              className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 hover:text-blue-600 hover:shadow-md transition-all"
                            >
                              <Icons.Minus size={20} />
                            </button>
                            <input 
                              type="text" 
                              value={inputValue}
                              onChange={(e) => {
                                const val = e.target.value.replace(',', '.');
                                setInputValue(val);
                                const parsed = parseFloat(val);
                                if (!isNaN(parsed)) setValue(parsed);
                              }}
                              onBlur={() => setInputValue(value.toString())}
                              className="w-40 bg-transparent text-center font-black text-4xl outline-none text-slate-800"
                            />
                            <button 
                              onClick={() => {
                                const newVal = value + 1;
                                setValue(newVal);
                                setInputValue(newVal.toString());
                              }}
                              className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 hover:text-blue-600 hover:shadow-md transition-all"
                            >
                              <Icons.Plus size={20} />
                            </button>
                          </div>
                        </div>

                        <motion.button 
                          onClick={handleUnpack}
                          whileHover={currentPrefix.power !== 0 ? { scale: 1.05 } : {}}
                          whileTap={currentPrefix.power !== 0 ? { scale: 0.95 } : {}}
                          className={`group px-8 py-6 rounded-[32px] text-7xl font-black text-white shadow-xl ${currentPrefix.color} min-w-[140px] flex items-center justify-center relative transition-all ${currentPrefix.power !== 0 ? 'cursor-pointer hover:shadow-2xl' : 'cursor-default'}`}
                        >
                          {currentPrefix.symbol || unit}
                          <div className="absolute -bottom-6 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                            {currentPrefix.name}
                          </div>
                          {currentPrefix.power !== 0 && (
                            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[8px] font-black px-3 py-1 rounded-full whitespace-nowrap">
                              KLICKA FÖR ATT PACKA UPP 📦
                            </div>
                          )}
                        </motion.button>
                      </motion.div>
                    ) : unpackState === 'expanded' ? (
                      <motion.div 
                        key="expanded"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={handleUnpack}
                        className="flex items-center gap-4 text-6xl font-black text-slate-800 whitespace-nowrap cursor-pointer hover:scale-105 transition-transform"
                      >
                        <span>{value}</span>
                        <span className="text-blue-500">·</span>
                        <div className={`px-6 py-3 rounded-2xl ${currentPrefix.color} text-white text-4xl shadow-lg`}>
                          {isPowerMode ? (
                            <Exponent base="10" exp={currentPrefix.power} />
                          ) : (
                            currentPrefix.multiplier.replace(/\s/g, '')
                          )}
                        </div>
                        <span className="text-slate-400">{unit}</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="calculated"
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 text-7xl font-black text-emerald-600"
                      >
                        <span>{formatDisplayValue(value * Math.pow(10, currentPrefix.power))}</span>
                        <span className="text-slate-400">{unit}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-px w-full max-w-md bg-slate-100 my-4" />

                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Motsvarar totalt</span>
                  <div className="text-2xl font-black text-slate-400 flex items-baseline gap-2 text-center">
                    <span>{formatDisplayValue(value * Math.pow(10, currentPrefix.power))}</span>
                    <span className="text-sm">{unit === 'm' ? 'meter' : unit === 'g' ? 'gram' : 'liter'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Arc Overlay */}
          <AnimatePresence>
            {conversionArc && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center z-20"
              >
                <div className="bg-white/95 backdrop-blur-md px-10 py-8 rounded-[40px] shadow-2xl border-2 border-blue-500 flex flex-col items-center gap-3">
                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Växlar Prefix</div>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-slate-400">{conversionArc.from.symbol || 'enhet'}</span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">{conversionArc.from.name}</span>
                    </div>
                    <Icons.ChevronRight className="text-blue-500" size={32} />
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-slate-900">{conversionArc.to.symbol || 'enhet'}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{conversionArc.to.name}</span>
                    </div>
                  </div>
                  <div className="text-4xl font-black text-blue-600 mt-2">
                    × 10<Exponent base="" exp={conversionArc.diff} />
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-1 italic">
                    {conversionArc.diff > 0 ? 'Kommatecknet flyttas åt höger' : 'Kommatecknet flyttas åt vänster'}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Challenge Panel */}
        <div className="w-80 bg-slate-50 border-l border-slate-200 p-8 flex flex-col gap-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {task ? (
              <motion.div
                key="task"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icons.Zap size={18} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utmaning</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-slate-500 leading-relaxed">
                      Gör om <span className="text-slate-900 font-black">{task.value} {task.from.symbol}{task.unit}</span> till:
                    </div>
                    <div className="text-2xl font-black text-blue-600 leading-tight">
                      {getFullUnitName(task.to.name, task.unit)}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600/5 rounded-2xl p-4 border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 leading-relaxed">
                    Tips: Klicka på <span className="font-black">{task.to.symbol || 'enhet'}</span> på skalan längst ner!
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-40"
              >
                <Icons.Book size={48} className="text-slate-300" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Klicka på "Ny Utmaning" för att börja träna
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {showHelp && (
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

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none"
          >
            <div className={`px-12 py-6 rounded-full text-4xl font-black text-white shadow-2xl ${showFeedback === 'correct' ? 'bg-emerald-500' : 'bg-red-500'}`}>
              {showFeedback === 'correct' ? 'Snyggt! 🎉' : 'Försök igen! 🧐'}
            </div>
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
            className="absolute top-20 left-1/2 -translate-x-1/2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-50 overflow-hidden"
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
