
import React, { useState, useEffect, useRef, Suspense, lazy, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toolbar } from './components/Toolbar';
import { WidgetWrapper } from './components/WidgetWrapper';
import { Logo } from './components/Logo';
import { WidgetType, WidgetInstance, WidgetGroup, WhiteboardSnapshot, BackgroundType, BackgroundConfig } from './types';
import { Icons } from './components/icons';
import { DrawingCanvas, DrawingCanvasHandle } from './components/DrawingCanvas';
import { WidgetGroupFrame } from './components/WidgetGroupFrame';
import { SelectionToolbar } from './components/SelectionToolbar';
import { ExportModal } from './components/ExportModal';
import { useClickOutside } from './src/utils/useClickOutside';

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
const PrefixConverterWidget = lazy(() => import('./components/widgets/PrefixConverterWidget').then(m => ({ default: m.PrefixConverterWidget })));
const PositionsMachineWidget = lazy(() => import('./components/widgets/PositionsMachineWidget').then(m => ({ default: m.PositionsMachineWidget })));
const UnitStaircaseWidget = lazy(() => import('./components/widgets/UnitStaircaseWidget').then(m => ({ default: m.UnitStaircaseWidget })));
const BasicStatisticianWidget = lazy(() => import('./components/widgets/BasicStatisticianWidget').then(m => ({ default: m.BasicStatisticianWidget })));
const CentikubBoxWidget = lazy(() => import('./components/widgets/CentikubBoxWidget').then(m => ({ default: m.CentikubBoxWidget })));
const PiCodeWidget = lazy(() => import('./components/widgets/PiCodeWidget').then(m => ({ default: m.PiCodeWidget })));
const SortingBoxWidget = lazy(() => import('./components/widgets/SortingBoxWidget').then(m => ({ default: m.SortingBoxWidget })));
const NoteWidget = lazy(() => import('./components/widgets/NoteWidget').then(m => ({ default: m.NoteWidget })));

// Lazy load modals
const AboutModal = lazy(() => import('./components/AboutModal').then(m => ({ default: m.AboutModal })));
const CodeOfConductModal = lazy(() => import('./components/CodeOfConductModal').then(m => ({ default: m.CodeOfConductModal })));

const BACKGROUNDS: BackgroundConfig[] = [
  { type: 'GRID', label: 'Rutnät', className: 'bg-grid-pattern bg-[var(--surface-primary)]' },
  { type: 'DOTS', label: 'Prickar', className: 'bg-dot-pattern bg-[var(--surface-primary)]' },
  { type: 'WHITE', label: 'Vit', className: 'bg-[var(--surface-primary)]' },
  { type: 'BLACK', label: 'Svart', className: 'bg-slate-900' },
];

import { MathArea, Difficulty, WidgetMetadata, MathSubArea } from './types';
import { Sidebar } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';

const clamp = (val: number, max: number) => Math.min(val, max);

const MagicSquareWidget = lazy(() => import('./components/widgets/MagicSquareWidget').then(m => ({ default: m.MagicSquareWidget })));
const MatchstickRiddleWidget = lazy(() => import('./components/widgets/MatchstickRiddleWidget').then(m => ({ default: m.MatchstickRiddleWidget })));

