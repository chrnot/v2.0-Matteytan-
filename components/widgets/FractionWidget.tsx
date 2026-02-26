
import React, { useState } from 'react';
import { Icons } from '../icons';

type ShapeType = 'CIRCLE' | 'RECT';
type DisplayMode = 'FRACTION' | 'PERCENT' | 'DECIMAL';

interface FractionState {
  num: number;
  den: number;
}

interface FractionWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

const FractionDisplay: React.FC<{ 
    label: string; 
    state: FractionState; 
    shape: ShapeType;
    displayMode: DisplayMode;
    onChange: (s: FractionState) => void; 
    color: string;
}> = ({ label, state, shape, displayMode, onChange, color }) => {
    
    const value = state.num / state.den;

    const getSlicePath = (index: number, total: number) => {
        if (total === 1) return ""; 
        const startAngle = (index / total) * 360;
        const endAngle = ((index + 1) / total) * 360;
        const center = 50;
        const radius = 48;
        const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);
        const x1 = center + radius * Math.cos(toRad(startAngle));
        const y1 = center + radius * Math.sin(toRad(startAngle));
        const x2 = center + radius * Math.cos(toRad(endAngle));
        const y2 = center + radius * Math.sin(toRad(endAngle));
        return `M ${center},${center} L ${x1},${y1} A ${radius},${radius} 0 0,1 ${x2},${y2} Z`;
    };

    const renderValue = () => {
        if (displayMode === 'PERCENT') return `${Math.round(value * 100)}%`;
        if (displayMode === 'DECIMAL') return value.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return (
            <div className="flex flex-col items-center">
                <span>{state.num}</span>
                <div className="h-0.5 w-6 bg-slate-800 my-0.5"></div>
                <span>{state.den}</span>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm w-full transition-all">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
            
            {/* Visualizer */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 relative flex items-center justify-center transition-all duration-300">
                {shape === 'CIRCLE' ? (
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                        <circle cx="50" cy="50" r="48" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
                        {state.den === 1 ? (
                            <circle cx="50" cy="50" r="48" fill={state.num >= 1 ? color : '#f1f5f9'} stroke="#cbd5e1" strokeWidth="2" />
                        ) : (
                            Array.from({ length: state.den }).map((_, i) => (
                                <path
                                    key={i}
                                    d={getSlicePath(i, state.den)}
                                    fill={i < state.num ? color : '#f1f5f9'}
                                    stroke="white" 
                                    strokeWidth="1.5"
                                    className="transition-colors duration-300"
                                />
                            ))
                        )}
                        <circle cx="50" cy="50" r="48" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                    </svg>
                ) : (
                    <div className="w-16 h-24 sm:w-20 sm:h-32 flex flex-col border-2 border-slate-400 rounded-lg overflow-hidden bg-slate-100 shadow-sm">
                         {Array.from({ length: state.den }).map((_, i) => (
                             <div 
                                key={i} 
                                className="flex-1 w-full border-b border-white last:border-0 transition-colors duration-300"
                                style={{ backgroundColor: i < state.num ? color : '#f1f5f9' }}
                             />
                         ))}
                    </div>
                )}
            </div>

            {/* Value Display */}
            <div className={`text-xl font-black text-slate-800 h-12 flex items-center justify-center transition-all ${displayMode !== 'FRACTION' ? 'text-2xl' : ''}`}>
                {renderValue()}
            </div>

            {/* Controls */}
            <div className="flex flex-col w-full gap-2">
                 <div className="flex items-center justify-between bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                    <button onClick={() => onChange({...state, num: Math.max(0, state.num - 1)})} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-500 rounded"><Icons.Minimize size={12}/></button>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Täljare</span>
                    <button onClick={() => onChange({...state, num: Math.min(state.den, state.num + 1)})} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-500 rounded"><Icons.Plus size={12}/></button>
                 </div>
                 <div className="flex items-center justify-between bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                    <button onClick={() => {
                        const newDen = Math.max(1, state.den - 1);
                        onChange({ num: Math.min(state.num, newDen), den: newDen });
                    }} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-500 rounded"><Icons.Minimize size={12}/></button>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Nämnare</span>
                    <button onClick={() => onChange({...state, den: Math.min(24, state.den + 1)})} className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-500 rounded"><Icons.Plus size={12}/></button>
                 </div>
            </div>
        </div>
    );
}

