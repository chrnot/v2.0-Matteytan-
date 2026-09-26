import React, { useState, useRef, useEffect, memo } from 'react';
import { Icons } from './icons';

interface WidgetWrapperProps {
  id: string;
  title: string;
  children: React.ReactNode;
  initialX: number;
  initialY: number;
  initialWidth?: number;
  initialHeight?: number;
  zIndex: number;
  transparent?: boolean;
  klagSupport?: boolean;
  isSelected?: boolean;
  groupId?: string;
  groupName?: string;
  groupColor?: string;
  isGroupInteracting?: boolean;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onDragDelta?: (id: string, deltaX: number, deltaY: number, finished: boolean) => void;
  onResize?: (id: string, width: number, height: number) => void;
  onResizeDelta?: (id: string, deltaW: number, deltaH: number, finished: boolean) => void;
  onToggleSelect?: (id: string) => void;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = memo(({
  id,
  title,
  children,
  initialX,
  initialY,
  initialWidth = 400,
  initialHeight = 300,
  zIndex,
  transparent = false,
  klagSupport = false,
  isSelected = false,
  groupId,
  groupName,
  groupColor,
  isGroupInteracting = false,
  onClose,
  onFocus,
  onMove,
  onDragDelta,
  onResize,
  onResizeDelta,
  onToggleSelect,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const [klagMode, setKlagMode] = useState<'NONE' | 'KONKRET' | 'LOGISK' | 'ALGEBRAISK' | 'GRAFISK'>('NONE');
  const [klagContent, setKlagContent] = useState<Record<string, string>>({
    'KONKRET': '',
    'LOGISK': '',
    'ALGEBRAISK': '',
    'GRAFISK': '',
  });

  const dragStart = useRef({ x: 0, y: 0 });
  const dragLastPos = useRef({ x: initialX, y: initialY });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync with props when they change (e.g. via "Arrange" or group move/scale)
  useEffect(() => {
    if (!isDragging && !isResizing) {
      setPosition({ x: initialX, y: initialY });
      if (initialWidth) setSize(prev => ({ ...prev, width: initialWidth }));
      if (initialHeight) setSize(prev => ({ ...prev, height: initialHeight }));
    }
  }, [initialX, initialY, initialWidth, initialHeight, isDragging, isResizing]);

  // --- DRAGGING LOGIC ---
  const startDrag = (clientX: number, clientY: number) => {
    onFocus(id);
    setIsDragging(true);
    dragStart.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
    dragLastPos.current = { x: position.x, y: position.y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (e.shiftKey && onToggleSelect) {
      onToggleSelect(id);
      return;
    }
    startDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
        let newY = clientY - dragStart.current.y;
        let newX = clientX - dragStart.current.x;

        if (newY < 0) newY = 0;
        if (newY > window.innerHeight - 50) newY = window.innerHeight - 50;
        if (newX + size.width < 50) newX = 50 - size.width;
        if (newX > window.innerWidth - 50) newX = window.innerWidth - 50;

        const deltaX = newX - dragLastPos.current.x;
        const deltaY = newY - dragLastPos.current.y;
        dragLastPos.current = { x: newX, y: newY };

        setPosition({ x: newX, y: newY });

        if (onDragDelta && (deltaX !== 0 || deltaY !== 0)) {
          onDragDelta(id, deltaX, deltaY, false);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault(); 
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        onMove(id, position.x, position.y);
        if (onDragDelta) {
          onDragDelta(id, 0, 0, true);
        }
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, id, onMove, onDragDelta, position.x, position.y, size.width]);

  // --- RESIZING LOGIC ---
  const startResize = (clientX: number, clientY: number) => {
      onFocus(id);
      setIsResizing(true);
      resizeStart.current = { 
          x: clientX, 
          y: clientY, 
          w: size.width, 
          h: size.height 
      };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      startResize(e.clientX, e.clientY);
  };

  const handleResizeTouchStart = (e: React.TouchEvent) => {
      e.stopPropagation();
      const touch = e.touches[0];
      startResize(touch.clientX, touch.clientY);
  };

  useEffect(() => {
      const handleResizeMove = (clientX: number, clientY: number) => {
          const deltaX = clientX - resizeStart.current.x;
          const deltaY = clientY - resizeStart.current.y;
          
          const newW = Math.max(280, resizeStart.current.w + deltaX);
          const newH = Math.max(200, resizeStart.current.h + deltaY);

          const prevW = size.width;
          const prevH = size.height;
          
          setSize({
              width: newW,
              height: newH
          });

          if (onResizeDelta && (newW !== prevW || newH !== prevH)) {
            onResizeDelta(id, newW - prevW, newH - prevH, false);
          }
      };

      const onMouseMove = (e: MouseEvent) => {
          if (!isResizing) return;
          e.preventDefault();
          handleResizeMove(e.clientX, e.clientY);
      };

      const onTouchMove = (e: TouchEvent) => {
          if (!isResizing) return;
          e.preventDefault();
          const touch = e.touches[0];
          handleResizeMove(touch.clientX, touch.clientY);
      };

      const onEnd = () => {
          if (isResizing) {
            setIsResizing(false);
            if (onResize) {
                onResize(id, size.width, size.height);
            }
            if (onResizeDelta) {
              onResizeDelta(id, 0, 0, true);
            }
          }
      };

      if (isResizing) {
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onEnd);
          window.addEventListener('touchmove', onTouchMove, { passive: false });
          window.addEventListener('touchend', onEnd);
      }
      return () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onEnd);
          window.removeEventListener('touchmove', onTouchMove);
          window.removeEventListener('touchend', onEnd);
      };
  }, [isResizing, id, onResize, onResizeDelta, size.width, size.height]);

  const containerClasses = transparent 
    ? `fixed flex flex-col rounded-xl overflow-visible transition-all duration-300 ease-in-out max-w-[98vw] max-h-[90vh] ${
        isSelected ? 'ring-4 ring-blue-500/80 shadow-2xl' : ''
      }`
    : `fixed flex flex-col bg-[var(--surface-primary)] rounded-xl widget-shadow border border-[var(--sidebar-border)] overflow-hidden transition-all duration-300 ease-in-out max-w-[98vw] max-h-[90vh] ${
        isSelected ? 'ring-4 ring-blue-500/80 shadow-2xl scale-[1.008]' : ''
      }`;

  // Disable transition during drag/resize or group interaction to prevent rubberbanding/lag
  const dynamicStyle = {
    left: position.x,
    top: position.y,
    width: transparent ? 'auto' : size.width,
    height: transparent ? 'auto' : size.height,
    zIndex: zIndex,
    touchAction: 'none',
    transition: isDragging || isResizing || isGroupInteracting ? 'none' : 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
  } as React.CSSProperties;

  return (
    <div
      ref={wrapperRef}
      className={containerClasses}
      style={dynamicStyle}
      onMouseDown={(e) => {
        onFocus(id);
        if (e.shiftKey && onToggleSelect) {
          onToggleSelect(id);
        }
      }}
      onTouchStart={() => onFocus(id)}
    >
      {!transparent && (
        <div
          className="h-10 bg-[var(--brand-secondary)] border-b border-[var(--sidebar-border)] flex items-center justify-between px-3 cursor-move select-none flex-shrink-0 touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            {/* Multi-selection toggle checkbox */}
            {onToggleSelect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(id);
                }}
                className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400' 
                    : 'border border-slate-300 dark:border-slate-600 hover:border-blue-400 text-transparent hover:text-slate-400 bg-white/50 dark:bg-slate-700/50'
                }`}
                title={isSelected ? 'Avmarkera widget' : 'Markera för att gruppera (Shift-klicka)'}
              >
                <Icons.Check size={12} className={isSelected ? 'opacity-100 stroke-[3]' : 'opacity-0'} />
              </button>
            )}

            <span className="font-semibold text-[var(--text-main)] text-sm truncate pointer-events-none opacity-90">
              {title}
            </span>

            {/* Group badge */}
            {groupId && groupName && (
              <span 
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex items-center gap-1 select-none flex-shrink-0"
                style={{
                  backgroundColor: `${groupColor || '#6366f1'}15`,
                  borderColor: `${groupColor || '#6366f1'}35`,
                  color: groupColor || '#6366f1'
                }}
                title={`Grupperad i ${groupName}`}
              >
                <Icons.Link size={9} />
                <span>{groupName}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {klagSupport && (
              <div className="flex items-center bg-slate-200/50 p-0.5 rounded-lg mr-2">
                {[
                  { mode: 'KONKRET', label: 'K', title: 'Konkret handlingsform' },
                  { mode: 'LOGISK', label: 'L', title: 'Logisk/språklig form' },
                  { mode: 'ALGEBRAISK', label: 'A', title: 'Algebraisk/symbolisk form' },
                  { mode: 'GRAFISK', label: 'G', title: 'Grafisk/visuell form' },
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => setKlagMode(prev => prev === item.mode ? 'NONE' : item.mode as any)}
                    className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-black transition-all ${
                      klagMode === item.mode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-300'
                    }`}
                    title={item.title}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(id); }}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 rounded transition-colors"
              title="Stäng fönster"
            >
              <Icons.Close size={18} />
            </button>
          </div>
        </div>
      )}

      {transparent && (
         <div className="absolute -top-10 left-0 flex items-center gap-1.5 bg-[var(--surface-primary)]/90 backdrop-blur border border-[var(--sidebar-border)] rounded-lg p-1 shadow-sm z-50">
            {onToggleSelect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect(id);
                }}
                className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'border border-slate-300 dark:border-slate-600 hover:border-blue-400 text-transparent hover:text-slate-400 bg-white/50'
                }`}
                title={isSelected ? 'Avmarkera' : 'Markera för grupp'}
              >
                <Icons.Check size={12} className={isSelected ? 'opacity-100 stroke-[3]' : 'opacity-0'} />
              </button>
            )}
            <div 
                className="p-1.5 cursor-move text-[var(--text-main)] opacity-60 hover:bg-[var(--sidebar-hover)] rounded touch-none"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                title="Flytta"
            >
                <Icons.Move size={18} />
            </div>
            {groupId && groupName && (
              <span 
                className="text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1"
                style={{
                  backgroundColor: `${groupColor || '#6366f1'}15`,
                  borderColor: `${groupColor || '#6366f1'}35`,
                  color: groupColor || '#6366f1'
                }}
              >
                <Icons.Link size={9} />
                <span>{groupName}</span>
              </span>
            )}
             <button
              onClick={(e) => { e.stopPropagation(); onClose(id); }}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 rounded transition-colors"
              title="Stäng"
            >
              <Icons.Close size={18} />
            </button>
         </div>
      )}

      <div className={`
        flex-1 relative
        ${transparent ? 'p-0 bg-transparent' : 'p-2 sm:p-4 bg-[var(--surface-primary)]/50 backdrop-blur-sm overflow-auto text-[var(--text-main)]'}
      `}>
        <div className="h-full w-full">
            {children}
        </div>

        {/* KLAG Overlay */}
        {klagMode !== 'NONE' && (
          <div className="absolute inset-0 bg-[var(--surface-primary)] backdrop-blur-md z-40 p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--sidebar-border)] pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  {klagMode.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">
                    {klagMode.charAt(0) + klagMode.slice(1).toLowerCase()}
                  </h4>
                  <p className="text-[10px] text-[var(--text-main)] opacity-50 font-medium">
                    {klagMode === 'KONKRET' && 'Laborativt & Handlingsburet'}
                    {klagMode === 'LOGISK' && 'Språklig & Logisk förklaring'}
                    {klagMode === 'ALGEBRAISK' && 'Symboler & Matematiska uttryck'}
                    {klagMode === 'GRAFISK' && 'Diagram, bilder & visualiseringar'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setKlagMode('NONE')}
                className="p-1 hover:bg-[var(--sidebar-hover)] rounded-full text-slate-400"
              >
                <Icons.X size={16} />
              </button>
            </div>
            
            <textarea
              className="flex-1 bg-[var(--brand-secondary)] border border-[var(--sidebar-border)] rounded-xl p-4 text-[var(--text-main)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-medium placeholder:text-slate-400/50"
              placeholder={`Dokumentera din ${klagMode.toLowerCase()}a representation här...`}
              value={klagContent[klagMode]}
              onChange={(e) => setKlagContent(prev => ({ ...prev, [klagMode]: e.target.value }))}
            />
            
            <div className="mt-4 flex items-center justify-between">
               <div className="flex -space-x-1">
                  {['K', 'L', 'A', 'G'].map(char => (
                    <div key={char} className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black ${klagContent[
                      char === 'K' ? 'KONKRET' : char === 'L' ? 'LOGISK' : char === 'A' ? 'ALGEBRAISK' : 'GRAFISK'
                    ] ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {char}
                    </div>
                  ))}
               </div>
               <button 
                onClick={() => setKlagMode('NONE')}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
               >
                 Spara & Stäng
               </button>
            </div>
          </div>
        )}
      </div>

      {!transparent && (
          <div 
            className="absolute bottom-0 right-0 w-10 h-10 cursor-nwse-resize z-20 flex items-end justify-end p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-tl touch-none"
            onMouseDown={handleResizeMouseDown}
            onTouchStart={handleResizeTouchStart}
            title={groupId ? "Ändra storlek (grupperad)" : "Ändra storlek"}
          >
              <div className="w-0 h-0 border-b-[8px] border-r-[8px] border-l-[8px] border-t-[8px] border-b-slate-400 border-r-slate-400 border-l-transparent border-t-transparent opacity-50"></div>
          </div>
      )}
    </div>
  );
});
