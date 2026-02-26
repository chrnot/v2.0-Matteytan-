import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

export interface DrawingCanvasHandle {
  clear: () => void;
}

interface DrawingCanvasProps {
  isDrawingMode: boolean;
  color: string;
  lineWidth: number;
  isEraser: boolean;
  zIndex: number;
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(({ 
  isDrawingMode, 
  color, 
  lineWidth, 
  isEraser,
  zIndex 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  // Expose clear method to parent
  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }));

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set display size
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      contextRef.current = ctx;
    }

    const handleResize = () => {
      // Logic for saving content during resize could be added here, 
      // but simple clear/resize for now
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startDrawing = (x: number, y: number) => {
    if (!isDrawingMode || !contextRef.current) return;
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsPressed(true);
  };

  const draw = (x: number, y: number) => {
    if (!isPressed || !isDrawingMode || !contextRef.current) return;

    const ctx = contextRef.current;
    ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : color; // Eraser uses destination-out or white. Best is destination-out.
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.lineWidth = lineWidth;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsPressed(false);
  };

  // Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => startDrawing(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) => draw(e.clientX, e.clientY);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startDrawing(touch.clientX, touch.clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    draw(touch.clientX, touch.clientY);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={endDrawing}
      className={`absolute inset-0 transition-opacity duration-300 ${isDrawingMode ? 'cursor-crosshair' : 'pointer-events-none'}`}
      style={{ zIndex }}
    />
  );
});