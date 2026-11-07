import React from 'react';
import { ScreenType } from '../types';
import { Sparkles, Film, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (screen: ScreenType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#0D0E17] border-t border-white/8 py-12 px-4 sm:px-6 lg:px-8 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#10111B] rounded-[5px] flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-cyan-300" />
              </div>
            </div>
            <span className="font-['Outfit'] font-bold text-base tracking-tight text-white">
              CineMatch<span className="text-violet-400">.ai</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Stop searching. Start watching. Menos tempo procurando, mais tempo assistindo aos melhores filmes e séries.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors">
            Início
          </button>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <button onClick={() => onNavigate('conversation')} className="hover:text-white transition-colors">
            Assistente Conversacional
          </button>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <button onClick={() => onNavigate('watchlist')} className="hover:text-white transition-colors">
            Minha Lista
          </button>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <button onClick={() => onNavigate('preferences')} className="hover:text-white transition-colors">
            Configurar Streamings
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Film className="w-3.5 h-3.5 text-slate-600" />
          <span>© 2026 CineMatch AI Platform</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            Feito para cinéfilos <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" />
          </span>
        </div>
      </div>
    </footer>
  );
};
