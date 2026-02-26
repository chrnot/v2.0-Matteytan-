
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Toolbar } from './components/Toolbar';
import { WidgetWrapper } from './components/WidgetWrapper';
import { Logo } from './components/Logo';
import { WidgetType, WidgetInstance, BackgroundType, BackgroundConfig } from './types';
import { Icons } from './components/icons';
import { DrawingCanvas, DrawingCanvasHandle } from './components/DrawingCanvas';

// Lazy load widgets
const NumberLineWidget = lazy(() => import('./components/widgets/NumberLineWidget').then(m => ({ default: m.NumberLineWidget })));
const RulerWidget = lazy(() => import('./components/widgets/RulerWidget').then(m => ({ default: m.RulerWidget })));
const ProtractorWidget = lazy(() => import('./components/widgets/ProtractorWidget').then(m => ({ default: m.ProtractorWidget })));
const FractionWidget = lazy(() => import('./components/widgets/FractionWidget').then(m => ({ default: m.FractionWidget })));
const CoordinatesWidget = lazy(() => import('./components/widgets/CoordinatesWidget').then(m => ({ default: m.CoordinatesWidget })));
const ProbabilityWidget = lazy(() => import('./components/widgets/ProbabilityWidget').then(m => ({ default: m.ProbabilityWidget })));
const NumberDayWidget = lazy(() => import('./components/widgets/NumberDayWidget').then(m => ({ default: m.NumberDayWidget })));
const EquationWidget = lazy(() => import('./components/widgets/EquationWidget').then(m => ({ default: m.EquationWidget })));
const FormulaWidget = lazy(() => import('./components/widgets/FormulaWidget').then(m => ({ default: m.FormulaWidget })));
const CalculatorWidget = lazy(() => import('./components/widgets/CalculatorWidget').then(m => ({ default: m.CalculatorWidget })));
const PercentageWidget = lazy(() => import('./components/widgets/PercentageWidget').then(m => ({ default: m.PercentageWidget })));
const Base10Widget = lazy(() => import('./components/widgets/Base10Widget').then(m => ({ default: m.Base10Widget })));
const HundredChartWidget = lazy(() => import('./components/widgets/HundredChartWidget').then(m => ({ default: m.HundredChartWidget })));
const NumberHouseWidget = lazy(() => import('./components/widgets/NumberHouseWidget').then(m => ({ default: m.NumberHouseWidget })));
const NumberBeadsWidget = lazy(() => import('./components/widgets/NumberBeadsWidget').then(m => ({ default: m.NumberBeadsWidget })));
const ShapesWidget = lazy(() => import('./components/widgets/ShapesWidget').then(m => ({ default: m.ShapesWidget })));
const FractionBarsWidget = lazy(() => import('./components/widgets/FractionBarsWidget').then(m => ({ default: m.FractionBarsWidget })));
const MathWorkshopWidget = lazy(() => import('./components/widgets/MathWorkshopWidget').then(m => ({ default: m.MathWorkshopWidget })));
const PrimeBubblesWidget = lazy(() => import('./components/widgets/PrimeBubblesWidget').then(m => ({ default: m.PrimeBubblesWidget })));
const ChanceGeneratorWidget = lazy(() => import('./components/widgets/ChanceGeneratorWidget').then(m => ({ default: m.ChanceGeneratorWidget })));
const ClockLabWidget = lazy(() => import('./components/widgets/ClockLabWidget').then(m => ({ default: m.ClockLabWidget })));
const EconomyWidget = lazy(() => import('./components/widgets/EconomyWidget').then(m => ({ default: m.EconomyWidget })));
const MultiMatchWidget = lazy(() => import('./components/widgets/MultiMatchWidget').then(m => ({ default: m.MultiMatchWidget })));
const TieredTaskWidget = lazy(() => import('./components/widgets/TieredTaskWidget').then(m => ({ default: m.TieredTaskWidget })));

// Lazy load modals
const AboutModal = lazy(() => import('./components/AboutModal').then(m => ({ default: m.AboutModal })));
const CodeOfConductModal = lazy(() => import('./components/CodeOfConductModal').then(m => ({ default: m.CodeOfConductModal })));

