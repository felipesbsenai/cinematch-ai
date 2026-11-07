import React from 'react';
import { Movie } from '../types';
import { STREAMING_PROVIDERS } from '../data/mockData';
import { X, Play, ExternalLink, Check, Volume2, Maximize2, Shield } from 'lucide-react';

interface StreamingModalProps {
  movie: Movie | null;
  onClose: () => void;
}

export const StreamingModal: React.FC<StreamingModalProps> = ({ movie, onClose }) => {
  if (!movie) return null;

  const provider = STREAMING_PROVIDERS.find(p => movie.providers.includes(p.id)) || STREAMING_PROVIDERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#141624] border border-violet-500/30 shadow-2xl overflow-hidden text-white">
        {/* Header bar */}
        <div className="flex items-center justify-between p-4 bg-[#1A1D2E] border-b border-white/8">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${provider.bgBadge}`}>
              {provider.name}
            </span>
            <span className="text-xs text-slate-400">Redirecionando para reprodução</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player preview mockup */}
        <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141624] via-transparent to-black/60" />

          {/* Player controls overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-cyan-300 font-mono font-semibold">4K ULTRA HD · DOLBY VISION</span>
              <span className="text-xs bg-black/60 px-2 py-0.5 rounded text-slate-300">{movie.ageRating}</span>
            </div>

            <div className="text-center space-y-2">
              <button
                onClick={() => {
                  alert(`Iniciando streaming de "${movie.title}" no aplicativo da ${provider.name}. Bom filme!`);
                  onClose();
                }}
                className="w-16 h-16 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-violet-600/60 hover:scale-105 transition-all group cursor-pointer"
              >
                <Play className="w-8 h-8 fill-white ml-1 group-hover:scale-110 transition-transform" />
              </button>
              <div className="text-xs text-slate-300">Clique para dar play no app da {provider.name}</div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold">{movie.title} ({movie.year})</span>
              <span>{movie.durationOrSeasons}</span>
            </div>
          </div>
        </div>

        {/* Bottom Details & confirmation */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-['Outfit'] font-bold text-xl text-white">{movie.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {movie.genre.join(', ')} · Direção: {movie.director}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-cyan-400">{movie.compatibilityScore}% Match</span>
              <span className="text-[11px] block text-emerald-400">Incluso no seu plano</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {movie.synopsis}
          </p>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/8">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                alert(`Abrindo ${provider.name} para assistir "${movie.title}"...`);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-violet-600/30 flex items-center gap-1.5 transition-all"
            >
              <span>Abrir na {provider.name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
