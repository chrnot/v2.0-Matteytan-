import React, { useState, useEffect } from 'react';
import { Icons } from '../icons';

interface CentikubBoxWidgetProps {
  isTransparent?: boolean;
}

// Interactive palette color descriptors
interface CubeColor {
  id: string;
  name: string;
  left: string;
  top: string;
  rightColor: string;
  stroke: string;
  plugTop: string;
}

const CUBE_COLORS: Record<string, CubeColor> = {
  red: {
    id: 'red',
    name: 'Röd',
    left: '#ef4444',
    top: '#fca5a5',
    rightColor: '#dc2626',
    stroke: '#991b1b',
    plugTop: '#fee2e2',
  },
  blue: {
    id: 'blue',
    name: 'Blå',
    left: '#3b82f6',
    top: '#93c5fd',
    rightColor: '#2563eb',
    stroke: '#1e3a8a',
    plugTop: '#dbeafe',
  },
  green: {
    id: 'green',
    name: 'Grön',
    left: '#10b981',
    top: '#6ee7b7',
    rightColor: '#059669',
    stroke: '#064e3b',
    plugTop: '#d1fae5',
  },
  yellow: {
    id: 'yellow',
    name: 'Gul',
    left: '#eab308',
    top: '#fef08a',
    rightColor: '#ca8a04',
    stroke: '#713f12',
    plugTop: '#fef9c3',
  },
  purple: {
    id: 'purple',
    name: 'Lila',
    left: '#a855f7',
    top: '#c084fc',
    rightColor: '#9333ea',
    stroke: '#581c87',
    plugTop: '#f3e8ff',
  },
};

const COLOR_KEYS = ['red', 'blue', 'green', 'yellow', 'purple'];

interface Challenge {
  id: number;
  title: string;
  description: string;
  instruction: string;
  evaluate: (grid: string[][][]) => { success: boolean; progressStr: string };
  renderGuide?: () => React.ReactNode;
}

