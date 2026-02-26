
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Icons } from '../icons';

type Side = 'VL' | 'HL';
type Representation = 'BLOCKS' | 'MATCHSTICKS';
type WidgetTab = 'SCALE' | 'AGENT';
type AgentSubMode = 'MANUAL' | 'AUTO';

interface EquationState {
  vlX: number;
  vlConst: number;
  hlX: number;
  hlConst: number;
}

interface HistoryStep {
    action: string;
    state: EquationState;
}

interface Clue {
    id: string;
    text: string;
    type: 'POSITIVE' | 'NEGATIVE';
}

interface EquationWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

const parseSide = (str: string): { x: number, c: number } | null => {
    const clean = str.replace(/\s+/g, '').toLowerCase().replace(/−/g, '-');
    if (!clean || clean === '0') return { x: 0, c: 0 };
    const terms = clean.split(/(?=[+-])/);
    let x = 0; let c = 0;
    for (let term of terms) {
        if (!term || term === '+') continue;
        if (term.includes('x')) {
            const coefStr = term.replace('x', '');
            if (coefStr === '' || coefStr === '+') x += 1;
            else if (coefStr === '-') x -= 1;
            else {
                const val = parseInt(coefStr);
                if (isNaN(val)) return null;
                x += val;
            }
        } else {
            const val = parseInt(term);
            if (isNaN(val)) return null;
            c += val;
        }
    }
    return { x, c };
};

const formatEquationSide = (x: number, c: number) => {
    if (x === 0 && c === 0) return "0";
    let parts = [];
    if (x !== 0) parts.push(x === 1 ? "x" : x === -1 ? "-x" : `${x}x`);
    if (c !== 0) {
        const sign = c > 0 ? (parts.length > 0 ? " + " : "") : (parts.length > 0 ? " - " : "-");
        parts.push(`${sign}${Math.abs(c)}`);
    }
    return parts.join("");
};

