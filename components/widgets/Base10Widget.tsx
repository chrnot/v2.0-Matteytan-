
import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';

interface Base10WidgetProps {
  isTransparent?: boolean;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const Base10Widget: React.FC<Base10WidgetProps> = ({ isTransparent }) => {
  const [hundreds, setHundreds] = useState<string[]>([]);
  const [tens, setTens] = useState<string[]>([]);
  const [ones, setOnes] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  
  const totalValue = hundreds.length * 100 + tens.length * 10 + ones.length;
  const [inputValue, setInputValue] = useState(totalValue.toString());

  useEffect(() => {
    setInputValue(totalValue.toString());
  }, [hundreds.length, tens.length, ones.length]);

  const handleInputChange = (val: string) => {
      setInputValue(val);
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 0 && num <= 999) {
          const h = Math.floor(num / 100);
          const t = Math.floor((num % 100) / 10);
          const o = num % 10;
          setHundreds(Array(h).fill('').map(generateId));
          setTens(Array(t).fill('').map(generateId));
          setOnes(Array(o).fill('').map(generateId));
      } else if (val === '') {
          setHundreds([]); setTens([]); setOnes([]);
      }
  };

  const addBlock = (type: 'ONES' | 'TENS' | 'HUNDREDS') => {
      if (type === 'ONES' && ones.length < 100) setOnes(prev => [...prev, generateId()]);
      if (type === 'TENS' && tens.length < 50) setTens(prev => [...prev, generateId()]);
      if (type === 'HUNDREDS' && hundreds.length < 9) setHundreds(prev => [...prev, generateId()]);
  };

  const removeBlock = (type: 'ONES' | 'TENS' | 'HUNDREDS', id: string) => {
      if (type === 'ONES') setOnes(prev => prev.filter(item => item !== id));
      if (type === 'TENS') setTens(prev => prev.filter(item => item !== id));
      if (type === 'HUNDREDS') setHundreds(prev => prev.filter(item => item !== id));
  };

  const groupOnesToTen = () => {
      if (ones.length < 10) return;
      setOnes(prev => prev.slice(10));
      addBlock('TENS');
  };

  const groupTensToHundred = () => {
      if (tens.length < 10) return;
      setTens(prev => prev.slice(10));
      addBlock('HUNDREDS');
  };

  const breakTenToOnes = (id?: string) => {
      const targetId = id || (tens.length > 0 ? tens[tens.length - 1] : null);
      if (!targetId) return;
      setTens(prev => prev.filter(item => item !== targetId));
      const newOnes = Array(10).fill('').map(generateId);
      setOnes(prev => [...prev, ...newOnes]);
  };

