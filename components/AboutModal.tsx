import React from 'react';
import { Icons } from './icons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
              Om Matteytan – <span className="text-blue-600">Där abstrakt matematik blir konkret</span>
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <Icons.X size={24} />
            </button>
          </div>
          
          <div className="space-y-6 text-slate-600 leading-relaxed">
            <p className="text-lg font-medium text-slate-700">
              Välkommen till Matteytan. Vi vet att matematiklärare ofta tvingas hoppa mellan olika flikar, fysiska plockmaterial och statiska presentationer för att få fram sin poäng. Matteytan är lösningen på det problemet – en samlad, digital startpunkt för dina lektioner.
            </p>

            <section>
              <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-2">Vad är Matteytan?</h3>
              <p>Tänk dig en klassisk whiteboard, fast smartare. Matteytan fungerar som en interaktiv canvas där du fritt placerar ut skräddarsydda "widgets" anpassade för matematikundervisning.</p>
            </section>

            <section>
              <h3 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-2">Varför använda Matteytan?</h3>
              <p className="mb-4">Vi bygger våra verktyg på beprövad matematikdidaktik. Vi vet att elever lär sig bäst när de får se och pröva själva. Därför erbjuder vi verktyg som:</p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-1 text-blue-500"><Icons.Sparkles size={18}/></div>
                  <div><strong className="text-slate-800">Visualiserar det osynliga:</strong> Med Bråkstavarna och Prim-bubblorna blir abstrakta talrelationer fysiska objekt som går att flytta och kombinera.</div>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 text-blue-500"><Icons.Scale size={18}/></div>
                  <div><strong className="text-slate-800">Bygger broar till algebra:</strong> Genom Tändsticksgåtan och Ekvationsvågen hjälper vi elever att gå från konkret plockmaterial till att förstå variabler och formler.</div>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 text-blue-500"><Icons.Tools size={18}/></div>
                  <div><strong className="text-slate-800">Sparar tid:</strong> Slipp leta efter linjaler eller tärningar. Med Geometri-kitet och Chans-generatorn har du alltid verktygen ett klick bort.</div>
                </li>
              </ul>
            </section>

            <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-2">För svenska klassrum</h3>
              <p className="text-sm">Matteytan är utvecklad med den svenska läroplanen i åtanke. Från tallinjer och koordinatsystem till sannolikhetslära – allt är designat för att passa in direkt i din undervisning, oavsett om du undervisar på låg-, mellan- eller högstadiet.</p>
            </section>

            <p className="text-center font-black text-slate-400 uppercase text-xs tracking-[0.2em] pt-4">
              Inga onödiga animationer. Inget krångel. Bara en ren yta för matematik.
            </p>
          </div>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-black text-sm shadow-lg hover:bg-blue-700 transition-all"
          >
            FÖRSTÅTT!
          </button>
        </div>
      </div>
    </div>
  );
};
