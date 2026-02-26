
import React, { useState, useMemo, useEffect } from 'react';
import { Icons } from '../icons';

type Mode = 'CASHIER' | 'BUDGET' | 'SAVINGS';
type ViewType = 'PHYSICAL' | 'DIGITAL';

interface MoneyItem {
  id: string;
  value: number;
  type: 'COIN' | 'BILL';
}

interface Product {
    name: string;
    price: number;
    icon: React.ReactNode;
}

interface EconomyWidgetProps {
  id?: string;
  isTransparent?: boolean;
  setTransparent?: (v: boolean) => void;
}

const PRODUCTS: Product[] = [
    { name: 'Äpple', price: 8, icon: <span className="text-4xl">🍎</span> },
    { name: 'Glass', price: 25, icon: <span className="text-4xl">🍦</span> },
    { name: 'Biobiljett', price: 135, icon: <span className="text-4xl">🎟️</span> },
    { name: 'Mobilskal', price: 199, icon: <span className="text-4xl">📱</span> },
    { name: 'Hörlurar', price: 495, icon: <span className="text-4xl">🎧</span> },
    { name: 'Snygg Keps', price: 249, icon: <span className="text-4xl">🧢</span> },
    { name: 'Vattenflaska', price: 89, icon: <span className="text-4xl">🧪</span> },
];

const DENOMINATIONS = [
  { value: 500, type: 'BILL' as const, color: 'bg-rose-500', label: '500 kr' },
  { value: 200, type: 'BILL' as const, color: 'bg-emerald-600', label: '200 kr' },
  { value: 100, type: 'BILL' as const, color: 'bg-blue-500', label: '100 kr' },
  { value: 50, type: 'BILL' as const, color: 'bg-orange-400', label: '50 kr' },
  { value: 20, type: 'BILL' as const, color: 'bg-purple-500', label: '20 kr' },
  { value: 10, type: 'COIN' as const, color: 'bg-amber-500', label: '10 kr' },
  { value: 5, type: 'COIN' as const, color: 'bg-amber-400', label: '5 kr' },
  { value: 2, type: 'COIN' as const, color: 'bg-slate-400', label: '2 kr' },
  { value: 1, type: 'COIN' as const, color: 'bg-slate-300', label: '1 kr' },
];

