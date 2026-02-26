import React, { useState, useMemo } from 'react';
import { Icons } from '../icons';

interface Formula {
    cat: string;
    name: string;
    val: string;
    terms?: string;
    example?: string;
    visual?: React.ReactNode;
}

const GeometryVisual = ({ type }: { type: 'TRI' | 'RECT' | 'CIRC' | 'SQU' }) => {
    const color = "stroke-blue-600 fill-blue-50";
    const labelColor = "fill-slate-600 text-[10px] font-bold";
    
    if (type === 'TRI') return (
        <svg width="60" height="40" viewBox="0 0 60 40">
            <path d="M10 30 L50 30 L30 10 Z" className={color} strokeWidth="2" />
            <line x1="30" y1="10" x2="30" y2="30" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
            <text x="30" y="38" textAnchor="middle" className={labelColor}>b</text>
            <text x="34" y="22" className={labelColor}>h</text>
        </svg>
    );
    if (type === 'RECT') return (
        <svg width="60" height="40" viewBox="0 0 60 40">
            <rect x="10" y="10" width="40" height="20" className={color} strokeWidth="2" rx="2" />
            <text x="30" y="38" textAnchor="middle" className={labelColor}>b</text>
            <text x="4" y="24" className={labelColor}>h</text>
        </svg>
    );
    if (type === 'CIRC') return (
        <svg width="60" height="40" viewBox="0 0 60 40">
            <circle cx="30" cy="20" r="15" className={color} strokeWidth="2" />
            <line x1="30" y1="20" x2="45" y2="20" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="30" cy="20" r="1" fill="#334155" />
            <text x="37" y="18" className={labelColor}>r</text>
        </svg>
    );
    if (type === 'SQU') return (
        <svg width="60" height="40" viewBox="0 0 60 40">
            <rect x="15" y="10" width="20" height="20" className={color} strokeWidth="2" rx="1" />
            <text x="25" y="38" textAnchor="middle" className={labelColor}>s</text>
            <text x="6" y="24" className={labelColor}>s</text>
        </svg>
    );
    return null;
};

const FunctionVisual = () => (
    <svg width="60" height="40" viewBox="0 0 60 40">
        <line x1="5" y1="35" x2="55" y2="35" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="10" y1="5" x2="10" y2="38" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="5" y1="30" x2="50" y2="10" stroke="#3b82f6" strokeWidth="2" />
        <circle cx="10" cy="27" r="2" fill="#ef4444" />
        <text x="14" y="28" fill="#ef4444" className="text-[8px] font-bold">m</text>
        <text x="40" y="18" fill="#3b82f6" className="text-[8px] font-bold">k</text>
    </svg>
);

const ArithmeticVisual = ({ op }: { op: '+' | '-' | '*' | '/' }) => {
    const symbol = op === '*' ? '×' : op === '/' ? '÷' : op;
    return (
        <div className="flex items-center justify-center w-12 h-10 bg-slate-100 rounded-lg border border-slate-200">
            <span className="text-xl font-black text-slate-400">{symbol}</span>
        </div>
    );
};

