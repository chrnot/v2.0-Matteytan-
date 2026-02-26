
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Icons } from '../icons';

type Mode = 'LAB' | 'GRID';

interface BubbleItem {
  id: string;
  value: number;
  x: number;
  y: number;
}

interface PrimeBubblesWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

// Konfiguration för de vanligaste primtalen
const PRIME_CONFIG: Record<number, { color: string, pattern: string }> = {
  2: { color: '#f97316', pattern: 'stripes' }, // Orange
  3: { color: '#22c55e', pattern: 'dots' },    // Grön
  5: { color: '#3b82f6', pattern: 'check' },   // Blå
  7: { color: '#a855f7', pattern: 'waves' },   // Lila
  11: { color: '#ec4899', pattern: 'none' },   // Rosa
};

const DEFAULT_PRIME = { color: '#94a3b8', pattern: 'none' };

const getPrimeFactors = (n: number): number[] => {
  if (n <= 1) return [];
  const factors: number[] = [];
  let d = 2;
  let temp = n;
  while (temp > 1) {
    while (temp % d === 0) {
      factors.push(d);
      temp /= d;
    }
    d++;
    if (d * d > temp) {
      if (temp > 1) factors.push(temp);
      break;
    }
  }
  return factors.sort((a, b) => a - b);
};

