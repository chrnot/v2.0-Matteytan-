import React from 'react';

interface LogoProps {
  darkMode?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ darkMode }) => {
  return (
    <div className="absolute top-6 left-6 z-30 flex items-center gap-3 select-none pointer-events-none transition-opacity duration-500">
       {/* Icon Container */}
       <div className="relative w-11 h-11 rounded-xl shadow-lg flex items-center justify-center transform -rotate-2 overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 border border-white/20">
          
          {/* Subtle grid texture inside logo */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:4px_4px]"></div>
          
          {/* Math Symbols: Pi */}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 drop-shadow-md">
             <path d="M5 6h14" />
             <path d="M8 6v14" />
             <path d="M16 6v11c0 1.5.5 2 2 2" />
          </svg>
          
          {/* Decorative element */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-tl-lg flex items-center justify-center">
             <span className="text-[10px] font-bold text-amber-900 leading-none pb-[1px] pr-[1px]">÷</span>
          </div>
       </div>
       
       {/* Text */}
       <div className="flex flex-col leading-none">
          <span className={`text-2xl font-bold tracking-tight drop-shadow-sm transition-colors duration-300 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Matte<span className="text-blue-500">ytan</span>
          </span>
          <span className={`text-[10px] font-semibold tracking-[0.2em] uppercase mt-0.5 transition-colors duration-300 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
            Digitalt Klassrum
          </span>
       </div>
    </div>
  );
};