import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../icons';

const PI_DIGITS = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989";

const DIGIT_COLORS: Record<string, string> = {
  '0': 'bg-slate-200 text-slate-800',
  '1': 'bg-red-500 text-white',
  '2': 'bg-blue-500 text-white',
  '3': 'bg-green-500 text-white',
  '4': 'bg-yellow-400 text-yellow-900',
  '5': 'bg-purple-500 text-white',
  '6': 'bg-pink-500 text-white',
  '7': 'bg-orange-500 text-white',
  '8': 'bg-teal-500 text-white',
  '9': 'bg-indigo-500 text-white',
};

const NOTES: Record<string, number> = {
  '0': 261.63, // C4
  '1': 293.66, // D4
  '2': 329.63, // E4
  '3': 349.23, // F4
  '4': 392.00, // G4
  '5': 440.00, // A4
  '6': 493.88, // B4
  '7': 523.25, // C5
  '8': 587.33, // D5
  '9': 659.25, // E5
};

type Mode = 'LEARN' | 'BUILD' | 'ERASE';

export const PiCodeWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mode, setMode] = useState<Mode>('LEARN');
  const [isSynesthesia, setIsSynesthesia] = useState(false);
  const [isMelody, setIsMelody] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<number | null>(null);
  const [highlightedRange, setHighlightedRange] = useState<{ start: number; end: number } | null>(null);
  const [userDigits, setUserDigits] = useState<string>('');
  const [erasedIndices, setErasedIndices] = useState<Set<number>>(new Set());
  const [eraseSlider, setEraseSlider] = useState(0);
  const [classProgress, setClassProgress] = useState(124);
  const [recentContributions, setRecentContributions] = useState<{ id: number; amount: number }[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);

  const playNote = (digit: string) => {
    if (!isMelody) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(NOTES[digit] || 440, ctx.currentTime);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const chunks = useMemo(() => {
    const result = [];
    let i = 0;
    while (i < PI_DIGITS.length) {
      const chunkSize = (i / 3) % 2 === 0 ? 3 : 4;
      result.push({
        text: PI_DIGITS.substring(i, i + chunkSize),
        startIndex: i
      });
      i += chunkSize;
    }
    return result;
  }, []);

  const handleSearch = () => {
    if (!searchQuery) return;
    const index = PI_DIGITS.indexOf(searchQuery);
    setSearchResult(index !== -1 ? index : null);
    
    if (index !== -1) {
      setHighlightedRange({ start: index, end: index + searchQuery.length });
      // Find the chunk that contains the start index
      const chunk = chunks.find(c => index >= c.startIndex && index < c.startIndex + c.text.length);
      if (chunk) {
        const element = document.getElementById(`chunk-${chunk.startIndex}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
      
      // Clear highlight after 5 seconds
      setTimeout(() => setHighlightedRange(null), 5000);
    } else {
      setHighlightedRange(null);
    }
  };

  const contributeToClass = () => {
    if (userDigits.length === 0) return;
    const amount = userDigits.length;
    setClassProgress(prev => Math.min(500, prev + amount));
    const newContrib = { id: Date.now(), amount };
    setRecentContributions(prev => [newContrib, ...prev].slice(0, 3));
    
    // Reset user progress for a new "run"
    setUserDigits('');
  };

  const handleDigitInput = (digit: string) => {
    const nextIndex = userDigits.length;
    if (PI_DIGITS[nextIndex] === digit) {
      setUserDigits(prev => prev + digit);
      playNote(digit);
    } else {
      // Vibration effect handled by CSS/Motion
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'BUILD' && /^\d$/.test(e.key)) {
        handleDigitInput(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, userDigits]);

  const toggleErased = (index: number) => {
    const newSet = new Set(erasedIndices);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setErasedIndices(newSet);
  };

  useEffect(() => {
    const newSet = new Set<number>();
    for (let i = 0; i < eraseSlider; i++) {
      newSet.add(i);
    }
    setErasedIndices(newSet);
  }, [eraseSlider]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[5000] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8"
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
      >
        <Icons.X size={32} />
      </button>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
          PI<span className="text-blue-500">-</span>KODEN
        </h1>
        <p className="text-slate-400 font-medium uppercase tracking-[0.3em] text-xs">
          Bemästra det irrationella
        </p>
      </div>

      {/* Main Display Area */}
      <div className="w-full max-w-6xl bg-slate-800/50 rounded-3xl border border-white/10 p-8 relative overflow-hidden shadow-2xl">
        
        {/* Fixed 3. */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10 flex items-center">
          <div className="text-8xl font-black text-white bg-slate-900 px-4 py-2 rounded-2xl shadow-xl border border-white/10">
            3.
          </div>
          <div className="w-8 h-1 bg-gradient-to-r from-white/20 to-transparent"></div>
        </div>

        {/* Infinity Rail */}
        <div className="ml-32 overflow-x-auto no-scrollbar py-12 flex items-center gap-8 px-12">
          {chunks.map((chunk, chunkIdx) => {
            const isCompleted = mode === 'BUILD' && userDigits.length > chunk.startIndex;
            const isCurrent = mode === 'BUILD' && userDigits.length >= chunk.startIndex && userDigits.length < chunk.startIndex + chunk.text.length;
            
            return (
              <div 
                key={chunk.startIndex} 
                id={`chunk-${chunk.startIndex}`}
                className={`flex gap-2 transition-all duration-500 ${mode === 'BUILD' && !isCompleted && !isCurrent ? 'opacity-20 scale-90 blur-sm' : ''}`}
              >
                {chunk.text.split('').map((digit, digitIdx) => {
                  const globalIdx = chunk.startIndex + digitIdx;
                  const isErased = mode === 'ERASE' && erasedIndices.has(globalIdx);
                  const isUserCorrect = mode === 'BUILD' && globalIdx < userDigits.length;
                  
                  return (
                    <motion.div
                      key={globalIdx}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => mode === 'ERASE' && toggleErased(globalIdx)}
                      className={`
                        w-16 h-20 rounded-xl flex items-center justify-center text-3xl font-black shadow-lg border border-white/5 cursor-pointer relative
                        ${isSynesthesia ? DIGIT_COLORS[digit] : 'bg-slate-700 text-white'}
                        ${isErased ? 'bg-slate-600 !text-transparent' : ''}
                        ${mode === 'BUILD' && !isUserCorrect ? 'bg-slate-800/50 text-slate-600 border-dashed' : ''}
                        ${mode === 'BUILD' && isUserCorrect ? 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-slate-800' : ''}
                        ${highlightedRange && globalIdx >= highlightedRange.start && globalIdx < highlightedRange.end ? 'ring-4 ring-blue-400 ring-offset-4 ring-offset-slate-900 z-20 scale-110 shadow-[0_0_30px_rgba(96,165,250,0.6)]' : ''}
                      `}
                    >
                      {isErased ? '?' : (mode === 'BUILD' ? (isUserCorrect ? digit : '_') : digit)}
                      {highlightedRange && globalIdx === highlightedRange.start && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap font-bold animate-bounce">
                          HÄR! 📍
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls Panel */}
      <div className="mt-12 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Modes */}
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-white/5">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Spellägen</h3>
          <div className="flex flex-col gap-2">
            {[
              { id: 'LEARN', label: 'Inlärning', icon: Icons.Book },
              { id: 'BUILD', label: 'Bygg-läget', icon: Icons.Zap },
              { id: 'ERASE', label: 'Sudda-läget', icon: Icons.Eraser },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as Mode)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${mode === m.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
              >
                <m.icon size={18} />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-white/5">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Minnesverktyg</h3>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setIsSynesthesia(!isSynesthesia)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${isSynesthesia ? 'bg-amber-500 text-white' : 'bg-slate-700/50 text-slate-400'}`}
            >
              <div className="flex items-center gap-3">
                <Icons.Shapes size={18} />
                <span>Synestesi</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${isSynesthesia ? 'bg-white/30' : 'bg-slate-600'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isSynesthesia ? 'left-6' : 'left-1'}`}></div>
              </div>
            </button>

            <button
              onClick={() => setIsMelody(!isMelody)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${isMelody ? 'bg-emerald-500 text-white' : 'bg-slate-700/50 text-slate-400'}`}
            >
              <div className="flex items-center gap-3">
                <Icons.Music size={18} />
                <span>Melodi</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${isMelody ? 'bg-white/30' : 'bg-slate-600'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isMelody ? 'left-6' : 'left-1'}`}></div>
              </div>
            </button>

            {mode === 'ERASE' && (
              <div className="mt-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Suddgummi-styrka</label>
                <input 
                  type="range" 
                  min="0" 
                  max="50" 
                  value={eraseSlider} 
                  onChange={(e) => setEraseSlider(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Search & Fascination */}
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-white/5">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Hitta dig själv</h3>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="T.ex. födelsedag 050412"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleSearch}
                className="absolute right-2 top-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                <Icons.Search size={18} />
              </button>
            </div>
            
            {searchResult !== null ? (
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 text-center animate-in fade-in zoom-in duration-300">
                <p className="text-blue-400 text-xs font-bold uppercase">Hittad på decimal:</p>
                <p className="text-2xl font-black text-white">{searchResult + 1}</p>
                <p className="text-[10px] text-blue-300/60 mt-1 italic">Skärmen har zoomat till platsen!</p>
              </div>
            ) : searchQuery.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                <p className="text-red-400 text-xs font-bold uppercase">Hittades inte...</p>
                <p className="text-[10px] text-red-300/60 mt-1">Prova en annan kombination!</p>
              </div>
            )}

            <div className="mt-auto space-y-3">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Klass-utmaning</span>
                  <span className="text-emerald-500 font-black text-sm">{classProgress}/500</span>
                </div>
                <button 
                  onClick={contributeToClass}
                  disabled={userDigits.length === 0}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${userDigits.length > 0 ? 'bg-emerald-500 text-white hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20' : 'bg-slate-700 text-slate-500 opacity-50 cursor-not-allowed'}`}
                >
                  Bidra ({userDigits.length})
                </button>
              </div>
              
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(classProgress / 500) * 100}%` }}
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
                {/* Milestone Markers */}
                {[100, 250, 400].map(m => (
                  <div 
                    key={m}
                    className="absolute top-0 w-px h-full bg-white/20"
                    style={{ left: `${(m / 500) * 100}%` }}
                  />
                ))}
              </div>

              <div className="flex gap-2 overflow-hidden h-6">
                <AnimatePresence>
                  {recentContributions.map(c => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="text-[9px] font-bold text-emerald-400/60 bg-emerald-500/10 px-2 py-0.5 rounded-full whitespace-nowrap"
                    >
                      +{c.amount} decimaler!
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Taktil Feedback for Build Mode */}
      <AnimatePresence>
        {mode === 'BUILD' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 text-slate-500 font-medium flex items-center gap-2"
          >
            <Icons.Info size={16} />
            <span>Använd tangentbordet för att skriva in nästa siffra</span>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
