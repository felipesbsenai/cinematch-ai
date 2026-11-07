import fs from 'fs';
import path from 'path';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserPreferencesEntity {
  userId: string;
  favoriteGenres: string[];
  rejectedGenres: string[];
  streamingProviders: string[];
  preferredContentType: 'all' | 'movie' | 'series';
  preferredDuration: string;
  preferredLanguage: string;
  avoidHorror: boolean;
  familyFriendlyMode: boolean;
  maxAgeRating: string;
}

export interface WatchlistItemEntity {
  id: string;
  userId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath?: string | null;
  overview: string;
  voteAverage: number;
  releaseDate: string;
  genre: string[];
  providers: string[];
  addedAt: string;
  watched: boolean;
}

export interface ViewingHistoryEntity {
  id: string;
  userId: string;
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  interactionType: 'view_details' | 'click_watch' | 'mark_watched' | 'dislike';
  createdAt: string;
}

export interface ConversationEntity {
  id: string;
  sessionId: string;
  messages: Array<{
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
  }>;
  collectedPreferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: UserEntity[];
  preferences: UserPreferencesEntity[];
  watchlist: WatchlistItemEntity[];
  viewingHistory: ViewingHistoryEntity[];
  conversations: ConversationEntity[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cinematch_db.json');

const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      id: 'default-user',
      name: 'Cinéfilo CineMatch',
      email: 'usuario@cinematch.ai',
      createdAt: new Date().toISOString(),
    },
  ],
  preferences: [
    {
      userId: 'default-user',
      favoriteGenres: ['Ficção Científica', 'Drama', 'Suspense', 'Comédia'],
      rejectedGenres: [],
      streamingProviders: ['netflix', 'prime', 'disney', 'max'],
      preferredContentType: 'all',
      preferredDuration: 'any',
      preferredLanguage: 'pt-BR',
      avoidHorror: false,
      familyFriendlyMode: false,
      maxAgeRating: '18+',
    },
  ],
  watchlist: [
    {
      id: 'wl-1',
      userId: 'default-user',
      tmdbId: 157336, // Interstellar
      mediaType: 'movie',
      title: 'Interestelar',
      posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdropPath: '/rAiYTsqhk0ke0Vo768q4m59f8v1.jpg',
      overview: 'As reservas naturais da Terra estão chegando ao fim e um grupo de astronautas recebe a missão de verificar possíveis planetas para habitação.',
      voteAverage: 8.4,
      releaseDate: '2014-11-05',
      genre: ['Ficção científica', 'Drama', 'Aventura'],
      providers: ['netflix', 'max'],
      addedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      watched: false,
    },
    {
      id: 'wl-2',
      userId: 'default-user',
      tmdbId: 136283, // The Bear
      mediaType: 'tv',
      title: 'O Urso',
      posterPath: '/sO4m6e0YVn5c1iRj2e4x0Yd8XgC.jpg',
      backdropPath: '/nTvM4mhqZlHI3rFmsabUpk9v0V5.jpg',
      overview: 'Um jovem chef de alta gastronomia luta para transformar a lanchonete de sanduíches de sua família em Chicago.',
      voteAverage: 8.3,
      releaseDate: '2022-06-23',
      genre: ['Drama', 'Comédia'],
      providers: ['disney'],
      addedAt: new Date(Date.now() - 86400000).toISOString(),
      watched: true,
    },
  ],
  viewingHistory: [],
  conversations: [],
};

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[Database] Failed to read database, initializing default:', err);
    }
    this.save(INITIAL_DB);
    return INITIAL_DB;
  }

  private save(dataToSave: DatabaseSchema = this.data): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('[Database] Failed to write database file:', err);
    }
  }

  // --- Users ---
  getUser(userId: string = 'default-user'): UserEntity {
    let user = this.data.users.find(u => u.id === userId);
    if (!user) {
      user = {
        id: userId,
        name: 'Usuário CineMatch',
        email: 'usuario@cinematch.ai',
        createdAt: new Date().toISOString(),
      };
      this.data.users.push(user);
      this.save();
    }
    return user;
  }

  // --- Preferences ---
  getPreferences(userId: string = 'default-user'): UserPreferencesEntity {
    let pref = this.data.preferences.find(p => p.userId === userId);
    if (!pref) {
      pref = {
        userId,
        favoriteGenres: ['Ficção Científica', 'Drama', 'Suspense', 'Comédia'],
        rejectedGenres: [],
        streamingProviders: ['netflix', 'prime', 'disney', 'max'],
        preferredContentType: 'all',
        preferredDuration: 'any',
        preferredLanguage: 'pt-BR',
        avoidHorror: false,
        familyFriendlyMode: false,
        maxAgeRating: '18+',
      };
      this.data.preferences.push(pref);
      this.save();
    }
    return pref;
  }

  updatePreferences(userId: string = 'default-user', updates: Partial<UserPreferencesEntity>): UserPreferencesEntity {
    const existing = this.getPreferences(userId);
    const updated: UserPreferencesEntity = {
      ...existing,
      ...updates,
      userId,
    };
    const index = this.data.preferences.findIndex(p => p.userId === userId);
    if (index >= 0) {
      this.data.preferences[index] = updated;
    } else {
      this.data.preferences.push(updated);
    }
    this.save();
    return updated;
  }

  // --- Watchlist ---
  getWatchlist(userId: string = 'default-user'): WatchlistItemEntity[] {
    return this.data.watchlist.filter(w => w.userId === userId);
  }

  addToWatchlist(userId: string = 'default-user', item: Omit<WatchlistItemEntity, 'id' | 'userId' | 'addedAt'>): WatchlistItemEntity {
    const existingIndex = this.data.watchlist.findIndex(
      w => w.userId === userId && w.tmdbId === item.tmdbId && w.mediaType === item.mediaType
    );
    if (existingIndex >= 0) {
      return this.data.watchlist[existingIndex];
    }

    const newItem: WatchlistItemEntity = {
      ...item,
      id: `wl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      addedAt: new Date().toISOString(),
      watched: item.watched ?? false,
    };
    this.data.watchlist.unshift(newItem);
    this.save();
    return newItem;
  }

  removeFromWatchlist(userId: string = 'default-user', tmdbIdOrId: string | number): boolean {
    const initialLen = this.data.watchlist.length;
    this.data.watchlist = this.data.watchlist.filter(w => {
      if (w.userId !== userId) return true;
      if (w.id === String(tmdbIdOrId) || w.tmdbId === Number(tmdbIdOrId)) {
        return false;
      }
      return true;
    });
    const removed = this.data.watchlist.length < initialLen;
    if (removed) this.save();
    return removed;
  }

  toggleWatchlistWatched(userId: string = 'default-user', tmdbIdOrId: string | number): WatchlistItemEntity | null {
    const item = this.data.watchlist.find(w => {
      if (w.userId !== userId) return false;
      return w.id === String(tmdbIdOrId) || w.tmdbId === Number(tmdbIdOrId);
    });
    if (item) {
      item.watched = !item.watched;
      this.save();
      return item;
    }
    return null;
  }

  // --- Viewing History ---
  recordHistory(
    userId: string = 'default-user',
    item: Omit<ViewingHistoryEntity, 'id' | 'userId' | 'createdAt'>
  ): ViewingHistoryEntity {
    const record: ViewingHistoryEntity = {
      ...item,
      id: `vh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      createdAt: new Date().toISOString(),
    };
    this.data.viewingHistory.unshift(record);
    if (this.data.viewingHistory.length > 500) {
      this.data.viewingHistory = this.data.viewingHistory.slice(0, 500);
    }
    this.save();
    return record;
  }

  getHistory(userId: string = 'default-user'): ViewingHistoryEntity[] {
    return this.data.viewingHistory.filter(h => h.userId === userId);
  }

  // --- Conversations ---
  saveConversation(
    sessionId: string,
    messages: ConversationEntity['messages'],
    collectedPreferences: Record<string, any>
  ): ConversationEntity {
    const existingIndex = this.data.conversations.findIndex(c => c.sessionId === sessionId);
    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      this.data.conversations[existingIndex].messages = messages;
      this.data.conversations[existingIndex].collectedPreferences = collectedPreferences;
      this.data.conversations[existingIndex].updatedAt = now;
      this.save();
      return this.data.conversations[existingIndex];
    } else {
      const newConv: ConversationEntity = {
        id: `conv-${Date.now()}`,
        sessionId,
        messages,
        collectedPreferences,
        createdAt: now,
        updatedAt: now,
      };
      this.data.conversations.push(newConv);
      this.save();
      return newConv;
    }
  }

  getConversation(sessionId: string): ConversationEntity | null {
    return this.data.conversations.find(c => c.sessionId === sessionId) || null;
  }
}

export const db = new DatabaseService();