export const EquationWidget: React.FC<EquationWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [activeTab, setActiveTab] = useState<WidgetTab>('SCALE');
  const [showInfo, setShowInfo] = useState(false);
  
  // --- SCALE STATE ---
  const [mode, setMode] = useState<Representation>('MATCHSTICKS');
  const [hiddenX, setHiddenX] = useState(5);
  const [state, setState] = useState<EquationState>({ vlX: 1, vlConst: 2, hlX: 0, hlConst: 7 });
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [bothSidesMode, setBothSidesMode] = useState(false);
  const [inputVL, setInputVL] = useState(formatEquationSide(1, 2));
  const [inputHL, setInputHL] = useState(formatEquationSide(0, 7));
  const isInternalChange = useRef(false);

  // --- AGENT STATE ---
  const [agentSubMode, setAgentSubMode] = useState<AgentSubMode>('AUTO');
  const [secretX, setSecretX] = useState<number | ''>('');
  const [isXSet, setIsXSet] = useState(false);
  const [clues, setClues] = useState<Clue[]>([]);
  const [eliminatedNumbers, setEliminatedNumbers] = useState<Set<number>>(new Set());
  const [isRevealed, setIsRevealed] = useState(false);
  const [manualXInput, setManualXInput] = useState('');
  const [manualClueInput, setManualClueInput] = useState('');

  const generateAutoClue = () => {
      if (typeof secretX !== 'number') return;
      
      const possibleClues: string[] = [];
      
      // Jämnt/udda
      possibleClues.push(secretX % 2 === 0 ? "x är ett jämnt tal" : "x är ett udda tal");
      
      // Större/mindre
      const randomOffset = Math.floor(Math.random() * 20) - 10;
      const compareVal = Math.max(1, Math.min(100, secretX + randomOffset));
      if (compareVal !== secretX) {
          possibleClues.push(secretX > compareVal ? `x är större än ${compareVal}` : `x är mindre än ${compareVal}`);
      }
      
      // Delbarhet
      const divisors = [3, 4, 5, 6, 7, 8, 9, 10].filter(d => secretX % d === 0);
      if (divisors.length > 0) {
          possibleClues.push(`x är delbart med ${divisors[Math.floor(Math.random() * divisors.length)]}`);
      } else {
          const nonDivisors = [3, 4, 5, 6, 7, 8, 9, 10].filter(d => secretX % d !== 0);
          possibleClues.push(`x är INTE delbart med ${nonDivisors[Math.floor(Math.random() * nonDivisors.length)]}`);
      }
      
      // Siffersumma
      const sum = String(secretX).split('').reduce((a, b) => a + parseInt(b), 0);
      possibleClues.push(`Siffersumman av x är ${sum}`);
      
      // Primtal
      const isPrime = (n: number) => {
          if (n <= 1) return false;
          for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
          return true;
      };
      possibleClues.push(isPrime(secretX) ? "x är ett primtal" : "x är ett sammansatt tal (inte ett primtal)");
      
      // Innehåller siffra
      const digits = String(secretX).split('');
      possibleClues.push(`x innehåller siffran ${digits[Math.floor(Math.random() * digits.length)]}`);
      
      // Filter out already given clues
      const existingTexts = clues.map(c => c.text);
      const availableClues = possibleClues.filter(c => !existingTexts.includes(c));
      
      if (availableClues.length > 0) {
          const chosen = availableClues[Math.floor(Math.random() * availableClues.length)];
          setClues(prev => [...prev, { id: Date.now().toString(), text: chosen, type: 'POSITIVE' }]);
      } else {
          setClues(prev => [...prev, { id: Date.now().toString(), text: "Inga fler unika ledtrådar kan genereras just nu.", type: 'POSITIVE' }]);
      }
  };

  const startAutoGame = () => {
      const randX = Math.floor(Math.random() * 100) + 1;
      setSecretX(randX);
      setIsXSet(true);
      setClues([{ id: 'start', text: randX > 50 ? "x är större än 50" : "x är 50 eller mindre", type: 'POSITIVE' }]);
      setEliminatedNumbers(new Set());
      setIsRevealed(false);
  };

  const startManualGame = () => {
      const val = parseInt(manualXInput);
      if (!isNaN(val) && val >= 1 && val <= 100) {
          setSecretX(val);
          setIsXSet(true);
          setClues([]);
          setEliminatedNumbers(new Set());
          setIsRevealed(false);
      }
  };

  const addManualClue = () => {
      if (manualClueInput.trim()) {
          setClues(prev => [...prev, { id: Date.now().toString(), text: manualClueInput.trim(), type: 'POSITIVE' }]);
          setManualClueInput('');
      }
  };

  const resetAgentGame = () => {
      setIsXSet(false);
      setSecretX('');
      setClues([]);
      setEliminatedNumbers(new Set());
      setIsRevealed(false);
      setManualXInput('');
      setManualClueInput('');
  };

  const vlMass = state.vlX * hiddenX + state.vlConst;
  const hlMass = state.hlX * hiddenX + state.hlConst;
  const isBalanced = vlMass === hlMass;
  const isSolved = useMemo(() => {
    if (!isBalanced) return false;
    return (state.vlX === 1 && state.hlX === 0 && state.vlConst === 0) || (state.hlX === 1 && state.vlX === 0 && state.hlConst === 0);
  }, [state, isBalanced]);

  useEffect(() => {
    if (!isInternalChange.current) {
        setInputVL(formatEquationSide(state.vlX, state.vlConst));
        setInputHL(formatEquationSide(state.hlX, state.hlConst));
    }
    isInternalChange.current = false;
  }, [state]);

  const handleInputChange = (side: Side, val: string) => {
    if (side === 'VL') setInputVL(val); else setInputHL(val);
    const parsed = parseSide(val);
    if (parsed) {
        isInternalChange.current = true;
        setState(prev => ({ ...prev, [side === 'VL' ? 'vlX' : 'hlX']: parsed.x, [side === 'VL' ? 'vlConst' : 'hlConst']: parsed.c }));
    }
  };

  const manipulate = (side: Side | 'BOTH', type: 'X' | 'CONST', value: number) => {
      const newState = { ...state };
      const updateSide = (s: Side) => {
          if (type === 'X') {
              if (s === 'VL') newState.vlX = Math.max(0, newState.vlX + value);
              else newState.hlX = Math.max(0, newState.hlX + value);
          } else {
              if (s === 'VL') newState.vlConst = Math.max(0, newState.vlConst + value);
              else newState.hlConst = Math.max(0, newState.hlConst + value);
          }
      };
      let actionLabel = "";
      if (side === 'BOTH' || bothSidesMode) {
          updateSide('VL'); updateSide('HL');
          actionLabel = `Båda ${value > 0 ? '+' : '−'}${Math.abs(value)}${type === 'X' ? 'x' : ''}`;
      } else {
          updateSide(side);
          actionLabel = `${side} ${value > 0 ? '+' : '−'}${Math.abs(value)}${type === 'X' ? 'x' : ''}`;
      }
      setHistory(prev => [{ action: actionLabel, state: { ...state } }, ...prev].slice(0, 8));
      setState(newState);
  };

  const resetScale = (level: number = 1) => {
    const newX = Math.floor(Math.random() * 5) + 3;
    setHiddenX(newX); setHistory([]);
    let newState: EquationState;
    if (level === 1) newState = { vlX: 1, vlConst: 2, hlX: 0, hlConst: newX + 2 };
    else if (level === 2) newState = { vlX: 2, vlConst: 0, hlX: 0, hlConst: newX * 2 };
    else newState = { vlX: 2, vlConst: 3, hlX: 1, hlConst: newX + 3 };
    setState(newState);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden select-none relative">
      
      {/* Info Button */}
      <button 
        onClick={() => setShowInfo(!showInfo)}
        className={`absolute top-0 right-0 p-2 rounded-full transition-all z-[110] ${showInfo ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
      >
        <Icons.Info size={20} />
      </button>

      {/* Info Modal */}
      {showInfo && (
        <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-[120] animate-in fade-in slide-in-from-top-2 duration-300 text-left">
          <div className="flex justify-between items-start mb-3">
             <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Ekvationer</h4>
             <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            {activeTab === 'SCALE' ? (
              <>
                <p>Ekvationsvågen lär dig balansmetoden. För att vågen ska stå i jämvikt måste du göra exakt samma sak på båda sidor.</p>
                <section className="space-y-2">
                  <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>Mål:</strong> Isolera x (asken) på ena sidan så att du ser vad x är värt.</li>
                    <li><strong>Båda sidor:</strong> Aktivera blixt-ikonen ⚡ för att automatiskt dra bort eller lägga till på båda vågskålarna samtidigt.</li>
                    <li><strong>Matte-steg:</strong> Klicka på sifferbrickorna i menyn för att utföra stegen.</li>
                  </ul>
                </section>
              </>
            ) : (
              <>
                <p>Agenten x är en deckarlek för att förstå variabler och logisk slutledning.</p>
                <section className="space-y-2">
                  <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
                  <ul className="space-y-1.5 list-disc pl-4">
                    <li><strong>Uppdrag:</strong> Lista ut vilket tal mellan 1-100 som Agent x gömmer sig bakom.</li>
                    <li><strong>Eliminera:</strong> Allteftersom du får ledtrådar, klicka på talen i tabellen för att stryka över dem som inte stämmer.</li>
                    <li><strong>Ledtrådar:</strong> Datorn ger dig bevis baserat på talets egenskaper (delbarhet, jämnt/udda, storlek).</li>
                  </ul>
                </section>
              </>
            )}
          </div>
        </div>
      )}

      {/* GLOBAL TAB NAVIGATION */}
      <div className="flex bg-slate-100 p-1 shrink-0 border-b border-slate-200 pr-8">
          <button onClick={() => setActiveTab('SCALE')} className={`flex-1 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'SCALE' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><Icons.Scale size={16} /> Ekvationsvågen</button>
          <button onClick={() => setActiveTab('AGENT')} className={`flex-1 py-2.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'AGENT' ? 'bg-white shadow text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}><Icons.Hash size={16} /> Agenten x</button>
      </div>

      {activeTab === 'SCALE' ? (
        <div className="flex-1 flex flex-row overflow-hidden animate-in fade-in duration-300">
            <div className="flex-1 relative flex flex-col items-center justify-between p-4 bg-slate-50/20 overflow-visible min-w-0">
                <div className="w-full flex justify-between items-start">
                    <div className={`px-3 py-1 rounded-lg border font-black uppercase text-[9px] shadow-sm transition-all duration-500 ${isBalanced ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-100 border-rose-200 text-rose-500'}`}>{isBalanced ? 'Jämvikt' : 'Obalans'}</div>
                    {isSolved && <div className="bg-amber-100 border border-amber-400 text-amber-700 px-3 py-1 rounded-xl shadow-lg animate-bounce flex items-center gap-1.5"><span className="text-sm font-black font-mono leading-none">X = {hiddenX}</span><Icons.Sparkles className="text-amber-500" size={12} /></div>}
                </div>
                <div className="w-full max-w-[550px] relative mt-32 mb-10">
                    <div className="w-full h-3 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full relative transition-transform duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) flex shadow-lg z-30" style={{ transform: `rotate(${Math.max(-15, Math.min(15, (vlMass - hlMass) * 1.5))}deg)` }}>
                        <ScalePan side="VL" mass={vlMass} otherMass={hlMass} x={state.vlX} c={state.vlConst} mode={mode} onObjectClick={(t) => manipulate('VL', t, -1)} />
                        <ScalePan side="HL" mass={hlMass} otherMass={vlMass} x={state.hlX} c={state.hlConst} mode={mode} onObjectClick={(t) => manipulate('HL', t, -1)} />
                    </div>
                    <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-5 h-48 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border-x border-slate-400/20 -z-10 rounded-t-full" />
                    <div className="absolute top-[190px] left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-400 rounded-full shadow-md -z-10" />
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl shadow-lg border-2 transition-all duration-500 mb-2 ${isSolved ? 'bg-amber-50 border-amber-400 scale-105' : isBalanced ? 'bg-white border-emerald-400' : 'bg-white border-slate-200'}`}>
                    <input type="text" value={inputVL} onChange={(e) => handleInputChange('VL', e.target.value)} className={`w-32 sm:w-40 text-center bg-transparent border-none outline-none font-mono text-2xl font-black ${isBalanced ? 'text-blue-600' : 'text-slate-500'}`} placeholder="Vänster" />
                    <div className={`text-3xl font-black ${isBalanced ? 'text-emerald-500' : 'text-rose-300'}`}>{isBalanced ? '=' : '≠'}</div>
                    <input type="text" value={inputHL} onChange={(e) => handleInputChange('HL', e.target.value)} className={`w-32 sm:w-40 text-center bg-transparent border-none outline-none font-mono text-2xl font-black ${isBalanced ? 'text-blue-600' : 'text-slate-500'}`} placeholder="Höger" />
                </div>
            </div>
            <div className="w-32 sm:w-40 shrink-0 bg-slate-100 border-l border-slate-200 flex flex-col h-full min-h-0 overflow-y-auto">
                <div className="p-2 border-b border-slate-200 flex flex-col gap-1.5 bg-white">
                    <div className="flex bg-slate-100 p-0.5 rounded-lg">
                        <button onClick={() => setMode('BLOCKS')} className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase transition-all ${mode === 'BLOCKS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-50'}`}>Block</button>
                        <button onClick={() => setMode('MATCHSTICKS')} className={`flex-1 py-1 rounded-md text-[8px] font-black uppercase transition-all ${mode === 'MATCHSTICKS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-50'}`}>Askar</button>
                    </div>
                </div>
                <div className="p-2 bg-slate-900 text-white flex flex-col gap-2 flex-1">
                    <div className="flex justify-between items-center mb-0.5"><span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Matte-steg</span><button onClick={() => setBothSidesMode(!bothSidesMode)} className={`p-1 rounded transition-all ${bothSidesMode ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400' : 'bg-slate-800 text-slate-500'}`}><Icons.Zap size={10} /></button></div>
                    <div className={`flex flex-col gap-0.5 ${bothSidesMode ? 'opacity-20 pointer-events-none' : ''}`}><span className="text-[7px] font-bold text-slate-500 uppercase px-1">Vänster</span><div className="grid grid-cols-2 gap-0.5"><ActionBtn label="+X" onClick={() => manipulate('VL', 'X', 1)} color="blue" /><ActionBtn label="+1" onClick={() => manipulate('VL', 'CONST', 1)} color="emerald" /></div></div>
                    <div className="flex flex-col gap-0.5 py-1.5 border-y border-slate-800"><span className="text-[7px] font-bold text-blue-400 uppercase text-center">Båda sidor</span><div className="grid grid-cols-2 gap-0.5"><ActionBtn label="+X" onClick={() => manipulate('BOTH', 'X', 1)} color="blue" /><ActionBtn label="+1" onClick={() => manipulate('BOTH', 'CONST', 1)} color="emerald" /><ActionBtn label="-X" onClick={() => manipulate('BOTH', 'X', -1)} color="red" /><ActionBtn label="-1" onClick={() => manipulate('BOTH', 'CONST', -1)} color="red" /></div></div>
                    <div className={`flex flex-col gap-0.5 ${bothSidesMode ? 'opacity-20 pointer-events-none' : ''}`}><span className="text-[7px] font-bold text-slate-500 uppercase px-1">Höger</span><div className="grid grid-cols-2 gap-0.5"><ActionBtn label="+X" onClick={() => manipulate('HL', 'X', 1)} color="blue" /><ActionBtn label="+1" onClick={() => manipulate('HL', 'CONST', 1)} color="emerald" /></div></div>
                </div>
            </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
            {!isXSet && (
                <div className="flex flex-col items-center justify-center p-8 gap-4 bg-white border-b shrink-0 z-20">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase mb-2">Välj Spelläge</h2>
                    <div className="flex gap-4">
                        <button onClick={() => setAgentSubMode('MANUAL')} className={`px-8 py-4 rounded-[2rem] font-black text-sm transition-all flex items-center gap-3 border-4 ${agentSubMode === 'MANUAL' ? 'bg-indigo-600 border-indigo-200 text-white shadow-xl scale-105' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}><Icons.Book size={20} /> VÄN-MATCH</button>
                        <button onClick={() => setAgentSubMode('AUTO')} className={`px-8 py-4 rounded-[2rem] font-black text-sm transition-all flex items-center gap-3 border-4 ${agentSubMode === 'AUTO' ? 'bg-indigo-600 border-indigo-200 text-white shadow-xl scale-105' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}><Icons.Zap size={20} /> DATOR-UTMANING</button>
                    </div>
                </div>
            )}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-white shadow-sm shrink-0 z-10">
                    {!isXSet ? (
                        <div className="p-8 flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-indigo-900 text-amber-400 rounded-3xl flex items-center justify-center mb-6 shadow-xl rotate-3 border-4 border-indigo-950">{agentSubMode === 'MANUAL' ? <Icons.Crown size={40} /> : <Icons.Hash size={40} />}</div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter">{agentSubMode === 'MANUAL' ? 'Förbered Uppdraget' : 'Datorn slumpar ett tal'}</h3>
                            
                            {agentSubMode === 'AUTO' ? (
                                <button onClick={startAutoGame} className="w-full py-5 bg-indigo-900 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-950 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"><Icons.Shuffle className="text-amber-400" /> SLUMPA & STARTA</button>
                            ) : (
                                <div className="w-full flex flex-col gap-4 mt-4">
                                    <input 
                                        type="number" 
                                        min="1" max="100" 
                                        value={manualXInput} 
                                        onChange={e => setManualXInput(e.target.value)} 
                                        placeholder="Välj hemligt x (1-100)" 
                                        className="w-full p-4 text-center text-xl font-black border-2 border-indigo-200 rounded-2xl focus:border-indigo-500 outline-none"
                                    />
                                    <button 
                                        onClick={startManualGame} 
                                        disabled={!manualXInput || parseInt(manualXInput) < 1 || parseInt(manualXInput) > 100}
                                        className="w-full py-5 bg-indigo-900 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-950 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        <Icons.Star className="text-amber-400" /> STARTA SPELET
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-6 bg-indigo-950 text-white shadow-lg shrink-0 relative overflow-hidden flex justify-between items-center">
                                <div className="text-4xl font-black font-mono tracking-tighter flex items-center gap-4"><span className="text-indigo-400">x =</span><span>{isRevealed ? secretX : '??'}</span></div>
                                <button onClick={resetAgentGame} className="p-2 bg-indigo-900 hover:bg-indigo-800 rounded-full text-indigo-300 transition-colors" title="Börja om">
                                    <Icons.Reset size={20} />
                                </button>
                            </div>
                            <div className="flex-1 p-5 overflow-y-auto space-y-3 custom-scrollbar bg-slate-50/50">
                                {clues.map((clue, idx) => (
                                    <div key={clue.id} className="group p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all animate-in slide-in-from-left-4"><span className="font-mono text-lg font-black text-slate-700 italic leading-tight">"{clue.text}"</span></div>
                                ))}
                                {clues.length === 0 && (
                                    <div className="text-center text-slate-400 font-bold italic mt-10">Inga ledtrådar än...</div>
                                )}
                            </div>
                            <div className="p-5 border-t bg-white space-y-4 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                                {agentSubMode === 'AUTO' ? (
                                    <button onClick={generateAutoClue} disabled={isRevealed} className="w-full py-3 bg-indigo-100 text-indigo-700 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-200 transition-all disabled:opacity-50">
                                        + NY LEDTRÅD
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={manualClueInput} 
                                            onChange={e => setManualClueInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addManualClue()}
                                            placeholder="Skriv en ledtråd..." 
                                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none"
                                            disabled={isRevealed}
                                        />
                                        <button onClick={addManualClue} disabled={!manualClueInput.trim() || isRevealed} className="px-4 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 transition-all disabled:opacity-50">
                                            <Icons.Plus size={20} />
                                        </button>
                                    </div>
                                )}
                                <button onClick={() => setIsRevealed(true)} disabled={isRevealed} className="w-full py-4 bg-amber-400 text-amber-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-amber-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"><Icons.Hash size={16} /> AVSLÖJA x</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex-1 p-6 bg-white overflow-hidden flex flex-col gap-6">
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pb-10 overflow-y-auto">
                        {Array.from({length: 100}).map((_, i) => {
                            const n = i + 1;
                            const isEliminated = eliminatedNumbers.has(n);
                            return <button key={n} onClick={() => { const next = new Set(eliminatedNumbers); if (next.has(n)) next.delete(n); else next.add(n); setEliminatedNumbers(next); }} className={`aspect-square rounded-xl font-mono font-black text-sm transition-all border-2 ${isRevealed && n === secretX ? 'bg-amber-400 border-amber-600' : isEliminated ? 'bg-slate-50 border-slate-100 text-slate-200 line-through opacity-20' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'}`}>{n}</button>;
                        })}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const ActionBtn = ({ label, onClick, color }: { label: string, onClick: () => void, color: 'blue' | 'emerald' | 'red' | 'slate' }) => {
    const colors = { blue: 'bg-blue-700 hover:bg-blue-600 text-white', emerald: 'bg-emerald-700 hover:bg-emerald-600 text-white', red: 'bg-red-700 hover:bg-red-600 text-white', slate: 'bg-slate-800 hover:bg-slate-700 text-slate-500' };
    return <button onClick={onClick} className={`rounded-md font-black text-[8px] py-1 shadow-sm active:scale-95 transition-all flex items-center justify-center border border-white/5 ${colors[color]}`}>{label}</button>;
};

const ScalePan = ({ side, mass, otherMass, x, c, mode, onObjectClick }: { side: Side, mass: number, otherMass: number, x: number, c: number, mode: Representation, onObjectClick: (t: 'X' | 'CONST') => void }) => {
    const tilt = Math.max(-15, Math.min(15, (side === 'VL' ? mass - otherMass : otherMass - mass) * 1.5));
    return (
        <div className="absolute -top-[160px] w-[44%] h-[160px] flex flex-col justify-end items-center origin-top transition-transform duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) z-40" style={{ [side === 'VL' ? 'left' : 'right']: '12px', transform: `rotate(${-tilt}deg)` }}>
            <div className="flex-1 flex flex-wrap justify-center content-end gap-1 p-2 w-full max-h-[140px] overflow-visible pb-1.5">
                {Array.from({ length: Math.abs(x) }).map((_, i) => (
                    <div key={`x-${i}`} onClick={() => onObjectClick('X')} className="scale-item cursor-pointer transition-all duration-300">
                        {mode === 'BLOCKS' ? <div className="w-8 h-8 bg-blue-500 border-b-2 border-r-2 border-blue-700 rounded-lg flex items-center justify-center text-white font-black text-sm">{x > 0 ? 'x' : '-x'}</div> : <div className="relative w-12 h-6 bg-[#8B5E3C] border border-[#5D3A1A] rounded shadow-sm overflow-hidden"><div className="absolute inset-0.5 bg-[#D2B48C] rounded-sm flex items-center justify-center"><div className="px-1 py-0 bg-blue-600 text-white font-black text-[7px] rounded-sm">{x > 0 ? 'x' : '-x'}</div></div></div>}
                    </div>
                ))}
                {Array.from({ length: Math.abs(c) }).map((_, i) => (
                    <div key={`c-${i}`} onClick={() => onObjectClick('CONST')} className="scale-item cursor-pointer transition-all duration-300">
                        {mode === 'BLOCKS' ? <div className="w-5 h-5 bg-emerald-500 border-b-2 border-r-2 border-emerald-700 rounded-md shadow-md flex items-center justify-center text-white font-black text-[8px]">{c > 0 ? '1' : '-1'}</div> : <div className="w-1.5 h-7 bg-[#F5DEB3] rounded-sm relative shadow-sm border-t-2 border-emerald-600" />}
                    </div>
                ))}
            </div>
            <div className="w-full h-3 rounded-b-[40px] border-b-[6px] border-slate-400 bg-slate-200 shadow-md relative" />
        </div>
    );
};
