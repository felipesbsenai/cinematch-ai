import React, { useState } from 'react';
import { UserPreferences, ScreenType } from '../types';
import { STREAMING_PROVIDERS, DEFAULT_PREFERENCES } from '../data/mockData';
import {
  Sliders,
  Check,
  RotateCcw,
  Save,
  CheckCircle2,
  Shield,
  Volume2,
  Tv,
  Film,
  Sparkles,
} from 'lucide-react';

interface PreferencesScreenProps {
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
  onNavigate: (screen: ScreenType) => void;
}

const ALL_GENRES = [
  'Ficção Científica',
  'Drama',
  'Suspense',
  'Comédia',
  'Ação',
  'Aventura',
  'Terror',
  'Animação',
  'Romance',
  'Documentário',
  'Fantasia',
  'Mistério',
];

const AGE_RATINGS = ['Livre', '10+', '12+', '14+', '16+', '18+'];

export const PreferencesScreen: React.FC<PreferencesScreenProps> = ({
  preferences,
  onSavePreferences,
  onNavigate,
}) => {
  const [currentPrefs, setCurrentPrefs] = useState<UserPreferences>(preferences);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSubscription = (providerId: string) => {
    setCurrentPrefs(prev => {
      const exists = prev.subscriptions.includes(providerId);
      const updated = exists
        ? prev.subscriptions.filter(id => id !== providerId)
        : [...prev.subscriptions, providerId];
      return { ...prev, subscriptions: updated };
    });
  };

  const handleToggleGenre = (genre: string) => {
    setCurrentPrefs(prev => {
      const exists = prev.favoriteGenres.includes(genre);
      const updated = exists
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre];
      return { ...prev, favoriteGenres: updated };
    });
  };

  const handleSave = () => {
    onSavePreferences(currentPrefs);
    showToast('Preferências salvas com sucesso!');
  };

  const handleReset = () => {
    setCurrentPrefs(DEFAULT_PREFERENCES);
    onSavePreferences(DEFAULT_PREFERENCES);
    showToast('Preferências restauradas para os padrões originais.');
  };

  return (
    <div className="min-h-screen bg-[#10111B] text-white py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D2030] text-white px-4 py-3 rounded-xl border border-violet-500/40 shadow-2xl flex items-center gap-2 text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 uppercase tracking-widest">
              <Sliders className="w-3.5 h-3.5" />
              <span>Configurações & Algoritmo</span>
            </div>
            <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              Preferências do CineMatch
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Personalize seus serviços de streaming, gêneros favoritos e filtros de conteúdo para recomendações ultra-precisas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-[#1D2030] hover:bg-[#25283D] border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrões</span>
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold text-xs text-white shadow-lg shadow-violet-600/30 flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>

        {/* Section 1: Streaming Subscriptions */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1A1D2E] border border-white/8 space-y-4">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-cyan-400" />
            <h2 className="font-['Outfit'] text-lg font-bold text-white">Minhas Assinaturas de Streaming</h2>
          </div>
          <p className="text-xs text-slate-400">
            Apenas títulos disponíveis nos serviços selecionados serão priorizados nas suas recomendações de IA.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {STREAMING_PROVIDERS.map(p => {
              const isSelected = currentPrefs.subscriptions.includes(p.id);

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleToggleSubscription(p.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-violet-600/20 border-violet-500 text-white shadow-md shadow-violet-500/20'
                      : 'bg-[#141624] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-[#1A1D2E]'
                  }`}
                >
                  <span className="font-semibold text-sm">{p.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-cyan-300" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Favorite Genres */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1A1D2E] border border-white/8 space-y-4">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-violet-400" />
            <h2 className="font-['Outfit'] text-lg font-bold text-white">Gêneros Favoritos</h2>
          </div>
          <p className="text-xs text-slate-400">
            Selecione os gêneros que você mais gosta para que o algoritmo os considere como preferenciais.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {ALL_GENRES.map(genre => {
              const isSelected = currentPrefs.favoriteGenres.includes(genre);

              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleToggleGenre(genre)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-400 text-white shadow-md'
                      : 'bg-[#141624] border-white/8 text-slate-300 hover:text-white hover:bg-[#1D2030]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-cyan-300" />}
                  <span>{genre}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Content Restrictions & Age Rating */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1A1D2E] border border-white/8 space-y-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h2 className="font-['Outfit'] text-lg font-bold text-white">Filtros & Restrições de Conteúdo</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Max age rating */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Classificação Indicativa Máxima
              </label>
              <div className="flex items-center gap-2">
                {AGE_RATINGS.map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setCurrentPrefs(prev => ({ ...prev, maxAgeRating: rating }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      currentPrefs.maxAgeRating === rating
                        ? 'bg-violet-600 border-violet-400 text-white'
                        : 'bg-[#141624] border-white/8 text-slate-400 hover:text-white'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            {/* Avoid horror toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141624] border border-white/5">
              <div>
                <span className="text-xs font-semibold text-white block">Ocultar Terror Pesado</span>
                <span className="text-[11px] text-slate-400">Não recomendar filmes de terror psicológico ou gore</span>
              </div>
              <input
                type="checkbox"
                checked={currentPrefs.avoidHorror}
                onChange={e => setCurrentPrefs(prev => ({ ...prev, avoidHorror: e.target.checked }))}
                className="w-4 h-4 accent-violet-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Family Friendly Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-violet-950/20 border border-violet-500/20">
            <div>
              <span className="text-xs font-semibold text-violet-200 block">Modo Família & Crianças</span>
              <span className="text-[11px] text-slate-400">Filtrar apenas conteúdo classificado como livre e familiar</span>
            </div>
            <input
              type="checkbox"
              checked={currentPrefs.familyFriendlyMode}
              onChange={e => setCurrentPrefs(prev => ({ ...prev, familyFriendlyMode: e.target.checked }))}
              className="w-4 h-4 accent-violet-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Section 4: Audio & Language Defaults */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#1A1D2E] border border-white/8 space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <h2 className="font-['Outfit'] text-lg font-bold text-white">Áudio e Legendas</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Preferência de Áudio</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPrefs(prev => ({ ...prev, audioPreference: 'original' }))}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    currentPrefs.audioPreference === 'original'
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-[#141624] border-white/8 text-slate-400 hover:text-white'
                  }`}
                >
                  Áudio Original (Legendado)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPrefs(prev => ({ ...prev, audioPreference: 'dubbed' }))}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    currentPrefs.audioPreference === 'dubbed'
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-[#141624] border-white/8 text-slate-400 hover:text-white'
                  }`}
                >
                  Dublado em Português
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#141624] border border-white/5">
              <div>
                <span className="text-xs font-semibold text-white block">Legendas Sempre Ativadas</span>
                <span className="text-[11px] text-slate-400">Indicar disponibilidade de legendas em PT-BR</span>
              </div>
              <input
                type="checkbox"
                checked={currentPrefs.subtitlesDefault}
                onChange={e => setCurrentPrefs(prev => ({ ...prev, subtitlesDefault: e.target.checked }))}
                className="w-4 h-4 accent-violet-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-[#1D2030] hover:bg-[#25283D] border border-white/10 text-xs font-medium text-slate-300 transition-colors"
          >
            Restaurar Padrões
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Preferências</span>
          </button>
        </div>
      </div>
    </div>
  );
};
