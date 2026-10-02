import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { ArrowUp, CalendarDays, Copy, ImagePlus, ListTodo, Mic, Paperclip, Sparkles, WandSparkles } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Orb } from '../../components/Orb';
import { ResponseCard } from '../../components/ResponseCard';
import { Colors } from '../../constants/theme';
import { createAIResponse } from '../../lib/assistant';
import type { Message, Task, TaskDue } from '../../types/assistant';

export default function AIScreen() {
  const params = useLocalSearchParams<{ prompt?: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  const addTask = (title: string, due: TaskDue = 'Tomorrow', time = '9:00 AM') => {
    setTasks(current => [{ id: Date.now(), title, time, category: 'Work', done: false, due }, ...current]);
  };

  const ask = (value: string) => {
    const text = value.trim();
    if (!text) return;
    const response = createAIResponse(text, addTask);
    setMessages(current => [...current, { id: Date.now(), role: 'user', text }, { id: Date.now() + 1, ...response }]);
    setDraft('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  useEffect(() => {
    if (params.prompt) ask(params.prompt);
  }, [params.prompt]);

  const upload = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (!result.canceled) ask(`Summarize the file ${result.assets[0].name}`);
  };

  const photo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) ask('Summarize the attached image');
  };

  const showToast = (text: string) => {
    // Intentionally simple for the first native conversion.
    console.log(text);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>A LITTLE HELP, WHENEVER YOU NEED IT</Text>
          <Text style={styles.h1}>Ask anything<Text style={styles.period}>.</Text></Text>
          <Text style={styles.sub}>Your ideas, plans, and questions — all in one place.</Text>
        </View>

        {messages.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyOrb}><Orb /></View>
            <Text style={styles.emptyTitle}>What's on your mind?</Text>
            <Text style={styles.emptyText}>I'm here to help you find the next step, big or small.</Text>
            <View style={styles.suggestions}>
              <Suggestion icon={<CalendarDays size={18} color="#906BBF" />} label="Plan my day" onPress={() => ask('Plan my day')} />
              <Suggestion icon={<WandSparkles size={18} color="#906BBF" />} label="Help me make a decision" onPress={() => ask('Help me decide between two options')} />
              <Suggestion icon={<ListTodo size={18} color="#906BBF" />} label="Make a checklist" onPress={() => ask('Create a grocery checklist')} />
            </View>
          </View>
        ) : (
          <View style={styles.thread}>
            {messages.map(message => (
              <View key={message.id} style={[styles.message, message.role === 'user' && styles.userMessage]}>
                {message.role === 'assistant' ? <View style={styles.chatAvatar}><Sparkles size={15} color="#FFF" /></View> : null}
                <View style={[styles.messageBody, message.role === 'user' && styles.userBubble]}>
                  <Text style={styles.messageText}>{message.text}</Text>
                  {message.card ? (
                    <ResponseCard
                      type={message.card}
                      taskTitle={message.taskTitle}
                      taskDue={message.taskDue}
                      taskTime={message.taskTime}
                      checkedList={checkedList}
                      setCheckedList={setCheckedList}
                      onAddTask={addTask}
                      onOpenTasks={() => {}}
                      onToast={showToast}
                    />
                  ) : null}
                  {message.role === 'assistant' ? (
                    <View style={styles.responseActions}>
                      <Pressable onPress={async () => { await Clipboard.setStringAsync(message.text); showToast('Response copied'); }}><Copy size={14} color="#A39BAB" /><Text>Copy</Text></Pressable>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.compose}>
        <View style={styles.composeBox}>
          <Pressable onPress={upload}><Paperclip size={19} color="#9B90A5" /></Pressable>
          <TextInput value={draft} onChangeText={setDraft} placeholder="Ask me anything..." placeholderTextColor="#AAA2AD" style={styles.input} onSubmitEditing={() => ask(draft)} returnKeyType="send" />
          <Pressable onPress={() => console.log('Native voice input can be connected here')}><Mic size={19} color="#9B90A5" /></Pressable>
          <Pressable style={styles.send} onPress={() => ask(draft)}><ArrowUp size={19} color="#FFF" /></Pressable>
        </View>
        <View style={styles.hint}><Pressable onPress={photo} style={styles.photo}><ImagePlus size={13} color="#9B87B2" /><Text>Add photo</Text></Pressable><Text>Thoughtfully here for you</Text></View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Suggestion({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return <Pressable style={styles.suggestion} onPress={onPress}>{icon}<Text style={styles.suggestionText}>{label}</Text><ArrowUp size={15} color="#B0A1BE" /></Pressable>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 25 },
  heading: { marginTop: 15, marginBottom: 23 },
  eyebrow: { color: '#9A89B2', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  h1: { marginTop: 10, fontSize: 35, lineHeight: 41, fontWeight: '700', color: '#2B2733' },
  period: { color: '#8D67D9' },
  sub: { color: '#92909A', fontSize: 12.5, marginTop: 8 },
  empty: { alignItems: 'center', paddingTop: 35 },
  emptyOrb: { width: 114, height: 114, borderRadius: 34, backgroundColor: '#F2ECF8', alignItems: 'center', justifyContent: 'center', marginBottom: 17 },
  emptyTitle: { fontSize: 19, fontWeight: '700', color: '#38313F' },
  emptyText: { fontSize: 11, lineHeight: 17, color: '#99919F', textAlign: 'center', maxWidth: 220, marginVertical: 7 },
  suggestions: { width: '100%', gap: 9, marginTop: 20 },
  suggestion: { width: '100%', padding: 14, borderWidth: 1, borderColor: '#EFEAF0', borderRadius: 13, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', gap: 12 },
  suggestionText: { flex: 1, color: '#514A56', fontSize: 11, fontWeight: '700' },
  thread: { gap: 21, paddingBottom: 10 },
  message: { flexDirection: 'row', gap: 8 },
  userMessage: { justifyContent: 'flex-end' },
  chatAvatar: { width: 27, height: 27, borderRadius: 9, backgroundColor: '#7958B5', alignItems: 'center', justifyContent: 'center' },
  messageBody: { flex: 1, maxWidth: '90%', paddingTop: 2 },
  userBubble: { flex: 0, maxWidth: '82%', backgroundColor: '#EDE6F6', borderRadius: 15, padding: 12 },
  messageText: { fontSize: 11, lineHeight: 18, color: '#534E59' },
  responseActions: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  compose: { paddingHorizontal: 17, paddingTop: 9, paddingBottom: 8, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: '#EFEBED' },
  composeBox: { borderWidth: 1, borderColor: '#E8E1EC', backgroundColor: '#FFF', borderRadius: 15, padding: 6, paddingLeft: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  input: { flex: 1, minWidth: 0, fontSize: 12, color: '#332C3C' },
  send: { width: 31, height: 31, borderRadius: 10, backgroundColor: '#7854B4', alignItems: 'center', justifyContent: 'center' },
  hint: { marginTop: 8, marginHorizontal: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', color: '#B8B1BC' },
  photo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
