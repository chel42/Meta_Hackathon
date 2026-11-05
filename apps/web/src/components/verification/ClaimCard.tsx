import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ClaimItem } from '../../types';
import { THEME } from '../../theme/colors';
import { VerdictBadge } from './VerdictBadge';
import { SourceCard } from './SourceCard';
import { IconChevronDown, IconChevronRight, IconCheck, IconX, IconAlertTriangle } from '../../icons/Icons';

interface ClaimCardProps {
  claim: ClaimItem;
  index: number;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim, index }) => {
  const [sourcesExpanded, setSourcesExpanded] = useState<boolean>(true);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.claimNumberBadge}>
          <Text style={styles.claimNumberText}>Affirmation #{index + 1}</Text>
        </View>
        <VerdictBadge verdict={claim.verdict} variant="full" />
      </View>

      <Text style={styles.claimText}>« {claim.claimText} »</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Justification motivée de l’analyse</Text>
        <Text style={styles.justificationText}>{claim.justification}</Text>
      </View>

      {/* Éléments favorables vs contradictoires */}
      <View style={styles.evidenceGrid}>
        {claim.supportingEvidence && claim.supportingEvidence.length > 0 && (
          <View style={styles.evidenceCol}>
            <View style={styles.evidenceColHeader}>
              <View style={[styles.evidenceIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <IconCheck size={14} color="#15803D" />
              </View>
              <Text style={[styles.evidenceColTitle, { color: '#15803D' }]}>
                Éléments favorables ({claim.supportingEvidence.length})
              </Text>
            </View>
            {claim.supportingEvidence.map((item, i) => (
              <View key={i} style={styles.evidenceItemRow}>
                <Text style={[styles.bullet, { color: '#15803D' }]}>•</Text>
                <Text style={styles.evidenceText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {claim.refutingEvidence && claim.refutingEvidence.length > 0 && (
          <View style={styles.evidenceCol}>
            <View style={styles.evidenceColHeader}>
              <View style={[styles.evidenceIconCircle, { backgroundColor: '#FEF2F2' }]}>
                <IconX size={14} color="#B91C1C" />
              </View>
              <Text style={[styles.evidenceColTitle, { color: '#B91C1C' }]}>
                Éléments contradictoires ({claim.refutingEvidence.length})
              </Text>
            </View>
            {claim.refutingEvidence.map((item, i) => (
              <View key={i} style={styles.evidenceItemRow}>
                <Text style={[styles.bullet, { color: '#B91C1C' }]}>•</Text>
                <Text style={styles.evidenceText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Limites d'investigation spécifiques à l'affirmation */}
      {claim.limitations && claim.limitations.length > 0 && (
        <View style={styles.claimLimitationsBox}>
          <View style={styles.claimLimitHeader}>
            <IconAlertTriangle size={15} color="#B45309" />
            <Text style={styles.claimLimitTitle}>Limites spécifiques à cette affirmation</Text>
          </View>
          {claim.limitations.map((limit, idx) => (
            <Text key={idx} style={styles.claimLimitText}>
              • {limit}
            </Text>
          ))}
        </View>
      )}

      {/* Sources associées repliables */}
      {claim.sources && claim.sources.length > 0 && (
        <View style={styles.sourcesContainer}>
          <Pressable
            onPress={() => setSourcesExpanded(!sourcesExpanded)}
            style={styles.sourcesToggle}
          >
            <Text style={styles.sourcesToggleTitle}>
              Sources documentaires consultées ({claim.sources.length})
            </Text>
            {sourcesExpanded ? (
              <IconChevronDown size={18} color={THEME.colors.textSecondary} />
            ) : (
              <IconChevronRight size={18} color={THEME.colors.textSecondary} />
            )}
          </Pressable>

          {sourcesExpanded && (
            <View style={styles.sourcesList}>
              {claim.sources.map((src) => (
                <SourceCard key={src.id} source={src} />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.xl,
    padding: 20,
    marginBottom: 20,
    ...THEME.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  claimNumberBadge: {
    backgroundColor: THEME.colors.navy,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.radii.md,
  },
  claimNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  claimText: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.navy,
    lineHeight: 25,
    marginBottom: 16,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  justificationText: {
    fontSize: 14,
    lineHeight: 22,
    color: THEME.colors.text,
  },
  evidenceGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  evidenceCol: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#F8FAFC',
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.lg,
    padding: 12,
  },
  evidenceColHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  evidenceIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceColTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  evidenceItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    fontWeight: '700',
  },
  evidenceText: {
    fontSize: 12,
    lineHeight: 18,
    color: THEME.colors.text,
    flex: 1,
  },
  claimLimitationsBox: {
    backgroundColor: '#FFFDF5',
    borderColor: '#FEF3C7',
    borderWidth: 1,
    borderRadius: THEME.radii.md,
    padding: 12,
    marginVertical: 10,
  },
  claimLimitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  claimLimitTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  claimLimitText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  sourcesContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 12,
  },
  sourcesToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  sourcesToggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  sourcesList: {
    marginTop: 10,
  },
});