const FORMULAS: Formula[] = [
    // GEOMETRI
    { cat: 'Geometri', name: 'Triangel (Area)', val: 'A = (b · h) / 2', visual: <GeometryVisual type="TRI" /> },
    { cat: 'Geometri', name: 'Rektangel (Area)', val: 'A = b · h', visual: <GeometryVisual type="RECT" /> },
    { cat: 'Geometri', name: 'Kvadrat (Area)', val: 'A = s · s = s²', visual: <GeometryVisual type="SQU" /> },
    { cat: 'Geometri', name: 'Cirkel (Area)', val: 'A = π · r²', visual: <GeometryVisual type="CIRC" /> },
    { cat: 'Geometri', name: 'Cirkel (Omkrets)', val: 'O = 2 · π · r', visual: <GeometryVisual type="CIRC" /> },
    { cat: 'Geometri', name: 'Pythagoras sats', val: 'a² + b² = c²', visual: (
        <svg width="60" height="40" viewBox="0 0 60 40">
            <path d="M15 30 L45 30 L15 10 Z" fill="none" stroke="#3b82f6" strokeWidth="2" />
            <text x="30" y="38" className="fill-slate-600 text-[10px] font-bold">a</text>
            <text x="8" y="20" className="fill-slate-600 text-[10px] font-bold">b</text>
            <text x="30" y="20" className="fill-slate-600 text-[10px] font-bold">c</text>
        </svg>
    )},

    // RÄKNESÄTT & TERMINOLOGI
    { cat: 'Räknesätt', name: 'Addition', val: 'term + term = summa', example: '3 + 5 = 8', visual: <ArithmeticVisual op="+" /> },
    { cat: 'Räknesätt', name: 'Subtraktion', val: 'term - term = differens', example: '10 - 4 = 6', visual: <ArithmeticVisual op="-" /> },
    { cat: 'Räknesätt', name: 'Multiplikation', val: 'faktor · faktor = produkt', example: '3 · 4 = 12', visual: <ArithmeticVisual op="*" /> },
    { cat: 'Räknesätt', name: 'Division', val: 'täljare / nämnare = kvot', example: '12 / 3 = 4', visual: <ArithmeticVisual op="/" /> },

    // FUNKTIONER
    { cat: 'Funktioner', name: 'Räta linjens ekvation', val: 'y = kx + m', terms: 'k = lutning, m = skärning y-axeln', visual: <FunctionVisual /> },
    { cat: 'Funktioner', name: 'Proportionalitet', val: 'y = kx', terms: 'Går alltid genom origo (0,0)' },

    // BEGREPP
    { cat: 'Begrepp', name: 'Likhet & Olikhet', val: '= , ≠', terms: 'Lika med, Inte lika med' },
    { cat: 'Begrepp', name: 'Jämförelse', val: '> , <', terms: 'Större än, Mindre än' },
    { cat: 'Begrepp', name: 'Parallell', val: 'a ∥ b', terms: 'Linjer som aldrig möts' },
    { cat: 'Begrepp', name: 'Vinkelrät', val: 'a ⊥ b', terms: 'Möts i 90 graders vinkel' },

    // PREFIX
    { cat: 'Prefix', name: 'Kilo (k)', val: '10³ = 1 000' },
    { cat: 'Prefix', name: 'Mega (M)', val: '10⁶ = 1 000 000' },
    { cat: 'Prefix', name: 'Centi (c)', val: '10⁻² = 0,01' },
    { cat: 'Prefix', name: 'Milli (m)', val: '10⁻³ = 0,001' },

    // POTENSER
    { cat: 'Potenser', name: 'Multiplikation', val: 'aˣ · aʸ = aˣ⁺ʸ', example: '10² · 10³ = 10⁵' },
    { cat: 'Potenser', name: 'Division', val: 'aˣ / aʸ = aˣ⁻ʸ', example: '10⁵ / 10² = 10³' },
    { cat: 'Potenser', name: 'Potens av potens', val: '(aˣ)ʸ = aˣ·ʸ', example: '(10²)³ = 10⁶' },
];

const CAT_ROW_1 = ['Alla', 'Geometri', 'Räknesätt', 'Funktioner'];
const CAT_ROW_2 = ['Begrepp', 'Potenser', 'Prefix'];

interface FormulaWidgetProps {
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

export const FormulaWidget: React.FC<FormulaWidgetProps> = ({ isTransparent, setTransparent }) => {
  const [activeCat, setActiveCat] = useState('Alla');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
      return FORMULAS.filter(f => {
          const matchesCat = activeCat === 'Alla' || f.cat === activeCat;
          const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.val.toLowerCase().includes(search.toLowerCase());
          return matchesCat && matchesSearch;
      });
  }, [activeCat, search]);

  const renderCatButton = (cat: string) => (
    <button
        key={cat}
        onClick={() => setActiveCat(cat)}
        className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shadow-sm border ${activeCat === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
    >
        {cat}
    </button>
  );

  return (
    <div className="w-full max-w-[400px] flex flex-col h-full min-h-[450px]">
      
      {/* Search Bar */}
      <div className="relative mb-3 shrink-0">
          <Icons.More className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={14} />
          <input 
            type="text" 
            placeholder="Sök formel, term eller begrepp..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
      </div>

      {/* Categories in Two Rows */}
      <div className="flex flex-col gap-2 mb-4 shrink-0">
          {/* Row 1: Basics */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CAT_ROW_1.map(renderCatButton)}
          </div>
          {/* Row 2: Advanced/Abstract */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CAT_ROW_2.map(renderCatButton)}
          </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-4">
        {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm italic">Inga formler hittades.</div>
        ) : (
            filtered.map((f, i) => (
                <div 
                    key={i} 
                    className="group bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex gap-4"
                >
                    {/* Visual Aid */}
                    {f.visual && (
                        <div className="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 shrink-0 overflow-hidden">
                            {f.visual}
                        </div>
                    )}
                    
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-0.5">
                            <span className="font-black text-slate-800 text-sm leading-tight">{f.name}</span>
                            <span className="text-[9px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">{f.cat}</span>
                        </div>
                        <div className="font-serif text-base text-blue-700 font-bold mt-0.5">
                            {f.val}
                        </div>
                        {f.terms && (
                            <div className="text-[10px] text-slate-400 italic font-medium mt-1">
                                {f.terms}
                            </div>
                        )}
                        {f.example && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-[9px] font-black text-blue-400 bg-blue-50 px-1 rounded uppercase">Ex:</span>
                                <span className="text-xs font-mono font-bold text-slate-600">{f.example}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium italic">Välj en kategori för att filtrera resultaten.</p>
      </div>
    </div>
  );
};