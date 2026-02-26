
import React, { useState, useRef, useEffect } from 'react';
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
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize?: (id: string, width: number, height: number) => void;
}

export const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
  id,
  title,
  children,
  initialX,
  initialY,
  initialWidth = 400,
  initialHeight = 300,
  zIndex,
  transparent = false,
  onClose,
  onFocus,
  onMove,
  onResize,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync with props when they change (e.g. via "Arrange" function)
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
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); 
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

        setPosition({ x: newX, y: newY });
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
  }, [isDragging, id, onMove, position.x, position.y, size.width]);


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
          
          setSize({
              width: Math.max(280, resizeStart.current.w + deltaX),
              height: Math.max(200, resizeStart.current.h + deltaY)
          });
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
  }, [isResizing, id, onResize, size.width, size.height]);


  const containerClasses = transparent 
    ? "fixed flex flex-col rounded-xl overflow-visible transition-all duration-500 ease-in-out max-w-[98vw] max-h-[90vh]"
    : "fixed flex flex-col bg-white rounded-xl widget-shadow border border-slate-200 overflow-hidden transition-all duration-500 ease-in-out max-w-[98vw] max-h-[90vh]";

  // Disable transition during interaction
  const dynamicStyle = {
    left: position.x,
    top: position.y,
    width: transparent ? 'auto' : size.width,
    height: transparent ? 'auto' : size.height,
    zIndex: zIndex,
    touchAction: 'none',
    transition: isDragging || isResizing ? 'none' : 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
  } as React.CSSProperties;

  return (
    <div
      ref={wrapperRef}
      className={containerClasses}
      style={dynamicStyle}
      onMouseDown={() => onFocus(id)}
      onTouchStart={() => onFocus(id)}
    >
      {!transparent && (
        <div
          className="h-10 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-3 cursor-move select-none flex-shrink-0 touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <span className="font-semibold text-slate-700 text-sm flex items-center gap-2 truncate pr-4 pointer-events-none">
            {title}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onClose(id); }}
              className="p-2 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded transition-colors"
            >
              <Icons.Close size={18} />
            </button>
          </div>
        </div>
      )}

      {transparent && (
         <div className="absolute -top-10 left-0 flex gap-2 bg-white/90 backdrop-blur border border-slate-200 rounded-lg p-1 shadow-sm z-50">
            <div 
                className="p-2 cursor-move text-slate-500 hover:bg-slate-100 rounded touch-none"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                title="Flytta"
            >
                <Icons.Move size={20} />
            </div>
             <button
              onClick={(e) => { e.stopPropagation(); onClose(id); }}
              className="p-2 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded transition-colors"
            >
              <Icons.Close size={20} />
            </button>
         </div>
      )}

      <div className={`
        flex-1 relative
        ${transparent ? 'p-0 bg-transparent' : 'p-2 sm:p-4 bg-white/95 backdrop-blur-sm overflow-auto'}
      `}>
        <div className="h-full w-full">
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    // @ts-ignore
                    return React.cloneElement(child, { isTransparent: transparent });
                }
                return child;
            })}
        </div>
      </div>

      {!transparent && (
          <div 
            className="absolute bottom-0 right-0 w-10 h-10 cursor-nwse-resize z-20 flex items-end justify-end p-1.5 hover:bg-slate-100 rounded-tl touch-none"
            onMouseDown={handleResizeMouseDown}
            onTouchStart={handleResizeTouchStart}
          >
              <div className="w-0 h-0 border-b-[8px] border-r-[8px] border-l-[8px] border-t-[8px] border-b-slate-400 border-r-slate-400 border-l-transparent border-t-transparent opacity-50"></div>
          </div>
      )}
    </div>
  );
};
