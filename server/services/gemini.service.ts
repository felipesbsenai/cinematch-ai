import { GoogleGenAI, Type, Schema } from '@google/genai';
import { UserPreferencesEntity } from '../db/database';

export interface ExtractedConversationState {
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
}

export interface RecommendationExplanation {
  tmdbId: number;
  title: string;
  compatibilityScore: number;
  explanation: string;
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (this.apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.error('[GeminiService] Failed to initialize GoogleGenAI client:', err);
      }
    }
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && this.ai);
  }

  // Conversation analysis with Gemini 3.8 Flash
  async handleConversationTurn(
    conversationHistory: Array<{ sender: 'user' | 'ai'; text: string }>,
    currentPreferences?: Partial<UserPreferencesEntity>
  ): Promise<ExtractedConversationState> {
    if (!this.isConfigured() || !this.ai) {
      return this.fallbackConversationTurn(conversationHistory, currentPreferences);
    }

    try {
      const systemInstruction = `
Você é o assistente inteligente do CineMatch AI — um curador e sommelier de cinema e séries altamente empático, moderno e focado em português do Brasil.
Seu objetivo é conduzir um diálogo fluido, inteligente e adaptativo para entender exatamente o que o usuário quer assistir agora.

Diretrizes:
1. Seja acolhedor, descontraído e cinéfilo, sem ser pedante. Fale em português brasileiro nativo.
2. Identifique o humor (mood), tipo de conteúdo (filme ou série), gêneros favoritos para o momento, restrições/gêneros rejeitados, duração e com quem ele vai assistir.
3. Não faça questionários engessados ou longos. Faça UMA pergunta de cada vez ou comente com sagacidade o que ele disse antes de direcionar.
4. Se o usuário já deu detalhes suficientes (ex: humor claro, gênero e formato, ou se respondeu a 2 ou 3 perguntas com clareza), marque "readyForRecommendations: true".
5. Forneça sempre de 2 a 4 "suggestedQuickReplies" curtos (1 a 4 palavras) que o usuário pode clicar como botões rápidos na interface para facilitar a interação móvel.
`;

      const prompt = `
Histórico da conversa:
${conversationHistory
  .map(m => `${m.sender === 'user' ? 'Usuário' : 'CineMatch AI'}: ${m.text}`)
  .join('\n')}

Preferências pré-existentes do usuário (se houver):
${JSON.stringify(currentPreferences || {}, null, 2)}

Analise o histórico e responda estritamente no formato JSON estruturado com os campos:
- reply: texto da sua resposta ao usuário em português brasileiro.
- readyForRecommendations: booleano indicando se já temos dados suficientes para gerar as 3 melhores recomendações.
- mood: humor detectado (ex: "tenso", "reflexivo", "empolgado", "descontraído", "melancólico", "eletrizante", "nostálgico").
- contentType: "movie", "series" ou "all".
- preferredGenres: lista de nomes de gêneros (ex: ["Ficção científica", "Suspense", "Drama", "Comédia"]).
- rejectedGenres: lista de gêneros a evitar (ex: ["Terror", "Romance"]).
- preferredDuration: "curto", "médio", "longo" ou "qualquer".
- watchingWith: "sozinho", "casal", "amigos", "familia" ou "qualquer".
- streamingProviders: plataformas mencionadas (ex: ["netflix", "prime", "max", "disney"]).
- suggestedQuickReplies: array com 2 a 4 sugestões de respostas curtas para botões.
- confidence: número de 0 a 100 de confiança no entendimento do desejo.
`;

      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
          readyForRecommendations: { type: Type.BOOLEAN },
          mood: { type: Type.STRING },
          contentType: { type: Type.STRING, enum: ['movie', 'series', 'all'] },
          preferredGenres: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          rejectedGenres: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          preferredDuration: { type: Type.STRING },
          watchingWith: {
            type: Type.STRING,
            enum: ['sozinho', 'casal', 'amigos', 'familia', 'qualquer'],
          },
          streamingProviders: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          suggestedQuickReplies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          confidence: { type: Type.NUMBER },
        },
        required: ['reply', 'readyForRecommendations'],
      };

      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.7,
        },
      });

      const responseText = result.text || '{}';
      const parsed = JSON.parse(responseText) as ExtractedConversationState;
      return {
        reply: parsed.reply || 'Entendido! Deixe-me encontrar as melhores opções para você.',
        readyForRecommendations: Boolean(parsed.readyForRecommendations),
        mood: parsed.mood || 'reflexivo',
        contentType: parsed.contentType || 'all',
        preferredGenres: parsed.preferredGenres || [],
        rejectedGenres: parsed.rejectedGenres || [],
        preferredDuration: parsed.preferredDuration || 'qualquer',
        watchingWith: parsed.watchingWith || 'qualquer',
        streamingProviders: parsed.streamingProviders || [],
        suggestedQuickReplies: parsed.suggestedQuickReplies || ['Sim, encontrar agora!', 'Prefiro algo mais leve', 'Qualquer um'],
        confidence: parsed.confidence || 85,
      };
    } catch (err) {
      console.error('[GeminiService] Error in handleConversationTurn:', err);
      return this.fallbackConversationTurn(conversationHistory, currentPreferences);
    }
  }

  // Generate personalized "Por que recomendamos?" for the 3 top titles
  async generateExplanations(
    userContext: {
      mood?: string;
      preferredGenres?: string[];
      rejectedGenres?: string[];
      watchingWith?: string;
      recentInteractions?: string[];
    },
    titles: Array<{
      tmdbId: number;
      title: string;
      synopsis: string;
      genres: string[];
      voteAverage: number;
    }>
  ): Promise<RecommendationExplanation[]> {
    if (!this.isConfigured() || !this.ai) {
      return this.fallbackExplanations(userContext, titles);
    }

    try {
      const prompt = `
Contexto e Desejo do Usuário:
- Humor/Vibe: ${userContext.mood || 'Imersivo e instigante'}
- Gêneros preferidos: ${(userContext.preferredGenres || ['Ficção', 'Drama']).join(', ')}
- Gêneros rejeitados: ${(userContext.rejectedGenres || []).join(', ') || 'Nenhum'}
- Companhia: ${userContext.watchingWith || 'sozinho'}

Títulos selecionados pelo catálogo para recomendação:
${titles
  .map(
    (t, idx) =>
      `${idx + 1}. ID: ${t.tmdbId} | Título: "${t.title}" | Gêneros: ${t.genres.join(', ')} | Nota TMDB: ${t.voteAverage} | Sinopse: ${t.synopsis.slice(0, 200)}...`
  )
  .join('\n\n')}

Gere uma explicação personalizada e cativante em português do Brasil para cada um dos 3 títulos, explicando exatamente POR QUE combina com o momento do usuário ("Por que recomendamos?").
Retorne também uma porcentagem calculada de compatibilidade (número inteiro entre 87 e 99).

Responda estritamente em JSON com a lista de 3 objetos:
[
  {
    "tmdbId": 123,
    "title": "Nome do Filme",
    "compatibilityScore": 96,
    "explanation": "Texto persuasivo de 1 a 2 frases conectando o humor do usuário à atmosfera da obra."
  }
]
`;

      const responseSchema: Schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            tmdbId: { type: Type.INTEGER },
            title: { type: Type.STRING },
            compatibilityScore: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
          },
          required: ['tmdbId', 'title', 'compatibilityScore', 'explanation'],
        },
      };

      const result = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.6,
        },
      });

      const responseText = result.text || '[]';
      const parsed = JSON.parse(responseText) as RecommendationExplanation[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return this.fallbackExplanations(userContext, titles);
    } catch (err) {
      console.error('[GeminiService] Error in generateExplanations:', err);
      return this.fallbackExplanations(userContext, titles);
    }
  }

  // Graceful rule-based heuristics fallback when GEMINI_API_KEY is pending
  private fallbackConversationTurn(
    conversationHistory: Array<{ sender: 'user' | 'ai'; text: string }>,
    _currentPreferences?: Partial<UserPreferencesEntity>
  ): ExtractedConversationState {
    const userMessages = conversationHistory.filter(m => m.sender === 'user');
    const lastMsg = userMessages[userMessages.length - 1]?.text.toLowerCase() || '';
    const turnCount = userMessages.length;

    // Mood heuristics
    let mood = 'reflexivo';
    if (lastMsg.includes('rir') || lastMsg.includes('comédia') || lastMsg.includes('leve') || lastMsg.includes('divert')) {
      mood = 'descontraído';
    } else if (lastMsg.includes('tensa') || lastMsg.includes('suspense') || lastMsg.includes('psicológico') || lastMsg.includes('mistério')) {
      mood = 'tenso';
    } else if (lastMsg.includes('chora') || lastMsg.includes('emoção') || lastMsg.includes('drama')) {
      mood = 'emocionante';
    } else if (lastMsg.includes('pensar') || lastMsg.includes('ficção') || lastMsg.includes('espaço') || lastMsg.includes('mente')) {
      mood = 'reflexivo';
    }

    // Genre extraction
    const preferredGenres: string[] = [];
    if (lastMsg.includes('ficção') || lastMsg.includes('sci-fi')) preferredGenres.push('Ficção científica');
    if (lastMsg.includes('suspense') || lastMsg.includes('psicológico')) preferredGenres.push('Suspense');
    if (lastMsg.includes('drama')) preferredGenres.push('Drama');
    if (lastMsg.includes('comédia')) preferredGenres.push('Comédia');
    if (lastMsg.includes('ação')) preferredGenres.push('Ação');
    if (lastMsg.includes('animação')) preferredGenres.push('Animação');

    // Rejected genres
    const rejectedGenres: string[] = [];
    if (lastMsg.includes('sem terror') || lastMsg.includes('não gosto de terror') || lastMsg.includes('odeio terror')) {
      rejectedGenres.push('Terror');
    }

    // Content type
    let contentType: 'movie' | 'series' | 'all' = 'all';
    if (lastMsg.includes('filme') || lastMsg.includes('longa')) contentType = 'movie';
    if (lastMsg.includes('série') || lastMsg.includes('maratona') || lastMsg.includes('temporada')) contentType = 'series';

    // If turn count >= 2, we can proceed to recommendations
    const readyForRecommendations = turnCount >= 2 || lastMsg.includes('recomenda') || lastMsg.includes('pode buscar') || lastMsg.includes('mostrar');

    let reply = 'Excelente escolha! Você prefere algo mais contemporâneo e acelerado ou um clássico aclamado com ritmo cadenciado?';
    let suggestedQuickReplies = ['Lançamentos recentes', 'Clássicos aclamados', 'Surpreenda-me'];

    if (turnCount === 1) {
      if (mood === 'tenso') {
        reply = 'Adoro essa pegada! Você prefere um suspense psicológico que mexe com a mente, uma investigação policial ou conspiração?';
        suggestedQuickReplies = ['Suspense psicológico', 'Investigação policial', 'Conspiração e mistério'];
      } else if (mood === 'descontraído') {
        reply = 'Perfeito para relaxar a cabeça! Você está no clima de comédia ácida e inteligente, comédia romântica ou algo pastelão?';
        suggestedQuickReplies = ['Comédia inteligente', 'Romântica e leve', 'Besteyrol divertido'];
      } else {
        reply = 'Muito bom! Você prefere assistir a um filme fechado agora ou começar uma série para maratonar?';
        suggestedQuickReplies = ['Um filme de 2 horas', 'Uma série envolvente', 'Tanto faz'];
      }
    } else if (readyForRecommendations) {
      reply = 'Perfeito! Já captei exatamente o clima que você busca. Vou cruzar suas preferências com a disponibilidade no catálogo do Brasil.';
      suggestedQuickReplies = ['Gerar Recomendações!', 'Ajustar opções', 'Voltar'];
    }

    return {
      reply,
      readyForRecommendations,
      mood,
      contentType,
      preferredGenres: preferredGenres.length > 0 ? preferredGenres : ['Suspense', 'Drama'],
      rejectedGenres,
      preferredDuration: 'qualquer',
      watchingWith: 'sozinho',
      streamingProviders: ['netflix', 'prime', 'max'],
      suggestedQuickReplies,
      confidence: 88,
    };
  }

  private fallbackExplanations(
    userContext: any,
    titles: Array<{ tmdbId: number; title: string }>
  ): RecommendationExplanation[] {
    const defaultScores = [98, 94, 91];
    return titles.map((t, idx) => ({
      tmdbId: t.tmdbId,
      title: t.title,
      compatibilityScore: defaultScores[idx] || 90,
      explanation: `Combina com sua busca por narrativas ${userContext.mood || 'envolventes'} e apresenta aclamação crítica condizente com suas preferências.`,
    }));
  }
}

export const geminiService = new GeminiService();
