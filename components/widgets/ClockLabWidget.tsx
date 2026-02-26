
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icons } from '../icons';

type ViewMode = 'ANALOG' | 'DIGITAL' | 'HYBRID';

interface ClockLabWidgetProps {
  id?: string;
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

export const ClockLabWidget: React.FC<ClockLabWidgetProps> = () => {
  const [totalMinutes, setTotalMinutes] = useState(14 * 60 + 35);
  const [viewMode, setViewMode] = useState<ViewMode>('HYBRID');
  const [is24h, setIs24h] = useState(false);
  const [showSectors, setShowSectors] = useState(false);
  const [isRealtime, setIsRealtime] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef<null | 'MINUTE' | 'HOUR'>(null);

  const hours = Math.floor(totalMinutes / 60) % 24;
  const displayHours = is24h ? hours : hours % 12 || 12;
  const mins = totalMinutes % 60;

  useEffect(() => {
    if (!isRealtime) return;
    const interval = setInterval(() => {
      const now = new Date();
      setTotalMinutes(now.getHours() * 60 + now.getMinutes());
    }, 1000);
    return () => clearInterval(interval);
  }, [isRealtime]);

  const swedishTimeText = useMemo(() => {
    const roundedMins = Math.round(mins / 5) * 5;
    const isExact = mins === roundedMins;
    const hTalk = (roundedMins >= 25 ? hours + 1 : hours) % 24;
    const hNames = ["tolv", "ett", "två", "tre", "fyra", "fem", "sex", "sju", "åtta", "nio", "tio", "elva", "tolv", "ett", "två", "tre", "fyra", "fem", "sex", "sju", "åtta", "nio", "tio", "elva"];
    const hName = hNames[hTalk];
    const prefix = isExact ? "" : "ungefär ";
    let verbal = "";
    if (roundedMins === 0 || roundedMins === 60) verbal = `${hName} prick`;
    else if (roundedMins === 5) verbal = `fem över ${hName}`;
    else if (roundedMins === 10) verbal = `tio över ${hName}`;
    else if (roundedMins === 15) verbal = `kvart över ${hName}`;
    else if (roundedMins === 20) verbal = `tjugo över ${hName}`;
    else if (roundedMins === 25) verbal = `fem i halv ${hName}`;
    else if (roundedMins === 30) verbal = `halv ${hName}`;
    else if (roundedMins === 35) verbal = `fem över halv ${hName}`;
    else if (roundedMins === 40) verbal = `tjugo i ${hName}`;
    else if (roundedMins === 45) verbal = `kvart i ${hName}`;
    else if (roundedMins === 50) verbal = `tio i ${hName}`;
    else if (roundedMins === 55) verbal = `fem i ${hName}`;
    if (!verbal) return `${hours}:${mins < 10 ? '0' + mins : mins}`;
    return prefix + verbal;
  }, [hours, mins]);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI) + 90;
    const normalizedAngle = (angle + 360) % 360;
    if (isDragging.current === 'MINUTE') {
      const newMins = Math.round(normalizedAngle / 6) % 60;
      let diff = newMins - (totalMinutes % 60);
      if (diff < -30) diff += 60; if (diff > 30) diff -= 60;
      setTotalMinutes(prev => (prev + diff + 1440) % 1440);
    } else {
      const hOffset = hours >= 12 ? 720 : 0;
      setTotalMinutes(Math.round((normalizedAngle / 360) * 720 + hOffset) % 1440);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white select-none relative">
      
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
             <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Klock-Labbet</h4>
             <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <p>Klock-Labbet hjälper dig att förstå sambandet mellan analog tid, digital tid och hur vi pratar om tid.</p>
            <section className="space-y-2">
              <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
              <ul className="space-y-1.5 list-disc pl-4">
                <li><strong>Dra visarna:</strong> Flytta minutvisaren (blå) eller timvisaren (röd) för att ändra tiden.</li>
                <li><strong>Hybrid-vy:</strong> Se hur den digitala klockan och talspråket nere i rutan ändras i realtid när du rör visarna.</li>
                <li><strong>Tidspass:</strong> Klicka på rotations-ikonen 🔄 för att markera en starttid. Dra sedan visarna framåt för att se hur många minuter som passerat.</li>
                <li><strong>Sektorer:</strong> Klicka på tårt-ikonen 🥧 för att visualisera "i" och "över" som färgade halvor.</li>
              </ul>
            </section>
          </div>
        </div>
      )}

      {/* View Modes & Settings */}
      <div className="flex flex-wrap items-center justify-between p-3 gap-2 bg-slate-50 border-b border-slate-200 shrink-0 pr-10">
        <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
          {(['ANALOG', 'DIGITAL', 'HYBRID'] as ViewMode[]).map(m => (
            <button key={m} onClick={() => setViewMode(m)} className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${viewMode === m ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>{m === 'ANALOG' ? 'Analog' : m === 'DIGITAL' ? 'Digital' : 'Hybrid'}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSectors(!showSectors)} className={`p-2 rounded-lg border transition-all ${showSectors ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'}`}><Icons.PieChart size={18} /></button>
          <button onClick={() => setIs24h(!is24h)} className={`px-3 py-1.5 rounded-lg border text-[10px] font-black transition-all ${is24h ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}>24H</button>
          <button onClick={() => setStartTime(startTime === null ? totalMinutes : null)} className={`p-2 rounded-lg border transition-all ${startTime !== null ? 'bg-amber-100 border-amber-300 text-amber-600 shadow-inner' : 'bg-white border-slate-200 text-slate-400'}`}><Icons.Rotate size={18} /></button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 sm:p-6 gap-4 sm:gap-8 overflow-hidden min-h-0" onMouseMove={handleDrag} onMouseUp={() => isDragging.current = null} onTouchMove={handleDrag} onTouchEnd={() => isDragging.current = null}>
        {(viewMode === 'ANALOG' || viewMode === 'HYBRID') && (
          <div className="relative flex-1 flex items-center justify-center w-full h-full max-w-[360px] aspect-square animate-in zoom-in duration-500">
            <svg ref={svgRef} viewBox="0 0 300 300" className="w-full h-full drop-shadow-2xl overflow-visible">
              <circle cx="150" cy="150" r="145" fill="white" stroke="#e2e8f0" strokeWidth="2" />
              {showSectors && <g opacity="0.15"><path d="M 150,150 L 150,10 A 140,140 0 0,1 150,290 Z" fill="#22c55e" /><path d="M 150,150 L 150,290 A 140,140 0 0,1 150,10 Z" fill="#ef4444" /></g>}
              {startTime !== null && (
                <g opacity="0.3">
                  <line x1="150" y1="150" x2={150 + 80 * Math.sin((startTime % 720) * 0.5 * Math.PI / 180)} y2={150 - 80 * Math.cos((startTime % 720) * 0.5 * Math.PI / 180)} stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
                  <path d={`M 150,150 L ${150 + 120 * Math.sin((startTime % 60) * 6 * Math.PI / 180)} ${150 - 120 * Math.cos((startTime % 60) * 6 * Math.PI / 180)} A 120 120 0 ${Math.abs(mins - (startTime % 60)) > 30 ? 1 : 0} 1 ${150 + 120 * Math.sin(mins * 6 * Math.PI / 180)} ${150 - 120 * Math.cos(mins * 6 * Math.PI / 180)} Z`} fill="#fbbf24" opacity="0.5" />
                </g>
              )}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i + 1) * 30;
                const x = 150 + 115 * Math.sin(angle * Math.PI / 180);
                const y = 150 - 115 * Math.cos(angle * Math.PI / 180);
                return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-xl font-black fill-slate-800 font-mono">{i + 1}</text>;
              })}
              <g className="cursor-pointer" style={{ transform: `rotate(${(totalMinutes % 720) * 0.5}deg)`, transformOrigin: '150px 150px' }} onMouseDown={() => isDragging.current = 'HOUR'} onTouchStart={() => isDragging.current = 'HOUR'}>
                <line x1="150" y1="150" x2="150" y2="80" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
              </g>
              <g className="cursor-pointer" style={{ transform: `rotate(${mins * 6}deg)`, transformOrigin: '150px 150px' }} onMouseDown={() => isDragging.current = 'MINUTE'} onTouchStart={() => isDragging.current = 'MINUTE'}>
                <line x1="150" y1="150" x2="150" y2="40" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
              </g>
              <circle cx="150" cy="150" r="4" fill="#334155" />
            </svg>
          </div>
        )}
        {(viewMode === 'DIGITAL' || viewMode === 'HYBRID') && (
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-4 duration-500">
            <span className="text-red-500 text-7xl font-black font-mono">{displayHours.toString().padStart(2, '0')}</span>
            <span className="text-7xl font-black text-slate-700 animate-pulse">:</span>
            <span className="text-blue-500 text-7xl font-black font-mono">{mins.toString().padStart(2, '0')}</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="max-w-xl mx-auto flex items-center gap-4 bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100">
             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0"><Icons.Math size={20} /></div>
             <div className="flex-1 min-w-0"><span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">Svenskt talstöd</span><p className="text-base sm:text-xl font-bold text-slate-700 leading-tight">Klockan är <span className="text-blue-600 underline decoration-2 underline-offset-4">{swedishTimeText}</span>.</p></div>
             {startTime !== null && <div className="px-2 sm:px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 font-bold text-[10px] sm:text-xs">Δ {Math.abs(totalMinutes - startTime)} min</div>}
          </div>
      </div>
    </div>
  );
};