export const PrimeBubblesWidget: React.FC<PrimeBubblesWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [mode, setMode] = useState<Mode>('LAB');
  const [bubbles, setBubbles] = useState<BubbleItem[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState<string>('');
  const [showInfo, setShowInfo] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const addBubble = (val: number, x?: number, y?: number) => {
    if (val < 1 || val > 1000) return;
    const id = Math.random().toString(36).substr(2, 9);
    const container = containerRef.current;
    const startX = x ?? (container ? container.clientWidth / 2 : 150);
    const startY = y ?? (container ? container.clientHeight / 2 : 150);
    setBubbles(prev => [...prev, { id, value: val, x: startX + (Math.random() * 40 - 20), y: startY + (Math.random() * 40 - 20) }]);
  };

  const handleCustomAdd = (e: React.FormEvent) => {
      e.preventDefault();
      const val = parseInt(customInput);
      if (!isNaN(val)) { addBubble(val); setCustomInput(''); }
  };

  const selectFromGrid = (num: number) => { addBubble(num); setMode('LAB'); };

  const splitBubble = (id: string) => {
    const target = bubbles.find(b => b.id === id);
    if (!target || target.value <= 1) return;
    const factors = getPrimeFactors(target.value);
    if (factors.length <= 1) return; 
    const f1 = factors[0];
    const f2 = target.value / f1;
    setBubbles(prev => {
        const filtered = prev.filter(b => b.id !== id);
        return [...filtered, { id: Math.random().toString(36).substr(2, 9), value: f1, x: target.x - 30, y: target.y + 30 }, { id: Math.random().toString(36).substr(2, 9), value: f2, x: target.x + 30, y: target.y + 30 }];
    });
  };

  const handleStart = (clientX: number, clientY: number, id: string) => {
    const target = bubbles.find(b => b.id === id);
    if (!target) return;
    setDraggedId(id);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragOffset.current = { x: clientX - rect.left - target.x, y: clientY - rect.top - target.y };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!draggedId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(20, Math.min(rect.width - 20, clientX - rect.left - dragOffset.current.x));
    const newY = Math.max(20, Math.min(rect.height - 20, clientY - rect.top - dragOffset.current.y));
    setBubbles(prev => prev.map(b => b.id === draggedId ? { ...b, x: newX, y: newY } : b));
  };

  const handleEnd = () => {
    if (!draggedId) return;
    const dragItem = bubbles.find(b => b.id === draggedId);
    if (dragItem) {
      const target = bubbles.find(b => b.id !== draggedId && Math.sqrt(Math.pow(b.x - dragItem.x, 2) + Math.pow(b.y - dragItem.y, 2)) < 60);
      if (target && target.value * dragItem.value <= 1000) {
        setBubbles(prev => prev.filter(b => b.id !== draggedId && b.id !== target.id).concat({ id: Math.random().toString(36).substr(2, 9), value: target.value * dragItem.value, x: target.x, y: target.y }));
      }
    }
    setDraggedId(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden select-none font-sans relative">
      {/* Info Button */}
      <button onClick={() => setShowInfo(!showInfo)} className={`absolute top-2 right-2 p-2 rounded-full transition-all z-[110] ${showInfo ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}><Icons.Info size={20} /></button>

      {/* Info Modal */}
      {showInfo && (
        <div className="absolute top-14 right-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-[120] animate-in fade-in slide-in-from-top-2 duration-300 text-left">
          <div className="flex justify-between items-start mb-3">
             <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Prim-Bubblor</h4>
             <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <p>Ett interaktivt sätt att förstå hur alla tal är uppbyggda av primtal.</p>
            <section className="space-y-2">
              <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
              <ul className="space-y-1.5 list-disc pl-4">
                <li><strong>Multiplicera:</strong> Dra en bubbla ovanpå en annan för att multiplicera dem.</li>
                <li><strong>Dela upp:</strong> Dubbelklicka på en bubbla för att dela upp den i sina minsta faktorer (primtal).</li>
                <li><strong>Mönster:</strong> Varje primtal har en unik färg och ett eget mönster. Se hur stora tal bär med sig mönstren från sina faktorer.</li>
                <li><strong>100-Kartan:</strong> Se hur alla tal upp till 100 ser ut i sin faktorform.</li>
              </ul>
            </section>
          </div>
        </div>
      )}

      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <pattern id="stripes" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="white" strokeWidth="1" opacity="0.3" /></pattern>
          <pattern id="dots" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="white" opacity="0.3" /></pattern>
          <pattern id="check" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="white" opacity="0.2" /></pattern>
          <pattern id="waves" width="8" height="4" patternUnits="userSpaceOnUse"><path d="M0,2 Q2,0 4,2 T8,2" fill="none" stroke="white" strokeWidth="1" opacity="0.4" /></pattern>
        </defs>
      </svg>

      <div className="shrink-0 flex items-center justify-between p-2 sm:p-3 bg-slate-50 border-b border-slate-200 z-10 gap-4 pr-12">
          <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner shrink-0">
              <button onClick={() => setMode('LAB')} className={`px-3 sm:px-5 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-tight rounded-lg transition-all ${mode === 'LAB' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}>Labbet</button>
              <button onClick={() => setMode('GRID')} className={`px-3 sm:px-5 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-tight rounded-lg transition-all ${mode === 'GRID' ? 'bg-white shadow text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}>100-Kartan</button>
          </div>
          {mode === 'LAB' && (
            <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end min-w-0">
                <form onSubmit={handleCustomAdd} className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 ring-blue-100 transition-all mr-2"><input type="number" placeholder="Eget tal..." className="w-16 sm:w-20 px-2 py-1.5 text-xs font-bold outline-none" value={customInput} onChange={e => setCustomInput(e.target.value)} min="1" max="1000"/><button type="submit" className="bg-blue-600 text-white p-1.5 hover:bg-blue-700 transition-colors"><Icons.Plus size={14} strokeWidth={3} /></button></form>
                <div className="hidden sm:flex items-center gap-1">
                    {[2, 3, 5, 7, 11].map(v => (
                        <button key={v} onClick={() => addBubble(v)} className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 active:scale-95 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: PRIME_CONFIG[v].color }}>{PRIME_CONFIG[v].pattern !== 'none' && <rect width="100%" height="100%" fill={`url(#${PRIME_CONFIG[v].pattern})`} className="absolute inset-0 pointer-events-none" />}<span className="text-white font-black text-[10px] sm:text-xs relative z-10">{v}</span></button>
                    ))}
                </div>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <button onClick={() => setBubbles([])} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Rensa allt"><Icons.Trash size={18} /></button>
            </div>
          )}
      </div>
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-slate-50/30" onMouseMove={(e) => mode === 'LAB' && handleMove(e.clientX, e.clientY)} onMouseUp={handleEnd} onTouchMove={(e) => mode === 'LAB' && handleMove(e.touches[0].clientX, e.touches[0].clientY)} onTouchEnd={handleEnd}>
        {mode === 'LAB' ? (
            <div className="w-full h-full">
                {bubbles.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none p-8 text-center animate-in fade-in duration-700"><Icons.Zap size={48} className="mb-4 opacity-20" /><h3 className="text-lg font-bold text-slate-400">Välkommen till Prim-Labbet!</h3><p className="text-sm max-w-[240px] text-slate-400 leading-relaxed">Dra in primtal eller skriv ett eget tal för att multiplicera. <br/><strong>Dubbelklicka</strong> för att dela upp i faktorer.</p></div>
                )}
                {bubbles.map(b => (
                    <Bubble key={b.id} {...b} isDragging={draggedId === b.id} onStart={(x, y) => handleStart(x, y, b.id)} onClick={() => splitBubble(b.id)}/>
                ))}
            </div>
        ) : (
            <div className="w-full h-full overflow-y-auto p-4 sm:p-6 grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3 scrollbar-thin animate-in fade-in slide-in-from-bottom-2 duration-500">
                {Array.from({ length: 100 }).map((_, i) => {
                    const num = i + 1;
                    return (
                        <button key={num} onClick={() => selectFromGrid(num)} className="aspect-square flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all group p-1 hover:border-blue-300 hover:ring-4 hover:ring-blue-50"><div className="w-full flex-1 flex items-center justify-center overflow-hidden"><StaticBubble value={num} size={window.innerWidth < 640 ? 32 : 40} /></div><span className="text-[10px] sm:text-[11px] font-black text-slate-400 group-hover:text-blue-600 transition-colors mt-1">{num}</span></button>
                    );
                })}
            </div>
        )}
      </div>
      <div className="p-2 sm:p-3 bg-white border-t border-slate-100 flex justify-between items-center shrink-0 z-10 shadow-inner">
          <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-1">
              {[2, 3, 5, 7, 11].map(v => (
                  <div key={v} className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100"><div className="w-3 h-3 rounded-full relative overflow-hidden" style={{backgroundColor: PRIME_CONFIG[v].color}}>{PRIME_CONFIG[v].pattern !== 'none' && <rect width="100%" height="100%" fill={`url(#${PRIME_CONFIG[v].pattern})`} />}</div><span className="text-[9px] sm:text-[10px] font-black text-slate-600">{v}</span></div>
              ))}
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden md:block whitespace-nowrap opacity-60">Aritmetikens fundamentalsats</p>
      </div>
    </div>
  );
};

