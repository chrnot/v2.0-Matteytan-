
import React, { useState, useMemo, useEffect } from 'react';
import { Icons } from '../icons';

interface HundredChartWidgetProps {
  isTransparent?: boolean;
}

type Mode = 'PAINT' | 'HIDE' | 'MASK';
type MaskShape = 'NONE' | 'SQUARE' | 'CROSS' | 'T_SHAPE' | 'L_SHAPE';

interface CellData {
    color: string | null;
    hidden: boolean;
}

const COLORS = [
    { bg: 'bg-red-200', border: 'border-red-300', hex: '#fecaca' },
    { bg: 'bg-orange-200', border: 'border-orange-300', hex: '#fed7aa' },
    { bg: 'bg-yellow-200', border: 'border-yellow-300', hex: '#fef08a' },
    { bg: 'bg-green-200', border: 'border-green-300', hex: '#bbf7d0' },
    { bg: 'bg-blue-200', border: 'border-blue-300', hex: '#bfdbfe' },
    { bg: 'bg-purple-200', border: 'border-purple-300', hex: '#e9d5ff' },
];

export const HundredChartWidget: React.FC<HundredChartWidgetProps> = ({ isTransparent }) => {
  const [mode, setMode] = useState<Mode>('PAINT');
  const [cells, setCells] = useState<CellData[]>(new Array(100).fill({ color: null, hidden: false }));
  const [activeColor, setActiveColor] = useState<number>(4); 
  const [activeMask, setActiveMask] = useState<MaskShape>('SQUARE');
  const [maskAnchor, setMaskAnchor] = useState<number>(12);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (mode === 'MASK') setCells(prev => prev.map(c => ({ color: null, hidden: false })));
  }, [mode]);

  const handleCellClick = (index: number) => {
      if (mode === 'PAINT') {
          setCells(prev => {
              const newCells = [...prev];
              const currentColor = COLORS[activeColor].bg;
              newCells[index] = { ...newCells[index], color: newCells[index].color === currentColor ? null : currentColor };
              return newCells;
          });
      } else if (mode === 'HIDE') {
          setCells(prev => {
              const newCells = [...prev];
              newCells[index] = { ...newCells[index], hidden: !newCells[index].hidden };
              return newCells;
          });
      } else if (mode === 'MASK') setMaskAnchor(index);
  };

  const getMaskIndices = (anchor: number, shape: MaskShape): number[] => {
      const row = Math.floor(anchor / 10);
      const col = anchor % 10;
      const indices: number[] = [];
      const add = (rO: number, cO: number) => {
          const r = row + rO; const c = col + cO;
          if (r >= 0 && r < 10 && c >= 0 && c < 10) indices.push(r * 10 + c);
      };
      if (shape === 'SQUARE') { add(0,0); add(0,1); add(1,0); add(1,1); }
      else if (shape === 'CROSS') { add(0,1); add(1,0); add(1,1); add(1,2); add(2,1); }
      else if (shape === 'T_SHAPE') { add(0,0); add(0,1); add(0,2); add(1,1); add(2,1); }
      else if (shape === 'L_SHAPE') { add(0,0); add(1,0); add(2,0); add(2,1); }
      return indices;
  };

  const maskedIndices = useMemo(() => mode === 'MASK' ? getMaskIndices(maskAnchor, activeMask) : [], [mode, activeMask, maskAnchor]);
  const maskSum = maskedIndices.reduce((sum, idx) => sum + (idx + 1), 0);

  return (
    <div className="w-full h-full flex flex-col gap-2 overflow-hidden relative">
        
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
               <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Hundrarutan</h4>
               <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
            </div>
            <div className="space-y-4 text-xs leading-relaxed text-slate-600">
              <p>Hundrarutan hjälper dig att upptäcka talmönster och samband mellan tal upp till 100.</p>
              <section className="space-y-2">
                <h5 className="font-black text-blue-600 uppercase text-[10px]">De tre lägena:</h5>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li><strong>Måla:</strong> Välj en färg och markera tal. Perfekt för att visa jämna/udda tal eller multiplikationstabeller.</li>
                  <li><strong>Gömma:</strong> Klicka på tal för att dölja dem bakom en mörk ruta. Utmana klassen att lista ut vilka tal som fattas!</li>
                  <li><strong>Mask:</strong> Flytta en blå form över rutan. Se hur talen i formen förändras (t.ex. +10 när du går ner en rad). Summan av de markerade talen visas automatiskt.</li>
                </ul>
              </section>
            </div>
          </div>
        )}

        <div className="flex bg-slate-100 p-1 rounded-xl mx-auto border border-slate-200 shrink-0 text-[10px] sm:text-xs pr-8">
            {(['PAINT', 'HIDE', 'MASK'] as Mode[]).map(m => (
                <button key={m} onClick={() => setMode(m)} className={`px-2 sm:px-4 py-1.5 rounded-lg font-bold transition-all ${mode === m ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                    {m === 'PAINT' ? 'Måla' : m === 'HIDE' ? 'Gömma' : 'Mask'}
                </button>
            ))}
            <button onClick={() => setCells(new Array(100).fill({ color: null, hidden: false }))} className="px-2 text-slate-400 hover:text-red-500"><Icons.Trash size={14}/></button>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 shrink-0 flex items-center justify-center gap-2 min-h-[44px]">
            {mode === 'PAINT' && COLORS.map((c, i) => (
                <button key={i} onClick={() => setActiveColor(i)} className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 ${activeColor === i ? 'border-slate-600 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c.hex }} />
            ))}
            {mode === 'HIDE' && <button onClick={() => setCells(prev => prev.map(c => ({...c, hidden: true})))} className="px-3 py-1 bg-slate-800 text-white rounded text-[10px] font-bold">Göm Alla</button>}
            {mode === 'MASK' && <div className="text-xs font-bold text-blue-700">Summa: {maskSum}</div>}
        </div>

        <div className="flex-1 min-h-0 bg-slate-200 p-1 rounded-xl overflow-hidden">
            <div className="grid grid-cols-10 gap-0.5 h-full w-full">
                {cells.map((cell, i) => {
                    const isMasked = mode === 'MASK' && maskedIndices.includes(i);
                    const shouldHide = mode === 'HIDE' && cell.hidden;
                    let bg = cell.color && !shouldHide ? cell.color : shouldHide ? 'bg-slate-800' : 'bg-white';
                    if (isMasked) bg = '!bg-blue-500 text-white z-10 scale-105 shadow-md';
                    return (
                        <div key={i} onClick={() => handleCellClick(i)} className={`aspect-square flex items-center justify-center rounded-[2px] text-[8px] sm:text-[10px] md:text-xs font-bold transition-all border border-slate-100 ${bg} ${mode === 'MASK' && !isMasked ? 'opacity-30' : ''} ${shouldHide && !isMasked ? 'text-transparent' : 'text-slate-700'}`}>
                            {i + 1}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};
