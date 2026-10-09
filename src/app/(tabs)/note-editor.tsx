
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useNotes } from '../../context/NotesContext';

export default function NoteEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const {
    isLoaded,
    getNote,
    addNote,
    updateNote,
    removeNote,
  } = useNotes();

  const noteId = typeof id === 'string' ? id : undefined;
  const note = noteId ? getNote(noteId) : undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isLoaded || initialized) return;

    if (noteId && !note) {
      Alert.alert(
        'Note not found',
        'This note may have been deleted.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/notes') }],
      );
      return;
    }

    if (note) {
      setTitle(note.title === 'Untitled note' ? '' : note.title);
      setContent(note.content);
    }

    setInitialized(true);
  }, [isLoaded, initialized, noteId, note, router]);

  const goBack = () => {
    router.replace('/(tabs)/notes');
  };

  const save = () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert(
        'Empty note',
        'Add a title or some text before saving.',
      );
      return;
    }

    if (noteId) {
      updateNote(noteId, {
        title: title.trim() || 'Untitled note',
        content,
      });
    } else {
      addNote({
        title: title.trim() || 'Untitled note',
        content,
      });
    }

    goBack();
  };

  const confirmDelete = () => {
    if (!noteId || !note) return;

    Alert.alert(
      'Delete note?',
      'This note will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeNote(noteId);
            goBack();
          },
        },
      ],
    );
  };

  if (!isLoaded || !initialized) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Opening your note...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to notes"
          onPress={goBack}
          hitSlop={10}
          style={styles.headerButton}
        >
          <ArrowLeft size={21} color="#393341" />
        </Pressable>

        <Text style={styles.headerTitle}>
          {noteId ? 'Edit note' : 'New note'}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save note"
          onPress={save}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressed,
          ]}
        >
          <Check size={17} color="#FFFFFF" />
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.editor}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>
          {noteId ? 'YOUR NOTE' : 'CAPTURE A THOUGHT'}
        </Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Give your note a title"
          placeholderTextColor="#B4ACB9"
          style={styles.titleInput}
          maxLength={120}
          accessibilityLabel="Note title"
          returnKeyType="next"
          multiline
        />

        <View style={styles.divider} />

        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Start writing what's on your mind..."
          placeholderTextColor="#B4ACB9"
          style={styles.contentInput}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Note content"
          scrollEnabled={false}
        />

        <Text style={styles.footerHint}>
          Your thoughts, in your own words.
        </Text>

        {noteId && (
          <Pressable
            accessibilityRole="button"
            onPress={confirmDelete}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.pressed,
            ]}
          >
            <Trash2 size={17} color="#C65B65" />
            <Text style={styles.deleteText}>Delete note</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#928A97',
    fontSize: 13,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDF0',
  },
  headerButton: {
    width: 38,
    height: 38,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    marginLeft: 7,
    fontSize: 15,
    fontWeight: '700',
    color: '#393341',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: Colors.purple,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  editor: {
    paddingHorizontal: 24,
    paddingTop: 27,
    paddingBottom: 50,
    flexGrow: 1,
  },
  eyebrow: {
    color: '#9A89B2',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 14,
  },
  titleInput: {
    color: '#2B2733',
    fontSize: 25,
    lineHeight: 33,
    fontWeight: '700',
    paddingVertical: 8,
    minHeight: 48,
  },
  divider: {
    height: 1,
    backgroundColor: '#EAE5EC',
    marginTop: 13,
    marginBottom: 18,
  },
  contentInput: {
    color: '#514A57',
    fontSize: 15,
    lineHeight: 25,
    padding: 0,
    minHeight: 250,
  },
  footerHint: {
    color: '#B4ACB9',
    fontSize: 11,
    marginTop: 22,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F0D9DC',
    backgroundColor: '#FFF8F8',
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 35,
  },
  deleteText: {
    color: '#C65B65',
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});