const WIDGET_CONFIG: Record<WidgetType, { 
  title: string; 
  component: React.ComponentType<any>;
  size: (isMobile: boolean, sw: number, sh: number) => { w: number; h: number };
  category: MathArea[];
  subCategory?: MathSubArea;
  difficulty: Difficulty;
  klagSupport?: boolean;
}> = {
  [WidgetType.NUMBER_LINE]: { 
    title: 'Tallinje', 
    component: NumberLineWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 800, sw * 0.95), h: clamp(m ? 450 : 380, sh * 0.85) }),
    category: [MathArea.TAL, MathArea.SAMBAND],
    subCategory: MathSubArea.RELATIONS,
    difficulty: Difficulty.LABORATIVE,
  },
  [WidgetType.RULER]: { 
    title: 'Linjal', 
    component: RulerWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 350 : 600, sw * 0.95), h: 180 }),
    category: [],
    subCategory: MathSubArea.RELATIONS,
    difficulty: Difficulty.LABORATIVE,
  },
  [WidgetType.PROTRACTOR]: { 
    title: 'Gradskiva', 
    component: ProtractorWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 350 : 450, sw * 0.95), h: 280 }),
    category: [],
    subCategory: MathSubArea.RELATIONS,
    difficulty: Difficulty.LABORATIVE,
  },
  [WidgetType.FRACTION]: { 
    title: 'Bråk', 
    component: FractionWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 550, sw * 0.95), h: clamp(m ? 650 : 450, sh * 0.85) }),
    category: [MathArea.TAL],
    subCategory: MathSubArea.DECIMAL_FORMS,
    difficulty: Difficulty.CONCRETIZING,
  },
  [WidgetType.COORDINATES]: { 
    title: 'Koordinatsystem', 
    component: CoordinatesWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 700, sw * 0.95), h: clamp(m ? 650 : 500, sh * 0.85) }),
    category: [MathArea.GEOMETRI, MathArea.SAMBAND],
    difficulty: Difficulty.CONCRETIZING,
  },
  [WidgetType.PROBABILITY]: { 
    title: 'Sannolikhet', 
    component: ProbabilityWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 600, sw * 0.95), h: clamp(m ? 700 : 650, sh * 0.85) }),
    category: [MathArea.STATISTIK],
    difficulty: Difficulty.CONCRETIZING,
  },
  [WidgetType.NUMBER_OF_DAY]: { 
    title: 'Dagens Tal', 
    component: NumberDayWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 450, sw * 0.95), h: clamp(m ? 700 : 750, sh * 0.85) }),
    category: [MathArea.TAL],
    subCategory: MathSubArea.RELATIONS,
    difficulty: Difficulty.CONCRETIZING,
  },
  [WidgetType.EQUATION]: { 
    title: 'Ekvationer', 
    component: EquationWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 600, sw * 0.95), h: clamp(m ? 700 : 650, sh * 0.85) }),
    category: [MathArea.ALGEBRA],
    difficulty: Difficulty.ABSTRACTING,
  },
  [WidgetType.FORMULAS]: { 
    title: 'Formler', 
    component: FormulaWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 600, sw * 0.95), h: clamp(m ? 700 : 650, sh * 0.85) }),
    category: [],
    difficulty: Difficulty.FORMAL,
  },
  [WidgetType.CALCULATOR]: { 
    title: 'Räknare', 
    component: CalculatorWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(340, sw * 0.95), h: clamp(m ? 520 : 580, sh * 0.85) }),
    category: [],
    subCategory: MathSubArea.DECIMAL_FORMS,
    difficulty: Difficulty.LABORATIVE,
  },
  [WidgetType.PERCENTAGE]: { 
    title: 'Procent', 
    component: PercentageWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 700, sw * 0.95), h: clamp(m ? 650 : 520, sh * 0.85) }),
    category: [MathArea.TAL, MathArea.SAMBAND],
    subCategory: MathSubArea.DECIMAL_FORMS,
    difficulty: Difficulty.CONCRETIZING,
  },
  [WidgetType.BASE_10]: { 
    title: 'Bas-klossar', 
    component: Base10Widget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 850, sw * 0.95), h: clamp(m ? 750 : 550, sh * 0.85) }),
    category: [MathArea.TAL],
    subCategory: MathSubArea.POSITIONS,
    difficulty: Difficulty.CONCRETIZING,
  },
  [WidgetType.HUNDRED_CHART]: { 
    title: 'Hundrarutan', 
    component: HundredChartWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 500, sw * 0.95), h: clamp(m ? 600 : 650, sh * 0.85) }),
    category: [MathArea.TAL],
    subCategory: MathSubArea.PATTERNS,
    difficulty: Difficulty.LABORATIVE,
  },
  [WidgetType.NUMBER_HOUSE]: { 
    title: 'Tal-huset', 
    component: NumberHouseWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(360, sw * 0.95), h: clamp(m ? 550 : 580, sh * 0.85) }),
    category: [MathArea.TAL],
    subCategory: MathSubArea.OPERATIONS,
    difficulty: Difficulty.CONCRETIZING,
  },
  [WidgetType.NUMBER_BEADS]: { 
    title: 'Pärlband', 
    component: NumberBeadsWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 850, sw * 0.95), h: clamp(m ? 550 : 720, sh * 0.85) }),
    category: [MathArea.TAL],
    subCategory: MathSubArea.RELATIONS,
    difficulty: Difficulty.LABORATIVE,
  },
  [WidgetType.SHAPES]: { 
    title: 'Former', 
    component: ShapesWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 500, sw * 0.95), h: clamp(m ? 700 : 580, sh * 0.85) }),
    category: [MathArea.GEOMETRI],
    difficulty: Difficulty.LABORATIVE,
  },
  [WidgetType.FRACTION_BARS]: { 
    title: 'Bråkstavar', 
    component: FractionBarsWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 800, sw * 0.95), h: clamp(m ? 700 : 550, sh * 0.85) }),
    category: [MathArea.TAL],
    subCategory: MathSubArea.DECIMAL_FORMS,
    difficulty: Difficulty.CONCRETIZING,
  },
  [WidgetType.MATH_WORKSHOP]: { 
    title: 'Matte-verkstad', 
    component: MathWorkshopWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 850, sw * 0.95), h: clamp(m ? 650 : 600, sh * 0.85) }),
    category: [],
    difficulty: Difficulty.LABORATIVE,
    klagSupport: true,
  },
  [WidgetType.PRIME_BUBBLES]: { 
    title: 'Prim-Bubblor', 
    component: PrimeBubblesWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 850, sw * 0.95), h: clamp(m ? 650 : 650, sh * 0.85) }),
    category: [MathArea.TAL],
    subCategory: MathSubArea.OPERATIONS,
    difficulty: Difficulty.ABSTRACTING,
  },
  [WidgetType.CHANCE_GENERATOR]: { 
    title: 'Slump-gen', 
    component: ChanceGeneratorWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(360, sw * 0.95), h: clamp(m ? 650 : 580, sh * 0.85) }),
    category: [MathArea.STATISTIK],
    difficulty: Difficulty.LABORATIVE,
  },
  [WidgetType.CLOCK]: { 
    title: 'Klock-Labbet', 
    component: ClockLabWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 700, sw * 0.95), h: clamp(m ? 650 : 550, sh * 0.85) }),
    category: [MathArea.TAL, MathArea.GEOMETRI],
    subCategory: MathSubArea.RELATIONS,
    difficulty: Difficulty.LABORATIVE,
  },
  [WidgetType.ECONOMY]: { 
    title: 'Plånboken', 
    component: EconomyWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 750, sw * 0.95), h: clamp(m ? 800 : 650, sh * 0.85) }),
    category: [MathArea.SAMBAND],
    subCategory: MathSubArea.OPERATIONS,
    difficulty: Difficulty.CONCRETIZING,
  },
  [WidgetType.MULTI_MATCH]: { 
    title: 'Multi-Matchen', 
    component: MultiMatchWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 450, sw * 0.95), h: clamp(m ? 700 : 750, sh * 0.85) }),
    category: [MathArea.ALGEBRA],
    difficulty: Difficulty.CONCRETIZING,
  },
  [WidgetType.TIERED_TASK]: { 
    title: 'Nivå-Kortet', 
    component: TieredTaskWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 600, sw * 0.95), h: clamp(m ? 650 : 650, sh * 0.85) }),
    category: [MathArea.PROBLEMLÖSNING],
    difficulty: Difficulty.ABSTRACTING,
    klagSupport: true,
  },
  [WidgetType.PREFIX_ELEVATOR]: { 
    title: 'Prefix-Växlaren', 
    component: PrefixConverterWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 1000, sw * 0.95), h: clamp(m ? 600 : 700, sh * 0.85) }),
    category: [MathArea.SAMBAND],
    subCategory: MathSubArea.OPERATIONS,
    difficulty: Difficulty.CONCRETIZING,
  },
  [WidgetType.POSITIONS_MACHINE]: { 
    title: 'Positions-Maskinen', 
    component: PositionsMachineWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 1000, sw * 0.95), h: clamp(m ? 700 : 650, sh * 0.85) }),
    category: [MathArea.TAL],
    subCategory: MathSubArea.POSITIONS,
    difficulty: Difficulty.CONCRETIZING,
  },
  [WidgetType.UNIT_STAIRCASE]: { 
    title: 'Enhetstrappan', 
    component: UnitStaircaseWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 1000, sw * 0.95), h: clamp(m ? 700 : 750, sh * 0.85) }),
    category: [MathArea.TAL, MathArea.GEOMETRI, MathArea.SAMBAND],
    subCategory: MathSubArea.RELATIONS,
    difficulty: Difficulty.LABORATIVE,
  },
  [WidgetType.BASIC_STATISTICIAN]: { 
    title: 'Bas-Statistikern', 
    component: BasicStatisticianWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 700, sw * 0.95), h: clamp(m ? 700 : 700, sh * 0.85) }),
    category: [MathArea.STATISTIK],
    difficulty: Difficulty.CONCRETIZING,
  },
  [WidgetType.MAGIC_SQUARE]: { 
    title: 'Magiska Kvadraten', 
    component: MagicSquareWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 450, sw * 0.95), h: clamp(m ? 650 : 700, sh * 0.85) }),
    category: [MathArea.TAL],
    subCategory: MathSubArea.PATTERNS,
    difficulty: Difficulty.CONCRETIZING,
  },
  [WidgetType.MATCHSTICK_RIDDLE]: { 
    title: 'Tändstickor', 
    component: MatchstickRiddleWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 600, sw * 0.95), h: clamp(m ? 650 : 500, sh * 0.85) }),
    category: [MathArea.ALGEBRA],
    difficulty: Difficulty.LABORATIVE,
  },
  [WidgetType.CENTIKUB_BOX]: { 
    title: 'Centikub-Lådan', 
    component: CentikubBoxWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 980, sw * 0.95), h: clamp(m ? 720 : 820, sh * 0.90) }),
    category: [MathArea.TAL, MathArea.GEOMETRI],
    subCategory: MathSubArea.PATTERNS,
    difficulty: Difficulty.LABORATIVE,
  },
  [WidgetType.SORTING_BOX]: { 
    title: 'Sorteringsboxen', 
    component: SortingBoxWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 380 : 1080, sw * 0.95), h: clamp(m ? 750 : 800, sh * 0.88) }),
    category: [MathArea.TAL, MathArea.GEOMETRI],
    difficulty: Difficulty.LABORATIVE,
  },
  [WidgetType.NOTE]: { 
    title: 'Anteckningar', 
    component: NoteWidget, 
    size: (m: boolean, sw: number, sh: number) => ({ w: clamp(m ? 360 : 460, sw * 0.95), h: clamp(m ? 460 : 500, sh * 0.85) }),
    category: [MathArea.PROBLEMLÖSNING],
    difficulty: Difficulty.CONCRETIZING,
  },
};

