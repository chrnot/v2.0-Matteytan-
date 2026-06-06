import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../icons';

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

export type SortCriterionType = 'COLOR' | 'SHAPE' | 'SIZE' | 'DOTS' | 'CUSTOM';
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

export const SortingBoxWidget: React.FC = () => {
  const [criterion, setCriterion] = useState<SortCriterionType>('COLOR');
  const [layoutType, setLayoutType] = useState<VisualLayoutType>('BOXES');
  const [guidedMode, setGuidedMode] = useState<boolean>(true);
  const [items, setItems] = useState<SortableObject[]>([]);
  const [targetCounts, setTargetCounts] = useState<Record<string, number>>({});
  
  // Custom teacher labels for custom sorting
  const [customLabels, setCustomLabels] = useState<string[]>(['Grupp A', 'Grupp B', 'Grupp C']);
  
  // Classroom discussion guess-my-sort state
  const [showGuessModal, setShowGuessModal] = useState<boolean>(false);
  const [guessGuessed, setGuessGuessed] = useState<boolean>(false);
  const [revealedSecretBasis, setRevealedSecretBasis] = useState<boolean>(false);
  
  // Dynamic validation helper (collided drops trigger particle effects)
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Boundary constraints reference for dragging
  const sandboxRef = useRef<HTMLDivElement>(null);
  
  // Sound fallback or simple visual wiggle feedback
  const [invalidWiggleId, setInvalidWiggleId] = useState<string | null>(null);

  // Initialize objects suited for the criteria
  useEffect(() => {
    generateNewItems();
  }, [criterion]);

  const generateNewItems = () => {
    const newItems: SortableObject[] = [];
    const colors: ('red' | 'blue' | 'green' | 'yellow')[] = ['red', 'blue', 'green', 'yellow'];
    const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];

    // Generate 12 varied items
    const count = criterion === 'DOTS' ? 9 : 12;

    for (let i = 0; i < count; i++) {
      const id = `item-${Math.random().toString(36).substring(2, 9)}`;
      const color = colors[i % colors.length];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      
      let type: 'circle' | 'square' | 'triangle' | 'sphere' | 'cube' | 'pyramid' | 'dots-card';
      let isCard = false;
      let value = (i % 5) + 1; // 1 to 5 dots distributed nicely

      if (criterion === 'DOTS') {
        type = 'dots-card';
        isCard = true;
      } else {
        // Balanced 2D and 3D shapes to make geometry rich and physical
        const is3D = i % 2 !== 0;
        if (is3D) {
          type = shape === 'circle' ? 'sphere' : shape === 'square' ? 'cube' : 'pyramid';
        } else {
          type = shape === 'circle' ? 'circle' : shape === 'square' ? 'square' : 'triangle';
        }
      }

      newItems.push({
        id,
        type,
        color,
        shape,
        size,
        value,
        isCard,
        zoneId: null,
      });
    }

    // Set all initially in the starting container (zoneId: null)
    setItems(newItems.map(item => ({ ...item, zoneId: null })));
    setGuessGuessed(false);
    setRevealedSecretBasis(false);
  };

  // Pre-load zones based on chosen criteria
  const activeZones = React.useMemo(() => {
    switch (criterion) {
      case 'COLOR':
        return [
          { id: 'red', label: 'Röda', colorClass: 'bg-red-500/5 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900', hoverClass: 'hover:bg-red-500/10' },
          { id: 'blue', label: 'Blåa', colorClass: 'bg-blue-500/5 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900', hoverClass: 'hover:bg-blue-500/10' },
          { id: 'green', label: 'Gröna', colorClass: 'bg-green-500/5 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900', hoverClass: 'hover:bg-green-500/10' },
          { id: 'yellow', label: 'Gula', colorClass: 'bg-amber-500/5 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 border-amber-200 dark:border-amber-900', hoverClass: 'hover:bg-amber-500/10' },
        ];
      case 'SHAPE':
        return [
          { id: 'circles', label: 'Cirklar / Klot', colorClass: 'bg-indigo-500/5 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900', hoverClass: 'hover:bg-indigo-500/10' },
          { id: 'squares', label: 'Kvadrater / Kub', colorClass: 'bg-pink-500/5 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900', hoverClass: 'hover:bg-pink-500/10' },
          { id: 'triangles', label: 'Trianglar / Pyramid', colorClass: 'bg-sky-500/5 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900', hoverClass: 'hover:bg-sky-500/10' },
        ];
      case 'SIZE':
        return [
          { id: 'small', label: 'Liten', colorClass: 'bg-slate-500/5 dark:bg-slate-800/25 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800', hoverClass: 'hover:bg-slate-300/10' },
          { id: 'medium', label: 'Mellan', colorClass: 'bg-zinc-500/5 dark:bg-zinc-800/25 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800', hoverClass: 'hover:bg-zinc-300/10' },
          { id: 'large', label: 'Stor', colorClass: 'bg-neutral-500/5 dark:bg-neutral-800/25 text-neutral-700 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800', hoverClass: 'hover:bg-neutral-300/10' },
        ];
      case 'DOTS':
        return [
          { id: 'few', label: 'Få prickar (1-2 och mindre)', colorClass: 'bg-orange-500/5 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900', hoverClass: 'hover:bg-orange-500/10' },
          { id: 'mid', label: 'Mellan (3 tärningsprickar)', colorClass: 'bg-cyan-500/5 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900', hoverClass: 'hover:bg-cyan-500/10' },
          { id: 'many', label: 'Många prickar (4-5)', colorClass: 'bg-emerald-500/5 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900', hoverClass: 'hover:bg-emerald-500/10' },
        ];
      case 'CUSTOM':
        return [
          { id: 'boxA', label: customLabels[0] || 'Kategori A', colorClass: 'bg-violet-500/5 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900', hoverClass: 'hover:bg-violet-500/10' },
          { id: 'boxB', label: customLabels[1] || 'Kategori B', colorClass: 'bg-fuchsia-500/5 dark:bg-fuchsia-950/20 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-900', hoverClass: 'hover:bg-fuchsia-500/10' },
          { id: 'boxC', label: customLabels[2] || 'Kategori C', colorClass: 'bg-amber-500/5 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900', hoverClass: 'hover:bg-amber-500/10' },
        ];
      default:
        return [];
    }
  }, [criterion, customLabels]);

  // Dynamically initialize and update target counts when active zones change
  useEffect(() => {
    setTargetCounts(prev => {
      const updated = { ...prev };
      activeZones.forEach(zone => {
        if (updated[zone.id] === undefined) {
          updated[zone.id] = 3; // default to 3
        }
      });
      return updated;
    });
  }, [activeZones]);

  // Generate figures corresponding exactly to targetCounts values for either the pool container or directly in the boxes
  const generateItemsFromTargets = (intoBoxes: boolean = false) => {
    const newItems: SortableObject[] = [];
    const colors: ('red' | 'blue' | 'green' | 'yellow')[] = ['red', 'blue', 'green', 'yellow'];
    const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];

    activeZones.forEach(zone => {
      const count = targetCounts[zone.id] !== undefined ? targetCounts[zone.id] : 3;
      for (let i = 0; i < count; i++) {
        const id = `item-${Math.random().toString(36).substring(2, 9)}`;
        let color = colors[Math.floor(Math.random() * colors.length)];
        let shape = shapes[Math.floor(Math.random() * shapes.length)];
        let size = sizes[Math.floor(Math.random() * sizes.length)];
        let value = Math.floor(Math.random() * 5) + 1;
        let type: 'circle' | 'square' | 'triangle' | 'sphere' | 'cube' | 'pyramid' | 'dots-card' = 'circle';
        let isCard = criterion === 'DOTS';

        // Adapt properties to conform to the target zone
        if (criterion === 'COLOR') {
          color = zone.id as 'red' | 'blue' | 'green' | 'yellow';
        } else if (criterion === 'SHAPE') {
          if (zone.id === 'circles') shape = 'circle';
          if (zone.id === 'squares') shape = 'square';
          if (zone.id === 'triangles') shape = 'triangle';
        } else if (criterion === 'SIZE') {
          size = zone.id as 'small' | 'medium' | 'large';
        } else if (criterion === 'DOTS') {
          if (zone.id === 'few') value = Math.floor(Math.random() * 2) + 1;
          if (zone.id === 'mid') value = 3;
          if (zone.id === 'many') value = Math.floor(Math.random() * 2) + 4;
        }

        // Establish the graphic representation matching the chosen type
        if (isCard || criterion === 'DOTS') {
          type = 'dots-card';
          isCard = true;
        } else {
          const is3D = Math.random() < 0.5;
          if (is3D) {
            type = shape === 'circle' ? 'sphere' : shape === 'square' ? 'cube' : 'pyramid';
          } else {
            type = shape === 'circle' ? 'circle' : shape === 'square' ? 'square' : 'triangle';
          }
        }

        newItems.push({
          id,
          type,
          color,
          shape,
          size,
          value,
          isCard,
          zoneId: intoBoxes ? zone.id : null,
        });
      }
    });

    setItems(newItems);
    setGuessGuessed(false);
    setRevealedSecretBasis(false);
  };

  // Validation rules
  const validateItemForZone = (item: SortableObject, zoneId: string): boolean => {
    switch (criterion) {
      case 'COLOR':
        return item.color === zoneId;
      case 'SHAPE':
        if (zoneId === 'circles') return item.shape === 'circle';
        if (zoneId === 'squares') return item.shape === 'square';
        if (zoneId === 'triangles') return item.shape === 'triangle';
        return false;
      case 'SIZE':
        return item.size === zoneId;
      case 'DOTS':
        if (zoneId === 'few') return item.value <= 2;
        if (zoneId === 'mid') return item.value === 3;
        if (zoneId === 'many') return item.value >= 4;
        return false;
      case 'CUSTOM':
      default:
        // Everything goes in sandbox custom sorting mode
        return true;
    }
  };

  // Helper check if challenge complete under guided mode
  const isChallengeComplete = React.useMemo(() => {
    if (!guidedMode) return false;
    const unsortedCount = items.filter(i => i.zoneId === null).length;
    return unsortedCount === 0;
  }, [items, guidedMode]);

  // Particle explosion handler
  const spawnParticles = (x: number, y: number, colorHex: string) => {
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
    }, 900);
  };

  // Drag End Handler
  const handleDragEnd = (event: any, info: any, item: SortableObject) => {
    const pX = info.point.x;
    const pY = info.point.y;

    let targetZoneId: string | null = null;

    // Detect which zone is hovered
    activeZones.forEach(zone => {
      const el = document.getElementById(`zone-${zone.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (pX >= rect.left && pX <= rect.right && pY >= rect.top && pY <= rect.bottom) {
          targetZoneId = zone.id;
        }
      }
    });

    if (targetZoneId) {
      if (guidedMode) {
        const isValid = validateItemForZone(item, targetZoneId);
        if (isValid) {
          // Success Placement
          setItems(prev => prev.map(i => i.id === item.id ? { ...i, zoneId: targetZoneId } : i));
          const colConfig = COLORS[item.color];
          spawnParticles(pX, pY, colConfig?.hex || '#a855f7');
        } else {
          // Incorrect Placement - bounce back visually.
          // Trigger light visual wiggle by registering an invalid animation trigger
          setInvalidWiggleId(item.id);
          setTimeout(() => setInvalidWiggleId(null), 500);
        }
      } else {
        // Sandbox mode - let items be dropped unconditionally
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, zoneId: targetZoneId } : i));
        const colConfig = COLORS[item.color];
        spawnParticles(pX, pY, colConfig?.hex || '#a855f7');
      }
    } else {
      // Re-dropped outside all boxes - default to returns in the starting pool tray
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, zoneId: null } : i));
    }
  };

  // Return a sorted item instantly back to pool
  const handleReturnToPool = (itemId: string) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, zoneId: null } : i));
  };

  // SVG Renderer for high-contrast shapes & subitizing card objects
  const renderItemSvg = (item: SortableObject) => {
    const colorVal = COLORS[item.color] || COLORS.red;
    const cHex = colorVal.hex;
    const dHex = colorVal.darkHex;

    // Scale dynamically based on specified size
    const sizeFactor = item.size === 'small' ? 0.72 : item.size === 'medium' ? 1.0 : 1.28;

    if (item.type === 'dots-card') {
      return (
        <svg 
          style={{ transform: `scale(${sizeFactor})` }}
          className="w-14 h-14 transition-transform filter drop-shadow" 
          viewBox="0 0 100 100"
        >
          {/* Elegant light slate card background */}
          <rect x="8" y="10" width="84" height="80" rx="12" fill="#fafafa" stroke="#cbd5e1" strokeWidth="5" />
          <rect x="14" y="16" width="72" height="68" rx="8" fill="#ffffff" stroke="#f1f5f9" strokeWidth="2" />
          
          {/* Draw dots with the item color */}
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
          <svg style={{ transform: `scale(${sizeFactor})` }} className="w-14 h-14" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="38" fill={cHex} stroke={dHex} strokeWidth="5" />
            <circle cx="44" cy="44" r="32" fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />
          </svg>
        );
      case 'square':
        return (
          <svg style={{ transform: `scale(${sizeFactor})` }} className="w-14 h-14" viewBox="0 0 100 100">
            <rect x="15" y="15" width="70" height="70" rx="10" fill={cHex} stroke={dHex} strokeWidth="5" />
            <rect x="20" y="20" width="60" height="60" rx="6" fill="none" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />
          </svg>
        );
      case 'triangle':
        return (
          <svg style={{ transform: `scale(${sizeFactor})` }} className="w-14 h-14" viewBox="0 0 100 100">
            <polygon points="50,12 12,82 88,82" fill={cHex} stroke={dHex} strokeWidth="5" strokeLinejoin="round" />
            <polygon points="50,20 20,77 80,77" fill="none" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        );
      case 'sphere':
        return (
          <svg style={{ transform: `scale(${sizeFactor})` }} className="w-14 h-14" viewBox="0 0 100 100">
            <defs>
              <radialGradient id={`sphere-grad-${item.id}`} cx="32%" cy="32%" r="65%">
                <stop offset="0%" stopColor={colorVal.topHex} />
                <stop offset="50%" stopColor={cHex} />
                <stop offset="100%" stopColor={dHex} />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="38" fill={`url(#sphere-grad-${item.id})`} stroke={dHex} strokeWidth="2" />
            {/* Ambient Shadow Overlay for volume */}
            <ellipse cx="50" cy="84" rx="26" ry="6" fill="#000" fillOpacity="0.12" />
          </svg>
        );
      case 'cube':
        return (
          <svg style={{ transform: `scale(${sizeFactor})` }} className="w-14 h-14 overflow-visible" viewBox="0 0 100 100">
            <g transform="translate(0, 4)">
              {/* Isometric Cube Faces with authentic dimension shading */}
              {/* Left Face */}
              <path d="M 50 50 L 15 31 L 15 72 L 50 91 Z" fill={colorVal.leftHex} stroke={dHex} strokeWidth="1.5" />
              {/* Right Face */}
              <path d="M 50 50 L 85 31 L 85 72 L 50 91 Z" fill={colorVal.rightHex} stroke={dHex} strokeWidth="1.5" />
              {/* Top Face */}
              <path d="M 50 50 L 15 31 L 50 12 L 85 31 Z" fill={colorVal.topHex} stroke={dHex} strokeWidth="1.5" />
            </g>
          </svg>
        );
      case 'pyramid':
        return (
          <svg style={{ transform: `scale(${sizeFactor})` }} className="w-14 h-14 overflow-visible" viewBox="0 0 100 100">
            {/* Front Left Face */}
            <polygon points="50,15 15,75 50,88" fill={colorVal.leftHex} stroke={dHex} strokeWidth="1.5" />
            {/* Front Right Face */}
            <polygon points="50,15 85,75 50,88" fill={colorVal.rightHex} stroke={dHex} strokeWidth="1.5" />
            {/* Subtle gloss highlight lines */}
            <line x1="50" y1="15" x2="50" y2="88" stroke={colorVal.topHex} strokeWidth="2.5" strokeOpacity="0.4" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Compile live feedback for Swedish user success state
  const getChallengeFeedbackText = () => {
    if (!guidedMode) {
      const allMatched = activeZones.every(zone => {
        const currentCount = items.filter(i => i.zoneId === zone.id).length;
        const target = targetCounts[zone.id] ?? 3;
        return currentCount === target;
      });

      if (allMatched) {
        return 'Perfekt! Du har lagt exakt rätt antal figurer i varje ruta! 🌟🏆';
      }

      const correctZonesCount = activeZones.filter(zone => {
        const currentCount = items.filter(i => i.zoneId === zone.id).length;
        const target = targetCounts[zone.id] ?? 3;
        return currentCount === target;
      }).length;

      const placedCount = items.filter(i => i.zoneId !== null).length;
      return `Öppet laboratorium: Du har rätt antal i <strong>${correctZonesCount}</strong> av <strong>${activeZones.length}</strong> rutor (totalt ${placedCount} st sorterade).`;
    }

    if (items.filter(i => i.zoneId !== null).length === 0) return 'Dra de färgglada figurerna till rätt mottagare!';
    
    const parts = activeZones.map(zone => {
      const zoneItemsCount = items.filter(i => i.zoneId === zone.id).length;
      let labelWord = zone.label.toLowerCase();
      // Swedish cleanup plurals or neat translations
      if (labelWord.includes('röda')) labelWord = 'röda figurer';
      if (labelWord.includes('blåa')) labelWord = 'blåa figurer';
      if (labelWord.includes('gröna')) labelWord = 'gröna figurer';
      if (labelWord.includes('gula')) labelWord = 'gula figurer';
      return `<strong>${zoneItemsCount}</strong> ${labelWord}`;
    });

    if (isChallengeComplete) {
      return `Snyggt sorterat! Det blev ${parts.slice(0, -1).join(', ')} och ${parts[parts.length - 1]} 🎉`;
    }

    return `Fortsätt! Du har sorterat ${items.filter(i => i.zoneId !== null).length} av ${items.length} figurer.`;
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-5 h-full min-h-[580px] p-2 overflow-hidden bg-slate-50/40 dark:bg-slate-900/40 rounded-3xl" id="sorting-widget-container">
      
      {/* LEFT: Game and Interactive workspace platform */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Dynamic educational Instructions Board */}
        <div className="bg-white dark:bg-slate-950 p-4 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-500 dark:text-indigo-400 rounded-2xl">
              <Icons.Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-[14px] font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
                {guidedMode ? 'Uppdrag: Det styrda uppdraget' : 'Öppet Laboratorium'}
              </h1>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">
                {criterion === 'COLOR' && 'Sortera de fina figurerna efter deras lysande färger!'}
                {criterion === 'SHAPE' && 'Sortera efter geometrisk form (cirkel/klot, kvadrat/kub, triangel/pyramid).'}
                {criterion === 'SIZE' && 'Klassificera figurer efter storlek (liten, mellan eller stor).'}
                {criterion === 'DOTS' && 'Sortera korten baserat på hur många prickar som finns på dem!'}
                {criterion === 'CUSTOM' && 'Utforska fritt! Klicka på box-namnen i högermenyn för att anpassa kriterier.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!guidedMode && (
              <button
                onClick={() => {
                  setGuessGuessed(false);
                  setRevealedSecretBasis(false);
                  setShowGuessModal(true);
                }}
                className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1.5 transition shadow"
              >
                <Icons.Brain size={13} />
                <span>Gissa min sortering!</span>
              </button>
            )}
            <button
              onClick={generateNewItems}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-150 rounded-2xl text-slate-400 dark:text-slate-500 transition-all"
              title="Slumpa nya figurer"
            >
              <Icons.Reset size={15} />
            </button>
          </div>
        </div>

        {/* Central sorting stage with interactive constraints */}
        <div 
          ref={sandboxRef}
          id="sorting-sandbox"
          className="relative flex-1 min-h-[460px] bg-slate-100 dark:bg-slate-950/80 rounded-3xl border border-slate-200 dark:border-slate-800/80 p-4 overflow-visible flex flex-col justify-between shadow-inner select-none"
        >
          {/* Renders sorting particle explosions */}
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
                  transition={{ duration: 0.85, ease: 'easeOut' }}
                  className="absolute w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* SECTION 1: Standard Active Sorting Zones (Wooden Boxes, Glowing Venn Rings, or Back-Plate Shelves) */}
          <div className="relative w-full z-10">
            {layoutType === 'RINGS' ? (
              /* A. VENN-INSPIRED METALLIC RINGS VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 py-4 w-full justify-center">
                {activeZones.slice(0, 3).map((zone) => {
                  const itemsInZone = items.filter(i => i.zoneId === zone.id);
                  return (
                    <div 
                      key={zone.id}
                      id={`zone-${zone.id}`}
                      className={`relative flex flex-col items-center justify-start rounded-full border-4 border-dashed aspect-square w-full max-w-[250px] md:max-w-[280px] mx-auto p-4 transition-colors ${zone.colorClass} ${zone.hoverClass}`}
                      style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)' }}
                    >
                      {/* Ring Central Header */}
                      <div className="text-[11px] font-black tracking-widest uppercase mb-2 truncate max-w-full text-center">
                        {zone.label}
                      </div>

                      {/* Overlapping items grid inside the Venn Ring */}
                      <div className="flex-1 overflow-y-auto flex flex-wrap gap-1 justify-center items-center content-center w-full relative z-10">
                        <AnimatePresence mode="popLayout">
                          {itemsInZone.map((item) => (
                            <motion.div
                              key={item.id}
                              layoutId={item.id}
                              onClick={() => handleReturnToPool(item.id)}
                              className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                              title="Klicka för att skicka tillbaka till kistan"
                            >
                              {renderItemSvg(item)}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {itemsInZone.length === 0 && (
                          <span className="text-[10px] text-slate-350 dark:text-slate-600 font-extrabold uppercase tracking-wide">
                            Släpp här
                          </span>
                        )}
                      </div>

                      {/* Display live mini counters */}
                      <div className="absolute -bottom-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full py-0.5 px-3 shadow text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <span>{itemsInZone.length}</span>
                        {!guidedMode && targetCounts[zone.id] !== undefined && (
                          <span className="text-slate-400 font-semibold">/ {targetCounts[zone.id]}</span>
                        )}
                        <span>st</span>
                        {!guidedMode && targetCounts[zone.id] !== undefined && itemsInZone.length === targetCounts[zone.id] && (
                          <span className="text-emerald-500 font-extrabold">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : layoutType === 'SHELVES' ? (
              /* B. HORIZONTAL DETAILED CARPENTRY SHELVES VIEW */
              <div className="flex flex-col gap-6 w-full py-2">
                {activeZones.slice(0, 3).map((zone) => {
                  const itemsInZone = items.filter(i => i.zoneId === zone.id);
                  return (
                    <div 
                      key={zone.id}
                      id={`zone-${zone.id}`}
                      className="relative w-full flex flex-col justify-end min-h-[130px] px-4 pb-1 transition-all group"
                    >
                      {/* Shelf Label header */}
                      <span className="absolute left-4 top-0 text-[10px] font-black uppercase text-indigo-600/90 dark:text-indigo-400 bg-slate-50 dark:bg-slate-900/60 sm:bg-transparent px-1.5 py-0.5 rounded sm:rounded-none tracking-widest">
                        {zone.label}
                      </span>

                      {/* Wooden horizontal bar backboard */}
                      <div className="absolute bottom-0 left-0 right-0 h-3.5 bg-amber-800/82 dark:bg-amber-950 border-t border-amber-550 rounded shadow-md pointer-events-none group-hover:bg-amber-700/90 transition-colors" />

                      {/* Elements lined up side-by-side gracefully like jars/books on shelf */}
                      <div className="relative pb-3 flex flex-wrap gap-2.5 items-end pl-5 justify-start min-h-[90px] z-10">
                        <AnimatePresence mode="popLayout">
                          {itemsInZone.map((item) => (
                            <motion.div
                              key={item.id}
                              layoutId={item.id}
                              onClick={() => handleReturnToPool(item.id)}
                              className="cursor-pointer hover:scale-105 active:scale-95 transition-transform origin-bottom"
                              title="Klicka för att lägga tillbaka i hög"
                            >
                              {renderItemSvg(item)}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {itemsInZone.length === 0 && (
                          <span className="text-[10px] text-slate-400/90 dark:text-slate-600 font-extrabold tracking-wider pl-1 pb-1">
                            Placera här...
                          </span>
                        )}
                      </div>

                      {/* Floating Indicator details */}
                      <div className="absolute -right-1 bottom-1 text-[9px] font-black text-slate-400 dark:text-slate-500 select-none flex items-center gap-1">
                        <span>Antal: {itemsInZone.length}</span>
                        {!guidedMode && targetCounts[zone.id] !== undefined && (
                          <span className="text-slate-450 font-semibold border-none">/ {targetCounts[zone.id]}</span>
                        )}
                        {!guidedMode && targetCounts[zone.id] !== undefined && itemsInZone.length === targetCounts[zone.id] && (
                          <span className="text-emerald-500 font-black">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* C. WOODEN RECTANGLE BOXES SKIN (DEFAULT) */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-2 w-full">
                {activeZones.map((zone) => {
                  const itemsInZone = items.filter(i => i.zoneId === zone.id);
                  return (
                    <div 
                      key={zone.id}
                      id={`zone-${zone.id}`}
                      className={`relative flex flex-col justify-between min-h-[220px] max-h-[300px] rounded-2xl border-2 border-slate-350 select-none p-3 shadow-inner dark:border-slate-800/80 transition-all ${zone.colorClass} ${zone.hoverClass}`}
                      style={{ 
                        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.05)',
                      }}
                    >
                      {/* Box Label name bar */}
                      <div className="flex items-center justify-between border-b border-dashed border-slate-300 dark:border-slate-800 pb-1.5 mb-2">
                        <span className="text-[12px] font-black tracking-tight text-slate-700 dark:text-slate-200 uppercase truncate">
                          📦 {zone.label}
                        </span>
                        <span className="text-[9px] font-black bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full select-none flex items-center gap-1">
                          <span>{itemsInZone.length}</span>
                          {!guidedMode && targetCounts[zone.id] !== undefined && (
                            <span className="text-slate-400 font-semibold">/ {targetCounts[zone.id]}</span>
                          )}
                          <span>st</span>
                          {!guidedMode && targetCounts[zone.id] !== undefined && itemsInZone.length === targetCounts[zone.id] && (
                            <span className="text-emerald-500 font-extrabold ml-1">✓</span>
                          )}
                        </span>
                      </div>

                      {/* Grid elements inside box */}
                      <div className="flex-1 overflow-y-auto overflow-hidden flex flex-wrap gap-1.5 p-1 align-middle justify-center content-start">
                        <AnimatePresence mode="popLayout">
                          {itemsInZone.map((item) => (
                            <motion.div
                              key={item.id}
                              layoutId={item.id}
                              onClick={() => handleReturnToPool(item.id)}
                              className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                              title="Klicka för att lägga tillbaka i hög"
                            >
                              {renderItemSvg(item)}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {itemsInZone.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full m-auto opacity-35 dark:opacity-20">
                            <Icons.Cube size={18} />
                            <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Tom låda</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MAIN TARGET: SUCCESS ILLUSION BANNERS */}
          {((isChallengeComplete && guidedMode) || (!guidedMode && activeZones.every(z => items.filter(i => i.zoneId === z.id).length === (targetCounts[z.id] ?? 3)))) && (
            <motion.div 
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="my-3 p-4 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center gap-3.5 z-25 text-center sm:text-left shadow-lg backdrop-blur-sm self-center max-w-lg"
            >
              <div className="p-2.5 bg-emerald-500 text-white rounded-full flex items-center justify-center animate-bounce shadow">
                <Icons.Trophy size={18} />
              </div>
              <div>
                <h3 className="text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">Mästerlig Sortering!</h3>
                <p 
                  className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 font-semibold"
                  dangerouslySetInnerHTML={{ __html: getChallengeFeedbackText() }}
                />
              </div>
            </motion.div>
          )}

          {/* SECTION 2: Starting Pool Well / Plockyta (Central pile where un-sorted toys start) */}
          <div className="mt-4 pt-3 border-t border-dashed border-slate-300 dark:border-slate-800 relative z-10">
            
            {/* Treasure container header */}
            <div className="flex items-center justify-between mb-3">
              <span id="sorting-pool" className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5 select-none">
                <Icons.Shapes size={13} className="text-indigo-500" />
                <span>Plockyta / Skattkistan ({items.filter(i => i.zoneId === null).length} figurer kvar)</span>
              </span>
              
              <span className="text-[9px] font-semibold text-slate-350 dark:text-slate-600">
                🖐️ Dra figurerna till rätt zoner ovan!
              </span>
            </div>

            {/* Scattered Pile Box */}
            <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-350/50 dark:border-slate-850 rounded-2xl p-4 min-h-[130px] flex flex-wrap gap-2.5 items-center justify-center content-center overflow-visible">
              <AnimatePresence>
                {items.filter(i => i.zoneId === null).map((item) => {
                  const isWiggling = invalidWiggleId === item.id;
                  
                  return (
                    <motion.div
                      key={item.id}
                      layoutId={item.id}
                      drag
                      dragConstraints={sandboxRef}
                      dragElastic={0.08}
                      dragMomentum={false}
                      onDragEnd={(e, info) => handleDragEnd(e, info, item)}
                      animate={isWiggling ? {
                        x: [0, -10, 8, -6, 4, 0],
                        rotate: [0, -4, 3, -2, 1, 0],
                      } : { x: 0, rotate: 0 }}
                      transition={isWiggling ? { duration: 0.45 } : { type: 'spring', stiffness: 350, damping: 25 }}
                      whileDrag={{ scale: 1.15, zIndex: 100 }}
                      className="cursor-grab active:cursor-grabbing hover:scale-108 transition-transform select-none z-20 m-0.5 p-1 relative"
                    >
                      {/* Hover properties label for pupils */}
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white rounded px-1.5 py-0.5 text-[8px] font-semibold tracking-tight opacity-0 hover:opacity-100 transition duration-150 pointer-events-none whitespace-nowrap uppercase">
                        {item.size === 'small' ? 'Liten' : item.size === 'medium' ? 'Mellan' : 'Stor'}{' '}
                        {COLORS[item.color].name}
                      </span>
                      {renderItemSvg(item)}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {items.filter(i => i.zoneId === null).length === 0 && !isChallengeComplete && (
                <div className="text-center py-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Kistan är tom! Du har flyttat alla figurer.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Live bottom description tracker bar */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <Icons.Info size={14} className="text-slate-400" />
            <span dangerouslySetInnerHTML={{ __html: getChallengeFeedbackText() }} />
          </div>
          <div className="hidden sm:block text-[10px] uppercase font-black tracking-wider text-slate-400">
            Mattelab v1.2 Sorteringsboxen
          </div>
        </div>

      </div>

      {/* RIGHT: CONTROL PANEL SIDEBAR (Teacher setups & layouts) */}
      <div className="w-full xl:w-72 flex flex-col gap-4 bg-white dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shrink-0 select-none">
        
        {/* Section Title */}
        <div>
          <h2 className="text-[10px] font-black uppercase text-indigo-500 tracking-wider mb-2 flex items-center gap-1.5">
            <Icons.Settings size={12} />
            <span>Verktygspanel</span>
          </h2>
          <h3 className="text-xs font-black tracking-tight text-slate-800 dark:text-slate-300">Anpassa laborationen</h3>
        </div>

        <hr className="border-slate-100 dark:border-slate-900" />

        {/* Didactic settings: Guided vs Sandbox */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Didaktiskt Arbetssätt</label>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-black">
            <button
              onClick={() => {
                setGuidedMode(true);
                generateNewItems();
              }}
              className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition ${
                guidedMode
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-450'
                  : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Icons.Sparkles size={14} />
              <span>Styrt Uppdrag</span>
            </button>
            <button
              onClick={() => {
                setGuidedMode(false);
                setGuessGuessed(false);
                setRevealedSecretBasis(false);
              }}
              className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition ${
                !guidedMode
                  ? 'bg-indigo-55 border-indigo-600 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-450'
                  : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Icons.Brain size={14} />
              <span>Öppet laboratorium</span>
            </button>
          </div>
          <p className="text-[9px] text-slate-400/95 leading-relaxed leading-3">
            {guidedMode 
              ? 'Rättar automatiskt och studsar tillbaka felaktiga föremål till skattkistan.' 
              : 'Fritt skapande där eleven sorterar fritt efter eget eller lärarens tänkande.'
            }
          </p>
        </div>

        {/* Count per box selection - ONLY visible in Open Laboratory mode */}
        {!guidedMode && (
          <div className="flex flex-col gap-2.5 p-3 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950/55 rounded-2xl">
            <label className="text-[10px] font-black uppercase text-indigo-755 dark:text-indigo-400 tracking-wider flex items-center gap-1.5">
              <Icons.Coins size={11} />
              <span>Antal figurer per ruta</span>
            </label>
            
            <div className="flex flex-col gap-2 mt-1">
              {activeZones.map((zone) => {
                const currentCount = targetCounts[zone.id] ?? 3;
                return (
                  <div key={zone.id} className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span className="truncate max-w-[120px]">{zone.label}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTargetCounts(prev => ({
                            ...prev,
                            [zone.id]: Math.max(0, currentCount - 1)
                          }));
                        }}
                        className="w-5 h-5 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 active:scale-95 text-slate-500 font-extrabold transition-all"
                      >
                        -
                      </button>
                      <span className="w-4 text-center font-black text-slate-800 dark:text-slate-200 text-xs">
                        {currentCount}
                      </span>
                      <button
                        onClick={() => {
                          setTargetCounts(prev => ({
                            ...prev,
                            [zone.id]: Math.min(10, currentCount + 1)
                          }));
                        }}
                        className="w-5 h-5 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 active:scale-95 text-slate-500 font-extrabold transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-indigo-100/50 dark:border-indigo-950/40">
              <button
                onClick={() => generateItemsFromTargets(false)}
                className="py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-sm text-center"
                title="Skapa figurer och lägg i skattkistan"
              >
                I skattkistan
              </button>
              <button
                onClick={() => generateItemsFromTargets(true)}
                className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-sm text-center"
                title="Placera figurer direkt i lådorna"
              >
                Direkt i rutorna
              </button>
            </div>
          </div>
        )}

        <hr className="border-slate-100 dark:border-slate-900" />

        {/* Criteria selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Välj Sorteringskriterier</label>
          <div className="flex flex-col gap-1">
            {[
              { id: 'COLOR', label: 'Färg (Röd / Gul / Grön / Blå)', icon: Icons.Paintbrush },
              { id: 'SHAPE', label: 'Geometri (Cirkel/Square/Triangel)', icon: Icons.Shapes },
              { id: 'SIZE', label: 'Storlek (Liten / Mellan / Stor)', icon: Icons.Maximize },
              { id: 'DOTS', label: 'Antal (1-5 Tärningsprickar)', icon: Icons.Coins },
              { id: 'CUSTOM', label: 'Eget Sorteringssätt (Anpassat)', icon: Icons.Pencil }
            ].map((critOption) => (
              <button
                key={critOption.id}
                onClick={() => setCriterion(critOption.id as SortCriterionType)}
                className={`py-2 px-3 text-left rounded-xl border text-[11px] font-black flex items-center gap-2 transition ${
                  criterion === critOption.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                    : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <critOption.icon size={13} />
                <span>{critOption.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom categories inputs (displays if criterion is CUSTOM) */}
        {criterion === 'CUSTOM' && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 flex flex-col gap-2">
            <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block">Skriv dina egna boxetiketter:</span>
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
                className="w-full text-[11px] font-extrabold uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl px-2.5 text-indigo-755 focus:outline-none focus:border-indigo-500"
                placeholder={`Mottagare ${idx + 1}`}
              />
            ))}
          </div>
        )}

        <hr className="border-slate-100 dark:border-slate-900" />

        {/* Visual appearance skins toggles (wooden crates, math overlapping rings, horizontal shelves) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">Mottagare Utseende</label>
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
                    : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50'
                }`}
              >
                <skin.icon size={13} />
                <span>{skin.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick actions well */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-900 grid grid-cols-1 gap-2">
          <button
            onClick={() => {
              // Resets entire play state
              setItems(prev => prev.map(i => ({ ...i, zoneId: null })));
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-150 text-slate-600 dark:bg-slate-900 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
          >
            <Icons.Trash size={12} />
            <span>Töm alla zoner</span>
          </button>
        </div>

      </div>

      {/* DETAILED DISCUSSION guessing overlay for students */}
      {showGuessModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-sm rounded-[32px] p-6 border border-slate-150 dark:border-slate-850 shadow-2xl relative select-none animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowGuessModal(false)}
              className="absolute top-5 right-5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 p-1.5 rounded-full"
            >
              <Icons.X size={16} />
            </button>

            <div className="text-center flex flex-col items-center gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-full">
                <Icons.Brain size={28} />
              </div>
              <h2 className="text-[15px] font-black uppercase tracking-tight text-slate-800 dark:text-slate-100">
                Gissa min sortering! 🕵️‍♂️
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Titta på figurerna som kompisen har placerat i lådorna. Kan du lista ut vad som gör att röd form, stor triangel eller pricka-kort hamnat i samma låda?
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-2xl w-full border border-slate-150 dark:border-slate-850 mt-2">
                <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block mb-1">Dolt kompis-kriterium:</span>
                {revealedSecretBasis ? (
                  <div className="text-left py-1">
                    <p className="text-xs font-black text-indigo-650 dark:text-indigo-400 uppercase">
                      💡 {criterion === 'COLOR' && 'Färg (Röda, Blåa, Gröna, Gula)'}
                      {criterion === 'SHAPE' && 'Form (Cirklar/Klot, Kvadrater/Kuber, Trianglar)'}
                      {criterion === 'SIZE' && 'Storlek (Liten, Mellan, Stor)'}
                      {criterion === 'DOTS' && 'Antal (Små eller stora pricksammansättningar)'}
                      {criterion === 'CUSTOM' && `Eget Sorteringssätt: ${customLabels.join(' / ')}`}
                    </p>
                    <div className="mt-2 grid grid-cols-1 gap-1 border-t border-slate-200 dark:border-slate-800 pt-2 text-[10px] font-semibold text-slate-500">
                      {activeZones.map(z => {
                        const cnt = items.filter(i => i.zoneId === z.id).length;
                        return <div key={z.id}>• {z.label}: {cnt} st figurer placerade.</div>;
                      })}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 italic block py-4">
                    Kriteriet är dolt för klassen...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 w-full mt-4">
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
