export interface LessonQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonContent {
  objectives: string[];
  summary: string;
  sections: {
    title: string;
    body: string;
    example?: string;
  }[];
  keyTakeaways: string[]; // À retenir
  proTip: string; // Conseil pratique TRAUNES AI
  warningBox?: string; // Piège à éviter
  quiz?: LessonQuizQuestion[];
}

export interface AcademyLesson {
  id: string;
  title: string;
  duration: string;
  content: LessonContent;
}

export interface AcademyModule {
  id: number;
  title: string;
  description: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  status: 'completed' | 'in-progress' | 'locked';
  progress?: number;
  icon: string;
  category: string;
  duration: string;
  lessons: AcademyLesson[];
}

export const ACADEMY_FILTERS = [
  'Tous les modules',
  "Bases de l'EMI",
  'Vérification',
  'Esprit critique',
  'IA & Numérique',
  'Société & Médias',
];

export const ACADEMY_LEVELS = [
  'Tous les niveaux',
  'Débutant',
  'Intermédiaire',
  'Avancé',
];

export const ACADEMY_MODULES: AcademyModule[] = [
  {
    id: 1,
    title: "Comprendre les médias et l'information",
    description: "Les clés fondamentales pour distinguer fait, opinion et rumeur dans le paysage médiatique moderne.",
    level: 'Débutant',
    status: 'completed',
    icon: 'BookOpen',
    category: "Bases de l'EMI",
    duration: '25 min',
    lessons: [
      {
        id: '1.1',
        title: "Qu'est-ce qu'une information journalistique ?",
        duration: '8 min',
        content: {
          objectives: [
            "Différencier une information vérifiée d'une opinion ou d'une publicité",
            "Comprendre les critères de déontologie journalistique (règle du recoupement)",
            "Identifier la chaîne de fabrication d'une dépêche d'actualité",
          ],
          summary: "Dans un flux quotidien saturé de publications, une véritable 'information' n'est ni un avis personnel, ni un simple témoignage isolé : c'est un fait vérifié et contextualisé.",
          sections: [
            {
              title: "Les 3 piliers d'une vraie information",
              body: "Pour être qualifiée d'information au sens strict, une donnée doit être d'intérêt général, factuelle et vérifiée auprès d'au moins deux sources indépendantes.",
              example: "Un tweet disant 'Gros incendie dans le centre-ville !' est un signal/témoignage. L'article de presse vérifié confirmant l'heure, les causes et le bilan auprès des pompiers est une information."
            },
            {
              title: "Fait vs Opinion : apprenez à les séparer",
              body: "Un fait est objectivement mesurable ('Les températures ont augmenté de 1,2°C'). Une opinion est un jugement de valeur subjectif ('Il fait beaucoup trop chaud cette année').",
              example: "'Le budget éducation augmente de 2%' (Fait) vs 'Cette hausse budgétaire est insuffisante' (Opinion)."
            }
          ],
          keyTakeaways: [
            "Une information repose sur des faits vérifiables et non sur un ressenti.",
            "Toujours chercher qui est l'auteur et quelle est son intention (informer, vendre, convaincre).",
            "Une opinion a le droit d'exister, mais elle ne doit pas être présentée comme une vérité absolue."
          ],
          proTip: "Faites le test du surligneur : dans un article, surlignez en vert les chiffres et faits constatés, et en jaune les adjectifs qualificatifs et jugements. Si le jaune domine, il s'agit d'une tribune d'opinion.",
          warningBox: "Attention à l'infobésité : la vitesse de publication sur les réseaux sociaux favorise la réaction émotionnelle au détriment de la rigueur factuelle.",
          quiz: [
            {
              id: 'q1.1',
              question: "Laquelle de ces propositions constitue une véritable information factuelle ?",
              options: [
                "L'électricité renouvelable est la meilleure solution d'avenir.",
                "Le conseil municipal a voté hier l'attribution de 50 000 € aux cantines scolaires.",
                "Les réseaux sociaux rendent les gens dépendants et tristes.",
                "Ce nouveau smartphone est un chef-d'œuvre de technologie."
              ],
              correctIndex: 1,
              explanation: "La décision du conseil municipal est un fait précis, daté, mesurable et vérifiable auprès de procès-verbaux publics."
            }
          ]
        }
      },
      {
        id: '1.2',
        title: "Pourquoi l'EMI est un enjeu citoyen majeur",
        duration: '9 min',
        content: {
          objectives: [
            "Comprendre l'impact des fausses nouvelles sur la vie démocratique",
            "Développer une démarche de doute méthodique bienveillant",
            "Protéger son entourage contre la désinformation virale"
          ],
          summary: "L'Éducation aux Médias et à l'Information (EMI) donne à chaque citoyen les outils critiques pour ne pas subir les manipulations d'opinion.",
          sections: [
            {
              title: "Le coût social de la désinformation",
              body: "Rumeurs médicales, fausses attaques politiques ou escroqueries financières : les fausses informations ont des conséquences concrètes sur la santé publique et la cohésion sociale.",
              example: "Pendant les épidémies, les faux remèdes miracles ont conduit des milliers de personnes à négliger des traitements vitaux."
            }
          ],
          keyTakeaways: [
            "L'esprit critique n'est pas un cynisme systématique, mais une curiosité méthodique.",
            "L'information de qualité nécessite du temps et du travail d'enquête."
          ],
          proTip: "Appliquez la règle des 5 secondes : attendez toujours 5 secondes avant de partager une vidéo choc.",
          quiz: [
            {
              id: 'q1.2',
              question: "Quelle est la définition exacte de l'esprit critique selon l'EMI ?",
              options: [
                "Refuser systématiquement toutes les déclarations des médias officiels.",
                "Évaluer la validité d'une information en examinant ses preuves et sa méthodologie.",
                "Ne croire que ce que l'on voit de ses propres yeux.",
                "Partager uniquement les informations qui confirment nos convictions."
              ],
              correctIndex: 1,
              explanation: "L'esprit critique consiste à questionner la qualité des preuves de manière rationnelle sans tomber dans la complotisme ni le suivisme aveugle."
            }
          ]
        }
      },
      {
        id: '1.3',
        title: "Le rôle actif du récepteur d'information",
        duration: '8 min',
        content: {
          objectives: [
            "Prendre conscience de son rôle dans la chaîne de propagation",
            "Adopter les gestes barrières du numérique"
          ],
          summary: "En likant ou transférant un message sur WhatsApp ou TikTok, vous devenez vous-même un média émetteur.",
          sections: [
            {
              title: "Vous êtes le dernier maillon de la chaîne",
              body: "Si vous ne partagez pas une affirmation douteuse, sa propagation s'arrête net. Vous avez le pouvoir d'assainir votre fil d'actualité.",
              example: "Un groupe de famille WhatsApp où chacun vérifie avant de transférer les alertes panique."
            }
          ],
          keyTakeaways: [
            "Ne devenez pas le relais involontaire des intox d'autrui.",
            "Un partage responsable protège la collectivité."
          ],
          proTip: "Si vous recevez une rumeur sur une messagerie privée, répondez gentiment en demandant : 'Où as-tu vu cette source originale ?'."
        }
      }
    ]
  },
  {
    id: 2,
    title: "Les sources d'information & Fact-checking",
    description: "Identifier la crédibilité des émetteurs, analyser la hiérarchie des sources et utiliser la méthode TRAUNES AI.",
    level: 'Débutant',
    status: 'completed',
    icon: 'Globe',
    category: "Bases de l'EMI",
    duration: '30 min',
    lessons: [
      {
        id: '2.1',
        title: "Sources primaires vs secondaires : quelles différences ?",
        duration: '10 min',
        content: {
          objectives: [
            "Savoir remonter à la source originelle d'une citation ou étude",
            "Identifier les distorsions d'interprétation lors des retranscriptions"
          ],
          summary: "Une source primaire est le témoin direct ou le document brut (rapport de police, étude publiée dans une revue à comité de lecture). Une source secondaire interprète ce document.",
          sections: [
            {
              title: "Remonter au document source",
              body: "Les blogs et comptes de réseaux sociaux synthétisent souvent mal les rapports originaux. Vérifier le fichier PDF ou le communiqué officiel est la règle d'or du fact-checking.",
              example: "Un titre de presse clame 'Le café provoque des insomnies sévères' d'après une étude. En lisant le texte scientifique (source primaire), on découvre que l'étude concernait 10 tasses de café par jour chez des rongeurs."
            }
          ],
          keyTakeaways: [
            "Ne vous contentez jamais du titre d'un article de seconde main.",
            "Cherchez le lien hypertexte pointant vers l'étude d'origine ou l'institution officielle."
          ],
          proTip: "Recherchez le mot-clé exact entre guillemets sur Google Scholar ou Data.gouv.fr pour retrouver la source scientifique.",
          quiz: [
            {
              id: 'q2.1',
              question: "Lequel de ces éléments est une source primaire ?",
              options: [
                "Un article de blog qui commente les résultats d'une élection.",
                "Le procès-verbal officiel signé par le bureau de vote.",
                "Un tweet résumé d'un militant politique.",
                "Un plateau de télévision débattant du scrutin."
              ],
              correctIndex: 1,
              explanation: "Le procès-verbal officiel est le document brut établi lors du dépouillement : c'est la source primaire irréfutable."
            }
          ]
        }
      },
      {
        id: '2.2',
        title: "Médias de référence, sites alternatifs et comptes influents",
        duration: '10 min',
        content: {
          objectives: [
            "Évaluer la transparence et les mentions légales d'un site web",
            "Reconnaître la charte éthique d'un média professionnel"
          ],
          summary: "Tous les sites web ne se valent pas. Un site d'information sérieux affiche son équipe rédactionnelle, ses financements et un droit de réponse.",
          sections: [
            {
              title: "Les indices de transparence",
              body: "Consultez la page 'Qui sommes-nous ?' ou 'Mentions légales'. L'absence d'ours rédactionnel ou de responsable de publication est un signal d'alerte majeur.",
              example: "Un site qui imite la charte graphique d'un grand journal (ex: 'Le Figaro.su') pour tromper le lecteur."
            }
          ],
          keyTakeaways: [
            "Vérifiez l'extension de domaine (.com, .org, .fr vs extensions exotiques).",
            "Méfiez-vous des sites d'imitation (typosquatting)."
          ],
          proTip: "Utilisez l'outil de vérification de domaine TRAUNES AI pour afficher immédiatement le propriétaire enregistré d'une URL."
        }
      },
      {
        id: '2.3',
        title: "Évaluer la fiabilité d'un expert ou intervenant",
        duration: '10 min',
        content: {
          objectives: [
            "Détecter l'ultracrépidarianisme (donner son avis hors de son domaine)",
            "Vérifier les conflits d'intérêts et les affiliations"
          ],
          summary: "Être docteur dans une discipline ne donne pas compétence dans toutes les autres. L'expertise s'évalue au regard des publications scientifiques évaluées par les pairs (peer-review).",
          sections: [
            {
              title: "L'argument d'autorité fallacieux",
              body: "Méfiez-vous du 'Professeur X dit que...'. Vérifiez ses travaux récents dans sa spécialité exacte.",
              example: "Un docteur en physique quantique donnant un avis péremptoire sur la virologie ou l'immunologie."
            }
          ],
          keyTakeaways: [
            "Le consensus scientifique repose sur des centaines d'études convergentes, pas sur l'avis d'une seule personnalité.",
            "Vérifiez si l'expert a des liens d'intérêts financiers avec le sujet abordé."
          ],
          proTip: "Tapez le nom de l'expert sur PubMed ou ORCID pour vérifier ses publications réelles."
        }
      }
    ]
  },
  {
    id: 3,
    title: "Vérifier une information & la méthode 5W",
    description: "La méthode d'investigation TRAUNES AI pas à pas : Qui, Quoi, Quand, Où, Pourquoi. Exercices et cas pratiques.",
    level: 'Intermédiaire',
    status: 'in-progress',
    progress: 75,
    icon: 'FileCheck',
    category: 'Vérification',
    duration: '40 min',
    lessons: [
      {
        id: '3.1',
        title: "La méthode des 5 W appliquée au Fact-Checking",
        duration: '12 min',
        content: {
          objectives: [
            "Maîtriser les 5 questions fondamentales du journalisme d'investigation",
            "Déceler les anomalies d'une dépêche d'actualité"
          ],
          summary: "Who (Qui ?), What (Quoi ?), When (Quand ?), Where (Où ?), Why (Pourquoi ?). Si l'une de ces réponses manque ou est floue, le contenu doit être analysé avec prudence.",
          sections: [
            {
              title: "Détail de la grille d'évaluation 5W",
              body: "1. Who : Qui affirme ? (Identité vérifiée ou anonyme ?)\n2. What : Quelle est l'affirmation précise ?\n3. When : Quand la scène s'est-elle produite ? (Est-ce un recyclage d'archive ?)\n4. Where : Lieu géographique vérifiable ?\n5. Why : Quelle intention motive cette diffusion ?",
              example: "Une vidéo affirmant 'Scène d'émeute hier à Paris !'. L'analyse montre qu'elle a été filmée à Madrid en 2018 lors d'un match de football."
            }
          ],
          keyTakeaways: [
            "Le hors-contexte temporel (recyclage d'images anciennes) représente 60% de la désinformation sur le web.",
            "Sans localisation précise, une image n'a pas de valeur probante."
          ],
          proTip: "L'analyse TRAUNES AI croise les bulletins météo historiques et les ombres du soleil pour valider le 'Quand' et le 'Où'.",
          quiz: [
            {
              id: 'q3.1',
              question: "Quel W est violé lorsqu'une vidéo d'inondation de 2015 est publiée comme se déroulant aujourd'hui ?",
              options: ["Who", "What", "When", "Why"],
              correctIndex: 2,
              explanation: "Le W de 'When' (Quand) est falsifié par le recyclage temporel d'une vidéo d'archive."
            }
          ]
        }
      },
      {
        id: '3.2',
        title: "Vérifier l'auteur, l'émetteur et le site hôte",
        duration: '12 min',
        content: {
          objectives: [
            "Débusquer les faux profils et comptes bots automatiques",
            "Analyser l'historique des publications d'un profil"
          ],
          summary: "Les comptes récents créés il y a quelques jours, sans biographie et publiant 200 tweets par jour sont très souvent des bots automatisés.",
          sections: [
            {
              title: "Anatomie d'un compte inauthentique",
              body: "Recherchez l'ancienneté du compte, la photo de profil générée par IA (fond flou, yeux centrés) et les interactions stéréotypées.",
              example: "Un compte prétendant être un citoyen local mais ayant des coordonnées horaires incohérentes."
            }
          ],
          keyTakeaways: [
            "Un nombre élevé de followers ne garantit pas l'authenticité d'un profil.",
            "Vérifiez si le compte a récemment changé de nom d'utilisateur."
          ],
          proTip: "Utilisez la recherche inversée d'image sur la photo de profil pour voir si elle provient d'une banque d'images ou d'un site de visages synthétiques."
        }
      },
      {
        id: '3.3',
        title: "Croiser les informations & la concordance des preuves",
        duration: '15 min',
        content: {
          objectives: [
            "Confronter plusieurs sources indépendantes sans lien d'intérêt",
            "Établir la synthèse probatoire TRAUNES AI"
          ],
          summary: "Une seule déclaration ne suffit pas. C's la convergence de témoignages neutres et indépendants qui permet d'atteindre le niveau de preuve suffisant.",
          sections: [
            {
              title: "Le principe de l'indépendance des sources",
              body: "Si trois journaux reprennent tous la même dépêche d'agence incomplète sans l'avoir vérifiée eux-mêmes, cela compte comme 1 seule source, pas 3 !",
              example: "Cinq sites d'actualité recopiant le même tweet parodique."
            }
          ],
          keyTakeaways: [
            "Remontez la chaîne de reprise jusqu'à la première source.",
            "Examinez les éléments de contradiction avec attention."
          ],
          proTip: "Le moteur TRAUNES AI vérifie si les sources citées s'auto-référencent en boucle.",
          quiz: [
            {
              id: 'q3.3',
              question: "Si 4 blogs recopient mot pour mot le même communiqué sans vérification, combien de sources indépendantes avez-vous ?",
              options: [
                "4 sources indépendantes",
                "1 seule source originelle répercutée",
                "Aucune source valide",
                "16 sources croisées"
              ],
              correctIndex: 1,
              explanation: "Des réplications en copier-coller ne constituent pas de nouvelles sources : cela reste la même source initiale reproduite."
            }
          ]
        }
      }
    ]
  },
  {
    id: 4,
    title: "Les biais cognitifs & pièges mentaux",
    description: "Biais de confirmation, effet de cadrage, émotion et illusion de vérité : comprendre comment notre cerveau se fait piéger.",
    level: 'Intermédiaire',
    status: 'in-progress',
    progress: 0,
    icon: 'Brain',
    category: 'Esprit critique',
    duration: '35 min',
    lessons: [
      {
        id: '4.1',
        title: "Le biais de confirmation : notre pire ennemi",
        duration: '12 min',
        content: {
          objectives: [
            "Comprendre pourquoi nous croyons plus facilement ce qui nous fait plaisir",
            "Apprendre à chercher activement des hypothèses contraires"
          ],
          summary: "Notre cerveau cherche naturellement à valider nos croyances préexistantes et rejette les faits qui les contredisent. C'est le biais de confirmation.",
          sections: [
            {
              title: "Comment le biais fonctionne dans notre cerveau",
              body: "Lorsque nous lisons une affirmation conforme à notre opinion, notre cerveau libère de la dopamine. À l'inverse, un fait contraire suscite une irritation défensive.",
              example: "Un supporter de football qui ne voit jamais les fautes commises par son équipe préférée, mais hurle à l'injustice pour celles de l'adversaire."
            }
          ],
          keyTakeaways: [
            "Plus une information vous réjouit ou vous indigne, plus vous devez la vérifier avec exigence.",
            "Exposez-vous régulièrement à des points de vue argumentés divergents."
          ],
          proTip: "Demandez-vous : 'Si cette nouvelle était le contraire exact, quelle serait ma réaction ?'. Cela désactive le réflexe émotionnel.",
          quiz: [
            {
              id: 'q4.1',
              question: "Qu'est-ce que le biais de confirmation ?",
              options: [
                "La tendance à croire uniquement les politiciens.",
                "La tendance à favoriser les informations qui confirment nos convictions déjà établies.",
                "L'incapacité à lire des textes longs.",
                "Le fait d'avoir toujours raison lors d'un débat."
              ],
              correctIndex: 1,
              explanation: "Le biais de confirmation nous pousse à accepter sans filtre ce qui nous arrange et à rejeter ce qui dérange nos opinions."
            }
          ]
        }
      },
      {
        id: '4.2',
        title: "L'effet d'entraînement et l'illusion de vérité par répétition",
        duration: '12 min',
        content: {
          objectives: [
            "Comprendre l'effet de vérité illusoire ('A force d'être répétée, une intox semble vraie')",
            "Déjouer la pression de la majorité sur les réseaux"
          ],
          summary: "La répétition fréquente d'une affirmation crée une familiarité cognitive que notre cerveau confond inconsciemment avec la vérité.",
          sections: [
            {
              title: "L'illusion de familiarité",
              body: "'J'ai vu passer cette phrase partout ce matin, ça doit être vrai'. C'est le piège de la viralité amplifiée par les réseaux.",
              example: "Une citation faussement attribuée à un auteur célèbre répétée des milliers de fois sur Instagram."
            }
          ],
          keyTakeaways: [
            "La popularité d'une rumeur ne constitue en aucun cas une preuve de sa véracité.",
            "Méfiez-vous des slogans simplistes répétés en boucle."
          ],
          proTip: "Quand tout le monde s'indigne de la même chose simultanément, cherchez la version brute non coupée de l'événement."
        }
      },
      {
        id: '4.3',
        title: "L'esprit critique au quotidien : s'entraîner à douter sagement",
        duration: '11 min',
        content: {
          objectives: [
            "Adopter la posture de la suspension de jugement",
            "Savoir dire 'Je ne sais pas encore, j'attends d'avoir les preuves'"
          ],
          summary: "Avoir de l'esprit critique n'est pas être négatif : c'est accepter l'incertitude temporaire le temps que l'enquête aboutisse.",
          sections: [
            {
              title: "Le courage de suspendre son jugement",
              body: "Face à une actualité brûlante et confuse, la position la plus sage est souvent : 'Il est trop tôt pour conclure, les éléments probants manquent'.",
              example: "Lors d'un accident industriel, attendre le rapport technique des experts plutôt que d'accuser immédiatement un complot."
            }
          ],
          keyTakeaways: [
            "Dire 'Je ne sais pas' est une preuve de maturité intellectuelle.",
            "L'urgence médiatique est souvent l'ennemie de la vérité."
          ],
          proTip: "Accordez-vous 24 heures de recul sur les sujets polémiques majeurs avant de vous faire un avis définitif."
        }
      }
    ]
  },
  {
    id: 5,
    title: "Images & vidéos : que vérifier ?",
    description: "Recherche inversée d'images, analyse des métadonnées EXIF, ombres, reflets et vidéos tronquées.",
    level: 'Intermédiaire',
    status: 'locked',
    icon: 'Image',
    category: 'Vérification',
    duration: '35 min',
    lessons: [
      {
        id: '5.1',
        title: "Analyse visuelle réflexe : ombres, perspectives et météo",
        duration: '10 min',
        content: {
          objectives: [
            "Repérer les anomalies physiques dans un cliché truqué",
            "Analyser la cohérence de l'éclairage et des ombres"
          ],
          summary: "Même les trucages soignés laissent des traces : ombres inversées, reflets incohérents dans les yeux ou météo incompatible avec la date annoncée.",
          sections: [
            {
              title: "Les indices physiques invisibles au premier coup d'œil",
              body: "Observez la direction du soleil sur les visages vs sur les bâtiments en arrière-plan. Vérifiez les plaques d'immatriculation et les panneaux de signalisation.",
              example: "Une photo présentée comme prise en hiver à Paris montre des arbres avec un feuillage d'été verdoyant."
            }
          ],
          keyTakeaways: [
            "Zoomez toujours sur les détails d'arrière-plan (panneaux, textes, saisons).",
            "Vérifiez l'éclairage naturel."
          ],
          proTip: "L'outil TRAUNES AI Image Forensics analyse l'erreur de niveau de compression (ELA) pour mettre en évidence les retouches Photoshop.",
          quiz: [
            {
              id: 'q5.1',
              question: "Si une photo prise prétendument à midi montre des ombres extrêmement étirées, que pouvez-vous déduire ?",
              options: [
                "C'est parfaitement normal.",
                "La photo a probablement été prise tôt le matin ou en fin d'après-midi (ou le soleil a été déplacé).",
                "L'appareil photo était mal réglé.",
                "C'est une preuve de présence de satellites."
              ],
              correctIndex: 1,
              explanation: "À midi solaire, les ombres sont très courtes. Des ombres très allongées prouvent que l'heure annoncée est fausse."
            }
          ]
        }
      },
      {
        id: '5.2',
        title: "La recherche inversée d'images (Reverse Image Search)",
        duration: '12 min',
        content: {
          objectives: [
            "Utiliser Google Images, TinEye et Yandex pour retrouver l'origine d'un cliché",
            "Identifier la date de première publication sur le web"
          ],
          summary: "La recherche inversée permet de soumettre une image à un moteur pour retrouver toutes les pages web où elle est apparue par le passé.",
          sections: [
            {
              title: "Procédure pas à pas",
              body: "1. Enregistrez l'image suspecte.\n2. Rendez-vous sur un moteur de recherche inversée.\n3. Glissez-déposez le fichier.\n4. Filtrez par date d'apparition la plus ancienne.",
              example: "Une image de manifestation violente attribuée à hier est retrouvée sur TinEye dans un article de 2012."
            }
          ],
          keyTakeaways: [
            "La recherche inversée débusque 80% des fausses images en quelques secondes.",
            "Pensez à recadrer l'image sur un élément spécifique si la recherche globale échoue."
          ],
          proTip: "Enregistrez le module de recherche d'image TRAUNES AI directement dans vos raccourcis Chrome/Safari pour analyser en un clic."
        }
      },
      {
        id: '5.3',
        title: "Vidéos décontextualisées et montages trompeurs",
        duration: '13 min',
        content: {
          objectives: [
            "Découper une vidéo en vignettes clés (keyframes) pour recherche inversée",
            "Déceler les coupes au montage qui déforment le sens des propos"
          ],
          summary: "Une vidéo réelle mais coupée à un moment stratégique peut faire dire le contraire exact d'une déclaration complète.",
          sections: [
            {
              title: "Le piège de la phrase tronquée",
              body: "Exemple : 'Si on écoute les rumeurs, certains pensent que la Terre est plate' coupé pour ne garder que 'la Terre est plate'.",
              example: "Un discours politique de 20 minutes réduit à 5 secondes hors contexte."
            }
          ],
          keyTakeaways: [
            "Exigez toujours de visionner l'intégralité du discours brut.",
            "Utilisez InVID WeVerify pour extraire les images clés des vidéos TikTok/YouTube."
          ],
          proTip: "Cherchez la retranscription écrite intégrale du discours."
        }
      }
    ]
  },
  {
    id: 6,
    title: "Désinformation & théories du complot",
    description: "Comprendre les ressorts psychologiques, la rhétorique complotiste et savoir dialoguer sans polariser.",
    level: 'Avancé',
    status: 'locked',
    icon: 'AlertTriangle',
    category: 'Société & Médias',
    duration: '40 min',
    lessons: [
      {
        id: '6.1',
        title: "La mécanique des théories du complot",
        duration: '14 min',
        content: {
          objectives: [
            "Identifier les schémas récurrents : 'À qui profite le crime ?', bouc émissaire, coïncidences surinterprétées",
            "Comprendre pourquoi ces théories séduisent en période de crise"
          ],
          summary: "Les récits complotistes apportent des explications simples et intentionnelles à des événements complexes ou chaotiques.",
          sections: [
            {
              title: "Les 4 symptômes d'un récit complotiste",
              body: "1. Rien n'arrive par hasard.\n2. Les apparences sont trompeuses.\n3. Tout est lié.\n4. Le monde est divisé entre 'gentils éveillés' et 'méchants puissants'.",
              example: "Expliquer un accident tragique imprévisible par une conspiration secrète d'élites mondiales."
            }
          ],
          keyTakeaways: [
            "Le rasoir d'Ockham : l'explication la plus simple comportant le moins d'hypothèses est généralement la plus probable.",
            "Ne pas confondre vraie conspiration historique documentée et théorie complotiste infalsifiable."
          ],
          proTip: "Si une théorie ne peut jamais être infirmée car 'toutes les preuves contraires sont fabriquées par le complot', elle sort du champ de la science rationnelle.",
          quiz: [
            {
              id: 'q6.1',
              question: "Quelle est la caractéristique majeure d'une théorie complotiste irrationnelle ?",
              options: [
                "Elle s'appuie sur des documents officiels vérifiés.",
                "Elle est infalsifiable : toute preuve qui la contredit est interprétée comme une preuve supplémentaire du complot.",
                "Elle est publiée dans des revues médicales à comité de lecture.",
                "Elle ne s'intéresse jamais à la politique."
              ],
              correctIndex: 1,
              explanation: "Le piège de la théorie complotiste est son infalsifiabilité : si vous apportez un démenti, l'interlocuteur affirme que vous faites partie du complot."
            }
          ]
        }
      },
      {
        id: '6.2',
        title: "Mécanismes de propagation virale et fermes de trolls",
        duration: '13 min',
        content: {
          objectives: [
            "Comprendre l'ingénierie sociale et la manipulation géopolitique",
            "Identifier la création de controverses artificielles (Astroturfing)"
          ],
          summary: "Certaines campagnes de désinformation sont financées et orchestrées par des groupes d'intérêt ou états pour diviser la société.",
          sections: [
            {
              title: "L'Astroturfing : simuler un mouvement populaire",
              body: "Des réseaux de comptes automatiques publient simultanément le même hashtag pour faire croire à une révolte citoyenne massive.",
              example: "10 000 tweets générés en une heure par un réseau de comptes basés à l'étranger."
            }
          ],
          keyTakeaways: [
            "Un sujet en 'Tendances' n'est pas forcément soutenu par de vraies personnes.",
            "Gardez de la distance face aux hystéries collectives numériques."
          ],
          proTip: "L'analyse de réseau TRAUNES AI permet d'identifier les grappes de comptes synchronisés."
        }
      },
      {
        id: '6.3',
        title: "Répondre à un proche désinformé sans rompre le dialogue",
        duration: '13 min',
        content: {
          objectives: [
            "Utiliser la méthode socratique d'écoute active",
            "Éviter le piège de la confrontation agressive qui renforce le rejet"
          ],
          summary: "Braquer ou humilier une personne ne la fait jamais changer d'avis. Questionner gentiment la méthodologie de ses sources est bien plus efficace.",
          sections: [
            {
              title: "La méthode du 'Oui, et si on regardait ensemble ?'",
              body: "Proposez de vérifier la source d'origine côte à côte plutôt que de déclarer 'C'est faux et tu es crédule'.",
              example: "'C'est intéressant ce que tu dis. Viens, on regarde sur le site officiel ce qu'ils répondent précisément'."
            }
          ],
          keyTakeaways: [
            "Privilégiez la bienveillance et la curiosité partagée.",
            "Attaquez les arguments, jamais la personne."
          ],
          proTip: "Consultez le guide TRAUNES AI 'Médiation familiale et désinformation' dans l'onglet ressources."
        }
      }
    ]
  },
  {
    id: 7,
    title: "IA générative et deepfakes",
    description: "Reconnaître les images Midjourney/DALL-E, les clones vocaux et les synthèses vidéo avec les outils TRAUNES AI.",
    level: 'Avancé',
    status: 'locked',
    icon: 'Cpu',
    category: 'IA & Numérique',
    duration: '45 min',
    lessons: [
      {
        id: '7.1',
        title: "Comment fonctionnent les modèles d'IA générative",
        duration: '15 min',
        content: {
          objectives: [
            "Comprendre la prédiction statistique de pixels et de mots",
            "Démystifier le fonctionnement des réseaux de neurones (GANs et Diffusion)"
          ],
          summary: "Une IA ne 'pense' pas et ne possède pas de conscience : elle prédit la suite statistique la plus probable à partir de milliards d'exemples d'apprentissage.",
          sections: [
            {
              title: "Du Prompt au Visuel",
              body: "Les modèles de diffusion ajoutent puis retirent du bruit numérique pour reconstituer une image correspondant au texte demandé.",
              example: "Générer une fausse photo d'un dirigeant en doudoune rose qui devient virale en quelques heures."
            }
          ],
          keyTakeaways: [
            "L'IA est un outil ultra-puissant d'imitation, pas un témoin de la réalité.",
            "Une image photoréaliste peut être créée en 3 secondes sans aucune prise de vue réelle."
          ],
          proTip: "Demandez-vous toujours si l'événement représenté a laissé d'autres traces (autres angles de vue de la foule, journalistes sur place).",
          quiz: [
            {
              id: 'q7.1',
              question: "Quelle est la caractéristique fondamentale d'une image générée par une IA de diffusion ?",
              options: [
                "Elle contient une signature invisible obligatoire gravée dans la lentille de l'appareil.",
                "C'est une Recomposition statistique de motifs appris sans appareil photo ni capteur optique.",
                "Elle est forcément de mauvaise qualité et floue.",
                "Elle ne peut représenter que des dessins animés."
              ],
              correctIndex: 1,
              explanation: "L'IA de diffusion génère l'image à partir de calculs statistiques et d'apprentissage préalable, sans prise de vue réelle."
            }
          ]
        }
      },
      {
        id: '7.2',
        title: "Indices visuels et auditifs pour repérer les faux par IA",
        duration: '15 min',
        content: {
          objectives: [
            "Déceler les artéfacts typiques : mains à 6 doigts, écritures charabia, textures de peau trop lisses, arrière-plans incohérents",
            "Détecter les clones vocaux (intonations plates, absences de bruits de respiration)"
          ],
          summary: "Malgré leurs progrès fulgurants, les IA commettent encore des erreurs logiques sur la physique des objets, la symétrie du corps et le rendu du texte.",
          sections: [
            {
              title: "La checklist visuelle anti-IA",
              body: "1. Regardez les mains et doigts.\n2. Observez les écritures sur les affiches en fond (souvent des caractères incompréhensibles).\n3. Examinez les bijoux, boucles d'oreilles (souvent asymétriques).\n4. Vérifiez les reflets dans les prunelles des yeux.",
              example: "Une fausse photo de foule où les visages au second plan ont des formes fondues désordonnées."
            }
          ],
          keyTakeaways: [
            "Zoomez à 200% sur les détails secondaires.",
            "Écoutez la fréquence des respirations sur les enregistrements audio."
          ],
          proTip: "Passez l'image dans l'analyseur C2PA de TRAUNES AI pour vérifier si les métadonnées de provenance d'appareil photo sont authentiques."
        }
      },
      {
        id: '7.3',
        title: "Réglementation, Watermarking & C2PA",
        duration: '15 min',
        content: {
          objectives: [
            "Comprendre le tatouage numérique (Watermarking) et le standard C2PA",
            "Découvrir la réglementation européenne AI Act"
          ],
          summary: "Les nouvelles normes internationales obligent les générateurs d'IA à intégrer des filigranes cryptographiques invisibles attestant de leur origine synthétique.",
          sections: [
            {
              title: "Le standard C2PA (Coalition for Content Provenance and Authenticity)",
              body: "Un 'passeport numérique' directement intégré dans les fichiers d'image ou vidéo qui conserve l'historique des modifications depuis la prise de vue.",
              example: "Inspecter un fichier avec TRAUNES AI pour lire son journal de modifications irréfutable."
            }
          ],
          keyTakeaways: [
            "Le tatouage numérique permettra bientôt de distinguer instantanément le réel de la synthèse.",
            "L'AI Act européen rend obligatoire le marquage des contenus générés."
          ],
          proTip: "Cherchez l'icône de provenance C2PA 'CR' sur les images certifiées."
        }
      }
    ]
  },
  {
    id: 8,
    title: "Réseaux sociaux & algorithmes d'attention",
    description: "Comprendre les bulles de filtres, la captation d'attention et réenclencher une alimentation informationnelle équilibrée.",
    level: 'Avancé',
    status: 'locked',
    icon: 'Share2',
    category: 'Société & Médias',
    duration: '30 min',
    lessons: [
      {
        id: '8.1',
        title: "Le modèle économique de l'économie de l'attention",
        duration: '10 min',
        content: {
          objectives: [
            "Comprendre pourquoi les contenus indignants ou spectaculaires sont favorisés par les algorithmes",
            "Reprendre conscience du temps d'écran"
          ],
          summary: "Pour les plateformes gratuites, le produit c'est votre temps d'attention. L'émotion forte (colère, peur) est le meilleur moyen de vous faire rester en ligne.",
          sections: [
            {
              title: "Pourquoi l'outrage fait des clics",
              body: "Les algorithmes de recommandation mesurent le temps de visionnage et les réactions. Les contenus polémiques génèrent 5 fois plus d'engagements que les analyses posées.",
              example: "Un titre sensationnaliste 'Scandale absolu !' recommandé en priorité par rapport à un rapport budgétaire détaillé."
            }
          ],
          keyTakeaways: [
            "Votre attention est une ressource précieuse.",
            "Ne laissez pas les algorithmes décider seuls de ce que vous lisez."
          ],
          proTip: "Désactivez la lecture automatique (autoplay) sur YouTube, TikTok et X."
        }
      },
      {
        id: '8.2',
        title: "Bulles de filtres et polarisation sociale",
        duration: '10 min',
        content: {
          objectives: [
            "Comprendre l'enfermerment algorithmique (chambre d'écho)",
            "Découvrir comment casser sa bulle pour élargir ses horizons"
          ],
          summary: "À force de ne vous montrer que ce qui vous plaît ou fait réagir, la plateforme vous enferme dans un miroir déformant de la société.",
          sections: [
            {
              title: "L'effet 'Chambre d'écho'",
              body: "Dans une chambre d'écho, toutes les voix répètent la même opinion. On finit par croire que le monde entier pense de la même façon.",
              example: "Un utilisateur qui ne voit que des vidéos catastrophistes finit par être convaincu que l'effondrement est prévu pour demain."
            }
          ],
          keyTakeaways: [
            "Abonnez-vous intentionnellement à des médias indépendants de sensibilités diverses.",
            "Nettoyez régulièrement votre historique de recommandations."
          ],
          proTip: "Créez des listes thématiques personnalisées sur vos applications au lieu de subir le flux 'Pour vous'."
        }
      },
      {
        id: '8.3',
        title: "Régime d'hygiène numérique et diète d'information",
        duration: '10 min',
        content: {
          objectives: [
            "Créer son tableau de bord d'actualités sain et équilibré",
            "Mettre en place des temps de déconnexion réguliers"
          ],
          summary: "Comme pour l'alimentation physique, la qualité de votre nourriture intellectuelle détermine la clarté de votre pensée.",
          sections: [
            {
              title: "Construire un 'menu informationnel' équilibré",
              body: "Incorporez des revues mensuelles spécialisées, des livres de fond, des podcasts d'investigation et réduisez le grignotage de fils d'actualités continus.",
              example: "Consacrer 30 minutes concentrées par jour à la lecture de grands articles plutôt que de consulter son téléphone 80 fois par jour."
            }
          ],
          keyTakeaways: [
            "Privilégiez la profondeur sur l'instantanéité.",
            "L'information de qualité se savoure sereinement."
          ],
          proTip: "Utilisez les flux RSS ou la newsletter TRAUNES AI Hebdo pour recevoir une synthèse vérifiée directement dans votre boîte mail."
        }
      }
    ]
  }
];

