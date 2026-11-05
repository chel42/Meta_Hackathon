import React, { createContext, useContext, useState, useEffect } from 'react';
import { VerificationReport, VerificationRun, RunStep, ClaimItem } from '../types';
import { MOCK_REPORTS } from '../mocks/mockData';
import { safeStorage } from '../utils/storage';

interface TraunesAIDataContextType {
  reports: VerificationReport[];
  activeRuns: Record<string, VerificationRun>;
  startVerification: (
    inputContent: string,
    inputType?: 'text' | 'url' | 'image',
    depth?: 'standard' | 'deep' | 'rapid',
    language?: string,
    mediaFile?: { name: string; size: string }
  ) => string;
  getReport: (id: string) => VerificationReport | undefined;
  getRun: (id: string) => VerificationRun | undefined;
  deleteReport: (id: string) => void;
  resetToDefaultReports: () => void;
}

const TraunesAIDataContext = createContext<TraunesAIDataContextType | undefined>(undefined);

const STORAGE_KEY_REPORTS = 'traunesai_reports_store';

const INITIAL_STEPS: RunStep[] = [
  { id: 1, label: 'Analyse syntaxique & contextualisation', description: 'Découpage du texte, détection de la langue et normalisation', status: 'waiting' },
  { id: 2, label: 'Extraction des affirmations (claims.extracted)', description: 'Identification des faits vérifiables et élimination des opinions', status: 'waiting' },
  { id: 3, label: 'Recherche multi-sources (source.found)', description: 'Interrogation des registres officiels, revues à comité de lecture et bases ouvertes', status: 'waiting' },
  { id: 4, label: 'Évaluation contradictoire (evidence.analyzed)', description: 'Confrontation des éléments favorables et contradictoires', status: 'waiting' },
  { id: 5, label: 'Pondération des verdicts (claim.verdict)', description: 'Attribution motivée : Confirmée, Contredite ou Non vérifiable', status: 'waiting' },
  { id: 6, label: 'Consolidation de la Preuve TRAUNES AI (report.ready)', description: 'Génération du dossier probatoire, limites et traçabilité', status: 'waiting' },
];

