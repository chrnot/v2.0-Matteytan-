
import React, { useState, useEffect, useMemo } from 'react';
import { Icons } from '../icons';

type Representation = 'CONCRETE' | 'SEMI' | 'ABSTRACT';

interface SideContent {
    boxes: number;
    sticks: number;
}

export const MatchstickRiddleWidget: React.FC = () => {
  // --- STATE ---
  const [level, setLevel] = useState<Representation>('CONCRETE');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isXray, setIsXray] = useState(false);
  
  const [hiddenValue, setHiddenValue] = useState(5);
  const [left, setLeft] = useState<SideContent>({ boxes: 1, sticks: 2 });
  const [right, setRight] = useState<SideContent>({ boxes: 0, sticks: 7 });
  const [celebration, setCelebration] = useState(false);

  // Animation feedback
  const [feedbackSide, setFeedbackSide] = useState<'L' | 'R' | null>(null);

  // --- MATH & PHYSICS ---
  const leftTotal = useMemo(() => (left.boxes * hiddenValue) + left.sticks, [left, hiddenValue]);
  const rightTotal = useMemo(() => (right.boxes * hiddenValue) + right.sticks, [right, hiddenValue]);
  const diff = leftTotal - rightTotal;
  const isBalanced = diff === 0;

  // Calculate tilt angle for the scale
  const tilt = Math.max(-12, Math.min(12, diff * 1.5));

  // --- ACTIONS ---
  const generateRandomRiddle = () => {
    const val = Math.floor(Math.random() * 6) + 3; // 3-8
    setHiddenValue(val);
    setIsRevealed(false);
    setIsXray(false);
    setCelebration(false);
    setFeedbackSide(null);

    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
        const a = Math.floor(Math.random() * 4) + 1;
        setLeft({ boxes: 1, sticks: a });
        setRight({ boxes: 0, sticks: val + a });
    } else if (type === 1) {
        setLeft({ boxes: 2, sticks: 0 });
        setRight({ boxes: 1, sticks: val });
    } else {
        const a = Math.floor(Math.random() * 3) + 1;
        setLeft({ boxes: 2, sticks: a });
        setRight({ boxes: 1, sticks: val + a });
    }
  };

  useEffect(() => {
    generateRandomRiddle();
  }, []);

  const handleItemClick = (side: 'L' | 'R', type: 'BOX' | 'STICK') => {
    if (isRevealed) return;

    // Symmetrisk subtraktion: Finns det av samma typ på båda sidor?
    const canRemoveSymmetrically = type === 'BOX' 
        ? (left.boxes > 0 && right.boxes > 0)
        : (left.sticks > 0 && right.sticks > 0);

    if (canRemoveSymmetrically) {
        setLeft(prev => ({
            ...prev,
            boxes: type === 'BOX' ? Math.max(0, prev.boxes - 1) : prev.boxes,
            sticks: type === 'STICK' ? Math.max(0, prev.sticks - 1) : prev.sticks
        }));
        setRight(prev => ({
            ...prev,
            boxes: type === 'BOX' ? Math.max(0, prev.boxes - 1) : prev.boxes,
            sticks: type === 'STICK' ? Math.max(0, prev.sticks - 1) : prev.sticks
        }));
        
        setFeedbackSide(side === 'L' ? 'R' : 'L');
        setTimeout(() => setFeedbackSide(null), 300);
    } else {
        const setter = side === 'L' ? setLeft : setRight;
        setter(prev => ({
            ...prev,
            boxes: type === 'BOX' ? Math.max(0, prev.boxes - 1) : prev.boxes,
            sticks: type === 'STICK' ? Math.max(0, prev.sticks - 1) : prev.sticks
        }));
    }
  };

  const manipulate = (side: 'L' | 'R', type: 'BOX' | 'STICK', change: number) => {
      const setter = side === 'L' ? setLeft : setRight;
      setter(prev => ({
          ...prev,
          boxes: type === 'BOX' ? Math.max(0, Math.min(5, prev.boxes + change)) : prev.boxes,
          sticks: type === 'STICK' ? Math.max(0, Math.min(20, prev.sticks + change)) : prev.sticks
      }));
  };

  const handleReveal = () => {
      setIsRevealed(true);
      setCelebration(true);
      setTimeout(() => setCelebration(false), 3000);
  };

  const isIsolated = isBalanced && (
      (left.boxes === 1 && left.sticks === 0 && right.boxes === 0) ||
      (right.boxes === 1 && right.sticks === 0 && left.boxes === 0)
  );

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden select-none font-sans relative">
      
      {celebration && (
          <div className="absolute inset-0 pointer-events-none z-[200] overflow-hidden">
              {Array.from({ length: 40 }).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-2 h-2 rounded-full animate-bounce"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `-10px`,
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7'][Math.floor(Math.random() * 5)],
                        animation: `fall ${Math.random() * 2 + 1}s linear infinite`,
                        opacity: Math.random()
                    }}
                  />
              ))}
          </div>
      )}

      {/* 1. HEADER SEKTION */}
      <div className="shrink-0 flex flex-col border-b border-slate-200 bg-slate-50 z-50">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivå:</span>
                <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
                    <button onClick={() => setLevel('CONCRETE')} className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${level === 'CONCRETE' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Konkret</button>
                    <button onClick={() => setLevel('SEMI')} className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${level === 'SEMI' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Semi</button>
                    <button onClick={() => setLevel('ABSTRACT')} className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${level === 'ABSTRACT' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Abstrakt</button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setIsXray(!isXray)} 
                    className={`p-2 rounded-lg border transition-all ${isXray ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-white text-slate-400 hover:text-amber-500'}`} 
                    title="Röntgen"
                >
                    <Icons.Maximize size={18} />
                </button>
                <button 
                    onClick={generateRandomRiddle} 
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                >
                    <Icons.Reset size={16} /> NY GÅTA
                </button>
            </div>
          </div>

          <div className="px-4 pb-4">
              <div className={`p-4 rounded-xl flex gap-4 items-center shadow-sm border transition-all duration-500 ${isRevealed ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-100'}`}>
                <div className={`p-2 rounded-full shadow-sm text-white transition-colors duration-500 ${isRevealed ? 'bg-green-500' : 'bg-blue-600'}`}>
                    {isRevealed ? <Icons.Plus size={20} className="rotate-45" /> : <Icons.Book size={20} />}
                </div>
                <div className="text-sm leading-tight flex-1">
                    {isRevealed ? (
                        <p className="font-black text-lg text-green-700">Gåtan är löst! Varje ask har <span className="underline decoration-4 decoration-green-300 underline-offset-4">{hiddenValue}</span> stickor.</p>
                    ) : isIsolated ? (
                        <p className="font-bold text-blue-800 text-lg animate-bounce">Snyggt! Klicka på asken för att se vad som finns inuti.</p>
                    ) : (
                        <p className="italic text-slate-600 font-medium text-base">"Ta bort samma sak från båda sidor för att isolera asken!"</p>
                    )}
                </div>
              </div>
          </div>
      </div>

      {/* 3. ARBETSYTA (VÅGEN) */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-6 bg-slate-50/30 overflow-hidden min-h-[350px]">
          
          <div className="absolute top-4 right-4 z-[100]">
               <div className={`p-4 rounded-2xl border-2 shadow-lg transition-all duration-500 flex flex-col items-center gap-1 min-w-[110px] ${isBalanced ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-50 border-red-200 text-red-500 animate-pulse'}`}>
                    {isBalanced ? <Icons.Scale size={32} /> : <Icons.Graph size={32} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{isBalanced ? 'Jämvikt' : 'Obalans'}</span>
                    <span className="text-2xl font-black">{isBalanced ? '=' : '≠'}</span>
               </div>
          </div>

          <div className="w-full max-w-[700px] relative mt-16">
              <div 
                className="w-full h-4 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full relative transition-transform duration-1000 ease-in-out flex shadow-xl z-40"
                style={{ transform: `rotate(${tilt}deg)` }}
              >
                  {/* Vänster vågskål */}
                  <div 
                    className="absolute -top-[200px] left-4 w-[42%] h-[200px] flex flex-col justify-end items-center transition-transform duration-1000 origin-top z-40"
                    style={{ transform: `rotate(${-tilt}deg)` }}
                  >
                      <div className={`flex-1 flex flex-wrap justify-center content-end gap-3 p-4 w-full max-h-[180px] overflow-visible pb-2 transition-opacity ${feedbackSide === 'L' ? 'opacity-30' : 'opacity-100'}`}>
                          {Array.from({ length: left.boxes }).map((_, i) => (
                            <Matchbox 
                                key={`l-b-${i}`} 
                                level={level}
                                isTarget={isIsolated && !isRevealed}
                                isRevealed={isRevealed}
                                isXray={isXray}
                                hiddenValue={hiddenValue}
                                onClick={() => handleItemClick('L', 'BOX')}
                                onReveal={handleReveal}
                            />
                          ))}
                          <div className="w-full flex flex-wrap justify-center gap-2 items-end">
                            {level === 'ABSTRACT' && left.sticks > 0 ? (
                                <span onClick={() => handleItemClick('L', 'STICK')} className="text-7xl font-black text-slate-300 cursor-pointer hover:text-blue-600 transition-colors z-50">{left.sticks}</span>
                            ) : (
                                Array.from({ length: left.sticks }).map((_, i) => (
                                    <Matchstick 
                                        key={`l-s-${i}`} 
                                        level={level}
                                        onClick={() => handleItemClick('L', 'STICK')} 
                                    />
                                ))
                            )}
                          </div>
                      </div>
                      <div className={`w-full h-6 rounded-b-[50px] border-b-[10px] shadow-2xl transition-colors duration-500 ${isBalanced ? 'bg-slate-200 border-slate-400' : 'bg-slate-300 border-slate-500'}`} />
                      
                      {/* Kontroller Vänster */}
                      <div className="absolute -bottom-12 flex gap-1">
                          <button onClick={() => manipulate('L', 'BOX', 1)} className="p-1 bg-white border rounded text-[9px] font-bold text-blue-600 shadow-sm">+X</button>
                          <button onClick={() => manipulate('L', 'STICK', 1)} className="p-1 bg-white border rounded text-[9px] font-bold text-slate-600 shadow-sm">+1</button>
                          <button onClick={() => manipulate('L', 'BOX', -1)} className="p-1 bg-white border rounded text-[9px] font-bold text-red-400 shadow-sm">-X</button>
                          <button onClick={() => manipulate('L', 'STICK', -1)} className="p-1 bg-white border rounded text-[9px] font-bold text-red-400 shadow-sm">-1</button>
                      </div>
                  </div>

                  {/* Höger vågskål */}
                  <div 
                    className="absolute -top-[200px] right-4 w-[42%] h-[200px] flex flex-col justify-end items-center transition-transform duration-1000 origin-top z-40"
                    style={{ transform: `rotate(${-tilt}deg)` }}
                  >
                      <div className={`flex-1 flex flex-wrap justify-center content-end gap-3 p-4 w-full max-h-[180px] overflow-visible pb-2 transition-opacity ${feedbackSide === 'R' ? 'opacity-30' : 'opacity-100'}`}>
                          {Array.from({ length: right.boxes }).map((_, i) => (
                             <Matchbox 
                                key={`r-b-${i}`} 
                                level={level}
                                isTarget={isIsolated && !isRevealed}
                                isRevealed={isRevealed}
                                isXray={isXray}
                                hiddenValue={hiddenValue}
                                onClick={() => handleItemClick('R', 'BOX')}
                                onReveal={handleReveal}
                             />
                          ))}
                          <div className="w-full flex flex-wrap justify-center gap-2 items-end">
                            {level === 'ABSTRACT' && right.sticks > 0 ? (
                                <span onClick={() => handleItemClick('R', 'STICK')} className="text-7xl font-black text-slate-300 cursor-pointer hover:text-blue-600 transition-colors z-50">{right.sticks}</span>
                            ) : (
                                Array.from({ length: right.sticks }).map((_, i) => (
                                    <Matchstick 
                                        key={`r-s-${i}`} 
                                        level={level}
                                        onClick={() => handleItemClick('R', 'STICK')} 
                                    />
                                ))
                            )}
                          </div>
                      </div>
                      <div className={`w-full h-6 rounded-b-[50px] border-b-[10px] shadow-2xl transition-colors duration-500 ${isBalanced ? 'bg-slate-200 border-slate-400' : 'bg-slate-300 border-slate-500'}`} />
                      
                      {/* Kontroller Höger */}
                      <div className="absolute -bottom-12 flex gap-1">
                          <button onClick={() => manipulate('R', 'BOX', 1)} className="p-1 bg-white border rounded text-[9px] font-bold text-blue-600 shadow-sm">+X</button>
                          <button onClick={() => manipulate('R', 'STICK', 1)} className="p-1 bg-white border rounded text-[9px] font-bold text-slate-600 shadow-sm">+1</button>
                          <button onClick={() => manipulate('R', 'BOX', -1)} className="p-1 bg-white border rounded text-[9px] font-bold text-red-400 shadow-sm">-X</button>
                          <button onClick={() => manipulate('R', 'STICK', -1)} className="p-1 bg-white border rounded text-[9px] font-bold text-red-400 shadow-sm">-1</button>
                      </div>
                  </div>
              </div>

              <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-8 h-64 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 border-x-2 border-slate-400/30 -z-10 rounded-t-full shadow-inner" />
              <div className="absolute top-[260px] left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-600 rounded-full shadow-2xl -z-10" />
          </div>
      </div>

      {/* 4. MATEMATISK FOOTER */}
      <div className="p-6 bg-slate-100 border-t border-slate-200 shrink-0 z-50">
          <div className="flex flex-col items-center gap-4">
              <div className={`flex items-center gap-8 px-14 py-6 rounded-[32px] shadow-xl border-4 font-mono text-4xl font-black transition-all duration-500 ${isBalanced ? 'bg-white border-blue-400 scale-105' : 'bg-white/50 border-slate-200 opacity-60'}`}>
                  <div className={`${isBalanced ? 'text-blue-600' : 'text-slate-400'}`}>
                    {left.boxes > 0 ? `${left.boxes === 1 ? '' : left.boxes}x` : ''}
                    {left.boxes > 0 && left.sticks > 0 ? ' + ' : ''}
                    {left.sticks > 0 || (left.boxes === 0) ? left.sticks : ''}
                  </div>
                  <div className={`text-5xl transition-colors duration-500 ${isBalanced ? 'text-green-500' : 'text-slate-300'}`}>
                    {isBalanced ? '=' : '≠'}
                  </div>
                  <div className={`${isBalanced ? 'text-blue-600' : 'text-slate-400'}`}>
                    {right.boxes > 0 ? `${right.boxes === 1 ? '' : right.boxes}x` : ''}
                    {right.boxes > 0 && right.sticks > 0 ? ' + ' : ''}
                    {right.sticks > 0 || (right.boxes === 0) ? right.sticks : ''}
                  </div>
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em] text-center">
                Klicka på askar eller stickor för symmetrisk borttagning
              </p>
          </div>
      </div>

      <style>{`
        @keyframes fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const Matchbox: React.FC<{
    level: Representation;
    isTarget: boolean;
    isRevealed: boolean;
    isXray: boolean;
    hiddenValue: number;
    onClick: () => void;
    onReveal: () => void;
}> = ({ level, isTarget, isRevealed, isXray, hiddenValue, onClick, onReveal }) => {
    return (
        <div 
            onClick={() => isTarget ? onReveal() : onClick()}
            className={`
                relative w-24 h-14 rounded-lg border-2 transition-all duration-300 cursor-pointer flex items-center justify-center group overflow-hidden z-[60]
                ${level === 'SEMI' ? 'bg-white border-slate-300' : 'bg-[#7a5230] border-[#4a2e1a] shadow-md hover:brightness-110 active:scale-95'}
                ${isTarget ? 'ring-4 ring-yellow-400 animate-pulse shadow-[0_0_20px_rgba(234,179,8,1)] scale-110' : ''}
                ${isRevealed ? 'scale-110 shadow-2xl border-green-500' : ''}
            `}
        >
            {level === 'CONCRETE' && !isRevealed && !isXray && (
                <div className="absolute inset-1 bg-[#f3e3cc] border border-[#5d3a1a]/30 rounded-sm flex items-center justify-center shadow-inner overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,_#000_0,_#000_1px,_transparent_0,_transparent_4px)]"></div>
                    <div className="w-12 h-8 bg-blue-600 rounded-full flex items-center justify-center relative border-2 border-yellow-400">
                        <div className="w-6 h-6 bg-yellow-400 rounded-full blur-[2px] opacity-60 animate-pulse"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#4a2e1a] opacity-50"></div>
                </div>
            )}

            {(isRevealed || isXray) && (
                <div className={`absolute inset-0 bg-white/95 rounded-lg flex flex-wrap gap-0.5 p-2 items-center justify-center animate-in zoom-in duration-500 z-10 border-2 ${isRevealed ? 'border-green-400' : 'border-slate-200'}`}>
                    {Array.from({ length: hiddenValue }).map((_, i) => (
                        <div key={i} className="w-1 h-10 bg-[#e3c49a] border-t-4 border-red-600 rounded-sm shadow-sm" />
                    ))}
                </div>
            )}
        </div>
    );
};

const Matchstick: React.FC<{
    level: Representation;
    onClick: () => void;
}> = ({ level, onClick }) => (
    <div 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`w-4 h-16 flex items-center justify-center cursor-pointer group z-[60]`}
    >
        <div 
            className={`w-2 h-14 bg-[#e3c49a] rounded-sm relative shadow-sm border-t-4 border-red-600 transition-all group-hover:scale-125 group-active:scale-90 ${level === 'SEMI' ? 'opacity-30' : ''}`}
        >
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm" />
        </div>
    </div>
);
