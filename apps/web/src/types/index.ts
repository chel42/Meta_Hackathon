export type VerdictType = 'confirmed' | 'contradicted' | 'unverifiable';

export interface SourceItem {
  id: string;
  name: string;
  url: string;
  publisher: string;
  publishedDate: string;
  reliability: 'high' | 'medium' | 'unverified';
  status: 'confirmed' | 'not_confirmed' | 'unreachable';
  excerpt: string;
}

export interface ClaimItem {
  id: string;
  claimText: string;
  verdict: VerdictType;
  verdictLabel: string;
  justification: string;
  supportingEvidence: string[];
  refutingEvidence: string[];
  limitations: string[];
  sources: SourceItem[];
}

export interface MediaAnalysis {
  type: 'image' | 'video' | 'none';
  fileName?: string;
  fileSize?: string;
  evaluationNote: string; // e.g. "Provenance non évaluée"
  findings: string[];
  manipulationDetected: boolean;
}

export interface VerificationReport {
  id: string;
  title: string;
  inputType: 'text' | 'url' | 'image';
  inputContent: string;
  createdAt: string;
  completedAt: string;
  language: string;
  claimsCount: number;
  confirmedCount: number;
  contradictedCount: number;
  unverifiableCount: number;
  claims: ClaimItem[];
  mediaAnalysis?: MediaAnalysis;
  generalLimitations: string[];
  criticalAdvice: string;
  traceability: {
    engineVersion: string;
    modelChecked: string;
    timestampUtc: string;
    queriesExecuted: number;
    sourcesConsulted: number;
    auditHash: string;
  };
}

export type RunStepStatus = 'waiting' | 'in_progress' | 'completed' | 'failed';

export interface RunStep {
  id: number;
  label: string;
  description: string;
  status: RunStepStatus;
  durationMs?: number;
}

export interface VerificationRun {
  id: string;
  inputType: 'text' | 'url' | 'image';
  inputContent: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep: number;
  steps: RunStep[];
  discoveredClaims: string[];
  sourcesFoundCount: number;
  reportId?: string;
  errorMessage?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  organization?: string;
  role: string;
  bio?: string;
  joinedDate: string;
  stats: {
    totalChecks: number;
    claimsExamined: number;
    sourcesConsulted: number;
    reportsExported: number;
  };
  preferences: {
    language: 'fr' | 'en' | 'es';
    theme: 'light' | 'system';
    highContrast: boolean;
    reducedMotion: boolean;
    defaultSearchDepth: 'standard' | 'deep' | 'rapid';
    notificationsEmail: boolean;
    notificationsInApp: boolean;
    alertMajorDisinfo: boolean;
    historyRetentionDays: number;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'run_completed' | 'security' | 'system' | 'disinfo_alert';
  link?: string;
}
