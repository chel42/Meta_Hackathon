import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconAlertTriangle } from '../../icons/Icons';
import { THEME } from '../../theme/colors';

interface LimitsPanelProps {
  limitations: string[];
  title?: string;
}

export const LimitsPanel: React.FC<LimitsPanelProps> = ({
  limitations,
  title = 'Limites méthodologiques d’investigation (toujours visibles)',
}) => {
  if (!limitations || limitations.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <IconAlertTriangle size={18} color={THEME.colors.limitations.text} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.disclaimer}>
        TRAUNES AI n’établit pas une vérité absolue. Toute vérification dépend des éléments publiquement
        accessibles et documentés au moment de l’enquête.
      </Text>
      <View style={styles.list}>
        {limitations.map((limit, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.itemText}>{limit}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.limitations.bg,
    borderColor: THEME.colors.limitations.border,
    borderWidth: 1,
    borderRadius: THEME.radii.lg,
    padding: 16,
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    color: THEME.colors.limitations.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  disclaimer: {
    color: '#92400E',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  list: {
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bullet: {
    color: THEME.colors.limitations.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  itemText: {
    color: '#92400E',
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
});
