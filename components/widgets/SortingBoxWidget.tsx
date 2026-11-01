import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../icons';
import { playSoundEffect } from '../../src/utils/audio';
import { useClickOutside } from '../../src/utils/useClickOutside';

// Types and models
export interface SortableObject {
  id: string;
  type: 'circle' | 'square' | 'triangle' | 'sphere' | 'cube' | 'pyramid' | 'dots-card';
  color: 'red' | 'blue' | 'green' | 'yellow';
  shape: 'circle' | 'square' | 'triangle';
  size: 'small' | 'medium' | 'large';
  value: number; // For card dots
  isCard: boolean;
  zoneId: string | null;
}

export type VisualLayoutType = 'BOXES' | 'RINGS' | 'SHELVES';

interface ColorConfig {
  name: string;
  hex: string;
  darkHex: string;
  leftHex: string;
  rightHex: string;
  topHex: string;
  borderHex: string;
  glowClass: string;
}

const COLORS: Record<'red' | 'blue' | 'green' | 'yellow', ColorConfig> = {
  red: {
    name: 'Röd',
    hex: '#ef4444',
    darkHex: '#991b1b',
    leftHex: '#dc2626',
    rightHex: '#b91c1c',
    topHex: '#f87171',
    borderHex: '#ef4444',
    glowClass: 'shadow-red-500/20 text-red-750 dark:text-red-400',
  },
  blue: {
    name: 'Blå',
    hex: '#3b82f6',
    darkHex: '#1e3a8a',
    leftHex: '#2563eb',
    rightHex: '#1d4ed8',
    topHex: '#60a5fa',
    borderHex: '#3b82f6',
    glowClass: 'shadow-blue-500/20 text-blue-750 dark:text-blue-400',
  },
  green: {
    name: 'Grön',
    hex: '#10b981',
    darkHex: '#064e3b',
    leftHex: '#059669',
    rightHex: '#047857',
    topHex: '#34d399',
    borderHex: '#10b981',
    glowClass: 'shadow-green-500/20 text-green-750 dark:text-green-400',
  },
  yellow: {
    name: 'Gul',
    hex: '#f59e0b',
    darkHex: '#78350f',
    leftHex: '#d97706',
    rightHex: '#b45309',
    topHex: '#fbbf24',
    borderHex: '#f59e0b',
    glowClass: 'shadow-amber-500/20 text-amber-750 dark:text-amber-400',
  }
};

interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
}

export interface ZoneConfig {
  id: string;
  label: string;
  subLabel?: string;
  colorClass: string;
  hoverClass: string;
  activeBorderClass: string;
  accentColor: string;
}

export interface Mission {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  level: 'Nivå 1' | 'Nivå 2' | 'Nivå 3' | 'Fritt';
  levelColor: string;
  icon: string;
  description: string;
  learningGoal: string;
  pedagogicalHint: string;
  zones: ZoneConfig[];
  generateItems: () => SortableObject[];
  validateItem: (item: SortableObject, zoneId: string) => boolean;
  guidedOnly?: boolean;
}

// Tooltip component for displaying pedagogical learning objective on hover
export const LearningGoalTooltip: React.FC<{ mission: Mission; align?: 'left' | 'right' }> = memo(({ mission, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  useClickOutside(tooltipRef, () => setIsOpen(false), isOpen);

  return (
    <div 
      ref={tooltipRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-help shrink-0 shadow-2xs"
        title={`Lärandemål: ${mission.learningGoal}`}
        aria-label="Lärandemål för uppdraget"
      >
        <Icons.Info size={12} className="shrink-0" />
      </button>

      {/* Floating tooltip popover card */}
      <div
        className={`absolute top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-2.5rem)] p-3.5 bg-slate-900/95 dark:bg-slate-900/98 text-white rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md z-50 text-left transition-all duration-200 ${
          align === 'right' ? 'right-0' : 'left-0 sm:left-auto'
        } ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto visible' : 'opacity-0 -translate-y-1 pointer-events-none invisible'
        }`}
        style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.35))' }}
      >
        {/* Pointer arrow */}
        <div className={`absolute -top-1.5 w-3 h-3 bg-slate-900 border-t border-l border-slate-700/80 rotate-45 ${
          align === 'right' ? 'right-2.5' : 'left-2.5'
        }`} />

        <div className="relative z-10 flex flex-col gap-1.5">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🎯</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                Pedagogiskt Lärandemål
              </span>
            </div>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${mission.levelColor}`}>
              {mission.level}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-100 leading-relaxed pt-0.5">
            {mission.learningGoal}
          </p>

          <div className="mt-1 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Uppdrag {mission.number}: {mission.title}</span>
            <span className="text-indigo-300 font-bold">Lgr22</span>
          </div>
        </div>
      </div>
    </div>
  );
});
LearningGoalTooltip.displayName = 'LearningGoalTooltip';

interface CachedZoneRect {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// Simple Web Audio Chimes using centralized audio service
const playChime = (type: 'success' | 'invalid' | 'victory') => {
  playSoundEffect(type);
};

// SVG Renderer for clean, sharp items
const ItemSvg = memo(({ item }: { item: SortableObject }) => {
  const colorVal = COLORS[item.color] || COLORS.red;
  const cHex = colorVal.hex;
  const dHex = colorVal.darkHex;
  const sizeFactor = item.size === 'small' ? 0.75 : item.size === 'medium' ? 1.0 : 1.25;

  if (item.type === 'dots-card') {
    return (
      <svg 
        style={{ transform: `scale(${sizeFactor})` }}
        className="w-14 h-14 filter drop-shadow select-none pointer-events-none" 
        viewBox="0 0 100 100"
      >
        <rect x="8" y="10" width="84" height="80" rx="12" fill="#fafafa" stroke="#cbd5e1" strokeWidth="4" />
        <rect x="14" y="16" width="72" height="68" rx="8" fill="#ffffff" stroke="#f1f5f9" strokeWidth="2" />
        
        {item.value === 1 && <circle cx="50" cy="50" r="9" fill={cHex} />}
        {item.value === 2 && (
          <>
            <circle cx="32" cy="32" r="9" fill={cHex} />
            <circle cx="68" cy="68" r="9" fill={cHex} />
          </>
        )}
        {item.value === 3 && (
          <>
            <circle cx="30" cy="30" r="9" fill={cHex} />
            <circle cx="50" cy="50" r="9" fill={cHex} />
            <circle cx="70" cy="70" r="9" fill={cHex} />
          </>
        )}
        {item.value === 4 && (
          <>
            <circle cx="30" cy="30" r="9" fill={cHex} />
            <circle cx="70" cy="30" r="9" fill={cHex} />
            <circle cx="30" cy="70" r="9" fill={cHex} />
            <circle cx="70" cy="70" r="9" fill={cHex} />
          </>
        )}
        {item.value === 5 && (
          <>
            <circle cx="30" cy="30" r="9" fill={cHex} />
            <circle cx="70" cy="30" r="9" fill={cHex} />
            <circle cx="50" cy="50" r="9" fill={cHex} />
            <circle cx="30" cy="70" r="9" fill={cHex} />
            <circle cx="70" cy="70" r="9" fill={cHex} />
          </>
        )}
      </svg>
    );
  }

  switch (item.type) {
    case 'circle':
      return (
        <svg style={{ transform: `scale(${sizeFactor})` }} className="w-14 h-14 select-none pointer-events-none" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="38" fill={cHex} stroke={dHex} strokeWidth="5" />
          <circle cx="44" cy="44" r="32" fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" />
        </svg>
      );
    case 'square':
      return (
        <svg style={{ transform: `scale(${sizeFactor})` }} className="w-14 h-14 select-none pointer-events-none" viewBox="0 0 100 100">
          <rect x="15" y="15" width="70" height="70" rx="10" fill={cHex} stroke={dHex} strokeWidth="5" />
          <rect x="20" y="20" width="60" height="60" rx="6" fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" />
        </svg>
      );
    case 'triangle':
      return (
        <svg style={{ transform: `scale(${sizeFactor})` }} className="w-14 h-14 select-none pointer-events-none" viewBox="0 0 100 100">
          <polygon points="50,14 14,84 86,84" fill={cHex} stroke={dHex} strokeWidth="5" strokeLinejoin="round" />
          <polygon points="50,22 22,78 78,78" fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );
    case 'sphere':
      return (
        <svg style={{ transform: `scale(${sizeFactor})` }} className="w-14 h-14 select-none pointer-events-none" viewBox="0 0 100 100">
          <defs>
            <radialGradient id={`sphere-${item.id}`} cx="32%" cy="32%" r="65%">
              <stop offset="0%" stopColor={colorVal.topHex} />
              <stop offset="50%" stopColor={cHex} />
              <stop offset="100%" stopColor={dHex} />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill={`url(#sphere-${item.id})`} stroke={dHex} strokeWidth="2" />
          <ellipse cx="50" cy="84" rx="26" ry="6" fill="#000" fillOpacity="0.14" />
        </svg>
      );
    case 'cube':
      return (
        <svg style={{ transform: `scale(${sizeFactor})` }} className="w-14 h-14 overflow-visible select-none pointer-events-none" viewBox="0 0 100 100">
          <g transform="translate(0, 4)">
            <path d="M 50 50 L 15 31 L 15 72 L 50 91 Z" fill={colorVal.leftHex} stroke={dHex} strokeWidth="1.5" />
            <path d="M 50 50 L 85 31 L 85 72 L 50 91 Z" fill={colorVal.rightHex} stroke={dHex} strokeWidth="1.5" />
            <path d="M 50 50 L 15 31 L 50 12 L 85 31 Z" fill={colorVal.topHex} stroke={dHex} strokeWidth="1.5" />
          </g>
        </svg>
      );
    case 'pyramid':
      return (
        <svg style={{ transform: `scale(${sizeFactor})` }} className="w-14 h-14 overflow-visible select-none pointer-events-none" viewBox="0 0 100 100">
          <polygon points="50,15 15,75 50,88" fill={colorVal.leftHex} stroke={dHex} strokeWidth="1.5" />
          <polygon points="50,15 85,75 50,88" fill={colorVal.rightHex} stroke={dHex} strokeWidth="1.5" />
          <line x1="50" y1="15" x2="50" y2="88" stroke={colorVal.topHex} strokeWidth="2.5" strokeOpacity="0.4" />
        </svg>
      );
    default:
      return null;
  }
});
ItemSvg.displayName = 'ItemSvg';