export const CentikubBoxWidget: React.FC<CentikubBoxWidgetProps> = () => {
  // 10x10 empty grid of columns of cubes
  const [grid, setGrid] = useState<string[][][]>(() =>
    Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => []))
  );

  const [activeColor, setActiveColor] = useState<string>('red');
  const [tool, setTool] = useState<'ADD' | 'ERASER'>('ADD');
  
  // Toggles ("Ögons")
  const [showCounts, setShowCounts] = useState<boolean>(true);
  const [xRayView, setXRayView] = useState<boolean>(false);
  const [symmetryActive, setSymmetryActive] = useState<boolean>(false);

  // Active Challenge
  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number | null>(null);
  const [challengeSuccess, setChallengeSuccess] = useState<boolean>(false);
  const [challengeProgress, setChallengeProgress] = useState<string>('');
  const [showInfo, setShowInfo] = useState<boolean>(false);

  // Plate / Grid size (dynamic scaling lets squares be larger when grid is smaller)
  const [gridSize, setGridSize] = useState<number>(8);

  // Compute stats within active grid size bounds
  const totalCubes = grid.reduce(
    (acc, col, cIdx) => {
      if (cIdx >= gridSize) return acc;
      return acc + col.reduce((sum, stack, rIdx) => {
        if (rIdx >= gridSize) return sum;
        return sum + stack.length;
      }, 0);
    },
    0
  );

  // 3D Isometric Viewport Constants - scaled up significantly to make cubes and surface look bigger and easier to tap!
  const scale = gridSize === 6 ? 58 : gridSize === 8 ? 46 : 37;
  const centerX = 400;
  const centerY = gridSize === 6 ? 195 : gridSize === 8 ? 225 : 250;
  const dx = scale * 1.0;
  const dy = scale * 0.52;
  const cubeHeight = Math.round(scale * 0.86);
  const pegHeight = Math.round(scale * 0.23);

  // Mirror symmetric column helper
  const getMirrorCol = (col: number) => gridSize - 1 - col;

  // Clear Grid
  const resetGrid = () => {
    setGrid(Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => [])));
    setChallengeSuccess(false);
  };

  // Modify individual column values
  const handleCellClick = (col: number, row: number, e: React.MouseEvent) => {
    if (col >= gridSize || row >= gridSize) return;
    
    // Stop propagation to prevent touch bubble loops
    e.stopPropagation();
    
    // If user shifts-clicks, act as eraser
    const activeTool = e.shiftKey ? 'ERASER' : tool;
    const newGrid = grid.map((cCols) => cCols.map((stack) => [...stack]));

    if (activeTool === 'ADD') {
      if (newGrid[col][row].length < 10) {
        newGrid[col][row].push(activeColor);

        // Apply symmetry if toggled on
        if (symmetryActive) {
          const mirrorCol = getMirrorCol(col);
          newGrid[mirrorCol][row] = [...newGrid[col][row]];
        }
        setGrid(newGrid);
      }
    } else {
      // ERASER mode
      if (newGrid[col][row].length > 0) {
        newGrid[col][row].pop();

        if (symmetryActive) {
          const mirrorCol = getMirrorCol(col);
          newGrid[mirrorCol][row] = [...newGrid[col][row]];
        }
        setGrid(newGrid);
      }
    }
  };

  // Evaluation on every grid change
  useEffect(() => {
    if (activeChallengeIdx !== null) {
      const challenge = CHALLENGES[activeChallengeIdx];
      const result = challenge.evaluate(grid);
      setChallengeSuccess(result.success);
      setChallengeProgress(result.progressStr);
    }
  }, [grid, activeChallengeIdx]);

  // Handle auto-adjusting plate sizes for challenges (e.g. copying challenge needs 10x10)
  useEffect(() => {
    if (activeChallengeIdx === 2) {
      setGridSize(10);
    }
  }, [activeChallengeIdx]);

  // Handle symmetry side effect of turning on symmetry: mirror existing content left-to-right
  useEffect(() => {
    if (symmetryActive) {
      // Mirror columns over middle division line
      const newGrid = grid.map((cCols) => cCols.map((stack) => [...stack]));
      const half = Math.floor(gridSize / 2);
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < half; c++) {
          const mirrorCol = getMirrorCol(c);
          if (mirrorCol >= 0 && mirrorCol < 10) {
            newGrid[mirrorCol][r] = [...newGrid[c][r]];
          }
        }
      }
      setGrid(newGrid);
    }
  }, [symmetryActive, gridSize]);

  // Challenges Definition
  const CHALLENGES: Challenge[] = [
    {
      id: 0,
      title: 'Bygg talet 12',
      description: 'Didaktisk poäng: Kopplar det laborativa byggandet till ett abstrakt talvärde.',
      instruction: 'Bygg fritt staplar på rutnätet tills din antals-räknare visar att du har använt exakt 12 centikuber totalt!',
      evaluate: (testGrid) => {
        const count = testGrid.reduce(
          (acc, col) => acc + col.reduce((sum, stack) => sum + stack.length, 0),
          0
        );
        return {
          success: count === 12,
          progressStr: `Du har använt ${count} kuber (mål: 12)`,
        };
      },
      renderGuide: () => (
        <div className="flex gap-1.5 justify-center items-end h-16 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl mt-2 border border-slate-100 dark:border-slate-800">
          <div className="w-4 h-6 bg-red-500 rounded-sm shadow-sm flex items-center justify-center text-[8px] font-black text-white">4</div>
          <div className="w-4 h-9 bg-blue-500 rounded-sm shadow-sm flex items-center justify-center text-[8px] font-black text-white">6</div>
          <div className="w-4 h-3 bg-yellow-400 rounded-sm shadow-sm flex items-center justify-center text-[8px] font-black text-white">2</div>
          <span className="text-[10px] font-bold text-slate-500 ml-2">Total = 12</span>
        </div>
      ),
    },
    {
      id: 1,
      title: 'Bygg trappan',
      description: 'Didaktisk poäng: Synliggör talserier, ökande värde och algebraisk ordning.',
      instruction: 'Bygg minst tre staplar bredvid varandra (vågrätt eller lodrätt) där varje stapel är exakt 1 kub högre än den föregående (t.ex. 1, 2, 3 kuber höga).',
      evaluate: (testGrid) => {
        let maxChain = 0;
        let chainFound = false;

        // Horisontell sökning
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 8; c++) {
            const h1 = testGrid[c][r].length;
            const h2 = testGrid[c + 1][r].length;
            const h3 = testGrid[c + 2][r].length;
            if (h1 >= 1 && h2 === h1 + 1 && h3 === h2 + 1) {
              chainFound = true;
              maxChain = Math.max(maxChain, 3);
            }
          }
        }

        // Vertikal sökning
        for (let c = 0; c < 10; c++) {
          for (let r = 0; r < 8; r++) {
            const h1 = testGrid[c][r].length;
            const h2 = testGrid[c][r + 1].length;
            const h3 = testGrid[c][r + 2].length;
            if (h1 >= 1 && h2 === h1 + 1 && h3 === h2 + 1) {
              chainFound = true;
              maxChain = Math.max(maxChain, 3);
            }
          }
        }

        return {
          success: chainFound,
          progressStr: chainFound 
            ? 'Superfint! Du har byggt en trappa!' 
            : 'Ingen tillräckligt stor ökande trappa hittades ännu.',
        };
      },
      renderGuide: () => (
        <div className="flex gap-2 justify-center items-end h-16 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl mt-2 border border-slate-100 dark:border-slate-800">
          <div className="w-3" style={{ height: '14px', backgroundColor: '#ef4444', borderRadius: '2px' }} />
          <div className="w-3" style={{ height: '28px', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
          <div className="w-3" style={{ height: '42px', backgroundColor: '#10b981', borderRadius: '2px' }} />
          <span className="text-[10px] font-bold text-slate-500 ml-2">1, 2, 3 trappa!</span>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Kopiera ritningen',
      description: 'Didaktisk poäng: Tränar rumsförståelse och att tolka plana 2D-skisser som 3D-kuber.',
      instruction: 'Bygg en exakt kopia av det mönster som visas nedan. Röntgensyn (2D-öga) kan hjälpa dig att se exakt hur det ska ligga i rutnätet.',
      evaluate: (testGrid) => {
        // Enkel symmetric cross-mallen centrerad i mitten på rad/kol 3, 4, 5
        const target: Record<string, number> = {
          '4,3': 1,
          '3,4': 1,
          '4,4': 3,
          '5,4': 1,
          '4,5': 1,
        };

        let matches = true;
        // Kolla alla 100 celler
        for (let c = 0; c < 10; c++) {
          for (let r = 0; r < 10; r++) {
            const currentH = testGrid[c][r].length;
            const key = `${c},${r}`;
            const expectedH = target[key] || 0;
            if (currentH !== expectedH) {
              matches = false;
            }
          }
        }

        // Räkna antal korrekta celler i regionen för att rapportera framsteg
        let correctCells = 0;
        const totalCheckedKeys = ['4,3', '3,4', '4,4', '5,4', '4,5'];
        totalCheckedKeys.forEach((key) => {
          const [c, r] = key.split(',').map(Number);
          if (testGrid[c][r].length === target[key]) {
            correctCells++;
          }
        });

        return {
          success: matches,
          progressStr: matches 
            ? 'Perfekt! Du har byggt exakt som ritningen!' 
            : `Staplar i rätt höjd: ${correctCells} av 5 (och inga andra staplar tillåtna).`,
        };
      },
      renderGuide: () => {
        // Render target mini 2D-planskiss
        const targetMini = [
          [0, 0, 1, 0, 0],
          [0, 1, 3, 1, 0],
          [0, 0, 1, 0, 0],
        ];
        return (
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 mt-2">
            <span className="text-[8px] font-black uppercase text-indigo-500 mb-1">Målritning (Mitten av rutnätet)</span>
            <div className="grid grid-cols-5 gap-1">
              {targetMini.map((row, rIdx) =>
                row.map((val, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`w-5 h-5 flex items-center justify-center text-[10px] font-black rounded border ${
                      val > 0
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700 font-black'
                        : 'bg-slate-200/50 border-slate-100 text-transparent'
                    }`}
                  >
                    {val || ''}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full h-full flex flex-col gap-4 select-none relative uppercase-labels">
      
      {/* Upper Panel: Description and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[var(--surface-secondary)]/30 backdrop-blur rounded-2xl border border-[var(--sidebar-border)] shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <Icons.Cube size={24} />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>Centikub-Lådan</span>
              <span className="px-2 py-0.5 text-[9px] bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 rounded-full font-black uppercase tracking-wider">Taktil matte</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Bygg, stapla och upptäck mönster, symmetri och planskisser!
            </p>
          </div>
        </div>

        {/* Info button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2.5 rounded-xl transition-all shadow-sm ${
              showInfo ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
            }`}
            title="Visa instruktioner"
          >
            <Icons.Info size={18} />
          </button>
        </div>
      </div>

      {/* Info help panel if clicked */}
      {showInfo && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl text-left animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-black text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="text-base">📌</span> Hur man arbetar i Centikub-Lådan
            </h4>
            <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
              <span className="font-bold text-blue-600 dark:text-blue-400 text-[10px] uppercase block mb-1">Klicka & Stapla:</span>
              Välj en färg i bottenlådan. Klicka sedan på rutnätet för att placera din första kub. Klicka på samma kolumn för att bygga på höjden!
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
              <span className="font-bold text-amber-600 dark:text-amber-400 text-[10px] uppercase block mb-1">Röntgensyn (2D-ritning):</span>
              Slå på Röntgen-ögat för att se figuren rakt uppifrån. Siffran i varje kvadrat talar om höjden. Det är precis som en riktig arkitektritning!
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
              <span className="font-bold text-purple-600 dark:text-purple-400 text-[10px] uppercase block mb-1">Mönster-spegel (Saccel):</span>
              Sätt på Spegel-ögat för att se röda linjen. När du bygger på ena sidan speglas det direkt till andra sidan. Utmärkt för att skapa fantastiska symmetriska byggen!
            </div>
          </div>
          <p className="text-[10px] border-t border-slate-100 dark:border-slate-800 pt-2 text-slate-400 text-center leading-normal">
            💡 <strong>TIPS:</strong> Håll ner <strong>SHIFT-tangenten</strong> och klicka på en kolumn för att sudda/ta bort en kub snabbt utan att behöva byta verktyg!
          </p>
        </div>
      )}

      {/* Main Split Interface Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        
        {/* Workspace Card (Isometric 3D SVG or Top down planskiss) */}
        <div className="flex-1 min-h-[380px] bg-slate-100 dark:bg-slate-950/80 rounded-3xl border border-slate-200 dark:border-slate-800 relative flex flex-col overflow-hidden items-center justify-center p-2 group shadow-inner">
          
          {/* Header Indicators for height counters */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
            <div className="px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-md">
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">Insamlade Kuber:</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">{totalCubes} st</span>
            </div>
          </div>

          {/* Core Interactive "Ögon" & Tool Toggles in top center */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            
            {/* Sudda / Erase mode toggle */}
            <button
              onClick={() => setTool(tool === 'ERASER' ? 'ADD' : 'ERASER')}
              className={`p-2.5 rounded-xl flex items-center gap-1.5 transition-all text-[11px] font-black uppercase tracking-wider border shadow-md hover:scale-105 active:scale-95 ${
                tool === 'ERASER'
                  ? 'bg-rose-600 border-rose-600 text-white ring-4 ring-rose-500/10'
                  : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-600 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-900'
              }`}
              title="Aktivera suddgummi-läge"
            >
              <Icons.Eraser size={15} />
              <span className="hidden sm:inline">Sudd</span>
            </button>

            {/* Counts toggles */}
            <button
              onClick={() => setShowCounts(!showCounts)}
              className={`p-2.5 rounded-xl flex items-center gap-1.5 transition-all text-[11px] font-black uppercase tracking-wider border shadow-md hover:scale-105 active:scale-95 ${
                showCounts
                  ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-500/10'
                  : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-600'
              }`}
              title="Visa antals-räknare"
            >
              <Icons.Hash size={15} />
              <span className="hidden sm:inline">Antal</span>
            </button>

            {/* X-ray planskiss toggles */}
            <button
              onClick={() => setXRayView(!xRayView)}
              className={`p-2.5 rounded-xl flex items-center gap-1.5 transition-all text-[11px] font-black uppercase tracking-wider border shadow-md hover:scale-105 active:scale-95 ${
                xRayView
                  ? 'bg-amber-500 border-amber-500 text-white ring-4 ring-amber-500/10'
                  : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-600'
              }`}
              title="Slå på Röntgensyn PLANSKISS"
            >
              <Icons.Sparkles size={15} />
              <span>{xRayView ? '3D-Vy' : 'Röntgen'}</span>
            </button>

            {/* Symmetry Mirror toggles */}
            <button
              onClick={() => setSymmetryActive(!symmetryActive)}
              className={`p-2.5 rounded-xl flex items-center gap-1.5 transition-all text-[11px] font-black uppercase tracking-wider border shadow-md hover:scale-105 active:scale-95 ${
                symmetryActive
                  ? 'bg-purple-600 border-purple-600 text-white ring-4 ring-purple-500/10'
                  : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:text-slate-600'
              }`}
              title="Slå på symmetri-spegel"
            >
              <Icons.Reset size={15} />
              <span className="hidden sm:inline">Spegel</span>
            </button>
          </div>

          {/* RENDER VIEW: 2D Planskiss "Röntgensyn" */}
          {xRayView ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8 animate-in fade-in duration-300">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-200/50 dark:bg-slate-900/50 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                🔍 Röntgentyplanskiss (2D-Vy ovanifrån)
              </span>

              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl relative">
                {/* Symmetry mirroring helper lines */}
                {symmetryActive && (
                  <div className="absolute top-0 bottom-0 left-1/2 -ml-[2px] w-[3px] border-l-2 border-dashed border-red-500 z-10 pointer-events-none" />
                )}

                <div 
                  className="grid gap-1.5 w-[280px] sm:w-[360px] h-[280px] sm:h-[360px]"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: gridSize }).map((_, r) =>
                    Array.from({ length: gridSize }).map((_, c) => {
                      const stack = grid[c][r];
                      const depth = stack.length;
                      const topColorId = depth > 0 ? stack[depth - 1] : '';
                      const rgb = CUBE_COLORS[topColorId];

                      return (
                        <button
                          key={`${c}-${r}`}
                          onClick={(e) => handleCellClick(c, r, e)}
                          className={`group/plan relative border rounded transition-all flex items-center justify-center font-black ${
                            depth > 0
                              ? 'border-slate-300 dark:border-slate-700 active:scale-95 shadow-sm'
                              : `border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 ${
                                  tool === 'ERASER' 
                                    ? 'hover:bg-rose-100/60 dark:hover:bg-rose-950/30' 
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-900'
                                }`
                          }`}
                          style={{
                            backgroundColor: depth > 0 ? rgb.left : undefined,
                            color: depth > 0 ? '#ffffff' : undefined,
                            boxShadow: depth > 0 ? `inset 0 2px 4px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.15)` : undefined,
                          }}
                        >
                          <span className={`text-[11px] sm:text-sm font-black leading-none drop-shadow-md`}>
                            {depth > 0 ? depth : ''}
                          </span>
                          
                          {/* Tooltip highlighting location */}
                          <div className="absolute hidden group-hover/plan:block bottom-full left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] rounded px-1 py-0.5 z-20 whitespace-nowrap mb-1">
                            X:{c + 1} Y:{r + 1}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-medium">Klicka på en ruta för att ändra höjden directly i ritningen!</span>
            </div>
          ) : (
            /* RENDER VIEW: 3D Isometric Projection */
            <div className="w-full h-full flex items-center justify-center min-h-[440px] relative overflow-hidden animate-in fade-in duration-300">
              
              <svg
                viewBox="0 0 800 620"
                className="w-full h-full cursor-pointer overflow-visible drop-shadow-sm select-none"
              >
                {/* Native SVG empty placeholder group - cannot catch/block clicks because child text/shape has pointer-events-none */}
                {totalCubes === 0 && (
                  <g className="pointer-events-none select-none">
                    <text x={400} y={centerY + 50} textAnchor="middle" fontSize={42} className="opacity-80">📦</text>
                    <text x={400} y={centerY + 95} textAnchor="middle" fontSize={14} fontWeight="900" className="fill-slate-400 dark:fill-slate-500 uppercase tracking-widest">
                      Centikub-lådan är tom
                    </text>
                    <text x={400} y={centerY + 115} textAnchor="middle" fontSize={11} fontWeight="700" className="fill-slate-400 dark:fill-slate-500 uppercase tracking-wider">
                      Klicka på rutnätet för att bygga!
                    </text>
                  </g>
                )}

                {/* 1. Base grid rendering (Painter's algorithm back-to-front rendering col-by-col, row-by-row) */}
                {Array.from({ length: gridSize }).map((_, r) =>
                  Array.from({ length: gridSize }).map((_, c) => {
                    // Cell center coordinate
                    const cx = centerX + (c - r) * dx;
                    const cy = centerY + (c + r) * dy;

                    // Base grid tile points
                    const pTop = `${cx},${cy - dy}`;
                    const pRight = `${cx + dx},${cy}`;
                    const pBottom = `${cx},${cy + dy}`;
                    const pLeft = `${cx - dx},${cy}`;
                    const pointsStr = `${pTop} ${pRight} ${pBottom} ${pLeft}`;

                    return (
                      <g key={`tile-${c}-${r}`}>
                        {/* Floor polygon - uses standard onClick for reliable multi-platform input */}
                        <polygon
                          points={pointsStr}
                          onClick={(e) => handleCellClick(c, r, e)}
                          stroke="currentColor"
                          strokeWidth={0.8}
                          style={{
                            fillOpacity: 0.82,
                            pointerEvents: 'auto',
                          }}
                          // Use a theme responsive light border stroke
                          className={`transition-colors duration-200 fill-white dark:fill-slate-900 border stroke-slate-200 dark:stroke-slate-800 cursor-pointer ${
                            tool === 'ERASER'
                              ? 'hover:fill-rose-100/60 dark:hover:fill-rose-950/30'
                              : 'hover:fill-blue-50 dark:hover:fill-blue-900/10'
                          }`}
                        />
                      </g>
                    );
                  })
                )}

                {/* 2. Red Dashed Symmetrilinje divider */}
                {symmetryActive && (() => {
                  // The plane is between c=half-0.5 and c=half+0.5
                  const half = gridSize / 2 - 0.5;
                  const startX = centerX + (half - (-1)) * dx;
                  const startY = centerY + (half + (-1)) * dy;
                  
                  const endX = centerX + (half - gridSize) * dx;
                  const endY = centerY + (half + gridSize) * dy;

                  return (
                    <g className="pointer-events-none z-30">
                      <line
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        strokeDasharray="6 4"
                      />
                      {/* Symmetrilinje Text Badge */}
                      <rect
                        x={centerX - 45}
                        y={centerY - 35}
                        width={90}
                        height={18}
                        rx={9}
                        fill="#ef4444"
                        className="shadow-sm"
                      />
                      <text
                        x={centerX}
                        y={centerY - 23}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={8}
                        fontWeight="black"
                        letterSpacing="1"
                      >
                        SYMMETRILINJE
                      </text>
                    </g>
                  );
                })()}

                {/* 3. Render Stacked Cubes & Stack counts in back-to-front order */}
                {Array.from({ length: gridSize }).map((_, r) =>
                  Array.from({ length: gridSize }).map((_, c) => {
                    const stack = grid[c][r];
                    const cx = centerX + (c - r) * dx;
                    const cy = centerY + (c + r) * dy;

                    return (
                      <g key={`stack-${c}-${r}`} onClick={(e) => handleCellClick(c, r, e)}>
                        {stack.map((colorId, lvl) => {
                          const config = CUBE_COLORS[colorId] || CUBE_COLORS.red;
                          const heightOffset = lvl * cubeHeight; // tactile height vertical distance
                          const top_y = cy - heightOffset - cubeHeight;
                          const base_y = cy - heightOffset;

                          // Render individual faces of an isometric cube representation
                          return (
                            <g key={`cube-${lvl}`} className="hover:filter hover:brightness-105 active:scale-95 transition-all">
                              {/* Left face */}
                              <polygon
                                points={`${cx - dx},${top_y} ${cx},${top_y + dy} ${cx},${base_y + dy} ${cx - dx},${base_y}`}
                                fill={config.left}
                                stroke={config.stroke}
                                strokeWidth={0.5}
                                strokeLinejoin="round"
                              />

                              {/* Right face */}
                              <polygon
                                points={`${cx},${top_y + dy} ${cx + dx},${top_y} ${cx + dx},${base_y} ${cx},${base_y + dy}`}
                                fill={config.rightColor}
                                stroke={config.stroke}
                                strokeWidth={0.5}
                                strokeLinejoin="round"
                              />

                              {/* Top face */}
                              <polygon
                                points={`${cx},${top_y - dy} ${cx + dx},${top_y} ${cx},${top_y + dy} ${cx - dx},${top_y}`}
                                fill={config.top}
                                stroke={config.stroke}
                                strokeWidth={0.5}
                                strokeLinejoin="round"
                              />

                              {/* Centicube Connecting Peg / Joint plug on the top face */}
                              <g>
                                {/* Vertical connection peg sides */}
                                <path
                                  d={`
                                    M ${cx - dx * 0.28}, ${top_y - dy * 0.4 - pegHeight}
                                    L ${cx - dx * 0.28}, ${top_y - dy * 0.4}
                                    A ${dx * 0.28} ${dy * 0.28} 0 0 0 ${cx + dx * 0.28}, ${top_y - dy * 0.4}
                                    L ${cx + dx * 0.28}, ${top_y - dy * 0.4 - pegHeight}
                                    Z
                                  `}
                                  fill={config.rightColor}
                                  stroke={config.stroke}
                                  strokeWidth={0.5}
                                />
                                {/* Top cap peg face */}
                                <ellipse
                                  cx={cx}
                                  cy={top_y - dy * 0.4 - pegHeight}
                                  rx={dx * 0.28}
                                  ry={dy * 0.28}
                                  fill={config.plugTop}
                                  stroke={config.stroke}
                                  strokeWidth={0.5}
                                />
                              </g>
                            </g>
                          );
                        })}

                        {/* Stacks height counter tooltip badge floating on top of finished column */}
                        {showCounts && stack.length > 0 && (() => {
                          const top_y = cy - stack.length * cubeHeight - (cubeHeight - 1);
                          return (
                            <g className="pointer-events-none animate-in zoom-in duration-200">
                              {/* Badge Circle */}
                              <circle
                                cx={cx}
                                cy={top_y}
                                r={10}
                                fill="#1e293b"
                                stroke="#ffffff"
                                strokeWidth={1}
                              />
                              <text
                                x={cx}
                                y={top_y + 3}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize={9}
                                fontWeight="black"
                              >
                                {stack.length}
                              </text>
                            </g>
                          );
                        })()}
                      </g>
                    );
                  })
                )}
              </svg>
            </div>
          )}
        </div>

        {/* Right Sidebar Control Workspace */}
        <div className="w-full lg:w-72 flex flex-col gap-4 bg-[var(--surface-primary)] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-y-auto shrink-0 select-none">
          
          {/* Section A: Plattans storlek */}
          <div>
            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center justify-between">
              <span>Plattans storlek</span>
              <span className="text-[9px] font-bold text-indigo-500">Större rutor!</span>
            </h2>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-black">
              {[6, 8, 10].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setGridSize(size);
                    // Filter/clean up the grid to fit the new size bounds so counts are accurate
                    setGrid((prev) => {
                      return prev.map((col, cIdx) => 
                        col.map((stack, rIdx) => {
                          if (cIdx >= size || rIdx >= size) {
                            return [];
                          }
                          return stack;
                        })
                      );
                    });
                    setChallengeSuccess(false);
                  }}
                  className={`py-2 px-1 rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all ${
                    gridSize === size
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                      : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50/50'
                  }`}
                >
                  <span className="text-[13px] font-black">{size}×{size}</span>
                  <span className="text-[8px] font-normal tracking-tight text-slate-400">
                    {size === 6 ? 'Stora' : size === 8 ? 'Mellan' : 'Original'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section B: Selected tool mode (Add / Eraser) */}
          <div>
            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">Arbetsläge</h2>
            <div className="grid grid-cols-2 gap-2 text-xs font-black">
              <button
                onClick={() => setTool('ADD')}
                className={`py-2 px-3 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${
                  tool === 'ADD'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                    : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Icons.Pencil size={15} />
                <span>PLOCKA</span>
              </button>

              <button
                onClick={() => setTool('ERASER')}
                className={`py-2 px-3 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${
                  tool === 'ERASER'
                    ? 'bg-rose-50 border-rose-600 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                    : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Icons.Eraser size={15} />
                <span>SUDDA</span>
              </button>
            </div>
          </div>

          {/* Section B: Dynamic Color Box Drawer representing actual Centicube options */}
          {tool === 'ADD' && (
            <div className="animate-in fade-in duration-200">
              <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Välj Kubfärg</h2>
              <div className="flex flex-wrap gap-2.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                {COLOR_KEYS.map((key) => {
                  const cfg = CUBE_COLORS[key];
                  const isActive = activeColor === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveColor(key)}
                      className={`w-10 h-10 rounded-xl relative transition-all flex items-center justify-center shadow-sm ${
                        isActive ? 'ring-4 ring-blue-500/20 scale-110 border-2 border-white' : 'hover:scale-105 active:scale-95 border border-transparent'
                      }`}
                      style={{
                        backgroundColor: cfg.left,
                      }}
                      title={cfg.name}
                    >
                      {/* Tactile light top slice preview inside the drawer buttons */}
                      <div
                        className="absolute inset-x-0 top-0 h-3 rounded-t-xl opacity-30"
                        style={{ backgroundColor: cfg.top }}
                      />
                      
                      {/* Symmetri check status */}
                      {isActive && (
                        <div className="text-white drop-shadow-md">
                          <Icons.Check size={16} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section C: Gamified didactical challenge flows */}
          <div className="flex-1 flex flex-col gap-2.5">
            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <span>🎯 Matematik-Utmaningar</span>
            </h2>

            {/* Carousel navigation list */}
            <div className="flex flex-col gap-2">
              {CHALLENGES.map((ch, idx) => {
                const isActive = activeChallengeIdx === idx;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      if (activeChallengeIdx === idx) {
                        setActiveChallengeIdx(null); // click again to exit
                      } else {
                        setActiveChallengeIdx(idx);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-2xl border-2 transition-all flex flex-col gap-1 relative ${
                      isActive
                        ? 'bg-indigo-50/50 border-indigo-600 dark:bg-indigo-950/20 text-slate-800 dark:text-slate-100 shadow-md ring-4 ring-indigo-500/10'
                        : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black uppercase tracking-tight text-indigo-600 dark:text-indigo-400">
                        {idx + 1}. {ch.title}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 lowercase italic line-clamp-2 leading-tight">
                      {ch.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active challenge focus panel */}
            {activeChallengeIdx !== null && (() => {
              const ch = CHALLENGES[activeChallengeIdx];
              return (
                <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900/60 dark:to-slate-900/40 rounded-2xl border-2 border-indigo-200 dark:border-indigo-950 shadow-sm animate-in zoom-in-95 duration-200 mt-2">
                  <h3 className="text-[11px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span>Active:</span>
                    <span>{ch.title}</span>
                  </h3>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {ch.instruction}
                  </p>

                  {/* Render task guides/illustrations if applicable */}
                  {ch.renderGuide && ch.renderGuide()}

                  {/* Evaluation output display */}
                  <div className="mt-3 p-2 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Status:</span>
                      <span className={`text-[10px] font-bold ${challengeSuccess ? 'text-green-600 dark:text-green-400' : 'text-amber-600'}`}>
                        {challengeProgress}
                      </span>
                    </div>

                    {/* Check / Celebrancy Badge */}
                    {challengeSuccess ? (
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 flex items-center justify-center animate-bounce shadow">
                        <Icons.Trophy size={16} />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-amber-50 dark:bg-slate-900 text-amber-500 flex items-center justify-center animate-pulse">
                        <Icons.Sparkles size={12} />
                      </div>
                    )}
                  </div>

                  {challengeSuccess && (
                    <div className="mt-3 text-center text-[10px] font-black text-green-700 dark:text-green-400 animate-pulse bg-green-50 dark:bg-green-950/40 py-1.5 rounded-lg border border-green-200/40">
                      🎉 Snyggt byggt! Du klarade utmaningen!
                    </div>
                  )}
                </div>
              );
            })()}

          </div>

          {/* Centered reset cleaner action */}
          <button
            onClick={resetGrid}
            className="mt-2 py-2.5 px-4 w-full bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 border border-slate-200/30 dark:border-slate-700/30"
          >
            <Icons.Trash size={14} />
            <span>Töm Centikub-Lådan</span>
          </button>

        </div>

      </div>

    </div>
  );
};
