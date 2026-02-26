import React from 'react';
import { Icons } from './icons';

interface CodeOfConductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeOfConductModal: React.FC<CodeOfConductModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
              Uppförandekod för <span className="text-indigo-600">Matteytan.se</span>
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <Icons.X size={24} />
            </button>
          </div>
          
          <div className="space-y-6 text-slate-600 leading-relaxed">
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
              <h3 className="text-lg font-black text-indigo-900 mb-2">Välkommen!</h3>
              <p className="text-indigo-800/80 font-medium">
                Vi strävar efter att göra Matteytan.se till en vänlig, välkomnande och trygg plats där alla kan lära sig, nätverka och växa tillsammans – helt fritt från trakasserier och dömande attityder.
              </p>
            </div>

            <p>Som en öppen community har vi medlemmar med olika bakgrund, könsidentitet, ålder, utbildningsnivå och erfarenhet. Vi förväntar oss att alla känner sig välkomna här, oavsett om du är nybörjare på matematik eller expert.</p>

            <section>
              <h3 className="text-sm font-black text-indigo-500 uppercase tracking-widest mb-4">Våra grundregler</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-black">1</div>
                  <div>
                    <h4 className="font-bold text-slate-800">Vi agerar med omtanke</h4>
                    <p className="text-sm">Vi tänker efter innan vi skriver. Vi förstår att det finns en riktig människa bakom skärmen. Vi låter inte frustration över ett svårt matteproblem eller en diskussion förvandlas till personangrepp.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-black">2</div>
                  <div>
                    <h4 className="font-bold text-slate-800">Vi är tålmodiga och snälla</h4>
                    <p className="text-sm">Vi avfärdar inte någon för att de har en annan kunskapsnivå eller bakgrund än vi själva. På Matteytan.se finns inga dumma frågor. Vi hånar aldrig någon för att de svarar fel.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-black">3</div>
                  <div>
                    <h4 className="font-bold text-slate-800">Vi tar ansvar och rättar till misstag</h4>
                    <p className="text-sm">Ingen förväntas veta allt. Om någon påpekar att ditt beteende har varit sårande: lyssna utan att gå i försvarsställning, ta till dig kritiken och försöök lösa situationen konstruktivt.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
              <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-3">Nolltolerans</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm font-bold text-rose-800/70">
                <li>• Våldsamma hot</li>
                <li>• Diskriminerande kommentarer</li>
                <li>• Kränkande ordval</li>
                <li>• Trakasserier</li>
                <li>• Doxxing (privat info)</li>
                <li>• Explicit material</li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Så hanterar vi överträdelser</h3>
              <p className="text-sm">Om något har hänt som får dig att känna dig exkluderad eller otrygg: Försök prata med personen privat om det känns tryggt, annars kontakta administratörerna direkt. Vi hanterar alla rapporter konfidentiellt.</p>
            </section>

            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">Konsekvenser</h3>
              <p className="text-sm">Moderatorer har rätt att agera vid brott mot denna kod. Detta kan leda till varning, radering av inlägg, tillfällig avstängning eller permanent bannlysning. Vid allvarliga fall görs polisanmälan.</p>
            </section>
          </div>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-indigo-600 text-white rounded-full font-black text-sm shadow-lg hover:bg-indigo-700 transition-all"
          >
            JAG ACCEPTERAR
          </button>
        </div>
      </div>
    </div>
  );
};