const StaticBubble: React.FC<{ value: number, size: number }> = ({ value, size }) => {
    const factors = useMemo(() => getPrimeFactors(value), [value]);
    const radius = size / 2;
    if (value === 1) return <div className="rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center" style={{ width: size, height: size }}><span className="text-[10px] font-bold text-slate-300">1</span></div>;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm overflow-visible">
            {factors.length === 1 ? (
                <g><circle cx={radius} cy={radius} r={radius - 1} fill={(PRIME_CONFIG[factors[0]] || DEFAULT_PRIME).color} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />{PRIME_CONFIG[factors[0]] && PRIME_CONFIG[factors[0]].pattern !== 'none' && <circle cx={radius} cy={radius} r={radius - 1} fill={`url(#${PRIME_CONFIG[factors[0]].pattern})`} pointerEvents="none" />}</g>
            ) : (
                factors.map((f, i) => {
                    const startAngle = (i / factors.length) * 360;
                    const endAngle = ((i + 1) / factors.length) * 360;
                    const x1 = radius + (radius - 1) * Math.cos((Math.PI * (startAngle - 90)) / 180);
                    const y1 = radius + (radius - 1) * Math.sin((Math.PI * (startAngle - 90)) / 180);
                    const x2 = radius + (radius - 1) * Math.cos((Math.PI * (endAngle - 90)) / 180);
                    const y2 = radius + (radius - 1) * Math.sin((Math.PI * (endAngle - 90)) / 180);
                    const pathData = `M ${radius} ${radius} L ${x1} ${y1} A ${radius-1} ${radius-1} 0 0 1 ${x2} ${y2} Z`;
                    const config = PRIME_CONFIG[f] || DEFAULT_PRIME;
                    return (<g key={i}><path d={pathData} fill={config.color} stroke="white" strokeWidth="0.5" />{config.pattern !== 'none' && <path d={pathData} fill={`url(#${config.pattern})`} opacity="0.4" pointerEvents="none" />}</g>);
                })
            )}
            <circle cx={radius} cy={radius} r={radius - 1} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
        </svg>
    );
};

const Bubble: React.FC<BubbleItem & { isDragging: boolean, onStart: (x: number, y: number) => void, onClick: () => void }> = (props) => {
    const size = window.innerWidth < 640 ? 52 : 72;
    return (
        <div className={`absolute cursor-grab active:cursor-grabbing transition-transform ${props.isDragging ? 'scale-110 z-[100]' : 'hover:scale-105 z-50 animate-in zoom-in duration-300'}`} style={{ left: props.x, top: props.y, transform: `translate(-50%, -50%)` }} onMouseDown={(e) => props.onStart(e.clientX, e.clientY)} onTouchStart={(e) => props.onStart(e.touches[0].clientX, e.touches[0].clientY)} onDoubleClick={(e) => { e.stopPropagation(); props.onClick(); }}><StaticBubble value={props.value} size={size} /><div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-white font-black text-sm sm:text-2xl drop-shadow-md select-none">{props.value}</span></div>{getPrimeFactors(props.value).length > 1 && (<button className="absolute -top-1 -right-1 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-slate-100" onClick={(e) => { e.stopPropagation(); props.onClick(); }} title="Dela upp i faktorer"><Icons.Zap size={10} className="text-amber-500 fill-amber-500" /></button>)}</div>
    );
};