// Isolated, Memoized Draggable Item to prevent re-rendering when parent or other items change
interface DraggablePoolItemProps {
  item: SortableObject;
  isWiggling: boolean;
  onDragStart: (id: string, x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: (x: number, y: number, item: SortableObject) => void;
}

const DraggablePoolItem = memo(({ item, isWiggling, onDragStart, onDragMove, onDragEnd }: DraggablePoolItemProps) => {
  return (
    <motion.div
      key={item.id}
      drag
      dragSnapToOrigin={true}
      dragElastic={0}
      dragMomentum={false}
      onDragStart={(e, info) => {
        onDragStart(item.id, info.point.x, info.point.y);
      }}
      onDrag={(e, info) => {
        onDragMove(info.point.x, info.point.y);
      }}
      onDragEnd={(e, info) => {
        onDragEnd(info.point.x, info.point.y, item);
      }}
      animate={isWiggling ? {
        x: [0, -12, 10, -8, 6, 0],
        rotate: [0, -6, 5, -4, 2, 0],
      } : { x: 0, rotate: 0 }}
      transition={isWiggling ? { duration: 0.45 } : { duration: 0 }}
      whileDrag={{ scale: 1.15, zIndex: 9999, cursor: 'grabbing' }}
      style={{ 
        touchAction: 'none',
        willChange: 'transform'
      }}
      className="cursor-grab active:cursor-grabbing select-none relative p-1 rounded-xl"
    >
      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white rounded px-1.5 py-0.5 text-[8px] font-bold tracking-tight opacity-0 hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap uppercase z-30 shadow">
        {item.size === 'small' ? 'Liten' : item.size === 'medium' ? 'Mellan' : 'Stor'}{' '}
        {COLORS[item.color]?.name || ''}
      </span>
      <ItemSvg item={item} />
    </motion.div>
  );
});
DraggablePoolItem.displayName = 'DraggablePoolItem';

// Memoized Zone Card for rendering boxes
interface ZoneCardProps {
  zone: ZoneConfig;
  items: SortableObject[];
  isHovered: boolean;
  onReturnToPool: (itemId: string) => void;
}

const BoxZoneCard = memo(({ zone, items, isHovered, onReturnToPool }: ZoneCardProps) => {
  return (
    <div 
      id={`zone-${zone.id}`}
      className={`relative flex flex-col justify-between min-h-[190px] sm:min-h-[210px] max-h-[280px] rounded-2xl border-2 select-none p-3 shadow-inner transition-colors duration-150 ${
        isHovered 
          ? `${zone.activeBorderClass} bg-indigo-500/10 shadow-md` 
          : `${zone.colorClass} border-slate-300 dark:border-slate-800/80`
      }`}
      style={{ boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between border-b border-dashed border-slate-300 dark:border-slate-800 pb-1.5 mb-1.5">
        <div className="truncate mr-1">
          <span className="text-xs font-black tracking-tight text-slate-800 dark:text-slate-200 uppercase truncate block">
            📦 {zone.label}
          </span>
          {zone.subLabel && (
            <span className="text-[9px] font-medium text-slate-400 block truncate">
              {zone.subLabel}
            </span>
          )}
        </div>
        <span className="text-[10px] font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
          {items.length} st
        </span>
      </div>

      {isHovered && (
        <div className="py-1 px-2 mb-1 bg-indigo-600 text-white rounded-lg text-center text-[10px] font-extrabold uppercase tracking-wider shadow-sm animate-pulse">
          ✨ Släpp här! ✨
        </div>
      )}

      <div className="flex-1 overflow-y-auto flex flex-wrap gap-1.5 p-1 align-middle justify-center content-start">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onReturnToPool(item.id)}
            className="cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            title="Klicka för att skicka tillbaka till skattkistan"
          >
            <ItemSvg item={item} />
          </div>
        ))}
        {items.length === 0 && !isHovered && (
          <div className="flex flex-col items-center justify-center h-full m-auto opacity-35 dark:opacity-20">
            <Icons.Cube size={20} />
            <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Tom låda</span>
          </div>
        )}
      </div>
    </div>
  );
});
BoxZoneCard.displayName = 'BoxZoneCard';

const RingZoneCard = memo(({ zone, items, isHovered, onReturnToPool }: ZoneCardProps) => {
  return (
    <div 
      id={`zone-${zone.id}`}
      className={`relative flex flex-col items-center justify-start rounded-full border-4 aspect-square w-full max-w-[230px] md:max-w-[260px] mx-auto p-4 transition-colors duration-150 ${
        isHovered 
          ? `${zone.activeBorderClass} bg-indigo-500/10 shadow-lg` 
          : `${zone.colorClass} border-dashed`
      }`}
      style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)' }}
    >
      <div className="text-[11px] font-black tracking-wider uppercase mb-1 truncate max-w-full text-center">
        {zone.label}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-wrap gap-1 justify-center items-center content-center w-full relative z-10">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onReturnToPool(item.id)}
            className="cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            title="Klicka för att skicka tillbaka till kistan"
          >
            <ItemSvg item={item} />
          </div>
        ))}
        {items.length === 0 && (
          <span className={`text-[10px] font-black uppercase tracking-wider ${
            isHovered ? 'text-indigo-600 font-extrabold animate-pulse' : 'text-slate-400 dark:text-slate-600'
          }`}>
            {isHovered ? '✨ Släpp här! ✨' : 'Släpp här'}
          </span>
        )}
      </div>

      <div className="absolute -bottom-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full py-0.5 px-3 shadow text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
        <span>{items.length} st</span>
      </div>
    </div>
  );
});
RingZoneCard.displayName = 'RingZoneCard';

