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
  drawTool: 'PENCIL' | 'SQUARE' | 'RECTANGLE' | 'CIRCLE' | 'TRIANGLE';
  drawFilled: boolean;
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(({ 
  isDrawingMode, 
  color, 
  lineWidth, 
  isEraser,
  zIndex,
  drawTool,
  drawFilled
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isPressed, setIsPressed] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const savedImageDataRef = useRef<ImageData | null>(null);

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
    
    const currentTool = isEraser ? 'ERASER' : drawTool;
    
    if (currentTool === 'ERASER' || currentTool === 'PENCIL') {
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        savedImageDataRef.current = contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
      }
      startXRef.current = x;
      startYRef.current = y;
    }
    
    setIsPressed(true);
  };

  const draw = (x: number, y: number) => {
    if (!isPressed || !isDrawingMode || !contextRef.current) return;

    const ctx = contextRef.current;
    const currentTool = isEraser ? 'ERASER' : drawTool;

    if (currentTool === 'ERASER' || currentTool === 'PENCIL') {
      ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : color; // Eraser uses destination-out or white. Best is destination-out.
      ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
      ctx.lineWidth = lineWidth;
      
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      const canvas = canvasRef.current;
      if (!canvas || !savedImageDataRef.current) return;

      // Restore the canvas to the state before this drag gesture started
      ctx.putImageData(savedImageDataRef.current, 0, 0);

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const startX = startXRef.current;
      const startY = startYRef.current;

      ctx.beginPath();

      if (currentTool === 'SQUARE') {
        const size = Math.max(Math.abs(x - startX), Math.abs(y - startY));
        const rectX = x < startX ? startX - size : startX;
        const rectY = y < startY ? startY - size : startY;

        if (drawFilled) {
          ctx.fillRect(rectX, rectY, size, size);
        } else {
          ctx.rect(rectX, rectY, size, size);
          ctx.stroke();
        }
      } else if (currentTool === 'RECTANGLE') {
        const rectX = Math.min(startX, x);
        const rectY = Math.min(startY, y);
        const w = Math.abs(x - startX);
        const h = Math.abs(y - startY);

        if (drawFilled) {
          ctx.fillRect(rectX, rectY, w, h);
        } else {
          ctx.rect(rectX, rectY, w, h);
          ctx.stroke();
        }
      } else if (currentTool === 'CIRCLE') {
        const dx = x - startX;
        const dy = y - startY;
        const r = Math.sqrt(dx * dx + dy * dy);

        ctx.arc(startX, startY, r, 0, 2 * Math.PI);
        if (drawFilled) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
      } else if (currentTool === 'TRIANGLE') {
        const minX = Math.min(startX, x);
        const maxX = Math.max(startX, x);
        const minY = Math.min(startY, y);
        const maxY = Math.max(startY, y);

        ctx.moveTo((minX + maxX) / 2, minY);
        ctx.lineTo(minX, maxY);
        ctx.lineTo(maxX, maxY);
        ctx.closePath();

        if (drawFilled) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
      }
    }
  };

  const endDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsPressed(false);
    savedImageDataRef.current = null;
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