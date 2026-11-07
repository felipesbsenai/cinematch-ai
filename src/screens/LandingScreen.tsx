import React, { useState, useEffect } from 'react';
import { ScreenType, Movie } from '../types';
import { STREAMING_PROVIDERS, ALL_MOVIES } from '../data/mockData';
import { api } from '../services/api';
import { Sparkles, Dices, ArrowRight, Star, Clock, CheckCircle2, ChevronRight, Play } from 'lucide-react';

interface LandingScreenProps {
  onStartDiscovery: () => void;
  onSurpriseMe: () => void;
  onSelectMovie: (movie: Movie) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onStartDiscovery,
  onSurpriseMe,
  onSelectMovie,
  onNavigate,
}) => {
  const [moviesList, setMoviesList] = useState<Movie[]>(ALL_MOVIES);

  useEffect(() => {
    api.getTrending()
      .then(trending => {
        if (trending && trending.length >= 3) {
          setMoviesList(trending);
        }
      })
      .catch(() => {});
  }, []);

  const previewMovies = moviesList.slice(0, 3);
  const featuredList = moviesList.slice(0, 5);

  return (
    <div className="relative min-h-screen bg-[#10111B] text-white overflow-hidden">
      {/* Cinematic Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-24 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Descoberta Inteligente de Filmes & Séries</span>
            </div>

            <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-2xl mx-auto lg:mx-0">
              O que vamos assistir <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">hoje?</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Deixe a inteligência artificial encontrar seu próximo filme ou série. Adeus horas perdidas rolando catálogos no streaming.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onStartDiscovery}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-500 hover:to-indigo-500 shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base group"
              >
                <span>Encontrar meu próximo filme</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onSurpriseMe}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-medium text-slate-200 bg-[#1D2030] hover:bg-[#25283D] border border-white/10 hover:border-violet-500/40 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Dices className="w-4 h-4 text-cyan-400" />
                <span>Me surpreenda</span>
              </button>
            </div>

            {/* Proof quote */}
            <div className="pt-2 text-xs text-slate-400 flex items-center justify-center lg:justify-start gap-3">
              <span>96% de precisão de humor</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Recomendações em menos de 2 minutos</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Integração com 7 streamings</span>
            </div>
          </div>

          {/* Right Column: Hero Visual composition with genuine posters */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              {/* Central primary card with glow */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#1A1D2E] shadow-2xl shadow-violet-950/50 group cursor-pointer transition-all hover:scale-[1.02]"
                onClick={() => onSelectMovie(previewMovies[0])}
              >
                <div className="aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden relative">
                  <img
                    src={previewMovies[0].backdropUrl || previewMovies[0].posterUrl}
                    alt={previewMovies[0].title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10111B] via-[#10111B]/40 to-transparent" />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-violet-600/90 text-white font-mono text-xs font-bold shadow-lg">
                    {previewMovies[0].compatibilityScore}% Match
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-xs uppercase tracking-wider text-cyan-300 font-semibold">Em alta no CineMatch</span>
                    <h3 className="font-['Outfit'] font-bold text-xl sm:text-2xl text-white">{previewMovies[0].title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                      <span>{previewMovies[0].year}</span>
                      <span>·</span>
                      <span>{previewMovies[0].durationOrSeasons}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {previewMovies[0].imdbRating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#181B2B] flex items-center justify-between border-t border-white/5">
                  <p className="text-xs text-slate-400 line-clamp-1 max-w-[70%]">
                    {previewMovies[0].aiExplanation}
                  </p>
                  <span className="text-xs font-medium text-cyan-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Ver detalhes <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Stacked floating cards behind */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {previewMovies.slice(1, 3).map(m => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMovie(m)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1D2030]/90 border border-white/8 hover:border-violet-500/30 cursor-pointer transition-all hover:bg-[#23273D]"
                  >
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-16 object-cover rounded-lg shrink-0 shadow-md"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{m.title}</div>
                      <div className="text-[11px] text-slate-400">{m.genre[0]} · {m.year}</div>
                      <div className="text-[11px] text-violet-400 font-medium font-mono">{m.compatibilityScore}% Match</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Streaming Providers Ribbon */}
      <section className="border-y border-white/8 bg-[#141624]/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 shrink-0">
              Compatível com seus serviços de streaming favoritos:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
              {STREAMING_PROVIDERS.map(p => (
                <div
                  key={p.id}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${p.bgBadge}`}
                >
                  <span className="font-bold tracking-tight">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Screen 01 Feature Highlight: 3-step How It Works */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
            Simples, Rápido & Preciso
          </span>
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Como o CineMatch AI funciona
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Você não precisa saber o nome de nenhum filme. Nossa IA traduz o seu humor em entretenimento certeiro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Conte seu humor',
              desc: 'Responda poucas perguntas dinâmicas sobre seu clima, com quem vai assistir e quanto tempo tem disponível.',
              action: 'Opções em 1 clique ou texto livre',
            },
            {
              step: '02',
              title: 'Cruzamento com streamings',
              desc: 'A IA verifica instantaneamente quais títulos estão disponíveis nas plataformas que você realmente assina.',
              action: 'Zero frustração com catálogo indisponível',
            },
            {
              step: '03',
              title: '3 recomendações perfeitas',
              desc: 'Receba exatamente 3 títulos com índice de compatibilidade e o motivo pelo qual você vai amar assistir.',
              action: 'Assistir agora com 1 clique',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="relative p-6 sm:p-8 rounded-2xl bg-[#1A1D2E] border border-white/8 hover:border-violet-500/30 transition-all group"
            >
              <div className="text-4xl font-extrabold font-mono text-white/10 group-hover:text-violet-500/30 transition-colors mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-['Outfit']">{item.title}</h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">{item.desc}</p>
              <div className="text-xs text-cyan-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Suggestions Preview Strip */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-['Outfit'] text-2xl font-bold text-white">Recomendações Frequentes dos Usuários</h2>
            <p className="text-xs text-slate-400">Títulos que mais surpreenderam quem testou o CineMatch esta semana</p>
          </div>
          <button
            onClick={onStartDiscovery}
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            Descobrir para meu humor <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {featuredList.map(movie => (
            <div
              key={movie.id}
              onClick={() => onSelectMovie(movie)}
              className="group cursor-pointer rounded-xl bg-[#1A1D2E] border border-white/8 overflow-hidden hover:border-violet-500/40 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-black/40"
            >
              <div className="aspect-[2/3] w-full overflow-hidden relative">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[11px] font-mono font-bold text-cyan-300">
                  {movie.compatibilityScore}%
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-sm text-white truncate">{movie.title}</h4>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                  <span>{movie.year}</span>
                  <span className="flex items-center gap-0.5 text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {movie.imdbRating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-violet-900/60 via-indigo-900/50 to-slate-900/80 border border-violet-500/30 text-center space-y-6 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
            <span>Stop searching. Start watching.</span>
          </div>

          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-white max-w-xl mx-auto">
            Pronto para encontrar o que assistir em menos de dois minutos?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto">
            Sem cadastro obrigatório para começar. Converse com a IA e receba 3 recomendações perfeitas agora.
          </p>

          <div className="pt-2">
            <button
              onClick={onStartDiscovery}
              className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-xl shadow-violet-600/40 text-base inline-flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Começar Conversa com a IA</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