export const ACADEMY_CONTINUE_LEARNING = [
  { id: '3.3', title: "Croiser les informations & la concordance des preuves", duration: '15 min', progress: 50, done: false, moduleId: 3 },
  { id: '4.1', title: "Le biais de confirmation : notre pire ennemi", duration: '12 min', progress: 0, done: false, moduleId: 4 },
  { id: '5.1', title: "Analyse visuelle réflexe : ombres, perspectives et météo", duration: '10 min', progress: 0, done: false, moduleId: 5 },
];

export const ACADEMY_RESOURCES = [
  { title: 'Guide pratique de vérification TRAUNES AI', meta: 'PDF · 2.4 Mo', type: 'pdf' },
  { title: 'Checklist avant de partager', meta: 'PDF · 1.1 Mo', type: 'pdf' },
  { title: 'Outils de recherche inversée', meta: 'Guide interactif', type: 'link' },
  { title: 'Les 7 questions à se poser', meta: 'Vidéo · 4min 32s', type: 'video' },
  { title: 'Chartes & Déontologie journalistique', meta: 'Document officiel', type: 'pdf' },
];

export function getAcademyModuleById(id: number): AcademyModule | undefined {
  return ACADEMY_MODULES.find((m) => m.id === id);
}

export function filterAcademyModules(
  modulesList: AcademyModule[],
  categoryFilter: string,
  levelFilter: string = 'Tous les niveaux',
  searchQuery: string = ''
): AcademyModule[] {
  return modulesList.filter((m) => {
    // Category match
    const matchCategory =
      categoryFilter === 'Tous les modules'
        ? true
        : categoryFilter === 'Mon parcours'
        ? m.status !== 'locked'
        : m.category === categoryFilter;

    // Level match
    const matchLevel =
      levelFilter === 'Tous les niveaux' ? true : m.level === levelFilter;

    // Search query match
    const matchSearch =
      searchQuery.trim() === ''
        ? true
        : m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchLevel && matchSearch;
  });
}
