import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { THEME } from '../../theme/colors';
import { VerdictBadge } from '../verification/VerdictBadge';
import { VerificationReport, ClaimItem } from '../../types';
import { IconShield, IconSearch, IconChevronRight, IconCheckCircle, IconXCircle, IconHelpCircle } from '../../icons/Icons';

interface EvidenceTableProps {
  reports: VerificationReport[];
}

export const EvidenceTable: React.FC<EvidenceTableProps> = ({ reports }) => {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'reliability' | 'verdict' | 'date'>('reliability');

  // Flatten claims with their parent report metadata
  const allClaims = useMemo(() => {
    const list: Array<{ claim: ClaimItem; reportId: string; reportTitle: string; date: string }> = [];
    reports.forEach((rep) => {
      rep.claims.forEach((cl) => {
        list.push({
          claim: cl,
          reportId: rep.id,
          reportTitle: rep.title,
          date: rep.completedAt,
        });
      });
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'reliability') {
        const relRank = { high: 3, medium: 2, unverified: 1 };
        const aTopRel = a.claim.sources[0]?.reliability || 'unverified';
        const bTopRel = b.claim.sources[0]?.reliability || 'unverified';
        return relRank[bTopRel] - relRank[aTopRel];
      }
      if (sortBy === 'verdict') {
        const verdRank = { confirmed: 3, contradicted: 2, unverifiable: 1 };
        return verdRank[b.claim.verdict] - verdRank[a.claim.verdict];
      }
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

    return list;
  }, [reports, sortBy]);

  return (
    <View style={styles.card}>
      {/* Header & Controls */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <IconShield size={20} color="#14B8A6" />
          <View>
            <Text style={styles.title}>Evidence Intelligence</Text>
            <Text style={styles.subtitle}>
              Tableau des affirmations analysées et niveau de fiabilité des preuves croisées
            </Text>
          </View>
        </View>

        <View style={styles.sortControls}>
          <Text style={styles.sortLabel}>Trier par :</Text>
          <Pressable
            onPress={() => setSortBy('reliability')}
            style={[styles.sortPill, sortBy === 'reliability' && styles.sortPillActive]}
          >
            <Text style={[styles.sortPillText, sortBy === 'reliability' && styles.sortPillTextActive]}>
              Fiabilité source
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSortBy('verdict')}
            style={[styles.sortPill, sortBy === 'verdict' && styles.sortPillActive]}
          >
            <Text style={[styles.sortPillText, sortBy === 'verdict' && styles.sortPillTextActive]}>
              Verdict
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSortBy('date')}
            style={[styles.sortPill, sortBy === 'date' && styles.sortPillActive]}
          >
            <Text style={[styles.sortPillText, sortBy === 'date' && styles.sortPillTextActive]}>
              Date
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Table Content */}
      {allClaims.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSearch size={32} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Aucune preuve disponible</Text>
          <Text style={styles.emptyDesc}>
            Lancez votre première investigation TRAUNES AI pour alimenter le tableau d’intelligence des preuves.
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            {/* Table Header Row */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { width: 320 }]}>Affirmation extraite</Text>
              <Text style={[styles.th, { width: 140 }]}>Verdict TRAUNES AI</Text>
              <Text style={[styles.th, { width: 110, textAlign: 'center' }]}>Preuves Pour</Text>
              <Text style={[styles.th, { width: 110, textAlign: 'center' }]}>Preuves Contre</Text>
              <Text style={[styles.th, { width: 220 }]}>Source principale</Text>
              <Text style={[styles.th, { width: 120 }]}>Fiabilité</Text>
              <Text style={[styles.th, { width: 80, textAlign: 'right' }]}>Action</Text>
            </View>

            {/* Table Body Rows */}
            {allClaims.map(({ claim, reportId, reportTitle }, index) => {
              const mainSource = claim.sources[0];
              const reliabilityLabel =
                mainSource?.reliability === 'high'
                  ? 'Élevée'
                  : mainSource?.reliability === 'medium'
                  ? 'Modérée'
                  : 'À vérifier';
              const reliabilityColor =
                mainSource?.reliability === 'high'
                  ? '#10B981'
                  : mainSource?.reliability === 'medium'
                  ? '#F59E0B'
                  : '#64748B';

              return (
                <Pressable
                  key={`${reportId}-${claim.id}-${index}`}
                  onPress={() => router.push(`/reports/${reportId}` as any)}
                  style={({ hovered }: any) => [
                    styles.tableRow,
                    hovered && styles.tableRowHovered,
                  ]}
                >
                  <View style={[{ width: 320, paddingRight: 12 }]}>
                    <Text style={styles.claimText} numberOfLines={2}>
                      {claim.claimText}
                    </Text>
                    <Text style={styles.reportTitleContext} numberOfLines={1}>
                      Dossier : {reportTitle}
                    </Text>
                  </View>

                  <View style={{ width: 140 }}>
                    <VerdictBadge verdict={claim.verdict} variant="short" size="sm" />
                  </View>

                  <View style={{ width: 110, alignItems: 'center' }}>
                    <View style={styles.countBadgePos}>
                      <Text style={styles.countBadgePosText}>
                        +{claim.supportingEvidence?.length || 0}
                      </Text>
                    </View>
                  </View>

                  <View style={{ width: 110, alignItems: 'center' }}>
                    <View style={styles.countBadgeNeg}>
                      <Text style={styles.countBadgeNegText}>
                        -{claim.refutingEvidence?.length || 0}
                      </Text>
                    </View>
                  </View>

                  <View style={{ width: 220, paddingRight: 10 }}>
                    <Text style={styles.sourceName} numberOfLines={1}>
                      {mainSource?.name || 'Inconnue'}
                    </Text>
                    <Text style={styles.sourcePublisher} numberOfLines={1}>
                      {mainSource?.publisher || 'Base TRAUNES AI'}
                    </Text>
                  </View>

                  <View style={{ width: 120 }}>
                    <View style={[styles.reliabilityBadge, { borderColor: reliabilityColor }]}>
                      <View style={[styles.relDot, { backgroundColor: reliabilityColor }]} />
                      <Text style={[styles.relText, { color: reliabilityColor }]}>
                        {reliabilityLabel}
                      </Text>
                    </View>
                  </View>

                  <View style={{ width: 80, alignItems: 'flex-end' }}>
                    <IconChevronRight size={18} color="#94A3B8" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...THEME.shadows.sm,
    marginBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  sortControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortLabel: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 4,
  },
  sortPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortPillActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  sortPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  sortPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 400,
  },
  table: {
    minWidth: 1000,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  th: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderRadius: 8,
  },
  tableRowHovered: {
    backgroundColor: '#F0FDFA',
  },
  claimText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
  },
  reportTitleContext: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  countBadgePos: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBadgePosText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  countBadgeNeg: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBadgeNegText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B91C1C',
  },
  sourceName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  sourcePublisher: {
    fontSize: 11,
    color: '#94A3B8',
  },
  reliabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  relDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  relText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
