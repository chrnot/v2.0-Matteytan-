
import React, { useState } from 'react';
import { Icons } from '../icons';

interface PercentageWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

// Helper to simplify fractions
const gcd = (a: number, b: number): number => {
    return b ? gcd(b, a % b) : a;
};

const PercentagePanel: React.FC<{
    value: number;
    onChange: (val: number) => void;
    color: string;
    bgClass: string;
    label: string;
}> = ({ value, onChange, color, bgClass, label }) => {
    
    // Calculate simplified fraction
    const divisor = gcd(value, 100);
    const simpNum = value / divisor;
    const simpDen = 100 / divisor;
    const isSimplified = simpDen !== 100;

    return (
        <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
             <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">{label}</div>
             
             {/* 10x10 Grid */}
             <div className="grid grid-cols-10 gap-0.5 sm:gap-1 p-2 bg-slate-100 rounded-lg border border-slate-200">
                {Array.from({ length: 100 }).map((_, i) => (
                    <div 
                        key={i} 
                        onClick={() => onChange(i + 1)}
                        className={`w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-[1px] sm:rounded-sm transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-slate-400/50 hover:scale-110 active:scale-90 ${i < value ? color : 'bg-slate-200'}`}
                        title={`${i + 1}%`}
                    ></div>
                ))}
             </div>

             {/* Slider */}
             <input 
                type="range" 
                min="0" 
                max="100" 
                value={value} 
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
             />

             {/* Stats Card */}
             <div className={`w-full p-3 rounded-xl border border-slate-200/60 flex flex-col items-center gap-1 shadow-sm ${bgClass}`}>
                 <div className="text-3xl font-bold text-slate-800">{value}%</div>
                 <div className="flex justify-between w-full px-2 text-xs font-mono font-medium text-slate-600 mt-1">
                     <span>{value}/100</span>
                     <span>{(value / 100).toFixed(2)}</span>
                 </div>
                 {isSimplified && value > 0 && (
                     <div className="text-xs text-blue-600 font-bold bg-white/50 px-2 py-0.5 rounded mt-1">
                         = {simpNum}/{simpDen}
                     </div>
                 )}
             </div>
        </div>
    );
};

export const PercentageWidget: React.FC<PercentageWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [valA, setValA] = useState(25);
  const [valB, setValB] = useState(50);
  const [showInfo, setShowInfo] = useState(false);

  const getOperator = () => {
      if (valA > valB) return '>';
      if (valA < valB) return '<';
      return '=';
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 relative overflow-y-auto">
      {/* Info Button */}
      <button 
        onClick={() => setShowInfo(!showInfo)}
        className={`absolute top-0 right-0 p-2 rounded-full transition-all z-[110] ${showInfo ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
      >
        <Icons.Info size={20} />
      </button>

      {/* Info Modal */}
      {showInfo && (
        <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-[120] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-start mb-3">
             <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Procent-Labbet</h4>
             <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <p>Här kan du visualisera vad "procent" (av hundra) faktiskt betyder genom att färglägga rutor i en hundraruta.</p>
            <section className="space-y-2">
              <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
              <ul className="space-y-1.5 list-disc pl-4">
                <li><strong>Hundra-rutan:</strong> Varje ruta representerar 1 procentenhet (1/100).</li>
                <li><strong>Samband:</strong> Se hur procenttalet hänger ihop med decimaltal och bråkform.</li>
                <li><strong>Förenkling:</strong> Verktyget räknar automatiskt ut det förenklade bråket (t.ex. att 25% = 1/4).</li>
                <li><strong>Jämför:</strong> Ändra de två värdena för att se vilket som är störst.</li>
              </ul>
            </section>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center items-center sm:items-start gap-4 sm:gap-8 pt-4">
        
        {/* Panel A */}
        <PercentagePanel 
            label="Värde A" 
            value={valA} 
            onChange={setValA} 
            color="bg-blue-500" 
            bgClass="bg-blue-50"
        />

        {/* Comparison Operator */}
        <div className="self-center flex flex-col items-center gap-2 pt-0 sm:pt-10">
            <div className={`
                w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl text-2xl sm:text-4xl font-black text-slate-700 shadow-md border-2 border-slate-200 bg-white
                transition-all duration-300
                ${valA === valB ? 'bg-green-50 border-green-300 text-green-600 scale-110' : ''}
            `}>
                {getOperator()}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block">Jämför</div>
        </div>

        {/* Panel B */}
        <PercentagePanel 
            label="Värde B" 
            value={valB} 
            onChange={setValB} 
            color="bg-orange-400" 
            bgClass="bg-orange-50"
        />

      </div>
      
      {!isTransparent && (
        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-center text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center px-4 sm:px-8 pb-4">
            Tips: Klicka direkt i rutorna för att snabbt välja ett värde.
        </div>
      )}
    </div>
  );
};
