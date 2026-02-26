
import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

type Tab = 'URN' | 'SUMS' | 'MYSTERY';

interface ProbabilityWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

const SockIcon = ({ color, className }: { color: string, className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path 
            d="M7 2C7 1.44772 7.44772 1 8 1H13C13.5523 1 14 1.44772 14 2V12.5C14 12.8978 14.158 13.2794 14.4393 13.5607L19.4393 18.5607C20.2204 19.3417 20.2204 20.6081 19.4393 21.3891L18.3891 22.4393C17.6081 23.2204 16.3417 23.2204 15.5607 22.4393L6.56066 13.4393C6.19814 13.0768 6 12.5854 6 12.0732V3C6 2.44772 6.44772 2 7 2Z" 
            fill={color}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="0.5"
        />
        <path d="M10.5 19.5C10.5 21.433 12.067 23 14 23" stroke="white" strokeOpacity="0.25" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M18.5 21.5L20 23" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6.1" y1="3.2" x2="13.9" y2="3.2" stroke="white" strokeOpacity="0.3" strokeWidth="0.8" strokeLinecap="round" />
        <line x1="6.1" y1="5.2" x2="13.9" y2="5.2" stroke="white" strokeOpacity="0.15" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
);

const DiceFace: React.FC<{ val: number }> = ({ val }) => (
    <div className="w-10 h-10 bg-white border border-slate-300 rounded-lg shadow-sm flex items-center justify-center font-bold text-xl text-slate-800 transition-all transform hover:scale-110">{val}</div>
);

// --- SUB-COMPONENT: URNAN ---
const UrnView = () => {
    const [config, setConfig] = useState({ red: 2, blue: 2, green: 0 });
    const [replacement, setReplacement] = useState(true);
    const [mode, setMode] = useState<'BALLS' | 'SOCKS'>('BALLS');
    const [items, setItems] = useState<string[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const [animating, setAnimating] = useState<string | null>(null);

    const resetUrn = () => {
        const newItems: string[] = [];
        for(let i=0; i<config.red; i++) newItems.push('RED');
        for(let i=0; i<config.blue; i++) newItems.push('BLUE');
        for(let i=0; i<config.green; i++) newItems.push('GREEN');
        setItems(newItems);
        setHistory([]);
        setAnimating(null);
    };

    useEffect(() => { resetUrn(); }, [config]);

    const draw = () => {
        if (items.length === 0) return;
        const index = Math.floor(Math.random() * items.length);
        const color = items[index];
        setAnimating(color);
        
        setTimeout(() => {
            setHistory(prev => [color, ...prev].slice(0, 10));
            setAnimating(null);
            if (!replacement) {
                const newItems = [...items];
                newItems.splice(index, 1);
                setItems(newItems);
            }
        }, 800);
    };

    const getProb = (color: string) => {
        const count = items.filter(b => b === color).length;
        const total = items.length;
        if (total === 0) return { pct: 0, text: '0/0' };
        return { pct: Math.round((count / total) * 100), text: `${count}/${total}` };
    };

    const getColorClass = (c: string) => c === 'RED' ? 'bg-red-500' : c === 'BLUE' ? 'bg-blue-500' : 'bg-green-500';
    const getHexColor = (c: string) => c === 'RED' ? '#ef4444' : c === 'BLUE' ? '#3b82f6' : '#22c55e';

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Innehåll i urnan</span>
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                            <input type="number" min="0" max="15" className="w-12 text-center border-2 border-slate-200 rounded-lg font-bold py-1" value={config.red} onChange={e=>setConfig({...config, red: Number(e.target.value)})} />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                            <input type="number" min="0" max="15" className="w-12 text-center border-2 border-slate-200 rounded-lg font-bold py-1" value={config.blue} onChange={e=>setConfig({...config, blue: Number(e.target.value)})} />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <input type="number" min="0" max="15" className="w-12 text-center border-2 border-slate-200 rounded-lg font-bold py-1" value={config.green} onChange={e=>setConfig({...config, green: Number(e.target.value)})} />
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col gap-2 justify-center">
                    <div className="flex gap-2">
                        <button onClick={() => setReplacement(!replacement)} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl border-2 transition-all ${replacement ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                            {replacement ? 'Återläggning: PÅ' : 'Återläggning: AV'}
                        </button>
                        <button onClick={resetUrn} className="p-2 bg-white border-2 border-slate-200 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                            <Icons.Reset size={18} />
                        </button>
                    </div>
                    <div className="flex bg-slate-200 p-1 rounded-xl">
                         <button onClick={() => setMode('BALLS')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${mode === 'BALLS' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Kulor</button>
                         <button onClick={() => setMode('SOCKS')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${mode === 'SOCKS' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Strumpor</button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-8 py-4">
                <div className="relative w-48 h-56 border-x-4 border-b-8 border-slate-300 rounded-b-[40px] bg-slate-100/30 flex flex-wrap-reverse content-start p-4 gap-2 justify-center overflow-hidden shadow-inner shrink-0 group">
                    <div className="absolute top-0 left-0 w-full h-2 bg-slate-300/50"></div>
                    {items.map((color, i) => (
                        <div key={i} className="animate-in zoom-in duration-300">
                             {mode === 'BALLS' ? (
                                <div className={`w-8 h-8 rounded-full shadow-md border-2 border-white/30 ${getColorClass(color)}`}></div>
                             ) : (
                                <SockIcon color={getHexColor(color)} className="w-10 h-10 drop-shadow-md" />
                             )}
                        </div>
                    ))}
                    {animating && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[1px] z-50 animate-in fade-in duration-300">
                            <div className="animate-bounce">
                                {mode === 'BALLS' ? (
                                    <div className={`w-20 h-20 rounded-full shadow-2xl border-4 border-white ${getColorClass(animating)}`}></div>
                                ) : (
                                    <SockIcon color={getHexColor(animating)} className="w-24 h-24 drop-shadow-2xl filter brightness-110" />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 w-full flex flex-col gap-6">
                    <button 
                        onClick={draw} 
                        disabled={items.length === 0 || !!animating} 
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                    >
                        <Icons.Sparkles size={24} className="text-amber-400" />
                        {mode === 'BALLS' ? 'DRA KULA' : 'DRA STRUMPA'}
                    </button>
                    
                    <div className="grid grid-cols-1 gap-2">
                        {['RED', 'BLUE', 'GREEN'].map(c => {
                            const p = getProb(c);
                            if (p.pct === 0 && items.filter(i => i === c).length === 0) return null;
                            const label = c === 'RED' ? 'Röda' : c === 'BLUE' ? 'Blå' : 'Gröna';
                            const accent = c === 'RED' ? 'bg-red-50 text-red-700 border-red-100' : c === 'BLUE' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100';
                            return (
                                <div key={c} className={`flex justify-between items-center p-3 rounded-xl border font-bold ${accent}`}>
                                    <span>{label}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs opacity-60 font-mono">({p.text})</span>
                                        <span className="text-lg font-black">{p.pct}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="h-10 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 overflow-hidden shrink-0 shadow-sm">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest whitespace-nowrap">Senaste dragen</span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {history.map((c, i) => (
                        <div key={i} className={`w-5 h-5 rounded-full flex-shrink-0 animate-in slide-in-from-right-2 border border-white shadow-sm ${getColorClass(c)}`}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: SUMMA (TÄRNING) ---
const SumsView = () => {
    const [diceCount, setDiceCount] = useState(2);
    const [data, setData] = useState<{sum: number, count: number}[]>([]);
    const [totalRolls, setTotalRolls] = useState(0);
    const [lastRoll, setLastRoll] = useState<number[]>([]);

    const resetResults = () => {
        const min = diceCount;
        const max = diceCount * 6;
        const initData = [];
        for (let i = min; i <= max; i++) initData.push({ sum: i, count: 0 });
        setData(initData);
        setTotalRolls(0);
        setLastRoll([]);
    };

    useEffect(() => { resetResults(); }, [diceCount]);

    const roll = (times: number) => {
        let finalBatch: number[] = [];
        const rollMap = new Map<number, number>();
        
        for (let t = 0; t < times; t++) {
            let sum = 0;
            const current = [];
            for (let d = 0; d < diceCount; d++) {
                const val = Math.floor(Math.random() * 6) + 1;
                current.push(val);
                sum += val;
            }
            finalBatch = current;
            rollMap.set(sum, (rollMap.get(sum) || 0) + 1);
        }
        
        setData(prev => prev.map(item => ({
            ...item,
            count: item.count + (rollMap.get(item.sum) || 0)
        })));
        
        setLastRoll(finalBatch);
        setTotalRolls(prev => prev + times);
    };

    return (
        <div className="flex flex-col h-full gap-4">
             <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-200 shrink-0">
                 <div className="flex items-center gap-4">
                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Antal tärningar</span>
                     <div className="flex bg-white p-1 rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
                         {[1, 2, 3].map(n => (
                             <button 
                                key={n} 
                                onClick={() => setDiceCount(n)} 
                                className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${diceCount === n ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                             >
                                {n}
                             </button>
                         ))}
                     </div>
                 </div>
                 <button onClick={resetResults} className="p-2 text-slate-400 hover:text-red-500 bg-white border-2 border-slate-200 rounded-xl transition-all shadow-sm">
                    <Icons.Trash size={18}/>
                 </button>
             </div>

             <div className="flex-1 flex flex-col overflow-hidden">
                 <div className="h-20 flex items-center justify-between px-4 mb-4 shrink-0 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                     <div className="flex gap-2 items-center overflow-hidden">
                        {lastRoll.map((r, i) => (
                            <DiceFace key={i} val={r} />
                        ))}
                        {lastRoll.length > 0 && (
                            <div className="flex items-center ml-3 text-xl sm:text-2xl font-black text-blue-600 animate-in zoom-in whitespace-nowrap">
                                = {lastRoll.reduce((a,b)=>a+b,0)}
                            </div>
                        )}
                     </div>
                     <div className="flex gap-1.5 sm:gap-2 shrink-0">
                        <button onClick={() => roll(1)} className="px-4 sm:px-6 py-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 font-black text-xs sm:text-sm active:scale-95 transition-all">KASTA</button>
                        <button onClick={() => roll(10)} className="px-3 sm:px-4 py-2.5 bg-blue-50 border-2 border-blue-100 text-blue-700 rounded-xl hover:bg-blue-100 font-black text-[10px] sm:text-xs transition-all">+10</button>
                        <button onClick={() => roll(100)} className="px-3 sm:px-4 py-2.5 bg-blue-50 border-2 border-blue-100 text-blue-700 rounded-xl hover:bg-blue-100 font-black text-[10px] sm:text-xs transition-all">+100</button>
                     </div>
                 </div>
                 
                 <div className="flex-1 w-full min-h-[180px] bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="sum" tick={{fontSize: 12, fontWeight: 'bold', fill: '#64748b'}} axisLine={false} tickLine={false} />
                            <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip 
                                cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }} 
                            />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={diceCount === 1 ? '#3b82f6' : `hsl(${220 + index * 10}, 80%, 60%)`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
             </div>
             
             <div className="flex justify-between items-center px-4 py-2 bg-slate-100/50 rounded-xl shrink-0">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Totalt antal kast: <span className="text-slate-900 ml-1">{totalRolls}</span></span>
                {diceCount > 1 && <span className="text-[10px] text-blue-500 font-bold italic">Notera normalkurvan</span>}
             </div>
        </div>
    )
};

// --- SUB-COMPONENT: DETEKTIVEN (Hypotesprövning) ---
const MysteryView = () => {
    const [isCheating, setIsCheating] = useState(false);
    const [counts, setCounts] = useState([0,0,0,0,0,0]);
    const [lastRolls, setLastRolls] = useState<number[]>([]);
    const [revealed, setRevealed] = useState(false);
    const [gameId, setGameId] = useState(0);

    useEffect(() => {
        setIsCheating(Math.random() > 0.5);
        setCounts([0,0,0,0,0,0]);
        setLastRolls([]);
        setRevealed(false);
    }, [gameId]);

    const rollDice = (times: number) => {
        const newCounts = [...counts];
        const batch = [];
        for(let i=0; i<times; i++) {
            let res;
            if (isCheating) {
                const r = Math.random();
                if (r < 0.45) res = 6; else res = Math.floor(Math.random() * 5) + 1;
            } else {
                res = Math.floor(Math.random() * 6) + 1;
            }
            newCounts[res-1]++;
            batch.push(res);
        }
        setCounts(newCounts);
        setLastRolls(batch.slice(0, 12));
    };

    const total = counts.reduce((a,b)=>a+b, 0);
    const sixRatio = total > 0 ? (counts[5]/total * 100).toFixed(1) : '0';

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shrink-0 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <Icons.Graph size={24} />
                </div>
                <div>
                    <h4 className="font-black text-sm uppercase tracking-wider mb-0.5">Uppdrag: Detektiven</h4>
                    <p className="text-xs opacity-90 leading-relaxed font-medium">Tärningen är antingen ärlig eller falsk (45% chans för en 6:a). Kan du lista ut vilken?</p>
                </div>
            </div>

            <div className="flex justify-between items-center px-2 shrink-0">
                 <div className="flex gap-2">
                    <button onClick={() => rollDice(1)} className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-black text-slate-700 hover:bg-slate-50 shadow-sm active:scale-95 transition-all">KASTA 1</button>
                    <button onClick={() => rollDice(10)} className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-black text-slate-700 hover:bg-slate-50 shadow-sm active:scale-95 transition-all">KASTA 10</button>
                 </div>
                 <div className="flex gap-1.5 items-center">
                    {lastRolls.map((r, i) => (
                        <span key={i} className={`w-6 h-6 flex items-center justify-center rounded-md font-bold text-xs animate-in slide-in-from-right-2 ${r === 6 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{r}</span>
                    ))}
                 </div>
            </div>

            <div className="flex-1 flex flex-col min-h-[150px] bg-slate-50/50 rounded-2xl border border-slate-200 p-6 pt-10">
                <div className="h-full flex items-end justify-between px-2 gap-3 border-b-2 border-slate-200 pb-2">
                    {counts.map((c, i) => {
                        const pct = total > 0 ? (c/total)*100 : 0;
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                                <div className={`absolute -top-6 text-[10px] font-black font-mono transition-opacity duration-300 ${total > 0 ? 'opacity-100' : 'opacity-0'} ${i === 5 ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {Math.round(pct)}%
                                </div>
                                <div 
                                    className={`w-full rounded-t-lg transition-all duration-700 ease-out shadow-sm ${i === 5 ? 'bg-indigo-500' : 'bg-slate-300'}`} 
                                    style={{ height: `${Math.max(pct, 2)}%` }}
                                />
                                <div className="mt-2 font-black text-slate-600 text-lg">{i+1}</div>
                            </div>
                        )
                    })}
                </div>
                <div className="text-center text-[10px] font-black text-slate-400 mt-2 shrink-0 uppercase tracking-widest">Antal kast: {total}</div>
            </div>

            {revealed ? (
                <div className={`p-6 rounded-2xl text-center animate-in zoom-in shadow-xl border-4 shrink-0 ${isCheating ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                    <div className="font-black text-2xl mb-1">{isCheating ? 'FALSK TÄRNING! 🕵️‍♀️' : 'ÄRLIG TÄRNING! ✅'}</div>
                    <div className="text-xs font-bold opacity-75 mb-4">Andel sexor: {sixRatio}% (Fusk: ~45%)</div>
                    <button onClick={() => setGameId(g => g+1)} className="px-8 py-2.5 bg-white shadow-md rounded-xl font-black text-sm hover:scale-105 transition-all text-slate-900 border border-slate-100 uppercase tracking-wider">Spela Igen</button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 shrink-0">
                    <button onClick={() => setRevealed(true)} className="py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 active:scale-95 transition-all uppercase tracking-widest text-sm">Gissa: Ärlig</button>
                    <button onClick={() => setRevealed(true)} className="py-4 bg-rose-600 text-white rounded-2xl font-black shadow-lg hover:bg-rose-700 active:scale-95 transition-all uppercase tracking-widest text-sm">Gissa: Falsk</button>
                </div>
            )}
        </div>
    );
};

export const ProbabilityWidget: React.FC<ProbabilityWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [activeTab, setActiveTab] = useState<Tab>('URN');
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="w-full h-full flex flex-col relative">
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
             <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Sannolikhet</h4>
             <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <p>Sannolikhet handlar om hur stor chans det är att något händer.</p>
            <section className="space-y-2">
              <h5 className="font-black text-blue-600 uppercase text-[10px]">De tre lägena:</h5>
              <ul className="space-y-1.5 list-disc pl-4">
                <li><strong>Urnan:</strong> Experimentera med att dra objekt. Hur ändras chansen om du inte lägger tillbaka föremålet?</li>
                <li><strong>Summa:</strong> Slå tärning tusentals gånger. Se hur resultatet alltid skapar en "kulle" (normalkurva) kring mitten.</li>
                <li><strong>Detektiven:</strong> Träna kritiskt tänkande. Kan du genom data avgöra om någon fuskar?</li>
              </ul>
            </section>
          </div>
        </div>
      )}

      <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 shrink-0 border border-slate-200 pr-10">
          <button onClick={() => setActiveTab('URN')} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'URN' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Urnan</button>
          <button onClick={() => setActiveTab('SUMS')} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'SUMS' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Summa</button>
          <button onClick={() => setActiveTab('MYSTERY')} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'MYSTERY' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Detektiven</button>
      </div>

      <div className="flex-1 relative overflow-hidden h-full">
          {activeTab === 'URN' && <UrnView />}
          {activeTab === 'SUMS' && <SumsView />}
          {activeTab === 'MYSTERY' && <MysteryView />}
      </div>
    </div>
  );
};
