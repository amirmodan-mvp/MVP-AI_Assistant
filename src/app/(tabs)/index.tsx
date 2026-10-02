import { router } from 'expo-router';
import { ArrowUp, Bell, Circle, Search, Sparkles, Sun } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Orb } from '../../components/Orb';
import { QuickAction } from '../../components/QuickAction';
import { SectionHeading } from '../../components/SectionHeading';
import { Colors } from '../../constants/theme';

export default function HomeScreen() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Finish client proposal', time: '10:00 AM', category: 'Work', done: false },
    { id: 2, title: 'Review landing page', time: '2:30 PM', category: 'Work', done: false },
    { id: 3, title: 'Pick up groceries', time: '6:00 PM', category: 'Personal', done: false },
  ]);

  const todayCount = useMemo(() => tasks.filter(t => !t.done).length, [tasks]);

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.date}><Sun size={15} color="#9B80BB" /><Text style={styles.dateText}>{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase()}</Text></View>
        <View style={styles.greeting}><Text style={styles.h1}>Good morning,{'\n'}<Text style={styles.purple}>John.</Text></Text><Text style={styles.sub}>Let's make today a good one.</Text></View>

        <Pressable style={styles.briefing} onPress={() => router.push('/ai?prompt=Plan my day')}>
          <View style={styles.briefingTop}><View style={styles.briefIcon}><Sparkles size={17} color="#FFF" /></View><Text style={styles.briefLabel}>YOUR DAILY BRIEFING</Text><ArrowUp size={17} color="#FFF" style={{ marginLeft: 'auto', transform: [{ rotate: '45deg' }] }} /></View>
          <View style={styles.briefMain}><View style={{ flex: 1 }}><Text style={styles.briefTitle}>A little clarity for today.</Text><Text style={styles.briefSub}>You have a full day ahead. Let's take it one step at a time.</Text></View><View style={styles.briefOrb}><Orb /></View></View>
          <View style={styles.stats}><Text style={styles.stat}><Text style={styles.statStrong}>{todayCount}</Text> tasks</Text><View style={styles.statDot}/><Text style={styles.stat}><Text style={styles.statStrong}>2</Text> events</Text><View style={styles.statDot}/><Text style={styles.stat}><Text style={styles.statStrong}>1</Text> reminder</Text></View>
        </Pressable>

        <SectionHeading eyebrow="YOUR AI COMPANION" title="Where should we start?" />
        <Pressable style={styles.ask} onPress={() => router.push('/ai')}>
          <Orb small /><Text style={styles.askText}>What can I help you with?</Text><View style={styles.askArrow}><ArrowUp size={18} color="#FFF" /></View>
        </Pressable>

        <View style={styles.quickGrid}>
          <QuickAction type="calendar" tone="lilac" label="Plan my day" onPress={() => router.push('/ai?prompt=Plan my day')} />
          <QuickAction type="decision" tone="peach" label="Help me decide" onPress={() => router.push('/ai?prompt=Help me decide')} />
          <QuickAction type="task" tone="mint" label="Create a task" onPress={() => router.push('/tasks')} />
          <QuickAction type="note" tone="blue" label="Summarize a note" onPress={() => router.push('/notes')} />
        </View>

        <SectionHeading eyebrow="STAY ON TRACK" title="Coming up today" action="See all" onAction={() => router.push('/tasks')} />
        <View style={styles.taskCard}>
          {tasks.filter(t => !t.done).slice(0, 2).map((task, index) => (
            <Pressable key={task.id} style={[styles.task, index > 0 && styles.taskBorder]} onPress={() => setTasks(current => current.map(t => t.id === task.id ? { ...t, done: true } : t))}>
              <Circle size={21} color="#BEA8DC" />
              <View style={styles.taskInfo}><Text style={styles.taskTitle}>{task.title}</Text><Text style={styles.taskMeta}>{task.time} · {task.category}</Text></View>
              {index === 0 ? <View style={styles.priority} /> : null}
            </Pressable>
          ))}
          {todayCount === 0 ? <Text style={styles.empty}>All caught up for today. Nice work!</Text> : null}
        </View>
        <View style={styles.bottomNote}><Sparkles size={14} color="#9A7AC9" /><Text>You've got this. One thing at a time.</Text></View>
      </ScrollView>
    </View>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.replace('/')} style={styles.brand}><View style={styles.brandIcon}><Sparkles size={15} color="#FFF" /></View><Text style={styles.brandText}>dayone<Text style={styles.brandDot}>.</Text></Text></Pressable>
      <View style={styles.actions}><Pressable onPress={() => {}}><Search size={20} color="#55505D" /></Pressable><Pressable onPress={() => {}}><Bell size={20} color="#55505D" /></Pressable><Pressable style={styles.avatar} onPress={() => router.push('/more')}><Text style={styles.avatarText}>J</Text></Pressable></View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { height: 61, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center' },
  brandIcon: { width: 25, height: 25, borderRadius: 8, backgroundColor: '#7C5ABB', alignItems: 'center', justifyContent: 'center', marginRight: 7 },
  brandText: { fontSize: 20, fontWeight: '800', color: '#24212E' },
  brandDot: { color: '#8961CC' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 17 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#DDCBB7', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#F6F1E9' },
  avatarText: { fontSize: 12, fontWeight: '800', color: '#654D42' },
  content: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 35 },
  date: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 13 },
  dateText: { color: '#9B80BB', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  greeting: { marginBottom: 25 },
  h1: { fontSize: 35, lineHeight: 41, fontWeight: '700', color: '#2B2733' },
  purple: { color: '#906BC4' },
  sub: { fontSize: 12.5, color: '#92909A', marginTop: 8 },
  briefing: { backgroundColor: '#7957B5', borderRadius: 19, padding: 16, paddingBottom: 0, overflow: 'hidden', shadowColor: '#6F4BA5', shadowOpacity: .16, shadowRadius: 12, elevation: 4 },
  briefingTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  briefIcon: { width: 23, height: 23, borderRadius: 7, backgroundColor: 'rgba(255,255,255,.18)', alignItems: 'center', justifyContent: 'center' },
  briefLabel: { color: '#EBE2F6', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  briefMain: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  briefTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', maxWidth: 185 },
  briefSub: { color: '#E6DCF5', fontSize: 10, lineHeight: 15, maxWidth: 184, marginTop: 6 },
  briefOrb: { width: 95, height: 80, alignItems: 'center', justifyContent: 'center' },
  stats: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.22)', height: 42, flexDirection: 'row', alignItems: 'center', gap: 12 },
  stat: { color: '#E9DEF5', fontSize: 10 },
  statStrong: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  statDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CCB5E9' },
  ask: { height: 54, borderWidth: 1, borderColor: '#EBE6EE', borderRadius: 15, backgroundColor: '#FFF', paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  askText: { flex: 1, color: '#A29DA8', fontSize: 12 },
  askArrow: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#7654B2', alignItems: 'center', justifyContent: 'center' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 11 },
  taskCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0EDF0', borderRadius: 15, paddingHorizontal: 14 },
  task: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 14 },
  taskBorder: { borderTopWidth: 1, borderTopColor: '#F2EEF2' },
  taskInfo: { flex: 1, gap: 4 },
  taskTitle: { fontSize: 11, fontWeight: '700', color: '#393341' },
  taskMeta: { color: '#A5A0A9', fontSize: 10 },
  priority: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D9A98F' },
  empty: { paddingVertical: 20, color: '#8A8192', fontSize: 12 },
  bottomNote: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, paddingTop: 22 },
});
