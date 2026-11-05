import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppShell } from '../../src/components/layout/AppShell';
import { ClaimCard } from '../../src/components/verification/ClaimCard';
import { VerdictBadge } from '../../src/components/verification/VerdictBadge';
import { LimitsPanel } from '../../src/components/verification/LimitsPanel';
import { AdviceCallout } from '../../src/components/verification/AdviceCallout';
import { ErrorState } from '../../src/components/common/ErrorState';
import { THEME } from '../../src/theme/colors';
import {
  IconChevronLeft,
  IconShare,
  IconDownload,
  IconCopy,
  IconShield,
  IconFileText,
  IconChevronDown,
  IconChevronRight,
  IconCheck,
  IconAlertTriangle,
  IconImage,
} from '../../src/icons/Icons';
import { useTraunesAIData } from '../../src/context/TraunesAIDataContext';
import { useNotifications } from '../../src/context/NotificationContext';

export default function ReportScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const router = useRouter();
  const { getReport, reports } = useTraunesAIData();
  const { addNotification } = useNotifications();

  const [copiedLink, setCopiedLink] = useState(false);
  const [traceabilityOpen, setTraceabilityOpen] = useState(false);
  const [fullInputExpanded, setFullInputExpanded] = useState(false);

  const report = reportId ? getReport(reportId) : reports[0];

  if (!report) {
    return (
      <AppShell>
        <ErrorState
          title="Dossier de preuve introuvable"
          message={`Le rapport "${reportId}" n’existe pas dans les archives de cette session.`}
          retryLabel="Retourner à l’historique"
          onRetry={() => router.push('/historique')}
        />
      </AppShell>
    );
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopiedLink(true);
    addNotification({
      title: 'Lien de la Preuve copié',
      message: `Le lien public vers « ${report.title} » est prêt à être partagé.`,
      type: 'system',
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
    addNotification({
      title: 'Export du dossier probatoire',
      message: 'Le dossier TRAUNES AI a été transmis à la boîte d’impression / PDF.',
      type: 'system',
    });
  };

  return (
    <AppShell>
      <View style={styles.container}>
        {/* Navigation Bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.push('/dashboard')} style={styles.backButton}>
            <IconChevronLeft size={16} color={THEME.colors.primary} />
            <Text style={styles.backButtonText}>Retour au tableau de bord</Text>
          </Pressable>

          <View style={styles.actionButtonsRow}>
            <Pressable
              onPress={handleCopyLink}
              style={({ hovered }: any) => [
                styles.actionBtn,
                hovered && styles.actionBtnHovered,
              ]}
              accessibilityLabel="Copier le lien"
            >
              {copiedLink ? (
                <>
                  <IconCheck size={16} color="#15803D" />
                  <Text style={[styles.actionBtnText, { color: '#15803D' }]}>Copié !</Text>
                </>
              ) : (
                <>
                  <IconCopy size={16} color={THEME.colors.navy} />
                  <Text style={styles.actionBtnText}>Copier le lien</Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={handleExportPDF}
              style={({ hovered }: any) => [
                styles.actionBtn,
                styles.exportBtn,
                hovered && styles.exportBtnHovered,
              ]}
              accessibilityLabel="Exporter en PDF"
            >
              <IconDownload size={16} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>Exporter PDF</Text>
            </Pressable>
          </View>
        </View>

        {/* Dossier Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.officialBadge}>
              <IconShield size={16} color="#0F766E" />
              <Text style={styles.officialBadgeText}>DOSSIER DE PREUVE OFFICIEL TRAUNES AI</Text>
            </View>
            <Text style={styles.refCode}>Réf : {report.id}</Text>
          </View>

          <Text style={styles.reportTitle}>{report.title}</Text>

          {/* Examined content excerpt */}
          <View style={styles.inputContentBox}>
            <View style={styles.inputContentHeader}>
              <Text style={styles.inputContentLabel}>Contenu soumis à instruction :</Text>
              <Pressable onPress={() => setFullInputExpanded(!fullInputExpanded)}>
                <Text style={styles.expandInputText}>
                  {fullInputExpanded ? 'Réduire' : 'Afficher l’intégralité'}
                </Text>
              </Pressable>
            </View>
            <Text
              style={styles.inputContentText}
              numberOfLines={fullInputExpanded ? undefined : 3}
            >
              « {report.inputContent} »
            </Text>
          </View>

          {/* Meta timestamps and language */}
          <View style={styles.metaRow}>
            <Text style={styles.metaItem}>
              Examen clos le{' '}
              <Text style={styles.metaItemBold}>
                {new Date(report.completedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Text>
            <Text style={styles.metaItem}>• Langue : {report.language}</Text>
            <Text style={styles.metaItem}>• Format : {report.inputType.toUpperCase()}</Text>
          </View>
        </View>

        {/* Synthesis Banner (Synthèse chiffrée des affirmations) */}
        <View style={styles.synthesisCard}>
          <Text style={styles.synthesisHeader}>Synthèse des affirmations examinées</Text>
          <Text style={styles.synthesisSentence}>
            Ce dossier a isolé et instruit{' '}
            <Text style={styles.boldNavy}>
              {report.claimsCount} affirmation{report.claimsCount > 1 ? 's' : ''}
            </Text>{' '}
            distincte{report.claimsCount > 1 ? 's' : ''} :
          </Text>

          <View style={styles.synthesisPills}>
            <View style={styles.synthesisPillItem}>
              <VerdictBadge verdict="confirmed" variant="short" size="md" />
              <Text style={styles.synthesisPillCount}>
                : <Text style={styles.countNumber}>{report.confirmedCount}</Text>
              </Text>
            </View>

            <View style={styles.synthesisPillItem}>
              <VerdictBadge verdict="contradicted" variant="short" size="md" />
              <Text style={styles.synthesisPillCount}>
                : <Text style={styles.countNumber}>{report.contradictedCount}</Text>
              </Text>
            </View>

            <View style={styles.synthesisPillItem}>
              <VerdictBadge verdict="unverifiable" variant="short" size="md" />
              <Text style={styles.synthesisPillCount}>
                : <Text style={styles.countNumber}>{report.unverifiableCount}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Media Analysis Section (si analyse image / visuel) */}
        {report.mediaAnalysis && (
          <View style={styles.mediaCard}>
            <View style={styles.mediaHeaderRow}>
              <View style={styles.mediaIconBadge}>
                <IconImage size={18} color={THEME.colors.primary} />
                <Text style={styles.mediaTitle}>Analyse du document visuel</Text>
              </View>
              <View style={styles.evalNoteBadge}>
                <Text style={styles.evalNoteText}>{report.mediaAnalysis.evaluationNote}</Text>
              </View>
            </View>

            <Text style={styles.mediaFileInfo}>
              Fichier examiné : {report.mediaAnalysis.fileName} ({report.mediaAnalysis.fileSize})
            </Text>

            <View style={styles.mediaFindingsList}>
              {report.mediaAnalysis.findings.map((finding, idx) => (
                <View key={idx} style={styles.mediaFindingItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.mediaFindingText}>{finding}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Claims List (Une section complète par affirmation) */}
        <View style={styles.claimsContainer}>
          <Text style={styles.claimsHeading}>
            Instruction détaillée par affirmation ({report.claims.length})
          </Text>

          {report.claims.map((claim, index) => (
            <ClaimCard key={claim.id} claim={claim} index={index} />
          ))}
        </View>

        {/* General Limitations - ALWAYS VISIBLE */}
        <LimitsPanel limitations={report.generalLimitations} />

        {/* Critical Advice - Advice Callout */}
        <AdviceCallout advice={report.criticalAdvice} />

        {/* Traceability and Technical Audit - Collapsible */}
        <View style={styles.traceabilityCard}>
          <Pressable
            onPress={() => setTraceabilityOpen(!traceabilityOpen)}
            style={styles.traceabilityToggle}
          >
            <View style={styles.traceabilityToggleLeft}>
              <IconShield size={18} color={THEME.colors.navy} />
              <Text style={styles.traceabilityTitle}>
                Traçabilité technique & empreinte cryptographique
              </Text>
            </View>
            {traceabilityOpen ? (
              <IconChevronDown size={18} color={THEME.colors.textSecondary} />
            ) : (
              <IconChevronRight size={18} color={THEME.colors.textSecondary} />
            )}
          </Pressable>

          {traceabilityOpen && (
            <View style={styles.traceabilityDetails}>
              <View style={styles.traceabilityGrid}>
                <View style={styles.traceCol}>
                  <Text style={styles.traceLabel}>Version du moteur :</Text>
                  <Text style={styles.traceValue}>{report.traceability.engineVersion}</Text>
                </View>

                <View style={styles.traceCol}>
                  <Text style={styles.traceLabel}>Pipeline de recoupement :</Text>
                  <Text style={styles.traceValue}>{report.traceability.modelChecked}</Text>
                </View>

                <View style={styles.traceCol}>
                  <Text style={styles.traceLabel}>Horodatage UTC certifié :</Text>
                  <Text style={styles.traceValue}>{report.traceability.timestampUtc}</Text>
                </View>

                <View style={styles.traceCol}>
                  <Text style={styles.traceLabel}>Requêtes d’interrogation :</Text>
                  <Text style={styles.traceValue}>{report.traceability.queriesExecuted}</Text>
                </View>
              </View>

              <View style={styles.hashBox}>
                <Text style={styles.hashLabel}>Empreinte d’intégrité du rapport (SHA-256) :</Text>
                <Text style={styles.hashValue}>{report.traceability.auditHash}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: THEME.radii.md,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: THEME.radii.md,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  actionBtnHovered: {
    backgroundColor: '#F1F5F9',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.navy,
  },
  exportBtn: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  exportBtnHovered: {
    backgroundColor: THEME.colors.primaryDark,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Header Card
  headerCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.xl,
    padding: 24,
    ...THEME.shadows.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: THEME.radii.full,
  },
  officialBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.5,
  },
  refCode: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontFamily: 'monospace' as any,
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.navy,
    marginBottom: 14,
    lineHeight: 30,
  },
  inputContentBox: {
    backgroundColor: '#F8FAFC',
    borderColor: THEME.colors.border,
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.primary,
    padding: 14,
    borderRadius: THEME.radii.md,
    marginBottom: 14,
  },
  inputContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputContentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
  },
  expandInputText: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  inputContentText: {
    fontSize: 14,
    color: THEME.colors.text,
    fontStyle: 'italic',
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  metaItemBold: {
    fontWeight: '700',
    color: THEME.colors.navy,
  },

  // Synthesis Card
  synthesisCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.xl,
    padding: 20,
    ...THEME.shadows.sm,
  },
  synthesisHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  synthesisSentence: {
    fontSize: 15,
    color: THEME.colors.text,
    marginBottom: 14,
  },
  boldNavy: {
    fontWeight: '800',
    color: THEME.colors.navy,
  },
  synthesisPills: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  synthesisPillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  synthesisPillCount: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  countNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.navy,
  },

  // Media Card
  mediaCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.xl,
    padding: 20,
    ...THEME.shadows.sm,
  },
  mediaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaIconBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mediaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.navy,
  },
  evalNoteBadge: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radii.full,
  },
  evalNoteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  mediaFileInfo: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 10,
  },
  mediaFindingsList: {
    gap: 6,
  },
  mediaFindingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bullet: {
    fontSize: 14,
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  mediaFindingText: {
    fontSize: 13,
    color: THEME.colors.text,
    flex: 1,
    lineHeight: 19,
  },

  // Claims Container
  claimsContainer: {
    marginTop: 4,
  },
  claimsHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.navy,
    marginBottom: 16,
  },

  // Traceability Card
  traceabilityCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.xl,
    overflow: 'hidden',
    marginBottom: 20,
    ...THEME.shadows.sm,
  },
  traceabilityToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  traceabilityToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  traceabilityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.navy,
  },
  traceabilityDetails: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  traceabilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  traceCol: {
    flex: 1,
    minWidth: 200,
  },
  traceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  traceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.navy,
    marginTop: 2,
  },
  hashBox: {
    backgroundColor: '#FFFFFF',
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.md,
    padding: 10,
    marginTop: 6,
  },
  hashLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginBottom: 2,
  },
  hashValue: {
    fontSize: 11,
    fontFamily: 'monospace' as any,
    color: THEME.colors.navy,
  },
});