export const TraunesAIDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<VerificationReport[]>([]);
  const [activeRuns, setActiveRuns] = useState<Record<string, VerificationRun>>({});

  useEffect(() => {
    try {
      const stored = safeStorage.getItem(STORAGE_KEY_REPORTS);
      if (stored) {
        setReports(JSON.parse(stored));
      } else {
        setReports(MOCK_REPORTS);
        safeStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(MOCK_REPORTS));
      }
    } catch {
      setReports(MOCK_REPORTS);
    }
  }, []);

  const saveReports = (newReports: VerificationReport[]) => {
    setReports(newReports);
    safeStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(newReports));
  };

  const getReport = (id: string): VerificationReport | undefined => {
    return reports.find((r) => r.id === id);
  };

  const getRun = (id: string): VerificationRun | undefined => {
    return activeRuns[id];
  };

  const deleteReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    saveReports(updated);
  };

  const resetToDefaultReports = () => {
    saveReports(MOCK_REPORTS);
  };

  const startVerification = (
    inputContent: string,
    inputType: 'text' | 'url' | 'image' = 'text',
    depth: 'standard' | 'deep' | 'rapid' = 'standard',
    language: string = 'Français',
    mediaFile?: { name: string; size: string }
  ): string => {
    const runId = `run-${Date.now()}`;
    const reportId = `rep-${Date.now()}`;

    // Clean excerpt for title
    const shortTitle =
      inputType === 'url'
        ? inputContent.replace(/^https?:\/\//, '').slice(0, 48)
        : inputContent.replace(/^[«"'\s]+/, '').slice(0, 60) + (inputContent.length > 60 ? '...' : '');

    const newRun: VerificationRun = {
      id: runId,
      inputType,
      inputContent,
      status: 'running',
      currentStep: 1,
      steps: INITIAL_STEPS.map((s, idx) => (idx === 0 ? { ...s, status: 'in_progress' } : { ...s })),
      discoveredClaims: [],
      sourcesFoundCount: 0,
      reportId,
    };

    setActiveRuns((prev) => ({ ...prev, [runId]: newRun }));

    // Simulate the realistic stepped pipeline
    const stepDuration = depth === 'rapid' ? 900 : depth === 'deep' ? 2200 : 1500;

    // Step 1: Contextualisation complete -> Move to Step 2
    setTimeout(() => {
      setActiveRuns((prev) => {
        const current = prev[runId];
        if (!current) return prev;
        const updatedSteps = current.steps.map((s) =>
          s.id === 1 ? { ...s, status: 'completed' as const, durationMs: stepDuration } : s.id === 2 ? { ...s, status: 'in_progress' as const } : s
        );
        return {
          ...prev,
          [runId]: {
            ...current,
            currentStep: 2,
            steps: updatedSteps,
          },
        };
      });
    }, stepDuration);

    // Step 2: Extraction completed -> Claims discovered -> Move to Step 3
    setTimeout(() => {
      setActiveRuns((prev) => {
        const current = prev[runId];
        if (!current) return prev;

        const simulatedClaims = [
          `Affirmation 1 : « ${inputContent.slice(0, 50)}... » est présentée comme un fait avéré.`,
          `Affirmation 2 : Les données chiffrées citées émanent prétendument d'une institution reconnue.`,
        ];

        const updatedSteps = current.steps.map((s) =>
          s.id === 2 ? { ...s, status: 'completed' as const, durationMs: stepDuration } : s.id === 3 ? { ...s, status: 'in_progress' as const } : s
        );
        return {
          ...prev,
          [runId]: {
            ...current,
            currentStep: 3,
            steps: updatedSteps,
            discoveredClaims: simulatedClaims,
            sourcesFoundCount: 4,
          },
        };
      });
    }, stepDuration * 2);

    // Step 3: Sources found count increases -> Move to Step 4
    setTimeout(() => {
      setActiveRuns((prev) => {
        const current = prev[runId];
        if (!current) return prev;
        const updatedSteps = current.steps.map((s) =>
          s.id === 3 ? { ...s, status: 'completed' as const, durationMs: stepDuration } : s.id === 4 ? { ...s, status: 'in_progress' as const } : s
        );
        return {
          ...prev,
          [runId]: {
            ...current,
            currentStep: 4,
            steps: updatedSteps,
            sourcesFoundCount: 12,
          },
        };
      });
    }, stepDuration * 3);

    // Step 4: Contradictory evaluation -> Move to Step 5
    setTimeout(() => {
      setActiveRuns((prev) => {
        const current = prev[runId];
        if (!current) return prev;
        const updatedSteps = current.steps.map((s) =>
          s.id === 4 ? { ...s, status: 'completed' as const, durationMs: stepDuration } : s.id === 5 ? { ...s, status: 'in_progress' as const } : s
        );
        return {
          ...prev,
          [runId]: {
            ...current,
            currentStep: 5,
            steps: updatedSteps,
            sourcesFoundCount: 16,
          },
        };
      });
    }, stepDuration * 4);

    // Step 5: Verdicts computed -> Move to Step 6
    setTimeout(() => {
      setActiveRuns((prev) => {
        const current = prev[runId];
        if (!current) return prev;
        const updatedSteps = current.steps.map((s) =>
          s.id === 5 ? { ...s, status: 'completed' as const, durationMs: stepDuration } : s.id === 6 ? { ...s, status: 'in_progress' as const } : s
        );
        return {
          ...prev,
          [runId]: {
            ...current,
            currentStep: 6,
            steps: updatedSteps,
          },
        };
      });
    }, stepDuration * 5);

    // Step 6: Ready! Create and store the definitive Verification Report
    setTimeout(() => {
      // Build full report
      const newReport: VerificationReport = {
        id: reportId,
        title: shortTitle || 'Dossier de vérification TRAUNES AI',
        inputType,
        inputContent,
        createdAt: new Date(Date.now() - 10000).toISOString(),
        completedAt: new Date().toISOString(),
        language: language || 'Français',
        claimsCount: 2,
        confirmedCount: 0,
        contradictedCount: 1,
        unverifiableCount: 1,
        generalLimitations: [
          'Les éléments réunis reflètent l’état des sources ouvertes accessibles au moment de la requête.',
          'Cette analyse ne préjuge pas de publications ou d’études scientifiques ultérieures en cours de révision.',
          'Les déclarations d’acteurs tiers non étayées par des données vérifiables ont été catégorisées comme non vérifiables.',
        ],
        criticalAdvice:
          'Avant de partager, assurez-vous de consulter les documents primaires cités plutôt que les interprétations publiées sur les réseaux sociaux.',
        traceability: {
          engineVersion: 'TRAUNES AI Core 2.4.1-rc',
          modelChecked: 'Multi-Agent Cross-Check Pipeline',
          timestampUtc: new Date().toISOString(),
          queriesExecuted: 26,
          sourcesConsulted: 16,
          auditHash: `sha256-${Math.random().toString(36).substring(2)}${Date.now()}`,
        },
        mediaAnalysis:
          inputType === 'image' || mediaFile
            ? {
                type: 'image',
                fileName: mediaFile?.name || 'capture_verif.png',
                fileSize: mediaFile?.size || '1.4 Mo',
                evaluationNote: 'Provenance non évaluée',
                findings: [
                  'Aucune trace d’artefact de génération synthétique par modèle de diffusion n’a pu être attestée avec certitude.',
                  'La résolution et la compression d’image indiquent des recompressions multiples typiques de republications sur messageries privées.',
                ],
                manipulationDetected: false,
              }
            : undefined,
        claims: [
          {
            id: `cl-${reportId}-1`,
            claimText: `L'allégation principale formulée dans le contenu soumis affirme une rupture statistique anormale.`,
            verdict: 'contradicted',
            verdictLabel: 'Contredite par les éléments disponibles',
            justification:
              'Le recoupement des données publiques et des rapports d’instituts de recherche indépendants contredit l’ampleur du phénomène allégué.',
            supportingEvidence: [
              'Certains observateurs locaux ont signalé des variations à court terme.',
            ],
            refutingEvidence: [
              'Les relevés méthodologiques officiels publiés réfutent toute anomalie généralisée.',
              'Les registres statistiques contradictoires n’observent aucune corrélation avec l’assertion.',
            ],
            limitations: [
              'Les données du dernier mois civil restent soumises à consolidation statistique officielle.',
            ],
            sources: [
              {
                id: `src-${reportId}-1`,
                name: 'Observatoire des données publiques ouvertes',
                publisher: 'Portail National de Référence',
                url: 'https://data.gouv.fr',
                publishedDate: '2026',
                reliability: 'high',
                status: 'confirmed',
                excerpt: 'Les séries temporelles agrégées démentent l’effondrement allégué.',
              },
              {
                id: `src-${reportId}-2`,
                name: 'Article d’opinion non corroboré',
                publisher: 'Plateforme contributive ouverte',
                url: 'https://exemple-forum-ouvert.org/opinion',
                publishedDate: '2026',
                reliability: 'unverified',
                status: 'not_confirmed',
                excerpt: 'Texte d’opinion sans méthodologie statistique vérifiable.',
              },
            ],
          },
          {
            id: `cl-${reportId}-2`,
            claimText: `L'attribution causale directe à un facteur unique sans prise en compte des contextes connexes.`,
            verdict: 'unverifiable',
            verdictLabel: 'Non vérifiable',
            justification:
              'L’état actuel de la documentation disponible ne permet ni de prouver ni d’infirmer une relation de cause à effet directe.',
            supportingEvidence: [],
            refutingEvidence: [],
            limitations: [
              'Absence d’études longitudinales randomisées portant sur cet échantillon spécifique.',
            ],
            sources: [
              {
                id: `src-${reportId}-3`,
                name: 'Revue Méthodologique Critique',
                publisher: 'Centre de Recherche Analytique',
                url: 'https://recherche-analytique.org/revue',
                publishedDate: '2025',
                reliability: 'high',
                status: 'confirmed',
                excerpt: 'Les données disponibles présentent des incertitudes de mesure trop élevées.',
              },
            ],
          },
        ],
      };

      setReports((prevReports) => {
        const next = [newReport, ...prevReports];
        safeStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(next));
        return next;
      });

      setActiveRuns((prev) => {
        const current = prev[runId];
        if (!current) return prev;
        const updatedSteps = current.steps.map((s) => ({
          ...s,
          status: 'completed' as const,
          durationMs: stepDuration,
        }));
        return {
          ...prev,
          [runId]: {
            ...current,
            status: 'completed',
            currentStep: 6,
            steps: updatedSteps,
          },
        };
      });
    }, stepDuration * 6);

    return runId;
  };

  return (
    <TraunesAIDataContext.Provider
      value={{
        reports,
        activeRuns,
        startVerification,
        getReport,
        getRun,
        deleteReport,
        resetToDefaultReports,
      }}
    >
      {children}
    </TraunesAIDataContext.Provider>
  );
};

export const useTraunesAIData = () => {
  const context = useContext(TraunesAIDataContext);
  if (!context) {
    throw new Error('useTraunesAIData must be used within a TraunesAIDataProvider');
  }
  return context;
};
