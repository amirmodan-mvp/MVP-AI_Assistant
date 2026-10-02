import { X } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/theme';

export function BottomSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={{ flex: 1 }} />
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color="#99919D" />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(32,27,40,0.35)', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '82%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    paddingHorizontal: 24,
    paddingTop: 9,
    paddingBottom: 35,
  },
  handle: { width: 35, height: 4, borderRadius: 5, backgroundColor: '#DED8E0', alignSelf: 'center', marginBottom: 10 },
  header: { height: 30, flexDirection: 'row', alignItems: 'center' },
});
