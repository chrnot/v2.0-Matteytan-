
import React, { useState, useEffect, useRef, Suspense, lazy, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toolbar } from './components/Toolbar';
import { WidgetWrapper } from './components/WidgetWrapper';
import { Logo } from './components/Logo';
import { WidgetType, WidgetInstance, WidgetGroup, BackgroundType, BackgroundConfig, LessonSnapshot, SavedLesson } from './types';
import { Icons } from './components/icons';
import { DrawingCanvas, DrawingCanvasHandle } from './components/DrawingCanvas';
import { WidgetGroupFrame } from './components/WidgetGroupFrame';
import { SelectionToolbar } from './components/SelectionToolbar';
import { ExportModal } from './components/ExportModal';
import { LessonsModal } from './components/LessonsModal';
import { saveAutosave, loadAutosave, listLessons, saveLesson, deleteLesson, renameLesson } from './utils/persistence';

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
    category: [],
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
  { type: 'EXPORT', icon: Icons.Download, label: 'Exportera PNG' },
  { type: 'LESSONS', icon: Icons.FolderOpen, label: 'Lektioner' },
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
  const [isLessonsModalOpen, setIsLessonsModalOpen] = useState(false);
  const [lessons, setLessons] = useState<SavedLesson[]>(() => listLessons());
  const hasHydratedRef = useRef(false);
  const autosaveTimerRef = useRef<number | null>(null);
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const [marqueeBox, setMarqueeBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingMarqueeRef = useRef(false);

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

  // --- Autosave & Save/Load Lesson ---

  const buildSnapshot = useCallback((): LessonSnapshot => ({
    widgets,
    groups,
    background,
    transparentWidgets,
    topZ,
    drawingImage: drawingCanvasRef.current?.exportImage() ?? null,
  }), [widgets, groups, background, transparentWidgets, topZ]);

  const applySnapshot = useCallback((snapshot: LessonSnapshot) => {
    setWidgets(snapshot.widgets || []);
    setGroups(snapshot.groups || []);
    setBackground(snapshot.background || 'GRID');
    setTransparentWidgets(snapshot.transparentWidgets || {});
    setTopZ(snapshot.topZ || 150);
    setSelectedWidgetIds([]);
    drawingCanvasRef.current?.loadImage(snapshot.drawingImage ?? null);
  }, []);

  // Restore the last autosaved whiteboard once, on first mount.
  useEffect(() => {
    const snapshot = loadAutosave();
    if (snapshot) applySnapshot(snapshot);
    hasHydratedRef.current = true;
  }, [applySnapshot]);

  // Debounced autosave: mirrors the whiteboard into localStorage after every change.
  const scheduleAutosave = useCallback(() => {
    if (!hasHydratedRef.current) return;
    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = window.setTimeout(() => {
      saveAutosave(buildSnapshot());
    }, 800);
  }, [buildSnapshot]);

  useEffect(() => {
    scheduleAutosave();
    return () => {
      if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    };
  }, [widgets, groups, background, transparentWidgets, topZ, scheduleAutosave]);

  // Flush a final autosave if the tab is closed before the debounce fires.
  useEffect(() => {
    const handleBeforeUnload = () => saveAutosave(buildSnapshot());
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [buildSnapshot]);

  const handleSaveLesson = useCallback((name: string, existingId?: string) => {
    const updated = saveLesson(name, buildSnapshot(), existingId);
    setLessons(updated);
  }, [buildSnapshot]);

  const handleLoadLesson = useCallback((lesson: SavedLesson) => {
    applySnapshot(lesson.snapshot);
    setIsLessonsModalOpen(false);
  }, [applySnapshot]);

  const handleDeleteLesson = useCallback((id: string) => {
    setLessons(deleteLesson(id));
  }, []);

  const handleRenameLesson = useCallback((id: string, name: string) => {
    setLessons(renameLesson(id, name));
  }, []);

  // Group creation & disbanding
  const handleGroupSelected = useCallback(() => {
    if (selectedWidgetIds.length < 2) return;
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
  }, [selectedWidgetIds, groups]);

  const handleUngroup = useCallback((groupId: string) => {
    setWidgets(prev => prev.map(w => w.groupId === groupId ? { ...w, groupId: undefined } : w));
    setGroups(prev => prev.filter(g => g.id !== groupId));
  }, []);

  const handleUngroupSelected = useCallback(() => {
    const selectedWidgets = widgets.filter(w => selectedWidgetIds.includes(w.id));
    const targetGroupIds = Array.from(new Set(selectedWidgets.map(w => w.groupId).filter(Boolean))) as string[];
    
    if (targetGroupIds.length === 0) return;

    setWidgets(prev => prev.map(w => (w.groupId && targetGroupIds.includes(w.groupId)) ? { ...w, groupId: undefined } : w));
    setGroups(prev => prev.filter(g => !targetGroupIds.includes(g.id)));
  }, [widgets, selectedWidgetIds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
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
  }, [handleGroupSelected, handleUngroupSelected]);

  const addWidget = useCallback((type: WidgetType) => {
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    const isMobile = sw < 768;
    const config = WIDGET_CONFIG[type];
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
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => {
      const target = prev.find(w => w.id === id);
      const remaining = prev.filter(w => w.id !== id);
      if (target?.groupId) {
        const inGroup = remaining.filter(w => w.groupId === target.groupId);
        if (inGroup.length <= 1) {
          setGroups(gPrev => gPrev.filter(g => g.id !== target.groupId));
          return remaining.map(w => w.groupId === target.groupId ? { ...w, groupId: undefined } : w);
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
  }, []);

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

  const updatePosition = useCallback((id: string, x: number, y: number) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  }, []);

  const updateSize = useCallback((id: string, width: number, height: number) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, width, height } : w));
  }, []);
  
  const toggleTransparency = useCallback((id: string, isTrans: boolean) => {
      setTransparentWidgets(prev => ({ ...prev, [id]: isTrans }));
  }, []);

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
  const handleMoveGroup = useCallback((groupId: string, deltaX: number, deltaY: number, finished: boolean) => {
    if (finished) {
      setIsGroupInteracting(false);
      return;
    }
    setIsGroupInteracting(true);
    setWidgets(prev => prev.map(w => w.groupId === groupId ? { ...w, x: w.x + deltaX, y: w.y + deltaY } : w));
  }, []);

  const handleWidgetDragDelta = useCallback((id: string, deltaX: number, deltaY: number, finished: boolean) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget || !widget.groupId) {
      if (finished) setIsGroupInteracting(false);
      return;
    }
    if (finished) {
      setIsGroupInteracting(false);
      return;
    }
    setIsGroupInteracting(true);
    setWidgets(prev => prev.map(w => {
      if (w.groupId === widget.groupId && w.id !== id) {
        return { ...w, x: w.x + deltaX, y: w.y + deltaY };
      }
      return w;
    }));
  }, [widgets]);

  // Group scaling
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
      return;
    }
    setIsGroupInteracting(true);
    setWidgets(prev => prev.map(w => {
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
  }, []);

  const handleQuickScale = useCallback((groupId: string, factor: number) => {
    setWidgets(prev => {
      const groupWidgets = prev.filter(w => w.groupId === groupId);
      if (groupWidgets.length === 0) return prev;
      const minX = Math.min(...groupWidgets.map(w => w.x));
      const minY = Math.min(...groupWidgets.map(w => w.y));
      return prev.map(w => {
        if (w.groupId !== groupId) return w;
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
  }, []);

  // Canvas marquee selection handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
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
    setWidgets(prevWidgets => {
        if (prevWidgets.length === 0) return prevWidgets;

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

        const n = prevWidgets.length;
        if (n === 1) { cols = 1; rows = 1; }
        else if (n === 2) { cols = 2; rows = 1; }
        else if (n <= 4) { cols = 2; rows = 2; }
        else if (n <= 6) { cols = 3; rows = 2; }
        else if (n <= 9) { cols = 3; rows = 3; }
        else { cols = 4; rows = Math.ceil(n / 4); }

        const cellW = (availableW - (cols - 1) * gap) / cols;
        const cellH = (availableH - (rows - 1) * gap) / rows;

        return prevWidgets.map((w, index) => {
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
  }, []);

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
    } else if (tool.type === 'LESSONS') {
      setIsLessonsModalOpen(true);
      setIsToolsOpen(false);
    } else {
      addWidget(tool.type as WidgetType);
    }
  }, [addWidget]);

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
        />
      </div>

      {/* Top Controls Bar */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[2000] flex items-start gap-2 export-ignore" data-export-ignore="true">
         
         {/* Grouping / Selection Button */}
         <button 
            onClick={selectedWidgetIds.length >= 2 ? handleGroupSelected : () => {
              if (selectedWidgetIds.length > 0) {
                clearSelection();
              } else {
                selectAllWidgets();
              }
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full shadow-lg font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 ${
              selectedWidgetIds.length >= 2
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-2 ring-blue-300'
                : selectedWidgetIds.length > 0
                  ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-300'
                  : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:text-blue-600'
            }`}
            title={
              selectedWidgetIds.length >= 2
                ? `Gruppera ${selectedWidgetIds.length} markerade widgetar`
                : selectedWidgetIds.length > 0
                  ? 'Avmarkera alla'
                  : 'Markera alla widgetar'
            }
         >
             <Icons.Group size={16} />
             <span className="hidden md:inline">
               {selectedWidgetIds.length >= 2 
                 ? `Gruppera (${selectedWidgetIds.length})` 
                 : selectedWidgetIds.length > 0 
                   ? `Markerade (${selectedWidgetIds.length})` 
                   : 'Gruppera'}
             </span>
         </button>

         <button 
            onClick={arrangeWidgets}
            disabled={widgets.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all font-bold text-xs sm:text-sm disabled:opacity-30 disabled:hover:scale-100"
            title="Ordna fönster i rutnät"
         >
             <span className="text-lg leading-none">🧩</span> <span className="hidden md:inline uppercase tracking-widest">Ordna</span>
         </button>

         {/* Export Whiteboard Button */}
         <button 
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all font-bold text-xs sm:text-sm"
            title="Exportera whiteboard som PNG-bild (Ctrl+S / Cmd+S)"
         >
             <Icons.Download size={16} /> <span className="hidden md:inline uppercase tracking-widest">Exportera</span>
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
        drawTool={drawTool}
        drawFilled={drawFilled}
        onChange={scheduleAutosave}
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

      {/* Widget Group Frames */}
      {groups.map(group => {
        const groupWidgets = widgets.filter(w => w.groupId === group.id);
        if (groupWidgets.length === 0) return null;
        return (
          <WidgetGroupFrame
            key={group.id}
            group={group}
            widgets={groupWidgets}
            onUngroup={handleUngroup}
            onMoveGroup={handleMoveGroup}
            onScaleGroup={handleScaleGroup}
            onQuickScale={handleQuickScale}
            onFocusGroup={bringGroupToFront}
            isDarkMode={isDarkMode}
          />
        );
      })}

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
            groupId={widget.groupId}
            groupName={widgetGroup?.name}
            groupColor={widgetGroup?.color}
            isGroupInteracting={isGroupInteracting}
            onClose={removeWidget}
            onFocus={bringToFront}
            onMove={updatePosition}
            onDragDelta={handleWidgetDragDelta}
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

      {/* Selection Floating Action Bar */}
      <SelectionToolbar
        selectedCount={selectedWidgetIds.length}
        totalWidgets={widgets.length}
        hasGroupedSelected={widgets.some(w => selectedWidgetIds.includes(w.id) && !!w.groupId)}
        onGroup={handleGroupSelected}
        onUngroupSelected={handleUngroupSelected}
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

      {/* Lessons: save / load whiteboard */}
      <LessonsModal
        isOpen={isLessonsModalOpen}
        onClose={() => setIsLessonsModalOpen(false)}
        lessons={lessons}
        onSave={handleSaveLesson}
        onLoad={handleLoadLesson}
        onDelete={handleDeleteLesson}
        onRename={handleRenameLesson}
      />
    </div>
  );
};

export default App;
