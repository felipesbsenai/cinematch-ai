import { Movie } from '../../src/types';
import { db, UserPreferencesEntity } from '../db/database';
import { tmdbService } from './tmdb.service';
import { geminiService } from './gemini.service';

export interface CatalogItem extends Movie {
  tmdbNumericId: number;
}

// Curated high-fidelity catalog of top-rated movies and series on Brazilian streaming platforms
export const BACKUP_CATALOG: CatalogItem[] = [
  {
    tmdbNumericId: 157336,
    id: 'movie-157336',
    title: 'Interestelar',
    originalTitle: 'Interstellar',
    type: 'movie',
    year: 2014,
    durationOrSeasons: '2h 49m',
    genre: ['Ficção científica', 'Drama', 'Aventura'],
    imdbRating: 8.7,
    tmdbRating: 8.4,
    ageRating: '10+',
    compatibilityScore: 98,
    synopsis: 'As reservas naturais da Terra estão chegando ao fim e um grupo de astronautas recebe a missão de verificar possíveis planetas para habitação. Cooper é chamado para liderar a expedição interestelar.',
    aiExplanation: 'Perfeito para quem busca uma jornada épica que une rigor científico, dilemas existenciais profundos e uma trilha sonora arrebatadora de Hans Zimmer.',
    posterUrl: '/src/assets/images/poster_interstellar_1794061033270.jpg',
    backdropUrl: '/src/assets/images/backdrop_interstellar_1794061034046.jpg',
    director: 'Christopher Nolan',
    screenplay: 'Jonathan Nolan & Christopher Nolan',
    cast: [
      { name: 'Matthew McConaughey', character: 'Joseph Cooper' },
      { name: 'Anne Hathaway', character: 'Dr. Amelia Brand' },
      { name: 'Jessica Chastain', character: 'Murphy Cooper' },
      { name: 'Michael Caine', character: 'Professor John Brand' },
    ],
    providers: ['max', 'prime'],
    availableOnUserSubscription: true,
    tags: ['Sci-Fi', 'Espaço', 'Buraco Negro', 'Tempo'],
  },
  {
    tmdbNumericId: 136283,
    id: 'tv-136283',
    title: 'O Urso',
    originalTitle: 'The Bear',
    type: 'series',
    year: 2022,
    durationOrSeasons: '3 Temporadas',
    genre: ['Drama', 'Comédia'],
    imdbRating: 8.6,
    tmdbRating: 8.3,
    ageRating: '16+',
    compatibilityScore: 94,
    synopsis: 'Um jovem chef do mundo da alta gastronomia volta para Chicago para administrar a lanchonete de sanduíches da sua família após uma tragédia.',
    aiExplanation: 'Ideal para quem busca intensidade imediata, ritmo frenético na cozinha e personagens com camadas emocionais viscerais em episódios ágeis.',
    posterUrl: '/src/assets/images/poster_the_bear_1794061033405.jpg',
    backdropUrl: '/src/assets/images/backdrop_interstellar_1794061034046.jpg',
    director: 'Christopher Storer',
    screenplay: 'Christopher Storer & Joanna Calo',
    cast: [
      { name: 'Jeremy Allen White', character: 'Carmen "Carmy" Berzatto' },
      { name: 'Ebon Moss-Bachrach', character: 'Richard "Richie" Jerimovich' },
      { name: 'Ayo Edebiri', character: 'Sydney Adamu' },
    ],
    providers: ['disney'],
    availableOnUserSubscription: true,
    tags: ['Culinária', 'Família', 'Tensão', 'Chicago'],
  },
  {
    tmdbNumericId: 95557,
    id: 'tv-95557',
    title: 'Ruptura',
    originalTitle: 'Severance',
    type: 'series',
    year: 2022,
    durationOrSeasons: '2 Temporadas',
    genre: ['Ficção científica', 'Suspense', 'Mistério'],
    imdbRating: 8.7,
    tmdbRating: 8.4,
    ageRating: '16+',
    compatibilityScore: 92,
    synopsis: 'Mark lidera uma equipe de funcionários de escritório cujas memórias foram divididas cirurgicamente entre a vida profissional e a vida pessoal.',
    aiExplanation: 'Atende diretamente ao seu desejo por suspense psicológico perturbador e atmosfera corporativa enigmática que desafia teorias a cada episódio.',
    posterUrl: '/src/assets/images/poster_severance_1794061033806.jpg',
    backdropUrl: '/src/assets/images/backdrop_interstellar_1794061034046.jpg',
    director: 'Ben Stiller',
    screenplay: 'Dan Erickson',
    cast: [
      { name: 'Adam Scott', character: 'Mark Scout' },
      { name: 'Patricia Arquette', character: 'Harmony Cobel' },
      { name: 'John Turturro', character: 'Irving Bailiff' },
      { name: 'Christopher Walken', character: 'Burt Goodman' },
    ],
    providers: ['apple'],
    availableOnUserSubscription: true,
    tags: ['Suspense Psicológico', 'Distopia', 'Mistério', 'Lumon'],
  },
  {
    tmdbNumericId: 546554,
    id: 'movie-546554',
    title: 'Entre Facas e Segredos',
    originalTitle: 'Knives Out',
    type: 'movie',
    year: 2019,
    durationOrSeasons: '2h 10m',
    genre: ['Comédia', 'Mistério', 'Crime'],
    imdbRating: 7.9,
    tmdbRating: 7.8,
    ageRating: '14+',
    compatibilityScore: 91,
    synopsis: 'Quando o renomado romancista policial Harlan Thrombey é encontrado morto em sua propriedade logo após seu aniversário de 85 anos, o curioso detetive Benoit Blanc investiga a excêntrica família.',
    aiExplanation: 'Perfeito para assistir em casal ou amigos: uma trama de assassinato inteligente, repleta de reviravoltas cômicas e elenco estelar.',
    posterUrl: '/src/assets/images/poster_knives_out_1794061035120.jpg',
    backdropUrl: '/src/assets/images/backdrop_interstellar_1794061034046.jpg',
    director: 'Rian Johnson',
    screenplay: 'Rian Johnson',
    cast: [
      { name: 'Daniel Craig', character: 'Benoit Blanc' },
      { name: 'Ana de Armas', character: 'Marta Cabrera' },
      { name: 'Chris Evans', character: 'Ransom Drysdale' },
    ],
    providers: ['netflix', 'prime'],
    availableOnUserSubscription: true,
    tags: ['Mistério', 'Whodunnit', 'Humor Ácido', 'Investigação'],
  },
  {
    tmdbNumericId: 94605,
    id: 'tv-94605',
    title: 'Arcane',
    originalTitle: 'Arcane',
    type: 'series',
    year: 2021,
    durationOrSeasons: '2 Temporadas',
    genre: ['Animação', 'Ação', 'Ficção científica', 'Drama'],
    imdbRating: 9.0,
    tmdbRating: 8.7,
    ageRating: '14+',
    compatibilityScore: 95,
    synopsis: 'Em meio ao conflito entre as cidades-gêmeas de Piltover e Zaun, duas irmãs lutam em lados opostos de uma guerra entre tecnologias mágicas e convicções incompatíveis.',
    aiExplanation: 'Visualmente deslumbrante, trilha sonora visceral e narrativa dramática profunda que cativa tanto amantes de animação quanto novatos.',
    posterUrl: '/src/assets/images/poster_arcane_1794061035057.jpg',
    backdropUrl: '/src/assets/images/backdrop_interstellar_1794061034046.jpg',
    director: 'Pascal Charrue & Arnaud Delord',
    screenplay: 'Christian Linke & Alex Yee',
    cast: [
      { name: 'Hailee Steinfeld', character: 'Vi (voz)' },
      { name: 'Ella Purnell', character: 'Jinx (voz)' },
      { name: 'Kevin Alejandro', character: 'Jayce (voz)' },
    ],
    providers: ['netflix'],
    availableOnUserSubscription: true,
    tags: ['Animação', 'Steampunk', 'Irmãs', 'Drama Épico'],
  },
  {
    tmdbNumericId: 693134,
    id: 'movie-693134',
    title: 'Duna: Parte 2',
    originalTitle: 'Dune: Part Two',
    type: 'movie',
    year: 2024,
    durationOrSeasons: '2h 46m',
    genre: ['Ficção científica', 'Aventura', 'Ação'],
    imdbRating: 8.6,
    tmdbRating: 8.3,
    ageRating: '14+',
    compatibilityScore: 97,
    synopsis: 'Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.',
    aiExplanation: 'Uma obra-prima audiovisual contemporânea que combina escala épica, dilemas de liderança e espetáculo cinematográfico de tirar o fôlego.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s520Wvu.jpg',
    director: 'Denis Villeneuve',
    screenplay: 'Denis Villeneuve & Jon Spaihts',
    cast: [
      { name: 'Timothée Chalamet', character: 'Paul Atreides' },
      { name: 'Zendaya', character: 'Chani' },
      { name: 'Rebecca Ferguson', character: 'Lady Jessica' },
    ],
    providers: ['max', 'prime'],
    availableOnUserSubscription: true,
    tags: ['Sci-Fi', 'Épico', 'Arrakis', 'Profecia'],
  },
  {
    tmdbNumericId: 87108,
    id: 'movie-87108',
    title: 'Oppenheimer',
    originalTitle: 'Oppenheimer',
    type: 'movie',
    year: 2023,
    durationOrSeasons: '3h 00m',
    genre: ['Drama', 'História'],
    imdbRating: 8.9,
    tmdbRating: 8.1,
    ageRating: '16+',
    compatibilityScore: 93,
    synopsis: 'A história do cientista americano J. Robert Oppenheimer, seu papel no Projeto Manhattan e no desenvolvimento da bomba atômica.',
    aiExplanation: 'Ideal para quem busca drama histórico tenso, edição magistral e uma exploração profunda sobre culpa, poder e moralidade.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/fm6K9vY9XB399vY5v2q2U7k9h.jpg',
    director: 'Christopher Nolan',
    screenplay: 'Christopher Nolan',
    cast: [
      { name: 'Cillian Murphy', character: 'J. Robert Oppenheimer' },
      { name: 'Emily Blunt', character: 'Katherine Oppenheimer' },
      { name: 'Robert Downey Jr.', character: 'Lewis Strauss' },
    ],
    providers: ['prime', 'globoplay'],
    availableOnUserSubscription: true,
    tags: ['História', 'Drama', 'Projeto Manhattan', 'Oscar'],
  },
  {
    tmdbNumericId: 100088,
    id: 'tv-100088',
    title: 'The Last of Us',
    originalTitle: 'The Last of Us',
    type: 'series',
    year: 2023,
    durationOrSeasons: '1 Temporada',
    genre: ['Drama', 'Ação', 'Ficção científica'],
    imdbRating: 8.8,
    tmdbRating: 8.6,
    ageRating: '16+',
    compatibilityScore: 96,
    synopsis: 'Vinte anos após uma praga fúngica quase extinguir a humanidade, o sobrevivente Joel é contratado para contrabandear a jovem Ellie para fora de uma zona de quarentena opressiva.',
    aiExplanation: 'Emocionante jornada pós-apocalíptica focada em laços humanos, sobrevivência e atuações comoventes de Pedro Pascal e Bella Ramsey.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2V7J78ED.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
    director: 'Craig Mazin & Neil Druckmann',
    screenplay: 'Craig Mazin & Neil Druckmann',
    cast: [
      { name: 'Pedro Pascal', character: 'Joel Miller' },
      { name: 'Bella Ramsey', character: 'Ellie Williams' },
      { name: 'Gabriel Luna', character: 'Tommy Miller' },
    ],
    providers: ['max'],
    availableOnUserSubscription: true,
    tags: ['Pós-apocalíptico', 'Sobrevivência', 'Paternidade', 'Drama'],
  },
  {
    tmdbNumericId: 126308,
    id: 'tv-126308',
    title: 'Xógun: A Gloriosa Saga do Japão',
    originalTitle: 'Shōgun',
    type: 'series',
    year: 2024,
    durationOrSeasons: '1 Temporada',
    genre: ['Drama', 'História', 'Ação'],
    imdbRating: 8.7,
    tmdbRating: 8.5,
    ageRating: '16+',
    compatibilityScore: 95,
    synopsis: 'No Japão do ano 1600, o náufrago inglês John Blackthorne é apanhado na teia de intrigas e disputas de poder do senhor feudal Lorde Toranaga.',
    aiExplanation: 'Estratégia militar refinada, códigos de honra e produção cinematográfica requintada para quem aprecia narrativas ricas e densas.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/5zMwH1hM86M7a3K9e3V4f3L.jpg',
    director: 'Rachel Kondo & Justin Marks',
    screenplay: 'Rachel Kondo & Justin Marks',
    cast: [
      { name: 'Hiroyuki Sanada', character: 'Lorde Yoshii Toranaga' },
      { name: 'Cosmo Jarvis', character: 'John Blackthorne' },
      { name: 'Anna Sawai', character: 'Toda Mariko' },
    ],
    providers: ['disney'],
    availableOnUserSubscription: true,
    tags: ['Samurais', 'Estratégia', 'Japão Feudal', 'Intriga'],
  },
  {
    tmdbNumericId: 545611,
    id: 'movie-545611',
    title: 'Tudo em Todo o Lugar ao Mesmo Tempo',
    originalTitle: 'Everything Everywhere All at Once',
    type: 'movie',
    year: 2022,
    durationOrSeasons: '2h 19m',
    genre: ['Ação', 'Aventura', 'Ficção científica', 'Comédia'],
    imdbRating: 7.8,
    tmdbRating: 7.8,
    ageRating: '16+',
    compatibilityScore: 92,
    synopsis: 'Uma imigrante chinesa exausta se vê involuntariamente envolvida em uma aventura insana através de universos paralelos onde precisa salvar a existência.',
    aiExplanation: 'Criatividade visual transbordante, humor absurdo e uma mensagem familiar comovente sobre empatia no caos da vida moderna.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/w3LxiVYPqRLexPaspRtP5TeLWkn.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/fOy2Jurz9Anw2vtUj7V4x5.jpg',
    director: 'Daniel Kwan & Daniel Scheinert',
    screenplay: 'Daniel Kwan & Daniel Scheinert',
    cast: [
      { name: 'Michelle Yeoh', character: 'Evelyn Wang' },
      { name: 'Ke Huy Quan', character: 'Waymond Wang' },
      { name: 'Stephanie Hsu', character: 'Joy Wang / Jobu Tupaki' },
      { name: 'Jamie Lee Curtis', character: 'Deirdre Beaubeirdre' },
    ],
    providers: ['prime'],
    availableOnUserSubscription: true,
    tags: ['Multiverso', 'Comédia Criativa', 'Família', 'Ação'],
  },
  {
    tmdbNumericId: 106379,
    id: 'tv-106379',
    title: 'Fallout',
    originalTitle: 'Fallout',
    type: 'series',
    year: 2024,
    durationOrSeasons: '1 Temporada',
    genre: ['Ficção científica', 'Ação', 'Aventura', 'Comédia'],
    imdbRating: 8.4,
    tmdbRating: 8.3,
    ageRating: '16+',
    compatibilityScore: 93,
    synopsis: '200 anos após o apocalipse nuclear, os pacíficos habitantes dos abrigos subterrâneos são forçados a retornar à superfície devastada e bizarra.',
    aiExplanation: 'Mistura genial de humor sombrio retrofuturista, violência estilizada e mistérios fascinantes no deserto radioativo.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/AnsZu4c0n7v02nB986oF2.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/sp70G9V5eP3.jpg',
    director: 'Jonathan Nolan & Lisa Joy',
    screenplay: 'Geneva Robertson-Dworet & Graham Wagner',
    cast: [
      { name: 'Ella Purnell', character: 'Lucy MacLean' },
      { name: 'Walton Goggins', character: 'The Ghoul' },
      { name: 'Aaron Moten', character: 'Maximus' },
    ],
    providers: ['prime'],
    availableOnUserSubscription: true,
    tags: ['Pós-apocalipse', 'Retrofuturismo', 'Ação', 'Humor Negro'],
  },
  {
    tmdbNumericId: 97546,
    id: 'tv-97546',
    title: 'Ted Lasso',
    originalTitle: 'Ted Lasso',
    type: 'series',
    year: 2020,
    durationOrSeasons: '3 Temporadas',
    genre: ['Comédia', 'Drama'],
    imdbRating: 8.8,
    tmdbRating: 8.5,
    ageRating: '14+',
    compatibilityScore: 94,
    synopsis: 'Um treinador norte-americano de futebol americano colegial é contratado inesperadamente para gerenciar um time de futebol profissional inglês na Premier League.',
    aiExplanation: 'O melhor antídoto para dias pesados: humor reconfortante, otimismo contagioso e personagens calorosos que transformam qualquer humor.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/5kAGBI1e5hI77fK4X4y.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/vGv6X.jpg',
    director: 'Brendan Hunt, Joe Kelly, Bill Lawrence',
    screenplay: 'Jason Sudeikis & Bill Lawrence',
    cast: [
      { name: 'Jason Sudeikis', character: 'Ted Lasso' },
      { name: 'Hannah Waddingham', character: 'Rebecca Welton' },
      { name: 'Brett Goldstein', character: 'Roy Kent' },
    ],
    providers: ['apple'],
    availableOnUserSubscription: true,
    tags: ['Conforto', 'Futebol', 'Otimismo', 'Comédia Afetuosa'],
  },
  {
    tmdbNumericId: 129,
    id: 'movie-129',
    title: 'A Viagem de Chihiro',
    originalTitle: 'Spirited Away',
    type: 'movie',
    year: 2001,
    durationOrSeasons: '2h 05m',
    genre: ['Animação', 'Fantasia', 'Aventura'],
    imdbRating: 8.6,
    tmdbRating: 8.5,
    ageRating: 'Livre',
    compatibilityScore: 95,
    synopsis: 'Chihiro, uma menina de 10 anos, se perde com seus pais em um mundo mágico governado por deuses, bruxas e espíritos, onde humanos são transformados em bestas.',
    aiExplanation: 'Obra-prima poética do Studio Ghibli que encanta todas as idades com imaginação deslumbrante e sensibilidade atemporal.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/393tVL5Fv2rK94q38o.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/mSDsSDwaP3E7Gh.jpg',
    director: 'Hayao Miyazaki',
    screenplay: 'Hayao Miyazaki',
    cast: [
      { name: 'Rumi Hiiragi', character: 'Chihiro (voz)' },
      { name: 'Miyu Irino', character: 'Haku (voz)' },
      { name: 'Mari Natsuki', character: 'Yubaba (voz)' },
    ],
    providers: ['netflix'],
    availableOnUserSubscription: true,
    tags: ['Ghibli', 'Miyazaki', 'Magia', 'Oscar Animação'],
  },
  {
    tmdbNumericId: 44111,
    id: 'movie-44111',
    title: 'O Auto da Compadecida',
    originalTitle: 'O Auto da Compadecida',
    type: 'movie',
    year: 2000,
    durationOrSeasons: '1h 44m',
    genre: ['Comédia', 'Aventura'],
    imdbRating: 8.6,
    tmdbRating: 8.6,
    ageRating: '12+',
    compatibilityScore: 97,
    synopsis: 'As aventuras hilárias dos sertanejos João Grilo e Chicó que sobrevivem à fome, à seca e aos poderosos usando apenas esperteza e malandragem.',
    aiExplanation: 'Patrimônio do cinema brasileiro com diálogos inesquecíveis, sátira social brilhante e atuações lendárias de Matheus Nachtergaele e Selton Mello.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/m8JTwqqTc02.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/auto_compadecida.jpg',
    director: 'Guel Arraes',
    screenplay: 'Guel Arraes, Adriana Falcão, João Falcão',
    cast: [
      { name: 'Matheus Nachtergaele', character: 'João Grilo' },
      { name: 'Selton Mello', character: 'Chicó' },
      { name: 'Fernanda Montenegro', character: 'A Compadecida' },
      { name: 'Lima Duarte', character: 'Bispo' },
    ],
    providers: ['globoplay'],
    availableOnUserSubscription: true,
    tags: ['Cinema Nacional', 'Sertão', 'Comédia Genial', 'Clássico'],
  },
  {
    tmdbNumericId: 496243,
    id: 'movie-496243',
    title: 'Parasita',
    originalTitle: 'Gisaengchung',
    type: 'movie',
    year: 2019,
    durationOrSeasons: '2h 12m',
    genre: ['Suspense', 'Drama', 'Comédia'],
    imdbRating: 8.5,
    tmdbRating: 8.5,
    ageRating: '16+',
    compatibilityScore: 96,
    synopsis: 'Toda a família de Ki-taek está desempregada, vivendo em um porão sujo. Uma oportunidade faz o filho começar a dar aulas de inglês para a garota de uma família rica, iniciando um plano audacioso.',
    aiExplanation: 'Suspense magistral vencedor de 4 Oscars que equilibra humor ácido com reviravoltas chocantes sobre desigualdade e sobrevivência.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/hiKmpZMGZswkA3ScuPi5.jpg',
    director: 'Bong Joon-ho',
    screenplay: 'Bong Joon-ho & Han Jin-won',
    cast: [
      { name: 'Song Kang-ho', character: 'Kim Ki-taek' },
      { name: 'Lee Sun-kyun', character: 'Park Dong-ik' },
      { name: 'Cho Yeo-jeong', character: 'Yeon-kyo' },
      { name: 'Choi Woo-shik', character: 'Kim Ki-woo' },
    ],
    providers: ['max'],
    availableOnUserSubscription: true,
    tags: ['Suspense', 'Reviravolta', 'Oscar de Melhor Filme', 'Coreia do Sul'],
  },
];

