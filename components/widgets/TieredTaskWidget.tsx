
import React, { useState } from 'react';
import { Icons } from '../icons';

interface TieredTaskWidgetProps {
  isTransparent?: boolean;
}

interface TaskData {
  title: string;
  mainTask: string;
  hint1: string;
  hint2: string;
  hint3: string;
  challenge: string;
}

const DEFAULT_TASK: TaskData = {
  title: "Dagens Problem",
  mainTask: "Tre kompisar ska dela på en påse kulor. Adam får hälften av alla kulor. Beata får hälften av det som är kvar. Cecil får de sista 5 kulorna. Hur många kulor fanns det i påsen från början?",
  hint1: "Prova att rita en bild av påsen och dela upp den steg för steg.",
  hint2: "Börja bakifrån! Om Cecil fick 5 kulor, och det var hälften av vad som fanns kvar efter Adam, hur många fanns det då innan Beata tog sina?",
  hint3: "Uträkning: 5 kulor (Cecil) + 5 kulor (Beata) = 10 kulor. Dessa 10 kulor är hälften av hela påsen. Dubbla det!",
  challenge: "Skapa en egen liknande gåta med fyra kompisar där den sista personen får 3 kulor. Vad blir det totala antalet då?"
};

export const TieredTaskWidget: React.FC<TieredTaskWidgetProps> = () => {
  const [task, setTask] = useState<TaskData>(DEFAULT_TASK);
  const [isEditing, setIsEditing] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="w-full h-full bg-white p-4 overflow-y-auto">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Redigera Uppgift</h3>
            <button type="submit" className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-emerald-700 transition-colors">SPARA</button>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Rubrik</label>
              <input value={task.title} onChange={e => setTask({...task, title: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm font-bold" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase">Huvuduppgift</label>
              <textarea value={task.mainTask} onChange={e => setTask({...task, mainTask: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-lg text-sm min-h-[80px]" />
            </div>
            <div className="grid grid-cols-1 gap-3">
               <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">Ledtråd 1 (Lätt antydan)</label>
                  <input value={task.hint1} onChange={e => setTask({...task, hint1: e.target.value})} className="w-full p-2 bg-blue-50/30 border border-blue-100 rounded-lg text-sm" />
               </div>
               <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">Ledtråd 2 (Visuell/Metod)</label>
                  <input value={task.hint2} onChange={e => setTask({...task, hint2: e.target.value})} className="w-full p-2 bg-blue-50/30 border border-blue-100 rounded-lg text-sm" />
               </div>
               <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">Ledtråd 3 (Förklaring)</label>
                  <input value={task.hint3} onChange={e => setTask({...task, hint3: e.target.value})} className="w-full p-2 bg-blue-50/30 border border-blue-100 rounded-lg text-sm" />
               </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-amber-600 uppercase">Utmaning (För de som är klara)</label>
              <textarea value={task.challenge} onChange={e => setTask({...task, challenge: e.target.value})} className="w-full p-2 bg-amber-50/30 border border-amber-100 rounded-lg text-sm" />
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden select-none font-sans relative">
      
      {/* Info Button */}
      <button onClick={() => setShowInfo(!showInfo)} className={`absolute top-2 right-2 p-2 rounded-full transition-all z-[110] ${showInfo ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}><Icons.Info size={20} /></button>

      {/* Info Modal */}
      {showInfo && (
        <div className="absolute top-14 right-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-[120] animate-in fade-in slide-in-from-top-2 duration-300 text-left">
          <div className="flex justify-between items-start mb-3">
             <h4 className="font-black text-slate-800 text-sm uppercase tracking-tighter">Om Nivå-Kortet</h4>
             <button onClick={() => setShowInfo(false)} className="text-slate-300 hover:text-slate-500"><Icons.Close size={16}/></button>
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-slate-600">
            <p>Ett verktyg för differentiering som låter eleverna reglera sin egen svårighetsgrad.</p>
            <section className="space-y-2">
              <h5 className="font-black text-blue-600 uppercase text-[10px]">Användning:</h5>
              <ul className="space-y-1.5 list-disc pl-4">
                <li><strong>Stöd:</strong> Om en elev sitter fast kan de klicka på "Ledtråd" för att få scaffolding i tre steg.</li>
                <li><strong>Utmaning:</strong> Elever som är klara klickar på "Utmaning" för att få en fördjupningsfråga.</li>
                <li><strong>Redigera:</strong> Klicka på kugghjulet nere i hörnet för att skriva in din egen lektionsuppgift.</li>
              </ul>
            </section>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6 pb-2 flex flex-col items-center">
          <div className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm border border-indigo-200">
            {task.title}
          </div>
          <div className="w-full p-8 pb-12 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] shadow-inner relative group">
             <p className="text-xl sm:text-2xl font-bold text-slate-800 text-center leading-relaxed">
                {task.mainTask}
             </p>
             <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-4 w-full justify-center px-4">
                <button 
                  onClick={() => setHintLevel(prev => Math.min(3, prev + 1))}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 whitespace-nowrap ${hintLevel > 0 ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600'}`}
                >
                  <Icons.LifeBuoy size={16} />
                  {hintLevel === 0 ? 'Ledtråd' : `Ledtråd ${hintLevel}/3`}
                </button>
                <button 
                  onClick={() => setShowChallenge(!showChallenge)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 whitespace-nowrap ${showChallenge ? 'bg-amber-500 text-white' : 'bg-white border-2 border-slate-200 text-slate-500 hover:border-amber-400 hover:text-amber-600'}`}
                >
                  <Icons.Star size={16} />
                  Utmana mig
                </button>
             </div>
          </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="flex-1 p-6 mt-8 overflow-y-auto space-y-4">
          
          {/* Hints Section */}
          {hintLevel > 0 && (
            <div className="space-y-3 animate-in slide-in-from-left-4 duration-500">
               <div className="flex justify-between items-center px-2">
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Stödhjul aktivt</h4>
                  <button onClick={() => setHintLevel(0)} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-tighter">Rensa stöd</button>
               </div>
               
               {[1, 2, 3].map(lvl => lvl <= hintLevel && (
                  <div key={lvl} className={`p-4 rounded-2xl border-l-8 shadow-sm animate-in fade-in zoom-in duration-300 ${lvl === 1 ? 'bg-blue-50 border-blue-400 text-blue-900' : lvl === 2 ? 'bg-indigo-50 border-indigo-400 text-indigo-900' : 'bg-slate-900 border-slate-600 text-white'}`}>
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Nivå {lvl}</span>
                       {lvl === 3 && <Icons.Zap size={12} className="text-amber-400" />}
                    </div>
                    <p className="text-sm font-bold leading-snug">
                      {lvl === 1 ? task.hint1 : lvl === 2 ? task.hint2 : task.hint3}
                    </p>
                  </div>
               ))}
            </div>
          )}

          {/* Challenge Section */}
          {showChallenge && (
             <div className="animate-in slide-in-from-right-4 duration-500">
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-1 rounded-3xl shadow-xl">
                   <div className="bg-white rounded-[1.4rem] p-6 flex flex-col items-center text-center gap-3">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <Icons.Brain size={28} />
                      </div>
                      <h4 className="font-black text-amber-600 uppercase tracking-widest text-xs">Tankenöt: Extra Utmaning</h4>
                      <p className="text-lg font-bold text-slate-700 leading-tight">
                        {task.challenge}
                      </p>
                      <button onClick={() => setShowChallenge(false)} className="mt-2 text-[10px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest">Klar med utmaningen</button>
                   </div>
                </div>
             </div>
          )}

          {!showChallenge && hintLevel === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-40 py-12">
               <Icons.Book size={48} className="mb-2" />
               <p className="text-sm font-black uppercase tracking-widest">Väntar på interaktion</p>
            </div>
          )}
      </div>

      {/* Footer / Teacher Toggle */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Elevstyrd Differentiering</p>
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
            title="Redigera uppgift (Lärarläge)"
          >
            <Icons.Settings size={18} />
          </button>
      </div>

    </div>
  );
};
