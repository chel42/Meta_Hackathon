import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VerdictType } from '../../types';
import { THEME } from '../../theme/colors';
import { IconCheckCircle, IconXCircle, IconHelpCircle } from '../../icons/Icons';

interface VerdictBadgeProps {
  verdict: VerdictType;
  variant?: 'full' | 'short';
  size?: 'sm' | 'md' | 'lg';
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  variant = 'full',
  size = 'md',
}) => {
  const config = THEME.colors.verdicts[verdict] || THEME.colors.verdicts.unverifiable;
  const label = variant === 'short' ? config.shortLabel : config.label;

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 14 : 12;
  const paddingVertical = size === 'sm' ? 3 : size === 'lg' ? 8 : 5;
  const paddingHorizontal = size === 'sm' ? 8 : size === 'lg' ? 14 : 10;

  const renderIcon = () => {
    switch (verdict) {
      case 'confirmed':
        return <IconCheckCircle size={iconSize} color={config.text} />;
      case 'contradicted':
        return <IconXCircle size={iconSize} color={config.text} />;
      case 'unverifiable':
      default:
        return <IconHelpCircle size={iconSize} color={config.text} />;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingVertical,
          paddingHorizontal,
        },
      ]}
    >
      <View style={styles.iconWrapper}>{renderIcon()}</View>
      <Text style={[styles.label, { color: config.text, fontSize }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: THEME.radii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 6,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.1,
    fontFamily: THEME.typography.fontFamily,
  },
});
