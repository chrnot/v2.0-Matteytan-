
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Icons } from '../icons';

interface NumberLineWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

interface Jump {
    start: number;
    end: number;
    label: string;
    id: number;
    color: string;
}

export const NumberLineWidget: React.FC<NumberLineWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [range, setRange] = useState({ min: -25, max: 25 });
  const [scale, setScale] = useState(1); 
  const [jumps, setJumps] = useState<Jump[]>([]);
  const [markerPos, setMarkerPos] = useState(0);
  const [hasSetStart, setHasSetStart] = useState(false); 
  const [snapToInteger, setSnapToInteger] = useState(true);
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  const [manualJump, setManualJump] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const baseWidthPerUnit = 60; 
  const widthPerUnit = baseWidthPerUnit * scale; 
  const totalUnits = range.max - range.min;
  const totalWidth = totalUnits * widthPerUnit + 200; 
  const LINE_Y = 140; 

  const getSVGPoint = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const transformedPt = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return transformedPt;
  }, []);

  const getX = useCallback((val: number) => {
    return (val - range.min) * widthPerUnit + 100;
  }, [range.min, widthPerUnit]);

  const getValFromX = useCallback((svgX: number) => {
    const val = (svgX - 100) / widthPerUnit + range.min;
    return snapToInteger ? Math.round(val) : Math.round(val * 10) / 10;
  }, [range.min, widthPerUnit, snapToInteger]);

  useLayoutEffect(() => {
    const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
            const targetX = getX(0);
            const containerWidth = scrollContainerRef.current.clientWidth;
            scrollContainerRef.current.scrollLeft = targetX - containerWidth / 2;
        }
    }, 50);
    return () => clearTimeout(timer);
  }, []); 

  const addJump = (to: number) => {
    if (to === markerPos) return;
    const diff = to - markerPos;
    const isPositive = diff > 0;
    const absDiff = Math.abs(diff);
    const labelVal = snapToInteger ? absDiff : absDiff.toFixed(1);
    const label = isPositive ? `+${labelVal}` : `-${labelVal}`;
    const newJump: Jump = {
        start: markerPos,
        end: to,
        label,
        id: Date.now(),
        color: isPositive ? '#10b981' : '#ef4444'
    };
    setJumps(prev => [...prev, newJump]);
    setMarkerPos(to);
    if (to > range.max - 3) setRange(r => ({ ...r, max: Math.ceil(to + 15) }));
    if (to < range.min + 3) setRange(r => ({ ...r, min: Math.floor(to - 15) }));
  };

  const handleManualJump = (e: React.FormEvent) => {
      e.preventDefault();
      const val = parseFloat(manualJump.replace(',', '.'));
      if (!isNaN(val)) {
          if (!hasSetStart) {
              setMarkerPos(val);
              setHasSetStart(true);
          } else {
              addJump(markerPos + val);
          }
          setManualJump('');
      }
  };

  const handleLineClick = (e: React.MouseEvent) => {
    const pt = getSVGPoint(e.clientX, e.clientY);
    const val = getValFromX(pt.x);
    if (!hasSetStart) {
        setMarkerPos(val);
        setHasSetStart(true);
    } else {
        addJump(val);
    }
  };

  const undoLastJump = () => {
    if (jumps.length > 0) {
        const newJumps = [...jumps];
        const last = newJumps.pop();
        setJumps(newJumps);
        setMarkerPos(last ? last.start : 0);
    } else if (hasSetStart) {
        setHasSetStart(false);
        setMarkerPos(0);
    }
  };

  const equationText = () => {
    if (!hasSetStart) return "Välj startpunkt";
    if (jumps.length === 0) return `Start: ${markerPos}`;
    const jumpsPart = jumps.map(j => ` ${j.label}`).join("");
    return `${jumps[0].start}${jumpsPart} = ${markerPos}`;
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 overflow-hidden bg-white select-none relative">
      
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
             <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Tallinjen</h4>
             <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <p>Tallinjen hjälper dig att se talens ordning och hur räkneoperationer fungerar genom "hopp".</p>
            <section className="space-y-2">
              <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
              <ul className="space-y-1.5 list-disc pl-4">
                <li><strong>Starta:</strong> Klicka var som helst på linjen för att sätta din startpunkt.</li>
                <li><strong>Hoppa:</strong> Klicka på ett nytt tal för att rita en båge. Gröna bågar är addition (+), röda är subtraktion (-).</li>
                <li><strong>Precision:</strong> Skriv in ett tal i rutan "Hopp" för att göra exakta förflyttningar.</li>
                <li><strong>Hela tal:</strong> Slå av "Hela tal" om du vill arbeta med decimaltal (0,1-steg).</li>
              </ul>
            </section>
          </div>
        </div>
      )}

      {/* Header & Equation Bar */}
      <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0 shadow-sm">
        <div className="flex justify-between items-center pr-8">
            <div className="flex items-center gap-3">
                <div className={`px-4 py-1.5 rounded-xl border-2 shadow-sm transition-all ${hasSetStart ? 'bg-white border-blue-100' : 'bg-blue-50 border-blue-200 animate-pulse'}`}>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block leading-none mb-1">{hasSetStart ? 'Position' : 'Väntar...'}</span>
                    <span className={`text-2xl font-black tabular-nums ${hasSetStart ? 'text-slate-800' : 'text-blue-300'}`}>{hasSetStart ? markerPos : '?'}</span>
                </div>
                {hasSetStart && (
                    <div className="hidden lg:flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl text-white shadow-lg animate-in slide-in-from-left-4">
                        <Icons.Math size={18} className="opacity-70" />
                        <span className="text-sm font-black font-mono">{equationText()}</span>
                    </div>
                )}
            </div>
            
            <div className="flex gap-1.5">
                <button onClick={() => setScale(s => Math.max(0.4, s - 0.2))} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm"><Icons.Minimize size={18} /></button>
                <button onClick={() => setScale(s => Math.min(2.5, s + 0.2))} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm"><Icons.Plus size={18} /></button>
                <div className="w-px h-8 bg-slate-200 mx-1"></div>
                <button onClick={undoLastJump} disabled={!hasSetStart} className="p-2 bg-white border border-slate-200 rounded-lg text-amber-600 hover:bg-amber-50 disabled:opacity-30 shadow-sm"><Icons.Reset size={18} /></button>
                <button onClick={() => { setJumps([]); setMarkerPos(0); setHasSetStart(false); }} className="p-2 bg-white border border-slate-200 rounded-lg text-red-500 hover:bg-red-50 shadow-sm"><Icons.Trash size={18} /></button>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-1 border-t border-slate-200/60">
            <form onSubmit={handleManualJump} className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-inner">
                <span className="pl-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">{hasSetStart ? 'Hopp:' : 'Start:'}</span>
                <input 
                    type="text" 
                    value={manualJump}
                    onChange={(e) => setManualJump(e.target.value)}
                    placeholder="Tal"
                    className="w-24 px-2 py-1.5 bg-slate-50 rounded-lg text-sm font-black text-slate-700 outline-none focus:bg-white focus:ring-2 ring-blue-100 transition-all placeholder:text-slate-300"
                />
                <button 
                    type="submit"
                    disabled={!manualJump}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-black text-[10px] uppercase shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-30"
                >
                    {hasSetStart ? 'Hoppa' : 'Sätt'}
                </button>
            </form>

            <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-10 h-5 rounded-full transition-colors relative ${snapToInteger ? 'bg-blue-600' : 'bg-slate-300 group-hover:bg-slate-400'}`}>
                    <input type="checkbox" checked={snapToInteger} onChange={e => setSnapToInteger(e.target.checked)} className="sr-only" />
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${snapToInteger ? 'left-6' : 'left-1'}`}></div>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase group-hover:text-slate-700 transition-colors">Hela tal</span>
            </label>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto border-2 border-slate-100 rounded-2xl bg-slate-50/20 relative select-none scrollbar-thin w-full min-h-0"
      >
        <svg 
            ref={svgRef}
            width={totalWidth} 
            height="100%" 
            viewBox={`0 0 ${totalWidth} 260`} 
            className="cursor-crosshair block"
            onClick={handleLineClick}
            onMouseMove={(e) => {
              const pt = getSVGPoint(e.clientX, e.clientY);
              setHoverVal(getValFromX(pt.x));
            }}
            onMouseLeave={() => setHoverVal(null)}
        >
          <rect x="0" y="0" width={totalWidth} height="260" fill="transparent" />
          <line x1="0" y1={LINE_Y} x2={totalWidth} y2={LINE_Y} stroke="#334155" strokeWidth="3" strokeLinecap="round" className="pointer-events-none" />
          {Array.from({ length: totalUnits + 1 }).map((_, i) => {
            const val = range.min + i;
            const x = getX(val);
            const isZero = val === 0;
            const isMajor = val % 5 === 0;
            const shouldShowLabel = scale < 0.6 ? isMajor : true;
            return (
              <g key={val} className="pointer-events-none">
                <line 
                    x1={x} y1={LINE_Y - (isMajor ? 12 : 6)} x2={x} y2={LINE_Y + (isMajor ? 12 : 6)} 
                    stroke={isZero ? "#000" : (isMajor ? "#475569" : "#cbd5e1")} 
                    strokeWidth={isZero ? 4 : (isMajor ? 2 : 1)} 
                />
                {shouldShowLabel && (
                    <text x={x} y={LINE_Y + 38} textAnchor="middle" fontSize={isZero ? 24 : (isMajor ? 18 : 14)} fill={isZero ? '#000' : (isMajor ? '#334155' : '#94a3b8')} fontWeight={isZero || isMajor ? '900' : 'bold'} className="font-mono">{val}</text>
                )}
              </g>
            );
          })}
          {hoverVal !== null && (
              <g transform={`translate(${getX(hoverVal)}, ${LINE_Y})`} className="pointer-events-none">
                <circle r="8" fill="#3b82f6" opacity="0.2" className="animate-pulse" />
                <line y1="-10" y2="10" stroke="#3b82f6" strokeWidth="2" opacity="0.5" />
              </g>
          )}
          {jumps.map((jump, index) => {
            const x1 = getX(jump.start);
            const x2 = getX(jump.end);
            const midX = (x1 + x2) / 2;
            const diff = Math.abs(jump.end - jump.start);
            const height = Math.min(diff * 12 * scale, 120) + (index % 3) * 10;
            return (
              <g key={jump.id} className="pointer-events-none animate-in fade-in duration-300">
                <path d={`M ${x1} ${LINE_Y} Q ${midX} ${LINE_Y - height} ${x2} ${LINE_Y}`} fill="none" stroke={jump.color} strokeWidth="3.5" strokeDasharray={scale < 0.8 ? "none" : "8,5"} strokeLinecap="round" />
                <g transform={`translate(${midX}, ${LINE_Y - (height / 2) - 15})`}>
                    <rect x="-20" y="-10" width="40" height="20" rx="6" fill="white" stroke={jump.color} strokeWidth="2" />
                    <text textAnchor="middle" y="4" fontSize="11" fill={jump.color} fontWeight="900" className="font-mono">{jump.label}</text>
                </g>
              </g>
            );
          })}
          {hasSetStart && (
            <g transform={`translate(${getX(markerPos)}, ${LINE_Y})`} className="transition-transform duration-500 ease-out pointer-events-none">
                <circle r="12" fill="#3b82f6" stroke="white" strokeWidth="3" className="shadow-lg" />
                <circle r="18" fill="rgba(59, 130, 246, 0.2)" className="animate-pulse" />
            </g>
          )}
        </svg>
      </div>
      
      <div className="px-4 py-2 bg-slate-100/50 rounded-xl flex justify-between items-center shrink-0">
          <div className="flex gap-4">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] font-black text-slate-500 uppercase">Addition</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-[10px] font-black text-slate-500 uppercase">Subtraktion</span></div>
          </div>
          <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest italic animate-pulse">
              {!hasSetStart ? '1. Klicka på linjen eller skriv startposition' : '2. Klicka på linjen för att göra hopp'}
          </span>
      </div>
    </div>
  );
};
