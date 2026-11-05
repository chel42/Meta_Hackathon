export interface CommunityPost {
  id: string;
  authorName: string;
  authorInitials: string;
  authorBadge: string;
  authorBadgeColor: string;
  authorColor: string;
  timeAgo: string;
  category: string;
  categoryColor: string;
  title: string;
  content: string;
  imageUrl?: string;
  sourceUrl?: string;
  likes: number;
  commentsCount: number;
  sharesCount: number;
  status: 'verified' | 'analyzing' | 'debunked';
  statusLabel: string;
  statusColor: string;
  tab: 'Pour vous' | 'Abonnements' | 'Récentes' | 'Tendances';
}

export const COMMUNITY_TABS = ['Pour vous', 'Abonnements', 'Récentes', 'Tendances'] as const;

export const COMMUNITY_CATEGORIES = [
  'Toutes catégories',
  'Politique',
  'Santé',
  'IA & Tech',
  'Société',
  'Économie',
  'Climat & Écologie',
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'p-1',
    authorName: 'Sarah Mansour',
    authorInitials: 'SM',
    authorBadge: 'Experte Source',
    authorBadgeColor: '#0F766E',
    authorColor: '#0F766E',
    timeAgo: 'Il y a 2h',
    category: 'Climat & Écologie',
    categoryColor: '#059669',
    title: 'Analyse du prétendu "gel record en Antarctique" qui circule sur TikTok',
    content:
      'J’ai croisé les données publiées sur les réseaux avec les relevés satellitaires officiels du NSIDC et de Copernicus. La citation tronquée provient en réalité d’un rapport de 2014 pris hors contexte.',
    imageUrl: '/guides/confirmation-bias.jpg',
    sourceUrl: 'https://nsidc.org/arcticseaicenews/',
    likes: 142,
    commentsCount: 36,
    sharesCount: 19,
    status: 'verified',
    statusLabel: 'Confirmée par preuves TRAUNES AI',
    statusColor: '#15803D',
    tab: 'Pour vous',
  },
  {
    id: 'p-2',
    authorName: 'David Lopez',
    authorInitials: 'DL',
    authorBadge: 'Détective IA',
    authorBadgeColor: '#7C3AED',
    authorColor: '#7C3AED',
    timeAgo: 'Il y a 4h',
    category: 'Santé',
    categoryColor: '#D97706',
    title: 'Prudence sur la "tisane miracle anti-glycémie" virale sur Facebook',
    content:
      'Ce post génère des millions de vues avec un logo officiel détourné de l’INSERM. L’INSERM a confirmé n’avoir jamais validé ce complément alimentaire.',
    imageUrl: '/guides/misleading-title.jpg',
    likes: 98,
    commentsCount: 24,
    sharesCount: 14,
    status: 'debunked',
    statusLabel: 'Contredite par sources médicales',
    statusColor: '#B91C1C',
    tab: 'Récentes',
  },
  {
    id: 'p-3',
    authorName: 'Amina Koné',
    authorInitials: 'AK',
    authorBadge: 'Vérificatrice TRAUNES AI',
    authorBadgeColor: '#2563EB',
    authorColor: '#2563EB',
    timeAgo: 'Il y a 6h',
    category: 'IA & Tech',
    categoryColor: '#7C3AED',
    title: 'Indices visibles pour repérer le faux discours de Florence Parly généré par IA',
    content:
      '1. Les lunettes se fondent avec la tempe lors des rotations de tête. 2. L’absence de cils naturels sur les gros plans. 3. Le bruit de fond sonore est synthétique.',
    imageUrl: '/guides/ai-image.jpg',
    likes: 215,
    commentsCount: 52,
    sharesCount: 47,
    status: 'verified',
    statusLabel: 'Preuve IA disponible',
    statusColor: '#15803D',
    tab: 'Tendances',
  },
  {
    id: 'p-4',
    authorName: 'Youssef Benali',
    authorInitials: 'YB',
    authorBadge: 'Sentinelle Citoyenne',
    authorBadgeColor: '#D97706',
    authorColor: '#D97706',
    timeAgo: 'Il y a 8h',
    category: 'Société',
    categoryColor: '#2563EB',
    title: 'Vérification en cours : rumeur de fermeture d’urgence de lignes TER en région',
    content:
      'Plusieurs comptes locaux relaient un faux communiqué aux couleurs de la SNCF. La direction régionale a démenti sur son compte officiel certifié.',
    likes: 67,
    commentsCount: 15,
    sharesCount: 9,
    status: 'analyzing',
    statusLabel: 'En cours d’analyse',
    statusColor: '#475569',
    tab: 'Abonnements',
  },
];

export const COMMUNITY_STATS = {
  activeMembers: '4 820',
  reportsShared: '1 290',
  reliabilityRate: '96,4 %',
};

export const COMMUNITY_RULES = [
  'Bienveillance et rigueur dans les échanges factuels.',
  'Toujours accompagner une affirmation d’une source vérifiable.',
  'Aucune attaque ad hominem : on analyse l’affirmation, pas la personne.',
  'Respecter les chartes éthiques de vérification de l’information.',
];
