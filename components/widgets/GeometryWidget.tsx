import React, { useState } from 'react';
import { Icons } from '../icons';

type Tool = 'RULER' | 'PROTRACTOR';
type Unit = 'CM' | 'MM';

interface GeometryWidgetProps {
    isTransparent?: boolean;
    setTransparent?: (v: boolean) => void;
}

export const GeometryWidget: React.FC<GeometryWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [activeTool, setActiveTool] = useState<Tool>('RULER');
  const [rotation, setRotation] = useState(0);
  const [rulerWidth, setRulerWidth] = useState(320);
  const [unit, setUnit] = useState<Unit>('CM');

  return (
    <div className={`transition-all duration-300 ${isTransparent ? 'w-auto' : 'w-[400px]'}`}>
      
      {/* Controls Bar */}
      {!isTransparent && (
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex justify-between items-center bg-slate-100 p-1 rounded-lg">
                <div className="flex gap-1">
                    <button
                    onClick={() => { setActiveTool('RULER'); setRotation(0); }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTool === 'RULER' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                    Linjal
                    </button>
                    <button
                    onClick={() => { setActiveTool('PROTRACTOR'); setRotation(0); }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTool === 'PROTRACTOR' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                    Gradskiva
                    </button>
                </div>
                
                {/* Transparency Toggle */}
                <button 
                    onClick={() => setTransparent?.(true)}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 bg-white border border-transparent hover:border-blue-100 rounded transition-all"
                    title="Gör genomskinlig (Flytta över objekt)"
                >
                    <Icons.Minimize size={14} /> Dölj Ram
                </button>
            </div>
            
            {activeTool === 'RULER' && (
                <div className="flex items-center gap-2 px-1">
                     <span className="text-xs font-bold text-slate-400">ENHET:</span>
                     <button onClick={() => setUnit('CM')} className={`text-xs px-2 py-1 rounded border ${unit === 'CM' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200'}`}>CM</button>
                     <button onClick={() => setUnit('MM')} className={`text-xs px-2 py-1 rounded border ${unit === 'MM' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200'}`}>MM</button>
                </div>
            )}
          </div>
      )}
      
      {/* Ghost Mode Restore Button */}
      {isTransparent && (
          <div className="absolute -top-10 right-0 z-50">
             <button 
                onClick={() => setTransparent?.(false)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white shadow-lg rounded-full text-xs font-bold hover:bg-blue-700 transition-transform hover:scale-105"
            >
                <Icons.Maximize size={14} /> Visa Kontroller
            </button>
          </div>
      )}

      {/* Canvas */}
      <div className={`relative flex items-center justify-center transition-all ${isTransparent ? 'h-auto p-10 overflow-visible' : 'h-[250px] border border-dashed border-slate-200 rounded bg-slate-50/50 overflow-hidden'}`}>
        
        {/* Rotation Controls (Floating) */}
        <div className={`absolute flex gap-1 z-50 ${isTransparent ? '-top-6 left-1/2 -translate-x-1/2' : 'top-2 right-2'}`}>
            <button onClick={() => setRotation(r => r - 45)} className="p-1.5 bg-white/90 backdrop-blur shadow-sm border border-slate-200 rounded hover:bg-slate-50 text-slate-600"><Icons.Rotate size={14} className="-scale-x-100" /></button>
            <button onClick={() => setRotation(0)} className="p-1.5 bg-white/90 backdrop-blur shadow-sm border border-slate-200 rounded hover:bg-slate-50 text-xs font-bold text-slate-600 px-2">0°</button>
            <button onClick={() => setRotation(r => r + 45)} className="p-1.5 bg-white/90 backdrop-blur shadow-sm border border-slate-200 rounded hover:bg-slate-50 text-slate-600"><Icons.Rotate size={14} /></button>
        </div>

        {activeTool === 'RULER' && (
          <div 
            className="group relative shadow-xl select-none flex transition-all duration-300"
            style={{ 
                width: `${rulerWidth}px`,
                transform: `rotate(${rotation}deg)`, 
                height: '64px',
                background: 'rgba(255, 255, 230, 0.85)', // Slight yellow tint
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                borderRadius: '4px'
            }}
          >
            {/* Ticks */}
            <div className="absolute bottom-0 w-full h-full flex overflow-hidden">
                {/* 
                    Logic: 
                    If CM: Ticks every 10px (representing mm), big tick every 100px (representing cm).
                    Actually, screen pixels != physical. Let's assume 10px = 1mm for readability in MM mode,
                    or stick to standard "unit" logic.
                    Let's scale: Base unit = 10px.
                    CM Mode: 10 units (100px) = 1 label.
                    MM Mode: 1 unit (10px) = 1 label (crowded) or 10 units = 10 label.
                */}
                {Array.from({length: Math.floor(rulerWidth / 10)}).map((_, i) => {
                    const isCmMark = i % 10 === 0;
                    const isMidMark = i % 5 === 0 && !isCmMark;
                    
                    return (
                    <div key={i} className="flex-1 border-r border-slate-800/30 h-full relative min-w-[10px]">
                        <div className={`absolute bottom-0 right-0 border-r border-slate-800/80 ${isCmMark ? 'h-6' : (isMidMark ? 'h-4' : 'h-2.5')}`}></div>
                         {isCmMark && (
                            <span className="absolute bottom-7 -right-2 text-[10px] font-bold text-slate-800">
                                {unit === 'CM' ? i/10 : i}
                            </span>
                         )}
                    </div>
                )})}
            </div>
            
            {/* Label */}
            <div className="absolute top-2 left-2 text-[10px] font-bold text-slate-400 opacity-50">{unit.toLowerCase()}</div>

            {/* Resize Handle */}
            <div className="absolute -right-2 top-0 h-full w-6 cursor-ew-resize flex items-center justify-center group-hover:bg-yellow-500/10 rounded-r"
                 onMouseDown={(e) => {
                     e.stopPropagation();
                     const startX = e.clientX;
                     const startW = rulerWidth;
                     const handleMove = (ev: MouseEvent) => {
                         setRulerWidth(Math.max(150, Math.min(800, startW + (ev.clientX - startX))));
                     };
                     const handleUp = () => {
                         window.removeEventListener('mousemove', handleMove);
                         window.removeEventListener('mouseup', handleUp);
                     }
                     window.addEventListener('mousemove', handleMove);
                     window.addEventListener('mouseup', handleUp);
                 }}
            >
                <div className="w-1.5 h-8 bg-slate-300 rounded-full"></div>
            </div>
          </div>
        )}

        {activeTool === 'PROTRACTOR' && (
           <div 
             className="w-80 h-40 relative shadow-xl origin-bottom"
             style={{ 
                 transform: `rotate(${rotation}deg)`, 
                 transition: 'transform 0.3s',
                 background: 'rgba(59, 130, 246, 0.15)',
                 backdropFilter: 'blur(4px)',
                 borderTopLeftRadius: '160px',
                 borderTopRightRadius: '160px',
                 border: '1px solid rgba(59, 130, 246, 0.4)',
                 borderBottom: 'none'
             }}
           >
              <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full -translate-x-1/2 translate-y-1/2 z-20 shadow-sm"></div>
              
              {/* Outer Ticks */}
              {Array.from({length: 19}).map((_, i) => {
                  const angle = i * 10; // 0 to 180
                  return (
                      <div 
                        key={i} 
                        className="absolute bottom-0 left-1/2 h-full w-[1px] origin-bottom"
                        style={{ transform: `rotate(${angle - 90}deg)` }}
                      >
                          <div className="absolute top-0 w-[1px] h-3 bg-blue-800/60"></div>
                          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-medium text-blue-900 -rotate-90">{angle}</span>
                      </div>
                  )
              })}

              {/* Inner Arc */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-t border-l border-r border-blue-400/30 rounded-t-full"></div>
              
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-blue-800 font-bold tracking-widest">MATTEYTAN</div>
           </div>
        )}
      </div>

      {!isTransparent && (
        <div className="mt-3 text-[10px] text-slate-400 text-center">
            Dra i högerkanten av linjalen för att förlänga den. Använd "Dölj Ram" för att lägga verktyget fritt över text.
        </div>
      )}
    </div>
  );
};