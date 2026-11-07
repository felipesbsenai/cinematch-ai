import React, { useState } from 'react';
import { Movie, ScreenType } from '../types';
import { STREAMING_PROVIDERS } from '../data/mockData';
import {
  ArrowLeft,
  Play,
  Bookmark,
  Check,
  Star,
  Sparkles,
  Share2,
  Clock,
  Tv,
  Film,
  Award,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface MovieDetailsScreenProps {
  movie: Movie;
  onBack: () => void;
  onWatch: (movie: Movie) => void;
  isSavedInWatchlist: boolean;
  onToggleWatchlist: (movieId: string) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const MovieDetailsScreen: React.FC<MovieDetailsScreenProps> = ({
  movie,
  onBack,
  onWatch,
  isSavedInWatchlist,
  onToggleWatchlist,
  onNavigate,
}) => {
  const [isWatched, setIsWatched] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const providers = STREAMING_PROVIDERS.filter(p => movie.providers.includes(p.id));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: `Veja "${movie.title}" no CineMatch AI: ${movie.aiExplanation}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Link do filme copiado para a área de transferência!');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#10111B] text-white">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D2030] text-white px-4 py-3 rounded-xl border border-violet-500/40 shadow-2xl flex items-center gap-2 text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cinematic Full-Width Backdrop Header */}
      <div className="relative w-full h-[360px] sm:h-[460px] lg:h-[540px] overflow-hidden">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        {/* Gradients to merge seamlessly into dark background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#10111B] via-[#10111B]/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#10111B] via-transparent to-[#10111B]/80" />

        {/* Back navigation */}
        <div className="absolute top-6 left-4 sm:left-8 z-30">
          <button
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/90 border border-white/15 text-slate-200 hover:text-white backdrop-blur-md text-xs font-semibold flex items-center gap-2 transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar às Recomendações</span>
          </button>
        </div>

        {/* Backdrop Bottom Floating Title Strip on Mobile */}
        <div className="absolute bottom-6 left-4 sm:left-8 right-4 lg:hidden z-20">
          <span className="px-2.5 py-1 rounded bg-violet-600/90 text-white font-mono text-xs font-bold inline-block mb-2">
            {movie.compatibilityScore}% Match com seu humor
          </span>
          <h1 className="font-['Outfit'] text-3xl font-extrabold text-white leading-tight">
            {movie.title}
          </h1>
        </div>
      </div>

      {/* Main Content Details Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-36 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Big Poster & Quick CTAs */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#1A1D2E] shadow-2xl shadow-black/80 aspect-[2/3] w-full max-w-sm mx-auto relative group">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-violet-600/90 text-white font-mono text-xs font-bold shadow-lg">
                {movie.compatibilityScore}% Match
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 max-w-sm mx-auto">
              <button
                onClick={() => onWatch(movie)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold text-white text-sm shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Assistir agora na {providers[0]?.name || 'Plataforma'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onToggleWatchlist(movie.id);
                    showToast(isSavedInWatchlist ? 'Removido da sua lista' : 'Adicionado à sua lista!');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    isSavedInWatchlist
                      ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                      : 'bg-[#1D2030] hover:bg-[#25283D] border-white/10 text-slate-200'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSavedInWatchlist ? 'fill-current' : ''}`} />
                  <span>{isSavedInWatchlist ? 'Na Minha Lista' : 'Salvar na Lista'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsWatched(!isWatched);
                    showToast(!isWatched ? 'Marcado como assistido!' : 'Desmarcado como assistido.');
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    isWatched
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-[#1D2030] hover:bg-[#25283D] border-white/10 text-slate-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isWatched ? 'Já assisti' : 'Marcar assistido'}</span>
                </button>
              </div>

              <button
                onClick={handleShare}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartilhar recomendação</span>
              </button>
            </div>
          </div>

          {/* Right Column: In-Depth Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Title Section (Desktop) */}
            <div className="hidden lg:block space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-violet-600/90 text-white font-mono text-xs font-bold shadow-md">
                  {movie.compatibilityScore}% Compatibilidade com seu perfil
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                  {movie.type === 'movie' ? 'Longa-metragem' : 'Série de TV'}
                </span>
              </div>

              <h1 className="font-['Outfit'] text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {movie.title}
              </h1>

              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <p className="text-sm text-slate-400 italic">
                  Título original: {movie.originalTitle}
                </p>
              )}
            </div>

            {/* Quick Specs strip without pills */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 border-y border-white/8 py-3">
              <span className="font-semibold text-white">{movie.year}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{movie.durationOrSeasons}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-mono font-bold">{movie.ageRating}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                <Star className="w-4 h-4 fill-amber-400" />
                IMDb {movie.imdbRating}
              </span>
              {movie.tmdbRating && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-cyan-400 font-mono">TMDB {movie.tmdbRating}</span>
                </>
              )}
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">{movie.genre.join(', ')}</span>
            </div>

            {/* AI Recommendation Deep Insight Box */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-violet-950/40 via-[#1A1D2E] to-[#141624] border border-violet-500/30 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Análise de Compatibilidade CineMatch AI</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {movie.aiExplanation}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {movie.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-slate-300 border border-white/8"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-3">
              <h3 className="font-['Outfit'] font-bold text-xl text-white">Sinopse</h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {movie.synopsis}
              </p>
            </div>

            {/* Streaming Availability Cards */}
            <div className="space-y-3">
              <h3 className="font-['Outfit'] font-bold text-xl text-white">Onde assistir agora</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {providers.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onWatch(movie)}
                    className="p-4 rounded-xl bg-[#1A1D2E] hover:bg-[#202438] border border-white/8 hover:border-violet-500/40 cursor-pointer transition-all flex items-center justify-between group shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`px-2.5 py-1 rounded-lg font-bold text-xs border ${p.bgBadge}`}>
                        {p.name}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Incluso na assinatura</div>
                        <div className="text-xs text-emerald-400">Pronto para reproduzir</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>

            {/* Crew & Cast */}
            <div className="space-y-4 pt-4 border-t border-white/8">
              <h3 className="font-['Outfit'] font-bold text-xl text-white">Ficha Técnica & Elenco</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-xs">Direção</span>
                  <span className="font-semibold text-white">{movie.director}</span>
                </div>
                {movie.screenplay && (
                  <div>
                    <span className="text-slate-400 block text-xs">Roteiro</span>
                    <span className="font-semibold text-white">{movie.screenplay}</span>
                  </div>
                )}
              </div>

              {/* Cast List */}
              <div className="space-y-2">
                <span className="text-slate-400 block text-xs">Elenco Principal</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {movie.cast.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#161826] border border-white/5">
                      <div className="font-semibold text-xs text-white truncate">{c.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{c.character}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
