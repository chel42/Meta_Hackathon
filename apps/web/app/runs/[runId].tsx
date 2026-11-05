import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppShell } from '../../src/components/layout/AppShell';
import { RunTimeline } from '../../src/components/verification/RunTimeline';
import { ErrorState } from '../../src/components/common/ErrorState';
import { THEME } from '../../src/theme/colors';
import { IconChevronLeft, IconFileText } from '../../src/icons/Icons';
import { useTraunesAIData } from '../../src/context/TraunesAIDataContext';

export default function RunScreen() {
  const { runId } = useLocalSearchParams<{ runId: string }>();
  const router = useRouter();
  const { getRun, reports } = useTraunesAIData();

  const run = runId ? getRun(runId) : undefined;

  // If run is not found in memory (e.g. direct URL), try to find most recent report or show error
  if (!run) {
    const fallbackReport = reports[0];
    return (
      <AppShell>
        <View style={styles.container}>
          <Pressable onPress={() => router.push('/dashboard')} style={styles.backButton}>
            <IconChevronLeft size={16} color={THEME.colors.primary} />
            <Text style={styles.backButtonText}>Retour au tableau de bord</Text>
          </Pressable>

          <ErrorState
            title="Session d’enquête introuvable"
            message={`L’identifiant d’exécution "${runId}" n’est plus actif en mémoire vive. Vous pouvez consulter les dossiers archivés dans l’historique.`}
            retryLabel={fallbackReport ? 'Voir le dernier rapport archivé' : 'Lancer une vérification'}
            onRetry={() => {
              if (fallbackReport) {
                router.push(`/reports/${fallbackReport.id}` as any);
              } else {
                router.push('/new-check');
              }
            }}
          />
        </View>
      </AppShell>
    );
  }

  const handleViewReport = (reportId: string) => {
    router.push(`/reports/${reportId}` as any);
  };

  return (
    <AppShell>
      <View style={styles.container}>
        <View style={styles.topNavRow}>
          <Pressable onPress={() => router.push('/dashboard')} style={styles.backButton}>
            <IconChevronLeft size={16} color={THEME.colors.primary} />
            <Text style={styles.backButtonText}>Retour au tableau de bord</Text>
          </Pressable>
          <Text style={styles.runRefText}>Session : {run.id}</Text>
        </View>

        {/* Input Subject Card */}
        <View style={styles.subjectCard}>
          <View style={styles.subjectHeader}>
            <View style={styles.subjectTypeBadge}>
              <IconFileText size={14} color={THEME.colors.primary} />
              <Text style={styles.subjectTypeText}>
                Contenu examiné ({run.inputType === 'url' ? 'Lien' : run.inputType === 'image' ? 'Image' : 'Texte'})
              </Text>
            </View>
          </View>
          <Text style={styles.subjectContent} numberOfLines={3}>
            {run.inputContent}
          </Text>
        </View>

        {/* Real-time Timeline */}
        <RunTimeline
          run={run}
          onViewReport={handleViewReport}
          onRetry={() => router.push('/new-check')}
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  runRefText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontFamily: 'monospace' as any,
  },
  subjectCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.xl,
    padding: 16,
    marginBottom: 16,
    ...THEME.shadows.sm,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radii.full,
  },
  subjectTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primaryDark,
  },
  subjectContent: {
    fontSize: 14,
    color: THEME.colors.text,
    lineHeight: 21,
    fontStyle: 'italic',
  },
});
