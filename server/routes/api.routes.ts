import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { tmdbService } from '../services/tmdb.service';
import { geminiService } from '../services/gemini.service';
import { recommendationEngine } from '../services/recommendation.service';

export const apiRouter = Router();

// GET /api/status - Health and Service Diagnostic
apiRouter.get('/status', async (_req: Request, res: Response) => {
  const geminiOk = geminiService.isConfigured();
  const tmdbOk = tmdbService.isConfigured();

  res.json({
    status: 'online',
    version: '1.0.0',
    services: {
      gemini: {
        configured: geminiOk,
        model: 'gemini-2.5-flash',
        mode: geminiOk ? 'live_ai' : 'heuristic_fallback',
      },
      tmdb: {
        configured: tmdbOk,
        mode: tmdbOk ? 'live_catalog' : 'curated_catalog',
        country: 'BR',
      },
      database: {
        status: 'active',
        watchlistCount: db.getWatchlist().length,
        historyCount: db.getHistory().length,
      },
    },
    setupInstructions: {
      gemini: geminiOk ? null : 'Defina GEMINI_API_KEY no arquivo .env ou no painel de segredos do AI Studio.',
      tmdb: tmdbOk ? null : 'Defina TMDB_API_KEY no arquivo .env para acesso a todo o catálogo oficial do The Movie Database.',
    },
  });
});

// POST /api/ai/conversation - Turn in the sommelier dialogue
apiRouter.post('/ai/conversation', async (req: Request, res: Response) => {
  try {
    const { messages = [], sessionId = `session-${Date.now()}`, userId = 'default-user' } = req.body;
    const userPrefs = db.getPreferences(userId);

    const result = await geminiService.handleConversationTurn(messages, userPrefs);

    // Save conversation state to database
    db.saveConversation(sessionId, messages.concat([{ sender: 'ai', text: result.reply, timestamp: new Date().toISOString() }]), result);

    res.json({
      success: true,
      sessionId,
      ...result,
    });
  } catch (err: any) {
    console.error('[API] /ai/conversation error:', err);
    res.status(500).json({ success: false, error: err.message || 'Erro ao processar turno de conversa' });
  }
});

