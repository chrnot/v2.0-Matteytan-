
import React, { useState } from 'react';
import { Icons } from '../icons';

interface NumberBeadsWidgetProps {
  isTransparent?: boolean;
}

type Tab = 'COUNT' | 'ADD' | 'SUB';

export const NumberBeadsWidget: React.FC<NumberBeadsWidgetProps> = ({ isTransparent }) => {
  const [activeTab, setActiveTab] = useState<Tab>('COUNT');
  const [showInfo, setShowInfo] = useState(false);
  
  // States for different modes
  const [countVal, setCountVal] = useState(0);
  
  const [addA, setAddA] = useState(5);
  const [addB, setAddB] = useState(3);
  
  const [subTotal, setSubTotal] = useState(10);
  const [subTake, setSubTake] = useState(3);

  // Clothespin feature
  const [clothespinPos, setClothespinPos] = useState<number | null>(null);
  const [isClothespinMode, setIsClothespinMode] = useState(false);

  // Constants
  const MAX_BEADS = 20;

  // Helper to determine bead visual properties
  const getBeadStyle = (index: number) => {
    // 1-based index for logic
    const i = index + 1;
    
    let isActive = false;
    let colorStart = '#94a3b8'; // default slate
    let colorEnd = '#475569';
    let isCrossed = false;

    // Logic based on mode
    if (activeTab === 'COUNT') {
        isActive = i <= countVal;
        // Standard pedagogical 5-grouping for counting
        const isRedGroup = (i <= 5) || (i > 10 && i <= 15);
        colorStart = isRedGroup ? '#ef4444' : '#3b82f6'; // red-500 : blue-500
        colorEnd = isRedGroup ? '#991b1b' : '#1e3a8a';   // red-800 : blue-900
    } else if (activeTab === 'ADD') {
        isActive = i <= (addA + addB);
        if (i <= addA) {
            // Term 1: Always Blue
            colorStart = '#3b82f6';
            colorEnd = '#1e3a8a';
        } else if (i <= addA + addB) {
            // Term 2: Always Green
            colorStart = '#22c55e';
            colorEnd = '#14532d';
        }
    } else if (activeTab === 'SUB') {
        isActive = i <= subTotal;
        if (i <= (subTotal - subTake)) {
            // Remaining part (Result): Blue
            colorStart = '#3b82f6';
            colorEnd = '#1e3a8a';
        } else if (i <= subTotal) {
            // Subtracted part (Term 2): Red
            colorStart = '#ef4444';
            colorEnd = '#991b1b';
            isCrossed = true;
        }
    }

    return {
      style: {
        background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, ${colorStart} 25%, ${colorEnd} 100%)`,
        opacity: isActive ? 1 : 0.2,
        transform: isActive ? 'scale(1)' : 'scale(0.85)',
        boxShadow: isActive ? '0 4px 8px rgba(0,0,0,0.3)' : 'none'
      },
      isSubtracted: isCrossed,
      isActive
    };
  };

  const handleBeadClick = (index: number) => {
      if (isClothespinMode) {
          setClothespinPos(index);
      } else if (activeTab === 'COUNT') {
          setCountVal(index + 1);
      }
  };

  return (
    <div className="w-full max-w-[900px] flex flex-col gap-4 select-none p-2 sm:p-4 relative">
      
      {/* Info Button */}
      <button 
        onClick={() => setShowInfo(!showInfo)}
        className={`absolute top-0 right-0 p-2 rounded-full transition-all z-50 ${showInfo ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
        title="Information"
      >
        <Icons.Info size={20} />
      </button>

      {/* Info Modal / Popup */}
      {showInfo && (
        <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-start mb-3">
             <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Pärlbandet</h4>
             <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <p>
              Pärlbandet är ett klassiskt konkret läromedel som visualiserar talmönster och räkneprocesser genom färgkodade grupper om fem.
            </p>
            <section className="space-y-2">
              <h5 className="font-black text-blue-600 uppercase text-[10px]">Så använder du det:</h5>
              <ul className="space-y-1.5 list-disc pl-4">
                <li><strong>Räkna:</strong> Klicka på en pärla för att markera ett antal. Perfekt för att öva talkamrater.</li>
                <li><strong>Räknesätt:</strong> Använd reglagen i Addition/Subtraktion för att visa termer i olika färger.</li>
                <li><strong>Klädnypa:</strong> Markera en plats utan att tända pärlorna. Utmana klassen: "Vilket tal pekar nypan på?"</li>
              </ul>
            </section>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mx-auto mb-1 border border-slate-200 shrink-0">
          <button 
            onClick={() => setActiveTab('COUNT')} 
            className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'COUNT' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Räkna
          </button>
          <button 
            onClick={() => setActiveTab('ADD')} 
            className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'ADD' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Addition (+)
          </button>
          <button 
            onClick={() => setActiveTab('SUB')} 
            className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'SUB' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Subtraktion (-)
          </button>
      </div>

      {/* Main Display (Number or Equation) */}
      <div className="flex justify-center mb-1 shrink-0">
        <div className="bg-white border-4 border-slate-100 rounded-[2.5rem] min-w-[12rem] px-12 h-24 sm:h-28 flex items-center justify-center shadow-xl">
           {activeTab === 'COUNT' && (
               <span className="text-6xl sm:text-7xl font-black text-slate-800 tabular-nums animate-in zoom-in duration-300">{countVal}</span>
           )}
           {activeTab === 'ADD' && (
               <div className="flex items-center gap-4 text-5xl sm:text-6xl font-black animate-in slide-in-from-bottom-2 duration-300">
                   <span className="text-blue-600 tabular-nums">{addA}</span>
                   <span className="text-slate-300">+</span>
                   <span className="text-green-600 tabular-nums">{addB}</span>
                   <span className="text-slate-300">=</span>
                   <span className="text-slate-800 tabular-nums">{addA + addB}</span>
               </div>
           )}
           {activeTab === 'SUB' && (
               <div className="flex items-center gap-4 text-5xl sm:text-6xl font-black animate-in slide-in-from-bottom-2 duration-300">
                   <span className="text-blue-600 tabular-nums">{subTotal}</span>
                   <span className="text-slate-300">-</span>
                   <span className="text-red-500 tabular-nums">{subTake}</span>
                   <span className="text-slate-300">=</span>
                   <span className="text-slate-800 tabular-nums">{subTotal - subTake}</span>
               </div>
           )}
        </div>
      </div>

      {/* Beads Container */}
      <div className="relative h-40 sm:h-48 flex items-center justify-center w-full px-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-inner">
          <div className="absolute top-1/2 left-8 right-8 h-2 bg-slate-800 rounded-full -translate-y-1/2 z-0 shadow-sm border-y border-white/10"></div>
          
          <div className="relative z-10 grid grid-cols-[repeat(20,minmax(0,1fr))] w-full h-full">
            {Array.from({ length: MAX_BEADS }).map((_, index) => {
               const { style, isSubtracted } = getBeadStyle(index);
               const hasPin = clothespinPos === index;
               return (
                <div 
                    key={index}
                    onClick={() => handleBeadClick(index)}
                    className="relative flex items-center justify-center group cursor-pointer"
                >
                    <div className={`absolute inset-y-2 inset-x-0.5 rounded-2xl transition-colors duration-200 ${isClothespinMode ? 'group-hover:bg-amber-400/10' : activeTab === 'COUNT' ? 'group-hover:bg-blue-400/5' : ''}`} />

                    <div 
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-full transition-all duration-300 relative flex items-center justify-center z-10"
                        style={style}
                    >
                        {isSubtracted && (
                            <Icons.X className="text-white drop-shadow-md w-5 h-5 sm:w-6 sm:h-6 opacity-80" strokeWidth={5} />
                        )}
                    </div>

                    {hasPin && (
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 animate-in slide-in-from-top-4 duration-300 flex flex-col items-center z-20 pointer-events-none">
                            <div className="bg-amber-100 border-4 border-amber-600 w-4 h-12 sm:w-5 sm:h-14 rounded-md shadow-xl relative">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-amber-600/30"></div>
                            </div>
                            <div className="text-[10px] sm:text-xs font-black text-amber-800 bg-white px-2 py-0.5 rounded-lg shadow-2xl border-2 border-amber-400 -mt-2 scale-110 ring-2 ring-white">?</div>
                        </div>
                    )}
                </div>
               );
            })}
          </div>
      </div>

      {/* Controls Area */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200 flex flex-col gap-4 sm:gap-6 shrink-0 shadow-sm">
          
          <div className="flex justify-between items-center px-2">
              <button 
                onClick={() => {
                    setIsClothespinMode(!isClothespinMode);
                    if (!isClothespinMode && clothespinPos === null) setClothespinPos(0);
                }}
                className={`flex items-center gap-2 sm:gap-3 px-6 py-3 rounded-[2rem] font-black text-xs sm:text-sm uppercase tracking-widest transition-all shadow-xl ${isClothespinMode ? 'bg-amber-500 text-white ring-4 sm:ring-8 ring-amber-100 scale-105' : 'bg-white border-2 border-slate-100 text-slate-600 hover:border-amber-200 hover:text-amber-600 active:scale-95'}`}
              >
                  <Icons.Tools size={18} className={isClothespinMode ? 'animate-spin-slow' : ''} />
                  {isClothespinMode ? 'Sätt ut klädnypa...' : 'Använd klädnypa'}
              </button>

              {clothespinPos !== null && (
                  <button 
                    onClick={() => { setClothespinPos(null); setIsClothespinMode(false); }}
                    className="text-[10px] sm:text-xs font-black text-red-500 hover:bg-red-50 px-4 py-2 rounded-2xl uppercase tracking-widest transition-all"
                  >
                      <Icons.Trash size={14} className="inline mr-1" />
                      Ta bort
                  </button>
              )}
          </div>

          {/* COUNT CONTROLS */}
          {activeTab === 'COUNT' && (
              <div className={`transition-all duration-300 px-2 ${isClothespinMode ? 'opacity-20 pointer-events-none scale-95' : 'opacity-100'}`}>
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-1.5">
                    <span>0</span>
                    <span>10</span>
                    <span>20</span>
                </div>
                <input 
                    type="range" min="0" max="20" 
                    value={countVal}
                    onChange={(e) => setCountVal(Number(e.target.value))}
                    className="w-full h-3 sm:h-4 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
              </div>
          )}

          {/* ADDITION CONTROLS */}
          {activeTab === 'ADD' && (
              <div className={`grid grid-cols-2 gap-8 sm:gap-12 px-2 transition-all duration-300 ${isClothespinMode ? 'opacity-20 pointer-events-none scale-95' : 'opacity-100'}`}>
                  <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Blå (Term 1)</label>
                      <input 
                        type="range" min="0" max="20" 
                        value={addA}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setAddA(val);
                            if (val + addB > 20) setAddB(20 - val);
                        }}
                        className="w-full h-3 sm:h-4 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                      />
                  </div>
                  <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black text-green-600 uppercase tracking-wider">Grön (Term 2)</label>
                      <input 
                        type="range" min="0" max={20 - addA} 
                        value={addB}
                        onChange={(e) => setAddB(Number(e.target.value))}
                        className="w-full h-3 sm:h-4 bg-green-100 rounded-full appearance-none cursor-pointer accent-green-600"
                      />
                  </div>
              </div>
          )}

          {/* SUBTRACTION CONTROLS */}
          {activeTab === 'SUB' && (
               <div className={`grid grid-cols-2 gap-8 sm:gap-12 px-2 transition-all duration-300 ${isClothespinMode ? 'opacity-20 pointer-events-none scale-95' : 'opacity-100'}`}>
                  <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black text-blue-600 uppercase tracking-wider">Hela antalet</label>
                      <input 
                        type="range" min="0" max="20" 
                        value={subTotal}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setSubTotal(val);
                            if (subTake > val) setSubTake(val);
                        }}
                        className="w-full h-3 sm:h-4 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                      />
                  </div>
                  <div className="flex flex-col gap-2">
                      <label className="text-[9px] font-black text-red-500 uppercase tracking-wider">Dra bort (Röd)</label>
                      <input 
                        type="range" min="0" max={subTotal} 
                        value={subTake}
                        onChange={(e) => setSubTake(Number(e.target.value))}
                        className="w-full h-3 sm:h-4 bg-red-100 rounded-full appearance-none cursor-pointer accent-red-500"
                      />
                  </div>
              </div>
          )}
          
          <div className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-50">
              {isClothespinMode 
                ? 'Klicka direkt på en pärla' 
                : activeTab === 'COUNT' ? 'Klicka på pärlorna eller dra i reglaget' : 'Justera reglagen för att bygga uppgiften'}
          </div>
      </div>

    </div>
  );
};
