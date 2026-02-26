
import React, { useState, useRef, useCallback } from 'react';
import { Icons } from '../icons';

interface ProtractorWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

export const ProtractorWidget: React.FC<ProtractorWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullCircle, setIsFullCircle] = useState(false);
  
  // Two needles for relative measurement
  const [angleA, setAngleA] = useState(0);
  const [angleB, setAngleB] = useState(45);
  
  const protractorRef = useRef<HTMLDivElement>(null);

  const handleNeedleDrag = (e: React.MouseEvent | React.TouchEvent, target: 'A' | 'B') => {
      e.stopPropagation(); e.preventDefault();
      const update = (clientX: number, clientY: number) => {
          if (!protractorRef.current) return;
          const rect = protractorRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = isFullCircle ? rect.top + rect.height / 2 : rect.bottom;
          const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
          const finalAngle = (angle + 360 + 90) % 360;
          target === 'A' ? setAngleA(Math.round(finalAngle)) : setAngleB(Math.round(finalAngle));
      };
      const onMove = (mv: MouseEvent | TouchEvent) => {
          const c = 'touches' in mv ? mv.touches[0] : mv;
          update(c.clientX, c.clientY);
      };
      const onEnd = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onEnd); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
      window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onEnd);
  };

  const delta = Math.abs(angleA - angleB);
  const resultAngle = delta > 180 ? 360 - delta : delta;

  return (
    <div className="relative group p-16 select-none">
      {/* Precision Controls */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur shadow-xl border border-slate-200 rounded-full px-4 py-2 opacity-0 group-hover:opacity-100 transition-all z-50">
        <div className="flex items-center gap-1 border-r pr-2">
            <button onClick={() => setRotation(r => r - 15)} className="p-1.5 hover:bg-slate-100 rounded-full"><Icons.Rotate size={16} className="-scale-x-100" /></button>
            <button onClick={() => setRotation(0)} className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded-md">RESET</button>
            <button onClick={() => setRotation(r => r + 15)} className="p-1.5 hover:bg-slate-100 rounded-full"><Icons.Rotate size={16} /></button>
        </div>
        <button onClick={() => setIsFullCircle(!isFullCircle)} className={`text-[10px] font-black px-3 py-1 rounded-md border ${isFullCircle ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>{isFullCircle ? '360°' : '180°'}</button>
        <button onClick={() => setTransparent?.(!isTransparent)} className="p-1.5 text-slate-400"><Icons.Maximize size={18} /></button>
      </div>

      <div 
         ref={protractorRef}
         className={`relative shadow-2xl transition-all duration-300 border-2 ${isFullCircle ? 'rounded-full' : 'rounded-t-full border-b-0'}`}
         style={{ 
             width: `${340 * scale}px`, height: isFullCircle ? `${340 * scale}px` : `${170 * scale}px`,
             transform: `rotate(${rotation}deg)`, transformOrigin: isFullCircle ? 'center' : 'bottom center',
             background: isTransparent ? 'rgba(59, 130, 246, 0.05)' : 'rgba(240, 249, 255, 0.95)',
             borderColor: 'rgba(59, 130, 246, 0.3)'
         }}
      >
          {/* Ticks logic simplified for brevity */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
              {Array.from({length: isFullCircle ? 36 : 19}).map((_, i) => (
                  <div key={i} className="absolute bottom-0 left-1/2 h-full w-[1px] origin-bottom" style={{ height: isFullCircle ? '50%' : '100%', top: isFullCircle ? '0' : 'auto', transform: `rotate(${i*10-90}deg)` }}>
                      <div className="absolute top-0 w-[1px] h-3 bg-blue-900"></div>
                  </div>
              ))}
          </div>

          {/* Needle A (Reference) */}
          <div className="absolute z-40 origin-bottom left-1/2 flex flex-col items-center" style={{ bottom: isFullCircle ? '50%' : '0', height: '100%', transform: `translateX(-50%) rotate(${angleA}deg)`, pointerEvents: 'none' }}>
              <div className="w-[2px] h-[95%] bg-slate-400 relative">
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-slate-500 rounded-full border-2 border-white cursor-pointer pointer-events-auto shadow-md" onMouseDown={e => handleNeedleDrag(e, 'A')} onTouchStart={e => handleNeedleDrag(e, 'A')}></div>
              </div>
          </div>

          {/* Needle B (Active) */}
          <div className="absolute z-40 origin-bottom left-1/2 flex flex-col items-center" style={{ bottom: isFullCircle ? '50%' : '0', height: '100%', transform: `translateX(-50%) rotate(${angleB}deg)`, pointerEvents: 'none' }}>
              <div className="w-[3px] h-[95%] bg-blue-600 shadow-sm relative">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-7 h-7 bg-blue-600 rounded-full border-4 border-white cursor-pointer pointer-events-auto shadow-xl" onMouseDown={e => handleNeedleDrag(e, 'B')} onTouchStart={e => handleNeedleDrag(e, 'B')}></div>
              </div>
          </div>

          {/* Sikte / Center point */}
          <div className="absolute w-6 h-6 border-2 border-blue-500 rounded-full flex items-center justify-center pointer-events-none" style={{ left: '50%', bottom: isFullCircle ? '50%' : '0', transform: 'translate(-50%, 50%)' }}>
                <div className="w-px h-full bg-blue-500 absolute"></div>
                <div className="w-full h-px bg-blue-500 absolute"></div>
          </div>

          {/* Result Readout */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-2xl font-black text-lg flex items-center gap-3">
              <Icons.Rotate size={20} className="text-blue-200" />
              <span>{resultAngle}°</span>
          </div>
      </div>
      
      {/* Scaling */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 px-4 py-1 rounded-full border">
          <input type="range" min="0.5" max="2" step="0.1" value={scale} onChange={e => setScale(Number(e.target.value))} className="w-32 accent-blue-600" />
      </div>
    </div>
  );
};