// POST /api/ai/recommendations - Generate top 3 personalized recommendations
apiRouter.post('/ai/recommendations', async (req: Request, res: Response) => {
  try {
    const recommendations = await recommendationEngine.getRecommendations(req.body);
    res.json({
      success: true,
      recommendations,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[API] /ai/recommendations error:', err);
    res.status(500).json({ success: false, error: err.message || 'Erro ao gerar recomendações' });
  }
});

// GET /api/movies/trending - Showcase titles on Landing
apiRouter.get('/movies/trending', async (_req: Request, res: Response) => {
  try {
    if (tmdbService.isConfigured()) {
      const data = await tmdbService.getTrending('all');
      const results = (data.results || []).slice(0, 6);
      const formatted = await Promise.all(
        results.map((item: any) =>
          tmdbService.formatToCineMatchMovie(
            item,
            item.media_type === 'tv' ? 'tv' : 'movie',
            95,
            'Em alta nos catálogos de streaming no Brasil nesta semana.'
          )
        )
      );
      res.json({ success: true, results: formatted });
    } else {
      // Fallback curated titles from recommendation engine
      const curated = await recommendationEngine.getRecommendations({ contentType: 'all' });
      res.json({ success: true, results: curated });
    }
  } catch (err: any) {
    console.warn('[API] /movies/trending fallback:', err.message);
    const curated = await recommendationEngine.getRecommendations({ contentType: 'all' });
    res.json({ success: true, results: curated });
  }
});

// GET /api/movies/search & GET /api/tv/search
apiRouter.get('/movies/search', async (req: Request, res: Response) => {
  const q = String(req.query.q || '').toLowerCase();
  if (!q.trim()) {
    return res.json({ success: true, results: [] });
  }
  try {
    if (tmdbService.isConfigured()) {
      const data = await tmdbService.searchMovies(q);
      res.json({ success: true, results: data.results || [] });
    } else {
      const { BACKUP_CATALOG } = await import('../services/recommendation.service');
      const matches = BACKUP_CATALOG.filter(
        m => m.type === 'movie' && (m.title.toLowerCase().includes(q) || m.synopsis.toLowerCase().includes(q))
      );
      res.json({ success: true, results: matches });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/tv/search', async (req: Request, res: Response) => {
  const q = String(req.query.q || '').toLowerCase();
  if (!q.trim()) {
    return res.json({ success: true, results: [] });
  }
  try {
    if (tmdbService.isConfigured()) {
      const data = await tmdbService.searchTv(q);
      res.json({ success: true, results: data.results || [] });
    } else {
      const { BACKUP_CATALOG } = await import('../services/recommendation.service');
      const matches = BACKUP_CATALOG.filter(
        m => m.type === 'series' && (m.title.toLowerCase().includes(q) || m.synopsis.toLowerCase().includes(q))
      );
      res.json({ success: true, results: matches });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/movies/:id & GET /api/tv/:id
apiRouter.get('/movies/:id', async (req: Request, res: Response) => {
  const rawId = req.params.id;
  const numericId = parseInt(rawId.replace('movie-', ''), 10);
  try {
    if (tmdbService.isConfigured() && !isNaN(numericId)) {
      const details = await tmdbService.getMovieDetails(numericId);
      const formatted = await tmdbService.formatToCineMatchMovie(details, 'movie', 94);
      return res.json({ success: true, movie: formatted });
    }

    const { findCatalogItem } = await import('../services/recommendation.service');
    const catalogItem = findCatalogItem(rawId);
    if (catalogItem) {
      return res.json({ success: true, movie: catalogItem });
    }

    res.status(404).json({ success: false, message: 'Filme não encontrado' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/tv/:id', async (req: Request, res: Response) => {
  const rawId = req.params.id;
  const numericId = parseInt(rawId.replace('tv-', ''), 10);
  try {
    if (tmdbService.isConfigured() && !isNaN(numericId)) {
      const details = await tmdbService.getTvDetails(numericId);
      const formatted = await tmdbService.formatToCineMatchMovie(details, 'tv', 94);
      return res.json({ success: true, movie: formatted });
    }

    const { findCatalogItem } = await import('../services/recommendation.service');
    const catalogItem = findCatalogItem(rawId);
    if (catalogItem) {
      return res.json({ success: true, movie: catalogItem });
    }

    res.status(404).json({ success: false, message: 'Série não encontrada' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/movies/:id/providers & GET /api/tv/:id/providers
apiRouter.get('/movies/:id/providers', async (req: Request, res: Response) => {
  const rawId = req.params.id;
  const numericId = parseInt(rawId.replace('movie-', ''), 10);
  try {
    if (tmdbService.isConfigured()) {
      const providers = await tmdbService.getWatchProviders('movie', numericId);
      return res.json({ success: true, providers, country: 'BR' });
    }

    const { findCatalogItem } = await import('../services/recommendation.service');
    const catalogItem = findCatalogItem(rawId);
    res.json({
      success: true,
      country: 'BR',
      providers: {
        flatrate: catalogItem?.providers || ['netflix', 'prime'],
        rent: [],
        buy: [],
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/tv/:id/providers', async (req: Request, res: Response) => {
  const rawId = req.params.id;
  const numericId = parseInt(rawId.replace('tv-', ''), 10);
  try {
    if (tmdbService.isConfigured()) {
      const providers = await tmdbService.getWatchProviders('tv', numericId);
      return res.json({ success: true, providers, country: 'BR' });
    }

    const { findCatalogItem } = await import('../services/recommendation.service');
    const catalogItem = findCatalogItem(rawId);
    res.json({
      success: true,
      country: 'BR',
      providers: {
        flatrate: catalogItem?.providers || ['disney', 'max'],
        rent: [],
        buy: [],
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/genres
apiRouter.get('/genres', async (_req: Request, res: Response) => {
  try {
    const genres = await tmdbService.getGenres();
    res.json({ success: true, genres });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/providers - List of primary streaming platforms in Brazil
apiRouter.get('/providers', (_req: Request, res: Response) => {
  res.json({
    success: true,
    country: 'BR',
    providers: [
      { id: 'netflix', name: 'Netflix', color: '#E50914', badgeBg: 'bg-red-500/10 text-red-400 border-red-500/20' },
      { id: 'prime', name: 'Prime Video', color: '#00A8E1', badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
      { id: 'disney', name: 'Disney+', color: '#113CCF', badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      { id: 'max', name: 'Max (HBO)', color: '#002BE7', badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
      { id: 'apple', name: 'Apple TV+', color: '#A2AAAD', badgeBg: 'bg-neutral-500/10 text-neutral-300 border-neutral-500/20' },
      { id: 'globoplay', name: 'Globoplay', color: '#FB0A25', badgeBg: 'bg-red-600/10 text-red-500 border-red-600/20' },
      { id: 'paramount', name: 'Paramount+', color: '#0064FF', badgeBg: 'bg-blue-600/10 text-blue-400 border-blue-600/20' },
    ],
  });
});

// --- Watchlist Routes ---
apiRouter.get('/watchlist', (req: Request, res: Response) => {
  const userId = String(req.query.userId || 'default-user');
  const items = db.getWatchlist(userId);
  res.json({ success: true, items });
});

apiRouter.post('/watchlist', (req: Request, res: Response) => {
  const userId = String(req.body.userId || 'default-user');
  const item = db.addToWatchlist(userId, req.body);
  res.json({ success: true, item });
});

apiRouter.delete('/watchlist/:id', (req: Request, res: Response) => {
  const userId = String(req.query.userId || 'default-user');
  const removed = db.removeFromWatchlist(userId, req.params.id);
  res.json({ success: true, removed });
});

apiRouter.patch('/watchlist/:id/toggle', (req: Request, res: Response) => {
  const userId = String(req.body.userId || 'default-user');
  const item = db.toggleWatchlistWatched(userId, req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item não encontrado na Watchlist' });
  }
  res.json({ success: true, item });
});

// --- Preferences Routes ---
apiRouter.get('/preferences', (req: Request, res: Response) => {
  const userId = String(req.query.userId || 'default-user');
  const preferences = db.getPreferences(userId);
  res.json({ success: true, preferences });
});

apiRouter.post('/preferences', (req: Request, res: Response) => {
  const userId = String(req.body.userId || 'default-user');
  const updated = db.updatePreferences(userId, req.body);
  res.json({ success: true, preferences: updated });
});

// --- Viewing History Routes ---
apiRouter.get('/history', (req: Request, res: Response) => {
  const userId = String(req.query.userId || 'default-user');
  const history = db.getHistory(userId);
  res.json({ success: true, history });
});

apiRouter.post('/history', (req: Request, res: Response) => {
  const userId = String(req.body.userId || 'default-user');
  const record = db.recordHistory(userId, req.body);
  res.json({ success: true, record });
});
