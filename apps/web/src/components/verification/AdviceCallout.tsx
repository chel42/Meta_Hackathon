import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconShield } from '../../icons/Icons';
import { THEME } from '../../theme/colors';

interface AdviceCalloutProps {
  advice: string;
}

export const AdviceCallout: React.FC<AdviceCalloutProps> = ({ advice }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <IconShield size={18} color={THEME.colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Conseil critique TRAUNES AI</Text>
        <Text style={styles.text}>{advice}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.primarySoft,
    borderColor: '#99F6E4',
    borderWidth: 1,
    borderRadius: THEME.radii.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginVertical: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    color: THEME.colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  text: {
    color: THEME.colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
});