const EXTRA_TOOLS = [
  { type: 'DRAWING', icon: Icons.Pencil, label: 'Rita' },
  { type: 'UNDO', icon: Icons.Undo, label: 'Ångra (Ctrl+Z)' },
  { type: 'EXPORT', icon: Icons.Download, label: 'Exportera PNG' },
  { type: WidgetType.NOTE, icon: Icons.Note, label: 'Anteckning' },
  { type: WidgetType.RULER, icon: Icons.Ruler, label: 'Linjal' },
  { type: WidgetType.PROTRACTOR, icon: Icons.Rotate, label: 'Gradskiva' },
  { type: WidgetType.CALCULATOR, icon: Icons.Math, label: 'Räknare' },
  { type: WidgetType.FORMULAS, icon: Icons.Book, label: 'Formler' },
  { type: WidgetType.MATH_WORKSHOP, icon: Icons.Lightbulb, label: 'Matte-verkstad' },
];

const App: React.FC = () => {
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [groups, setGroups] = useState<WidgetGroup[]>([]);
  const [selectedWidgetIds, setSelectedWidgetIds] = useState<string[]>([]);
  const [isGroupInteracting, setIsGroupInteracting] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const [marqueeBox, setMarqueeBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingMarqueeRef = useRef(false);

  // Undo & Redo History Stack
  const [undoStack, setUndoStack] = useState<WhiteboardSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<WhiteboardSnapshot[]>([]);
  const [undoToast, setUndoToast] = useState<{ message: string; visible: boolean } | null>(null);
  const undoToastTimeoutRef = useRef<any>(null);
  const beforeInteractionSnapshotRef = useRef<WhiteboardSnapshot | null>(null);

  const [background, setBackground] = useState<BackgroundType>('GRID');
  const [topZ, setTopZ] = useState(150); 
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCoCOpen, setIsCoCOpen] = useState(false);
  
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isPiCodeOpen, setIsPiCodeOpen] = useState(false);
  const [drawColor, setDrawColor] = useState('#ef4444'); 
  const [drawWidth, setDrawWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [drawTool, setDrawTool] = useState<'PENCIL' | 'SQUARE' | 'RECTANGLE' | 'CIRCLE' | 'TRIANGLE'>('PENCIL');
  const [drawFilled, setDrawFilled] = useState(false);
  const drawingCanvasRef = useRef<DrawingCanvasHandle>(null);

  const [transparentWidgets, setTransparentWidgets] = useState<Record<string, boolean>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isArrangeGroupOpen, setIsArrangeGroupOpen] = useState(false);
  const arrangeMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(arrangeMenuRef, () => setIsArrangeGroupOpen(false), isArrangeGroupOpen);

  useEffect(() => {
    if (!isArrangeGroupOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsArrangeGroupOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isArrangeGroupOpen]);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('matteytan-theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('matteytan-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('matteytan-theme', 'light');
    }
  }, [isDarkMode]);

  // Snapshot helpers
  const captureSnapshot = useCallback((actionName?: string): WhiteboardSnapshot => {
    return {
      widgets: widgets.map(w => ({ ...w })),
      groups: groups.map(g => ({ ...g })),
      transparentWidgets: { ...transparentWidgets },
      actionName,
      timestamp: Date.now(),
    };
  }, [widgets, groups, transparentWidgets]);

  const pushSnapshotToUndo = useCallback((snapshot: WhiteboardSnapshot) => {
    setUndoStack(prev => {
      const next = [...prev, snapshot];
      if (next.length > 50) return next.slice(next.length - 50);
      return next;
    });
    setRedoStack([]);
  }, []);

  const showUndoFeedback = useCallback((message: string) => {
    if (undoToastTimeoutRef.current) clearTimeout(undoToastTimeoutRef.current);
    setUndoToast({ message, visible: true });
    undoToastTimeoutRef.current = setTimeout(() => {
      setUndoToast(null);
    }, 2200);
  }, []);

  // Undo / Redo executions
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;

    const currentSnapshot = captureSnapshot('Nuvarande');
    const prevSnapshot = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    setRedoStack(prev => [...prev, currentSnapshot]);
    setUndoStack(newUndoStack);

    setWidgets(prevSnapshot.widgets.map(w => ({ ...w })));
    setGroups(prevSnapshot.groups.map(g => ({ ...g })));
    setTransparentWidgets({ ...prevSnapshot.transparentWidgets });
    setSelectedWidgetIds([]);

    showUndoFeedback(prevSnapshot.actionName ? `Ångrade: ${prevSnapshot.actionName}` : 'Åtgärd ångrad');
  }, [undoStack, captureSnapshot, showUndoFeedback]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;

    const currentSnapshot = captureSnapshot('Nuvarande');
    const nextSnapshot = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    setUndoStack(prev => [...prev, currentSnapshot]);
    setRedoStack(newRedoStack);

    setWidgets(nextSnapshot.widgets.map(w => ({ ...w })));
    setGroups(nextSnapshot.groups.map(g => ({ ...g })));
    setTransparentWidgets({ ...nextSnapshot.transparentWidgets });
    setSelectedWidgetIds([]);

    showUndoFeedback(nextSnapshot.actionName ? `Gjorde om: ${nextSnapshot.actionName}` : 'Åtgärd återställd');
  }, [redoStack, captureSnapshot, showUndoFeedback]);

  // Group creation & disbanding
  const handleGroupSelected = useCallback(() => {
    if (selectedWidgetIds.length < 2) return;
    pushSnapshotToUndo(captureSnapshot('Gruppera widgetar'));
    const newGroupId = `group-${Date.now()}`;
    const groupNumber = groups.length + 1;
    const colorPalette = ['#4f46e5', '#059669', '#d97706', '#db2777', '#0891b2', '#7c3aed'];
    const color = colorPalette[groups.length % colorPalette.length];
    
    const newGroup: WidgetGroup = {
      id: newGroupId,
      name: `Grupp ${groupNumber}`,
      color
    };

    setGroups(prev => [...prev, newGroup]);
    setWidgets(prev => prev.map(w => selectedWidgetIds.includes(w.id) ? { ...w, groupId: newGroupId } : w));
    setSelectedWidgetIds([]);
  }, [selectedWidgetIds, groups, captureSnapshot, pushSnapshotToUndo]);

  const handleUngroup = useCallback((groupId: string) => {
    pushSnapshotToUndo(captureSnapshot('Avgruppera'));
    setWidgets(prev => prev.map(w => w.groupId === groupId ? { ...w, groupId: undefined } : w));
    setGroups(prev => prev.filter(g => g.id !== groupId));
  }, [captureSnapshot, pushSnapshotToUndo]);

  const handleUngroupSelected = useCallback(() => {
    const selectedWidgets = widgets.filter(w => selectedWidgetIds.includes(w.id));
    const targetGroupIds = Array.from(new Set(selectedWidgets.map(w => w.groupId).filter(Boolean))) as string[];
    
    if (targetGroupIds.length === 0) return;
    pushSnapshotToUndo(captureSnapshot('Avgruppera'));
    setWidgets(prev => prev.map(w => (w.groupId && targetGroupIds.includes(w.groupId)) ? { ...w, groupId: undefined } : w));
    setGroups(prev => prev.filter(g => !targetGroupIds.includes(g.id)));
  }, [widgets, selectedWidgetIds, captureSnapshot, pushSnapshotToUndo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement).isContentEditable
      );

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (isInputActive) return;
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        if (isInputActive) return;
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'e')) {
        e.preventDefault();
        setIsExportOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          handleUngroupSelected();
        } else {
          handleGroupSelected();
        }
      } else if (e.key === 'Escape') {
        setSelectedWidgetIds([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleGroupSelected, handleUngroupSelected]);

  const addWidget = useCallback((type: WidgetType) => {
    const config = WIDGET_CONFIG[type];
    pushSnapshotToUndo(captureSnapshot(`Lägg till ${config.title}`));
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    const isMobile = sw < 768;
    const size = config.size(isMobile, sw, sh);
    const id = `${type}-${Date.now()}`;
    
    if (type === WidgetType.RULER || type === WidgetType.PROTRACTOR) {
        setTransparentWidgets(prev => ({ ...prev, [id]: true }));
    }

    setTopZ(prevZ => {
        const newZ = prevZ + 1;
        setWidgets(prev => [...prev, {
            id,
            type,
            x: Math.max(10, sw / 2 - size.w / 2 + (Math.random() * 20 - 10)),
            y: Math.max(80, sh / 2 - size.h / 2 + (Math.random() * 20 - 10)),
            width: size.w,
            height: size.h,
            zIndex: newZ,
        }]);
        return newZ;
    });
    setIsToolsOpen(false);
    setIsSidebarOpen(false);
  }, [captureSnapshot, pushSnapshotToUndo]);

  const removeWidget = useCallback((id: string) => {
    const target = widgets.find(w => w.id === id);
    const title = target ? (WIDGET_CONFIG[target.type]?.title || 'Widget') : 'Widget';
    pushSnapshotToUndo(captureSnapshot(`Ta bort ${title}`));
    setWidgets(prev => {
      const toRemove = prev.find(w => w.id === id);
      const remaining = prev.filter(w => w.id !== id);
      if (toRemove?.groupId) {
        const inGroup = remaining.filter(w => w.groupId === toRemove.groupId);
        if (inGroup.length <= 1) {
          setGroups(gPrev => gPrev.filter(g => g.id !== toRemove.groupId));
          return remaining.map(w => w.groupId === toRemove.groupId ? { ...w, groupId: undefined } : w);
        }
      }
      return remaining;
    });
    setTransparentWidgets(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
    });
    setSelectedWidgetIds(prev => prev.filter(wid => wid !== id));
  }, [widgets, captureSnapshot, pushSnapshotToUndo]);

  const bringToFront = useCallback((id: string) => {
    setTopZ(prevZ => {
        const newZ = prevZ + 1;
        setWidgets(prev => {
          const target = prev.find(w => w.id === id);
          if (target?.groupId) {
            return prev.map(w => w.groupId === target.groupId ? { ...w, zIndex: newZ } : w);
          }
          return prev.map(w => w.id === id ? { ...w, zIndex: newZ } : w);
        });
        return newZ;
    });
  }, []);

  const bringGroupToFront = useCallback((groupId: string) => {
    setTopZ(prevZ => {
      const newZ = prevZ + 1;
      setWidgets(prev => prev.map(w => w.groupId === groupId ? { ...w, zIndex: newZ } : w));
      return newZ;
    });
  }, []);

  const handleWidgetDragStart = useCallback((id: string) => {
    const target = widgets.find(w => w.id === id);
    const title = target ? (WIDGET_CONFIG[target.type]?.title || 'Widget') : 'Widget';
    beforeInteractionSnapshotRef.current = captureSnapshot(`Flytta ${title}`);
  }, [widgets, captureSnapshot]);

  const updatePosition = useCallback((id: string, x: number, y: number) => {
    if (beforeInteractionSnapshotRef.current) {
      const prevW = beforeInteractionSnapshotRef.current.widgets.find(w => w.id === id);
      if (prevW && (prevW.x !== x || prevW.y !== y)) {
        pushSnapshotToUndo(beforeInteractionSnapshotRef.current);
      }
      beforeInteractionSnapshotRef.current = null;
    }
    setWidgets(prev => prev.map(w => w.id === id ? (w.isLocked ? w : { ...w, x, y }) : w));
  }, [pushSnapshotToUndo]);

  const handleWidgetResizeStart = useCallback((id: string) => {
    const target = widgets.find(w => w.id === id);
    if (target?.isLocked) return;
    const title = target ? (WIDGET_CONFIG[target.type]?.title || 'Widget') : 'Widget';
    beforeInteractionSnapshotRef.current = captureSnapshot(`Ändra storlek (${title})`);
  }, [widgets, captureSnapshot]);

  const updateSize = useCallback((id: string, width: number, height: number) => {
    if (beforeInteractionSnapshotRef.current) {
      const prevW = beforeInteractionSnapshotRef.current.widgets.find(w => w.id === id);
      if (prevW && (prevW.width !== width || prevW.height !== height)) {
        pushSnapshotToUndo(beforeInteractionSnapshotRef.current);
      }
      beforeInteractionSnapshotRef.current = null;
    }
    setWidgets(prev => prev.map(w => w.id === id ? (w.isLocked ? w : { ...w, width, height }) : w));
  }, [pushSnapshotToUndo]);
  
  const toggleTransparency = useCallback((id: string, isTrans: boolean) => {
      setTransparentWidgets(prev => ({ ...prev, [id]: isTrans }));
  }, []);

  // Lock / Unlock individual widget
  const toggleLockWidget = useCallback((id: string) => {
    setWidgets(prev => {
      const target = prev.find(w => w.id === id);
      if (!target) return prev;
      const nextLocked = !target.isLocked;
      const title = WIDGET_CONFIG[target.type]?.title || 'Widget';
      pushSnapshotToUndo(captureSnapshot(nextLocked ? `Lås ${title}` : `Lås upp ${title}`));
      showUndoFeedback(nextLocked ? `${title} är nu låst på whiteboarden` : `${title} är upplåst`);
      return prev.map(w => w.id === id ? { ...w, isLocked: nextLocked } : w);
    });
  }, [captureSnapshot, pushSnapshotToUndo, showUndoFeedback]);

  // Lock / Unlock multiple selected widgets
  const toggleLockSelectedWidgets = useCallback(() => {
    if (selectedWidgetIds.length === 0) return;
    setWidgets(prev => {
      const selected = prev.filter(w => selectedWidgetIds.includes(w.id));
      if (selected.length === 0) return prev;
      const allLocked = selected.every(w => w.isLocked);
      const nextLocked = !allLocked;
      pushSnapshotToUndo(captureSnapshot(nextLocked ? 'Lås markerade fönster' : 'Lås upp markerade fönster'));
      showUndoFeedback(nextLocked ? `${selected.length} fönster låsta på tavlan` : `${selected.length} fönster upplåsta`);
      return prev.map(w => selectedWidgetIds.includes(w.id) ? { ...w, isLocked: nextLocked } : w);
    });
  }, [selectedWidgetIds, captureSnapshot, pushSnapshotToUndo, showUndoFeedback]);

  // Multi-selection handlers
  const toggleSelectWidget = useCallback((id: string) => {
    setSelectedWidgetIds(prev => 
      prev.includes(id) ? prev.filter(wid => wid !== id) : [...prev, id]
    );
  }, []);

  const selectAllWidgets = useCallback(() => {
    setSelectedWidgetIds(widgets.map(w => w.id));
  }, [widgets]);

  const clearSelection = useCallback(() => {
    setSelectedWidgetIds([]);
  }, []);

  // Group movement: moving group via frame or moving member widget
  const handleMoveGroupStart = useCallback((groupId: string) => {
    const grp = groups.find(g => g.id === groupId);
    beforeInteractionSnapshotRef.current = captureSnapshot(`Flytta ${grp?.name || 'grupp'}`);
  }, [groups, captureSnapshot]);

  const handleMoveGroup = useCallback((groupId: string, deltaX: number, deltaY: number, finished: boolean) => {
    if (finished) {
      setIsGroupInteracting(false);
      if (beforeInteractionSnapshotRef.current) {
        const moved = widgets.some(w => {
          if (w.groupId !== groupId || w.isLocked) return false;
          const orig = beforeInteractionSnapshotRef.current?.widgets.find(ow => ow.id === w.id);
          return orig && (orig.x !== w.x || orig.y !== w.y);
        });
        if (moved) {
          pushSnapshotToUndo(beforeInteractionSnapshotRef.current);
        }
        beforeInteractionSnapshotRef.current = null;
      }
      return;
    }
    setIsGroupInteracting(true);
    setWidgets(prev => prev.map(w => w.groupId === groupId && !w.isLocked ? { ...w, x: w.x + deltaX, y: w.y + deltaY } : w));
  }, [widgets, pushSnapshotToUndo]);

  const handleWidgetDragDelta = useCallback((id: string, deltaX: number, deltaY: number, finished: boolean) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget || !widget.groupId || widget.isLocked) {
      if (finished) setIsGroupInteracting(false);
      return;
    }
    if (finished) {
      setIsGroupInteracting(false);
      return;
    }
    setIsGroupInteracting(true);
    setWidgets(prev => prev.map(w => {
      if (w.groupId === widget.groupId && w.id !== id && !w.isLocked) {
        return { ...w, x: w.x + deltaX, y: w.y + deltaY };
      }
      return w;
    }));
  }, [widgets]);

  // Group scaling
  const handleScaleGroupStart = useCallback((groupId: string) => {
    const grp = groups.find(g => g.id === groupId);
    beforeInteractionSnapshotRef.current = captureSnapshot(`Skala ${grp?.name || 'grupp'}`);
  }, [groups, captureSnapshot]);

  const handleScaleGroup = useCallback((
    groupId: string,
    scaleX: number,
    scaleY: number,
    finished: boolean,
    origin: { minX: number; minY: number },
    snapshots: { id: string; x: number; y: number; width: number; height: number }[]
  ) => {
    if (finished) {
      setIsGroupInteracting(false);
      if (beforeInteractionSnapshotRef.current) {
        pushSnapshotToUndo(beforeInteractionSnapshotRef.current);
        beforeInteractionSnapshotRef.current = null;
      }
      return;
    }
    setIsGroupInteracting(true);
    setWidgets(prev => prev.map(w => {
      if (w.isLocked) return w;
      const snap = snapshots.find(s => s.id === w.id);
      if (!snap) return w;
      const newX = origin.minX + (snap.x - origin.minX) * scaleX;
      const newY = origin.minY + (snap.y - origin.minY) * scaleY;
      const newW = Math.max(220, snap.width * scaleX);
      const newH = Math.max(160, snap.height * scaleY);
      return {
        ...w,
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH)
      };
    }));
  }, [pushSnapshotToUndo]);

  const handleQuickScale = useCallback((groupId: string, factor: number) => {
    pushSnapshotToUndo(captureSnapshot(factor > 1 ? 'Förstora grupp' : 'Förminska grupp'));
    setWidgets(prev => {
      const groupWidgets = prev.filter(w => w.groupId === groupId && !w.isLocked);
      if (groupWidgets.length === 0) return prev;
      const minX = Math.min(...groupWidgets.map(w => w.x));
      const minY = Math.min(...groupWidgets.map(w => w.y));
      return prev.map(w => {
        if (w.groupId !== groupId || w.isLocked) return w;
        const newX = minX + (w.x - minX) * factor;
        const newY = minY + (w.y - minY) * factor;
        const newW = Math.max(220, (w.width || 400) * factor);
        const newH = Math.max(160, (w.height || 300) * factor);
        return {
          ...w,
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH)
        };
      });
    });
  }, [captureSnapshot, pushSnapshotToUndo]);

  // Canvas marquee selection handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (isToolsOpen) setIsToolsOpen(false);
    if (isDrawingMode) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('textarea') || target.closest('.widget-shadow')) {
      return;
    }
    marqueeStartRef.current = { x: e.clientX, y: e.clientY };
    isDraggingMarqueeRef.current = false;
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!marqueeStartRef.current || isDrawingMode) return;
    const startX = marqueeStartRef.current.x;
    const startY = marqueeStartRef.current.y;
    const currentX = e.clientX;
    const currentY = e.clientY;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    if (width > 6 || height > 6) {
      isDraggingMarqueeRef.current = true;
      setMarqueeBox({ left, top, width, height });

      const hits = widgets.filter(w => {
        const wWidth = w.width || 400;
        const wHeight = w.height || 300;
        return !(
          w.x > left + width ||
          w.x + wWidth < left ||
          w.y > top + height ||
          w.y + wHeight < top
        );
      }).map(w => w.id);

      setSelectedWidgetIds(prev => e.shiftKey ? Array.from(new Set([...prev, ...hits])) : hits);
    }
  };

  const handleCanvasMouseUp = () => {
    if (marqueeStartRef.current && !isDraggingMarqueeRef.current) {
      setSelectedWidgetIds([]);
    }
    marqueeStartRef.current = null;
    isDraggingMarqueeRef.current = false;
    setMarqueeBox(null);
  };

  const arrangeWidgets = useCallback(() => {
    if (widgets.length === 0) return;
    pushSnapshotToUndo(captureSnapshot('Ordna fönster'));
    setWidgets(prevWidgets => {
        if (prevWidgets.length === 0) return prevWidgets;
        const unlockedWidgets = prevWidgets.filter(w => !w.isLocked);
        if (unlockedWidgets.length === 0) return prevWidgets;

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

        const n = unlockedWidgets.length;
        if (n === 1) { cols = 1; rows = 1; }
        else if (n === 2) { cols = 2; rows = 1; }
        else if (n <= 4) { cols = 2; rows = 2; }
        else if (n <= 6) { cols = 3; rows = 2; }
        else if (n <= 9) { cols = 3; rows = 3; }
        else { cols = 4; rows = Math.ceil(n / 4); }

        const cellW = (availableW - (cols - 1) * gap) / cols;
        const cellH = (availableH - (rows - 1) * gap) / rows;

        let unlockedIndex = 0;
        return prevWidgets.map((w) => {
            if (w.isLocked) return w;
            const index = unlockedIndex++;
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
    });
  }, [widgets.length, captureSnapshot, pushSnapshotToUndo]);

  const getBackgroundClass = useCallback(() => {
    switch (background) {
      case 'GRID': return 'bg-paper bg-grid-pattern';
      case 'DOTS': return 'bg-paper bg-dot-pattern';
      case 'BLACK': return 'bg-slate-900';
      default: return 'bg-white';
    }
  }, [background]);

  const handleToolClick = useCallback((tool: any) => {
    if (tool.type === 'DRAWING') {
      setIsDrawingMode(prev => !prev);
      setIsToolsOpen(false);
    } else if (tool.type === 'EXPORT') {
      setIsExportOpen(true);
      setIsToolsOpen(false);
    } else if (tool.type === 'UNDO') {
      handleUndo();
      setIsToolsOpen(false);
    } else {
      addWidget(tool.type as WidgetType);
    }
  }, [addWidget, handleUndo]);

  const handleGroupAction = useCallback(() => {
    if (selectedWidgetIds.length >= 2) {
      handleGroupSelected();
    } else if (selectedWidgetIds.length > 0) {
      clearSelection();
    } else {
      selectAllWidgets();
    }
  }, [selectedWidgetIds.length, handleGroupSelected, clearSelection, selectAllWidgets]);

  const clearDrawings = useCallback(() => {
    drawingCanvasRef.current?.clear();
  }, []);


  return (
    <div 
      ref={whiteboardRef}
      className={`w-full h-full relative overflow-hidden transition-colors duration-500 ${getBackgroundClass()}`}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
    >
      
      <div className="export-ignore" data-export-ignore="true">
        <Sidebar 
          isOpen={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          onAddWidget={addWidget} 
          widgetMetadata={WIDGET_CONFIG} 
          onPiClick={() => setIsPiCodeOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
          onOpenSearch={() => setIsSearchOpen(true)}
          isToolsOpen={isToolsOpen}
          onToggleTools={() => setIsToolsOpen(prev => !prev)}
          onCloseTools={() => setIsToolsOpen(false)}
          onToolClick={handleToolClick}
          extraTools={EXTRA_TOOLS}
          backgrounds={BACKGROUNDS}
          currentBackground={background}
          onSetBackground={setBackground}
        />
      </div>

      {/* Top Controls Bar - Ordna/Gruppera, Ångra, Exportera & Ljust/Mörkt (endast ikoner med hover-text) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[2000] flex items-center gap-2 export-ignore" data-export-ignore="true">
         {/* Ordna & Gruppera */}
         <div className="relative group" ref={arrangeMenuRef}>
           <button 
              onClick={() => setIsArrangeGroupOpen(prev => !prev)}
              className={`relative p-2.5 sm:p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-full shadow-lg border transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 ${
                isArrangeGroupOpen 
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/30' 
                  : selectedWidgetIds.length > 0
                    ? 'border-indigo-400/80 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-500 dark:hover:text-indigo-400'
              }`}
              title="Ordna och gruppera"
              aria-label="Ordna och gruppera"
           >
              <Icons.Grid size={18} className={isArrangeGroupOpen || selectedWidgetIds.length > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'} />
              {selectedWidgetIds.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center shadow-xs">
                  {selectedWidgetIds.length}
                </span>
              )}
           </button>
           
           {!isArrangeGroupOpen && (
             <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-2.5 py-0.5 rounded-md bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-lg whitespace-nowrap z-50">
               Ordna och gruppera
             </div>
           )}

           {/* Dropdown Meny */}
           {isArrangeGroupOpen && (
             <div className="absolute right-0 sm:right-auto sm:left-0 top-14 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-[2200] flex flex-col gap-3">
               <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-2">
                   <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                     <Icons.Grid size={14} />
                   </div>
                   <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">Ordna & Gruppera</span>
                 </div>
                 <button 
                   onClick={() => setIsArrangeGroupOpen(false)}
                   className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                   title="Stäng"
                 >
                   <Icons.X size={14} />
                 </button>
               </div>

               {/* 1. Ordna fönster i rutnät */}
               <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                 <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1">
                     <Icons.Grid size={12} className="text-amber-500" /> Ordna fönster
                   </span>
                   <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                     {widgets.length} {widgets.length === 1 ? 'öppet' : 'öppna'}
                   </span>
                 </div>
                 <button
                   onClick={() => {
                     arrangeWidgets();
                     setIsArrangeGroupOpen(false);
                   }}
                   disabled={widgets.length === 0}
                   className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs cursor-pointer active:scale-95"
                   title="Ordna alla öppna fönster i ett jämnt rutnät på tavlan"
                 >
                   <Icons.Grid size={14} />
                   <span>Ordna i rutnät</span>
                 </button>
               </div>

               {/* 2. Gruppering */}
               <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                 <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-1">
                     <Icons.Group size={12} className="text-indigo-500" /> Gruppering
                   </span>
                   <span className={`text-[10px] font-bold ${selectedWidgetIds.length > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                     {selectedWidgetIds.length} markerade
                   </span>
                 </div>
                 <button
                   onClick={() => {
                     handleGroupSelected();
                     setIsArrangeGroupOpen(false);
                   }}
                   disabled={selectedWidgetIds.length < 2}
                   className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs cursor-pointer active:scale-95"
                   title={selectedWidgetIds.length < 2 ? 'Markera minst 2 fönster för att gruppera' : `Gruppera ${selectedWidgetIds.length} markerade fönster`}
                 >
                   <Icons.Link size={14} />
                   <span>Gruppera {selectedWidgetIds.length >= 2 ? `(${selectedWidgetIds.length})` : ''}</span>
                 </button>

                 {widgets.some(w => selectedWidgetIds.includes(w.id) && !!w.groupId) && (
                   <button
                     onClick={() => {
                       handleUngroupSelected();
                       setIsArrangeGroupOpen(false);
                     }}
                     className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs border border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer active:scale-95"
                     title="Lös upp markerad grupp"
                   >
                     <Icons.Unlink size={13} />
                     <span>Lös upp grupp</span>
                   </button>
                 )}

                 <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                   <button
                     onClick={selectAllWidgets}
                     disabled={widgets.length === 0 || selectedWidgetIds.length === widgets.length}
                     className="flex-1 py-1 text-[10px] font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 disabled:opacity-30 disabled:pointer-events-none transition-colors text-center cursor-pointer"
                   >
                     Markera alla
                   </button>
                   {selectedWidgetIds.length > 0 && (
                     <button
                       onClick={clearSelection}
                       className="flex-1 py-1 text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors text-center cursor-pointer"
                     >
                       Avmarkera
                     </button>
                   )}
                 </div>
               </div>
             </div>
           )}
         </div>

         {/* Ångra */}
         <div className="relative group">
           <button 
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-2.5 sm:p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-500 dark:hover:text-blue-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              title="Ångra"
              aria-label="Ångra"
           >
              <Icons.Undo size={18} className="text-slate-600 dark:text-slate-300 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
           </button>
           <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-2.5 py-0.5 rounded-md bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-lg whitespace-nowrap z-50">
             Ångra
           </div>
         </div>

         {/* Gör om (Redo) - visas om det finns åtgärder att återställa */}
         {redoStack.length > 0 && (
           <div className="relative group">
             <button 
                onClick={handleRedo}
                className="p-2.5 sm:p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-500 dark:hover:text-blue-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                title="Gör om"
                aria-label="Gör om"
             >
                <Icons.Redo size={18} className="text-slate-600 dark:text-slate-300 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
             </button>
             <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-2.5 py-0.5 rounded-md bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-lg whitespace-nowrap z-50">
               Gör om
             </div>
           </div>
         )}

         {/* Exportera */}
         <div className="relative group">
           <button 
              onClick={() => setIsExportOpen(true)}
              className="p-2.5 sm:p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-500 dark:hover:text-emerald-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              title="Exportera"
              aria-label="Exportera"
           >
              <Icons.Download size={18} className="text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />
           </button>
           <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-2.5 py-0.5 rounded-md bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-lg whitespace-nowrap z-50">
             Exportera
           </div>
         </div>

         {/* Ljust/mörkt */}
         <div className="relative group">
           <button 
              onClick={() => setIsDarkMode(prev => !prev)}
              className="p-2.5 sm:p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              title="Ljust/mörkt"
              aria-label="Ljust/mörkt"
           >
              {isDarkMode ? <Icons.Sun size={18} className="text-amber-400" /> : <Icons.Moon size={18} className="text-slate-600 dark:text-slate-300" />}
           </button>
           <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-2.5 py-0.5 rounded-md bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-lg whitespace-nowrap z-50">
             Ljust/mörkt
           </div>
         </div>
      </div>

      <DrawingCanvas 
        ref={drawingCanvasRef}
        isDrawingMode={isDrawingMode}
        color={drawColor}
        lineWidth={drawWidth}
        isEraser={isEraser}
        zIndex={10}
        drawTool={drawTool}
        drawFilled={drawFilled}
      />

      {/* Marquee Drag Selection Box */}
      {marqueeBox && (
        <div
          className="fixed border-2 border-dashed border-blue-500 bg-blue-500/10 rounded-xl pointer-events-none z-[1900] transition-none"
          style={{
            left: marqueeBox.left,
            top: marqueeBox.top,
            width: marqueeBox.width,
            height: marqueeBox.height,
          }}
        />
      )}

      {/* Undo Toast Notification */}
      {undoToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[3100] flex items-center gap-2 px-4 py-2 bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 rounded-full shadow-2xl backdrop-blur-md text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none export-ignore">
          <Icons.Undo size={15} className="text-blue-400 dark:text-blue-600" />
          <span>{undoToast.message}</span>
        </div>
      )}

      {/* Widget Group Frames */}
      <AnimatePresence>
        {groups.map(group => {
          const groupWidgets = widgets.filter(w => w.groupId === group.id);
          if (groupWidgets.length === 0) return null;
          return (
            <WidgetGroupFrame
              key={group.id}
              group={group}
              widgets={groupWidgets}
              onUngroup={handleUngroup}
              onMoveGroupStart={handleMoveGroupStart}
              onMoveGroup={handleMoveGroup}
              onScaleGroupStart={handleScaleGroupStart}
              onScaleGroup={handleScaleGroup}
              onQuickScale={handleQuickScale}
              onFocusGroup={bringGroupToFront}
              isDarkMode={isDarkMode}
            />
          );
        })}
      </AnimatePresence>

      <AnimatePresence>
        {widgets.map(widget => {
          const config = WIDGET_CONFIG[widget.type];
          const widgetGroup = widget.groupId ? groups.find(g => g.id === widget.groupId) : undefined;
          const isSelected = selectedWidgetIds.includes(widget.id);

          return (
            <WidgetWrapper
              key={widget.id}
              id={widget.id}
              title={config.title}
              initialX={widget.x}
              initialY={widget.y}
              initialWidth={widget.width}
              initialHeight={widget.height}
              zIndex={widget.zIndex}
              transparent={transparentWidgets[widget.id]}
              klagSupport={config.klagSupport}
              isSelected={isSelected}
              isLocked={widget.isLocked}
              groupId={widget.groupId}
              groupName={widgetGroup?.name}
              groupColor={widgetGroup?.color}
              isGroupInteracting={isGroupInteracting}
              onToggleLock={toggleLockWidget}
              onClose={removeWidget}
              onFocus={bringToFront}
              onDragStart={handleWidgetDragStart}
              onMove={updatePosition}
              onDragDelta={handleWidgetDragDelta}
              onResizeStart={handleWidgetResizeStart}
              onResize={updateSize}
              onToggleSelect={toggleSelectWidget}
            >
              <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
                <config.component 
                  id={widget.id}
                  isTransparent={transparentWidgets[widget.id] || false}
                  setTransparent={(v: boolean) => toggleTransparency(widget.id, v)}
                />
              </Suspense>
            </WidgetWrapper>
          );
        })}
      </AnimatePresence>

      {/* Selection Floating Action Bar */}
      <SelectionToolbar
        selectedCount={selectedWidgetIds.length}
        totalWidgets={widgets.length}
        hasGroupedSelected={widgets.some(w => selectedWidgetIds.includes(w.id) && !!w.groupId)}
        allSelectedLocked={selectedWidgetIds.length > 0 && selectedWidgetIds.every(id => widgets.find(w => w.id === id)?.isLocked)}
        onGroup={handleGroupSelected}
        onUngroupSelected={handleUngroupSelected}
        onToggleLockSelected={toggleLockSelectedWidgets}
        onSelectAll={selectAllWidgets}
        onClearSelection={clearSelection}
        isDarkMode={isDarkMode}
      />

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onAddWidget={addWidget} 
      />

      {/* About Modal */}
      <Suspense fallback={null}>
        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </Suspense>
      
      {/* Code of Conduct Modal */}
      <Suspense fallback={null}>
        <CodeOfConductModal isOpen={isCoCOpen} onClose={() => setIsCoCOpen(false)} />
      </Suspense>

      {/* Pi Code Widget (Hidden) */}
      <AnimatePresence>
        {isPiCodeOpen && (
          <Suspense fallback={null}>
            <PiCodeWidget onClose={() => setIsPiCodeOpen(false)} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* GLOBAL FOOTER ELEMENTS */}
      
      {/* Bottom Left: Creative Commons */}
      <div className="absolute bottom-4 left-6 z-[2000] pointer-events-auto flex items-center gap-2 transition-opacity duration-300 text-shadow-sm export-ignore" data-export-ignore="true">
          <svg className="w-4 h-4 text-slate-400 opacity-80" viewBox="0 0 496 512" fill="currentColor">
            <path d="M245.83 214.87l-33.22 17.28c-9.43-19.58-25.24-19.93-27.46-19.93-22.13 0-33.22 14.61-33.22 43.89 0 23.57 9.21 43.89 33.22 43.89 20 0 33.22-14.61 33.22-43.89h33.22c0 46.14-31.09 77.12-66.44 77.12-46.92 0-66.44-32.63-66.44-77.12 0-43.55 17.28-77.12 66.44-77.12 26.74 0 53.21 10.82 66.44 35.88zm143.84 0l-33.22 17.28c-9.43-19.58-25.24-19.93-27.46-19.93-22.13 0-33.22 14.61-33.22 43.89 0 23.57 9.21 43.89 33.22 43.89 20 0 33.22-14.61 33.22-43.89h33.22c0 46.14-31.09 77.12-66.44 77.12-46.92 0-66.44-32.63-66.44-77.12 0-43.55 17.28-77.12 66.44-77.12 26.74 0 53.21 10.82 66.44 35.88zM247.7 8C104.74 8 8 123.04 8 256c0 132.96 96.74 248 239.7 248 142.96 0 248.3-115.04 248.3-248C496 123.04 390.66 8 247.7 8zm.3 450.7c-112.03 0-203-90.97-203-203s90.97-203 203-203 203 90.97 203 203-90.97 203-203 203z"/>
          </svg>
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400">
              LICENS: CC0 1.0 UNIVERSAL
          </div>
      </div>

      {/* Bottom Center: Main Links */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[2000] flex flex-wrap justify-center items-center gap-4 sm:gap-8 pointer-events-auto transition-opacity duration-300 export-ignore" data-export-ignore="true">
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
      <div className="absolute bottom-4 right-6 z-[2000] pointer-events-auto transition-opacity duration-300 export-ignore" data-export-ignore="true">
          <a 
            href="https://www.netlify.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5"
          >
            This site is powered by Netlify
          </a>
      </div>

      <div className="export-ignore" data-export-ignore="true">
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
          drawTool={drawTool}
          setDrawTool={setDrawTool}
          drawFilled={drawFilled}
          setDrawFilled={setDrawFilled}
        />
      </div>

      {/* Export Whiteboard Modal */}
      <ExportModal 
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        whiteboardElement={whiteboardRef.current}
        widgets={widgets}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default App;
