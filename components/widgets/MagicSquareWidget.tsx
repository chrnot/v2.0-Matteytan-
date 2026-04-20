import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Icons } from '../icons';

export const MagicSquareWidget: React.FC = () => {
  const [grid, setGrid] = useState<Array<number | string>>(Array(9).fill(''));
  const [targetSum, setTargetSum] = useState(15);
  const [status, setStatus] = useState<{ row: boolean[]; col: boolean[]; diag: boolean[] }>({
    row: [false, false, false],
    col: [false, false, false],
    diag: [false, false],
  });

  const checkSquare = () => {
    const newRow = [false, false, false];
    const newCol = [false, false, false];
    const newDiag = [false, false];

    // Check rows
    for (let i = 0; i < 3; i++) {
      const sum = Number(grid[i * 3]) + Number(grid[i * 3 + 1]) + Number(grid[i * 3 + 2]);
      if (sum === targetSum && grid[i * 3] !== '' && grid[i * 3 + 1] !== '' && grid[i * 3 + 2] !== '') {
        newRow[i] = true;
      }
    }

    // Check cols
    for (let i = 0; i < 3; i++) {
      const sum = Number(grid[i]) + Number(grid[i + 3]) + Number(grid[i + 6]);
      if (sum === targetSum && grid[i] !== '' && grid[i + 3] !== '' && grid[i + 6] !== '') {
        newCol[i] = true;
      }
    }

    // Check diags
    const d1 = Number(grid[0]) + Number(grid[4]) + Number(grid[8]);
    if (d1 === targetSum && grid[0] !== '' && grid[4] !== '' && grid[8] !== '') newDiag[0] = true;

    const d2 = Number(grid[2]) + Number(grid[4]) + Number(grid[6]);
    if (d2 === targetSum && grid[2] !== '' && grid[4] !== '' && grid[6] !== '') newDiag[1] = true;

    setStatus({ row: newRow, col: newCol, diag: newDiag });
  };

  useEffect(() => {
    checkSquare();
  }, [grid, targetSum]);

  const handleInput = (index: number, val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    const newGrid = [...grid];
    newGrid[index] = num === '' ? '' : parseInt(num);
    setGrid(newGrid);
  };

  const isComplete = status.row.every(v => v) && status.col.every(v => v) && status.diag.every(v => v);

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Magiska Kvadrater</h3>
          <p className="text-xs text-slate-500 font-medium">Hitta mönstret – få alla rader, kolumner och diagonaler att bli {targetSum}!</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Mål:</span>
          <input 
            type="number" 
            className="w-12 text-center font-black text-blue-600 focus:outline-none"
            value={targetSum}
            onChange={(e) => setTargetSum(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <div className="grid grid-cols-3 gap-3 relative">
          {grid.map((val, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <input
                type="text"
                inputMode="numeric"
                className={`w-20 h-20 sm:w-24 sm:h-24 text-center text-3xl font-black rounded-2xl shadow-sm border-2 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                  val === '' ? 'bg-white border-slate-200' : 'bg-white border-blue-200 text-blue-600'
                }`}
                value={val}
                onChange={(e) => handleInput(i, e.target.value)}
              />
            </motion.div>
          ))}

          {/* Row Indicators */}
          {[0, 1, 2].map(i => (
            <div key={`row-${i}`} className={`absolute -right-8 top-[${i * 33.3}%] h-20 sm:h-24 flex items-center transition-colors ${status.row[i] ? 'text-emerald-500' : 'text-slate-200'}`} style={{ top: `${i * 33.3}%` }}>
              <Icons.Check size={20} className={status.row[i] ? 'opacity-100' : 'opacity-20'} />
            </div>
          ))}

          {/* Col Indicators */}
          {[0, 1, 2].map(i => (
            <div key={`col-${i}`} className={`absolute -bottom-8 left-[${i * 33.3}%] w-20 sm:w-24 flex justify-center transition-colors ${status.col[i] ? 'text-emerald-500' : 'text-slate-200'}`} style={{ left: `${i * 33.3}%` }}>
              <Icons.Check size={20} className={status.col[i] ? 'opacity-100' : 'opacity-20'} />
            </div>
          ))}
          
          {/* Diag Indicators */}
          <div className={`absolute -top-8 -left-8 transition-colors ${status.diag[0] ? 'text-emerald-500' : 'text-slate-200'}`}>
            <div className="rotate-45"><Icons.ArrowRight size={20} className={status.diag[0] ? 'opacity-100' : 'opacity-20'} /></div>
          </div>
          <div className={`absolute -top-8 -right-8 transition-colors ${status.diag[1] ? 'text-emerald-500' : 'text-slate-200'}`}>
            <div className="-rotate-45 flex justify-end w-full"><Icons.ArrowLeft size={20} className={status.diag[1] ? 'opacity-100' : 'opacity-20'} /></div>
          </div>
        </div>

        {isComplete && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-emerald-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 animate-bounce">
              <Icons.Trophy size={32} />
              <span className="font-black text-2xl uppercase tracking-tighter">Magiskt!</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
            <Icons.Lightbulb size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900 leading-none mb-1">Mönsterjakt</h4>
            <p className="text-xs text-blue-700/70 font-medium">
              Kan du lista ut vilka siffror som ska vara var för att summan ska bli korrekt i alla led? 
              Prova att ändra målsumman för en större utmaning!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
