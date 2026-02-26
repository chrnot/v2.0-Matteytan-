
import React, { useState, useRef } from 'react';
import { Icons } from '../icons';

interface FractionBarsWidgetProps {
  isTransparent?: boolean;
}

interface FractionBar {
  id: string;
  denominator: number;
  activeCount: number;
}

const getBarColor = (den: number) => {
    switch(den) {
        case 1: return { bg: 'bg-red-500', border: 'border-red-600', text: 'text-white' };
        case 2: return { bg: 'bg-pink-400', border: 'border-pink-500', text: 'text-white' };
        case 3: return { bg: 'bg-orange-400', border: 'border-orange-500', text: 'text-white' };
        case 4: return { bg: 'bg-yellow-300', border: 'border-yellow-400', text: 'text-yellow-900' };
        case 5: return { bg: 'bg-green-500', border: 'border-green-600', text: 'text-white' };
        case 6: return { bg: 'bg-teal-400', border: 'border-teal-500', text: 'text-white' };
        case 7: return { bg: 'bg-indigo-400', border: 'border-indigo-500', text: 'text-white' };
        case 8: return { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white' };
        case 9: return { bg: 'bg-fuchsia-400', border: 'border-fuchsia-500', text: 'text-white' };
        case 10: return { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-white' };
        case 12: return { bg: 'bg-slate-500', border: 'border-slate-600', text: 'text-white' };
        default: return { bg: 'bg-slate-400', border: 'border-slate-500', text: 'text-white' };
    }
};

const PRESETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];

export const FractionBarsWidget: React.FC<FractionBarsWidgetProps> = ({ isTransparent }) => {
  const [bars, setBars] = useState<FractionBar[]>([
      { id: 'init-1', denominator: 2, activeCount: 1 },
      { id: 'init-2', denominator: 4, activeCount: 2 }
  ]);
  const [customNum, setCustomNum] = useState(3);
  const [customDen, setCustomDen] = useState(7);
  const [showLabels, setShowLabels] = useState(true);
  const [rulerX, setRulerX] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const addBar = (den: number, num?: number) => {
      setBars(prev => [...prev, { id: Date.now().toString() + Math.random(), denominator: den, activeCount: num ?? den }]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setRulerX(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 bg-white select-none relative">
        
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
               <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Bråkstavar</h4>
               <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
            </div>
            <div className="space-y-4 text-xs leading-relaxed text-slate-600">
              <p>Bråkstavar används för att visualisera storleken på olika bråk och hitta likvärdiga bråk.</p>
              <section className="space-y-2">
                <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong>Hämta stav:</strong> Klicka på ett bråk i sidomenyn för att lägga till en stav i arbetsytan.</li>
                  <li><strong>Ändra täljare:</strong> Klicka på delarna i staven för att "släcka" eller "tända" dem.</li>
                  <li><strong>Linjal:</strong> Dra musen över arbetsytan för att se en vertikal linjal. Den hjälper dig se exakt när t.ex. 2/4 är lika stort som 1/2.</li>
                  <li><strong>Egen stav:</strong> Skapa bråk med egna nämnare (upp till 50) i menyn till vänster.</li>
                </ul>
              </section>
            </div>
          </div>
        )}

        {/* SIDEBAR */}
        <div className="w-full lg:w-48 flex flex-row lg:flex-col gap-3 p-2 sm:p-4 bg-slate-50 border-b lg:border-r border-slate-200 overflow-x-auto lg:overflow-y-auto shrink-0 pr-10 lg:pr-4">
            <div className="flex-1 lg:flex-none flex flex-row lg:flex-col gap-2 min-w-[140px]">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:block">Hämta stav</h3>
                <div className="grid grid-cols-5 lg:grid-cols-2 gap-1.5 flex-1">
                    {PRESETS.map(den => {
                        const colors = getBarColor(den);
                        return <button key={den} onClick={() => addBar(den)} className={`h-8 sm:h-10 rounded-md font-bold text-[10px] sm:text-xs shadow-sm hover:scale-105 transition-all ${colors.bg} ${colors.text} border-b-2 ${colors.border}`}>1/{den}</button>;
                    })}
                </div>
            </div>
            <div className="hidden lg:block border-slate-200 border-b"></div>
            <button onClick={() => setShowLabels(!showLabels)} className={`px-3 py-1 lg:py-2 rounded-lg font-bold text-[10px] border transition-all flex items-center justify-center gap-1 whitespace-nowrap h-8 sm:h-auto ${showLabels ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-slate-200'}`}><Icons.Book size={12} /> {showLabels ? 'Dölj mått' : 'Visa mått'}</button>
        </div>

        {/* WORKSPACE */}
        <div className="flex-1 flex flex-col gap-3 p-2 sm:p-4 min-h-0">
            <div className="w-full h-8 sm:h-10 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center relative shrink-0">
                <span className="font-bold text-red-800 text-sm sm:text-base">1 (Helhet)</span>
            </div>
            <div ref={containerRef} className="flex-1 relative flex flex-col gap-2 overflow-y-auto pr-1 pb-4" onMouseMove={handleMouseMove} onMouseLeave={() => setRulerX(null)}>
                {rulerX !== null && <div className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 z-50 pointer-events-none shadow-[0_0_8px_rgba(99,102,241,0.8)]" style={{ left: `${rulerX}%` }}><div className="absolute -top-5 -translate-x-1/2 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">Linjal</div></div>}
                {bars.map((bar) => {
                    const colors = getBarColor(bar.denominator);
                    return (
                        <div key={bar.id} className="relative w-full h-10 sm:h-12 flex items-center group">
                            <div className="flex-1 h-full flex rounded-lg overflow-hidden shadow-sm ring-1 ring-black/5 bg-slate-100">
                                {Array.from({ length: bar.denominator }).map((_, i) => {
                                    const isActive = i < bar.activeCount;
                                    const match = rulerX !== null && Math.abs(((i + 1) / bar.denominator) * 100 - rulerX) < 1.5;
                                    return (
                                        <div key={i} onClick={() => setBars(prev => prev.map(b => b.id === bar.id ? { ...b, activeCount: i + 1 === b.activeCount ? i : i + 1 } : b))} className={`flex-1 h-full border-r last:border-r-0 border-white/40 flex items-center justify-center cursor-pointer transition-colors relative ${isActive ? colors.bg : 'bg-transparent hover:bg-slate-200'}`}>
                                            {showLabels && <span className={`text-[8px] sm:text-[10px] font-bold pointer-events-none ${isActive ? colors.text : 'text-slate-400'}`}>1/{bar.denominator}</span>}
                                            {match && <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-400 animate-pulse z-20"></div>}
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={() => setBars(prev => prev.filter(b => b.id !== bar.id))} className="ml-2 p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Icons.Trash size={14}/></button>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};
