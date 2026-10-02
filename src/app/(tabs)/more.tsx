import { Bell, ChevronRight, FileText, ListTodo, Mic, Settings2, Sparkles, Sun, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '../../components/BottomSheet';
import { Colors } from '../../constants/theme';
import { initialMemories } from '../../data/assistant';

export default function MoreScreen() {
  const [panel, setPanel] = useState<'memory' | 'notifications' | null>(null);
  const [memories, setMemories] = useState(initialMemories);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heading}><Text style={styles.eyebrow}>MADE FOR YOU</Text><Text style={styles.h1}>Your space<Text style={styles.period}>.</Text></Text><Text style={styles.sub}>The little details that make this feel like yours.</Text></View>

      <View style={styles.profile}><View style={styles.profileAvatar}><Text>J</Text></View><View style={styles.profileInfo}><Text style={styles.name}>John Carter</Text><Text style={styles.email}>john.carter@email.com</Text></View><ChevronRight size={18} color="#B6ACBB" /></View>

      <SettingsGroup title="YOUR AI">
        <Setting icon={<Sparkles size={19} color="#9472BD" />} bg="#F0EAF6" title="AI memory" subtitle="What your assistant remembers" onPress={() => setPanel('memory')} />
        <Setting icon={<Settings2 size={19} color="#C28566" />} bg="#FBEDE4" title="Response style" subtitle="Clear & concise" onPress={() => {}} />
      </SettingsGroup>

      <SettingsGroup title="PREFERENCES">
        <Setting icon={<Bell size={19} color="#70A78C" />} bg="#E7F3EE" title="Notifications" subtitle="Updates and reminders" onPress={() => setPanel('notifications')} />
        <Setting icon={<Mic size={19} color="#7697C3" />} bg="#E8EFF8" title="Voice input" subtitle="Talk things through" onPress={() => {}} />
      </SettingsGroup>

      <View style={styles.footer}><Sparkles size={17} color="#9B80BC" /><Text style={styles.footerText}>A little more ease, every day.</Text><Text style={styles.footerSmall}>DAYONE AI · CONCEPT PREVIEW</Text></View>

      <BottomSheet visible={panel !== null} onClose={() => setPanel(null)}>
        {panel === 'memory' ? (
          <View>
            <Text style={styles.sheetTitle}>AI memory</Text>
            <Text style={styles.memoryDescription}>Your assistant keeps the details that help it help you. You're always in control.</Text>
            {memories.map((memory, index) => (
              <View style={styles.memoryItem} key={memory}>
                <View style={styles.memoryIcon}>{index === 0 ? <Sun size={18} color="#9472BD" /> : index === 1 ? <FileText size={18} color="#9472BD" /> : <ListTodo size={18} color="#9472BD" />}</View>
                <Text style={styles.memoryText}>{memory}</Text>
                <Pressable onPress={() => setMemories(current => current.filter(item => item !== memory))}><Trash2 size={16} color="#B6AEBA" /></Pressable>
              </View>
            ))}
            <Pressable style={styles.primary} onPress={() => setMemories(current => [...current, 'Prefers thoughtful planning'])}><Text style={styles.primaryText}>Add a preference</Text><Text style={styles.plus}>+</Text></Pressable>
          </View>
        ) : (
          <View>
            <Text style={styles.sheetTitle}>Notifications</Text>
            <View style={styles.notice}><View style={styles.noticeIcon}><Sparkles size={18} color="#8661B9" /></View><View style={styles.noticeInfo}><Text style={styles.noticeTitle}>Your daily briefing is ready</Text><Text style={styles.noticeSub}>Take a moment to see what's ahead.</Text><Text style={styles.noticeTime}>JUST NOW</Text></View></View>
            <View style={styles.notice}><View style={[styles.noticeIcon, { backgroundColor: '#F7EBE4' }]}><Bell size={18} color="#BF8968" /></View><View style={styles.noticeInfo}><Text style={styles.noticeTitle}>Client proposal due today</Text><Text style={styles.noticeSub}>You've got this. A little focus goes a long way.</Text><Text style={styles.noticeTime}>2 HOURS AGO</Text></View></View>
          </View>
        )}
      </BottomSheet>
    </ScrollView>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.group}><Text style={styles.groupTitle}>{title}</Text>{children}</View>;
}

function Setting({ icon, bg, title, subtitle, onPress }: { icon: React.ReactNode; bg: string; title: string; subtitle: string; onPress: () => void }) {
  return <Pressable style={styles.setting} onPress={onPress}><View style={[styles.settingIcon, { backgroundColor: bg }]}>{icon}</View><View style={styles.settingInfo}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingSub}>{subtitle}</Text></View><ChevronRight size={18} color="#B5A9BA" /></Pressable>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 35 },
  heading: { marginTop: 15, marginBottom: 23 },
  eyebrow: { color: '#9A89B2', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  h1: { marginTop: 10, fontSize: 35, lineHeight: 41, fontWeight: '700', color: '#2B2733' },
  period: { color: '#8D67D9' },
  sub: { color: '#92909A', fontSize: 12.5, marginTop: 8 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderWidth: 1, borderColor: '#EEE9EE', backgroundColor: '#FFF', borderRadius: 15 },
  profileAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DDCBB7', alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { fontSize: 20, fontWeight: '800', color: '#654D42' },
  profileInfo: { flex: 1, gap: 4 },
  name: { fontSize: 12, fontWeight: '700' },
  email: { color: '#A49BA9', fontSize: 10 },
  group: { marginTop: 28 },
  groupTitle: { color: '#9A89B2', fontSize: 10, fontWeight: '800', letterSpacing: 1.3, marginBottom: 12 },
  setting: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#ECE8ED' },
  settingIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1, gap: 4 },
  settingTitle: { fontSize: 11, fontWeight: '700' },
  settingSub: { color: '#AAA1AE', fontSize: 10 },
  footer: { marginVertical: 37, flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 7 },
  footerText: { color: '#9B80BC', fontSize: 11, fontWeight: '700' },
  footerSmall: { flexBasis: '100%', textAlign: 'center', color: '#B6AEBA', fontSize: 8, letterSpacing: 1.2, marginTop: 2 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#332D3A', marginTop: 3 },
  memoryDescription: { color: '#8F8595', lineHeight: 18, fontSize: 11, marginVertical: 18 },
  memoryItem: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#EEE9EE', paddingVertical: 11 },
  memoryIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: '#F0EAF6', alignItems: 'center', justifyContent: 'center' },
  memoryText: { flex: 1, fontSize: 11, fontWeight: '600' },
  primary: { width: '100%', marginTop: 23, padding: 13, borderRadius: 11, backgroundColor: '#7957B5', flexDirection: 'row', justifyContent: 'space-between' },
  primaryText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  plus: { color: '#FFF', fontSize: 18, lineHeight: 12 },
  notice: { flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EAE5EA' },
  noticeIcon: { width: 35, height: 35, borderRadius: 10, backgroundColor: '#EEE6F7', alignItems: 'center', justifyContent: 'center' },
  noticeInfo: { flex: 1, gap: 4 },
  noticeTitle: { fontSize: 11, fontWeight: '700' },
  noticeSub: { fontSize: 10, color: '#948C99' },
  noticeTime: { fontSize: 8, color: '#B8ACBE', fontWeight: '800', letterSpacing: 1, marginTop: 4 },
});
