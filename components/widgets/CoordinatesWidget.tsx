
import React, { useState, useRef, useMemo } from 'react';
import { Icons } from '../icons';

interface CoordinatesWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

interface Point {
    id: number;
    x: number;
    y: number;
}

interface LineSeries {
    id: string;
    name: string;
    color: string;
    points: Point[];
}

const LINE_CONFIGS = [
    { id: 'A', name: 'Linje A', color: '#3b82f6' },
    { id: 'B', name: 'Linje B', color: '#ef4444' },
    { id: 'C', name: 'Linje C', color: '#10b981' },
];

export const CoordinatesWidget: React.FC<CoordinatesWidgetProps> = ({ isTransparent }) => {
  const [lines, setLines] = useState<LineSeries[]>(
    LINE_CONFIGS.map(cfg => ({ ...cfg, points: [] }))
  );
  const [activeLineId, setActiveLineId] = useState<string>('A');
  const [showInfo, setShowInfo] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const GRID_SIZE = 20; 
  const CANVAS_SIZE = 400; 
  const STEP = CANVAS_SIZE / GRID_SIZE; 
  const ORIGIN = CANVAS_SIZE / 2; 

  const toPx = (val: number, isY: boolean = false) => isY ? ORIGIN - (val * STEP) : ORIGIN + (val * STEP);
  const toCoord = (px: number, isY: boolean = false) => Math.round(isY ? (ORIGIN - px) / STEP : (px - ORIGIN) / STEP);

  const activeLine = useMemo(() => lines.find(l => l.id === activeLineId)!, [lines, activeLineId]);

  const getEquationData = (points: Point[]) => {
      if (points.length < 2) return null;
      const sortedPoints = [...points].sort((a, b) => a.x - b.x);
      const p1 = sortedPoints[0];
      const p2 = sortedPoints[sortedPoints.length - 1];
      
      if (p2.x === p1.x) return { x1: toPx(p1.x), y1: 0, x2: toPx(p1.x), y2: CANVAS_SIZE, equation: `x = ${p1.x}` };
      
      const k = (p2.y - p1.y) / (p2.x - p1.x);
      const m = p1.y - k * p1.x;
      
      const startX = -10; const endX = 10;
      const startY = k * startX + m; const endY = k * endX + m;
      
      const formatNum = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(1);
      
      let kPart = k === 1 ? 'x' : k === -1 ? '-x' : k === 0 ? '' : `${formatNum(k)}x`;
      let mPart = m === 0 ? '' : (m > 0 ? (k === 0 ? formatNum(m) : ` + ${formatNum(m)}`) : ` - ${formatNum(Math.abs(m))}`);
      
      let eqString = `y = ${kPart}${mPart}`;
      if (k === 0 && m === 0) eqString = "y = 0";
      
      return { x1: toPx(startX), y1: toPx(startY, true), x2: toPx(endX), y2: toPx(endY, true), equation: eqString };
  };

  const handleSvgClick = (e: React.MouseEvent | React.TouchEvent) => {
      if (!svgRef.current) return;
      const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
      const rect = svgRef.current.getBoundingClientRect();
      const x = toCoord(((clientX - rect.left) / rect.width) * CANVAS_SIZE, false);
      const y = toCoord(((clientY - rect.top) / rect.height) * CANVAS_SIZE, true);
      
      if (x < -10 || x > 10 || y < -10 || y > 10) return;

      setLines(prev => prev.map(line => {
          if (line.id !== activeLineId) return line;
          const exists = line.points.some(p => p.x === x && p.y === y);
          if (exists) return { ...line, points: line.points.filter(p => !(p.x === x && p.y === y)) };
          return { ...line, points: [...line.points, { id: Date.now(), x, y }] };
      }));
  };

  const removePoint = (pointId: number) => {
    setLines(prev => prev.map(line => 
        line.id === activeLineId 
            ? { ...line, points: line.points.filter(p => p.id !== pointId) }
            : line
    ));
  };

  const clearActiveLine = () => {
    setLines(prev => prev.map(line => 
        line.id === activeLineId ? { ...line, points: [] } : line
    ));
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-4 overflow-hidden bg-white relative">
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
             <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Koordinatsystemet</h4>
             <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.X size={16}/></button>
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <p>Här kan du plotta punkter och se hur linjer skapas genom koordinater (x, y).</p>
            <section className="space-y-2">
              <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
              <ul className="space-y-1.5 list-disc pl-4">
                <li><strong>Rita:</strong> Klicka i rutnätet för att sätta ut en punkt. Klicka på samma punkt igen för att ta bort den.</li>
                <li><strong>Linjer:</strong> Om du sätter ut två eller fler punkter för en linje (A, B eller C) ritas linjen ut och dess ekvation (y=kx+m) visas.</li>
                <li><strong>Tabell:</strong> Se alla punkters exakta värden i tabellen till höger.</li>
                <li><strong>Begrepp:</strong> x-axeln är den vågräta, y-axeln är den lodräta. Mitten kallas origo (0, 0).</li>
              </ul>
            </section>
          </div>
        </div>
      )}

      {/* Diagram Area */}
      <div className="flex-[2] min-h-0 flex items-center justify-center p-2 relative">
          <svg 
            ref={svgRef}
            viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
            className="w-full h-full max-w-[400px] lg:max-w-full aspect-square bg-white border-2 border-slate-200 rounded-xl shadow-sm cursor-crosshair select-none touch-none"
            onClick={handleSvgClick}
          >
              {/* Grid Lines */}
              {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
                  <React.Fragment key={i}>
                      <line x1={i * STEP} y1={0} x2={i * STEP} y2={CANVAS_SIZE} stroke={i === 10 ? "#475569" : "#f1f5f9"} strokeWidth={i === 10 ? 2 : 1} />
                      <line x1={0} y1={i * STEP} x2={CANVAS_SIZE} y2={i * STEP} stroke={i === 10 ? "#475569" : "#f1f5f9"} strokeWidth={i === 10 ? 2 : 1} />
                  </React.Fragment>
              ))}

              {/* Axis Labels */}
              <text x={CANVAS_SIZE - 15} y={ORIGIN - 5} className="text-[10px] font-bold fill-slate-400">x</text>
              <text x={ORIGIN + 5} y={15} className="text-[10px] font-bold fill-slate-400">y</text>

              {/* Data Rendering */}
              {lines.map(line => {
                  const eqData = getEquationData(line.points);
                  const isSelected = line.id === activeLineId;
                  return (
                      <g key={line.id} className={isSelected ? 'z-20' : 'z-10 opacity-40'}>
                          {eqData && (
                            <line 
                                x1={eqData.x1} y1={eqData.y1} x2={eqData.x2} y2={eqData.y2} 
                                stroke={line.color} strokeWidth={isSelected ? 4 : 2} 
                                strokeDasharray={isSelected ? "none" : "5,5"}
                            />
                          )}
                          {line.points.map(p => (
                            <g key={p.id}>
                                <circle 
                                    cx={toPx(p.x)} cy={toPx(p.y, true)} r={isSelected ? 6 : 4} 
                                    fill={line.color} stroke="white" strokeWidth="2" 
                                />
                                {isSelected && (
                                    <text x={toPx(p.x) + 8} y={toPx(p.y, true) - 8} fontSize="10" fontWeight="bold" fill={line.color} className="pointer-events-none drop-shadow-sm">
                                        ({p.x}, {p.y})
                                    </text>
                                )}
                            </g>
                          ))}
                      </g>
                  );
              })}
          </svg>
      </div>

      {/* Sidebar - Controls & Table */}
      <div className="flex-1 min-h-[200px] lg:w-64 lg:h-full shrink-0 flex flex-col bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 overflow-hidden">
          
          {/* Line Selection */}
          <div className="p-3 border-b border-slate-200">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Välj linje att rita</h3>
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                  {lines.map(line => {
                      const isActive = activeLineId === line.id;
                      const eq = getEquationData(line.points)?.equation;
                      return (
                          <button 
                            key={line.id} 
                            onClick={() => setActiveLineId(line.id)}
                            className={`flex flex-col p-2 lg:p-2.5 rounded-xl border-2 transition-all text-left group ${isActive ? 'bg-white shadow-md border-blue-400' : 'bg-transparent border-transparent hover:bg-slate-100 opacity-60 hover:opacity-100'}`}
                          >
                              <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-1 lg:gap-2 font-black text-[10px] lg:text-xs text-slate-700">
                                      <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full shadow-sm" style={{backgroundColor: line.color}}></div>
                                      <span className="truncate">{line.name}</span>
                                  </div>
                              </div>
                              {eq && <div className="text-[9px] lg:text-[11px] mt-1 font-mono font-bold text-slate-500 truncate">{eq}</div>}
                          </button>
                      );
                  })}
              </div>
          </div>

          {/* Points Table */}
          <div className="flex-1 flex flex-col min-h-0">
                <div className="p-3 pb-2 flex justify-between items-center bg-slate-100/50">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Talpar ({activeLine.id})</h3>
                    <button 
                        onClick={clearActiveLine}
                        disabled={activeLine.points.length === 0}
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors disabled:opacity-30"
                    >
                        <Icons.Trash size={14}/>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                    {activeLine.points.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4 py-8">
                            <Icons.Graph size={24} className="opacity-20 mb-2" />
                            <p className="text-[9px] font-bold uppercase italic leading-tight">Tryck i rutnätet för att sätta punkter</p>
                        </div>
                    ) : (
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-200">
                                    <th className="py-2 px-3 text-left font-black text-slate-500 bg-slate-100/50 rounded-tl-lg">x</th>
                                    <th className="py-2 px-3 text-left font-black text-slate-500 bg-slate-100/50">y</th>
                                    <th className="py-2 px-1 bg-slate-100/50 rounded-tr-lg"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...activeLine.points].sort((a,b) => a.x - b.x).map((p) => (
                                    <tr key={p.id} className="border-b border-slate-100 group/row hover:bg-white transition-colors">
                                        <td className="py-2 px-3 font-mono font-bold text-slate-700">{p.x}</td>
                                        <td className="py-2 px-3 font-mono font-bold text-slate-700">{p.y}</td>
                                        <td className="py-2 px-1 text-right">
                                            <button 
                                                onClick={() => removePoint(p.id)}
                                                className="lg:opacity-0 lg:group-hover/row:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                                            >
                                                <Icons.X size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
          </div>
      </div>
    </div>
  );
};
