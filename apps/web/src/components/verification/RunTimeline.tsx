import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { VerificationRun } from '../../types';
import { THEME } from '../../theme/colors';
import { IconCheck, IconAlertCircle, IconShield, IconSearch, IconChevronRight } from '../../icons/Icons';

interface RunTimelineProps {
  run: VerificationRun;
  onViewReport: (reportId: string) => void;
  onRetry?: () => void;
}

export const RunTimeline: React.FC<RunTimelineProps> = ({ run, onViewReport, onRetry }) => {
  return (
    <View style={styles.container}>
      {/* Status Banner */}
      <View
        style={[
          styles.banner,
          run.status === 'completed'
            ? styles.bannerCompleted
            : run.status === 'failed'
            ? styles.bannerFailed
            : styles.bannerRunning,
        ]}
      >
        <View style={styles.bannerIcon}>
          {run.status === 'completed' ? (
            <IconCheck size={22} color="#15803D" />
          ) : run.status === 'failed' ? (
            <IconAlertCircle size={22} color="#B91C1C" />
          ) : (
            <ActivityIndicator size="small" color={THEME.colors.primary} />
          )}
        </View>

        <View style={styles.bannerInfo}>
          <Text style={styles.bannerTitle}>
            {run.status === 'completed'
              ? 'Dossier de preuve TRAUNES AI consolidé'
              : run.status === 'failed'
              ? 'Interruption de l’enquête'
              : `Enquête en cours (Étape ${run.currentStep} sur 6)`}
          </Text>
          <Text style={styles.bannerSubtitle}>
            {run.status === 'completed'
              ? 'Tous les éléments contradictoires et sources ont été vérifiés.'
              : run.status === 'failed'
              ? run.errorMessage || 'Une anomalie est survenue lors de l’interrogation des registres.'
              : 'Recoupement multi-sources en environnement sécurisé...'}
          </Text>
        </View>

        {run.status === 'completed' && run.reportId && (
          <Pressable
            onPress={() => onViewReport(run.reportId!)}
            style={({ hovered }: any) => [
              styles.actionButton,
              hovered && styles.actionButtonHovered,
            ]}
          >
            <Text style={styles.actionButtonText}>Consulter la Preuve</Text>
            <IconChevronRight size={16} color="#FFFFFF" />
          </Pressable>
        )}

        {run.status === 'failed' && onRetry && (
          <Pressable onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </Pressable>
        )}
      </View>

      {/* Real-time metrics counters */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{run.discoveredClaims.length}</Text>
          <Text style={styles.metricLabel}>Affirmations isolées</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={[styles.metricNumber, { color: THEME.colors.primary }]}>
            {run.sourcesFoundCount}
          </Text>
          <Text style={styles.metricLabel}>Sources identifiées</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={[styles.metricNumber, { color: THEME.colors.navy }]}>
            {run.status === 'completed' ? '100%' : `${Math.round((run.currentStep / 6) * 100)}%`}
          </Text>
          <Text style={styles.metricLabel}>Progression globale</Text>
        </View>
      </View>

      {/* Steps List */}
      <View style={styles.stepsCard}>
        <Text style={styles.stepsTitle}>Protocole d’analyse TRAUNES AI en 6 étapes</Text>

        <View style={styles.stepsTimeline}>
          {run.steps.map((step, index) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';
            const isWaiting = step.status === 'waiting';

            return (
              <View key={step.id} style={styles.stepItem}>
                <View style={styles.indicatorCol}>
                  <View
                    style={[
                      styles.circle,
                      isCompleted && styles.circleCompleted,
                      isInProgress && styles.circleInProgress,
                      isWaiting && styles.circleWaiting,
                    ]}
                  >
                    {isCompleted ? (
                      <IconCheck size={14} color="#FFFFFF" />
                    ) : isInProgress ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.waitingStepNumber}>{step.id}</Text>
                    )}
                  </View>
                  {index < run.steps.length - 1 && (
                    <View
                      style={[
                        styles.connectorLine,
                        isCompleted ? styles.connectorCompleted : styles.connectorWaiting,
                      ]}
                    />
                  )}
                </View>

                <View style={styles.stepDetails}>
                  <View style={styles.stepHeaderRow}>
                    <Text
                      style={[
                        styles.stepLabel,
                        (isInProgress || isCompleted) && styles.stepLabelActive,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {step.durationMs ? (
                      <Text style={styles.durationBadge}>
                        {(step.durationMs / 1000).toFixed(1)}s
                      </Text>
                    ) : isInProgress ? (
                      <Text style={styles.inProgressBadge}>En cours</Text>
                    ) : null}
                  </View>

                  <Text style={styles.stepDescription}>{step.description}</Text>

                  {/* Discovered claims preview under step 2 */}
                  {step.id === 2 && run.discoveredClaims.length > 0 && (
                    <View style={styles.claimsDiscoveryBox}>
                      <Text style={styles.discoveryHeader}>
                        Affirmations extraites soumises au recoupement :
                      </Text>
                      {run.discoveredClaims.map((claim, idx) => (
                        <Text key={idx} style={styles.discoveredClaimItem}>
                          • {claim}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: THEME.radii.xl,
    borderWidth: 1,
    gap: 14,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  bannerRunning: {
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  bannerCompleted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  bannerFailed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerInfo: {
    flex: 1,
    minWidth: 200,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.navy,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: THEME.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: THEME.radii.lg,
    minHeight: 44,
  },
  actionButtonHovered: {
    backgroundColor: THEME.colors.primaryDark,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: '#B91C1C',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: THEME.radii.lg,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.lg,
    padding: 16,
    alignItems: 'center',
    ...THEME.shadows.sm,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.navy,
  },
  metricLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  stepsCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.xl,
    padding: 20,
    ...THEME.shadows.md,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.navy,
    marginBottom: 20,
  },
  stepsTimeline: {
    paddingLeft: 4,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: '#15803D',
  },
  circleInProgress: {
    backgroundColor: THEME.colors.primary,
  },
  circleWaiting: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderWidth: 1,
  },
  waitingStepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  connectorCompleted: {
    backgroundColor: '#15803D',
  },
  connectorWaiting: {
    backgroundColor: '#E2E8F0',
  },
  stepDetails: {
    flex: 1,
    paddingTop: 2,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  stepLabelActive: {
    color: THEME.colors.navy,
    fontWeight: '700',
  },
  durationBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inProgressBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.primary,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
  },
  claimsDiscoveryBox: {
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: THEME.radii.md,
    padding: 10,
  },
  discoveryHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.navy,
    marginBottom: 4,
  },
  discoveredClaimItem: {
    fontSize: 12,
    color: THEME.colors.text,
    lineHeight: 17,
  },
});
