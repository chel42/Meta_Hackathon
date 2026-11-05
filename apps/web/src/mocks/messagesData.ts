export interface ChatMessage {
  id: string;
  sender: 'user' | 'other';
  content: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  name: string;
  role: string;
  avatarLetter: string;
  avatarColor: string;
  badge?: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isOnline?: boolean;
  isCoach?: boolean;
  isGroup?: boolean;
  messages: ChatMessage[];
}

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'coach-traunes-ai',
    name: 'Coach IA TRAUNES AI',
    role: 'Assistant méthodologique & esprit critique',
    avatarLetter: 'T',
    avatarColor: '#0F766E',
    badge: 'Certifié',
    lastMessage: 'Bonjour Camille ! Avez-vous une affirmation ou une image à analyser aujourd’hui ?',
    time: '10:24',
    unreadCount: 1,
    isOnline: true,
    isCoach: true,
    messages: [
      {
        id: 'm-1',
        sender: 'other',
        content: 'Bonjour Camille ! Je suis votre Coach de vérification TRAUNES AI. Je peux vous guider pour analyser une affirmation, vérifier une source ou identifier un biais cognitif.',
        time: '10:20',
        status: 'read',
      },
      {
        id: 'm-2',
        sender: 'user',
        content: 'Bonjour ! J’ai vu passer un graphique sur la fonte des glaces qui affirme qu’il n’y a aucun réchauffement en Antarctique. Comment vérifier ?',
        time: '10:22',
        status: 'read',
      },
      {
        id: 'm-3',
        sender: 'other',
        content: 'Excellente démarche réflexe ! Pour ce type de contenu : 1. Vérifiez si l’échelle temporelle du graphique n’est pas tronquée (ex: zoom sur 2 ans au lieu de 40 ans). 2. Consultez les données ouvertes du NSIDC et de Copernicus. Souhaitez-vous que nous lancions une vérification guidée ?',
        time: '10:24',
        status: 'read',
      },
    ],
  },
  {
    id: 'sarah-m',
    name: 'Sarah Mansour',
    role: 'Experte Fact-Checking',
    avatarLetter: 'S',
    avatarColor: '#BE185D',
    lastMessage: 'Merci pour ton retour sur le rapport climat, les sources sont impeccables.',
    time: '09:15',
    unreadCount: 0,
    isOnline: true,
    messages: [
      {
        id: 'sm-1',
        sender: 'user',
        content: 'Salut Sarah, as-tu pu jeter un œil au dossier sur les feux de forêts au Canada ?',
        time: '09:05',
        status: 'read',
      },
      {
        id: 'sm-2',
        sender: 'other',
        content: 'Merci pour ton retour sur le rapport climat, les sources sont impeccables. La NASA et le GIEC confirment exactement vos observations.',
        time: '09:15',
        status: 'read',
      },
    ],
  },
  {
    id: 'groupe-verificateurs',
    name: 'Groupe : Vigies Info',
    role: '14 membres actifs',
    avatarLetter: 'VI',
    avatarColor: '#2563EB',
    isGroup: true,
    lastMessage: 'Thomas : Une fausse déclaration d’un ministre circule sur WhatsApp, lien partagé dans la communauté.',
    time: 'Hier',
    unreadCount: 3,
    messages: [
      {
        id: 'gv-1',
        sender: 'other',
        content: 'Bienvenue aux nouveaux vérificateurs dans le groupe d’entraide !',
        time: 'Hier 14:10',
        status: 'read',
      },
      {
        id: 'gv-2',
        sender: 'other',
        content: 'Thomas : Une fausse déclaration d’un ministre circule sur WhatsApp, lien partagé dans la communauté.',
        time: 'Hier 18:32',
        status: 'read',
      },
    ],
  },
  {
    id: 'alex-d',
    name: 'Alexandre Dubois',
    role: 'Membre certifié TRAUNES AI',
    avatarLetter: 'A',
    avatarColor: '#D97706',
    lastMessage: 'Je viens de débloquer le badge Détective IA !',
    time: 'Hier',
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 'ad-1',
        sender: 'other',
        content: 'Salut Camille, les quiz sur les deepfakes sont super bien construits ! Je viens de débloquer le badge Détective IA !',
        time: 'Hier 11:45',
        status: 'read',
      },
    ],
  },
];