export const FractionWidget: React.FC<FractionWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [items, setItems] = useState<FractionState[]>([
      { num: 1, den: 2 },
      { num: 2, den: 4 }
  ]);
  const [shape, setShape] = useState<ShapeType>('CIRCLE');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('FRACTION');
  const [showInfo, setShowInfo] = useState(false);

  const updateItem = (index: number, newState: FractionState) => {
      setItems(prev => prev.map((item, i) => i === index ? newState : item));
  };

  const setItemCount = (count: number) => {
      if (count === 1) setItems([{ num: 1, den: 2 }]);
      else if (count === 2) setItems([{ num: 1, den: 2 }, { num: 2, den: 4 }]);
      else setItems([{ num: 1, den: 3 }, { num: 1, den: 2 }, { num: 2, den: 3 }]);
  };

  const getOperator = (val1: number, val2: number) => {
      if (val1 > val2) return '>';
      if (val1 < val2) return '<';
      return '=';
  };

  const colors = ["#3b82f6", "#10b981", "#a855f7"];

  return (
    <div className="w-full h-full flex flex-col gap-6 relative">
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
             <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Bråk & Delar</h4>
             <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <p>Verktyget hjälper dig att förstå hur tal kan delas upp och hur olika bråk förhåller sig till varandra.</p>
            <section className="space-y-2">
              <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
              <ul className="space-y-1.5 list-disc pl-4">
                <li><strong>Jämför:</strong> Välj 2 eller 3 figurer för att se likheter och skillnader mellan olika nämnare.</li>
                <li><strong>Visning:</strong> Växla mellan bråkform, procent och decimaltal för att se sambanden.</li>
                <li><strong>Former:</strong> Byt mellan cirklar och rektanglar för att visualisera delarna på olika sätt.</li>
                <li><strong>Ändra:</strong> Använd knapparna eller klicka direkt i figurerna för att ändra täljare och nämnare.</li>
              </ul>
            </section>
          </div>
        </div>
      )}

      {/* Configuration Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm pr-10">
        <div className="flex bg-slate-200 p-0.5 rounded-xl">
            {[1, 2, 3].map(n => (
                <button key={n} onClick={() => setItemCount(n)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${items.length === n ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    {n} st
                </button>
            ))}
        </div>

        <div className="flex bg-slate-200 p-0.5 rounded-xl">
            <button onClick={() => setDisplayMode('FRACTION')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${displayMode === 'FRACTION' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Bråk</button>
            <button onClick={() => setDisplayMode('PERCENT')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${displayMode === 'PERCENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>%</button>
            <button onClick={() => setDisplayMode('DECIMAL')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${displayMode === 'DECIMAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>0.5</button>
        </div>

        <div className="flex bg-slate-200 p-0.5 rounded-xl">
            <button onClick={() => setShape('CIRCLE')} className={`p-1.5 rounded-lg transition-all ${shape === 'CIRCLE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><Icons.Fraction size={18} /></button>
            <button onClick={() => setShape('RECT')} className={`p-1.5 rounded-lg transition-all ${shape === 'RECT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><div className="w-4 h-4 border-2 border-current rounded-sm"></div></button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-8 overflow-y-auto min-h-0 pb-4">
          {items.map((item, idx) => (
              <React.Fragment key={idx}>
                  <div className="flex-1 w-full max-w-[200px]">
                      <FractionDisplay 
                        label={`Figur ${String.fromCharCode(65 + idx)}`}
                        state={item}
                        shape={shape}
                        displayMode={displayMode}
                        onChange={(s) => updateItem(idx, s)}
                        color={colors[idx]}
                      />
                  </div>
                  {idx < items.length - 1 && (
                      <div className="shrink-0 flex flex-col items-center gap-2">
                          <div className={`w-12 h-12 flex items-center justify-center rounded-2xl text-2xl font-black border-2 transition-all duration-500 ${item.num/item.den === items[idx+1].num/items[idx+1].den ? 'bg-green-100 border-green-300 text-green-600' : 'bg-white border-slate-200 text-slate-400'}`}>
                            {getOperator(item.num/item.den, items[idx+1].num/items[idx+1].den)}
                          </div>
                      </div>
                  )}
              </React.Fragment>
          ))}
      </div>

      <div className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest mt-auto mb-2">
          Laborera med täljare och nämnare för att jämföra värden
      </div>
    </div>
  );
};
