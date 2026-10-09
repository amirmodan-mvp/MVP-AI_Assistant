import { StyleSheet, View } from 'react-native';

type OrbProps = {
  small?: boolean;
};

export function Orb({ small = false }: OrbProps) {
  return (
    <View style={[styles.orb, small ? styles.small : undefined]}>
      <View style={[styles.highlight, small ? styles.smallHighlight : undefined]} />
      <View style={[styles.core, small ? styles.smallCore : undefined]} /></View>
  );
}

const styles = StyleSheet.create({
  orb: {
    width: 79,
    height: 79,
    borderRadius: 40,
    backgroundColor: '#A993D7',
    shadowColor: '#3E2678',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
    overflow: 'hidden',
  },
  small: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  highlight: {
    position: 'absolute',
    width: 43,
    height: 19,
    left: 12,
    top: 12,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.48)',
    transform: [{ rotate: '-30deg' }],
  },
  smallHighlight: {
    width: 13,
    height: 6,
    left: 3,
    top: 4,
  },
  core: {
    position: 'absolute',
    width: 16,
    height: 16,
    left: 31,
    top: 31,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  smallCore: {
    width: 5,
    height: 5,
    left: 9,
    top: 9,
    borderRadius: 3,
  },
});
