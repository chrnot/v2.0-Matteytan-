
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from '../icons';

interface ShapesWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

type ShapeMode = '2D' | '3D';
type ShapeType = 'SQUARE' | 'RECT' | 'TRIANGLE' | 'CIRCLE' | 'CUBE' | 'CYLINDER' | 'SPHERE' | 'CONE';

const SHAPE_NAMES: Record<ShapeType, string> = {
  SQUARE: 'Kvadrat',
  RECT: 'Rektangel',
  TRIANGLE: 'Triangel',
  CIRCLE: 'Cirkel',
  CUBE: 'Kub',
  CYLINDER: 'Cylinder',
  SPHERE: 'Klot',
  CONE: 'Kon'
};

export const ShapesWidget: React.FC<ShapesWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [mode, setMode] = useState<ShapeMode>('2D');
  const [shape, setShape] = useState<ShapeType>('RECT');
  
  const [width, setWidth] = useState(6);  
  const [height, setHeight] = useState(4); 
  
  const [showAnswer, setShowAnswer] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  
  const stateRef = useRef({ width, height, shape });
  useEffect(() => {
    stateRef.current = { width, height, shape };
  }, [width, height, shape]);

  const SCALE = 14; 
  const CX = 140;   
  const CY = 120;   

  const selectShape = (s: ShapeType) => {
      setShape(s);
      if (s === 'SQUARE' || s === 'CIRCLE' || s === 'CUBE' || s === 'SPHERE') {
          setHeight(width);
      }
  };

  const getSVGPoint = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    return pt.matrixTransform(ctm.inverse());
  }, []);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const svgPt = getSVGPoint(clientX, clientY);
      
      const pxW = stateRef.current.width * SCALE;
      const pxH = stateRef.current.height * SCALE;
      const isRound = stateRef.current.shape === 'CIRCLE' || stateRef.current.shape === 'SPHERE';
      
      const handleX = CX + (isRound ? pxW : pxW / 2);
      const handleY = CY + (isRound ? 0 : pxH / 2);

      dragOffset.current = {
          x: svgPt.x - handleX,
          y: svgPt.y - handleY
      };

      setIsDragging(true);
      document.body.style.cursor = 'nwse-resize';
  };

  useEffect(() => {
      if (!isDragging) return;

      const handleMove = (e: MouseEvent | TouchEvent) => {
          if (!svgRef.current) return;
          
          const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
          const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
          
          const svgPt = getSVGPoint(clientX, clientY);
          const currentShape = stateRef.current.shape;
          
          const targetX = svgPt.x - dragOffset.current.x;
          const targetY = svgPt.y - dragOffset.current.y;

          const dx = targetX - CX;
          const dy = targetY - CY;

          let newW: number;
          let newH: number;

          if (currentShape === 'CIRCLE' || currentShape === 'SPHERE') {
              const dist = Math.sqrt(dx * dx + dy * dy);
              newW = dist / SCALE;
              newH = newW;
          } else {
              newW = (Math.abs(dx) * 2) / SCALE;
              newH = (Math.abs(dy) * 2) / SCALE;
          }

          newW = Math.max(0.5, Math.min(18, newW));
          newH = Math.max(0.5, Math.min(16, newH));

          if (currentShape === 'SQUARE' || currentShape === 'CIRCLE' || currentShape === 'CUBE' || currentShape === 'SPHERE') {
              setWidth(newW);
              setHeight(newW);
          } else {
              setWidth(newW);
              setHeight(newH);
          }
      };

      const handleEnd = () => {
          setIsDragging(false);
          document.body.style.cursor = '';
      };

      window.addEventListener('mousemove', handleMove, { passive: true });
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);

      return () => {
          window.removeEventListener('mousemove', handleMove);
          window.removeEventListener('mouseup', handleEnd);
          window.removeEventListener('touchmove', handleMove);
          window.removeEventListener('touchend', handleEnd);
      };
  }, [isDragging, getSVGPoint]);

  const clean = (val: number) => Math.round(val * 10) / 10;

  const handleManualInput = (type: 'W' | 'H', val: string) => {
      const num = parseFloat(val) || 0;
      const clamped = Math.max(0.1, Math.min(18, num));
      
      if (type === 'W') {
          setWidth(clamped);
          if (shape === 'SQUARE' || shape === 'CIRCLE' || shape === 'CUBE' || shape === 'SPHERE') {
              setHeight(clamped);
          }
      } else {
          setHeight(clamped);
          if (shape === 'SQUARE' || shape === 'CUBE') {
              setWidth(clamped);
          }
      }
  };

  const getStats = () => {
      const w = clean(width);
      const h = clean(height);
      let results: { label: string, formula: string, calculation: string, value: string, unit: string }[] = [];

      switch(shape) {
          case 'SQUARE':
              results.push({ label: 'Area', formula: 's · s', calculation: `${w} · ${w}`, value: clean(w * w).toString(), unit: 'ae' });
              results.push({ label: 'Omkrets', formula: '4 · s', calculation: `4 · ${w}`, value: clean(4 * w).toString(), unit: 'le' });
              break;
          case 'RECT':
              results.push({ label: 'Area', formula: 'b · h', calculation: `${w} · ${h}`, value: clean(w * h).toString(), unit: 'ae' });
              results.push({ label: 'Omkrets', formula: '2(b + h)', calculation: `2(${w} + ${h})`, value: clean(2 * (w + h)).toString(), unit: 'le' });
              break;
          case 'TRIANGLE':
              results.push({ label: 'Area', formula: '(b · h) / 2', calculation: `(${w} · ${h}) / 2`, value: clean((w * h) / 2).toString(), unit: 'ae' });
              const side = Math.sqrt(Math.pow(h, 2) + Math.pow(w/2, 2));
              results.push({ label: 'Omkrets', formula: 'b + s₁ + s₂', calculation: `${w} + ${clean(side)} + ${clean(side)}`, value: (w + 2 * side).toFixed(1), unit: 'le' });
              break;
          case 'CIRCLE':
              results.push({ label: 'Area', formula: 'π · r²', calculation: `3,14 · ${w}²`, value: (Math.PI * w * w).toFixed(1), unit: 'ae' });
              results.push({ label: 'Omkrets', formula: '2 · π · r', calculation: `2 · 3,14 · ${w}`, value: (2 * Math.PI * w).toFixed(1), unit: 'le' });
              break;
          case 'CUBE':
              results.push({ label: 'Volym', formula: 's · s · s', calculation: `${w}³`, value: clean(Math.pow(w, 3)).toString(), unit: 've' });
              results.push({ label: 'Area', formula: '6 · s²', calculation: `6 · ${w}²`, value: clean(6 * w * w).toString(), unit: 'ae' });
              break;
          case 'CYLINDER':
              results.push({ label: 'Volym', formula: 'π · r² · h', calculation: `3,14 · ${w}² · ${h}`, value: (Math.PI * w * w * h).toFixed(1), unit: 've' });
              results.push({ label: 'Mantelyta', formula: '2 · π · r · h', calculation: `2 · 3,14 · ${w} · ${h}`, value: (2 * Math.PI * w * h).toFixed(1), unit: 'ae' });
              break;
          case 'SPHERE':
              results.push({ label: 'Volym', formula: '(4π · r³) / 3', calculation: `(4 · 3,14 · ${w}³) / 3`, value: ((4/3) * Math.PI * Math.pow(w, 3)).toFixed(1), unit: 've' });
              results.push({ label: 'Area', formula: '4 · π · r²', calculation: `4 · 3,14 · ${w}²`, value: (4 * Math.PI * w * w).toFixed(1), unit: 'ae' });
              break;
          case 'CONE':
              results.push({ label: 'Volym', formula: '(π · r² · h) / 3', calculation: `(3,14 · ${w}² · ${h}) / 3`, value: ((1/3) * Math.PI * w * w * h).toFixed(1), unit: 've' });
              results.push({ label: 'Basarea', formula: 'π · r²', calculation: `3,14 · ${w}²`, value: (Math.PI * w * w).toFixed(1), unit: 'ae' });
              break;
      }
      return results;
  };

  const stats = getStats();
  const pxW = width * SCALE;
  const pxH = height * SCALE;

  const isLockedRatio = shape === 'SQUARE' || shape === 'CIRCLE' || shape === 'CUBE' || shape === 'SPHERE';

  return (
    <div className="w-full h-full flex flex-col gap-3 relative">
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
               <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Former & Geometri</h4>
               <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
            </div>
            <div className="space-y-4 text-xs leading-relaxed text-slate-600">
              <p>Utforska geometriska figurer i 2D och kroppar i 3D. Se hur ändringar i mått direkt påverkar area, omkrets och volym.</p>
              <section className="space-y-2">
                <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong>Läge:</strong> Växla mellan 2D (ytor) och 3D (volymer) i menyn högst upp.</li>
                  <li><strong>Ändra form:</strong> Dra i den orangea pricken direkt på figuren för att ändra dess storlek interaktivt.</li>
                  <li><strong>Beräkningar:</strong> Se formler och steg-för-steg-uträkningar i panelen till höger.</li>
                  <li><strong>Precision:</strong> Du kan även skriva in exakta mått i rutorna längst ner.</li>
                </ul>
              </section>
            </div>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex bg-slate-200 p-1 rounded-xl shrink-0 pr-10">
            <button 
                onClick={() => { setMode('2D'); selectShape('RECT'); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === '2D' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                2D-Figurer
            </button>
            <button 
                onClick={() => { setMode('3D'); selectShape('CUBE'); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === '3D' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                3D-Kroppar
            </button>
        </div>

        {/* Shape Buttons */}
        <div className="flex justify-center flex-wrap bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
            {(mode === '2D' ? ['SQUARE', 'RECT', 'TRIANGLE', 'CIRCLE'] : ['CUBE', 'CYLINDER', 'SPHERE', 'CONE']).map((s) => (
                <button 
                    key={s}
                    onClick={() => selectShape(s as ShapeType)} 
                    className={`p-2 rounded-lg transition-all ${shape === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} 
                    title={SHAPE_NAMES[s as ShapeType]}
                >
                    {s === 'SQUARE' && <div className="w-4 h-4 border-2 border-current rounded-sm"></div>}
                    {s === 'RECT' && <div className="w-5 h-3 border-2 border-current rounded-sm"></div>}
                    {s === 'TRIANGLE' && <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-current"></div>}
                    {s === 'CIRCLE' && <div className="w-4 h-4 border-2 border-current rounded-full"></div>}
                    {s === 'CUBE' && <Icons.Cube size={18} />}
                    {s === 'CYLINDER' && <div className="w-3 h-5 border-2 border-current rounded-full"></div>}
                    {s === 'SPHERE' && <div className="w-4 h-4 border-2 border-current rounded-full bg-current opacity-20"></div>}
                    {s === 'CONE' && <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[12px] border-l-transparent border-r-transparent border-b-current rounded-b-full"></div>}
                </button>
            ))}
        </div>

        {/* Workspace: Figure (Left) + Calculations (Right) */}
        <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0">
            {/* Figure Canvas */}
            <div className={`transition-all duration-500 flex-col items-center justify-center overflow-hidden bg-slate-50 border border-slate-200 rounded-xl relative flex ${showAnswer ? 'flex-[2]' : 'flex-1'}`}>
                 <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-white/80 backdrop-blur border border-slate-100 rounded-full shadow-sm z-10 pointer-events-none">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{SHAPE_NAMES[shape]}</span>
                 </div>

                 <svg 
                    ref={svgRef} 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 280 240" 
                    className="overflow-visible touch-none select-none"
                 >
                    <g className="pointer-events-none">
                        {shape === 'SQUARE' && <g><rect x={CX - pxW/2} y={CY - pxW/2} width={pxW} height={pxW} fill="#bfdbfe" stroke="#3b82f6" strokeWidth="3" rx="4" />{showLabels && <text x={CX} y={CY + pxW/2 + 22} textAnchor="middle" className="text-[14px] font-black fill-slate-700">s = {clean(width)}</text>}</g>}
                        {shape === 'RECT' && <g><rect x={CX - pxW/2} y={CY - pxH/2} width={pxW} height={pxH} fill="#fed7aa" stroke="#f97316" strokeWidth="3" rx="4" />{showLabels && <><text x={CX} y={CY + pxH/2 + 22} textAnchor="middle" className="text-[14px] font-black fill-slate-700">b = {clean(width)}</text><text x={CX - pxW/2 - 18} y={CY} textAnchor="middle" className="text-[14px] font-black fill-slate-700 -rotate-90 origin-center" style={{transformBox: 'fill-box'}}>h = {clean(height)}</text></>}</g>}
                        {shape === 'TRIANGLE' && <g><polygon points={`${CX},${CY - pxH/2} ${CX - pxW/2},${CY + pxH/2} ${CX + pxW/2},${CY + pxH/2}`} fill="#bbf7d0" stroke="#22c55e" strokeWidth="3" /><line x1={CX} y1={CY - pxH/2} x2={CX} y2={CY + pxH/2} stroke="#15803d" strokeWidth="1" strokeDasharray="4 4" />{showLabels && <><text x={CX} y={CY + pxH/2 + 22} textAnchor="middle" className="text-[14px] font-black fill-slate-700">b = {clean(width)}</text><text x={CX + 15} y={CY} className="text-[14px] font-black fill-slate-700">h = {clean(height)}</text></>}</g>}
                        {shape === 'CIRCLE' && <g><circle cx={CX} cy={CY} r={pxW} fill="#e9d5ff" stroke="#a855f7" strokeWidth="3" /><line x1={CX} y1={CY} x2={CX + pxW} y2={CY} stroke="#6b21a8" strokeWidth="2" />{showLabels && <text x={CX + pxW/2} y={CY - 12} textAnchor="middle" className="text-[14px] font-black fill-slate-700">r = {clean(width)}</text>}</g>}

                        {shape === 'CUBE' && (
                            <g transform={`translate(${CX - pxW/2}, ${CY - pxW/2})`}>
                                <rect width={pxW} height={pxW} fill="#3b82f6" opacity="0.8" stroke="#1d4ed8" strokeWidth="1" />
                                <path d={`M0,0 L15,-15 L${pxW+15},-15 L${pxW},0 Z`} fill="#60a5fa" stroke="#1d4ed8" strokeWidth="1" />
                                <path d={`M${pxW},0 L${pxW+15},-15 L${pxW+15},${pxW-15} L${pxW},${pxW} Z`} fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                                {showLabels && <text x={pxW/2} y={pxW + 22} textAnchor="middle" className="text-[14px] font-black fill-slate-700">s = {clean(width)}</text>}
                            </g>
                        )}
                        {shape === 'CYLINDER' && (
                            <g transform={`translate(${CX}, ${CY})`}>
                                <ellipse cx="0" cy={pxH/2} rx={pxW} ry={pxW/3} fill="#f97316" stroke="#c2410c" strokeWidth="1" />
                                <rect x={-pxW} y={-pxH/2} width={pxW*2} height={pxH} fill="#fb923c" stroke="#c2410c" strokeWidth="1" />
                                <ellipse cx="0" cy={-pxH/2} rx={pxW} ry={pxW/3} fill="#fdba74" stroke="#ea580c" strokeWidth="2" />
                                {showLabels && <><text x={pxW + 20} y="0" className="text-[14px] font-black fill-slate-700">h = {clean(height)}</text><text x="0" y={-pxH/2 - pxW/3 - 12} textAnchor="middle" className="text-[14px] font-black fill-slate-700">r = {clean(width)}</text></>}
                            </g>
                        )}
                        {shape === 'SPHERE' && (
                            <g transform={`translate(${CX}, ${CY})`}>
                                <circle r={pxW} fill="#7e22ce" stroke="#6b21a8" strokeWidth="2" opacity="0.8" />
                                <ellipse cx="0" cy="0" rx={pxW} ry={pxW/3} fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
                                {showLabels && <text x={pxW/2} y="-12" textAnchor="middle" className="text-[14px] font-black fill-white drop-shadow-sm">r = {clean(width)}</text>}
                            </g>
                        )}
                        {shape === 'CONE' && (
                            <g transform={`translate(${CX}, ${CY})`}>
                                <ellipse cx="0" cy={pxH/2} rx={pxW} ry={pxW/3} fill="#bbf7d0" stroke="#166534" strokeWidth="2" />
                                <path d={`M${-pxW},${pxH/2} L0,${-pxH/2} L${pxW},${pxH/2} Z`} fill="#4ade80" stroke="#166534" strokeWidth="1" />
                                {showLabels && <><text x={pxW + 15} y="0" className="text-[14px] font-black fill-slate-700">h = {clean(height)}</text><text x="0" y={pxH/2 + pxW/3 + 18} textAnchor="middle" className="text-[14px] font-black fill-slate-700">r = {clean(width)}</text></>}
                            </g>
                        )}
                    </g>

                    <circle 
                      cx={CX + (shape === 'CIRCLE' || shape === 'SPHERE' ? pxW : pxW/2)} 
                      cy={CY + (shape === 'CIRCLE' || shape === 'SPHERE' ? 0 : pxH/2)} 
                      r="14" 
                      fill="#f59e0b" 
                      stroke="white" 
                      strokeWidth="3" 
                      onMouseDown={handleStart} 
                      onTouchStart={handleStart}
                      className="cursor-nwse-resize shadow-xl active:scale-125 transition-transform" 
                      style={{ pointerEvents: 'all' }}
                    />
                 </svg>
            </div>

            {/* Calculations List (Right Side) */}
            {showAnswer && (
                <div className="flex-1 min-w-[140px] bg-white border border-slate-200 rounded-xl p-3 overflow-y-auto space-y-3 shadow-inner animate-in slide-in-from-right-4 duration-300">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-100 pb-1">Uträkning</div>
                    {stats.map((s, i) => (
                        <div key={i} className="animate-in slide-in-from-right-2 fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="text-[10px] font-bold text-blue-600 uppercase mb-0.5">{s.label}</div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <div className="text-[10px] font-mono text-slate-400 italic mb-1">
                                    Formel: <span className="font-bold text-slate-600">{s.formula}</span>
                                </div>
                                <div className="text-xs font-mono font-bold text-slate-700">
                                    {s.calculation} =
                                </div>
                                <div className="text-xl font-black text-blue-800 leading-none mt-1">
                                    {s.value} <span className="text-[10px] font-normal text-blue-400">{s.unit}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Manual Input Controls */}
        <div className="bg-slate-100 p-3 rounded-xl flex gap-3 shrink-0 shadow-inner">
             <div className="flex-1 flex flex-col gap-1">
                 <label className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                    {shape === 'CIRCLE' || shape === 'SPHERE' || shape === 'CYLINDER' || shape === 'CONE' ? 'Radie (r)' : 'Bas / Sida (b/s)'}
                 </label>
                 <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        step="0.1"
                        value={clean(width)}
                        onChange={(e) => handleManualInput('W', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-bold text-slate-700 text-xs focus:ring-2 ring-blue-200 outline-none"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">le</span>
                 </div>
             </div>

             {!isLockedRatio && (
                <div className="flex-1 flex flex-col gap-1 animate-in fade-in duration-300">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Höjd (h)</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            step="0.1"
                            value={clean(height)}
                            onChange={(e) => handleManualInput('H', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-bold text-slate-700 text-xs focus:ring-2 ring-blue-200 outline-none"
                        />
                        <span className="text-[10px] text-slate-400 font-bold">le</span>
                    </div>
                </div>
             )}
             <div className="flex items-end pb-1 gap-2 px-1">
                <button 
                    onClick={() => setShowLabels(!showLabels)} 
                    className={`p-2 rounded-lg transition-all ${showLabels ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-600'}`}
                    title={showLabels ? "Dölj etiketter" : "Visa etiketter"}
                >
                    <Icons.Book size={16} />
                </button>
                <button 
                    onClick={() => setShowAnswer(!showAnswer)} 
                    className={`p-2 rounded-lg transition-all ${showAnswer ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-600'}`}
                    title={showAnswer ? "Dölj uträkning" : "Visa uträkning"}
                >
                    <Icons.Math size={16} />
                </button>
             </div>
        </div>
    </div>
  );
};
