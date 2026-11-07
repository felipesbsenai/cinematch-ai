import React from 'react';
import { ScreenType } from '../types';
import { Sparkles, Bookmark, Sliders, Layers } from 'lucide-react';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  watchlistCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  watchlistCount,
}) => {
  return (
    <>
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 w-full bg-[#10111B]/90 backdrop-blur-md border-b border-white/8 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 lg:px-8 h-16">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/20">
              <div className="w-full h-full bg-[#10111B] rounded-[7px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <span className="font-['Outfit'] font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-200 transition-colors">
              CineMatch<span className="text-violet-400">.ai</span>
            </span>
          </button>

          {/* Zone 2: Navigation Links (single-line, concise) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button
              onClick={() => onNavigate('landing')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentScreen === 'landing' ? 'text-white font-semibold' : ''
              }`}
            >
              Início
            </button>
            <button
              onClick={() => onNavigate('watchlist')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentScreen === 'watchlist' ? 'text-white font-semibold' : ''
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Minha Lista</span>
              {watchlistCount > 0 && (
                <span className="ml-0.5 text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.2 rounded-full tabular-nums font-mono">
                  {watchlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate('preferences')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentScreen === 'preferences' ? 'text-white font-semibold' : ''
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Preferências</span>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('como-funciona');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onNavigate('landing');
                  setTimeout(() => {
                    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Como Funciona
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('conversation')}
              className="relative group px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-md shadow-violet-600/30 hover:shadow-violet-600/50 flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>Iniciar Descoberta</span>
            </button>
          </div>
        </div>
      </header>

      {/* Screen Switcher Strip: enables testing each of the 7 Stitch screens */}
      <div className="bg-[#161826]/95 border-b border-white/5 py-1.5 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400 shrink-0">
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-medium text-slate-300">Telas do Protótipo:</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {[
              { id: 'landing', label: '01 · Início' },
              { id: 'conversation', label: '02 · Conversa IA' },
              { id: 'processing', label: '03 · Processando' },
              { id: 'recommendations', label: '04 · Recomendações' },
              { id: 'details', label: '05 · Detalhes' },
              { id: 'watchlist', label: '06 · Minha Lista' },
              { id: 'preferences', label: '07 · Preferências' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as ScreenType)}
                className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap shrink-0 ${
                  currentScreen === item.id
                    ? 'bg-violet-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
