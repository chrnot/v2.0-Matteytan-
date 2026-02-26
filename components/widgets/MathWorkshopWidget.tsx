
import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../icons';

interface MathWorkshopWidgetProps {
  isTransparent?: boolean;
}

type TabType = 'NUMBERS' | 'SYMBOLS' | 'SHAPES' | 'BLOCKS';

interface Asset {
    id: string;
    type: 'NUMBER' | 'SYMBOL' | 'SHAPE' | 'BLOCK';
    content: React.ReactNode;
    bgColor: string;
    textColor: string;
    width: number;
    height: number;
}

interface CanvasItem extends Asset {
    instanceId: string;
    x: number;
    y: number;
    zIndex: number;
}

const ASSETS: Record<TabType, Asset[]> = {
    NUMBERS: Array.from({ length: 10 }).map((_, i) => ({
        id: `n-${i}`,
        type: 'NUMBER',
        content: i.toString(),
        bgColor: '#ffffff',
        textColor: '#1e293b',
        width: 60,
        height: 60
    })),
    SYMBOLS: [
        { id: 's-plus', type: 'SYMBOL', content: '+', bgColor: '#fef08a', textColor: '#854d0e', width: 60, height: 60 },
        { id: 's-minus', type: 'SYMBOL', content: '−', bgColor: '#fef08a', textColor: '#854d0e', width: 60, height: 60 },
        { id: 's-mult', type: 'SYMBOL', content: '×', bgColor: '#fef08a', textColor: '#854d0e', width: 60, height: 60 },
        { id: 's-div', type: 'SYMBOL', content: '÷', bgColor: '#fef08a', textColor: '#854d0e', width: 60, height: 60 },
        { id: 's-eq', type: 'SYMBOL', content: '=', bgColor: '#f1f5f9', textColor: '#475569', width: 60, height: 60 },
        { id: 's-lt', type: 'SYMBOL', content: '<', bgColor: '#f1f5f9', textColor: '#475569', width: 60, height: 60 },
        { id: 's-gt', type: 'SYMBOL', content: '>', bgColor: '#f1f5f9', textColor: '#475569', width: 60, height: 60 },
    ],
    SHAPES: [
        { id: 'sh-circ', type: 'SHAPE', content: <div className="w-12 h-12 rounded-full bg-blue-500 border-4 border-blue-600 shadow-inner" />, bgColor: 'transparent', textColor: '', width: 80, height: 80 },
        { id: 'sh-squ', type: 'SHAPE', content: <div className="w-12 h-12 bg-emerald-500 border-4 border-emerald-600 shadow-inner" />, bgColor: 'transparent', textColor: '', width: 80, height: 80 },
        { id: 'sh-tri', type: 'SHAPE', content: <div className="w-0 h-0 border-l-[25px] border-r-[25px] border-b-[45px] border-l-transparent border-r-transparent border-b-amber-500 drop-shadow-sm" />, bgColor: 'transparent', textColor: '', width: 80, height: 80 },
    ],
    BLOCKS: [
        { id: 'b-blue', type: 'BLOCK', content: null, bgColor: '#3b82f6', textColor: '', width: 50, height: 50 },
        { id: 'b-red', type: 'BLOCK', content: null, bgColor: '#ef4444', textColor: '', width: 50, height: 50 },
        { id: 'b-green', type: 'BLOCK', content: null, bgColor: '#22c55e', textColor: '', width: 50, height: 50 },
        { id: 'b-yellow', type: 'BLOCK', content: null, bgColor: '#eab308', textColor: '', width: 50, height: 50 },
    ]
};

