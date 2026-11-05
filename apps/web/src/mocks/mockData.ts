import { VerificationReport, UserProfile, NotificationItem } from '../types';

export const DEMO_USER: UserProfile = {
  id: 'usr-traunes-ai-4829',
  name: 'Camille Laurent',
  email: 'camille.laurent@media-verification.org',
  role: 'Journaliste Fact-Checker Senior',
  organization: 'Observatoire International des Faits',
  bio: 'Spécialiste de la désinformation scientifique et environnementale. Formatrice en techniques d’OSINT et vérification de sources ouvertes.',
  joinedDate: '12 janvier 2025',
  stats: {
    totalChecks: 38,
    claimsExamined: 114,
    sourcesConsulted: 426,
    reportsExported: 29,
  },
  preferences: {
    language: 'fr',
    theme: 'light',
    highContrast: false,
    reducedMotion: false,
    defaultSearchDepth: 'standard',
    notificationsEmail: true,
    notificationsInApp: true,
    alertMajorDisinfo: true,
    historyRetentionDays: 90,
  },
};

export const PRESET_EXAMPLES = [
  {
    id: 'ex-climat',
    category: 'Climat & Énergie',
    title: 'Mix électrique et coût des énergies renouvelables',
    type: 'text' as const,
    content:
      '« Selon une publication virale partagée sur les réseaux, les parcs éoliens européens ont produit 40% moins d’électricité en 2024 qu’en 2020 en raison du manque de vent, et leur coût complet au mégawattheure dépasse désormais celui du charbon thermique sans subvention. »',
  },
  {
    id: 'ex-sante',
    category: 'Santé publique',
    title: 'Composition et efficacité du vaccin combiné grippe-Covid',
    type: 'url' as const,
    content: 'https://actualites-sante-partage.eu/analyse-vaccin-combiné-2025-effets-secondaires',
  },
  {
    id: 'ex-geopo',
    category: 'Économie & Géopolitique',
    title: 'Réserves de devises et dédollarisation commerciale',
    type: 'text' as const,
    content:
      '« Une déclaration largement reprise affirme que le dollar américain ne représente plus que 28% des réserves de change mondiales en 2025 et que les échanges bilatéraux au sein des BRICS+ ont totalement abandonné la monnaie américaine dès le 1er janvier. »',
  },
];