const ShelfZoneCard = memo(({ zone, items, isHovered, onReturnToPool }: ZoneCardProps) => {
  return (
    <div 
      id={`zone-${zone.id}`}
      className={`relative w-full flex flex-col justify-end min-h-[115px] px-4 pb-1 rounded-xl transition-colors duration-150 ${
        isHovered ? 'bg-indigo-500/10 ring-2 ring-indigo-400' : ''
      }`}
    >
      <span className="absolute left-4 top-1 text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded shadow-xs">
        {zone.label}
      </span>

      <div className="absolute bottom-0 left-0 right-0 h-3.5 bg-amber-800 dark:bg-amber-950 border-t border-amber-600 rounded shadow-md pointer-events-none" />

      <div className="relative pb-3 flex flex-wrap gap-2.5 items-end pl-4 justify-start min-h-[80px] z-10">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onReturnToPool(item.id)}
            className="cursor-pointer hover:scale-110 active:scale-95 transition-transform origin-bottom"
            title="Klicka för att lägga tillbaka i hög"
          >
            <ItemSvg item={item} />
          </div>
        ))}
        {items.length === 0 && (
          <span className={`text-[10px] font-bold tracking-wider pl-1 pb-1 ${
            isHovered ? 'text-indigo-600 font-extrabold animate-pulse' : 'text-slate-400 dark:text-slate-600'
          }`}>
            {isHovered ? '✨ Släpp här! ✨' : 'Placera här...'}
          </span>
        )}
      </div>

      <div className="absolute right-2 bottom-1 text-[10px] font-bold text-slate-400">
        {items.length} st
      </div>
    </div>
  );
});
ShelfZoneCard.displayName = 'ShelfZoneCard';

