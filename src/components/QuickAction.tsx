import { ArrowRight, CalendarDays, FileText, ListTodo, WandSparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const icons = { calendar: CalendarDays, decision: WandSparkles, task: ListTodo, note: FileText } as const;
const tones = {
  lilac: { bg: '#F0E9FA', color: '#8661C3' },
  peach: { bg: '#FBEDE4', color: '#C28566' },
  mint: { bg: '#E7F3EE', color: '#70A78C' },
  blue: { bg: '#E8EFF8', color: '#7697C3' },
} as const;

export function QuickAction({
  type, tone, label, onPress,
}: {
  type: keyof typeof icons;
  tone: keyof typeof tones;
  label: string;
  onPress: () => void;
}) {
  const Icon = icons[type];
  const colorsForTone = tones[tone];
  return (
    <Pressable style={styles.action} onPress={onPress}>
      <View style={[styles.icon, { backgroundColor: colorsForTone.bg }]}>
        <Icon size={20} color={colorsForTone.color} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <ArrowRight size={15} color="#AAA2B1" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: { flex: 1, minHeight: 54, borderWidth: 1, borderColor: '#F0EDF0', borderRadius: 13, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', gap: 8, padding: 9 },
  icon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 10, fontWeight: '700', color: '#4F4A56' },
});