export const MOCK_REPORTS: VerificationReport[] = [
  {
    id: 'rep-2026-climat-91',
    title: 'Mix électrique et coût des énergies renouvelables',
    inputType: 'text',
    inputContent:
      'Selon une publication virale partagée sur les réseaux, les parcs éoliens européens ont produit 40% moins d’électricité en 2024 qu’en 2020 en raison du manque de vent, et leur coût complet au mégawattheure dépasse désormais celui du charbon thermique sans subvention.',
    createdAt: '2026-11-02T14:22:00Z',
    completedAt: '2026-11-02T14:24:45Z',
    language: 'Français',
    claimsCount: 3,
    confirmedCount: 0,
    contradictedCount: 2,
    unverifiableCount: 1,
    generalLimitations: [
      'Les données consolidées d’Eurostat et de l’Agence Internationale de l’Énergie pour le quatrième trimestre 2024 demeurent provisoires.',
      'Les coûts complets (LCOE) varient sensiblement selon les régions, le régime de vent local et le coût du capital appliqué.',
      'Cette analyse porte strictement sur la production européenne documentée et ne présume pas des conditions météorologiques exceptionnelles ultra-localisées.',
    ],
    criticalAdvice:
      'Privilégiez les séries statistiques pluriannuelles publiées par les gestionnaires de réseaux de transport (ENTSO-E, RTE) plutôt que les comparaisons ponctuelles entre deux mois spécifiques.',
    traceability: {
      engineVersion: 'TRAUNES AI Core 2.4.1-rc',
      modelChecked: 'Multi-Agent Cross-Check Pipeline',
      timestampUtc: '2026-11-02T14:24:45Z',
      queriesExecuted: 42,
      sourcesConsulted: 18,
      auditHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    claims: [
      {
        id: 'cl-1',
        claimText: 'La production éolienne européenne a chuté de 40% entre 2020 et 2024 en raison du manque de vent.',
        verdict: 'contradicted',
        verdictLabel: 'Contredite par les éléments disponibles',
        justification:
          'Les statistiques officielles d’ENTSO-E et du think-tank Ember indiquent au contraire une augmentation de +28% de la production éolienne totale entre 2020 (397 TWh) et 2024 (508 TWh), portée par l’installation de nouvelles capacités terrestres et en mer.',
        supportingEvidence: [
          'Aucun organisme officiel de régulation de l’énergie ne signale de chute de production globale sur cette période.',
        ],
        refutingEvidence: [
          'Rapport annuel ENTSO-E 2024 : 508 TWh produits par l’éolien en Europe contre 397 TWh en 2020 (+27,9%).',
          'Observatoire Ember Electricity Review : part de l’éolien dans l’électricité européenne passée de 14,3% à 18,2%.',
        ],
        limitations: [
          'Des baisses locales temporaires de facteur de charge ont été observées sur certaines zones d’Europe centrale au cours de l’été 2022, mais sans impact global sur le bilan 2024.',
        ],
        sources: [
          {
            id: 'src-1',
            name: 'Rapport Annuel du Réseau Européen des Gestionnaires (ENTSO-E)',
            publisher: 'ENTSO-E Transparency Platform',
            url: 'https://transparency.entsoe.eu/generation/r2/actualGenerationPerProductionType',
            publishedDate: '15 janvier 2025',
            reliability: 'high',
            status: 'confirmed',
            excerpt:
              'Total wind generation reached 508 TWh across EU-27 member states in 2024, representing continuous annual capacity expansion.',
          },
          {
            id: 'src-2',
            name: 'European Electricity Review 2025',
            publisher: 'Ember Climate',
            url: 'https://ember-climate.org/insights/research/european-electricity-review-2025/',
            publishedDate: '28 janvier 2025',
            reliability: 'high',
            status: 'confirmed',
            excerpt:
              'Wind generation has grown by nearly 30% since 2020, outpacing initial projections despite localized intermittency.',
          },
        ],
      },
      {
        id: 'cl-2',
        claimText: 'Le coût complet (LCOE) de l’éolien dépasse désormais celui du charbon thermique sans subvention.',
        verdict: 'contradicted',
        verdictLabel: 'Contredite par les éléments disponibles',
        justification:
          'D’après les rapports de référence de l’AIE et de BloombergNEF, le coût actualisé moyen de l’énergie (LCOE) de l’éolien terrestre en Europe oscille entre 48 et 65 €/MWh en 2024, tandis que celui d’une centrale au charbon existante s’établit entre 95 et 140 €/MWh, notamment en raison du coût du combustible et des quotas carbone (ETS).',
        supportingEvidence: [
          'Les coûts de construction des éoliennes ont connu une inflation modérée (+15% en 2022-2023) avant de se stabiliser.',
        ],
        refutingEvidence: [
          'Agence Internationale de l’Énergie (AIE) - World Energy Outlook : LCOE éolien terrestre moyen à 52 $/MWh vs 115 $/MWh pour le charbon en Europe.',
          'BloombergNEF 2H 2024 LCOE Benchmark : l’éolien terrestre reste 45% moins coûteux que les centrales thermiques fossiles en Europe.',
        ],
        limitations: [
          'L’éolien en mer (offshore) profond présente des coûts plus élevés (85-110 €/MWh), se rapprochant dans certains cas des centrales fossiles amorties hors taxe carbone.',
        ],
        sources: [
          {
            id: 'src-3',
            name: 'Renewable Power Generation Costs in 2024',
            publisher: 'IRENA (Agence Internationale pour les Énergies Renouvelables)',
            url: 'https://www.irena.org/publications/2024/renewable-costs',
            publishedDate: '10 septembre 2024',
            reliability: 'high',
            status: 'confirmed',
            excerpt:
              'Onshore wind remains one of the most competitive sources of electricity worldwide, significantly undercutting fossil alternatives.',
          },
          {
            id: 'src-4',
            name: 'Étude d’impact des prix de l’énergie (Blog non évalué)',
            publisher: 'EcoTribunes Libres',
            url: 'https://ecotribunes-libres.org/articles/lcoe-comparatif-2024',
            publishedDate: '12 octobre 2024',
            reliability: 'unverified',
            status: 'not_confirmed',
            excerpt:
              'Argumentaire sans données brutes téléchargeables ni prise en compte des coûts du CO2.',
          },
        ],
      },
      {
        id: 'cl-3',
        claimText: 'L’intensité moyenne des vents de surface en Europe occidentale est en baisse tendancielle irréversible.',
        verdict: 'unverifiable',
        verdictLabel: 'Non vérifiable',
        justification:
          'La communauté climatologique et le GIEC soulignent une variabilité décennale naturelle importante du régime des vents ("global stilling"). Les modèles climatiques actuels ne convergent pas vers une baisse irréversible statistiquement significative à l’échelle européenne.',
        supportingEvidence: [
          'Quelques études régionales identifient des anomalies négatives de vitesse de vent entre 2021 et 2023 dans le nord de l’Europe.',
        ],
        refutingEvidence: [
          'Rapport AR6 du GIEC (Chapitre 12) : confiance faible ("low confidence") sur les tendances d’évolution à long terme des vitesses moyennes de vent de surface en Europe continentale.',
        ],
        limitations: [
          'Les séries de mesures anémométriques homogénéisées à 100 mètres de hauteur ne disposent pas d’un recul séculaire suffisant.',
        ],
        sources: [
          {
            id: 'src-5',
            name: 'GIEC - Sixième Rapport d’Évaluation (AR6), Groupe de travail I',
            publisher: 'IPCC / GIEC',
            url: 'https://www.ipcc.ch/report/ar6/wg1/',
            publishedDate: '2023',
            reliability: 'high',
            status: 'confirmed',
            excerpt:
              'Confidence in observed changes in surface wind speed remains low to medium depending on observation network density.',
          },
        ],
      },
    ],
  },
  {
    id: 'rep-2026-geopo-14',
    title: 'Réserves de devises et dédollarisation commerciale',
    inputType: 'text',
    inputContent:
      'Une déclaration largement reprise affirme que le dollar américain ne représente plus que 28% des réserves de change mondiales en 2025 et que les échanges bilatéraux au sein des BRICS+ ont totalement abandonné la monnaie américaine dès le 1er janvier.',
    createdAt: '2026-10-28T09:15:00Z',
    completedAt: '2026-10-28T09:18:20Z',
    language: 'Français',
    claimsCount: 2,
    confirmedCount: 0,
    contradictedCount: 2,
    unverifiableCount: 0,
    generalLimitations: [
      'Les réserves non déclarées auprès du FMI (environ 5% du total) font l’objet d’estimations indirectes.',
      'Les monnaies de facturation commerciale ne sont pas toujours publiques pour les contrats de matières premières de gré à gré.',
    ],
    criticalAdvice:
      'Ne pas confondre la part d’une monnaie dans les réserves de change officielles (données COFER du FMI) avec son utilisation dans le système de messagerie interbancaire SWIFT.',
    traceability: {
      engineVersion: 'TRAUNES AI Core 2.4.1-rc',
      modelChecked: 'Multi-Agent Cross-Check Pipeline',
      timestampUtc: '2026-10-28T09:18:20Z',
      queriesExecuted: 36,
      sourcesConsulted: 14,
      auditHash: 'sha256-4a7d1ed414474e4033ac29ccb8653d9b43d22d326f6348398864703a493a7d4a',
    },
    claims: [
      {
        id: 'cl-geo-1',
        claimText: 'Le dollar américain ne représente plus que 28% des réserves de change mondiales en 2025.',
        verdict: 'contradicted',
        verdictLabel: 'Contredite par les éléments disponibles',
        justification:
          'Selon les données COFER (Currency Composition of Official Foreign Exchange Reserves) publiées trimestriellement par le Fonds Monétaire International (FMI), la part du dollar dans les réserves de change allouées s’élève à 58,4% au début 2025. Le chiffre de 28% ne correspond à aucune donnée officielle recensée.',
        supportingEvidence: [
          'La part du dollar a lentement décliné sur vingt ans (passant de ~71% en 2000 à ~58% en 2024), au profit de devises non traditionnelles (dollar australien, dollar canadien, yuan).',
        ],
        refutingEvidence: [
          'Rapport FMI COFER T4 2024 / T1 2025 : part du dollar américain établie à 58,41% du total alloué (6 640 milliards de dollars).',
          'Banque des Règlements Internationaux (BRI) - Bulletin économique : le dollar demeure la première devise de réserve mondiale avec plus du double de la part de l’euro (19,8%).',
        ],
        limitations: [
          'Certains pays sous sanctions internationales ont drastiquement réduit leurs avoirs en dollar dans leurs banques centrales respectives.',
        ],
        sources: [
          {
            id: 'src-geo-1',
            name: 'Fonds Monétaire International (FMI) - Base de données COFER',
            publisher: 'FMI (International Monetary Fund)',
            url: 'https://data.imf.org/?sk=E6A5F467-C14B-4AA8-9F6D-5A09EC4E62A4',
            publishedDate: '31 mars 2025',
            reliability: 'high',
            status: 'confirmed',
            excerpt:
              'U.S. dollar claims accounted for 58.41 percent of allocated official foreign exchange reserves in Q4 2024.',
          },
          {
            id: 'src-geo-2',
            name: 'Banque des Règlements Internationaux - Rapport Annuel',
            publisher: 'BRI (Bank for International Settlements)',
            url: 'https://www.bis.org/publ/arpdf/ar2024e.htm',
            publishedDate: 'Juin 2024',
            reliability: 'high',
            status: 'confirmed',
            excerpt:
              'While bilateral currency swaps have expanded, the greenback retains its preeminent role in global asset allocation.',
          },
        ],
      },
      {
        id: 'cl-geo-2',
        claimText: 'Les échanges bilatéraux au sein des BRICS+ ont totalement abandonné la monnaie américaine au 1er janvier.',
        verdict: 'contradicted',
        verdictLabel: 'Contredite par les éléments disponibles',
        justification:
          'Bien que les pays membres des BRICS+ encouragent l’usage de leurs monnaies nationales (rouble, yuan, roupie, dirham), de nombreuses transactions commerciales — en particulier les cargaisons d’hydrocarbures, de métaux et d’intrants agricoles — restent partiellement libellées ou compensées en dollars ou euros.',
        supportingEvidence: [
          'Le commerce russo-chinois est désormais réglé à plus de 90% en roubles et yuans selon les douanes russes.',
        ],
        refutingEvidence: [
          'Déclarations de la Banque Centrale d’Inde et du Ministère du Commerce indien confirmant l’usage continu du dollar pour l’essentiel du commerce extérieur.',
          'Statistiques de facturation de SWIFT : le dollar représentait encore 47% des paiements transfrontaliers globaux en début d’année.',
        ],
        limitations: [
          'Les systèmes de compensation alternatifs (ex: CIPS en Chine, SPFS en Russie) traitent un volume croissant hors du réseau SWIFT.',
        ],
        sources: [
          {
            id: 'src-geo-3',
            name: 'SWIFT RMB Tracker & Global Currency Usage',
            publisher: 'SWIFT Standards',
            url: 'https://www.swift.com/our-solutions/compliance-and-shared-services/business-intelligence/rmb-tracker',
            publishedDate: '15 février 2025',
            reliability: 'high',
            status: 'confirmed',
            excerpt:
              'Global transaction share: USD 47.1%, EUR 22.8%, GBP 7.1%, CNY 4.6%. Full dedollarization within BRICS+ remains incomplete.',
          },
        ],
      },
    ],
  },
  {
    id: 'rep-2026-sante-08',
    title: 'Origine et validation des études sur le microbiote et le sommeil',
    inputType: 'text',
    inputContent:
      'Une tribune soutient qu’une méta-analyse parue dans The Lancet prouve qu’une prise quotidienne de souches probiotiques spécifiques multiplie par deux le sommeil profond et supprime l’insomnie chronique en moins de 14 jours.',
    createdAt: '2026-10-19T11:00:00Z',
    completedAt: '2026-10-19T11:03:10Z',
    language: 'Français',
    claimsCount: 2,
    confirmedCount: 1,
    contradictedCount: 1,
    unverifiableCount: 0,
    generalLimitations: [
      'Les études interventionnelles randomisées en double aveugle sur l’axe intestin-cerveau comptent souvent des cohortes réduites (< 100 participants).',
      'L’effet placebo dans les troubles de l’endormissement est particulièrement élevé (30% à 40%).',
    ],
    criticalAdvice:
      'Vérifiez systématiquement si l’étude clinique invoquée a été menée chez l’animal (modèles murins) ou chez l’être humain.',
    traceability: {
      engineVersion: 'TRAUNES AI Core 2.4.1-rc',
      modelChecked: 'Multi-Agent Cross-Check Pipeline',
      timestampUtc: '2026-10-19T11:03:10Z',
      queriesExecuted: 28,
      sourcesConsulted: 11,
      auditHash: 'sha256-11f81d86f78477cb31853a479ff73a876a3a91079bc7be888361099230588691',
    },
    claims: [
      {
        id: 'cl-san-1',
        claimText: 'Une corrélation positive existe entre la diversité du microbiote intestinal et la régularité des cycles de sommeil.',
        verdict: 'confirmed',
        verdictLabel: 'Confirmée par les éléments disponibles',
        justification:
          'Plusieurs revues systématiques publiées dans des revues à comité de lecture (notamment Sleep Medicine Reviews et Frontiers in Psychiatry) documentent un lien statistiquement significatif entre la production d’acides gras à chaîne courte (butyrate, acétate) par la flore intestinale et la modulation des récepteurs GABA régulant le sommeil profond.',
        supportingEvidence: [
          'Méta-analyse 2024 de 19 essais cliniques dans Sleep Medicine Reviews montrant un indice de Pittsburgh amélioré.',
          'Consensus de la Société Française de Recherche sur le Sommeil (SFRMS).',
        ],
        refutingEvidence: [],
        limitations: [
          'Les mécanismes d’action précis chez l’adulte sain restent exploratoires et dépendent fortement du régime alimentaire global.',
        ],
        sources: [
          {
            id: 'src-san-1',
            name: 'Gut-brain axis and sleep architecture: A systematic review',
            publisher: 'Sleep Medicine Reviews (Elsevier)',
            url: 'https://doi.org/10.1016/j.smrv.2024.101902',
            publishedDate: '14 mai 2024',
            reliability: 'high',
            status: 'confirmed',
            excerpt:
              'Microbial diversity index was positively associated with sleep efficiency and total slow-wave duration across reviewed clinical cohorts.',
          },
        ],
      },
      {
        id: 'cl-san-2',
        claimText: 'The Lancet a prouvé qu’un complément probiotique supprime l’insomnie en 14 jours en doublant le sommeil profond.',
        verdict: 'contradicted',
        verdictLabel: 'Contredite par les éléments disponibles',
        justification:
          'Aucune publication de ce type n’existe dans la collection The Lancet. Les essais cliniques réels mesurent des gains modestes (15 à 25 minutes de sommeil supplémentaire par nuit) sur des protocoles de 8 à 12 semaines, sans aucune suppression totale de l’insomnie chronique.',
        supportingEvidence: [],
        refutingEvidence: [
          'Recherche exhaustive dans PubMed et The Lancet : aucun article ne corrobore l’affirmation d’un doublement du sommeil profond en 14 jours.',
          'Avis de l’Autorité Européenne de Sécurité des Aliments (EFSA) : aucune allégation de santé relative au sommeil n’a été autorisée pour les souches probiotiques.',
        ],
        limitations: [
          'Certains fabricants ont financé des essais ouverts sans groupe contrôle avec des résultats surinterprétés commercialement.',
        ],
        sources: [
          {
            id: 'src-san-2',
            name: 'Registre des allégations nutritionnelles et de santé',
            publisher: 'EFSA (Autorité Européenne de Sécurité des Aliments)',
            url: 'https://www.efsa.europa.eu/en/topics/topic/health-claims',
            publishedDate: 'Mis à jour 2024',
            reliability: 'high',
            status: 'confirmed',
            excerpt:
              'No health claim regarding sleep disorders resolution has been granted authorization for probiotic microorganisms.',
          },
          {
            id: 'src-san-3',
            name: 'Recherche PubMed / The Lancet Database',
            publisher: 'National Library of Medicine',
            url: 'https://pubmed.ncbi.nlm.nih.gov/?term=lancet+probiotics+insomnia+14+days',
            publishedDate: 'Consulté en octobre 2026',
            reliability: 'high',
            status: 'confirmed',
            excerpt:
              'Zero matching randomized controlled trials reporting doubling of deep sleep within 14 days.',
          },
        ],
      },
    ],
  },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Rapport TRAUNES AI finalisé',
    message: 'Le dossier « Mix électrique et coût des énergies renouvelables » est prêt à la consultation.',
    timestamp: 'Il y a 2 heures',
    read: false,
    type: 'run_completed',
    link: '/reports/rep-2026-climat-91',
  },
  {
    id: 'notif-2',
    title: 'Alerte Désinformation',
    message: 'Une campagne virale coordonnée concernant les réserves monétaires internationales a été détectée.',
    timestamp: 'Hier à 16:40',
    read: false,
    type: 'disinfo_alert',
    link: '/reports/rep-2026-geopo-14',
  },
  {
    id: 'notif-3',
    title: 'Sécurité de votre compte',
    message: 'Votre session a été ouverte avec succès depuis un nouveau navigateur.',
    timestamp: 'Il y a 3 jours',
    read: true,
    type: 'security',
    link: '/profil',
  },
];
