import React, { useState, useEffect } from 'react';
import { Movie, ScreenType } from '../types';
import { ALL_MOVIES, STREAMING_PROVIDERS } from '../data/mockData';
import { api } from '../services/api';
import {
  Bookmark,
  Trash2,
  Check,
  Star,
  Play,
  Filter,
  Plus,
  Sparkles,
  Info,
  Clock,
  Film,
} from 'lucide-react';

interface WatchlistScreenProps {
  watchlistIds: string[];
  onRemoveFromWatchlist: (movieId: string) => void;
  onSelectMovie: (movie: Movie) => void;
  onWatchMovie: (movie: Movie) => void;
  onStartDiscovery: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const WatchlistScreen: React.FC<WatchlistScreenProps> = ({
  watchlistIds,
  onRemoveFromWatchlist,
  onSelectMovie,
  onWatchMovie,
  onStartDiscovery,
  onNavigate,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unwatched' | 'watched'>('all');
  const [watchedIds, setWatchedIds] = useState<string[]>([]);
  const [dbItems, setDbItems] = useState<Movie[]>([]);

  useEffect(() => {
    api.getWatchlist()
      .then(items => {
        if (Array.isArray(items)) {
          const mapped: Movie[] = items.map((i: any) => ({
            id: `${i.mediaType}-${i.tmdbId}`,
            title: i.title,
            type: i.mediaType,
            year: i.releaseDate ? parseInt(i.releaseDate.slice(0, 4), 10) : 2024,
            durationOrSeasons: i.mediaType === 'movie' ? '2h aprox.' : '1 Temporada',
            genre: i.genre || ['Entretenimento'],
            imdbRating: i.voteAverage || 8.0,
            tmdbRating: i.voteAverage || 8.0,
            ageRating: '14+',
            compatibilityScore: 95,
            synopsis: i.overview || '',
            aiExplanation: 'Salvo na sua lista de interesses.',
            posterUrl: i.posterPath || '/src/assets/images/poster_interstellar_1794061033270.jpg',
            backdropUrl: i.backdropPath || '/src/assets/images/backdrop_interstellar_1794061034046.jpg',
            director: 'Diretor TMDB',
            cast: [{ name: 'Elenco principal', character: 'Diversos' }],
            providers: i.providers && i.providers.length > 0 ? i.providers : ['netflix'],
            tags: i.genre || [],
          }));
          setDbItems(mapped);
          setWatchedIds(items.filter((i: any) => i.watched).map((i: any) => `${i.mediaType}-${i.tmdbId}`));
        }
      })
      .catch(() => {});
  }, [watchlistIds]);

  // Combine items from db and mock fallback
  const allPool = [...dbItems, ...ALL_MOVIES];
  const uniquePool = Array.from(new Map(allPool.map(m => [m.id, m])).values());
  const savedMovies = uniquePool.filter(m => watchlistIds.includes(m.id) || dbItems.some(d => d.id === m.id));

  // Extract all unique genres in watchlist
  const availableGenres = Array.from(
    new Set(savedMovies.flatMap(m => m.genre))
  );

  // Filtered movies
  const filteredMovies = savedMovies.filter(m => {
    if (selectedProvider !== 'all' && !m.providers.includes(selectedProvider)) {
      return false;
    }
    if (selectedGenre !== 'all' && !m.genre.includes(selectedGenre)) {
      return false;
    }
    if (statusFilter === 'watched' && !watchedIds.includes(m.id)) {
      return false;
    }
    if (statusFilter === 'unwatched' && watchedIds.includes(m.id)) {
      return false;
    }
    return true;
  });

  const toggleWatched = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    api.toggleWatchlistWatched(id).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#10111B] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-widest">
              <Bookmark className="w-3.5 h-3.5 fill-violet-400" />
              <span>Sua Seleção Pessoal</span>
            </div>
            <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              Minha Lista
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {savedMovies.length} {savedMovies.length === 1 ? 'título salvo' : 'títulos salvos'} para assistir quando quiser.
            </p>
          </div>

          <button
            onClick={onStartDiscovery}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-violet-600/30 flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Adicionar com a IA</span>
          </button>
        </div>

        {/* Filter Controls (Segmented Tabs adhering to Section 1.A) */}
        {savedMovies.length > 0 && (
          <div className="space-y-4">
            {/* Status Segmented Control */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center p-1 bg-[#1A1D2E] rounded-xl border border-white/8 text-xs font-medium">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    statusFilter === 'all'
                      ? 'bg-violet-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({savedMovies.length})
                </button>
                <button
                  onClick={() => setStatusFilter('unwatched')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    statusFilter === 'unwatched'
                      ? 'bg-violet-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Por Assistir ({savedMovies.filter(m => !watchedIds.includes(m.id)).length})
                </button>
                <button
                  onClick={() => setStatusFilter('watched')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    statusFilter === 'watched'
                      ? 'bg-violet-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Já Assistidos ({savedMovies.filter(m => watchedIds.includes(m.id)).length})
                </button>
              </div>

              {/* Streaming Filter Select */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedProvider}
                  onChange={e => setSelectedProvider(e.target.value)}
                  className="bg-[#1A1D2E] border border-white/8 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="all">Todos os Streamings</option>
                  {STREAMING_PROVIDERS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {/* Genre Filter Select */}
                {availableGenres.length > 0 && (
                  <select
                    value={selectedGenre}
                    onChange={e => setSelectedGenre(e.target.value)}
                    className="bg-[#1A1D2E] border border-white/8 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="all">Todos os Gêneros</option>
                    {availableGenres.map(g => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Watchlist Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map(movie => {
              const isWatched = watchedIds.includes(movie.id);

              return (
                <div
                  key={movie.id}
                  className="group rounded-2xl bg-[#1A1D2E] border border-white/8 hover:border-violet-500/40 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Poster Area */}
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

                    {/* Top status badges */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-mono font-bold text-cyan-300">
                        {movie.compatibilityScore}%
                      </span>
                      {isWatched && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold">
                          Assistido
                        </span>
                      )}
                    </div>

                    {/* Trash remove button */}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onRemoveFromWatchlist(movie.id);
                      }}
                      className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-rose-600/90 text-slate-300 hover:text-white backdrop-blur-md transition-colors border border-white/10"
                      title="Remover da lista"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Info area */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{movie.year}</span>
                        <span>·</span>
                        <span>{movie.durationOrSeasons}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {movie.imdbRating}
                        </span>
                      </div>

                      <h3
                        onClick={() => onSelectMovie(movie)}
                        className="font-bold text-base text-white hover:text-cyan-300 cursor-pointer transition-colors line-clamp-1"
                      >
                        {movie.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {movie.synopsis}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => onWatchMovie(movie)}
                        className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Assistir agora</span>
                      </button>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <button
                          onClick={e => toggleWatched(movie.id, e)}
                          className={`hover:text-white transition-colors flex items-center gap-1 ${
                            isWatched ? 'text-emerald-400 font-semibold' : ''
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{isWatched ? 'Assistido' : 'Marcar assistido'}</span>
                        </button>

                        <button
                          onClick={() => onSelectMovie(movie)}
                          className="hover:text-cyan-300 transition-colors flex items-center gap-0.5"
                        >
                          <span>Detalhes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 px-4 rounded-3xl bg-[#1A1D2E] border border-white/8 max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-400">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="font-['Outfit'] font-bold text-xl text-white">Sua lista está vazia</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Nenhum título corresponde aos filtros atuais. Que tal iniciar uma nova conversa com a IA para descobrir filmes incríveis?
            </p>
            <div className="pt-2">
              <button
                onClick={onStartDiscovery}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold text-xs text-white shadow-lg shadow-violet-600/30 inline-flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Descobrir o que assistir</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
