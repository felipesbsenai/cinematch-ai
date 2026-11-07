import React, { useState, useEffect, useRef } from 'react';
import { AI_AVATAR_URL } from '../data/mockData';
import { Sparkles, Check, Loader2, ArrowRight } from 'lucide-react';

interface ProcessingScreenProps {
  onComplete: () => void;
  onRequestRecommendations?: () => Promise<any>;
}

const STEPS = [
  'Entendendo seu humor cinematográfico...',
  'Cruzando suas preferências com 40+ atributos narrativos...',
  'Consultando o catálogo inteligente de filmes e séries...',
  'Verificando disponibilidade em tempo real nos seus streamings...',
  'Calculando índice de compatibilidade e preparando recomendações...',
];

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  onComplete,
  onRequestRecommendations,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(10);
  const requestFinishedRef = useRef<boolean>(false);

  useEffect(() => {
    // If a promise was provided, trigger it in parallel
    if (onRequestRecommendations) {
      onRequestRecommendations()
        .then(() => {
          requestFinishedRef.current = true;
        })
        .catch(err => {
          console.warn('[ProcessingScreen] Request finished with warning:', err);
          requestFinishedRef.current = true;
        });
    } else {
      requestFinishedRef.current = true;
    }
  }, [onRequestRecommendations]);

  useEffect(() => {
    // Smooth progress interval (~3 seconds total duration)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98 && !requestFinishedRef.current) {
          return 98; // Wait for server request if slow
        }
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Synchronize checklist items with progress percentage
    if (progress < 25) setActiveStepIndex(0);
    else if (progress < 50) setActiveStepIndex(1);
    else if (progress < 70) setActiveStepIndex(2);
    else if (progress < 90) setActiveStepIndex(3);
    else setActiveStepIndex(4);

    if (progress >= 100) {
      const timer = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <div className="relative min-h-screen bg-[#10111B] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-md w-full text-center space-y-8 z-10">
        {/* Holographic Glowing AI Orb */}
        <div className="relative mx-auto w-36 h-36 flex items-center justify-center">
          {/* Animated concentric pulse rings */}
          <div className="absolute inset-0 rounded-full border border-violet-500/30 animate-ping opacity-30" />
          <div className="absolute -inset-3 rounded-full border border-cyan-400/20 animate-pulse" />
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-violet-400/80 shadow-[0_0_50px_rgba(139,92,246,0.6)]">
            <img
              src={AI_AVATAR_URL}
              alt="CineMatch AI Processing"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover animate-spin-slow"
              style={{ animationDuration: '30s' }}
            />
          </div>
          <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-violet-600 shadow-lg">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* Text Header */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 font-mono">
            {progress}% PROCESSADO
          </span>
          <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Analisando seu perfil cinematográfico...
          </h2>
          <p className="text-sm text-slate-400">
            Nossa IA está cruzando seus gostos com os catálogos de streaming no Brasil.
          </p>
        </div>

        {/* Main Progress Bar */}
        <div className="w-full bg-[#1A1D2E] h-2.5 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic status checklist */}
        <div className="bg-[#1A1D2E]/90 border border-white/8 rounded-2xl p-5 text-left space-y-3 shadow-xl backdrop-blur-md">
          {STEPS.map((step, idx) => {
            const isDone = idx < activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-colors duration-300 ${
                  isDone
                    ? 'text-slate-400'
                    : isCurrent
                    ? 'text-white font-medium'
                    : 'text-slate-600'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isCurrent
                      ? 'bg-violet-600/30 text-violet-300 border border-violet-500 animate-pulse'
                      : 'bg-white/5 text-slate-600 border border-white/5'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3 h-3 animate-spin text-cyan-300" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className="truncate">{step}</span>
              </div>
            );
          })}
        </div>

        {/* Cinephile Fact / Trivia while loading */}
        <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-violet-200">
          <p className="italic">
            "Stop searching. Start watching. O CineMatch elimina a fadiga de escolha selecionando cirurgicamente apenas 3 títulos perfeitos."
          </p>
        </div>

        {/* Manual Skip / Proceed button */}
        <div className="pt-2">
          <button
            onClick={onComplete}
            className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Pular espera e ver resultados</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
