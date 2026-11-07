/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenType, Movie, ConversationAnswer, UserPreferences } from './types';
import { ALL_MOVIES, DEFAULT_PREFERENCES } from './data/mockData';
import { api, ApiStatus, ConversationTurnResult } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StreamingModal } from './components/StreamingModal';
import { LandingScreen } from './screens/LandingScreen';
import { ConversationScreen } from './screens/ConversationScreen';
import { ProcessingScreen } from './screens/ProcessingScreen';
import { RecommendationsScreen } from './screens/RecommendationsScreen';
import { MovieDetailsScreen } from './screens/MovieDetailsScreen';
import { WatchlistScreen } from './screens/WatchlistScreen';
import { PreferencesScreen } from './screens/PreferencesScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('landing');
  const [recommendations, setRecommendations] = useState<Movie[]>(ALL_MOVIES.slice(0, 3));
  const [selectedMovie, setSelectedMovie] = useState<Movie>(ALL_MOVIES[0]);
  const [watchlist, setWatchlist] = useState<string[]>(['interstellar', 'the-bear', 'severance']);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [activeStreamingMovie, setActiveStreamingMovie] = useState<Movie | null>(null);
  const [lastConversationContext, setLastConversationContext] = useState<Partial<ConversationTurnResult>>({});
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);

  // Load initial backend status, watchlist, and preferences on mount
  useEffect(() => {
    // 1. Fetch system status
    api.getStatus()
      .then(status => {
        setApiStatus(status);
      })
      .catch(err => {
        console.warn('[App] Could not fetch status, using client defaults:', err);
      });

    // 2. Fetch user preferences
    api.getPreferences()
      .then(prefs => {
        if (prefs && prefs.subscriptions) {
          setPreferences(prefs);
        }
      })
      .catch(err => {
        console.warn('[App] Could not load preferences from backend:', err);
      });

    // 3. Fetch user watchlist
    api.getWatchlist()
      .then(items => {
        if (Array.isArray(items) && items.length > 0) {
          const ids = items.map((i: any) => `${i.mediaType}-${i.tmdbId}`);
          setWatchlist(ids);
        }
      })
      .catch(err => {
        console.warn('[App] Could not load watchlist from backend:', err);
      });
  }, []);

  const handleStartDiscovery = () => {
    setCurrentScreen('conversation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSurpriseMe = async () => {
    // Immediate surprise discovery
    try {
      const recs = await api.getRecommendations({
        mood: 'surpreendente e cativante',
        contentType: 'all',
      });
      if (recs && recs.length >= 3) {
        setRecommendations(recs);
      }
    } catch (e) {
      console.warn('[SurpriseMe] Fallback to random titles:', e);
      setRecommendations([...ALL_MOVIES].sort(() => 0.5 - Math.random()).slice(0, 3));
    }
    setCurrentScreen('processing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConversationComplete = (
    _answers: ConversationAnswer[],
    extractedData?: Partial<ConversationTurnResult>
  ) => {
    if (extractedData) {
      setLastConversationContext(extractedData);
    }
    setCurrentScreen('processing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchRecommendationsTask = async () => {
    try {
      const recs = await api.getRecommendations({
        mood: lastConversationContext.mood || 'reflexivo e envolvente',
        contentType: lastConversationContext.contentType || 'all',
        preferredGenres: lastConversationContext.preferredGenres || preferences.favoriteGenres,
        rejectedGenres: lastConversationContext.rejectedGenres || preferences.rejectedGenres,
        preferredDuration: lastConversationContext.preferredDuration,
        watchingWith: lastConversationContext.watchingWith,
        userStreamingServices: preferences.subscriptions,
      });

      if (recs && recs.length >= 3) {
        setRecommendations(recs);
      }
    } catch (err) {
      console.warn('[App] Fallback recommendations:', err);
      // Fallback: pick 3 titles from backup
      setRecommendations(ALL_MOVIES.slice(0, 3));
    }
  };

  const handleProcessingComplete = () => {
    setCurrentScreen('recommendations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefreshRecommendations = async () => {
    try {
      const recs = await api.getRecommendations({
        mood: lastConversationContext.mood || 'emocionante',
        contentType: lastConversationContext.contentType || 'all',
        preferredGenres: preferences.favoriteGenres,
        rejectedGenres: preferences.rejectedGenres,
        userStreamingServices: preferences.subscriptions,
      });
      if (recs && recs.length >= 3) {
        setRecommendations(recs);
      }
    } catch (err) {
      console.warn('[Refresh] Fallback:', err);
      setRecommendations([...ALL_MOVIES].reverse().slice(0, 3));
    }
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentScreen('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Record interaction in history
    const numericId = parseInt(movie.id.replace(/(movie|tv)-/, ''), 10) || 0;
    api.recordHistory({
      tmdbId: numericId,
      mediaType: movie.type === 'movie' ? 'movie' : 'tv',
      title: movie.title,
      interactionType: 'view_details',
    }).catch(() => {});
  };

  const handleWatchMovie = (movie: Movie) => {
    setActiveStreamingMovie(movie);

    // Record click to watch in history
    const numericId = parseInt(movie.id.replace(/(movie|tv)-/, ''), 10) || 0;
    api.recordHistory({
      tmdbId: numericId,
      mediaType: movie.type === 'movie' ? 'movie' : 'tv',
      title: movie.title,
      interactionType: 'click_watch',
    }).catch(() => {});
  };

  const handleToggleWatchlist = async (movieId: string) => {
    const isSaved = watchlist.includes(movieId);
    if (isSaved) {
      setWatchlist(prev => prev.filter(id => id !== movieId));
      api.removeFromWatchlist(movieId).catch(() => {});
    } else {
      setWatchlist(prev => [...prev, movieId]);
      const movieObj = recommendations.find(m => m.id === movieId) || ALL_MOVIES.find(m => m.id === movieId);
      if (movieObj) {
        api.addToWatchlist(movieObj).catch(() => {});
      }
    }
  };

  const handleSavePreferences = async (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    try {
      await api.savePreferences(newPrefs);
    } catch (err) {
      console.warn('[App] Could not persist preferences:', err);
    }
  };

  const handleRefinePreferences = () => {
    setCurrentScreen('conversation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    setCurrentScreen('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#10111B] text-white">
      {/* Universal Top Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={screen => {
          setCurrentScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        watchlistCount={watchlist.length}
      />

      {/* Screen Render Switcher */}
      <main className="flex-1">
        {currentScreen === 'landing' && (
          <LandingScreen
            onStartDiscovery={handleStartDiscovery}
            onSurpriseMe={handleSurpriseMe}
            onSelectMovie={handleSelectMovie}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'conversation' && (
          <ConversationScreen
            onComplete={handleConversationComplete}
            onCancel={() => setCurrentScreen('landing')}
          />
        )}

        {currentScreen === 'processing' && (
          <ProcessingScreen
            onComplete={handleProcessingComplete}
            onRequestRecommendations={fetchRecommendationsTask}
          />
        )}

        {currentScreen === 'recommendations' && (
          <RecommendationsScreen
            movies={recommendations}
            onSelectMovie={handleSelectMovie}
            onWatchMovie={handleWatchMovie}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onRefinePreferences={handleRefinePreferences}
            onRestart={handleRestart}
            onNavigate={setCurrentScreen}
            onRefreshRecommendations={handleRefreshRecommendations}
          />
        )}

        {currentScreen === 'details' && (
          <MovieDetailsScreen
            movie={selectedMovie}
            onBack={() => setCurrentScreen('recommendations')}
            onWatch={handleWatchMovie}
            isSavedInWatchlist={watchlist.includes(selectedMovie.id)}
            onToggleWatchlist={handleToggleWatchlist}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'watchlist' && (
          <WatchlistScreen
            watchlistIds={watchlist}
            onRemoveFromWatchlist={handleToggleWatchlist}
            onSelectMovie={handleSelectMovie}
            onWatchMovie={handleWatchMovie}
            onStartDiscovery={handleStartDiscovery}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'preferences' && (
          <PreferencesScreen
            preferences={preferences}
            onSavePreferences={handleSavePreferences}
            onNavigate={setCurrentScreen}
          />
        )}
      </main>

      {/* Universal Footer */}
      <Footer onNavigate={setCurrentScreen} />

      {/* Interactive Streaming Modal */}
      <StreamingModal
        movie={activeStreamingMovie}
        onClose={() => setActiveStreamingMovie(null)}
      />
    </div>
  );
}
