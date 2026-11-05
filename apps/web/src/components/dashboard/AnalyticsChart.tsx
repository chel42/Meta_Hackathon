import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../theme/colors';
import { VerificationReport } from '../../types';
import { IconTrendingUp, IconFileText } from '../../icons/Icons';

interface AnalyticsChartProps {
  reports: VerificationReport[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ reports }) => {
  const stats = useMemo(() => {
    let totalClaims = 0;
    let confirmedClaims = 0;
    let contradictedClaims = 0;
    let unverifiableClaims = 0;

    reports.forEach((rep) => {
      totalClaims += rep.claimsCount || 0;
      confirmedClaims += rep.confirmedCount || 0;
      contradictedClaims += rep.contradictedCount || 0;
      unverifiableClaims += rep.unverifiableCount || 0;
    });

    if (!totalClaims) {
      return { total: 0, confirmedPct: 0, contradictedPct: 0, unverifiablePct: 0 };
    }

    const confirmedPct = Math.round((confirmedClaims / totalClaims) * 100);
    const contradictedPct = Math.round((contradictedClaims / totalClaims) * 100);
    const unverifiablePct = 100 - confirmedPct - contradictedPct;

    return {
      total: totalClaims,
      confirmedPct,
      contradictedPct,
      unverifiablePct,
    };
  }, [reports]);

  // Circumference for r=60 is ~377
  const strokeDash1 = (stats.confirmedPct / 100) * 377;
  const strokeDash2 = (stats.contradictedPct / 100) * 377;
  const strokeDash3 = (stats.unverifiablePct / 100) * 377;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderTitleRow}>
          <IconTrendingUp size={18} color="#14B8A6" />
          <Text style={styles.cardTitle}>Répartition des résultats d'investigation</Text>
        </View>
      </View>

      {stats.total === 0 ? (
        <View style={styles.emptyState}>
          <IconFileText size={28} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Données insuffisantes</Text>
          <Text style={styles.emptyDesc}>
            Les statistiques de répartition s'afficheront dès qu'une première investigation aura été finalisée.
          </Text>
        </View>
      ) : (
        <View style={styles.contentRow}>
          {/* Donut Visual */}
          <View style={styles.donutContainer}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="60" fill="none" stroke="#F1F5F9" strokeWidth="22" />
              {/* Confirmed Segment */}
              <circle
                cx="90"
                cy="90"
                r="60"
                fill="none"
                stroke="#10B981"
                strokeWidth="22"
                strokeDasharray={`${strokeDash1} 377`}
                strokeDashoffset="0"
                transform="rotate(-90 90 90)"
              />
              {/* Contradicted Segment */}
              <circle
                cx="90"
                cy="90"
                r="60"
                fill="none"
                stroke="#EF4444"
                strokeWidth="22"
                strokeDasharray={`${strokeDash2} 377`}
                strokeDashoffset={`-${strokeDash1}`}
                transform="rotate(-90 90 90)"
              />
              {/* Unverifiable Segment */}
              <circle
                cx="90"
                cy="90"
                r="60"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="22"
                strokeDasharray={`${strokeDash3} 377`}
                strokeDashoffset={`-${strokeDash1 + strokeDash2}`}
                transform="rotate(-90 90 90)"
              />
            </svg>

            <View style={styles.donutCenter}>
              <Text style={styles.donutValue}>{stats.total}</Text>
              <Text style={styles.donutLabel}>Affirmations</Text>
            </View>
          </View>

          {/* Legend Details */}
          <View style={styles.legendCol}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <View style={styles.legendTextCol}>
                <Text style={styles.legendTitle}>Confirmées par TRAUNES AI</Text>
                <Text style={styles.legendSub}>Sources primaires convergentes</Text>
              </View>
              <Text style={styles.legendPct}>{stats.confirmedPct}%</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <View style={styles.legendTextCol}>
                <Text style={styles.legendTitle}>Contredites par TRAUNES AI</Text>
                <Text style={styles.legendSub}>Faits dits infirmés</Text>
              </View>
              <Text style={styles.legendPct}>{stats.contradictedPct}%</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#94A3B8' }]} />
              <View style={styles.legendTextCol}>
                <Text style={styles.legendTitle}>Non vérifiables / Preuves insuffisantes</Text>
                <Text style={styles.legendSub}>Contexte à étayer</Text>
              </View>
              <Text style={styles.legendPct}>{stats.unverifiablePct}%</Text>
            </View>
          </View>
        </View>
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
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 360,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 24,
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 180,
    height: 180,
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  donutValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
  },
  donutLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  legendCol: {
    flex: 1,
    minWidth: 260,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendTextCol: {
    flex: 1,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  legendSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  legendPct: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
});