const MoneyVisual: React.FC<{ 
    item: MoneyItem; 
    onClick?: () => void; 
    onDoubleClick?: () => void; 
    onDragStart?: (e: React.DragEvent) => void;
    size?: 'sm' | 'md' | 'lg' 
}> = ({ item, onClick, onDoubleClick, onDragStart, size = 'md' }) => {
  const config = DENOMINATIONS.find(d => d.value === item.value)!;
  if (item.type === 'BILL') {
    const height = size === 'sm' ? 'h-10' : size === 'md' ? 'h-14' : 'h-20';
    const width = size === 'sm' ? 'w-20' : size === 'md' ? 'w-28' : 'w-40';
    return (<div draggable onDragStart={onDragStart} onClick={onClick} onDoubleClick={onDoubleClick} className={`${height} ${width} ${config.color} rounded-md border-2 border-black/10 shadow-lg flex items-center justify-between px-2 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform active:scale-95 group relative overflow-hidden select-none animate-in zoom-in duration-300`} title={`Dra för att flytta. Dubbelklicka för att växla ${item.value} kr`}><span className="text-[10px] font-black text-white/40">{item.value}</span><div className="flex flex-col items-center"><span className="text-xs font-black text-white drop-shadow-md">{item.value}</span><span className="text-[6px] font-bold text-white/60 uppercase tracking-widest">Kronor</span></div><span className="text-[10px] font-black text-white/40">{item.value}</span><div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" /></div>);
  }
  const coinSize = size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16';
  const fontSize = size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-sm' : 'text-xl';
  return (<div draggable onDragStart={onDragStart} onClick={onClick} className={`${coinSize} ${config.color} rounded-full border-2 border-black/10 shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform active:scale-90 group relative select-none animate-in zoom-in duration-300`}><span className={`${fontSize} font-black text-slate-800/80`}>{item.value}</span><div className="absolute inset-0 rounded-full border-2 border-white/20 pointer-events-none" /><div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/5 to-white/20 pointer-events-none" /></div>);
};

export const EconomyWidget: React.FC<EconomyWidgetProps> = () => {
  const [activeMode, setActiveMode] = useState<Mode>('CASHIER');
  const [viewType, setViewType] = useState<ViewType>('PHYSICAL');
  const [wallet, setWallet] = useState<MoneyItem[]>([]);
  const [register, setRegister] = useState<MoneyItem[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product>(PRODUCTS[0]);
  const [transactions, setTransactions] = useState<{label: string, amount: number, time: string}[]>([]);
  const [dragOverRegister, setDragOverRegister] = useState(false);
  const [dragOverWallet, setDragOverWallet] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showChangeAmount, setShowChangeAmount] = useState(false);
  
  const [budgetItems, setBudgetItems] = useState({ fun: 0, savings: 0, needs: 0 });
  const [savingsGoal, setSavingsGoal] = useState(1200);
  const [weeklySave, setWeeklySave] = useState(50);

  const walletTotal = useMemo(() => wallet.reduce((sum, item) => sum + item.value, 0), [wallet]);
  const registerTotal = useMemo(() => register.reduce((sum, item) => sum + item.value, 0), [register]);

  const addMoneyToWallet = (val: number, type: 'COIN' | 'BILL') => {
    const id = Math.random().toString(36).substr(2, 9);
    setWallet(prev => [...prev, { id, value: val, type }]);
    setTransactions(prev => [{label: 'Insättning', amount: val, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}, ...prev].slice(0, 10));
  };

  const moveMoneyToRegister = (id: string) => {
    const item = wallet.find(i => i.id === id);
    if (!item) return;
    setWallet(prev => prev.filter(i => i.id !== id));
    setRegister(prev => [...prev, item]);
  };

  const moveMoneyToWallet = (id: string) => {
    const item = register.find(i => i.id === id);
    if (!item) return;
    setRegister(prev => prev.filter(i => i.id !== id));
    setWallet(prev => [...prev, item]);
  };

  const moveMoneyToBucket = (id: string, bucket: 'fun' | 'savings' | 'needs') => {
    const item = wallet.find(i => i.id === id);
    if (!item) return;
    setWallet(prev => prev.filter(i => i.id !== id));
    setBudgetItems(prev => ({ ...prev, [bucket]: prev[bucket] + item.value }));
    setTransactions(prev => [{label: `Budget: ${bucket}`, amount: -item.value, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}, ...prev].slice(0, 10));
  };

  const handleDragStart = (e: React.DragEvent, id: string, source: 'WALLET' | 'REGISTER') => {
    e.dataTransfer.setData('id', id); e.dataTransfer.setData('source', source);
  };

  const handleDropToRegister = (e: React.DragEvent) => {
    e.preventDefault(); setDragOverRegister(false);
    const id = e.dataTransfer.getData('id'); const source = e.dataTransfer.getData('source');
    if (source === 'WALLET') moveMoneyToRegister(id);
  };

  const handleDropToWallet = (e: React.DragEvent) => {
    e.preventDefault(); setDragOverWallet(false);
    const id = e.dataTransfer.getData('id'); const source = e.dataTransfer.getData('source');
    if (source === 'REGISTER') moveMoneyToWallet(id);
  };

  const handleDropToBucket = (e: React.DragEvent, bucket: 'fun' | 'savings' | 'needs') => {
    e.preventDefault(); const id = e.dataTransfer.getData('id'); const source = e.dataTransfer.getData('source');
    if (source === 'WALLET') moveMoneyToBucket(id, bucket);
  };

  const splitMoney = (id: string) => {
    const item = wallet.find(i => i.id === id);
    if (!item || item.value === 1) return;
    let newItems: {value: number, type: 'COIN' | 'BILL'}[] = [];
    const v = item.value;
    if (v === 500) newItems = [{value: 200, type: 'BILL'}, {value: 200, type: 'BILL'}, {value: 100, type: 'BILL'}];
    else if (v === 200) newItems = [{value: 100, type: 'BILL'}, {value: 100, type: 'BILL'}];
    else if (v === 100) newItems = [{value: 50, type: 'BILL'}, {value: 50, type: 'BILL'}];
    else if (v === 50) newItems = [{value: 20, type: 'BILL'}, {value: 20, type: 'BILL'}, {value: 10, type: 'COIN'}];
    else if (v === 20) newItems = [{value: 10, type: 'COIN'}, {value: 10, type: 'COIN'}];
    else if (v === 10) newItems = [{value: 5, type: 'COIN'}, {value: 5, type: 'COIN'}];
    else if (v === 5) newItems = [{value: 2, type: 'COIN'}, {value: 2, type: 'COIN'}, {value: 1, type: 'COIN'}];
    else if (v === 2) newItems = [{value: 1, type: 'COIN'}, {value: 1, type: 'COIN'}];
    if (newItems.length > 0) setWallet(prev => [...prev.filter(i => i.id !== id), ...newItems.map(ni => ({...ni, id: Math.random().toString(36)}))]);
  };

  const completePurchase = () => {
    if (registerTotal < currentProduct.price) return;
    const changeAmount = registerTotal - currentProduct.price;
    const changeItems: MoneyItem[] = [];
    let remaining = changeAmount;
    const availableDenominations = [...DENOMINATIONS].sort((a,b) => b.value - a.value);
    for (const d of availableDenominations) { while (remaining >= d.value) { changeItems.push({ id: Math.random().toString(36).substr(2, 9), value: d.value, type: d.type }); remaining -= d.value; } }
    setRegister([]); setWallet(prev => [...prev, ...changeItems]);
    setTransactions(prev => [{ label: `Köp: ${currentProduct.name}`, amount: -currentProduct.price, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }, ...(changeAmount > 0 ? [{ label: 'Växel tillbaka', amount: changeAmount, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }] : []), ...prev].slice(0, 10));
    const otherProducts = PRODUCTS.filter(p => p.name !== currentProduct.name);
    setCurrentProduct(otherProducts[Math.floor(Math.random() * otherProducts.length)]);
  };

  const weeksToGoal = Math.ceil(savingsGoal / Math.max(1, weeklySave));

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden select-none font-sans relative">
      {/* Info Button */}
      <button onClick={() => setShowInfo(!showInfo)} className={`absolute top-2 right-2 p-2 rounded-full transition-all z-[110] ${showInfo ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}><Icons.Info size={20} /></button>

      {/* Info Modal */}
      {showInfo && (
        <div className="absolute top-14 right-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-[120] animate-in fade-in slide-in-from-top-2 duration-300 text-left">
          <div className="flex justify-between items-start mb-3">
             <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Plånboken</h4>
             <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.X size={16}/></button>
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <p>Träna på att hantera pengar, räkna växel och planera din budget.</p>
            <section className="space-y-2">
              <h5 className="font-black text-blue-600 uppercase text-[10px]">De tre lägena:</h5>
              <ul className="space-y-1.5 list-disc pl-4">
                <li><strong>Kassan:</strong> Dra pengar till den svarta kassan för att betala för varan. Få rätt växel tillbaka när du klickar på slutför.</li>
                <li><strong>Budget:</strong> Planera hur din månadspeng ska räcka. Dra pengar till hinkarna för att fördela dem.</li>
                <li><strong>Sparresan:</strong> Se hur lång tid det tar att spara till ett mål om du sparar en viss summa varje vecka.</li>
                <li><strong>Digitalt/Fysiskt:</strong> Växla vy för att se pengarna antingen som siffervärden eller som riktiga sedlar och mynt.</li>
              </ul>
            </section>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between p-3 gap-3 bg-slate-50 border-b border-slate-200 shrink-0 pr-12">
        <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
          <button onClick={() => setActiveMode('CASHIER')} className={`px-2 sm:px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${activeMode === 'CASHIER' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Kassan</button>
          <button onClick={() => setActiveMode('BUDGET')} className={`px-2 sm:px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${activeMode === 'BUDGET' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Budget</button>
          <button onClick={() => setActiveMode('SAVINGS')} className={`px-2 sm:px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${activeMode === 'SAVINGS' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>Sparresan</button>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setViewType(viewType === 'PHYSICAL' ? 'DIGITAL' : 'PHYSICAL')} className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${viewType === 'DIGITAL' ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'}`} title="Växla vy">{viewType === 'DIGITAL' ? <Icons.TrendingUp size={18} /> : <Icons.Banknote size={18} />}<span className="text-[10px] font-black uppercase hidden sm:inline">{viewType === 'DIGITAL' ? 'Digitalt' : 'Fysiskt'}</span></button>
            <button onClick={() => { setWallet([]); setRegister([]); setBudgetItems({fun:0,savings:0,needs:0}); setTransactions([]); }} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Rensa allt"><Icons.Trash size={18} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className={`w-full lg:w-80 border-r border-slate-200 flex flex-col shrink-0 transition-colors ${dragOverWallet ? 'bg-blue-50' : 'bg-slate-50'}`} onDragOver={(e) => { e.preventDefault(); setDragOverWallet(true); }} onDragLeave={() => setDragOverWallet(false)} onDrop={handleDropToWallet}>
            {viewType === 'PHYSICAL' ? (
                <><div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0 shadow-sm"><div className="flex items-center gap-2 text-blue-600"><div className="p-2 bg-blue-50 rounded-lg"><Icons.Wallet size={20} /></div><span className="font-black text-xs uppercase tracking-widest">Min Plånbok</span></div><div className="font-mono font-black text-2xl text-slate-800">{walletTotal} <span className="text-xs text-slate-400">kr</span></div></div><div className="flex-1 p-4 overflow-y-auto custom-scrollbar"><div className="flex flex-wrap content-start gap-3 justify-center pb-12">{wallet.map(item => (<MoneyVisual key={item.id} item={item} size="sm" onDragStart={(e) => handleDragStart(e, item.id, 'WALLET')} onClick={() => activeMode === 'CASHIER' ? moveMoneyToRegister(item.id) : null} onDoubleClick={() => splitMoney(item.id)}/>))}{wallet.length === 0 && !dragOverWallet && (<div className="text-center py-8 lg:py-12 px-6"><div className="w-12 h-12 lg:w-16 lg:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200"><Icons.Plus size={32} /></div><p className="text-xs text-slate-300 font-bold uppercase tracking-widest italic">Plånboken är tom</p><p className="text-[10px] text-slate-400 mt-2">Hämta pengar nedan.</p></div>)}</div></div></>
            ) : (
                <div className="flex-1 flex flex-col bg-slate-900 text-white overflow-hidden animate-in slide-in-from-left duration-500"><div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 shadow-xl"><div className="flex justify-between items-start mb-6"><div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Matte-Banken</div><Icons.Zap size={16} className="text-amber-300" /></div><div className="text-sm font-bold opacity-70 mb-1">Tillgängligt saldo</div><div className="text-4xl font-black font-mono tracking-tighter">{walletTotal.toLocaleString()} <span className="text-lg opacity-50 font-sans">kr</span></div></div><div className="flex-1 bg-slate-800 p-4 overflow-y-auto"><div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-1">Transaktioner</div><div className="space-y-3 pb-8">{transactions.length === 0 ? (<div className="text-center py-8 text-slate-600 text-[10px] font-bold uppercase tracking-widest italic">Ingen historik</div>) : (transactions.map((t, i) => (<div key={i} className="bg-slate-700/50 p-3 rounded-xl border border-slate-700 flex justify-between items-center"><div><div className="text-xs font-black">{t.label}</div><div className="text-[9px] font-bold text-slate-500 uppercase">{t.time}</div></div><div className={`font-mono font-black ${t.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{t.amount >= 0 ? '+' : ''}{t.amount}</div></div>)))}</div></div></div>
            )}
            <div className="p-3 bg-white border-t border-slate-200 grid grid-cols-5 gap-1.5 shrink-0 shadow-inner overflow-x-auto no-scrollbar">{DENOMINATIONS.map(d => (<button key={d.value} onClick={() => addMoneyToWallet(d.value, d.type)} className={`py-2 px-1 rounded-lg text-[10px] font-black text-white shadow-sm hover:scale-105 active:scale-95 transition-all border-b-2 border-black/20 ${d.color}`}>{d.value}</button>))}</div>
        </div>
        <div className="flex-1 relative overflow-y-auto bg-white flex flex-col custom-scrollbar">
            {activeMode === 'CASHIER' && (
                <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 gap-6 sm:gap-8 animate-in fade-in duration-500">
                    <div className="w-full max-w-2xl flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-40 h-40 lg:w-48 lg:h-48 bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 relative group shrink-0">
                            <div className="absolute -top-4 -left-4 bg-amber-400 text-amber-900 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg -rotate-12 group-hover:scale-110 transition-transform">Dagens Vara</div>
                            <div className="bg-white p-4 lg:p-6 rounded-full shadow-inner border border-slate-100 group-hover:scale-110 transition-transform duration-500">{currentProduct.icon}</div>
                            <div className="text-center">
                                <div className="text-[10px] lg:text-sm font-black text-slate-800 uppercase tracking-widest">{currentProduct.name}</div>
                                <div className="text-xl lg:text-2xl font-mono font-black text-blue-600">{currentProduct.price} kr</div>
                            </div>
                            <button onClick={() => setCurrentProduct(PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)])} className="absolute -bottom-4 bg-white border border-slate-200 p-2 rounded-full shadow-md text-slate-400 hover:text-blue-500 hover:rotate-180 transition-all"><Icons.Reset size={16} /></button>
                        </div>
                        <div className="flex-1 w-full flex flex-col gap-3">
                            <div className={`w-full bg-slate-900 rounded-[2.5rem] p-4 lg:p-6 shadow-2xl border-4 relative overflow-hidden flex flex-col gap-4 lg:gap-6 transition-colors duration-300 ${dragOverRegister ? 'border-blue-500' : 'border-slate-800'}`} onDragOver={(e) => { e.preventDefault(); setDragOverRegister(true); }} onDragLeave={() => setDragOverRegister(false)} onDrop={handleDropToRegister}>
                                <div className="absolute top-4 left-6 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] opacity-40">Butikskassa</div>
                                <div className="mt-4 flex flex-col items-center">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Att betala:</span>
                                    <div className="text-4xl lg:text-5xl font-mono font-black text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">{currentProduct.price} <span className="text-xl">kr</span></div>
                                </div>
                                <div className={`w-full h-32 lg:h-36 rounded-2xl border-2 border-dashed flex flex-wrap content-center justify-center gap-2 p-4 overflow-y-auto transition-colors ${dragOverRegister ? 'bg-blue-900/20 border-blue-400' : 'bg-slate-800/50 border-slate-700'}`}>
                                    {register.length === 0 && !dragOverRegister && <span className="text-slate-600 text-[10px] font-black uppercase italic opacity-40 px-6 text-center">Dra pengar hit från plånboken för att betala</span>}
                                    {register.map(item => (<MoneyVisual key={item.id} item={item} size="sm" onDragStart={(e) => handleDragStart(e, item.id, 'REGISTER')} onClick={() => moveMoneyToWallet(item.id)} />))}
                                </div>
                                <div className="flex w-full justify-between items-end border-t border-slate-800 pt-4 px-2">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inbetalat</span>
                                        <span className={`text-xl lg:text-2xl font-mono font-bold transition-colors ${registerTotal >= currentProduct.price ? 'text-emerald-400' : 'text-slate-300'}`}>{registerTotal} kr</span>
                                    </div>
                                    {registerTotal >= currentProduct.price && (
                                        <div className="flex flex-col items-end animate-in slide-in-from-bottom-2 relative pr-10 min-w-[100px] lg:min-w-[120px]">
                                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest text-right">Växel tillbaka</span>
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col items-end min-w-[60px]" onClick={() => setShowChangeAmount(!showChangeAmount)}>
                                                    {showChangeAmount ? (
                                                        <span className="text-2xl lg:text-3xl font-mono font-black text-emerald-400">{registerTotal - currentProduct.price} kr</span>
                                                    ) : (
                                                        <span className="text-2xl lg:text-3xl font-mono font-black text-slate-600 animate-pulse cursor-pointer">? kr</span>
                                                    )}
                                                </div>
                                                <button onClick={() => setShowChangeAmount(!showChangeAmount)} className={`absolute -right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${showChangeAmount ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 bg-slate-800 border border-slate-700'}`} title={showChangeAmount ? "Dölj växel" : "Visa växel"}>{showChangeAmount ? <Icons.Star size={16} /> : <Icons.Settings size={16} />}</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {registerTotal >= currentProduct.price && (<button onClick={completePurchase} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-base lg:text-lg shadow-xl hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-3 animate-in zoom-in"><Icons.Sparkles size={24} className="text-amber-300" />SLUTFÖR KÖP</button>)}
                        </div>
                    </div>
                    <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] text-center max-w-sm leading-relaxed px-6 lg:px-12">Dra pengar till svarta rutan för att betala. <br/>Klicka på "Slutför Köp" för att växla tillbaka.</p>
                </div>
            )}
            {activeMode === 'BUDGET' && (
                <div className="flex-1 flex flex-col gap-4 lg:gap-6 p-4 lg:p-6 animate-in fade-in duration-500 overflow-y-auto"><div className="flex flex-col sm:flex-row justify-between items-start sm:items-end px-2 gap-3"><div><h3 className="text-lg lg:text-xl font-black text-slate-800 flex items-center gap-3">Min Månadspeng<span className="text-[10px] bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-widest">500 kr</span></h3><p className="text-xs lg:text-sm text-slate-500 font-medium">Fördela pengarna på tre områden.</p></div><div className={`px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-3 transition-colors ${walletTotal === 0 ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-lg'}`}><Icons.Coins size={18} /><span>{walletTotal} kr kvar</span></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0"><BudgetBucket label="Nöje" icon={<Icons.ShoppingCart size={20}/>} color="blue" value={budgetItems.fun} description="Godis, spel och extra prylar." viewType={viewType} onDrop={(e) => handleDropToBucket(e, 'fun')} onAdd={() => { if(walletTotal >= 10) { setBudgetItems({...budgetItems, fun: budgetItems.fun + 10}); setWallet(prev => prev.slice(0, -1)); }}} /><BudgetBucket label="Sparande" icon={<Icons.PiggyBank size={20}/>} color="emerald" value={budgetItems.savings} description="Spara till något större." viewType={viewType} onDrop={(e) => handleDropToBucket(e, 'savings')} onAdd={() => { if(walletTotal >= 10) { setBudgetItems({...budgetItems, savings: budgetItems.savings + 10}); setWallet(prev => prev.slice(0, -1)); }}}/><BudgetBucket label="Nödvändigt" icon={<Icons.Home size={20}/>} color="rose" value={budgetItems.needs} description="Busskort och mat." viewType={viewType} onDrop={(e) => handleDropToBucket(e, 'needs')} warning={budgetItems.needs < 150 ? "Busskortet kostar 150 kr!" : undefined} onAdd={() => { if(walletTotal >= 10) { setBudgetItems({...budgetItems, needs: budgetItems.needs + 10}); setWallet(prev => prev.slice(0, -1)); }}} /></div><div className="bg-slate-50 rounded-3xl border border-slate-100 p-5 flex flex-col gap-3 shadow-inner"><div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]"><span>Budgetfördelning</span><span className="text-slate-800">Planerat: {budgetItems.fun + budgetItems.savings + budgetItems.needs} kr</span></div><div className="h-4 lg:h-6 flex rounded-full overflow-hidden shadow-sm border-2 border-white"><div className="bg-blue-500 transition-all duration-700" style={{ width: `${Math.min(100, (budgetItems.fun / 500) * 100)}%` }}></div><div className="bg-emerald-500 transition-all duration-700" style={{ width: `${Math.min(100, (budgetItems.savings / 500) * 100)}%` }}></div><div className="bg-rose-500 transition-all duration-700" style={{ width: `${Math.min(100, (budgetItems.needs / 500) * 100)}%` }}></div><div className="bg-slate-200 transition-all duration-700 flex-1" /></div></div>{viewType === 'PHYSICAL' && walletTotal > 0 && (<p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Dra pengar från plånboken till rutorna ovanför för att budgetera!</p>)}</div>
            )}
            {activeMode === 'SAVINGS' && (
                <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 gap-6 sm:gap-8 animate-in fade-in duration-500"><div className="w-full max-w-xl bg-white rounded-[2.5rem] lg:rounded-[3rem] p-6 lg:p-10 shadow-2xl border border-slate-200 relative overflow-hidden group"><div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600"></div><h3 className="text-xl lg:text-2xl font-black text-slate-800 mb-6 lg:mb-10 flex items-center gap-4"><div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl shadow-sm"><Icons.TrendingUp size={24}/></div>Simulator: Spar-Resan</h3><div className="space-y-8 lg:space-y-12"><div className="space-y-4 lg:space-y-5"><div className="flex justify-between items-center px-1"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Mål: Köpa Hörlurar</span><div className="text-2xl lg:text-3xl font-black text-slate-800 tabular-nums">{savingsGoal} kr</div></div><input type="range" min="100" max="10000" step="100" value={savingsGoal} onChange={e => setSavingsGoal(Number(e.target.value))} className="w-full h-3 lg:h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"/></div><div className="space-y-4 lg:space-y-5"><div className="flex justify-between items-center px-1"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Veckosparande</span><div className="text-2xl lg:text-3xl font-black text-blue-600 tabular-nums">{weeklySave} kr</div></div><input type="range" min="10" max="1000" step="10" value={weeklySave} onChange={e => setWeeklySave(Number(e.target.value))} className="w-full h-3 lg:h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"/></div><div className="bg-slate-900 rounded-2xl lg:rounded-[2rem] p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between shadow-2xl gap-4"><div className="space-y-1 text-center sm:text-left"><span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 block">Tid till målgång</span><div className="text-4xl lg:text-5xl font-black text-white tabular-nums">{weeksToGoal} <span className="text-xs lg:text-sm font-bold opacity-40 uppercase ml-1">veckor</span></div></div><div className="hidden sm:block w-px h-12 bg-white/10" /><div className="space-y-1 text-center sm:text-right"><span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 block">I månader</span><div className="text-4xl lg:text-5xl font-black text-white tabular-nums">{(weeksToGoal/4).toFixed(1)} <span className="text-xs lg:text-sm font-bold opacity-40 uppercase ml-1">mån</span></div></div></div></div></div></div>
            )}
        </div>
      </div>
      <div className="p-3 lg:p-4 bg-slate-50 border-t border-slate-200 shrink-0"><div className="flex flex-wrap justify-center gap-3 lg:gap-6 text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] lg:tracking-[0.2em]"><span className="group relative cursor-help hover:text-indigo-600 transition-colors flex items-center gap-1.5"><Icons.Plus size={12} className="opacity-40" /> Saldo<div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 lg:w-56 bg-slate-900 text-white p-3 lg:p-4 rounded-2xl text-[10px] lg:text-[11px] font-medium normal-case tracking-normal opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl scale-95 group-hover:scale-100 leading-relaxed border border-slate-700 z-[200]">Summan av alla pengar du har just nu. Som innehållet i en digital plånbok.</div></span><span className="opacity-20 hidden sm:inline">|</span><span className="group relative cursor-help hover:text-rose-600 transition-colors flex items-center gap-1.5"><Icons.Minimize size={12} className="opacity-40" /> Utgift<div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 lg:w-56 bg-slate-900 text-white p-3 lg:p-4 rounded-2xl text-[10px] lg:text-[11px] font-medium normal-case tracking-normal opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl scale-95 group-hover:scale-100 leading-relaxed border border-slate-700 z-[200]">Pengar som lämnar din plånbok. När du köper något blir det en utgift.</div></span><span className="opacity-20 hidden sm:inline">|</span><span className="group relative cursor-help hover:text-blue-600 transition-colors flex items-center gap-1.5"><Icons.Book size={12} className="opacity-40" /> Budget<div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 lg:w-56 bg-slate-900 text-white p-3 lg:p-4 rounded-2xl text-[10px] lg:text-[11px] font-medium normal-case tracking-normal opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl scale-95 group-hover:scale-100 leading-relaxed border border-slate-700 z-[200]">En plan för hur du ska använda dina pengar innan du faktiskt gör det.</div></span><span className="opacity-20 hidden sm:inline">|</span><span className="group relative cursor-help hover:text-amber-600 transition-colors flex items-center gap-1.5"><Icons.Reset size={12} className="opacity-40" /> Växel<div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 lg:w-56 bg-slate-900 text-white p-3 lg:p-4 rounded-2xl text-[10px] lg:text-[11px] font-medium normal-case tracking-normal opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl scale-95 group-hover:scale-100 leading-relaxed border border-slate-700 z-[200]">De pengar du får tillbaka om du betalar med en högre valör än vad varan kostar.</div></span></div></div>
    </div>
  );
};

const BudgetBucket: React.FC<{ label: string; icon: React.ReactNode; color: 'blue' | 'emerald' | 'rose'; value: number; description: string; viewType: ViewType; onAdd: () => void; onDrop: (e: React.DragEvent) => void; warning?: string }> = ({ label, icon, color, value, description, viewType, onAdd, onDrop, warning }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const colors = { blue: 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100', emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100', rose: 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' };
    const dragOverStyles = isDragOver ? 'ring-4 ring-blue-300 border-blue-400 scale-[1.02]' : '';
    return (<div onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={(e) => { setIsDragOver(false); onDrop(e); }} className={`flex flex-col gap-2 p-4 lg:p-6 rounded-[2rem] border-2 transition-all group ${colors[color]} ${dragOverStyles} relative shadow-sm hover:shadow-lg h-full`}><div className="flex justify-between items-start"><div className="p-2 lg:p-4 bg-white rounded-xl lg:rounded-2xl shadow-sm">{icon}</div><div className="text-right"><span className="text-[9px] lg:text-[10px] font-black uppercase opacity-60 tracking-wider">{label}</span><div className="text-2xl lg:text-3xl font-black tabular-nums">{value} <span className="text-xs">kr</span></div></div></div><div className="text-[9px] lg:text-[10px] font-bold opacity-50 italic mb-2 leading-tight">{description}</div>{viewType === 'DIGITAL' && (<button onClick={onAdd} className="mt-auto w-full py-2 lg:py-3 bg-white/90 hover:bg-white rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest shadow-sm active:scale-95 transition-all border border-black/5">Lägg till 10 kr</button>)}{viewType === 'PHYSICAL' && (<div className="mt-auto text-center py-2 border-t border-black/5"><span className="text-[8px] font-black uppercase opacity-40">Släpp pengar här</span></div>)}{warning && (<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-rose-600 text-white text-[8px] font-black uppercase rounded-full shadow-lg animate-bounce whitespace-nowrap z-10">{warning}</div>)}<div className="absolute bottom-0 left-0 w-full h-1 lg:h-1.5 bg-black/5 overflow-hidden rounded-b-[2rem]"><div className={`h-full transition-all duration-1000 ${color === 'blue' ? 'bg-blue-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(100, (value / 500) * 100)}%` }} /></div></div>);
};
