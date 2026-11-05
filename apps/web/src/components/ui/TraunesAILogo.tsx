import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface TraunesAILogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitleText?: string;
  lightMode?: boolean; // For dark headers or dark sidebar
}

export const TraunesAILogo: React.FC<TraunesAILogoProps> = ({
  size = 'md',
}) => {
  const logoHeight = size === 'sm' ? 80 : size === 'lg' ? 160 : 120;
  const logoWidth = size === 'sm' ? 333 : size === 'lg' ? 666 : 500;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: '/logo.png' }}
        style={{ width: logoWidth, height: logoHeight }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
