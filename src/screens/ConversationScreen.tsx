import React, { useState, useEffect, useRef } from 'react';
import { ConversationAnswer, StreamingProvider } from '../types';
import { AI_AVATAR_URL, STREAMING_PROVIDERS } from '../data/mockData';
import { api, ConversationTurnResult } from '../services/api';
import { Sparkles, Send, SkipForward, Check, ArrowRight, CornerDownLeft, RefreshCcw, Zap } from 'lucide-react';

interface ConversationScreenProps {
  onComplete: (answers: ConversationAnswer[], extractedData?: Partial<ConversationTurnResult>) => void;
  onCancel: () => void;
}

interface QuestionDef {
  id: string;
  text: string;
  assistantContext?: string;
  options: string[];
  allowsCustomText?: boolean;
  isMultiSelect?: boolean;
  isProviderSelector?: boolean;
}

const QUESTIONS: QuestionDef[] = [
  {
    id: 'format',
    text: 'O que você está procurando hoje?',
    assistantContext: 'Vamos começar pelo formato para calibrar a duração ideal.',
    options: ['Um filme', 'Uma série', 'Tanto faz, me surpreenda!'],
    allowsCustomText: false,
  },
  {
    id: 'mood',
    text: 'Qual é o seu humor hoje?',
    assistantContext: 'Excelente! Agora me diga como você está se sentindo.',
    options: [
      'Quero dar boas risadas',
      'Estou procurando muita ação',
      'Quero suspense e mistério',
      'Quero algo emocionante',
      'Quero uma história inspiradora',
      'Quero relaxar e esquecer dos problemas',
      'Quero algo que me faça pensar',
      'Me surpreenda!',
    ],
    allowsCustomText: true,
  },
  {
    id: 'genre',
    text: 'Qual gênero combina mais com o seu momento?',
    assistantContext: 'Ótimo humor! Vamos afinar os gêneros narrativos.',
    options: [
      'Ficção científica',
      'Suspense & Mistério',
      'Drama',
      'Comédia',
      'Ação & Aventura',
      'Terror',
      'Animação',
      'Romance',
      'Não tenho preferência',
    ],
    allowsCustomText: false,
  },
  {
    id: 'time',
    text: 'Quanto tempo você tem disponível para assistir?',
    assistantContext: 'Perfeito. Para não sugerir algo longo demais:',
    options: [
      'Até 90 minutos (rápido)',
      'Entre 90 e 120 minutos (padrão)',
      'Mais de 2 horas (experiência épica)',
      'Não importa, tenho a noite livre',
    ],
    allowsCustomText: false,
  },
  {
    id: 'companion',
    text: 'Com quem você vai assistir?',
    assistantContext: 'Isso ajuda a calibrar a classificação indicativa e a dinâmica.',
    options: [
      'Sozinho(a)',
      'Com meu parceiro(a)',
      'Com amigos',
      'Com a família',
      'Com crianças',
    ],
    allowsCustomText: false,
  },
  {
    id: 'streamings',
    text: 'Quais plataformas de streaming você possui?',
    assistantContext: 'Por fim, marque seus streamings para eu recomendar apenas o que você pode assistir agora:',
    options: STREAMING_PROVIDERS.map(p => p.name),
    isMultiSelect: true,
    isProviderSelector: true,
  },
];

