import React, { useRef, useState, useEffect, memo } from 'react';
import { WidgetGroup, WidgetInstance } from '../types';
import { Icons } from './icons';

interface WidgetSnapshot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WidgetGroupFrameProps {
  group: WidgetGroup;
  widgets: WidgetInstance[];
  onUngroup: (groupId: string) => void;
  onMoveGroup: (groupId: string, deltaX: number, deltaY: number, finished: boolean) => void;
  onScaleGroup: (
    groupId: string, 
    scaleX: number, 
    scaleY: number, 
    finished: boolean, 
    origin: { minX: number; minY: number },
    snapshots: WidgetSnapshot[]
  ) => void;
  onQuickScale: (groupId: string, factor: number) => void;
  onFocusGroup: (groupId: string) => void;
  isDarkMode?: boolean;
}

export const WidgetGroupFrame: React.FC<WidgetGroupFrameProps> = memo(({
  group,
  widgets,
  onUngroup,
  onMoveGroup,
  onScaleGroup,
  onQuickScale,
  onFocusGroup,
  isDarkMode = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({
    pointerX: 0,
    pointerY: 0,
    boxW: 0,
    boxH: 0,
    minX: 0,
    minY: 0,
    snapshots: [] as WidgetSnapshot[]
  });

  if (widgets.length === 0) return null;

  // Calculate bounding box of all widgets in group
  const minX = Math.min(...widgets.map(w => w.x));
  const minY = Math.min(...widgets.map(w => w.y));
  const maxX = Math.max(...widgets.map(w => w.x + (w.width || 400)));
  const maxY = Math.max(...widgets.map(w => w.y + (w.height || 300)));
  const maxZ = Math.max(...widgets.map(w => w.zIndex || 100));
  const minZ = Math.min(...widgets.map(w => w.zIndex || 100));

  const padding = 14;
  const headerHeight = 44;

  const frameLeft = minX - padding;
  const frameTop = minY - padding - headerHeight;
  const frameWidth = (maxX - minX) + (padding * 2);
  const frameHeight = (maxY - minY) + (padding * 2) + headerHeight;

  // --- GROUP DRAGGING LOGIC ---
  const handleDragStart = (clientX: number, clientY: number) => {
    onFocusGroup(group.id);
    setIsDragging(true);
    dragStartRef.current = { x: clientX, y: clientY };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      onMoveGroup(group.id, deltaX, deltaY, false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.x;
      const deltaY = touch.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      onMoveGroup(group.id, deltaX, deltaY, false);
    };

    const handleEnd = () => {
      setIsDragging(false);
      onMoveGroup(group.id, 0, 0, true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, group.id, onMoveGroup]);

  // --- GROUP RESIZING LOGIC ---
  const handleResizeStart = (clientX: number, clientY: number) => {
    onFocusGroup(group.id);
    setIsResizing(true);
    resizeStartRef.current = {
      pointerX: clientX,
      pointerY: clientY,
      boxW: maxX - minX,
      boxH: maxY - minY,
      minX,
      minY,
      snapshots: widgets.map(w => ({
        id: w.id,
        x: w.x,
        y: w.y,
        width: w.width || 400,
        height: w.height || 300
      }))
    };
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMove = (clientX: number, clientY: number) => {
      const { pointerX, pointerY, boxW, boxH, minX: origMinX, minY: origMinY, snapshots } = resizeStartRef.current;
      const deltaX = clientX - pointerX;
      const deltaY = clientY - pointerY;

      const newW = Math.max(160, boxW + deltaX);
      const newH = Math.max(120, boxH + deltaY);

      const scaleX = newW / boxW;
      const scaleY = newH / boxH;

      onScaleGroup(group.id, scaleX, scaleY, false, { minX: origMinX, minY: origMinY }, snapshots);
    };

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const onEnd = () => {
      setIsResizing(false);
      const { minX: origMinX, minY: origMinY, snapshots } = resizeStartRef.current;
      onScaleGroup(group.id, 1, 1, true, { minX: origMinX, minY: origMinY }, snapshots);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isResizing, group.id, onScaleGroup]);

  return (
    <>
      {/* 1. Behind-widgets Frame Box: subtle background & outline */}
      <div
        className="fixed rounded-2xl pointer-events-none transition-all duration-150"
        style={{
          left: frameLeft,
          top: frameTop,
          width: frameWidth,
          height: frameHeight,
          zIndex: Math.max(1, minZ - 1),
          border: `2.5px dashed ${group.color || '#6366f1'}`,
          backgroundColor: isDarkMode ? `${group.color || '#6366f1'}15` : `${group.color || '#6366f1'}0a`,
          boxShadow: `0 8px 30px -4px ${group.color || '#6366f1'}25`
        }}
      />

      {/* 2. Top Group Control Bar (Always on top of widgets) */}
      <div
        className="fixed flex items-center justify-between pointer-events-auto select-none"
        style={{
          left: frameLeft,
          top: frameTop + 2,
          width: frameWidth,
          height: headerHeight - 6,
          zIndex: maxZ + 10,
        }}
      >
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            handleDragStart(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            const touch = e.touches[0];
            handleDragStart(touch.clientX, touch.clientY);
          }}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border shadow-lg cursor-grab active:cursor-grabbing backdrop-blur-md transition-all ${
            isDarkMode
              ? 'bg-slate-900/90 border-slate-700 text-slate-100 hover:border-slate-500'
              : 'bg-white/95 border-slate-200 text-slate-800 hover:border-slate-300'
          }`}
          style={{ borderLeft: `5px solid ${group.color || '#6366f1'}` }}
          title="Klicka och dra för att flytta hela gruppen"
        >
          <div className="flex items-center gap-1.5 text-xs font-black tracking-wide">
            <Icons.Link size={14} style={{ color: group.color || '#6366f1' }} />
            <span>{group.name}</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{
                backgroundColor: `${group.color || '#6366f1'}25`,
                color: group.color || '#6366f1'
              }}
            >
              {widgets.length} st
            </span>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Quick scale controls */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onQuickScale(group.id, 0.88)}
              className="px-1.5 py-0.5 text-[11px] font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Förminska alla widgetar i gruppen (-12%)"
            >
              -12%
            </button>
            <button
              onClick={() => onQuickScale(group.id, 1.12)}
              className="px-1.5 py-0.5 text-[11px] font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Förstora alla widgetar i gruppen (+12%)"
            >
              +12%
            </button>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {/* Ungroup button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUngroup(group.id);
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 py-0.5 rounded transition-colors"
            title="Dela upp gruppen (Avgruppera)"
          >
            <Icons.Unlink size={13} />
            <span>Avgruppera</span>
          </button>
        </div>
      </div>

      {/* 3. Bottom-Right Corner Scaling Handle */}
      <div
        className="fixed pointer-events-auto touch-none select-none z-[2100]"
        style={{
          left: frameLeft + frameWidth - 16,
          top: frameTop + frameHeight - 16,
          zIndex: maxZ + 20,
        }}
      >
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleResizeStart(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            const touch = e.touches[0];
            handleResizeStart(touch.clientX, touch.clientY);
          }}
          className="w-8 h-8 rounded-xl shadow-xl flex items-center justify-center cursor-nwse-resize hover:scale-110 active:scale-95 transition-transform"
          style={{
            backgroundColor: group.color || '#6366f1',
            color: '#ffffff'
          }}
          title="Dra här för att skala alla widgetar i gruppen tillsammans"
        >
          <Icons.Maximize size={15} className="rotate-90" />
        </div>
      </div>
    </>
  );
});
