import React, { useState, useEffect, useRef, memo } from 'react';
import { toPng } from 'html-to-image';
import { WidgetInstance } from '../types';
import { Icons } from './icons';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  whiteboardElement: HTMLElement | null;
  widgets: WidgetInstance[];
  isDarkMode?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = memo(({
  isOpen,
  onClose,
  whiteboardElement,
  widgets,
  isDarkMode = false
}) => {
  const [mode, setMode] = useState<'FULL' | 'CROP'>('FULL');
  const [scale, setScale] = useState<number>(2); // 2x for crisp Retina/print
  const [includeWatermark, setIncludeWatermark] = useState<boolean>(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate PNG whenever modal opens or options change
  useEffect(() => {
    if (!isOpen || !whiteboardElement) return;

    let isMounted = true;
    setIsGenerating(true);
    setErrorMsg(null);
    setCopied(false);

    const generateSnapshot = async () => {
      try {
        // Filter out non-exportable UI elements (toolbars, sidebars, buttons, modals)
        const filter = (node: HTMLElement) => {
          if (!node.classList) return true;
          if (node.classList.contains('export-ignore')) return false;
          if (node.dataset && node.dataset.exportIgnore === 'true') return false;
          return true;
        };

        const rawDataUrl = await toPng(whiteboardElement, {
          pixelRatio: scale,
          quality: 1,
          filter,
          cacheBust: false,
        });

        const img = new Image();
        img.src = rawDataUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error('Kunde inte läsa in genererad bild'));
        });

        if (!isMounted) return;

        const rawWidth = img.naturalWidth;
        const rawHeight = img.naturalHeight;

        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = rawWidth;
        let sourceHeight = rawHeight;
        let targetWidth = rawWidth;
        let targetHeight = rawHeight;

        if (mode === 'CROP' && widgets.length > 0) {
          const padding = 36 * scale;
          const minX = Math.max(0, Math.min(...widgets.map(w => w.x)) * scale - padding);
          const minY = Math.max(0, Math.min(...widgets.map(w => w.y)) * scale - padding);
          const maxX = Math.min(rawWidth, Math.max(...widgets.map(w => w.x + (w.width || 400))) * scale + padding);
          const maxY = Math.min(rawHeight, Math.max(...widgets.map(w => w.y + (w.height || 300))) * scale + padding);

          sourceX = minX;
          sourceY = minY;
          sourceWidth = Math.max(120, maxX - minX);
          sourceHeight = Math.max(100, maxY - minY);
          targetWidth = sourceWidth;
          targetHeight = sourceHeight;
        }

        const offscreen = document.createElement('canvas');
        offscreen.width = targetWidth;
        offscreen.height = targetHeight;
        const ctx = offscreen.getContext('2d');
        if (!ctx) throw new Error('Kunde inte skapa ritkontext');

        ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);

        if (includeWatermark) {
          const text = `Matteytan.se • ${new Date().toLocaleDateString('sv-SE')}`;
          const fontSize = Math.max(11, Math.round(12 * scale));
          ctx.font = `600 ${fontSize}px sans-serif`;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          
          const textMetrics = ctx.measureText(text);
          const bgPadding = 6 * scale;
          const bgX = targetWidth - textMetrics.width - bgPadding * 2 - (14 * scale);
          const bgY = targetHeight - fontSize - bgPadding * 2 - (12 * scale);
          const bgW = textMetrics.width + bgPadding * 2;
          const bgH = fontSize + bgPadding * 2;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.70)';
          ctx.beginPath();
          ctx.roundRect(bgX, bgY, bgW, bgH, 6 * scale);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.fillText(text, targetWidth - (14 * scale) - bgPadding, targetHeight - (12 * scale) - bgPadding);
        }

        const finalDataUrl = offscreen.toDataURL('image/png');
        const blob = await new Promise<Blob | null>((resolve) => offscreen.toBlob(resolve, 'image/png'));

        if (isMounted) {
          setPreviewDataUrl(finalDataUrl);
          setPreviewBlob(blob);
          setImageSize({ width: targetWidth, height: targetHeight });
          setIsGenerating(false);
        }
      } catch (err: any) {
        console.error('Export capture error:', err);
        if (isMounted) {
          setErrorMsg(err?.message || 'Ett fel uppstod vid export av bilden.');
          setIsGenerating(false);
        }
      }
    };

    const timeout = setTimeout(generateSnapshot, 100);
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [isOpen, whiteboardElement, mode, scale, includeWatermark, widgets]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!previewDataUrl) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.download = `matteytan-whiteboard-${dateStr}.png`;
    link.href = previewDataUrl;
    link.click();
  };

  const handleCopyToClipboard = async () => {
    if (!previewBlob) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new window.ClipboardItem({ 'image/png': previewBlob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        throw new Error('Urklipp stöds inte i denna webbläsare.');
      }
    } catch (err) {
      console.warn('Clipboard write error:', err);
      // Fallback: trigger download
      handleDownload();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[3000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200 select-none export-ignore"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Icons.Image size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Exportera whiteboard
                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                  PNG
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Spara eller kopiera den aktuella whiteboarden som en högupplöst bild.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Stäng"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
          
          {/* Left Column: Preview */}
          <div className="flex-1 flex flex-col min-h-[260px] sm:min-h-[340px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Förhandsgranskning
              </span>
              {imageSize && !isGenerating && (
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  {imageSize.width} × {imageSize.height} px
                </span>
              )}
            </div>

            <div className="flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden relative min-h-[240px] p-2">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold">Genererar bild...</span>
                </div>
              ) : errorMsg ? (
                <div className="flex flex-col items-center gap-2 text-rose-500 p-4 text-center">
                  <span className="text-sm font-bold">{errorMsg}</span>
                  <button 
                    onClick={() => setScale(1)}
                    className="text-xs text-blue-600 underline font-semibold mt-1"
                  >
                    Försök med standardupplösning
                  </button>
                </div>
              ) : previewDataUrl ? (
                <img 
                  src={previewDataUrl} 
                  alt="Whiteboard export" 
                  className="max-w-full max-h-[360px] object-contain rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-800/80"
                />
              ) : null}
            </div>
          </div>

          {/* Right Column: Settings & Options */}
          <div className="w-full lg:w-72 flex flex-col gap-5 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6">
            
            {/* Export Scope */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Område
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('FULL')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all text-left flex flex-col gap-0.5 ${
                    mode === 'FULL'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Hela vyn</span>
                  <span className="text-[10px] font-normal opacity-70">Hela skärmen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('CROP')}
                  disabled={widgets.length === 0}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all text-left flex flex-col gap-0.5 disabled:opacity-40 disabled:pointer-events-none ${
                    mode === 'CROP'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Beskär</span>
                  <span className="text-[10px] font-normal opacity-70">Endast innehåll</span>
                </button>
              </div>
            </div>

            {/* Resolution */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Upplösning
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScale(2)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all text-left flex flex-col gap-0.5 ${
                    scale === 2
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Hög (2x)</span>
                  <span className="text-[10px] font-normal opacity-70">Skarpt för tryck/skärm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScale(1)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all text-left flex flex-col gap-0.5 ${
                    scale === 1
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Standard (1x)</span>
                  <span className="text-[10px] font-normal opacity-70">Mindre filstorlek</span>
                </button>
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2">
                Övrigt
              </label>
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={includeWatermark}
                  onChange={(e) => setIncludeWatermark(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Inkludera Matteytan.se datumstämpel</span>
              </label>
            </div>

            {/* Widget Count Info */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
              Innehåller <strong className="text-slate-700 dark:text-slate-200">{widgets.length}</strong> öppna widgetar och alla dina whiteboard-ritningar.
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 hidden sm:block">
            Tips: Du kan även kopiera direkt för att klistra in (Ctrl+V) i Word, Slides eller Classroom.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Avbryt
            </button>

            <button
              type="button"
              onClick={handleCopyToClipboard}
              disabled={isGenerating || !previewDataUrl}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none ${
                copied 
                  ? 'bg-emerald-600 border-emerald-600 text-white' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Kopiera bilden direkt till urklipp för att klistra in i dokument"
            >
              {copied ? (
                <>
                  <Icons.Check size={16} />
                  <span>Kopierad!</span>
                </>
              ) : (
                <>
                  <Icons.Copy size={16} />
                  <span>Kopiera bild</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating || !previewDataUrl}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-40 disabled:pointer-events-none bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95"
            >
              <Icons.Download size={16} />
              <span>Ladda ner PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
