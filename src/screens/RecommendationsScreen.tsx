import React, { useState } from 'react';
import { Movie, ScreenType } from '../types';
import { ALL_MOVIES, STREAMING_PROVIDERS } from '../data/mockData';
import { api } from '../services/api';
import {
  Sparkles,
  Star,
  Bookmark,
  Check,
  ThumbsDown,
  Info,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Share2,
} from 'lucide-react';

interface RecommendationsScreenProps {
  movies?: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onWatchMovie: (movie: Movie) => void;
  watchlist: string[];
  onToggleWatchlist: (movieId: string) => void;
  onRefinePreferences: () => void;
  onRestart: () => void;
  onNavigate: (screen: ScreenType) => void;
  onRefreshRecommendations?: () => void;
}

export const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({
  movies,
  onSelectMovie,
  onWatchMovie,
  watchlist,
  onToggleWatchlist,
  onRefinePreferences,
  onRestart,
  onNavigate,
  onRefreshRecommendations,
}) => {
  // Use passed recommendations, or default top 3
  const [currentMovies, setCurrentMovies] = useState<Movie[]>(
    movies && movies.length >= 3 ? movies : ALL_MOVIES.slice(0, 3)
  );
  const [watchedIds, setWatchedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync if prop changes
  React.useEffect(() => {
    if (movies && movies.length > 0) {
      setCurrentMovies(movies);
    }
  }, [movies]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleWatched = async (movie: Movie, e: React.MouseEvent) => {
    e.stopPropagation();
    const id = movie.id;
    const numericId = parseInt(id.replace(/(movie|tv)-/, ''), 10) || 0;

    if (watchedIds.includes(id)) {
      setWatchedIds(prev => prev.filter(item => item !== id));
      showToast('Desmarcado como assistido.');
    } else {
      setWatchedIds(prev => [...prev, id]);
      showToast('Marcado como já assistido!');
      // Record in history
      api.recordHistory({
        tmdbId: numericId,
        mediaType: movie.type === 'movie' ? 'movie' : 'tv',
        title: movie.title,
        interactionType: 'mark_watched',
      }).catch(() => {});
    }
  };

  const handleDislike = async (movie: Movie, e: React.MouseEvent) => {
    e.stopPropagation();
    const id = movie.id;
    const numericId = parseInt(id.replace(/(movie|tv)-/, ''), 10) || 0;

    // Record dislike in history
    api.recordHistory({
      tmdbId: numericId,
      mediaType: movie.type === 'movie' ? 'movie' : 'tv',
      title: movie.title,
      interactionType: 'dislike',
    }).catch(() => {});

    // Replace disliked movie with an alternate title from ALL_MOVIES
    const existingIds = currentMovies.map(m => m.id);
    const replacement = ALL_MOVIES.find(m => !existingIds.includes(m.id));
    if (replacement) {
      setCurrentMovies(prev => prev.map(m => (m.id === id ? replacement : m)));
      showToast(`Sugestão substituída por "${replacement.title}"!`);
    } else {
      showToast('Feedback registrado! Calibrando novas sugestões...');
      if (onRefreshRecommendations) onRefreshRecommendations();
    }
  };

  const handleGenerateOtherSuggestions = () => {
    if (onRefreshRecommendations) {
      onRefreshRecommendations();
      showToast('Buscando 3 novas recomendações no catálogo...');
    } else {
      // Rotate backup titles
      const shuffled = [...ALL_MOVIES].reverse().slice(0, 3);
      setCurrentMovies(shuffled);
      showToast('Geradas 3 novas sugestões inteligentes!');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#10111B] text-white py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D2030] text-white px-4 py-3 rounded-xl border border-violet-500/40 shadow-2xl flex items-center gap-2 text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ambient background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Header Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Resultado da Análise CineMatch AI</span>
          </div>

          <h1 className="font-['Outfit'] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Encontramos algo perfeito para você!
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Selecionamos três opções de alta compatibilidade com seu estado de espírito e disponíveis nas suas plataformas de streaming no Brasil.
          </p>
        </div>

        {/* The 3 Premium Recommendation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {currentMovies.slice(0, 3).map((movie, index) => {
            const isSaved = watchlist.includes(movie.id);
            const isWatched = watchedIds.includes(movie.id);
            const providersList = STREAMING_PROVIDERS.filter(p => movie.providers.includes(p.id));

            return (
              <div
                key={movie.id}
                className="group relative flex flex-col rounded-2xl bg-[#1A1D2E] border border-white/8 hover:border-violet-500/40 shadow-2xl shadow-black/60 overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Top Badge strip */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-cyan-300 shadow-md">
                    {movie.compatibilityScore}% Match
                  </span>
                  {isWatched && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-semibold flex items-center gap-1 shadow-md">
                      <Check className="w-3 h-3" /> Já assistido
                    </span>
                  )}
                </div>

                {/* Bookmark quick button */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onToggleWatchlist(movie.id);
                    showToast(isSaved ? 'Removido da Minha Lista.' : 'Adicionado à Minha Lista!');
                  }}
                  className={`absolute top-3 right-3 z-20 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md ${
                    isSaved
                      ? 'bg-violet-600 text-white'
                      : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80 border border-white/10'
                  }`}
                  title={isSaved ? 'Remover da Minha Lista' : 'Salvar na Minha Lista'}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                </button>

                {/* Poster Visual Area */}
                <div
                  className="aspect-[2/3] w-full overflow-hidden relative cursor-pointer"
                  onClick={() => onSelectMovie(movie)}
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1D2E] via-transparent to-black/30" />

                  {/* Play overlay hover indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <div className="p-4 rounded-full bg-violet-600 text-white shadow-xl shadow-violet-600/50 scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 fill-white" />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    {/* Metadata line without pills */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{movie.year}</span>
                      <span aria-hidden="true">·</span>
                      <span>{movie.durationOrSeasons}</span>
                      <span aria-hidden="true">·</span>
                      <span>{movie.ageRating}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 text-amber-400 font-semibold font-mono">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {movie.imdbRating}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectMovie(movie)}
                      className="font-['Outfit'] font-bold text-2xl text-white hover:text-cyan-300 cursor-pointer transition-colors leading-tight line-clamp-1"
                    >
                      {movie.title}
                    </h3>

                    {/* Genres */}
                    <div className="text-xs text-slate-400">
                      {movie.genre.join(' · ')}
                    </div>

                    {/* Synopsis */}
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {movie.synopsis}
                    </p>

                    {/* AI "Por que recomendamos?" Box */}
                    <div className="p-3.5 rounded-xl bg-[#141624] border border-violet-500/20 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Por que recomendamos?</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {movie.aiExplanation}
                      </p>
                    </div>

                    {/* Streaming providers badge */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-400">Disponível em:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {providersList.map(p => (
                          <span
                            key={p.id}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${p.bgBadge}`}
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Primary & Secondary Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onWatchMovie(movie)}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/20 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Assistir agora</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectMovie(movie)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#202337] hover:bg-[#282C45] text-slate-200 hover:text-white border border-white/10 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Ver detalhes</span>
                      </button>
                    </div>

                    {/* Quick utility feedback strip */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 px-1">
                      <button
                        type="button"
                        onClick={e => handleToggleWatched(movie, e)}
                        className={`hover:text-white transition-colors flex items-center gap-1 ${
                          isWatched ? 'text-emerald-400 font-semibold' : ''
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{isWatched ? 'Já assisti' : 'Marcar como assistido'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={e => handleDislike(movie, e)}
                        className="hover:text-rose-400 transition-colors flex items-center gap-1"
                        title="Substituir sugestão"
                      >
                        <ThumbsDown className="w-3 h-3" />
                        <span>Não gostei</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Options Strip: Não encontrou o que procurava? */}
        <div className="rounded-2xl bg-[#1A1D2E] border border-white/8 p-6 sm:p-8 text-center space-y-4">
          <h3 className="font-['Outfit'] font-bold text-lg sm:text-xl text-white">
            Não encontrou exatamente o que procurava?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Podemos calibrar outros 3 títulos ou ajustar suas preferências e serviços de streaming a qualquer momento.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleGenerateOtherSuggestions}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium text-xs sm:text-sm text-white shadow-md shadow-violet-600/30 flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Gerar outras 3 sugestões</span>
            </button>

            <button
              onClick={onRefinePreferences}
              className="px-5 py-2.5 rounded-xl bg-[#202337] hover:bg-[#282C45] border border-white/10 font-medium text-xs sm:text-sm text-slate-200 flex items-center gap-2 transition-all"
            >
              <Sliders className="w-4 h-4" />
              <span>Refinar minhas preferências</span>
            </button>

            <button
              onClick={onRestart}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-medium text-xs sm:text-sm transition-all"
            >
              Começar novamente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
