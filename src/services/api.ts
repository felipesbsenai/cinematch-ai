import { Movie, UserPreferences, ConversationAnswer } from '../types';

export interface ApiStatus {
  status: string;
  version: string;
  services: {
    gemini: {
      configured: boolean;
      model: string;
      mode: string;
    };
    tmdb: {
      configured: boolean;
      mode: string;
      country: string;
    };
    database: {
      status: string;
      watchlistCount: number;
      historyCount: number;
    };
  };
  setupInstructions: {
    gemini: string | null;
    tmdb: string | null;
  };
}

export interface ConversationTurnResult {
  success: boolean;
  sessionId: string;
  reply: string;
  readyForRecommendations: boolean;
  mood?: string;
  contentType?: 'movie' | 'series' | 'all';
  preferredGenres?: string[];
  rejectedGenres?: string[];
  preferredDuration?: string;
  watchingWith?: 'sozinho' | 'casal' | 'amigos' | 'familia' | 'qualquer';
  streamingProviders?: string[];
  suggestedQuickReplies?: string[];
  confidence: number;
  error?: string;
}

export const api = {
  // Service Health & Setup Status
  async getStatus(): Promise<ApiStatus> {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // AI Dialogue turn
  async sendConversationTurn(
    messages: Array<{ sender: 'user' | 'ai'; text: string }>,
    sessionId?: string,
    userId: string = 'default-user'
  ): Promise<ConversationTurnResult> {
    const res = await fetch('/api/ai/conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, sessionId, userId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // Recommendation Engine call
  async getRecommendations(params: {
    userId?: string;
    mood?: string;
    contentType?: 'movie' | 'series' | 'all';
    preferredGenres?: string[];
    rejectedGenres?: string[];
    preferredDuration?: string;
    watchingWith?: string;
    userStreamingServices?: string[];
  }): Promise<Movie[]> {
    const res = await fetch('/api/ai/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.recommendations || [];
  },

  // Trending catalog for Landing Screen
  async getTrending(): Promise<Movie[]> {
    const res = await fetch('/api/movies/trending');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.results || [];
  },

  // Watchlist persistence
  async getWatchlist(userId: string = 'default-user'): Promise<any[]> {
    const res = await fetch(`/api/watchlist?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.items || [];
  },

  async addToWatchlist(movie: Movie, userId: string = 'default-user'): Promise<any> {
    const numericTmdbId = parseInt(movie.id.replace(/(movie|tv)-/, ''), 10) || 0;
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        tmdbId: numericTmdbId,
        mediaType: movie.type === 'movie' ? 'movie' : 'tv',
        title: movie.title,
        posterPath: movie.posterUrl,
        backdropPath: movie.backdropUrl,
        overview: movie.synopsis,
        voteAverage: movie.tmdbRating || movie.imdbRating,
        releaseDate: `${movie.year}-01-01`,
        genre: movie.genre,
        providers: movie.providers,
        watched: false,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async removeFromWatchlist(idOrTmdbId: string | number, userId: string = 'default-user'): Promise<boolean> {
    const res = await fetch(`/api/watchlist/${encodeURIComponent(idOrTmdbId)}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.removed;
  },

  async toggleWatchlistWatched(idOrTmdbId: string | number, userId: string = 'default-user'): Promise<any> {
    const res = await fetch(`/api/watchlist/${encodeURIComponent(idOrTmdbId)}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // Preferences persistence
  async getPreferences(userId: string = 'default-user'): Promise<UserPreferences> {
    const res = await fetch(`/api/preferences?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const p = data.preferences;
    return {
      subscriptions: p.streamingProviders || ['netflix', 'prime'],
      streamingServices: p.streamingProviders || ['netflix', 'prime'],
      favoriteGenres: p.favoriteGenres || [],
      rejectedGenres: p.rejectedGenres || [],
      avoidHorror: p.avoidHorror || false,
      preferredDuration: p.preferredDuration || 'any',
      preferredLanguage: p.preferredLanguage || 'pt-BR',
      familyFriendlyMode: p.familyFriendlyMode || false,
      maxAgeRating: p.maxAgeRating || '18+',
      audioPreference: 'original',
      subtitlesDefault: true,
    };
  },

  async savePreferences(preferences: UserPreferences, userId: string = 'default-user'): Promise<any> {
    const res = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        favoriteGenres: preferences.favoriteGenres,
        rejectedGenres: preferences.rejectedGenres || [],
        streamingProviders: preferences.subscriptions || preferences.streamingServices || ['netflix', 'prime'],
        avoidHorror: preferences.avoidHorror,
        preferredDuration: preferences.preferredDuration || 'any',
        preferredLanguage: preferences.preferredLanguage || 'pt-BR',
        familyFriendlyMode: preferences.familyFriendlyMode,
        maxAgeRating: preferences.maxAgeRating,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // History recording
  async recordHistory(
    item: {
      tmdbId: number;
      mediaType: 'movie' | 'tv';
      title: string;
      interactionType: 'view_details' | 'click_watch' | 'mark_watched' | 'dislike';
    },
    userId: string = 'default-user'
  ): Promise<any> {
    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...item }),
    });
    if (!res.ok) return null;
    return res.json();
  },
};
