import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/theme';

export function SectionHeading({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {action ? (
        <Pressable style={styles.action} onPress={onAction}>
          <Text style={styles.actionText}>{action}</Text>
          <ArrowRight size={15} color={Colors.purple} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 27, marginBottom: 12 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.4, color: '#9A89B2' },
  title: { marginTop: 5, fontSize: 17, fontWeight: '700', color: Colors.text },
  action: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  actionText: { color: Colors.purple, fontSize: 11, fontWeight: '700' },
});
