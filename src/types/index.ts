export type ScreenType =
  | 'landing'
  | 'conversation'
  | 'processing'
  | 'recommendations'
  | 'details'
  | 'watchlist'
  | 'preferences';

export interface StreamingProvider {
  id: string;
  name: string;
  color: string;
  bgBadge: string;
  logoText: string;
  iconName: string;
}

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  type: 'movie' | 'series';
  year: number;
  durationOrSeasons: string;
  genre: string[];
  imdbRating: number;
  tmdbRating?: number;
  ageRating: string;
  compatibilityScore: number;
  synopsis: string;
  aiExplanation: string;
  posterUrl: string;
  backdropUrl?: string;
  director: string;
  screenplay?: string;
  cast: { name: string; character: string }[];
  providers: string[];
  availableOnUserSubscription?: boolean;
  trailerUrl?: string;
  tags: string[];
}

export interface ConversationAnswer {
  questionId: string;
  questionText: string;
  selectedOption: string;
  isCustomText?: boolean;
}

export interface UserPreferences {
  subscriptions: string[];
  streamingServices?: string[];
  favoriteGenres: string[];
  rejectedGenres?: string[];
  maxAgeRating: string;
  audioPreference: 'original' | 'dubbed';
  subtitlesDefault: boolean;
  familyFriendlyMode: boolean;
  avoidHorror: boolean;
  preferredDuration?: string;
  preferredLanguage?: string;
}
