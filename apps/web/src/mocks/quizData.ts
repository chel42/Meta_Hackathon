export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizSession {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  difficultyLabel: string;
  questions: QuizQuestion[];
  xp: number;
  icon: string;
}

export interface QuizChallenge {
  id: number;
  type: string;
  title: string;
  description: string;
  current: number;
  target: number;
  xp: number;
  badge: string;
}

export const QUIZ_TABS = [
  "Vue d'ensemble",
  'Quiz rapides',
  'Jeux',
  'Défis',
  'Mes résultats',
  'Historique',
];

export const QUICK_QUIZZES: QuizSession[] = [
  {
    id: 1,
    title: 'Fake ou pas Fake ?',
    description: 'Distinguez les faits vérifiés des affirmations trompeuses.',
    difficulty: 'easy',
    difficultyLabel: 'Facile',
    xp: 50,
    icon: 'Newspaper',
    questions: [
      {
        id: 'q1',
        prompt: 'Un article sans date, sans auteur identifié et avec un titre en lettres capitales est généralement :',
        choices: [
          'Une source officielle à relayer immédiatement',
          'Une information suspecte à vérifier avec prudence',
          'Une information garantie par un lanceur d’alerte',
          'Un rapport scientifique vulgarisé',
        ],
        correctIndex: 1,
        explanation: 'L’absence de signature, de date et l’appel émotionnel sont des signaux d’alerte classiques.',
      },
      {
        id: 'q2',
        prompt: 'Quelle est la première action recommandée avant de partager une information choquante ?',
        choices: [
          'La transférer à son réseau pour les alerter au plus vite',
          'Remonter à la source primaire et croiser les sources indépendantes',
          'Vérifier uniquement le nombre de partages et de likes',
          'Enregistrer la capture d’écran pour la conserver',
        ],
        correctIndex: 1,
        explanation: 'Toujours remonter à la source originale et s’assurer que des sources fiables et indépendantes confirment les faits.',
      },
      {
        id: 'q3',
        prompt: 'Une photo saisissante d’inondation prouve-t-elle qu’un événement s’est déroulé aujourd’hui ?',
        choices: [
          'Oui, une photo est une preuve irréfutable',
          'Non, l’image peut provenir d’un événement passé réutilisé hors contexte',
          'Oui, si elle est en haute résolution',
          'Seulement si un compte vérifié sur X la publie',
        ],
        correctIndex: 1,
        explanation: 'Le recyclage d’anciennes images réelles mais décontextualisées est la forme de désinformation la plus fréquente.',
      },
    ],
  },
  {
    id: 2,
    title: 'Vrai ou Manipulé ?',
    description: 'Analysez des visuels et repérez les trucages numériques.',
    difficulty: 'medium',
    difficultyLabel: 'Moyen',
    xp: 70,
    icon: 'Image',
    questions: [
      {
        id: 'q1',
        prompt: 'Quel outil gratuit permet de vérifier l’antériorité d’une image sur le web ?',
        choices: [
          'La recherche d’images inversée (Google Images, TinEye, Yandex)',
          'Un logiciel d’édition vectorielle',
          'Un scan antivirus en ligne',
          'Le correcteur orthographique',
        ],
        correctIndex: 0,
        explanation: 'La recherche inversée permet de découvrir quand et où une image a été publiée pour la première fois.',
      },
      {
        id: 'q2',
        prompt: 'Quels détails physiques trahissent souvent un portrait généré par une IA photoréaliste ?',
        choices: [
          'La couleur des yeux',
          'Les boucles d’oreilles asymétriques, les dents surnuméraires et les reflets oculaires incohérents',
          'La présence d’un arrière-plan sombre',
          'La taille de l’image',
        ],
        correctIndex: 1,
        explanation: 'Les modèles génératifs peinent souvent avec les détails fins et les symétries anatomiques complexes.',
      },
    ],
  },
  {
    id: 3,
    title: 'Info ou Intox Vidéo ?',
    description: 'Détectez les vidéos ralenties, recadrées ou deepfakes.',
    difficulty: 'hard',
    difficultyLabel: 'Difficile',
    xp: 80,
    icon: 'Film',
    questions: [
      {
        id: 'q1',
        prompt: 'Un décalage subtil entre les mouvements des lèvres et la piste audio d’un discours politique suggère :',
        choices: [
          'Un deepfake ou un doublage synthétique réassigné',
          'Une bande passante insuffisante sur votre appareil',
          'Une retransmission en direct normale',
          'Une traduction automatique certifiée',
        ],
        correctIndex: 0,
        explanation: 'L’asynchronisme labial et les discontinuités de timbre vocal sont des marqueurs d’altération synthétique.',
      },
    ],
  },
  {
    id: 4,
    title: 'Biais cognitifs & Médias',
    description: 'Testez votre vigilance face aux pièges de notre propre esprit.',
    difficulty: 'easy',
    difficultyLabel: 'Facile',
    xp: 50,
    icon: 'Brain',
    questions: [
      {
        id: 'q1',
        prompt: 'La tendance naturelle à accepter sans hésitation une information qui confirme nos croyances préexistantes s’appelle :',
        choices: [
          'Le biais de confirmation',
          'L’effet placebo',
          'Le principe d’inertie',
          'Le paradoxe du choix',
        ],
        correctIndex: 0,
        explanation: 'Le biais de confirmation nous pousse à chercher et retenir les éléments favorables à notre opinion, en occultant les preuves contraires.',
      },
    ],
  },
];

export const CHALLENGES: QuizChallenge[] = [
  {
    id: 1,
    type: 'Défi hebdomadaire',
    title: 'Chasseur de fake news',
    description: 'Vérifiez 5 affirmations suspectes cette semaine sur TRAUNES AI.',
    current: 3,
    target: 5,
    xp: 150,
    badge: 'Chasseur TRAUNES AI',
  },
  {
    id: 2,
    type: 'Défi Détective',
    title: 'Maître des sources',
    description: 'Consultez les preuves et sources primaires de 3 rapports complets.',
    current: 2,
    target: 3,
    xp: 100,
    badge: 'Expert Source',
  },
  {
    id: 3,
    type: 'Défi Esprit critique',
    title: 'Série parfaite',
    description: 'Répondez correctement à 10 questions de quiz d’affilée.',
    current: 7,
    target: 10,
    xp: 200,
    badge: 'Esprit Critique',
  },
];

export const LEADERBOARD = [
  { rank: 1, name: 'Léa Bernard', xp: 2450, badge: 'Vérificatrice Élite' },
  { rank: 2, name: 'Karim O.', xp: 2180, badge: 'Détective IA' },
  { rank: 3, name: 'Camille Laurent', xp: 1940, badge: 'Expert Fact-Checking', isUser: true },
  { rank: 4, name: 'Thomas R.', xp: 1620, badge: 'Chasseur de Fake' },
  { rank: 5, name: 'Sophie V.', xp: 1450, badge: 'Apprenante Assidue' },
];

export const QUIZ_STATS = {
  xp: 1940,
  quizzesPassed: '14 réussis',
  successRate: '88 %',
  streak: '5 jours',
};

export const DAILY_CHALLENGE = {
  title: 'Défi du jour : Biais de confirmation',
  description: 'Repérez le biais dans 3 titres de presse d’actualité et gagnez +30 XP.',
  duration: '5 min',
  xp: 30,
};

export function getQuizSessionById(id: number): QuizSession {
  return QUICK_QUIZZES.find((q) => q.id === id) || QUICK_QUIZZES[0];
}
