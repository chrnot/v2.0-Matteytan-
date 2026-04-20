
import React, { useState, memo } from 'react';
import { Icons } from './icons';
import { WidgetType, BackgroundType, BackgroundConfig } from '../types';

interface ToolbarProps {
  onAddWidget: (type: WidgetType) => void;
  onSetBackground: (type: BackgroundType) => void;
  currentBackground: BackgroundType;
  
  // Drawing Controls
  isDrawingMode: boolean;
  setIsDrawingMode: (v: boolean) => void;
  drawColor: string;
  setDrawColor: (c: string) => void;
  drawWidth: number;
  setDrawWidth: (w: number) => void;
  isEraser: boolean;
  setIsEraser: (v: boolean) => void;
  onClearDrawings: () => void;
}

const COLORS = [
  { hex: '#1e293b', label: 'Svart' },
  { hex: '#ef4444', label: 'Röd' },
  { hex: '#3b82f6', label: 'Blå' },
  { hex: '#10b981', label: 'Grön' },
  { hex: '#f59e0b', label: 'Orange' },
];

export const Toolbar: React.FC<ToolbarProps> = memo(({ 
  onAddWidget, 
  onSetBackground, 
  currentBackground,
  isDrawingMode,
  setIsDrawingMode,
  drawColor,
  setDrawColor,
  drawWidth,
  setDrawWidth,
  isEraser,
  setIsEraser,
  onClearDrawings
}) => {
  if (!isDrawingMode) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2500] flex flex-col gap-3 items-center w-full px-4 animate-in slide-in-from-bottom-4 duration-300">
      {/* Drawing Toolbar */}
      <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-2 lg:p-3 border-2 border-blue-500 flex items-center gap-2 sm:gap-3">
        
        {/* Color Selectors */}
        <div className="flex gap-2 px-2 border-r border-slate-200">
          {COLORS.map(c => (
            <button
              key={c.hex}
              onClick={() => { setDrawColor(c.hex); setIsEraser(false); }}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all ${drawColor === c.hex && !isEraser ? 'scale-110 border-slate-400 ring-2 ring-slate-100' : 'border-transparent hover:scale-105'}`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          ))}
        </div>

        {/* Tools: Eraser & Width */}
        <div className="flex items-center gap-2 sm:gap-4 px-1 border-r border-slate-200 pr-2 sm:pr-4">
           <button 
              onClick={() => setIsEraser(!isEraser)}
              className={`p-2 rounded-lg transition-colors ${isEraser ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
              title="Suddgummi"
           >
              <Icons.Eraser size={24} />
           </button>
           
           <div className="hidden sm:flex flex-col gap-1 min-w-[70px]">
              <input 
                type="range" min="2" max="24" 
                value={drawWidth}
                onChange={(e) => setDrawWidth(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[9px] font-black text-slate-400 uppercase text-center tracking-tighter">Bredd</span>
           </div>

           <button 
              onClick={onClearDrawings}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Rensa allt"
           >
              <Icons.Trash size={24} />
           </button>
        </div>

        {/* CLOSE DRAWING MODE BUTTON */}
        <button 
          onClick={() => setIsDrawingMode(false)}
          className="flex items-center gap-2 px-3 py-2.5 bg-red-500 text-white rounded-xl font-black text-[10px] sm:text-xs hover:bg-red-600 shadow-md active:scale-95 transition-all"
          title="Avsluta ritläge"
        >
          <Icons.X size={18} />
          <span className="hidden sm:inline uppercase">Stäng</span>
        </button>
      </div>

       {/* Status Bar */}
       <div className="flex gap-4 items-center h-6 pointer-events-none mb-1">
          <div className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded-full shadow-lg animate-pulse uppercase tracking-wider">
             Ritläge Aktivt
          </div>
       </div>
    </div>
  );
});
