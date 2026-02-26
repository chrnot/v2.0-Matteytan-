
import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';

interface NumberHouseWidgetProps {
  isTransparent?: boolean;
}

type GameMode = 'PART' | 'WHOLE';

export const NumberHouseWidget: React.FC<NumberHouseWidgetProps> = ({ isTransparent }) => {
  const [whole, setWhole] = useState(10);
  const [partA, setPartA] = useState(5);
  const [showDots, setShowDots] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('PART');
  const [showInfo, setShowInfo] = useState(false);
  
  // Visibility States
  const [hiddenA, setHiddenA] = useState(() => Math.random() > 0.5);
  const [hiddenB, setHiddenB] = useState(() => !hiddenA);
  const [hiddenWhole, setHiddenWhole] = useState(false);
  
  // Animation states
  const [animate, setAnimate] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const partB = Math.max(0, whole - partA); // Ensure never negative visually

  const randomize = () => {
      setAnimate(true);
      setIsShuffling(true);
      setHiddenA(true);
      setHiddenB(true);
      setHiddenWhole(true);
      
      setTimeout(() => {
          const newA = Math.floor(Math.random() * (whole + 1));
          setPartA(newA);
          
          setTimeout(() => {
              if (gameMode === 'PART') {
                  const hideFirst = Math.random() > 0.5;
                  setHiddenA(hideFirst);
                  setHiddenB(!hideFirst);
                  setHiddenWhole(false);
              } else {
                  setHiddenA(false);
                  setHiddenB(false);
                  setHiddenWhole(true);
              }
              setIsShuffling(false);
              setAnimate(false); 
          }, 100);
      }, 600);
  };

  useEffect(() => {
      if (partA > whole) setPartA(whole);
  }, [whole, partA]);

  const DotGrid = ({ count, color }: { count: number, color: string }) => {
      let dotSize = 'w-3 h-3';
      let gap = 'gap-1';
      if (count <= 5) { dotSize = 'w-8 h-8 sm:w-10 sm:h-10'; gap = 'gap-3'; }
      else if (count <= 15) { dotSize = 'w-5 h-5 sm:w-6 sm:h-6'; gap = 'gap-2'; }
      else if (count <= 25) { dotSize = 'w-3 h-3 sm:w-4 sm:h-4'; gap = 'gap-1.5'; }
      return (
        <div className={`flex flex-wrap justify-center content-center ${gap} w-full h-full p-4 overflow-hidden`}>
            {Array.from({length: count}).map((_, i) => (
                <div key={i} className={`${dotSize} rounded-full shadow-sm ${color} border border-black/10 transition-all duration-300`}></div>
            ))}
        </div>
      );
  };

  return (
    <div className="w-[350px] flex flex-col gap-4 relative">
        {/* Info Button */}
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className={`absolute top-0 right-0 p-2 rounded-full transition-all z-[110] ${showInfo ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
        >
          <Icons.Info size={20} />
        </button>

        {/* Info Modal */}
        {showInfo && (
          <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-[120] animate-in fade-in slide-in-from-top-2 duration-300 text-left">
            <div className="flex justify-between items-start mb-3">
               <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Tal-huset</h4>
               <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
            </div>
            <div className="space-y-4 text-xs leading-relaxed text-slate-600">
              <p>Tal-huset visualiserar hur ett tal (taket) kan delas upp i två delar (fönstren). Detta är grunden för att förstå addition och talkamrater.</p>
              <section className="space-y-2">
                <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong>Taket:</strong> Ändra talet i taket för att välja vilket tal ni jobbar med (t.ex. 10 för tiokompisar).</li>
                  <li><strong>Göm Del:</strong> Datorn visar taket och ett fönster. Gissa vad som gömmer sig i det andra fönstret!</li>
                  <li><strong>Göm Tak:</strong> Datorn visar båda delarna. Vad blir summan i taket?</li>
                  <li><strong>Punkter:</strong> Slå på "•••" för att se mängden som prickar istället för siffror.</li>
                </ul>
              </section>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 pr-10">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Taket:</span>
                    <input 
                        type="number" 
                        min="1" max="99" 
                        value={whole} 
                        onChange={e => setWhole(Math.max(1, Number(e.target.value)))}
                        className="w-14 text-center font-bold border rounded px-1 py-0.5 bg-white focus:ring-2 ring-blue-200 outline-none transition-shadow"
                    />
                </div>
                <button 
                    onClick={() => setShowDots(!showDots)} 
                    className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all shadow-sm ${showDots ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}
                >
                    {showDots ? '123' : '•••'}
                </button>
            </div>
            <div className="flex bg-slate-200 p-1 rounded-md">
                <button onClick={() => setGameMode('PART')} className={`flex-1 py-1 text-[10px] font-bold uppercase rounded tracking-wide transition-all ${gameMode === 'PART' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Göm Del</button>
                <button onClick={() => setGameMode('WHOLE')} className={`flex-1 py-1 text-[10px] font-bold uppercase rounded tracking-wide transition-all ${gameMode === 'WHOLE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Göm Tak</button>
            </div>
        </div>

        {/* The House */}
        <div className="relative w-full aspect-[3/4] max-h-[400px]">
            <div className="absolute top-0 w-full h-[35%] bg-red-500 rounded-t-full shadow-lg z-10 flex items-center justify-center text-white relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-600/20 pointer-events-none"></div>
                 <div className={`absolute inset-0 z-20 bg-slate-700 flex items-center justify-center transition-transform duration-500 ease-in-out cursor-pointer ${hiddenWhole ? 'translate-y-0' : '-translate-y-full'}`} onClick={() => !isShuffling && setHiddenWhole(false)}>
                     <div className="flex flex-col items-center gap-2"><Icons.Cube size={32} className="text-slate-500 opacity-50"/><span className="text-slate-400 font-bold text-xs uppercase tracking-widest">?</span></div>
                 </div>
                 <div className={`text-7xl font-black drop-shadow-md select-none transition-all duration-300 ${animate || isShuffling ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>{whole}</div>
                 <button onClick={(e) => { e.stopPropagation(); setHiddenWhole(true); }} className="absolute bottom-2 right-4 opacity-0 group-hover:opacity-100 p-1.5 bg-white/20 hover:bg-white/40 rounded text-white transition-opacity z-10" disabled={isShuffling}><Icons.Minimize size={14}/></button>
            </div>
            <div className="absolute bottom-0 w-[90%] left-[5%] h-[70%] bg-amber-50 border-x-4 border-b-4 border-slate-300 shadow-xl flex gap-2 p-3">
                <div className="flex-1 bg-white border-4 border-blue-200 rounded-lg relative overflow-hidden shadow-inner group">
                    <div className={`absolute inset-0 z-20 bg-slate-700 flex items-center justify-center transition-transform duration-500 ease-in-out cursor-pointer ${hiddenA ? 'translate-y-0' : '-translate-y-full'}`} onClick={() => !isShuffling && setHiddenA(false)}>
                         <div className="flex flex-col items-center gap-2"><Icons.Cube size={32} className="text-slate-500 opacity-50"/><span className="text-slate-400 font-bold text-xs uppercase tracking-widest">?</span></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center select-none">
                        {showDots ? <div className={`transition-all duration-300 ${animate || isShuffling ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} w-full h-full`}><DotGrid count={partA} color="bg-blue-500" /></div> : <span className={`text-6xl font-bold text-blue-600 transition-all duration-300 ${animate || isShuffling ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>{partA}</span>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setHiddenA(true); }} className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-500 transition-opacity z-10" disabled={isShuffling}><Icons.Minimize size={14}/></button>
                </div>
                <div className="w-1.5 h-full bg-slate-200 rounded-full"></div>
                <div className="flex-1 bg-white border-4 border-green-200 rounded-lg relative overflow-hidden shadow-inner group">
                    <div className={`absolute inset-0 z-20 bg-slate-700 flex items-center justify-center transition-transform duration-500 ease-in-out cursor-pointer ${hiddenB ? 'translate-y-0' : '-translate-y-full'}`} onClick={() => !isShuffling && setHiddenB(false)}>
                        <div className="flex flex-col items-center gap-2"><Icons.Cube size={32} className="text-slate-500 opacity-50"/><span className="text-slate-400 font-bold text-xs uppercase tracking-widest">?</span></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center select-none">
                        {showDots ? <div className={`transition-all duration-300 ${animate || isShuffling ? 'opacity-0 scale-75' : 'opacity-100 scale-100'} w-full h-full`}><DotGrid count={partB} color="bg-green-500" /></div> : <span className={`text-6xl font-bold text-green-600 transition-all duration-300 ${animate || isShuffling ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>{partB}</span>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setHiddenB(true); }} className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-500 transition-opacity z-10" disabled={isShuffling}><Icons.Minimize size={14}/></button>
                </div>
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-30 w-full flex justify-center">
                <button onClick={randomize} disabled={isShuffling} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-black text-lg shadow-xl hover:bg-blue-500 active:scale-95 transition-all border-4 border-white hover:border-blue-100 disabled:opacity-70 disabled:cursor-not-allowed">
                    <Icons.Reset size={20} className={isShuffling ? 'animate-spin' : ''} /> {isShuffling ? 'BLANDAR...' : 'NYTT TAL'}
                </button>
            </div>
        </div>
    </div>
  );
};
