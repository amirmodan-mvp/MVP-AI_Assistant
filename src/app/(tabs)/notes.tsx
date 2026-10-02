import * as DocumentPicker from 'expo-document-picker';
import { ArrowRight, BookOpen, ChevronRight, FilePlus2, FileText, Sparkles, WandSparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { initialNotes } from '../../data/assistant';

export default function NotesScreen() {
  const [uploaded, setUploaded] = useState<string | null>(null);

  const upload = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (!result.canceled) setUploaded(result.assets[0].name);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heading}><Text style={styles.eyebrow}>THOUGHTS, ORGANIZED</Text><Text style={styles.h1}>Your notes<Text style={styles.period}>.</Text></Text><Text style={styles.sub}>A home for the things you don't want to forget.</Text></View>

      <View style={styles.feature}>
        <View style={styles.featureIcon}><FileText size={22} color="#906CC0" /></View>
        <Text style={styles.featureEyebrow}>SMART NOTES</Text>
        <Text style={styles.featureTitle}>From scattered thoughts{'\n'}to clear next steps.</Text>
        <Text style={styles.featureSub}>Let AI find the important bits for you.</Text>
        <View style={styles.deco}><Sparkles size={32} color="#A88BC9" /></View>
      </View>

      <View style={styles.section}><Text style={styles.sectionTitle}>Your space</Text><Pressable onPress={upload} style={styles.addFile}><Text>Add file</Text><ArrowRight size={15} color={Colors.purple}/></Pressable></View>

      {initialNotes.map(note => (
        <Pressable style={styles.noteCard} key={note.id}>
          <View style={[styles.noteIcon, note.tone === 'cream' && styles.cream]}>{note.tone === 'purple' ? <BookOpen size={21} color="#8661C3" /> : <WandSparkles size={21} color="#BA956E" />}</View>
          <View style={styles.noteInfo}><Text style={styles.noteTitle}>{note.title}</Text><Text style={styles.noteSub}>{note.subtitle}</Text><Text style={styles.noteMeta}>{note.meta}</Text></View>
          <ChevronRight size={18} color="#B9B0BC" />
        </Pressable>
      ))}

      {uploaded ? (
        <Pressable style={styles.noteCard}>
          <View style={[styles.noteIcon, styles.blue]}><FileText size={21} color="#7697C3" /></View>
          <View style={styles.noteInfo}><Text style={styles.noteTitle}>{uploaded}</Text><Text style={styles.noteSub}>Uploaded just now · Tap for sample summary</Text><Text style={styles.noteMeta}>YOUR FILE · JUST NOW</Text></View>
          <ChevronRight size={18} color="#B9B0BC" />
        </Pressable>
      ) : null}

      <Pressable style={styles.uploadCard} onPress={upload}>
        <View style={styles.uploadIcon}><FilePlus2 size={22} color="#946FC4" /></View>
        <Text style={styles.uploadTitle}>Have something to unpack?</Text>
        <Text style={styles.uploadSub}>Add a document or image to your space</Text>
        <View style={styles.uploadLink}><Text style={styles.uploadLinkText}>Upload a file</Text><ArrowRight size={15} color="#8660B8" /></View>
      </Pressable>
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
  feature: { backgroundColor: '#EDE6F5', borderRadius: 17, minHeight: 163, padding: 20, overflow: 'hidden' },
  featureIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  featureEyebrow: { color: '#9A89B2', fontSize: 10, fontWeight: '800', letterSpacing: 1.3 },
  featureTitle: { fontSize: 16, lineHeight: 22, fontWeight: '700', marginTop: 6, color: '#37303E' },
  featureSub: { color: '#9688A0', fontSize: 10, marginTop: 6 },
  deco: { position: 'absolute', right: -24, bottom: -41, width: 140, height: 140, borderRadius: 70, backgroundColor: '#DCCDEC', alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: 27, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#393341' },
  addFile: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  addFileText: { color: Colors.purple, fontSize: 11, fontWeight: '700' },
  noteCard: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0EDF0', borderRadius: 13, padding: 14, marginBottom: 9 },
  noteIcon: { width: 40, height: 40, borderRadius: 11, backgroundColor: '#F0E9FA', alignItems: 'center', justifyContent: 'center' },
  cream: { backgroundColor: '#F8F0E7' },
  blue: { backgroundColor: '#E8EFF8' },
  noteInfo: { flex: 1, gap: 4 },
  noteTitle: { fontSize: 11, fontWeight: '700', color: '#393341' },
  noteSub: { color: '#A49CA9', fontSize: 10 },
  noteMeta: { color: '#B3AAB8', fontSize: 8, fontWeight: '800', letterSpacing: .5 },
  uploadCard: { marginTop: 22, width: '100%', borderWidth: 1, borderStyle: 'dashed', borderColor: '#D8C9E7', borderRadius: 15, backgroundColor: '#FAF7FC', padding: 22, alignItems: 'center', gap: 7 },
  uploadIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEE5F6', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  uploadTitle: { fontSize: 12, fontWeight: '700' },
  uploadSub: { fontSize: 10, color: '#ACA2AF' },
  uploadLink: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  uploadLinkText: { color: '#8660B8', fontSize: 10, fontWeight: '700' },
});
