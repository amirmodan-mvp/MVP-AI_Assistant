import { CheckCheck, Plus, Sparkles } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TaskItem } from '../../components/TaskItem';
import { Colors } from '../../constants/theme';
import { initialTasks } from '../../data/assistant';
import type { Task } from '../../types/assistant';

type Filter = 'Today' | 'Upcoming' | 'Completed';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<Filter>('Today');

  const visible = useMemo(() => tasks.filter(task =>
    filter === 'Completed' ? task.done :
    filter === 'Today' ? task.due === 'Today' && !task.done :
    task.due !== 'Today' && !task.done
  ), [tasks, filter]);

  const completed = tasks.filter(t => t.done).length;
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heading}><Text style={styles.eyebrow}>ONE THING AT A TIME</Text><Text style={styles.h1}>Your tasks<Text style={styles.period}>.</Text></Text><Text style={styles.sub}>Everything you need to do, in one calm place.</Text></View>

      <View style={styles.overview}>
        <View><Text style={styles.overviewLabel}>YOUR PROGRESS TODAY</Text><Text style={styles.count}>{completed}<Text style={styles.total}> / {tasks.length}</Text></Text><Text style={styles.overviewSub}>Every step counts. Keep going.</Text></View>
        <View style={styles.ring}><Text style={styles.ringText}>{progress}%</Text></View>
      </View>

      <View style={styles.filters}>{(['Today', 'Upcoming', 'Completed'] as Filter[]).map(item => <Pressable key={item} style={[styles.filter, filter === item && styles.filterActive]} onPress={() => setFilter(item)}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text></Pressable>)}</View>

      <View style={styles.list}>
        {visible.map(task => (
          <View key={task.id} style={styles.listRow}>
            <TaskItem
              task={task}
              onToggle={() => setTasks(current => current.map(item => item.id === task.id ? { ...item, done: !item.done } : item))}
              onAI={() => {}}
            />
          </View>
        ))}
        {!visible.length ? <View style={styles.empty}><CheckCheck size={29} color="#9477B6" /><Text style={styles.emptyTitle}>Nothing here yet</Text><Text style={styles.emptyText}>{filter === 'Completed' ? 'Complete a task and it will show up here.' : 'Your list is looking beautifully clear.'}</Text></View> : null}
      </View>

      <Pressable style={styles.add}><Plus size={19} color="#8969B6" /><Text>Add a task</Text></Pressable>
      <View style={styles.tip}><Sparkles size={17} color="#977ABA" /><Text style={styles.tipText}>Need help getting started? <Text style={styles.tipLink}>Ask AI to prioritize your tasks →</Text></Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 35 },
  heading: { marginTop: 15, marginBottom: 23 },
  eyebrow: { color: '#9A89B2', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  h1: { marginTop: 10, fontSize: 35, lineHeight: 41, fontWeight: '700', color: '#2B2733' },
  period: { color: '#8D67D9' },
  sub: { color: '#92909A', fontSize: 12.5, marginTop: 8 },
  overview: { backgroundColor: '#EEE8F6', borderRadius: 17, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  overviewLabel: { fontSize: 9, letterSpacing: 1.2, fontWeight: '800', color: '#8C70AE' },
  count: { fontSize: 31, fontWeight: '800', color: '#2D2835', marginTop: 8 },
  total: { fontSize: 19, color: '#B2A3C1' },
  overviewSub: { color: '#978AA1', fontSize: 10 },
  ring: { width: 65, height: 65, borderRadius: 33, borderWidth: 7, borderColor: '#D9CBE8', alignItems: 'center', justifyContent: 'center' },
  ringText: { fontSize: 11, fontWeight: '800', color: '#7957AD' },
  filters: { flexDirection: 'row', gap: 7, marginVertical: 26 },
  filter: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 9, backgroundColor: '#F1EEF1' },
  filterActive: { backgroundColor: '#7957B5' },
  filterText: { color: '#9A929E', fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: '#FFF' },
  list: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0EDF0', borderRadius: 15, paddingHorizontal: 14 },
  listRow: {},
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyTitle: { marginTop: 10, fontSize: 13, fontWeight: '700', color: '#3F3849' },
  emptyText: { marginTop: 5, fontSize: 10, color: '#ABA3AF', textAlign: 'center' },
  add: { width: '100%', borderWidth: 1, borderStyle: 'dashed', borderColor: '#CFBFE1', borderRadius: 12, padding: 13, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  addText: { color: '#8969B6', fontSize: 11, fontWeight: '700' },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#F2EDF7', borderRadius: 12, padding: 14, marginTop: 24 },
  tipText: { flex: 1, color: '#77707E', fontSize: 10, lineHeight: 16 },
  tipLink: { color: '#7957B5', fontWeight: '700' },
});