export const ConversationScreen: React.FC<ConversationScreenProps> = ({
  onComplete,
  onCancel,
}) => {
  const [sessionId] = useState<string>(() => `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<ConversationAnswer[]>([]);
  const [selectedMulti, setSelectedMulti] = useState<string[]>(['Netflix', 'Prime Video', 'Disney+', 'Max']);
  const [customInput, setCustomInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [dynamicOptions, setDynamicOptions] = useState<string[] | null>(null);
  const [readyForRecs, setReadyForRecs] = useState<boolean>(false);
  const [lastExtractedData, setLastExtractedData] = useState<Partial<ConversationTurnResult>>({});
  
  const [chatHistory, setChatHistory] = useState<
    { sender: 'ai' | 'user'; text: string; time: string }[]
  >([
    {
      sender: 'ai',
      text: 'Olá! Sou o CineMatch AI. Vamos encontrar algo incrível para assistir hoje? Me conte o que você tem em mente ou escolha as opções abaixo.',
      time: 'Agora',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping, currentStep]);

  const activeQuestion = QUESTIONS[Math.min(currentStep, QUESTIONS.length - 1)];

  // Process a turn with Gemini API
  const processTurnWithAI = async (
    userText: string,
    currentAnswers: ConversationAnswer[]
  ) => {
    setIsTyping(true);

    const historyPayload = chatHistory
      .concat([{ sender: 'user', text: userText, time: 'Agora' }])
      .map(m => ({ sender: m.sender, text: m.text }));

    try {
      const response = await api.sendConversationTurn(historyPayload, sessionId);
      setIsTyping(false);

      if (response && response.reply) {
        setChatHistory(prev => [
          ...prev,
          {
            sender: 'ai',
            text: response.reply,
            time: 'Agora',
          },
        ]);

        setLastExtractedData(response);

        if (response.suggestedQuickReplies && response.suggestedQuickReplies.length > 0) {
          setDynamicOptions(response.suggestedQuickReplies);
        }

        if (response.readyForRecommendations) {
          setReadyForRecs(true);
        }
      }
    } catch (err) {
      console.warn('[Conversation] AI call fallback:', err);
      setIsTyping(false);
      // Fallback response
      const fallbackReplies = [
        'Excelente escolha! Já conectei seu pedido com nosso catálogo.',
        'Ótimo gosto! Estou refinando o ritmo ideal para o momento.',
        'Perfeito! Vamos agora aos detalhes finais.',
      ];
      const reply = fallbackReplies[currentStep % fallbackReplies.length];
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `${reply} ${activeQuestion.text}`,
          time: 'Agora',
        },
      ]);
    }
  };

  const handleSelectOption = async (option: string) => {
    const newAnswers = [
      ...answers,
      {
        questionId: activeQuestion.id,
        questionText: activeQuestion.text,
        selectedOption: option,
        isCustomText: false,
      },
    ];
    setAnswers(newAnswers);

    setChatHistory(prev => [
      ...prev,
      { sender: 'user', text: option, time: 'Agora' },
    ]);

    // If already at last question or user clicked to finish
    if (currentStep >= QUESTIONS.length - 1 || readyForRecs) {
      finishConversation(newAnswers);
      return;
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setDynamicOptions(null);

    await processTurnWithAI(option, newAnswers);
  };

  const handleCustomSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customInput.trim()) return;

    const text = customInput.trim();
    setCustomInput('');

    const newAnswers = [
      ...answers,
      {
        questionId: activeQuestion.id,
        questionText: activeQuestion.text,
        selectedOption: text,
        isCustomText: true,
      },
    ];
    setAnswers(newAnswers);

    setChatHistory(prev => [
      ...prev,
      { sender: 'user', text, time: 'Agora' },
    ]);

    if (currentStep >= QUESTIONS.length - 1 || readyForRecs) {
      finishConversation(newAnswers);
      return;
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setDynamicOptions(null);

    await processTurnWithAI(text, newAnswers);
  };

  const handleSkip = () => {
    handleSelectOption('Pular / Sem preferência');
  };

  const handleToggleMulti = (option: string) => {
    setSelectedMulti(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const handleConfirmMulti = () => {
    const joined = selectedMulti.join(', ') || 'Nenhum selecionado';
    finishConversation([
      ...answers,
      {
        questionId: 'streamings',
        questionText: 'Quais plataformas de streaming você possui?',
        selectedOption: joined,
        isCustomText: false,
      },
    ]);
  };

  const finishConversation = (finalAnswers: ConversationAnswer[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sensacional! Coletei todas as informações necessárias. Cruzando suas preferências com o catálogo oficial do Brasil...',
          time: 'Agora',
        },
      ]);
      setTimeout(() => {
        onComplete(finalAnswers, lastExtractedData);
      }, 900);
    }, 600);
  };

  const progressPercent = Math.min(100, Math.round(((currentStep + 1) / QUESTIONS.length) * 100));

  // Determine current options to display (dynamic AI quick replies take precedence if present)
  const currentOptions = dynamicOptions && dynamicOptions.length > 0 ? dynamicOptions : activeQuestion.options;

  return (
    <div className="min-h-screen bg-[#10111B] text-white flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Header inside conversation */}
      <div className="max-w-3xl mx-auto w-full mb-4">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-violet-500/40 shadow-lg shadow-violet-500/20">
              <img
                src={AI_AVATAR_URL}
                alt="CineMatch AI Avatar"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-white">CineMatch AI</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini Online
                </span>
              </div>
              <p className="text-xs text-slate-400">Assistente pessoal de streaming</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] text-slate-400">Progresso da Descoberta</span>
              <span className="text-xs font-mono font-bold text-cyan-400">{progressPercent}% calibrado</span>
            </div>
            <button
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="max-w-3xl mx-auto w-full flex-1 overflow-y-auto space-y-4 py-4 pr-1">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-violet-500/30">
                <img
                  src={AI_AVATAR_URL}
                  alt="AI Avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-md shadow-violet-600/20'
                  : 'bg-[#1D2030] border border-white/8 text-slate-100 rounded-tl-sm shadow-lg'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
              <div className="text-[10px] text-slate-400/80 text-right mt-1 font-mono">{msg.time}</div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-violet-500/30">
              <img
                src={AI_AVATAR_URL}
                alt="AI Avatar"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-[#1D2030] border border-white/8 rounded-2xl px-4 py-3 rounded-tl-sm inline-flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Answer Panel */}
      <div className="max-w-3xl mx-auto w-full pt-4 border-t border-white/8">
        {readyForRecs ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-slate-900/40 border border-violet-500/30 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Contexto Suficiente Detectado pelo Gemini</span>
            </div>
            <p className="text-sm text-slate-200">
              Já temos informações ricas sobre seu humor e formato para gerar os 3 melhores títulos disponíveis!
            </p>
            <button
              onClick={() => finishConversation(answers)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 font-bold text-white text-sm shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
            >
              <span>Gerar 3 Recomendações Perfeitas Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                Pergunta {Math.min(currentStep + 1, QUESTIONS.length)} de {QUESTIONS.length}
              </span>
              <button
                onClick={handleSkip}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <span>Pular esta pergunta</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* If Provider Multi-Select */}
            {activeQuestion.isProviderSelector ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {STREAMING_PROVIDERS.map(p => {
                    const isSelected = selectedMulti.includes(p.name);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleToggleMulti(p.name)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-violet-600/20 border-violet-500 text-white shadow-md shadow-violet-500/20'
                            : 'bg-[#1D2030] border-white/8 text-slate-300 hover:bg-[#25283D]'
                        }`}
                      >
                        <span className="font-semibold text-sm">{p.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-cyan-300" />}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleConfirmMulti}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white text-sm hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Confirmar Streamings e Ver Recomendações</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Predefined or Dynamic Options Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    className="p-3 rounded-xl bg-[#1D2030] hover:bg-[#25283D] border border-white/8 hover:border-violet-500/40 text-left text-sm font-medium text-slate-200 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span>{opt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            )}

            {/* Custom Free Text Input */}
            <form onSubmit={handleCustomSubmit} className="pt-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder="Ou me conte com suas próprias palavras..."
                  className="w-full py-3 pl-4 pr-12 rounded-xl bg-[#161826] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!customInput.trim()}
                  className="absolute right-2.5 p-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 transition-all"
                  title="Enviar mensagem"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