export const SortingBoxWidget: React.FC = () => {
  const [layoutType, setLayoutType] = useState<VisualLayoutType>('BOXES');
  const [guidedMode, setGuidedMode] = useState<boolean>(true);
  const [items, setItems] = useState<SortableObject[]>([]);
  const [currentMissionId, setCurrentMissionId] = useState<string>('mission-1');
  const [isMissionModalOpen, setIsMissionModalOpen] = useState<boolean>(false);

  // Active hover state: strictly updated only on boundary transitions
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
  const hoveredZoneIdRef = useRef<string | null>(null);

  // Cached zone bounding boxes: calculated ONCE at drag start to eliminate getBoundingClientRect layout thrashing
  const cachedZoneRectsRef = useRef<CachedZoneRect[]>([]);

  // requestAnimationFrame coalescing reference for 60/120fps smooth input
  const rafIdRef = useRef<number | null>(null);
  const latestPointerRef = useRef<{ x: number; y: number } | null>(null);

  // Custom teacher labels for custom sorting
  const [customLabels, setCustomLabels] = useState<string[]>(['Låda A', 'Låda B', 'Låda C', 'Låda D']);
  
  // Classroom discussion guess-my-sort state
  const [showGuessModal, setShowGuessModal] = useState<boolean>(false);
  const [revealedSecretBasis, setRevealedSecretBasis] = useState<boolean>(false);
  
  // Dynamic validation helper (particles)
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Wiggle feedback on invalid drop
  const [invalidWiggleId, setInvalidWiggleId] = useState<string | null>(null);

  // Victory celebration trigger state
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);

  // References
  const sandboxRef = useRef<HTMLDivElement>(null);

  // Helper to ensure strict type matching for generated objects
  const createItem = useCallback((
    id: string,
    type: SortableObject['type'],
    color: SortableObject['color'],
    shape: SortableObject['shape'],
    size: SortableObject['size'],
    value = 1,
    isCard = false
  ): SortableObject => ({
    id,
    type,
    color,
    shape,
    size,
    value,
    isCard,
    zoneId: null
  }), []);

  // Define All Educational Missions
  const MISSIONS: Mission[] = useMemo(() => [
    {
      id: 'mission-1',
      number: 1,
      title: 'Färgsortering',
      subtitle: 'Röd, Blå, Grön & Gul',
      level: 'Nivå 1',
      levelColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      icon: '🎨',
      description: 'Placera varje figur i den låda som har exakt samma färg.',
      learningGoal: 'Utveckla förmågan att klassificera och sortera objekt efter en visuell egenskap (färg), vilket grundlägger logisk abstraktion och mängdlära.',
      pedagogicalHint: 'Titta bara på färgen! Formen och storleken spelar ingen roll här.',
      zones: [
        { id: 'red', label: 'Röda figurer', colorClass: 'bg-red-500/5 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900', hoverClass: 'bg-red-500/15', activeBorderClass: 'ring-4 ring-red-400 border-red-500', accentColor: '#ef4444' },
        { id: 'blue', label: 'Blåa figurer', colorClass: 'bg-blue-500/5 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900', hoverClass: 'bg-blue-500/15', activeBorderClass: 'ring-4 ring-blue-400 border-blue-500', accentColor: '#3b82f6' },
        { id: 'green', label: 'Gröna figurer', colorClass: 'bg-green-500/5 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900', hoverClass: 'bg-green-500/15', activeBorderClass: 'ring-4 ring-green-400 border-green-500', accentColor: '#10b981' },
        { id: 'yellow', label: 'Gula figurer', colorClass: 'bg-amber-500/5 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900', hoverClass: 'bg-amber-500/15', activeBorderClass: 'ring-4 ring-amber-400 border-amber-500', accentColor: '#f59e0b' },
      ],
      generateItems: () => {
        const colors: SortableObject['color'][] = ['red', 'blue', 'green', 'yellow'];
        const shapes: SortableObject['shape'][] = ['circle', 'square', 'triangle'];
        const sizes: SortableObject['size'][] = ['small', 'medium', 'large'];
        const list: SortableObject[] = [];

        colors.forEach((col) => {
          shapes.forEach((shp, sIdx) => {
            const is3D = sIdx === 2;
            const type: SortableObject['type'] = is3D ? (shp === 'circle' ? 'sphere' : shp === 'square' ? 'cube' : 'pyramid') : shp;
            list.push(createItem(
              `item-${col}-${shp}-${Math.random().toString(36).substring(2, 6)}`,
              type,
              col,
              shp,
              sizes[sIdx % sizes.length]
            ));
          });
        });
        return list.sort(() => Math.random() - 0.5);
      },
      validateItem: (item, zoneId) => item.color === zoneId
    },
    {
      id: 'mission-2',
      number: 2,
      title: 'Geometriska Former',
      subtitle: 'Cirkel, Kvadrat & Triangel',
      level: 'Nivå 1',
      levelColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      icon: '📐',
      description: 'Sortera figurerna efter deras geometriska grundform (oavsett färg och storlek).',
      learningGoal: 'Känna igen och särskilja grundläggande geometriska former (cirkel, kvadrat, triangel) oberoende av deras färg, storlek eller orientering.',
      pedagogicalHint: 'Klot räknas som cirklar, kuber som kvadrater och pyramider som trianglar!',
      zones: [
        { id: 'circles', label: 'Cirklar & Klot', subLabel: 'Runda former', colorClass: 'bg-indigo-500/5 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900', hoverClass: 'bg-indigo-500/15', activeBorderClass: 'ring-4 ring-indigo-400 border-indigo-500', accentColor: '#6366f1' },
        { id: 'squares', label: 'Kvadrater & Kuber', subLabel: 'Fyrsidiga former', colorClass: 'bg-pink-500/5 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900', hoverClass: 'bg-pink-500/15', activeBorderClass: 'ring-4 ring-pink-400 border-pink-500', accentColor: '#ec4899' },
        { id: 'triangles', label: 'Trianglar & Pyramider', subLabel: 'Tresoppiga former', colorClass: 'bg-sky-500/5 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900', hoverClass: 'bg-sky-500/15', activeBorderClass: 'ring-4 ring-sky-400 border-sky-500', accentColor: '#0ea5e9' },
      ],
      generateItems: () => {
        const colors: SortableObject['color'][] = ['red', 'blue', 'green', 'yellow'];
        const shapes: SortableObject['shape'][] = ['circle', 'square', 'triangle'];
        const list: SortableObject[] = [];

        shapes.forEach((shp) => {
          for (let i = 0; i < 4; i++) {
            const is3D = i >= 2;
            const type: SortableObject['type'] = is3D ? (shp === 'circle' ? 'sphere' : shp === 'square' ? 'cube' : 'pyramid') : shp;
            list.push(createItem(
              `item-${shp}-${i}-${Math.random().toString(36).substring(2, 6)}`,
              type,
              colors[i % colors.length],
              shp,
              i % 2 === 0 ? 'medium' : 'large'
            ));
          }
        });
        return list.sort(() => Math.random() - 0.5);
      },
      validateItem: (item, zoneId) => {
        if (zoneId === 'circles') return item.shape === 'circle';
        if (zoneId === 'squares') return item.shape === 'square';
        if (zoneId === 'triangles') return item.shape === 'triangle';
        return false;
      }
    },
    {
      id: 'mission-3',
      number: 3,
      title: '2D eller 3D?',
      subtitle: 'Plana figurer vs Solida kroppar',
      level: 'Nivå 2',
      levelColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      icon: '🧊',
      description: 'Skilj mellan platta 2D-figurer (cirkel, kvadrat, triangel) och rymdgeometriska 3D-kroppar (klot, kub, pyramid).',
      learningGoal: 'Förstå skillnaden mellan tvådimensionella plana figurer och tredimensionella solida geometriska kroppar med rymd och volym (klot, kub, pyramid).',
      pedagogicalHint: '2D-figurer är helt platta. 3D-kroppar har volym och skuggor som ett riktigt föremål!',
      zones: [
        { id: '2d', label: 'Plana figurer (2D)', subLabel: 'Cirkel, kvadrat, triangel', colorClass: 'bg-emerald-500/5 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900', hoverClass: 'bg-emerald-500/15', activeBorderClass: 'ring-4 ring-emerald-400 border-emerald-500', accentColor: '#10b981' },
        { id: '3d', label: 'Solida kroppar (3D)', subLabel: 'Klot, kub, pyramid', colorClass: 'bg-violet-500/5 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900', hoverClass: 'bg-violet-500/15', activeBorderClass: 'ring-4 ring-violet-400 border-violet-500', accentColor: '#8b5cf6' },
      ],
      generateItems: () => {
        const colors: SortableObject['color'][] = ['red', 'blue', 'green', 'yellow'];
        const list: SortableObject[] = [];

        // 6 x 2D items
        const flatTypes: SortableObject['shape'][] = ['circle', 'circle', 'square', 'square', 'triangle', 'triangle'];
        flatTypes.forEach((ft, i) => {
          list.push(createItem(
            `item-2d-${i}-${Math.random().toString(36).substring(2, 6)}`,
            ft,
            colors[i % colors.length],
            ft,
            'medium'
          ));
        });

        // 6 x 3D items
        const solidTypes: { type: SortableObject['type']; shape: SortableObject['shape'] }[] = [
          { type: 'sphere', shape: 'circle' },
          { type: 'sphere', shape: 'circle' },
          { type: 'cube', shape: 'square' },
          { type: 'cube', shape: 'square' },
          { type: 'pyramid', shape: 'triangle' },
          { type: 'pyramid', shape: 'triangle' },
        ];
        solidTypes.forEach((st, i) => {
          list.push(createItem(
            `item-3d-${i}-${Math.random().toString(36).substring(2, 6)}`,
            st.type,
            colors[(i + 2) % colors.length],
            st.shape,
            'medium'
          ));
        });

        return list.sort(() => Math.random() - 0.5);
      },
      validateItem: (item, zoneId) => {
        const is3D = item.type === 'sphere' || item.type === 'cube' || item.type === 'pyramid';
        if (zoneId === '2d') return !is3D;
        if (zoneId === '3d') return is3D;
        return false;
      }
    },
    {
      id: 'mission-4',
      number: 4,
      title: 'Storleksordning',
      subtitle: 'Liten, Mellan & Stor',
      level: 'Nivå 1',
      levelColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      icon: '📏',
      description: 'Jämför figurernas storlek och sortera dem i Liten, Mellanstor eller Stor.',
      learningGoal: 'Träna på att jämföra, gradera och ordna objekt utifrån mätbara storleksrelationer (liten, mellan, stor).',
      pedagogicalHint: 'Jämför figurerna bredvid varandra för att se vilken som är minst och störst.',
      zones: [
        { id: 'small', label: 'Små figurer', subLabel: 'Minsta storleken', colorClass: 'bg-slate-500/5 dark:bg-slate-800/25 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800', hoverClass: 'bg-slate-300/20', activeBorderClass: 'ring-4 ring-slate-400 border-slate-500', accentColor: '#64748b' },
        { id: 'medium', label: 'Mellan figurer', subLabel: 'Medelstorlek', colorClass: 'bg-zinc-500/5 dark:bg-zinc-800/25 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800', hoverClass: 'bg-zinc-300/20', activeBorderClass: 'ring-4 ring-zinc-400 border-zinc-500', accentColor: '#71717a' },
        { id: 'large', label: 'Stora figurer', subLabel: 'Största storleken', colorClass: 'bg-neutral-500/5 dark:bg-neutral-800/25 text-neutral-700 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800', hoverClass: 'bg-neutral-300/20', activeBorderClass: 'ring-4 ring-neutral-400 border-neutral-500', accentColor: '#525252' },
      ],
      generateItems: () => {
        const colors: SortableObject['color'][] = ['red', 'blue', 'green', 'yellow'];
        const shapes: SortableObject['shape'][] = ['circle', 'square', 'triangle'];
        const sizes: SortableObject['size'][] = ['small', 'medium', 'large'];
        const list: SortableObject[] = [];

        sizes.forEach((sz) => {
          for (let i = 0; i < 4; i++) {
            const shp = shapes[i % shapes.length];
            list.push(createItem(
              `item-sz-${sz}-${i}-${Math.random().toString(36).substring(2, 6)}`,
              shp,
              colors[i % colors.length],
              shp,
              sz
            ));
          }
        });

        return list.sort(() => Math.random() - 0.5);
      },
      validateItem: (item, zoneId) => item.size === zoneId
    },
    {
      id: 'mission-5',
      number: 5,
      title: 'Räkna Prickar',
      subtitle: 'Få, Mellan & Många',
      level: 'Nivå 2',
      levelColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
      icon: '🎲',
      description: 'Räkna prickarna på tärningskorten och sortera efter mängd.',
      learningGoal: 'Stärka taluppfattning, snabb avläsning av antal (subitizing) samt koppla tärningsmönster till mängdbegreppen få, mellan och många.',
      pedagogicalHint: 'Få = 1 eller 2 prickar. Mellan = 3 prickar. Många = 4 eller 5 prickar.',
      zones: [
        { id: 'few', label: 'Få (1–2 prickar)', subLabel: '1 eller 2 prickar', colorClass: 'bg-orange-500/5 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900', hoverClass: 'bg-orange-500/15', activeBorderClass: 'ring-4 ring-orange-400 border-orange-500', accentColor: '#f97316' },
        { id: 'mid', label: 'Mellan (3 prickar)', subLabel: 'Exakt 3 prickar', colorClass: 'bg-cyan-500/5 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900', hoverClass: 'bg-cyan-500/15', activeBorderClass: 'ring-4 ring-cyan-400 border-cyan-500', accentColor: '#06b6d4' },
        { id: 'many', label: 'Många (4–5 prickar)', subLabel: '4 eller 5 prickar', colorClass: 'bg-emerald-500/5 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900', hoverClass: 'bg-emerald-500/15', activeBorderClass: 'ring-4 ring-emerald-400 border-emerald-500', accentColor: '#10b981' },
      ],
      generateItems: () => {
        const colors: SortableObject['color'][] = ['red', 'blue', 'green', 'yellow'];
        const values = [1, 2, 2, 3, 3, 3, 4, 4, 5];
        return values.map((val, idx) => createItem(
          `card-${val}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          'dots-card',
          colors[idx % colors.length],
          'square',
          'medium',
          val,
          true
        )).sort(() => Math.random() - 0.5);
      },
      validateItem: (item, zoneId) => {
        if (zoneId === 'few') return item.value <= 2;
        if (zoneId === 'mid') return item.value === 3;
        if (zoneId === 'many') return item.value >= 4;
        return false;
      }
    },
    {
      id: 'mission-6',
      number: 6,
      title: 'Jämna & Udda Tal',
      subtitle: 'Taluppfattning med prickar',
      level: 'Nivå 3',
      levelColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      icon: '⚖️',
      description: 'Sortera korten efter om antalet prickar bildar ett jämnt eller udda tal.',
      learningGoal: 'Utforska talens egenskaper genom parbildning och förstå skillnaden mellan jämna tal (kan delas i par) och udda tal (en blir över).',
      pedagogicalHint: 'Jämna tal (2 och 4) kan delas i två lika par. Udda tal (1, 3 och 5) har alltid en prick över!',
      zones: [
        { id: 'odd', label: 'Udda tal (1, 3, 5)', subLabel: 'En prick blir alltid över', colorClass: 'bg-rose-500/5 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900', hoverClass: 'bg-rose-500/15', activeBorderClass: 'ring-4 ring-rose-400 border-rose-500', accentColor: '#f43f5e' },
        { id: 'even', label: 'Jämna tal (2, 4)', subLabel: 'Kan delas i två lika par', colorClass: 'bg-indigo-500/5 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900', hoverClass: 'bg-indigo-500/15', activeBorderClass: 'ring-4 ring-indigo-400 border-indigo-500', accentColor: '#6366f1' },
      ],
      generateItems: () => {
        const colors: SortableObject['color'][] = ['red', 'blue', 'green', 'yellow'];
        const values = [1, 1, 2, 2, 2, 3, 3, 4, 4, 5];
        return values.map((val, idx) => createItem(
          `card-parity-${val}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          'dots-card',
          colors[idx % colors.length],
          'square',
          'medium',
          val,
          true
        )).sort(() => Math.random() - 0.5);
      },
      validateItem: (item, zoneId) => {
        const isEven = item.value % 2 === 0;
        if (zoneId === 'even') return isEven;
        if (zoneId === 'odd') return !isEven;
        return false;
      }
    },
    {
      id: 'mission-7',
      number: 7,
      title: 'Mästaren: 2 Egenskaper!',
      subtitle: 'Färg OCH Form i kombination',
      level: 'Nivå 3',
      levelColor: 'bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
      icon: '🏆',
      description: 'Klurigt uppdrag! Läs skyltarna noga: varje låda kräver både en viss färg OCH en viss form!',
      learningGoal: 'Träna kombinatoriskt tänkande genom att samtidigt klassificera utifrån två villkor (både färg OCH form) samt hantera negationer och övriga fall.',
      pedagogicalHint: 'Kontrollera både färg och form innan du släpper. Passar figuren inte i någon speciallåda, ska den till Övriga!',
      zones: [
        { id: 'red-circle', label: 'Röda Cirklar/Klot', subLabel: 'Både röd och rund', colorClass: 'bg-red-500/5 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900', hoverClass: 'bg-red-500/15', activeBorderClass: 'ring-4 ring-red-400 border-red-500', accentColor: '#ef4444' },
        { id: 'blue-square', label: 'Blåa Kvadrater/Kuber', subLabel: 'Både blå och fyrkantig', colorClass: 'bg-blue-500/5 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900', hoverClass: 'bg-blue-500/15', activeBorderClass: 'ring-4 ring-blue-400 border-blue-500', accentColor: '#3b82f6' },
        { id: 'green-triangle', label: 'Gröna Trianglar', subLabel: 'Både grön och tresidig', colorClass: 'bg-emerald-500/5 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900', hoverClass: 'bg-emerald-500/15', activeBorderClass: 'ring-4 ring-emerald-400 border-emerald-500', accentColor: '#10b981' },
        { id: 'others', label: 'Övriga Figurer', subLabel: 'Passar inte i ovanstående', colorClass: 'bg-slate-500/5 dark:bg-slate-800/25 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800', hoverClass: 'bg-slate-300/20', activeBorderClass: 'ring-4 ring-slate-400 border-slate-500', accentColor: '#64748b' },
      ],
      generateItems: () => {
        const list: SortableObject[] = [];
        for (let i = 0; i < 3; i++) {
          list.push(createItem(
            `m7-rc-${i}-${Math.random().toString(36).substring(2, 6)}`,
            i === 2 ? 'sphere' : 'circle',
            'red',
            'circle',
            'medium'
          ));
        }
        for (let i = 0; i < 3; i++) {
          list.push(createItem(
            `m7-bs-${i}-${Math.random().toString(36).substring(2, 6)}`,
            i === 2 ? 'cube' : 'square',
            'blue',
            'square',
            'medium'
          ));
        }
        for (let i = 0; i < 3; i++) {
          list.push(createItem(
            `m7-gt-${i}-${Math.random().toString(36).substring(2, 6)}`,
            i === 2 ? 'pyramid' : 'triangle',
            'green',
            'triangle',
            'medium'
          ));
        }
        const others: { color: SortableObject['color']; shape: SortableObject['shape']; type: SortableObject['type'] }[] = [
          { color: 'yellow', shape: 'circle', type: 'circle' },
          { color: 'red', shape: 'square', type: 'square' },
          { color: 'yellow', shape: 'triangle', type: 'triangle' },
        ];
        others.forEach((o, i) => {
          list.push(createItem(
            `m7-other-${i}-${Math.random().toString(36).substring(2, 6)}`,
            o.type,
            o.color,
            o.shape,
            'medium'
          ));
        });

        return list.sort(() => Math.random() - 0.5);
      },
      validateItem: (item, zoneId) => {
        if (zoneId === 'red-circle') return item.color === 'red' && item.shape === 'circle';
        if (zoneId === 'blue-square') return item.color === 'blue' && item.shape === 'square';
        if (zoneId === 'green-triangle') return item.color === 'green' && item.shape === 'triangle';
        if (zoneId === 'others') {
          const isRC = item.color === 'red' && item.shape === 'circle';
          const isBS = item.color === 'blue' && item.shape === 'square';
          const isGT = item.color === 'green' && item.shape === 'triangle';
          return !isRC && !isBS && !isGT;
        }
        return false;
      }
    },
    {
      id: 'mission-custom',
      number: 8,
      title: 'Öppet Laboratorium',
      subtitle: 'Skapa egna regler och lådor',
      level: 'Fritt',
      levelColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
      icon: '🧪',
      description: 'Helt fri laboration där du eller läraren bestämmer reglerna och vad som ska sorteras var.',
      learningGoal: 'Formulera egna klassificeringsregler, prova matematiska hypoteser och resonera kring mönster och kategorisering tillsammans med klasskamrater.',
      pedagogicalHint: 'Du kan ändra namnen på lådorna och leka "Gissa min sortering" med en klasskompis!',
      zones: [
        { id: 'custom-0', label: customLabels[0] || 'Låda A', colorClass: 'bg-violet-500/5 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900', hoverClass: 'bg-violet-500/15', activeBorderClass: 'ring-4 ring-violet-400 border-violet-500', accentColor: '#8b5cf6' },
        { id: 'custom-1', label: customLabels[1] || 'Låda B', colorClass: 'bg-fuchsia-500/5 dark:bg-fuchsia-950/20 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-900', hoverClass: 'bg-fuchsia-500/15', activeBorderClass: 'ring-4 ring-fuchsia-400 border-fuchsia-500', accentColor: '#d946ef' },
        { id: 'custom-2', label: customLabels[2] || 'Låda C', colorClass: 'bg-amber-500/5 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900', hoverClass: 'bg-amber-500/15', activeBorderClass: 'ring-4 ring-amber-400 border-amber-500', accentColor: '#f59e0b' },
        { id: 'custom-3', label: customLabels[3] || 'Låda D', colorClass: 'bg-teal-500/5 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900', hoverClass: 'bg-teal-500/15', activeBorderClass: 'ring-4 ring-teal-400 border-teal-500', accentColor: '#14b8a6' },
      ],
      generateItems: () => {
        const colors: SortableObject['color'][] = ['red', 'blue', 'green', 'yellow'];
        const shapes: SortableObject['shape'][] = ['circle', 'square', 'triangle'];
        const sizes: SortableObject['size'][] = ['small', 'medium', 'large'];
        const list: SortableObject[] = [];

        for (let i = 0; i < 12; i++) {
          const shp = shapes[i % shapes.length];
          const is3D = i % 2 === 1;
          const type: SortableObject['type'] = is3D ? (shp === 'circle' ? 'sphere' : shp === 'square' ? 'cube' : 'pyramid') : shp;
          list.push(createItem(
            `custom-item-${i}-${Math.random().toString(36).substring(2, 6)}`,
            type,
            colors[i % colors.length],
            shp,
            sizes[i % sizes.length],
            (i % 5) + 1
          ));
        }
        return list.sort(() => Math.random() - 0.5);
      },
      validateItem: () => true
    }
  ], [customLabels, createItem]);

  // Current active mission
  const activeMission = useMemo(() => {
    return MISSIONS.find(m => m.id === currentMissionId) || MISSIONS[0];
  }, [MISSIONS, currentMissionId]);

  const activeZones = activeMission.zones;

  // Initialize or change mission
  const selectMission = useCallback((missionId: string) => {
    const target = MISSIONS.find(m => m.id === missionId);
    if (!target) return;
    setCurrentMissionId(missionId);
    setItems(target.generateItems());
    setHasCelebrated(false);
    setIsMissionModalOpen(false);
    setHoveredZoneId(null);
    hoveredZoneIdRef.current = null;
    if (missionId === 'mission-custom') {
      setGuidedMode(false);
    } else {
      setGuidedMode(true);
    }
  }, [MISSIONS]);

  // Next / Previous Mission navigation
  const currentMissionIndex = MISSIONS.findIndex(m => m.id === currentMissionId);
  const handlePrevMission = useCallback(() => {
    const prevIdx = (currentMissionIndex - 1 + MISSIONS.length) % MISSIONS.length;
    selectMission(MISSIONS[prevIdx].id);
  }, [currentMissionIndex, MISSIONS, selectMission]);

  const handleNextMission = useCallback(() => {
    const nextIdx = (currentMissionIndex + 1) % MISSIONS.length;
    selectMission(MISSIONS[nextIdx].id);
  }, [currentMissionIndex, MISSIONS, selectMission]);

  // Initial load
  useEffect(() => {
    setItems(activeMission.generateItems());
  }, []);

  // Cleanup requestAnimationFrame on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Pre-cache zone bounding boxes once when drag starts (ZERO layout thrashing during mousemove)
  const cacheZoneRectangles = useCallback(() => {
    const rects: CachedZoneRect[] = [];
    activeZones.forEach(zone => {
      const el = document.getElementById(`zone-${zone.id}`);
      if (el) {
        const r = el.getBoundingClientRect();
        rects.push({
          id: zone.id,
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom
        });
      }
    });
    cachedZoneRectsRef.current = rects;
  }, [activeZones]);

  // Core hit testing logic using cached rectangles and only updating React state on change
  const performHoverCheck = useCallback((clientX: number, clientY: number) => {
    let foundZoneId: string | null = null;
    const rects = cachedZoneRectsRef.current;
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        foundZoneId = r.id;
        break;
      }
    }

    // Crucial Optimization: ONLY trigger a React state change if the hovered zone actually changes!
    if (foundZoneId !== hoveredZoneIdRef.current) {
      hoveredZoneIdRef.current = foundZoneId;
      setHoveredZoneId(foundZoneId);
    }
  }, []);

  // Drag start handler
  const handleItemDragStart = useCallback((_id: string, clientX: number, clientY: number) => {
    // Cache zone coordinates once
    cacheZoneRectangles();
    performHoverCheck(clientX, clientY);
  }, [cacheZoneRectangles, performHoverCheck]);

  // Drag move handler throttled via requestAnimationFrame
  const handleItemDragMove = useCallback((clientX: number, clientY: number) => {
    latestPointerRef.current = { x: clientX, y: clientY };

    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (latestPointerRef.current) {
          performHoverCheck(latestPointerRef.current.x, latestPointerRef.current.y);
        }
      });
    }
  }, [performHoverCheck]);

  // Particle explosion handler
  const spawnParticles = useCallback((x: number, y: number, colorHex: string) => {
    const parentContainer = document.getElementById('sorting-sandbox');
    if (!parentContainer) return;

    const bounds = parentContainer.getBoundingClientRect();
    const localX = x - bounds.left;
    const localY = y - bounds.top;

    const newParticles: Particle[] = Array.from({ length: 8 }).map((_, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      x: localX,
      y: localY,
      color: colorHex
    }));

    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 700);
  }, []);

  // Drag end handler
  const handleItemDragEnd = useCallback((clientX: number, clientY: number, item: SortableObject) => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    hoveredZoneIdRef.current = null;
    setHoveredZoneId(null);

    // Hit-test using cached rects or fresh measurement
    let targetZoneId: string | null = null;
    const rects = cachedZoneRectsRef.current;
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        targetZoneId = r.id;
        break;
      }
    }

    if (targetZoneId) {
      if (guidedMode) {
        const isValid = activeMission.validateItem(item, targetZoneId);
        if (isValid) {
          setItems(prev => prev.map(i => i.id === item.id ? { ...i, zoneId: targetZoneId } : i));
          const colConfig = COLORS[item.color];
          spawnParticles(clientX, clientY, colConfig?.hex || '#a855f7');
          playChime('success');
        } else {
          setInvalidWiggleId(item.id);
          playChime('invalid');
          setTimeout(() => setInvalidWiggleId(null), 500);
        }
      } else {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, zoneId: targetZoneId } : i));
        const colConfig = COLORS[item.color];
        spawnParticles(clientX, clientY, colConfig?.hex || '#a855f7');
        playChime('success');
      }
    }
  }, [guidedMode, activeMission, spawnParticles]);

  // Return a sorted item back to pool
  const handleReturnToPool = useCallback((itemId: string) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, zoneId: null } : i));
  }, []);

  // Completion calculation
  const totalItemCount = items.length;
  const sortedItemCount = items.filter(i => i.zoneId !== null).length;
  const unsortedItemCount = totalItemCount - sortedItemCount;
  const progressPercent = totalItemCount > 0 ? Math.round((sortedItemCount / totalItemCount) * 100) : 0;
  
  const isMissionComplete = useMemo(() => {
    if (items.length === 0) return false;
    return unsortedItemCount === 0;
  }, [items, unsortedItemCount]);

  // Trigger celebration on victory
  useEffect(() => {
    if (isMissionComplete && !hasCelebrated && items.length > 0) {
      setHasCelebrated(true);
      playChime('victory');
    }
  }, [isMissionComplete, hasCelebrated, items.length]);

  // Filter items in starting pool tray
  const unsortedItems = useMemo(() => {
    return items.filter(i => i.zoneId === null);
  }, [items]);

  return (
    <div className="w-full flex flex-col xl:flex-row gap-4 h-full min-h-[580px] p-2 overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl" id="sorting-widget-container">
      
      {/* LEFT: Game and Interactive workspace platform */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        
        {/* TOP MISSION HEADER RIBBON */}
        <div className="bg-white dark:bg-slate-950 p-3.5 sm:p-4 rounded-3xl shadow-sm border border-slate-200/90 dark:border-slate-800 flex flex-col gap-3">
          
          {/* Top row: Mission Title, Picker Button, Level Badge, and Quick Nav */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 shadow-xs flex items-center justify-center">
                {activeMission.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${activeMission.levelColor}`}>
                    {activeMission.level}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Uppdrag {activeMission.number} av {MISSIONS.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-800 dark:text-slate-100 truncate">
                    {activeMission.title}
                  </h1>
                  <LearningGoalTooltip mission={activeMission} align="left" />
                </div>
              </div>
            </div>

            {/* Navigation and Action Controls */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={handlePrevMission}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition active:scale-95"
                title="Föregående uppdrag"
              >
                <Icons.ChevronLeft size={16} />
              </button>

              <button
                onClick={() => setIsMissionModalOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wide flex items-center gap-1.5 transition shadow-sm"
                title="Öppna uppdragsväljaren för att välja ett specifikt uppdrag"
              >
                <Icons.Target size={14} />
                <span>Välj Uppdrag</span>
              </button>

              <button
                onClick={handleNextMission}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition active:scale-95"
                title="Nästa uppdrag"
              >
                <Icons.ChevronRight size={16} />
              </button>

              <button
                onClick={() => {
                  setItems(activeMission.generateItems());
                  setHasCelebrated(false);
                }}
                className="p-1.5 sm:px-2.5 sm:py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition flex items-center gap-1"
                title="Blanda och slumpa nya figurer"
              >
                <Icons.Reset size={14} />
                <span className="hidden sm:inline text-[11px]">Blanda om</span>
              </button>
            </div>
          </div>

          {/* Mission description and progress bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              <strong className="text-indigo-600 dark:text-indigo-400 font-bold">Mål: </strong>
              {activeMission.description}
            </p>

            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-24 sm:w-28 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    isMissionComplete ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {sortedItemCount} / {totalItemCount} klara ({progressPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Central sorting stage */}
        <div 
          ref={sandboxRef}
          id="sorting-sandbox"
          className="relative flex-1 min-h-[460px] bg-slate-100 dark:bg-slate-950/80 rounded-3xl border border-slate-200 dark:border-slate-800/80 p-3 sm:p-4 overflow-visible flex flex-col justify-between shadow-inner select-none"
        >
          {/* Particle explosions on correct drop */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
            <AnimatePresence>
              {particles.map(p => (
                <motion.div
                  key={p.id}
                  initial={{ x: p.x, y: p.y, scale: 0.8, opacity: 1 }}
                  animate={{
                    x: p.x + (Math.random() - 0.5) * 160,
                    y: p.y + (Math.random() - 0.5) * 160 - 50,
                    scale: 0.1,
                    opacity: 0
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* SECTION 1: Standard Active Sorting Zones */}
          <div className="relative w-full z-10">
            {layoutType === 'RINGS' ? (
              /* A. VENN RINGS VIEW */
              <div className={`grid gap-4 py-3 w-full justify-center ${
                activeZones.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                activeZones.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
                'grid-cols-2 md:grid-cols-4'
              }`}>
                {activeZones.map((zone) => {
                  const itemsInZone = items.filter(i => i.zoneId === zone.id);
                  const isHovered = hoveredZoneId === zone.id;

                  return (
                    <RingZoneCard
                      key={zone.id}
                      zone={zone}
                      items={itemsInZone}
                      isHovered={isHovered}
                      onReturnToPool={handleReturnToPool}
                    />
                  );
                })}
              </div>
            ) : layoutType === 'SHELVES' ? (
              /* B. SHELVES VIEW */
              <div className="flex flex-col gap-4 w-full py-2">
                {activeZones.map((zone) => {
                  const itemsInZone = items.filter(i => i.zoneId === zone.id);
                  const isHovered = hoveredZoneId === zone.id;

                  return (
                    <ShelfZoneCard
                      key={zone.id}
                      zone={zone}
                      items={itemsInZone}
                      isHovered={isHovered}
                      onReturnToPool={handleReturnToPool}
                    />
                  );
                })}
              </div>
            ) : (
              /* C. WOODEN BOXES VIEW (DEFAULT) */
              <div className={`grid gap-3 py-1 w-full ${
                activeZones.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                activeZones.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
                'grid-cols-2 md:grid-cols-4'
              }`}>
                {activeZones.map((zone) => {
                  const itemsInZone = items.filter(i => i.zoneId === zone.id);
                  const isHovered = hoveredZoneId === zone.id;

                  return (
                    <BoxZoneCard
                      key={zone.id}
                      zone={zone}
                      items={itemsInZone}
                      isHovered={isHovered}
                      onReturnToPool={handleReturnToPool}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* VICTORY BANNER WHEN MISSION IS COMPLETE */}
          {isMissionComplete && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="my-3 p-4 bg-emerald-500/15 dark:bg-emerald-950/30 border-2 border-emerald-500/40 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 z-20 text-center sm:text-left shadow-xl backdrop-blur-sm self-center w-full max-w-xl"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                  <Icons.Trophy size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                    <span className="text-yellow-500 text-base">⭐⭐⭐</span>
                    <h3 className="text-emerald-800 dark:text-emerald-300 text-sm font-black uppercase tracking-wider">
                      Uppdraget Slutfört!
                    </h3>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 text-xs mt-0.5 font-semibold">
                    Fantastiskt bra sorterat! Du placerade alla {totalItemCount} figurer på helt rätt plats!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleNextMission}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition shadow-md flex items-center gap-1.5"
                >
                  <span>Nästa uppdrag</span>
                  <Icons.ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* SECTION 2: Starting Pool Well / Plockyta */}
          <div 
            id="sorting-pool-tray"
            className="mt-3 pt-3 border-t border-dashed border-slate-300 dark:border-slate-800 relative z-10"
          >
            <div className="flex items-center justify-between mb-2">
              <span id="sorting-pool" className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5 select-none">
                <Icons.Shapes size={14} className="text-indigo-500" />
                <span>Skattkistan ({unsortedItemCount} figurer kvar att sortera)</span>
              </span>
              
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                🖐️ Dra figurerna till lådorna ovan!
              </span>
            </div>

            {/* Scattered Pile Box with zero-lag smooth Framer Motion dragging */}
            <div className="bg-slate-50/70 dark:bg-slate-950/30 border border-slate-300 dark:border-slate-800 rounded-2xl p-3 sm:p-4 min-h-[120px] flex flex-wrap gap-3 items-center justify-center content-center overflow-visible">
              {unsortedItems.map((item) => {
                const isWiggling = invalidWiggleId === item.id;
                
                return (
                  <DraggablePoolItem
                    key={item.id}
                    item={item}
                    isWiggling={isWiggling}
                    onDragStart={handleItemDragStart}
                    onDragMove={handleItemDragMove}
                    onDragEnd={handleItemDragEnd}
                  />
                );
              })}

              {unsortedItemCount === 0 && !isMissionComplete && (
                <div className="text-center py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Kistan är tom! Du har flyttat alla figurer.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Live bottom description tracker bar */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <Icons.Info size={14} className="text-indigo-500 shrink-0" />
            <span className="text-[11px] leading-tight">
              <strong>Tips: </strong>{activeMission.pedagogicalHint}
            </span>
          </div>
          <div className="hidden sm:block text-[10px] uppercase font-black tracking-wider text-slate-400">
            Mattelab • Sorteringsboxen
          </div>
        </div>

      </div>

      {/* RIGHT: CONTROL PANEL SIDEBAR */}
      <div className="w-full xl:w-72 flex flex-col gap-3.5 bg-white dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shrink-0 select-none">
        
        {/* Section Title */}
        <div>
          <h2 className="text-[10px] font-black uppercase text-indigo-500 tracking-wider mb-1 flex items-center gap-1.5">
            <Icons.Settings size={12} />
            <span>Verktygspanel</span>
          </h2>
          <h3 className="text-xs font-black tracking-tight text-slate-800 dark:text-slate-300">
            Uppdrag & Inställningar
          </h3>
        </div>

        <hr className="border-slate-100 dark:border-slate-900" />

        {/* Prominent Mission Selector Card in Sidebar */}
        <div className="flex flex-col gap-2 p-3 bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Aktivt Uppdrag
            </span>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${activeMission.levelColor}`}>
              {activeMission.level}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl">{activeMission.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 justify-between">
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                  {activeMission.title}
                </h4>
                <LearningGoalTooltip mission={activeMission} align="right" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {activeMission.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMissionModalOpen(true)}
            className="w-full mt-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-black uppercase tracking-wide flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <Icons.Target size={13} />
            <span>Bläddra bland alla uppdrag</span>
          </button>
        </div>

        {/* Didactic settings: Guided vs Sandbox */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">
            Arbetssätt
          </label>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-black">
            <button
              onClick={() => setGuidedMode(true)}
              className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1 transition ${
                guidedMode
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                  : 'bg-transparent border-slate-150 dark:border-slate-800 text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Icons.Sparkles size={14} />
              <span>Styrt Uppdrag</span>
            </button>
            <button
              onClick={() => setGuidedMode(false)}
              className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1 transition ${
                !guidedMode
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                  : 'bg-transparent border-slate-150 dark:border-slate-800 text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Icons.Brain size={14} />
              <span>Öppen laboration</span>
            </button>
          </div>
          <p className="text-[9px] text-slate-400 leading-tight">
            {guidedMode 
              ? 'Rättar automatiskt: Endast rätt låda godkänns.' 
              : 'Fritt skapande: Eleven kan sortera fritt i valfri låda.'
            }
          </p>
        </div>

        {/* Custom categories inputs (displays if mission is CUSTOM) */}
        {activeMission.id === 'mission-custom' && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 flex flex-col gap-2">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
              Dina egna lådetiketter:
            </span>
            {customLabels.map((lbl, idx) => (
              <input
                key={idx}
                type="text"
                value={lbl}
                onChange={(e) => {
                  const updated = [...customLabels];
                  updated[idx] = e.target.value;
                  setCustomLabels(updated);
                }}
                className="w-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl px-2.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder={`Låda ${idx + 1}`}
              />
            ))}
          </div>
        )}

        <hr className="border-slate-100 dark:border-slate-900" />

        {/* Visual appearance skins toggles */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">
            Mottagarnas Form
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'BOXES', label: 'Lådor', icon: Icons.Cube },
              { id: 'RINGS', label: 'Ringar', icon: Icons.Bead },
              { id: 'SHELVES', label: 'Hylla', icon: Icons.Columns }
            ].map((skin) => (
              <button
                key={skin.id}
                onClick={() => setLayoutType(skin.id as VisualLayoutType)}
                className={`py-2 px-1 rounded-xl text-[10px] border-2 font-black flex flex-col items-center gap-1 transition ${
                  layoutType === skin.id
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-slate-800 dark:border-slate-800'
                    : 'bg-transparent border-slate-150 dark:border-slate-800 text-slate-400 hover:bg-slate-50'
                }`}
              >
                <skin.icon size={13} />
                <span>{skin.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Gissa min sortering modal button */}
        {!guidedMode && (
          <button
            onClick={() => {
              setRevealedSecretBasis(false);
              setShowGuessModal(true);
            }}
            className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <Icons.Brain size={13} />
            <span>Gissa min sortering! 🕵️‍♂️</span>
          </button>
        )}

        {/* Quick actions well */}
        <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-900 grid grid-cols-1 gap-2">
          <button
            onClick={() => {
              setItems(prev => prev.map(i => ({ ...i, zoneId: null })));
              setHasCelebrated(false);
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
          >
            <Icons.Trash size={12} />
            <span>Töm alla lådor</span>
          </button>
        </div>

      </div>

      {/* MISSION SELECTOR MODAL */}
      {isMissionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-950 w-full max-w-2xl rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative select-none max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Icons.Target size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">
                    Välj Uppdrag för Sorteringsboxen
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Välj ett matematiskt uppdrag anpassat efter elevernas nivå och arbetsområde.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMissionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 p-2 rounded-xl transition"
              >
                <Icons.Close size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MISSIONS.map((m) => {
                const isCurrent = m.id === currentMissionId;
                return (
                  <button
                    key={m.id}
                    onClick={() => selectMission(m.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between gap-2.5 transition-all active:scale-98 ${
                      isCurrent
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-600 shadow-sm ring-2 ring-indigo-400/40'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                          {m.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${m.levelColor}`}>
                              {m.level}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              #{m.number}
                            </span>
                          </div>
                          <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">
                            {m.title}
                          </h3>
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase shrink-0">
                          Aktiv
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {m.description}
                    </p>

                    <div className="text-[10px] text-slate-600 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/50 p-2 rounded-xl flex items-start gap-1.5 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-xs shrink-0">🎯</span>
                      <span className="leading-tight">
                        <strong className="text-indigo-600 dark:text-indigo-400">Lärandemål: </strong>
                        {m.learningGoal}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      <span>{m.zones.length} mottagare</span>
                      <span>Starta uppdrag ➔</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-150 dark:border-slate-850 flex items-center justify-between text-xs text-slate-500">
              <span>Tryck på valfritt kort för att börja</span>
              <button
                onClick={() => setIsMissionModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition"
              >
                Stäng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCUSSION GUESSING MODAL */}
      {showGuessModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-sm rounded-[32px] p-6 border border-slate-150 dark:border-slate-850 shadow-2xl relative select-none animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowGuessModal(false)}
              className="absolute top-5 right-5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 p-1.5 rounded-full"
            >
              <Icons.Close size={16} />
            </button>

            <div className="text-center flex flex-col items-center gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-full">
                <Icons.Brain size={28} />
              </div>
              <h2 className="text-[15px] font-black uppercase tracking-tight text-slate-800 dark:text-slate-100">
                Gissa min sortering! 🕵️‍♂️
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Titta på figurerna som kompisen har placerat i lådorna. Kan du lista ut vilken regel eller mönster som användes?
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-2xl w-full border border-slate-150 dark:border-slate-850 mt-2">
                <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block mb-1">
                  Kriterium för uppdraget:
                </span>
                {revealedSecretBasis ? (
                  <div className="text-left py-1">
                    <p className="text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase">
                      💡 {activeMission.title} ({activeMission.subtitle})
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      {activeMission.description}
                    </p>
                  </div>
                ) : (
                  <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 italic block py-3">
                    Regeln är fortfarande dold för klassen...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 w-full mt-3">
                <button
                  onClick={() => setRevealedSecretBasis(true)}
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[11px] font-extrabold uppercase transition"
                >
                  Visa svaret!
                </button>
                <button
                  onClick={() => setShowGuessModal(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-150 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl text-[11px] font-extrabold uppercase transition"
                >
                  Fortsätt labba
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