export function findCatalogItem(idOrTmdb: string | number): CatalogItem | undefined {
  const strId = String(idOrTmdb);
  const numId = parseInt(strId.replace(/(movie|tv)-/, ''), 10);
  return BACKUP_CATALOG.find(
    item => item.id === strId || item.tmdbNumericId === numId || String(item.tmdbNumericId) === strId
  );
}

export interface RecommendationRequest {
  userId?: string;
  mood?: string;
  contentType?: 'movie' | 'series' | 'all';
  preferredGenres?: string[];
  rejectedGenres?: string[];
  preferredDuration?: string;
  watchingWith?: string;
  userStreamingServices?: string[];
  seed?: number;
}

export class RecommendationEngine {
  async getRecommendations(req: RecommendationRequest): Promise<Movie[]> {
    const userId = req.userId || 'default-user';
    const userPrefs = db.getPreferences(userId);
    const watchlist = db.getWatchlist(userId);
    const history = db.getHistory(userId);

    // Collect IDs already watched or explicitly disliked
    const excludedTmdbIds = new Set<number>();
    watchlist.filter(w => w.watched).forEach(w => excludedTmdbIds.add(w.tmdbId));
    history
      .filter(h => h.interactionType === 'mark_watched' || h.interactionType === 'dislike')
      .forEach(h => excludedTmdbIds.add(h.tmdbId));

    const activeProviders = (
      req.userStreamingServices && req.userStreamingServices.length > 0
        ? req.userStreamingServices
        : userPrefs.streamingProviders
    ).map(p => p.toLowerCase());

    const targetType = req.contentType || userPrefs.preferredContentType || 'all';
    const preferredGenres = req.preferredGenres?.length ? req.preferredGenres : userPrefs.favoriteGenres;
    const rejectedGenres = req.rejectedGenres?.length ? req.rejectedGenres : userPrefs.rejectedGenres;

    let candidateMovies: any[] = [];

    // Attempt real TMDB discovery if configured
    if (tmdbService.isConfigured()) {
      try {
        const allGenres = await tmdbService.getGenres();
        const genreIdByName = new Map(allGenres.map(g => [g.name.toLowerCase(), g.id]));

        const withGenreIds = preferredGenres
          .map(name => genreIdByName.get(name.toLowerCase()))
          .filter(Boolean) as number[];

        const withoutGenreIds = rejectedGenres
          .map(name => genreIdByName.get(name.toLowerCase()))
          .filter(Boolean) as number[];

        if (targetType === 'movie' || targetType === 'all') {
          const movies = await tmdbService.discover({
            mediaType: 'movie',
            withGenres: withGenreIds.slice(0, 3),
            withoutGenres: withoutGenreIds,
            minRating: 7.0,
            sortBy: 'popularity.desc',
          });
          candidateMovies.push(...movies.map(m => ({ ...m, _mediaType: 'movie' })));
        }

        if (targetType === 'series' || targetType === 'all') {
          const tvShows = await tmdbService.discover({
            mediaType: 'tv',
            withGenres: withGenreIds.slice(0, 3),
            withoutGenres: withoutGenreIds,
            minRating: 7.0,
            sortBy: 'popularity.desc',
          });
          candidateMovies.push(...tvShows.map(t => ({ ...t, _mediaType: 'tv' })));
        }
      } catch (err) {
        console.warn('[RecommendationEngine] TMDB discover failed, falling back:', err);
      }
    }

    // Filter from internal curated catalog if TMDB is offline or returned few results
    if (candidateMovies.length < 3) {
      const normalizedPreferred = preferredGenres.map(g => g.toLowerCase());
      const normalizedRejected = rejectedGenres.map(g => g.toLowerCase());

      const backupScored = BACKUP_CATALOG.filter(b => {
        // Exclude format if specified
        if (targetType !== 'all' && b.type !== targetType) return false;
        // Exclude watched/disliked
        if (excludedTmdbIds.has(b.tmdbNumericId)) return false;
        // Exclude rejected genres
        const hasRejected = b.genre.some(g => normalizedRejected.includes(g.toLowerCase()));
        if (hasRejected) return false;
        return true;
      }).map(item => {
        let score = item.compatibilityScore || 90;

        // Provider match bonus
        const providerMatch = item.providers.some(p => activeProviders.includes(p.toLowerCase()));
        if (providerMatch) score += 5;

        // Genre affinity bonus
        const genreOverlap = item.genre.some(g =>
          normalizedPreferred.some(pref => g.toLowerCase().includes(pref) || pref.includes(g.toLowerCase()))
        );
        if (genreOverlap) score += 6;

        return { item, score };
      });

      // Sort by score
      backupScored.sort((a, b) => b.score - a.score);

      // If user provided a seed or requested refresh, rotate candidates
      let selected = backupScored.map(s => s.item);
      if (selected.length < 3) {
        // Fallback: relax exclusions
        selected = BACKUP_CATALOG.slice(0, 3);
      }

      return selected.slice(0, 3);
    }

    // Multi-criteria scoring algorithm on real TMDB items
    const filteredCandidates = candidateMovies.filter(c => !excludedTmdbIds.has(c.id));
    const scoredCandidates: Array<{ item: any; score: number; providers: string[] }> = [];

    for (const item of filteredCandidates.slice(0, 10)) {
      const mediaType: 'movie' | 'tv' = item._mediaType || (item.title ? 'movie' : 'tv');
      let score = 0;

      const watchData = await tmdbService.getWatchProviders(mediaType, item.id);
      const isAvailable = watchData.flatrate.some(p => activeProviders.includes(p));
      if (isAvailable) {
        score += 35;
      } else if (watchData.flatrate.length > 0) {
        score += 10;
      }

      const voteAvg = item.vote_average || 7.0;
      score += Math.min(25, voteAvg * 2.5);
      score += 20;

      if (!item.poster_path) score -= 15;

      scoredCandidates.push({
        item,
        score,
        providers: watchData.flatrate.length > 0 ? watchData.flatrate : ['netflix'],
      });
    }

    scoredCandidates.sort((a, b) => b.score - a.score);
    const top3 = scoredCandidates.slice(0, 3);

    const titlesForGemini = top3.map(({ item }) => ({
      tmdbId: item.id,
      title: item.title || item.name || 'Título',
      synopsis: item.overview || '',
      genres: [],
      voteAverage: item.vote_average || 7.5,
    }));

    const explanations = await geminiService.generateExplanations(
      {
        mood: req.mood,
        preferredGenres,
        rejectedGenres,
        watchingWith: req.watchingWith,
      },
      titlesForGemini
    );

    const explanationMap = new Map<number, { explanation: string; score: number }>();
    explanations.forEach(e => {
      explanationMap.set(e.tmdbId, { explanation: e.explanation, score: e.compatibilityScore });
    });

    const finalRecommendations: Movie[] = [];
    for (const { item } of top3) {
      const mediaType: 'movie' | 'tv' = item._mediaType || (item.title ? 'movie' : 'tv');
      const geminiData = explanationMap.get(item.id);
      const formatted = await tmdbService.formatToCineMatchMovie(
        item,
        mediaType,
        geminiData?.score || 94,
        geminiData?.explanation || 'Recomendado para sua sessão com base nas suas preferências atuais.'
      );
      finalRecommendations.push(formatted);
    }

    return finalRecommendations;
  }
}

export const recommendationEngine = new RecommendationEngine();