const BACKGROUNDS: BackgroundConfig[] = [
  { type: 'GRID', label: 'Rutnät', className: 'bg-grid-pattern' },
  { type: 'DOTS', label: 'Prickar', className: 'bg-dot-pattern' },
  { type: 'WHITE', label: 'Vit', className: 'bg-white' },
  { type: 'BLACK', label: 'Svart', className: 'bg-slate-900' },
];

const App: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [background, setBackground] = useState<BackgroundType>('GRID');
  const [topZ, setTopZ] = useState(150); 
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCoCOpen, setIsCoCOpen] = useState(false);
  
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawColor, setDrawColor] = useState('#ef4444'); 
  const [drawWidth, setDrawWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const drawingCanvasRef = useRef<DrawingCanvasHandle>(null);

  const [transparentWidgets, setTransparentWidgets] = useState<Record<string, boolean>>({});

  const getDefaultSize = (type: WidgetType) => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const isMobile = screenW < 768;
      const isTablet = screenW >= 768 && screenW < 1024;

      // Base clamp proportions
      const clampW = (w: number) => Math.min(w, screenW * 0.95);
      const clampH = (h: number) => Math.min(h, screenH * 0.85);

      switch(type) {
          case WidgetType.NUMBER_LINE: return { w: clampW(isMobile ? 380 : 800), h: clampH(isMobile ? 450 : 380) };
          case WidgetType.COORDINATES: return { w: clampW(isMobile ? 380 : 700), h: clampH(isMobile ? 650 : 500) };
          case WidgetType.PROBABILITY: return { w: clampW(isMobile ? 380 : 600), h: clampH(isMobile ? 700 : 650) };
          case WidgetType.BASE_10: return { w: clampW(isMobile ? 380 : 850), h: clampH(isMobile ? 750 : 550) };
          case WidgetType.PERCENTAGE: return { w: clampW(isMobile ? 380 : 700), h: clampH(isMobile ? 650 : 520) };
          case WidgetType.NUMBER_BEADS: return { w: clampW(isMobile ? 380 : 850), h: clampH(isMobile ? 550 : 720) };
          case WidgetType.FRACTION: return { w: clampW(isMobile ? 380 : 550), h: clampH(isMobile ? 650 : 450) };
          case WidgetType.RULER: return { w: clampW(isMobile ? 350 : 600), h: 180 };
          case WidgetType.PROTRACTOR: return { w: clampW(isMobile ? 350 : 450), h: 280 };
          case WidgetType.EQUATION: return { w: clampW(isMobile ? 380 : 600), h: clampH(isMobile ? 700 : 650) };
          case WidgetType.HUNDRED_CHART: return { w: clampW(isMobile ? 380 : 500), h: clampH(isMobile ? 600 : 650) };
          case WidgetType.NUMBER_OF_DAY: return { w: clampW(isMobile ? 380 : 450), h: clampH(isMobile ? 700 : 750) };
          case WidgetType.FRACTION_BARS: return { w: clampW(isMobile ? 380 : 800), h: clampH(isMobile ? 700 : 550) };
          case WidgetType.NUMBER_HOUSE: return { w: clampW(360), h: clampH(isMobile ? 550 : 580) };
          case WidgetType.CALCULATOR: return { w: clampW(340), h: clampH(isMobile ? 520 : 580) };
          case WidgetType.SHAPES: return { w: clampW(isMobile ? 380 : 500), h: clampH(isMobile ? 700 : 580) };
          case WidgetType.MATH_WORKSHOP: return { w: clampW(isMobile ? 380 : 850), h: clampH(isMobile ? 650 : 600) };
          case WidgetType.PRIME_BUBBLES: return { w: clampW(isMobile ? 380 : 850), h: clampH(isMobile ? 650 : 650) };
          case WidgetType.CHANCE_GENERATOR: return { w: clampW(360), h: clampH(isMobile ? 650 : 580) };
          case WidgetType.CLOCK: return { w: clampW(isMobile ? 380 : 700), h: clampH(isMobile ? 650 : 550) };
          case WidgetType.ECONOMY: return { w: clampW(isMobile ? 380 : 750), h: clampH(isMobile ? 800 : 650) };
          case WidgetType.MULTI_MATCH: return { w: clampW(isMobile ? 380 : 450), h: clampH(isMobile ? 700 : 750) };
          case WidgetType.TIERED_TASK: return { w: clampW(isMobile ? 380 : 600), h: clampH(isMobile ? 650 : 650) };
          default: return { w: clampW(400), h: 400 };
      }
  };

  const addWidget = (type: WidgetType) => {
    const size = getDefaultSize(type);
    const id = `${type}-${Date.now()}`;
    
    if (type === WidgetType.RULER || type === WidgetType.PROTRACTOR) {
        setTransparentWidgets(prev => ({ ...prev, [id]: true }));
    }

    const newWidget: WidgetInstance = {
      id,
      type,
      x: Math.max(10, window.innerWidth / 2 - size.w / 2 + (Math.random() * 20 - 10)),
      y: Math.max(80, window.innerHeight / 2 - size.h / 2 + (Math.random() * 20 - 10)),
      width: size.w,
      height: size.h,
      zIndex: topZ + 1,
    };
    setTopZ(prev => prev + 1);
    setWidgets([...widgets, newWidget]);
    setIsToolsOpen(false);
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
    const newTrans = { ...transparentWidgets };
    delete newTrans[id];
    setTransparentWidgets(newTrans);
  };

  const bringToFront = (id: string) => {
    setTopZ(prev => prev + 1);
    setWidgets(widgets.map(w => w.id === id ? { ...w, zIndex: topZ + 1 } : w));
  };

  const updatePosition = (id: string, x: number, y: number) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const updateSize = (id: string, width: number, height: number) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, width, height } : w));
  };
  
  const toggleTransparency = (id: string, isTrans: boolean) => {
      setTransparentWidgets(prev => ({ ...prev, [id]: isTrans }));
  };

  // ARRANGEMENT LOGIC
  const arrangeWidgets = () => {
    if (widgets.length === 0) return;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const marginT = 100;
    const marginB = 100;
    const marginX = 40;
    const gap = 20;

    const availableW = screenW - (marginX * 2);
    const availableH = screenH - marginT - marginB;

    let cols: number;
    let rows: number;

    const n = widgets.length;
    if (n === 1) { cols = 1; rows = 1; }
    else if (n === 2) { cols = 2; rows = 1; }
    else if (n <= 4) { cols = 2; rows = 2; }
    else if (n <= 6) { cols = 3; rows = 2; }
    else if (n <= 9) { cols = 3; rows = 3; }
    else { cols = 4; rows = Math.ceil(n / 4); }

    const cellW = (availableW - (cols - 1) * gap) / cols;
    const cellH = (availableH - (rows - 1) * gap) / rows;

    const arrangedWidgets = widgets.map((w, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      let width = cellW;
      let height = cellH;
      
      if (n === 1) {
          width = Math.min(900, availableW * 0.7);
          height = Math.min(650, availableH * 0.7);
      } else if (n === 2) {
          width = Math.min(availableW * 0.45, cellW);
          height = Math.min(availableH * 0.6, cellH);
      }

      const x = marginX + col * (cellW + gap) + (cellW - width) / 2;
      const y = marginT + row * (cellH + gap) + (cellH - height) / 2;

      return { ...w, x, y, width, height };
    });

    setWidgets(arrangedWidgets);
  };

  const getBackgroundClass = () => {
    switch (background) {
      case 'GRID': return 'bg-paper bg-grid-pattern';
      case 'DOTS': return 'bg-paper bg-dot-pattern';
      case 'BLACK': return 'bg-slate-900';
      default: return 'bg-white';
    }
  };

  const renderWidgetContent = (widget: WidgetInstance) => {
    const props = {
        id: widget.id,
        isTransparent: transparentWidgets[widget.id] || false,
        setTransparent: (v: boolean) => toggleTransparency(widget.id, v)
    };

    switch (widget.type) {
      case WidgetType.NUMBER_LINE: return <NumberLineWidget {...props} />;
      case WidgetType.RULER: return <RulerWidget {...props} />;
      case WidgetType.PROTRACTOR: return <ProtractorWidget {...props} />;
      case WidgetType.FRACTION: return <FractionWidget {...props} />;
      case WidgetType.COORDINATES: return <CoordinatesWidget {...props} />;
      case WidgetType.PROBABILITY: return <ProbabilityWidget {...props} />;
      case WidgetType.NUMBER_OF_DAY: return <NumberDayWidget {...props} />;
      case WidgetType.EQUATION: return <EquationWidget {...props} />;
      case WidgetType.FORMULAS: return <FormulaWidget {...props} />;
      case WidgetType.CALCULATOR: return <CalculatorWidget {...props} />;
      case WidgetType.PERCENTAGE: return <PercentageWidget {...props} />;
      case WidgetType.BASE_10: return <Base10Widget {...props} />;
      case WidgetType.HUNDRED_CHART: return <HundredChartWidget {...props} />;
      case WidgetType.NUMBER_HOUSE: return <NumberHouseWidget {...props} />;
      case WidgetType.NUMBER_BEADS: return <NumberBeadsWidget {...props} />;
      case WidgetType.SHAPES: return <ShapesWidget {...props} />;
      case WidgetType.FRACTION_BARS: return <FractionBarsWidget {...props} />;
      case WidgetType.MATH_WORKSHOP: return <MathWorkshopWidget {...props} />;
      case WidgetType.PRIME_BUBBLES: return <PrimeBubblesWidget {...props} />;
      case WidgetType.CHANCE_GENERATOR: return <ChanceGeneratorWidget {...props} />;
      case WidgetType.CLOCK: return <ClockLabWidget />;
      case WidgetType.ECONOMY: return <EconomyWidget {...props} />;
      case WidgetType.MULTI_MATCH: return <MultiMatchWidget {...props} />;
      case WidgetType.TIERED_TASK: return <TieredTaskWidget {...props} />;
      default: return null;
    }
  };

  const getWidgetTitle = (type: WidgetType) => {
      switch (type) {
      case WidgetType.NUMBER_LINE: return 'Tallinje';
      case WidgetType.RULER: return 'Linjal';
      case WidgetType.PROTRACTOR: return 'Gradskiva';
      case WidgetType.FRACTION: return 'Bråk';
      case WidgetType.COORDINATES: return 'Koordinatsystem';
      case WidgetType.PROBABILITY: return 'Sannolikhet';
      case WidgetType.NUMBER_OF_DAY: return 'Dagens Tal';
      case WidgetType.EQUATION: return 'Ekvationer';
      case WidgetType.FORMULAS: return 'Formler';
      case WidgetType.CALCULATOR: return 'Räknare';
      case WidgetType.PERCENTAGE: return 'Procent';
      case WidgetType.BASE_10: return 'Bas-klossar';
      case WidgetType.HUNDRED_CHART: return 'Hundrarutan';
      case WidgetType.NUMBER_HOUSE: return 'Tal-huset';
      case WidgetType.NUMBER_BEADS: return 'Pärlband';
      case WidgetType.SHAPES: return 'Former';
      case WidgetType.FRACTION_BARS: return 'Bråkstavar';
      case WidgetType.MATH_WORKSHOP: return 'Matte-verkstad';
      case WidgetType.PRIME_BUBBLES: return 'Prim-Bubblor';
      case WidgetType.CHANCE_GENERATOR: return 'Slump-gen';
      case WidgetType.CLOCK: return 'Klock-Labbet';
      case WidgetType.ECONOMY: return 'Plånboken';
      case WidgetType.MULTI_MATCH: return 'Multi-Matchen';
      case WidgetType.TIERED_TASK: return 'Nivå-Kortet';
      default: return 'Verktyg';
    }
  };

  const EXTRA_TOOLS = [
    { type: WidgetType.MATH_WORKSHOP, icon: Icons.Tools, label: 'Verkstad' },
    { type: WidgetType.PRIME_BUBBLES, icon: Icons.Zap, label: 'Prim-Bubblor' },
    { type: WidgetType.TIERED_TASK, icon: Icons.Book, label: 'Nivå-Kort' },
    { type: WidgetType.MULTI_MATCH, icon: Icons.Zap, label: 'Multi-Match' },
    { type: WidgetType.CHANCE_GENERATOR, icon: Icons.Shuffle, label: 'Slump-gen' },
    { type: WidgetType.CLOCK, icon: Icons.Clock, label: 'Klocka' },
    { type: WidgetType.SHAPES, icon: Icons.Shapes, label: 'Former' },
    { type: WidgetType.RULER, icon: Icons.Ruler, label: 'Linjal' },
    { type: WidgetType.PROTRACTOR, icon: Icons.Rotate, label: 'Gradskiva' },
    { type: WidgetType.CALCULATOR, icon: Icons.Math, label: 'Räknare' },
    { type: 'DRAWING', icon: Icons.Pencil, label: 'Rita' },
  ];

  const handleToolClick = (tool: any) => {
    if (tool.type === 'DRAWING') {
      setIsDrawingMode(!isDrawingMode);
      setIsToolsOpen(false);
    } else {
      addWidget(tool.type as WidgetType);
    }
  };

  const clearDrawings = () => {
    drawingCanvasRef.current?.clear();
  };

  return (
    <div className={`w-full h-full relative overflow-hidden transition-colors duration-500 ${getBackgroundClass()}`}>
      
      <Logo darkMode={background === 'BLACK'} />

      {/* Top Controls Bar */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[2000] flex items-start gap-2">
         
         <button 
            onClick={arrangeWidgets}
            disabled={widgets.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all font-bold text-xs sm:text-sm disabled:opacity-30 disabled:hover:scale-100"
            title="Ordna fönster i rutnät"
         >
             <span className="text-lg leading-none">🧩</span> <span className="hidden md:inline uppercase tracking-widest">Ordna</span>
         </button>

         <button 
            onClick={() => addWidget(WidgetType.NUMBER_OF_DAY)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all font-bold text-xs sm:text-sm"
         >
             <Icons.Calendar size={16} /> <span className="hidden md:inline">Dagens Tal</span>
         </button>

         <div className="relative">
            <button 
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 hover:scale-105 active:scale-95 transition-all font-bold text-xs sm:text-sm ${isToolsOpen ? 'ring-2 ring-blue-200 text-blue-600' : ''}`}
            >
                <Icons.Tools size={16} /> 
                <span className="hidden md:inline">Verktyg</span>
                <Icons.ChevronDown size={14} className={`transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>

            {isToolsOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur rounded-xl shadow-xl border border-slate-200 p-1.5 flex flex-col gap-1 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">Funktioner</div>
                    {EXTRA_TOOLS.map((tool) => (
                        <button
                            key={tool.label}
                            onClick={() => handleToolClick(tool)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${tool.type === 'DRAWING' && isDrawingMode ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-700 hover:text-blue-600'}`}
                        >
                            <div className="flex items-center gap-3">
                                <tool.icon size={18} />
                                <span>{tool.label}</span>
                            </div>
                            {tool.type === 'DRAWING' && isDrawingMode && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>}
                        </button>
                    ))}
                    
                    <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mt-2 mb-1">Bakgrund</div>
                    <div className="grid grid-cols-2 gap-1 p-1">
                        {BACKGROUNDS.map(bg => (
                            <button 
                                key={bg.type}
                                onClick={() => setBackground(bg.type)}
                                className={`px-2 py-1.5 rounded text-[10px] font-bold uppercase tracking-tighter border transition-all ${background === bg.type ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                            >
                                {bg.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
         </div>
      </div>

      <DrawingCanvas 
        ref={drawingCanvasRef}
        isDrawingMode={isDrawingMode}
        color={drawColor}
        lineWidth={drawWidth}
        isEraser={isEraser}
        zIndex={10}
      />

      {widgets.map(widget => (
        <WidgetWrapper
          key={widget.id}
          id={widget.id}
          title={getWidgetTitle(widget.type)}
          initialX={widget.x}
          initialY={widget.y}
          initialWidth={widget.width}
          initialHeight={widget.height}
          zIndex={widget.zIndex}
          transparent={transparentWidgets[widget.id]}
          onClose={removeWidget}
          onFocus={bringToFront}
          onMove={updatePosition}
          onResize={updateSize}
        >
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            {renderWidgetContent(widget)}
          </Suspense>
        </WidgetWrapper>
      ))}

      {/* About Modal */}
      <Suspense fallback={null}>
        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </Suspense>
      
      {/* Code of Conduct Modal */}
      <Suspense fallback={null}>
        <CodeOfConductModal isOpen={isCoCOpen} onClose={() => setIsCoCOpen(false)} />
      </Suspense>

      {/* GLOBAL FOOTER ELEMENTS */}
      
      {/* Bottom Left: Creative Commons */}
      <div className="absolute bottom-4 left-6 z-[2000] pointer-events-auto flex items-center gap-2 transition-opacity duration-300 text-shadow-sm">
          <svg className="w-4 h-4 text-slate-400 opacity-80" viewBox="0 0 496 512" fill="currentColor">
            <path d="M245.83 214.87l-33.22 17.28c-9.43-19.58-25.24-19.93-27.46-19.93-22.13 0-33.22 14.61-33.22 43.89 0 23.57 9.21 43.89 33.22 43.89 20 0 33.22-14.61 33.22-43.89h33.22c0 46.14-31.09 77.12-66.44 77.12-46.92 0-66.44-32.63-66.44-77.12 0-43.55 17.28-77.12 66.44-77.12 26.74 0 53.21 10.82 66.44 35.88zm143.84 0l-33.22 17.28c-9.43-19.58-25.24-19.93-27.46-19.93-22.13 0-33.22 14.61-33.22 43.89 0 23.57 9.21 43.89 33.22 43.89 20 0 33.22-14.61 33.22-43.89h33.22c0 46.14-31.09 77.12-66.44 77.12-46.92 0-66.44-32.63-66.44-77.12 0-43.55 17.28-77.12 66.44-77.12 26.74 0 53.21 10.82 66.44 35.88zM247.7 8C104.74 8 8 123.04 8 256c0 132.96 96.74 248 239.7 248 142.96 0 248.3-115.04 248.3-248C496 123.04 390.66 8 247.7 8zm.3 450.7c-112.03 0-203-90.97-203-203s90.97-203 203-203 203 90.97 203 203-90.97 203-203 203z"/>
          </svg>
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400">
              LICENS: CC0 1.0 UNIVERSAL
          </div>
      </div>

      {/* Bottom Center: Main Links */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[2000] flex flex-wrap justify-center items-center gap-4 sm:gap-8 pointer-events-auto transition-opacity duration-300">
          <button 
            onClick={() => setIsAboutOpen(true)}
            className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
          >
            Om Matteytan
          </button>
          <button 
            onClick={() => setIsCoCOpen(true)}
            className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
          >
            Uppförandekod
          </button>
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSegCGpTPfvN7R2A1WOWsDS5qZuM_JDKJiTvG1gRtCCF2l8Uvw/viewform?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
          >
             <Icons.Feedback size={12} /> Ge Feedback
          </a>
      </div>

      {/* Bottom Right: Netlify Link */}
      <div className="absolute bottom-4 right-6 z-[2000] pointer-events-auto transition-opacity duration-300">
          <a 
            href="https://www.netlify.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            This site is powered by Netlify
          </a>
      </div>

      <Toolbar 
        onAddWidget={addWidget} 
        onSetBackground={setBackground}
        currentBackground={background}
        isDrawingMode={isDrawingMode}
        setIsDrawingMode={setIsDrawingMode}
        drawColor={drawColor}
        setDrawColor={setDrawColor}
        drawWidth={drawWidth}
        setDrawWidth={setDrawWidth}
        isEraser={isEraser}
        setIsEraser={setIsEraser}
        onClearDrawings={clearDrawings}
      />
    </div>
  );
};

export default App;
