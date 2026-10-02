import { StyleSheet, View } from 'react-native';

export function Orb({ small = false }: { small?: boolean }) {
  return (
    <View style={[styles.orb, small && styles.small]}>
      <View style={[styles.highlight, small && styles.smallHighlight]} />
      <View style={[styles.core, small && styles.smallCore]} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    width: 79,
    height: 79,
    borderRadius: 40,
    backgroundColor: '#A993D7',
    shadowColor: '#3E2678',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },
  small: { width: 24, height: 24, borderRadius: 12 },
  highlight: {
    position: 'absolute',
    width: 48,
    height: 31,
    left: 8,
    top: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  smallHighlight: { width: 15, height: 10, left: 2, top: 2 },
  core: {
    position: 'absolute',
    width: 16,
    height: 16,
    left: 22,
    top: 20,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  smallCore: { width: 5, height: 5, left: 5, top: 5 },
});
