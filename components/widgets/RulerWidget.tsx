
import React, { useState, useRef, useCallback } from 'react';
import { Icons } from '../icons';

interface RulerWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

export const RulerWidget: React.FC<RulerWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [rotation, setRotation] = useState(0);
  const [rulerWidth, setRulerWidth] = useState(600);
  const [unit, setUnit] = useState<'CM' | 'MM'>('CM');
  const [posA, setPosA] = useState(40);
  const [posB, setPosB] = useState(240);
  const [snap, setSnap] = useState(true);
  
  // Konstanter för skalan
  const PX_PER_CM = 40;
  const PX_PER_MM = PX_PER_CM / 10;

  const rotate = (deg: number) => setRotation(r => (r + deg) % 360);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent, target: 'A' | 'B') => {
    e.stopPropagation();
    const isTouch = 'touches' in e;
    const startX = isTouch ? e.touches[0].clientX : e.clientX;
    const initialPos = target === 'A' ? posA : posB;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
        const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
        const delta = currentX - startX;
        let newPos = initialPos + delta;
        
        if (snap) {
            // Snäpp till närmaste millimeter
            newPos = Math.round(newPos / PX_PER_MM) * PX_PER_MM;
        }
        
        newPos = Math.max(0, Math.min(rulerWidth, newPos));
        target === 'A' ? setPosA(newPos) : setPosB(newPos);
    };

    const onEnd = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  };

  // Beräkna avståndet baserat på vår PX_PER_CM skala
  const distCm = Math.abs(posA - posB) / PX_PER_CM;

  return (
    <div className="relative group p-20 select-none flex items-center justify-center">
      {/* Precision Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur shadow-2xl border border-slate-200 rounded-full px-4 py-2 opacity-0 group-hover:opacity-100 transition-all z-50">
        <div className="flex items-center gap-1 border-r pr-2 border-slate-200">
            <button onClick={() => rotate(-1)} className="p-1 hover:bg-slate-100 rounded text-slate-400 text-[10px] font-bold">1°</button>
            <button onClick={() => rotate(-15)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600"><Icons.Rotate size={16} className="-scale-x-100" /></button>
            <button onClick={() => setRotation(0)} className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded-md">0°</button>
            <button onClick={() => rotate(15)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600"><Icons.Rotate size={16} /></button>
            <button onClick={() => rotate(1)} className="p-1 hover:bg-slate-100 rounded text-slate-400 text-[10px] font-bold">1°</button>
        </div>
        
        <div className="flex items-center gap-1 border-r pr-2 border-slate-200">
            <button onClick={() => setSnap(!snap)} className={`text-[10px] font-black px-2 py-1 rounded-md border transition-all ${snap ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-white text-slate-400 border-slate-200'}`}>SNAP</button>
            <button onClick={() => setUnit(unit === 'CM' ? 'MM' : 'CM')} className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded-md uppercase">{unit}</button>
        </div>

        <button 
          onClick={() => setTransparent?.(!isTransparent)} 
          className={`p-1.5 rounded-full transition-colors ${isTransparent ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
          title="Växla genomskinlighet"
        >
          <Icons.Maximize size={18} />
        </button>
      </div>

      {/* Ruler Body */}
      <div 
        className="relative shadow-2xl transition-transform duration-300 flex items-end"
        style={{ 
            width: `${rulerWidth}px`,
            transform: `rotate(${rotation}deg)`, 
            height: '80px',
            background: isTransparent ? 'rgba(255, 255, 245, 0.4)' : 'rgba(255, 255, 245, 0.95)',
            backdropFilter: isTransparent ? 'blur(2px)' : 'none',
            border: '1px solid rgba(180, 150, 50, 0.3)',
            borderRadius: '4px'
        }}
      >
        {/* Ticks Container */}
        <div className="absolute inset-0 flex pointer-events-none overflow-hidden">
            {/* Vi ritar mm-streck med loop */}
            {Array.from({length: Math.floor(rulerWidth / PX_PER_MM) + 1}).map((_, i) => {
                const isCm = i % 10 === 0;
                const isHalfCm = i % 5 === 0 && !isCm;
                
                return (
                    <div 
                      key={i} 
                      className="absolute bottom-0 border-r border-slate-900/20" 
                      style={{ 
                        left: `${i * PX_PER_MM}px`,
                        height: isCm ? '30px' : isHalfCm ? '20px' : '10px',
                        borderColor: isCm ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'
                      }}
                    >
                        {isCm && (
                          <span className="absolute bottom-8 -right-2 text-[11px] font-black text-slate-800">
                            {i / 10}
                          </span>
                        )}
                    </div>
                )
            })}
        </div>

        {/* Marker A */}
        <div 
          className="absolute top-0 bottom-0 z-30 flex flex-col items-center cursor-ew-resize group/ma" 
          style={{ left: posA, transform: 'translateX(-50%)' }} 
          onMouseDown={e => handleDrag(e, 'A')} 
          onTouchStart={e => handleDrag(e, 'A')}
        >
            <div className="text-[10px] font-black text-blue-600 mb-1 opacity-0 group-hover/ma:opacity-100 transition-opacity bg-white px-1 rounded shadow-sm">A</div>
            <div className="w-[2px] h-full bg-blue-500 shadow-[0_0_8px_blue]"></div>
            <div className="w-5 h-5 bg-blue-600 rounded-full border-2 border-white -mt-2.5 shadow-lg flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
        </div>

        {/* Marker B */}
        <div 
          className="absolute top-0 bottom-0 z-30 flex flex-col items-center cursor-ew-resize group/mb" 
          style={{ left: posB, transform: 'translateX(-50%)' }} 
          onMouseDown={e => handleDrag(e, 'B')} 
          onTouchStart={e => handleDrag(e, 'B')}
        >
            <div className="text-[10px] font-black text-red-600 mb-1 opacity-0 group-hover/mb:opacity-100 transition-opacity bg-white px-1 rounded shadow-sm">B</div>
            <div className="w-[2px] h-full bg-red-500 shadow-[0_0_8px_red]"></div>
            <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-white -mt-2.5 shadow-lg flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
        </div>

        {/* Delta Reading - Syncat med PX_PER_CM */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1.5 rounded-xl text-xs font-black flex gap-3 items-center shadow-2xl border border-slate-700">
            <span className="text-slate-500 uppercase tracking-tighter text-[10px]">Avstånd:</span>
            <span className="text-amber-400 text-sm font-mono">
                {unit === 'CM' ? distCm.toFixed(1) : Math.round(distCm * 10)} {unit.toLowerCase()}
            </span>
        </div>

        {/* Length Control (Handle at the end) */}
        <div 
          className="absolute -right-3 top-0 bottom-0 w-8 cursor-ew-resize flex items-center justify-center group-hover:bg-black/5 rounded-r transition-colors" 
          onMouseDown={e => {
              e.stopPropagation();
              const startX = e.clientX; 
              const startW = rulerWidth;
              const move = (ev: MouseEvent) => setRulerWidth(Math.max(120, Math.min(1600, startW + (ev.clientX - startX))));
              const end = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end); };
              window.addEventListener('mousemove', move); 
              window.addEventListener('mouseup', end);
          }}
        >
          <div className="w-1.5 h-12 bg-slate-300 rounded-full group-hover:bg-amber-400 transition-colors"></div>
        </div>
      </div>
    </div>
  );
};
