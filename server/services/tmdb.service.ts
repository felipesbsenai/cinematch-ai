import { Movie, StreamingProvider } from '../../src/types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_W500 = 'https://image.tmdb.org/t/p/w500';
const IMAGE_BASE_ORIGINAL = 'https://image.tmdb.org/t/p/w1280';

// In-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache<T>(key: string, data: T, ttlSeconds: number = 900): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export interface TmdbWatchProviderItem {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface TmdbWatchProvidersResponse {
  link?: string;
  flatrate?: TmdbWatchProviderItem[];
  rent?: TmdbWatchProviderItem[];
  buy?: TmdbWatchProviderItem[];
  free?: TmdbWatchProviderItem[];
  ads?: TmdbWatchProviderItem[];
}

export class TmdbService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private async fetchTmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error(
        'TMDB_API_KEY não configurada no servidor. Defina a variável de ambiente TMDB_API_KEY no arquivo .env ou no painel de segredos.'
      );
    }

    const query = new URLSearchParams({
      api_key: this.apiKey,
      language: 'pt-BR',
      ...params,
    });

    const url = `${TMDB_BASE_URL}${endpoint}?${query.toString()}`;
    const cacheKey = url;
    const cached = getCached<T>(cacheKey);
    if (cached) return cached;

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[TMDB API Error] ${res.status} on ${endpoint}:`, errText);
      throw new Error(`Erro na API do TMDB (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as T;
    setCache(cacheKey, data, 900); // 15 min cache
    return data;
  }

  // Map known TMDB provider names to CineMatch normalized IDs
  public normalizeProviderId(providerName: string): string {
    const lower = providerName.toLowerCase();
    if (lower.includes('netflix')) return 'netflix';
    if (lower.includes('amazon') || lower.includes('prime')) return 'prime';
    if (lower.includes('disney')) return 'disney';
    if (lower.includes('max') || lower.includes('hbo')) return 'max';
    if (lower.includes('apple')) return 'apple';
    if (lower.includes('globo')) return 'globoplay';
    if (lower.includes('paramount')) return 'paramount';
    return lower.replace(/[^a-z0-9]/g, '');
  }

  // Get Watch Providers for Brazil (BR)
  async getWatchProviders(
    mediaType: 'movie' | 'tv',
    id: number
  ): Promise<{
    flatrate: string[];
    rent: string[];
    buy: string[];
    link?: string;
    allProviderDetails: TmdbWatchProviderItem[];
  }> {
    const endpoint = `/${mediaType}/${id}/watch/providers`;
    try {
      const data = await this.fetchTmdb<{ results?: Record<string, TmdbWatchProvidersResponse> }>(endpoint);
      const brData = data.results?.BR;

      if (!brData) {
        return { flatrate: [], rent: [], buy: [], allProviderDetails: [] };
      }

      const flatrate = (brData.flatrate || []).map(p => this.normalizeProviderId(p.provider_name));
      const rent = (brData.rent || []).map(p => this.normalizeProviderId(p.provider_name));
      const buy = (brData.buy || []).map(p => this.normalizeProviderId(p.provider_name));

      return {
        flatrate,
        rent,
        buy,
        link: brData.link,
        allProviderDetails: [...(brData.flatrate || []), ...(brData.rent || [])],
      };
    } catch (err) {
      console.warn(`[TMDB] Could not fetch watch providers for ${mediaType} ${id}:`, err);
      return { flatrate: [], rent: [], buy: [], allProviderDetails: [] };
    }
  }

  // Search Movies
  async searchMovies(query: string, page: number = 1): Promise<any> {
    return this.fetchTmdb('/search/movie', { query, page: String(page) });
  }

  // Search TV Shows
  async searchTv(query: string, page: number = 1): Promise<any> {
    return this.fetchTmdb('/search/tv', { query, page: String(page) });
  }

  // Get Movie Details with Credits, Videos and Providers
  async getMovieDetails(id: number): Promise<any> {
    return this.fetchTmdb(`/movie/${id}`, {
      append_to_response: 'credits,videos,watch/providers,release_dates',
    });
  }

  // Get TV Show Details
  async getTvDetails(id: number): Promise<any> {
    return this.fetchTmdb(`/tv/${id}`, {
      append_to_response: 'credits,videos,watch/providers,content_ratings',
    });
  }

  // Get Trending Titles for the landing page
  async getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all'): Promise<any> {
    return this.fetchTmdb(`/trending/${mediaType}/week`);
  }

  // Get Genres Map
  async getGenres(): Promise<{ id: number; name: string }[]> {
    const cacheKey = 'tmdb_genres_pt_br';
    const cached = getCached<{ id: number; name: string }[]>(cacheKey);
    if (cached) return cached;

    try {
      const movieGenres = await this.fetchTmdb<{ genres: { id: number; name: string }[] }>('/genre/movie/list');
      const tvGenres = await this.fetchTmdb<{ genres: { id: number; name: string }[] }>('/genre/tv/list');

      const map = new Map<number, string>();
      movieGenres.genres.forEach(g => map.set(g.id, g.name));
      tvGenres.genres.forEach(g => map.set(g.id, g.name));

      const merged = Array.from(map.entries()).map(([id, name]) => ({ id, name }));
      setCache(cacheKey, merged, 86400); // 24h
      return merged;
    } catch (e) {
      console.warn('[TMDB] Fallback genres due to error:', e);
      return [
        { id: 28, name: 'Ação' },
        { id: 12, name: 'Aventura' },
        { id: 16, name: 'Animação' },
        { id: 35, name: 'Comédia' },
        { id: 80, name: 'Crime' },
        { id: 99, name: 'Documentário' },
        { id: 18, name: 'Drama' },
        { id: 10751, name: 'Família' },
        { id: 14, name: 'Fantasia' },
        { id: 36, name: 'História' },
        { id: 27, name: 'Terror' },
        { id: 10402, name: 'Música' },
        { id: 9648, name: 'Mistério' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Ficção científica' },
        { id: 53, name: 'Suspense' },
      ];
    }
  }

  // Discover Movies or Series with dynamic filters
  async discover(options: {
    mediaType: 'movie' | 'tv';
    withGenres?: number[];
    withoutGenres?: number[];
    minRating?: number;
    yearRange?: { start?: number; end?: number };
    sortBy?: string;
    watchRegion?: string;
    withWatchProviders?: string;
  }): Promise<any[]> {
    const params: Record<string, string> = {
      sort_by: options.sortBy || 'popularity.desc',
      'vote_count.gte': '150',
    };

    if (options.withGenres && options.withGenres.length > 0) {
      params.with_genres = options.withGenres.join(',');
    }
    if (options.withoutGenres && options.withoutGenres.length > 0) {
      params.without_genres = options.withoutGenres.join(',');
    }
    if (options.minRating) {
      params['vote_average.gte'] = String(options.minRating);
    }
    if (options.yearRange?.start) {
      if (options.mediaType === 'movie') {
        params['primary_release_date.gte'] = `${options.yearRange.start}-01-01`;
      } else {
        params['first_air_date.gte'] = `${options.yearRange.start}-01-01`;
      }
    }
    if (options.yearRange?.end) {
      if (options.mediaType === 'movie') {
        params['primary_release_date.lte'] = `${options.yearRange.end}-12-31`;
      } else {
        params['first_air_date.lte'] = `${options.yearRange.end}-12-31`;
      }
    }

    const endpoint = options.mediaType === 'movie' ? '/discover/movie' : '/discover/tv';
    const data = await this.fetchTmdb<{ results: any[] }>(endpoint, params);
    return data.results || [];
  }

  // Convert TMDB raw movie or tv object to standard CineMatch Movie structure
  async formatToCineMatchMovie(
    item: any,
    mediaType: 'movie' | 'tv',
    compatibilityScore: number = 90,
    aiExplanation: string = 'Recomendado com base no seu humor e preferências atuais.'
  ): Promise<Movie> {
    const id = item.id;
    const title = item.title || item.name || 'Título Desconhecido';
    const originalTitle = item.original_title || item.original_name;
    const releaseDate = item.release_date || item.first_air_date || '';
    const year = releaseDate ? parseInt(releaseDate.slice(0, 4), 10) : new Date().getFullYear();

    // Poster and Backdrop full URLs
    const posterUrl = item.poster_path
      ? `${IMAGE_BASE_W500}${item.poster_path}`
      : '/src/assets/images/poster_interstellar_1794061033270.jpg';
    const backdropUrl = item.backdrop_path
      ? `${IMAGE_BASE_ORIGINAL}${item.backdrop_path}`
      : '/src/assets/images/backdrop_interstellar_1794061034046.jpg';

    // Providers
    const watchData = await this.getWatchProviders(mediaType, id);
    const providers = watchData.flatrate.length > 0 ? watchData.flatrate : ['netflix'];

    // Duration or seasons
    let durationOrSeasons = 'Duração não informada';
    if (mediaType === 'movie') {
      if (item.runtime) {
        const hrs = Math.floor(item.runtime / 60);
        const mins = item.runtime % 60;
        durationOrSeasons = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
      } else {
        durationOrSeasons = '2h aproximadas';
      }
    } else {
      const seasons = item.number_of_seasons || 1;
      durationOrSeasons = `${seasons} ${seasons === 1 ? 'Temporada' : 'Temporadas'}`;
    }

    // Genres
    let genreNames: string[] = [];
    if (item.genres && Array.isArray(item.genres)) {
      genreNames = item.genres.map((g: any) => g.name);
    } else if (item.genre_ids && Array.isArray(item.genre_ids)) {
      const allGenres = await this.getGenres();
      const genreMap = new Map(allGenres.map(g => [g.id, g.name]));
      genreNames = item.genre_ids.map((gid: number) => genreMap.get(gid)).filter(Boolean) as string[];
    }
    if (genreNames.length === 0) {
      genreNames = ['Entretenimento'];
    }

    // Cast & Director
    const cast: { name: string; character: string }[] = [];
    let director = 'Informação não disponível';
    let screenplay = '';

    if (item.credits) {
      if (item.credits.cast) {
        item.credits.cast.slice(0, 5).forEach((c: any) => {
          cast.push({ name: c.name, character: c.character || 'Elenco' });
        });
      }
      if (item.credits.crew) {
        const dir = item.credits.crew.find((cr: any) => cr.job === 'Director');
        if (dir) director = dir.name;
        const writer = item.credits.crew.find((cr: any) => cr.job === 'Screenplay' || cr.job === 'Writer');
        if (writer) screenplay = writer.name;
      }
    }

    if (cast.length === 0) {
      cast.push({ name: 'Elenco principal do TMDB', character: 'Diversos' });
    }

    // Age Rating
    let ageRating = '14+';
    if (mediaType === 'movie' && item.release_dates?.results) {
      const brRelease = item.release_dates.results.find((r: any) => r.iso_3166_1 === 'BR');
      if (brRelease?.release_dates?.[0]?.certification) {
        ageRating = `${brRelease.release_dates[0].certification}+`;
      }
    } else if (mediaType === 'tv' && item.content_ratings?.results) {
      const brRating = item.content_ratings.results.find((r: any) => r.iso_3166_1 === 'BR');
      if (brRating?.rating) {
        ageRating = `${brRating.rating}+`;
      }
    }

    return {
      id: `${mediaType}-${id}`,
      title,
      originalTitle,
      type: mediaType === 'movie' ? 'movie' : 'series',
      year,
      durationOrSeasons,
      genre: genreNames,
      imdbRating: Number((item.vote_average || 7.5).toFixed(1)),
      tmdbRating: Number((item.vote_average || 7.5).toFixed(1)),
      ageRating,
      compatibilityScore,
      synopsis: item.overview || 'Sinopse não informada pelo distribuidor oficial.',
      aiExplanation,
      posterUrl,
      backdropUrl,
      director,
      screenplay,
      cast,
      providers,
      availableOnUserSubscription: true,
      trailerUrl: watchData.link,
      tags: genreNames.slice(0, 3).concat([`${year}`, `${ageRating}`]),
    };
  }
}

export const tmdbService = new TmdbService();
