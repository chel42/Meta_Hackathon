import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SourceItem } from '../../types';
import { THEME } from '../../theme/colors';
import { IconExternalLink, IconAlertCircle, IconCheckCircle } from '../../icons/Icons';

interface SourceCardProps {
  source: SourceItem;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  const isUnconfirmed = source.status === 'not_confirmed' || source.status === 'unreachable';
  const trustBadge = THEME.colors.sourceTrust[source.reliability] || THEME.colors.sourceTrust.unverified;

  const handleOpenUrl = () => {
    // Only allow http and https schemas
    if (source.url.startsWith('http://') || source.url.startsWith('https://')) {
      if (typeof window !== 'undefined') {
        window.open(source.url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <View style={[styles.card, isUnconfirmed && styles.unconfirmedBorder]}>
      <View style={styles.header}>
        <View style={styles.titleInfo}>
          <Text style={styles.sourceName}>{source.name}</Text>
          <Text style={styles.publisherRow}>
            {source.publisher} • {source.publishedDate}
          </Text>
        </View>

        <View style={styles.badgesRow}>
          {isUnconfirmed ? (
            <View style={styles.warningBadge}>
              <IconAlertCircle size={13} color="#B45309" />
              <Text style={styles.warningBadgeText}>Source non confirmée</Text>
            </View>
          ) : (
            <View style={[styles.trustBadge, { backgroundColor: trustBadge.bg, borderColor: trustBadge.border }]}>
              <IconCheckCircle size={12} color={trustBadge.text} />
              <Text style={[styles.trustBadgeText, { color: trustBadge.text }]}>{trustBadge.label}</Text>
            </View>
          )}
        </View>
      </View>

      {source.excerpt ? (
        <View style={styles.excerptBox}>
          <Text style={styles.excerptText}>« {source.excerpt} »</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Pressable
          onPress={handleOpenUrl}
          style={({ hovered }: any) => [
            styles.linkButton,
            hovered && styles.linkButtonHovered,
          ]}
          accessibilityRole="link"
        >
          <Text style={styles.linkText} numberOfLines={1}>
            {source.url}
          </Text>
          <IconExternalLink size={14} color={THEME.colors.primary} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.radii.lg,
    padding: 16,
    marginBottom: 10,
    ...THEME.shadows.sm,
  },
  unconfirmedBorder: {
    borderColor: '#FDE68A',
    backgroundColor: '#FEFDF8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  titleInfo: {
    flex: 1,
    minWidth: 220,
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.text,
    lineHeight: 20,
  },
  publisherRow: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: THEME.radii.full,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  warningBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: THEME.radii.full,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  excerptBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primaryLight,
    padding: 10,
    borderRadius: THEME.radii.sm,
    marginTop: 10,
  },
  excerptText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  footer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primarySoft,
    maxWidth: '100%',
  },
  linkButtonHovered: {
    backgroundColor: '#CCFBF1',
  },
  linkText: {
    fontSize: 11,
    color: THEME.colors.primaryDark,
    fontWeight: '600',
    maxWidth: 280,
  },
});
