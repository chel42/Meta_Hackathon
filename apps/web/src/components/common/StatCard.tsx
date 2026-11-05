import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../theme/colors';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  trend,
  trendPositive = true,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        {icon && <View style={styles.iconBox}>{icon}</View>}
      </View>
      <Text style={styles.value}>{value}</Text>
      {(subValue || trend) && (
        <View style={styles.bottomRow}>
          {trend && (
            <Text style={[styles.trend, { color: trendPositive ? '#15803D' : '#B91C1C' }]}>
              {trend}
            </Text>
          )}
          {subValue && <Text style={styles.subValue}>{subValue}</Text>}
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
    flex: 1,
    minWidth: 200,
    ...THEME.shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: THEME.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 30,
    fontWeight: '800',
    color: THEME.colors.navy,
    letterSpacing: -0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  trend: {
    fontSize: 12,
    fontWeight: '700',
  },
  subValue: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
});
