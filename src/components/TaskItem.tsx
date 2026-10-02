import type { Task } from '@/types/assistant';
import { Check, Clock3, Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function TaskItem({
  task,
  onToggle,
  onAI,
}: {
  task: Task;
  onToggle: () => void;
  onAI: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable style={[styles.check, task.done && styles.checked]} onPress={onToggle}>
        {task.done ? <Check size={15} color="#FFF" /> : null}
      </Pressable>
      <View style={styles.details}>
        <Text style={[styles.title, task.done && styles.struck]}>{task.title}</Text>
        <View style={styles.meta}>
          <Clock3 size={13} color="#A49CAB" />
          <Text style={styles.metaText}>{task.due === 'Today' ? task.time : `${task.due} · ${task.time}`}</Text>
          <View style={styles.dot} />
          <Text style={styles.metaText}>{task.category}</Text>
        </View>
      </View>
      <Pressable onPress={onAI} hitSlop={8}>
        <Sparkles size={17} color="#9B78CA" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 16 },
  check: { width: 20, height: 20, borderWidth: 1.5, borderColor: '#C9B4DF', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: '#8861C0', borderColor: '#8861C0' },
  details: { flex: 1, gap: 6 },
  title: { fontSize: 11, fontWeight: '700', color: '#393341' },
  struck: { textDecorationLine: 'line-through', color: '#A7A0AA' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#A49CAB', fontSize: 10 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#B7AEBB', marginHorizontal: 3 },
});