  const breakHundredToTens = (id?: string) => {
      const targetId = id || (hundreds.length > 0 ? hundreds[hundreds.length - 1] : null);
      if (!targetId) return;
      setHundreds(prev => prev.filter(item => item !== targetId));
      const newTens = Array(10).fill('').map(generateId);
      setTens(prev => [...prev, ...newTens]);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 select-none relative">
        
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
               <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Bas-klossar</h4>
               <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
            </div>
            <div className="space-y-4 text-xs leading-relaxed text-slate-600">
              <p>Bas-klossar visualiserar hur vårt positionssystem fungerar med ental, tiotal och hundratal.</p>
              <section className="space-y-2">
                <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong>Lägg till:</strong> Använd knapparna under varje kolumn för att lägga till klossar.</li>
                  <li><strong>Växla upp:</strong> När du har 10 av en talsort tänds knappen "Växla till...". Klicka på den för att gruppera dem till nästa storlek.</li>
                  <li><strong>Växla ner:</strong> Klicka direkt på en hundraplatta eller tiostav (eller använd knappen under) för att dela upp den i mindre delar.</li>
                  <li><strong>Värde:</strong> Skriv ett tal i rutan högst upp så placeras rätt mängd klossar ut automatiskt.</li>
                </ul>
              </section>
            </div>
          </div>
        )}

        <div className="flex justify-center items-center mb-1 gap-4 shrink-0 pr-8">
             <div className="bg-white p-2 sm:p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2 sm:gap-4">
                 <span className="text-slate-400 font-bold uppercase text-[10px] sm:text-xs tracking-wider hidden sm:inline">Talets värde:</span>
                 <input 
                    type="number" 
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="text-3xl sm:text-5xl font-black text-slate-800 w-24 sm:w-36 text-center outline-none border-b-2 border-transparent focus:border-blue-500 bg-transparent"
                    placeholder="0"
                 />
             </div>
             <button 
                onClick={() => { setHundreds([]); setTens([]); setOnes([]); }}
                className="bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 p-2 sm:p-3 rounded-xl transition-colors"
             >
                 <Icons.Trash size={20} />
             </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0">
            <div className="flex-1 flex flex-col gap-1 min-h-[120px]">
                <div className="bg-red-100 text-red-800 p-1.5 rounded-t-xl text-center font-bold uppercase tracking-wider text-[10px] sm:text-xs border-b-2 border-red-200">Hundratal (100)</div>
                <div className="flex-1 bg-slate-50/50 border border-slate-200 p-2 sm:p-4 overflow-y-auto relative">
                    <div className="flex flex-wrap content-start gap-1 sm:gap-2 justify-center pb-4">
                        {hundreds.map((id) => (
                            <div key={id} onClick={() => breakHundredToTens(id)} className="w-12 h-12 sm:w-20 sm:h-20 bg-red-500 border border-red-600 shadow-sm rounded-sm cursor-pointer hover:bg-red-400 hover:scale-105 transition-all grid grid-cols-10 grid-rows-10 gap-[1px] group relative overflow-hidden">
                                {Array.from({length:100}).map((_, i) => <div key={i} className="bg-red-700/20 pointer-events-none"></div>)}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 pointer-events-none text-white text-[10px] font-black uppercase">Dela upp</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1.5 bg-white p-2 border border-t-0 border-slate-200 rounded-b-xl">
                    <button onClick={() => addBlock('HUNDREDS')} className="bg-red-500 hover:bg-red-600 text-white font-black py-2.5 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"><Icons.Plus size={16} strokeWidth={3} /> Lägg till 100</button>
                    {hundreds.length > 0 && (
                        <button onClick={() => breakHundredToTens()} className="bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 font-black py-2 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider"><Icons.Rotate size={14} className="-scale-x-100" /> Dela till 10 tiotal</button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-1 min-h-[120px]">
                <div className="bg-blue-100 text-blue-800 p-1.5 rounded-t-xl text-center font-bold uppercase tracking-wider text-[10px] sm:text-xs border-b-2 border-blue-200">Tiotal (10)</div>
                <div className="flex-1 bg-slate-50/50 border border-slate-200 p-2 sm:p-4 overflow-y-auto relative">
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-3 w-fit mx-auto pb-4">
                        {tens.map((id) => (
                            <div key={id} onClick={() => breakTenToOnes(id)} className="w-3 h-12 sm:w-5 sm:h-20 bg-blue-500 border border-blue-600 shadow-sm rounded-sm cursor-pointer hover:bg-blue-400 hover:scale-105 transition-all flex flex-col gap-[1px] p-[1px] group relative">
                                {Array.from({length:10}).map((_, i) => <div key={i} className="flex-1 w-full bg-blue-700/20 pointer-events-none"></div>)}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 pointer-events-none text-white text-[8px] font-black uppercase rotate-90 whitespace-nowrap">Dela upp</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1.5 bg-white p-2 border border-t-0 border-slate-200 rounded-b-xl">
                    <button onClick={() => addBlock('TENS')} className="bg-blue-500 hover:bg-blue-600 text-white font-black py-2.5 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"><Icons.Plus size={16} strokeWidth={3} /> Lägg till 10</button>
                    <div className="grid grid-cols-1 gap-1.5">
                        {tens.length >= 10 && (
                            <button onClick={groupTensToHundred} className="bg-blue-600 text-white py-2 rounded-xl font-black shadow-md animate-pulse hover:bg-blue-700 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider"><Icons.Rotate size={14} /> Växla till 100</button>
                        )}
                        {tens.length > 0 && (
                            <button onClick={() => breakTenToOnes()} className="bg-white border-2 border-blue-100 text-blue-500 hover:bg-red-50 font-black py-2 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider"><Icons.Rotate size={14} className="-scale-x-100" /> Dela till 10 ental</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-1 min-h-[120px]">
                <div className="bg-green-100 text-green-800 p-1.5 rounded-t-xl text-center font-bold uppercase tracking-wider text-[10px] sm:text-xs border-b-2 border-green-200">Ental (1)</div>
                <div className="flex-1 bg-slate-50/50 border border-slate-200 p-2 sm:p-4 overflow-y-auto relative">
                     <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-fit mx-auto pb-4">
                        {ones.map((id) => (
                            <div key={id} onClick={(e) => {e.stopPropagation(); setOnes(prev => prev.filter(item => item !== id));}} className="w-5 h-5 sm:w-7 sm:h-7 bg-green-500 border border-green-600 shadow-sm rounded-sm cursor-pointer hover:bg-red-500 hover:border-red-600 transition-colors flex items-center justify-center group" title="Klicka för att ta bort">
                                <Icons.Close size={10} className="text-white opacity-0 group-hover:opacity-100 pointer-events-none" />
                            </div>
                        ))}
                     </div>
                </div>
                <div className="flex flex-col gap-1.5 bg-white p-2 border border-t-0 border-slate-200 rounded-b-xl">
                    <button onClick={() => addBlock('ONES')} className="bg-green-500 hover:bg-green-600 text-white font-black py-2.5 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"><Icons.Plus size={16} strokeWidth={3} /> Lägg till 1</button>
                    {ones.length >= 10 && (
                        <button onClick={groupOnesToTen} className="bg-blue-600 text-white py-2 rounded-xl font-black shadow-md animate-pulse hover:bg-blue-700 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider"><Icons.Rotate size={14} /> Växla till 10</button>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