export const MathWorkshopWidget: React.FC<MathWorkshopWidgetProps> = () => {
    const [activeTab, setActiveTab] = useState<TabType>('NUMBERS');
    const [items, setItems] = useState<CanvasItem[]>([]);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [topZ, setTopZ] = useState(10);
    const [snapToGrid, setSnapToGrid] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    const addItem = (asset: Asset, initialX: number, initialY: number) => {
        const newZ = topZ + 1;
        setTopZ(newZ);
        const instanceId = `inst-${Date.now()}-${Math.random()}`;
        const newItem: CanvasItem = { ...asset, instanceId, x: initialX, y: initialY, zIndex: newZ };
        setItems(prev => [...prev, newItem]);
        return instanceId;
    };

    const deleteItem = (instanceId: string) => setItems(prev => prev.filter(i => i.instanceId !== instanceId));
    const clearAll = () => { if (items.length > 0 && confirm('Vill du rensa hela tavlan?')) setItems([]); };

    const bringToFront = (instanceId: string) => {
        setTopZ(prev => prev + 1);
        setItems(prev => prev.map(item => item.instanceId === instanceId ? { ...item, zIndex: topZ + 1 } : item));
    };

    const handleSidebarMouseDown = (e: React.MouseEvent | React.TouchEvent, asset: Asset) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const startX = clientX - rect.left - asset.width / 2;
        const startY = clientY - rect.top - asset.height / 2;
        const instanceId = addItem(asset, startX, startY);
        setDraggingId(instanceId);
        dragOffset.current = { x: asset.width / 2, y: asset.height / 2 };
    };

    const handleCanvasItemMouseDown = (e: React.MouseEvent | React.TouchEvent, item: CanvasItem) => {
        e.stopPropagation();
        bringToFront(item.instanceId);
        setDraggingId(item.instanceId);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragOffset.current = { x: clientX - (canvasRef.current?.getBoundingClientRect().left || 0) - item.x, y: clientY - (canvasRef.current?.getBoundingClientRect().top || 0) - item.y };
    };

    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
        if (!draggingId || !canvasRef.current) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
        const rect = canvasRef.current.getBoundingClientRect();
        let newX = clientX - rect.left - dragOffset.current.x;
        let newY = clientY - rect.top - dragOffset.current.y;
        if (snapToGrid) { newX = Math.round(newX / 20) * 20; newY = Math.round(newY / 20) * 20; }
        newX = Math.max(-20, Math.min(rect.width - 40, newX));
        newY = Math.max(-20, Math.min(rect.height - 40, newY));
        setItems(prev => prev.map(item => item.instanceId === draggingId ? { ...item, x: newX, y: newY } : item));
    };

    const handleGlobalUp = () => setDraggingId(null);

    useEffect(() => {
        if (draggingId) {
            window.addEventListener('mousemove', handleGlobalMove);
            window.addEventListener('mouseup', handleGlobalUp);
            window.addEventListener('touchmove', handleGlobalMove, { passive: false });
            window.addEventListener('touchend', handleGlobalUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleGlobalMove);
            window.removeEventListener('mouseup', handleGlobalUp);
            window.removeEventListener('touchmove', handleGlobalMove);
            window.removeEventListener('touchend', handleGlobalUp);
        };
    }, [draggingId, snapToGrid]);

    return (
        <div className="w-full h-full flex flex-col bg-slate-100 overflow-hidden select-none border border-slate-300 rounded-xl shadow-inner relative">
            {/* Info Button */}
            <button onClick={() => setShowInfo(!showInfo)} className={`absolute top-2 right-2 p-2 rounded-full transition-all z-[110] ${showInfo ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}><Icons.Info size={20} /></button>

            {/* Info Modal */}
            {showInfo && (
              <div className="absolute top-14 right-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-[120] animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                <div className="flex justify-between items-start mb-3">
                   <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Matte-Verkstaden</h4>
                   <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
                </div>
                <div className="space-y-4 text-xs leading-relaxed text-slate-600">
                  <p>En fri arbetsyta där du kan bygga egna uppgifter, mönster eller uttryck.</p>
                  <section className="space-y-2">
                    <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
                    <ul className="space-y-1.5 list-disc pl-4">
                      <li><strong>Skapa:</strong> Dra ut objekt från den vänstra menyn till tavlan.</li>
                      <li><strong>Flytta:</strong> Klicka och dra föremålen för att placera dem var du vill.</li>
                      <li><strong>Rutnät:</strong> Slå på "RUTNÄT" för att få hjälp att ställa föremålen snyggt på rad.</li>
                      <li><strong>Radera:</strong> Håll musen över ett objekt och klicka på det röda krysset för att ta bort det.</li>
                    </ul>
                  </section>
                </div>
              </div>
            )}

            {/* Widget Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 shrink-0 pr-12">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(['NUMBERS', 'SYMBOLS', 'SHAPES', 'BLOCKS'] as TabType[]).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${activeTab === tab ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>{tab === 'NUMBERS' ? 'Siffror' : tab === 'SYMBOLS' ? 'Tecken' : tab === 'SHAPES' ? 'Form' : 'Block'}</button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setSnapToGrid(!snapToGrid)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${snapToGrid ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}><Icons.Grid size={12} /> RUTNÄT</button>
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <button onClick={clearAll} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Rensa tavlan"><Icons.Trash size={20} /></button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-20 sm:w-24 bg-white border-r border-slate-200 overflow-y-auto p-2 flex flex-col gap-3 shadow-sm scrollbar-none">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center mb-1">Dra ut</div>
                    {ASSETS[activeTab].map(asset => (
                        <div key={asset.id} onMouseDown={(e) => handleSidebarMouseDown(e, asset)} onTouchStart={(e) => handleSidebarMouseDown(e, asset)} className="group relative flex items-center justify-center p-1 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform">
                            <div className="flex items-center justify-center rounded-xl shadow-sm border border-slate-200 overflow-hidden" style={{ backgroundColor: asset.bgColor === 'transparent' ? '#f8fafc' : asset.bgColor, color: asset.textColor, width: '56px', height: '56px', fontSize: '24px', fontWeight: '900' }}>
                                {asset.type === 'BLOCK' ? <div className="w-8 h-8 rounded-sm shadow-md border-b-4 border-r-4 border-black/20" style={{ backgroundColor: asset.bgColor }}></div> : asset.content}
                            </div>
                        </div>
                    ))}
                </div>
                <div ref={canvasRef} className={`flex-1 relative overflow-hidden bg-white touch-none ${snapToGrid ? 'bg-grid-pattern' : ''}`}>
                    {items.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none p-12 text-center">
                            <Icons.Plus size={48} className="mb-4 opacity-10" /><h3 className="text-xl font-black opacity-20 uppercase tracking-tighter italic">Matte-Verkstad</h3><p className="text-sm max-w-[200px] mt-2 opacity-30 font-medium">Dra ut sifferbrickor eller block från vänster för att börja räkna.</p>
                        </div>
                    )}
                    {items.map(item => (
                        <div key={item.instanceId} onMouseDown={(e) => handleCanvasItemMouseDown(e, item)} onTouchStart={(e) => handleCanvasItemMouseDown(e, item)} className={`absolute group flex items-center justify-center transition-shadow ${draggingId === item.instanceId ? 'shadow-2xl scale-110 z-[1000] cursor-grabbing' : 'shadow-md hover:shadow-lg cursor-grab active:cursor-grabbing'}`} style={{ left: item.x, top: item.y, width: item.width, height: item.height, zIndex: item.zIndex }}>
                            <div className={`w-full h-full flex items-center justify-center relative transition-all duration-300 ${item.type === 'SHAPE' ? '' : 'rounded-2xl border-2 border-slate-200/50 shadow-sm'}`} style={{ backgroundColor: item.bgColor, color: item.textColor, fontSize: item.width * 0.5, fontWeight: '900' }}>
                                {item.type === 'BLOCK' && <div className="w-full h-full rounded-xl border-b-8 border-r-4 border-black/20 shadow-inner" style={{ backgroundColor: item.bgColor }}></div>}
                                {item.content}
                                <button onClick={(e) => { e.stopPropagation(); deleteItem(item.instanceId); }} className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg z-[60] hover:bg-red-600 hover:scale-110 active:scale-90"><Icons.X size={16} strokeWidth={4} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2"><Icons.Zap size={12} className="text-amber-500" />Dra objekt från vänster för att skapa. Klicka på X för radering.</p>
                <div className="flex items-center gap-3"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm animate-pulse"></div><span className="text-[10px] font-black text-slate-600 uppercase">Objekt på tavlan: {items.length}</span></div></div>
            </div>
        </div>
    );
};
