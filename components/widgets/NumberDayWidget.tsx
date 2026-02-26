
import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';

interface NumberDayWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

type RangeLevel = 20 | 100 | 1000;

export const NumberDayWidget: React.FC<NumberDayWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [range, setRange] = useState<RangeLevel>(100);
  // Initialize with a random number based on the default range (100)
  const [number, setNumber] = useState<number>(() => Math.floor(Math.random() * 100) + 1);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [showInfo, setShowInfo] = useState(false);

  // Clamp number when range changes
  useEffect(() => {
    if (number > range) setNumber(Math.floor(Math.random() * range) + 1);
  }, [range]);

  const generateRandom = () => {
    // Generate between 1 and range
    const n = Math.floor(Math.random() * range) + 1;
    setNumber(n);
    setVisible({});
  };

  const toggle = (key: string) => {
    setVisible(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isPrime = (num: number) => {
    if (num <= 1) return false;
    for(let i = 2, s = Math.sqrt(num); i <= s; i++)
        if(num % i === 0) return false;
    return true;
  };

  const getFactors = (num: number) => {
    const factors = [];
    for (let i = 1; i <= num; i++) {
        if (num % i === 0) factors.push(i);
    }
    if (factors.length > 8) return factors.slice(0, 7).join(', ') + '...';
    return factors.join(', ');
  };

  const getPlaceValues = (num: number) => {
      const s = num.toString();
      const len = s.length;
      return s.split('').map((digit, i) => {
          const val = Number(digit) * Math.pow(10, len - 1 - i);
          return val > 0 ? val : null;
      }).filter(n => n !== null).join(' + ');
  };

  const getData = () => {
      const data: { label: string, value: string | number, color: string }[] = [];

      data.push({ 
          label: 'Udda / Jämnt', 
          value: number % 2 === 0 ? 'Jämnt' : 'Udda',
          color: 'bg-blue-50 text-blue-700'
      });

      if (range === 20) {
          data.push({ label: 'Dubbelt', value: number * 2, color: 'bg-amber-50 text-amber-700' });
          data.push({ label: 'Hälften', value: number % 2 === 0 ? number / 2 : (number / 2).toFixed(1), color: 'bg-emerald-50 text-emerald-700' });
          if (number <= 10) {
              data.push({ label: 'Tiokompis', value: 10 - number, color: 'bg-indigo-50 text-indigo-700' });
          } else {
              data.push({ label: 'Till 20', value: 20 - number, color: 'bg-indigo-50 text-indigo-700' });
          }
      }

      if (range === 100) {
          data.push({ label: 'Hundrakompis', value: 100 - number, color: 'bg-indigo-50 text-indigo-700' });
          data.push({ label: 'Hälften', value: number / 2, color: 'bg-emerald-50 text-emerald-700' });
          data.push({ label: 'Närmaste 10-tal', value: Math.round(number / 10) * 10, color: 'bg-slate-100 text-slate-700' });
          data.push({ label: 'Faktorer', value: getFactors(number), color: 'bg-purple-50 text-purple-700' });
      }

      if (range === 1000) {
           data.push({ label: 'Tusenkompis', value: 1000 - number, color: 'bg-indigo-50 text-indigo-700' });
           data.push({ label: 'Talsorter', value: getPlaceValues(number), color: 'bg-orange-50 text-orange-800' });
           data.push({ label: 'Närmaste 100-tal', value: Math.round(number / 100) * 100, color: 'bg-slate-100 text-slate-700' });
           data.push({ label: 'Primtal?', value: isPrime(number) ? 'Ja' : 'Nej', color: 'bg-rose-50 text-rose-700' });
      }

      return data;
  };

  return (
    <div className="w-[450px] flex flex-col gap-4 relative">
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
               <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Dagens Tal</h4>
               <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
            </div>
            <div className="space-y-4 text-xs leading-relaxed text-slate-600">
              <p>Här kan du utforska ett tals egenskaper på djupet. En perfekt övning för morgonmötet eller lektionsstarten.</p>
              <section className="space-y-2">
                <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong>Talområde:</strong> Välj mellan 0-20, 0-100 eller 0-1000 för att anpassa svårighetsgraden.</li>
                  <li><strong>Egenskaper:</strong> Klicka på de grå rutorna för att avslöja fakta om talet (t.ex. tiokompisar, hälften eller talsorter).</li>
                  <li><strong>Slumpa:</strong> Klicka på "SLUMPA NYTT" för att få ett nytt tal att analysera.</li>
                </ul>
              </section>
            </div>
          </div>
        )}

        {/* Difficulty Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl mx-auto shrink-0 pr-10">
            <button 
                onClick={() => setRange(20)} 
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${range === 20 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
                0-20
            </button>
            <button 
                onClick={() => setRange(100)} 
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${range === 100 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
                0-100
            </button>
            <button 
                onClick={() => setRange(1000)} 
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${range === 1000 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
                0-1000
            </button>
        </div>

        {/* Main Number Display */}
        <div className="relative bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
            
            <div className="flex items-center gap-4 z-10">
                <button onClick={() => setNumber(n => Math.max(0, n - 1))} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"><Icons.Minimize size={24}/></button>
                <input 
                    type="number" 
                    value={number} 
                    onChange={e => { setNumber(Number(e.target.value)); setVisible({}); }}
                    className="text-6xl font-black text-slate-800 text-center w-48 bg-transparent outline-none border-b-2 border-transparent focus:border-blue-200 transition-colors placeholder-slate-200"
                />
                <button onClick={() => setNumber(n => Math.min(range, n + 1))} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"><Icons.Plus size={24}/></button>
            </div>
            
            <button 
                onClick={generateRandom} 
                className="mt-4 flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-full text-sm font-bold shadow-lg hover:bg-slate-700 active:scale-95 transition-all"
            >
                <Icons.Reset size={16} /> 
                SLUMPA NYTT
            </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[650px] pr-1">
            {getData().map((item, i) => (
                <div 
                    key={item.label} 
                    onClick={() => toggle(item.label)}
                    className={`
                        p-3 h-20 rounded-xl border cursor-pointer transition-all duration-300 relative overflow-hidden group flex flex-col justify-between
                        ${visible[item.label] ? `bg-white border-slate-200 shadow-sm` : 'bg-slate-50 border-transparent hover:bg-slate-100'}
                    `}
                >
                    {/* LABEL - Always on top */}
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider relative z-20 pointer-events-none flex justify-between items-center">
                        {item.label}
                        {!visible[item.label] && <Icons.More size={12} className="opacity-50" />}
                    </div>
                    
                    {/* VALUE - Becomes visible when toggled */}
                    <div className={`relative z-20 font-mono font-bold text-lg text-slate-800 transition-all duration-300 ${visible[item.label] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        {item.value}
                    </div>

                    {/* Hidden Overlay Panel */}
                    <div className={`
                        absolute inset-0 flex items-center justify-center bg-slate-100/80 backdrop-blur-[2px] transition-all duration-300 z-10
                        ${visible[item.label] ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                    `}>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">Visa svar</span>
                    </div>
                    
                    {/* Color Accent Bar */}
                    <div className={`absolute left-0 bottom-0 top-0 w-1 ${item.color.split(' ')[0]} opacity-40 z-20`}></div>
                </div>
            ))}
        </div>
    </div>
  );
};
