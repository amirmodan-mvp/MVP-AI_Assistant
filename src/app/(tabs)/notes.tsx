
import { useRouter } from 'expo-router';
import {
  BookOpen,
  ChevronRight,
  FileText,
  Pin,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useNotes } from '../../context/NotesContext';
import type { Note } from '../../types/note';

function formatEditedDate(date: string) {
  const edited = new Date(date);
  const now = new Date();

  if (Number.isNaN(edited.getTime())) return '';

  if (edited.toDateString() === now.toDateString()) {
    return 'Edited today';
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (edited.toDateString() === yesterday.toDateString()) {
    return 'Edited yesterday';
  }

  return `Edited ${edited.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`;
}

function NoteCard({
  note,
  onPress,
}: {
  note: Note;
  onPress: () => void;
}) {
  const preview = note.content.trim().replace(/\s+/g, ' ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open note ${note.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.noteCard,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.noteIcon,
          note.isPinned ? styles.pinnedIcon : undefined,
        ]}
      >
        {note.isPinned ? (
          <Pin size={20} color="#8661C3" />
        ) : (
          <FileText size={20} color="#8661C3" />
        )}
      </View>

      <View style={styles.noteInfo}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {note.title}
        </Text>

        <Text style={styles.noteSub} numberOfLines={2}>
          {preview || 'No additional text'}
        </Text>

        <Text style={styles.noteMeta}>
          {formatEditedDate(note.updatedAt)}
        </Text>
      </View>

      <ChevronRight size={18} color="#B9B0BC" />
    </Pressable>
  );
}

export default function NotesScreen() {
  const router = useRouter();
  const { notes, isLoaded, togglePin } = useNotes();
  const [search, setSearch] = useState('');

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...notes]
      .filter(note => {
        if (!query) return true;

        return (
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }

        return (
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
        );
      });
  }, [notes, search]);

  const openNote = (id?: string) => {
    router.push({
      pathname: '/(tabs)/note-editor',
      params: id ? { id } : {},
    });
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>THOUGHTS, ORGANIZED</Text>

        <View style={styles.titleRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.h1}>
              Your notes<Text style={styles.period}>.</Text>
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a new note"
            onPress={() => openNote()}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
            ]}
          >
            <Plus size={23} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={styles.sub}>
          A home for the things you don't want to forget.
        </Text>
      </View>

      <View style={styles.feature}>
        <View style={styles.featureIcon}>
          <BookOpen size={22} color="#906CC0" />
        </View>

        <Text style={styles.featureEyebrow}>YOUR PERSONAL SPACE</Text>

        <Text style={styles.featureTitle}>
          From scattered thoughts{'\n'}to clear next steps.
        </Text>

        <Text style={styles.featureSub}>
          Capture an idea now. Find it whenever you need it.
        </Text>

        <View pointerEvents="none" style={styles.deco}>
          <Sparkles size={32} color="#A88BC9" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your space</Text>

        <Text style={styles.count}>
          {search.trim()
            ? `${filteredNotes.length} ${filteredNotes.length === 1 ? 'result' : 'results'
            }`
            : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`}
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Search size={17} color="#A49CA9" />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search your notes..."
          placeholderTextColor="#A49CA9"
          returnKeyType="search"
          style={styles.searchInput}
          accessibilityLabel="Search notes"
        />
        {search.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setSearch('')}
            hitSlop={10}
            style={styles.clearSearchButton}
          >
            <X size={16} color="#928A97" />
          </Pressable>
        )}
      </View>

      {!isLoaded ? (
        <View style={styles.state}>
          <ActivityIndicator color={Colors.purple} />
          <Text style={styles.stateText}>Loading your notes...</Text>
        </View>
      ) : filteredNotes.length > 0 ? (
        <View style={styles.noteList}>
          {filteredNotes.map(note => (
            <View key={note.id}>
              <NoteCard
                note={note}
                onPress={() => openNote(note.id)}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  note.isPinned
                    ? `Unpin ${note.title}`
                    : `Pin ${note.title}`
                }
                onPress={() => togglePin(note.id)}
                style={styles.pinAction}
              >
                <Pin
                  size={12}
                  color={note.isPinned ? '#8661C3' : '#A49CA9'}
                />
                <Text
                  style={[
                    styles.pinText,
                    note.isPinned && styles.pinTextActive,
                  ]}
                >
                  {note.isPinned ? 'Pinned' : 'Pin note'}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            {search.trim() ? (
              <Search size={25} color="#906CC0" />
            ) : (
              <FileText size={25} color="#906CC0" />
            )}
          </View>

          <Text style={styles.emptyTitle}>
            {search.trim() ? 'No notes found' : 'Start with a thought'}
          </Text>

          <Text style={styles.emptyText}>
            {search.trim()
              ? 'Try another search term.'
              : 'Capture an idea, make a quick plan, or write down something to remember.'}
          </Text>

          {!search.trim() && (
            <Pressable
              onPress={() => openNote()}
              style={({ pressed }) => [
                styles.createButton,
                pressed && styles.pressed,
              ]}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create your first note</Text>
            </Pressable>
          )}
        </View>
      )}

      <Pressable
        onPress={() => openNote()}
        style={({ pressed }) => [
          styles.newNoteCard,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.newNoteIcon}>
          <Plus size={21} color="#946FC4" />
        </View>

        <View style={styles.newNoteInfo}>
          <Text style={styles.newNoteTitle}>A thought worth keeping?</Text>
          <Text style={styles.newNoteSub}>
            Create a note in seconds.
          </Text>
        </View>

        <ChevronRight size={18} color="#B9B0BC" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 35,
  },
  heading: {
    marginTop: 15,
    marginBottom: 23,
  },
  eyebrow: {
    color: '#9A89B2',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },
  titleWrap: {
    flex: 1,
  },
  h1: {
    fontSize: 35,
    lineHeight: 43,
    fontWeight: '700',
    color: '#2B2733',
  },
  period: {
    color: '#8D67D9',
  },
  sub: {
    color: '#92909A',
    fontSize: 12.5,
    marginTop: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  feature: {
    backgroundColor: '#EDE6F5',
    borderRadius: 17,
    minHeight: 163,
    padding: 20,
    overflow: 'hidden',
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  featureEyebrow: {
    color: '#9A89B2',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  featureTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    marginTop: 6,
    color: '#37303E',
  },
  featureSub: {
    color: '#81748B',
    fontSize: 10,
    marginTop: 6,
    maxWidth: '90%',
  },
  deco: {
    position: 'absolute',
    right: -24,
    bottom: -41,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#DCCDEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: 27,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#393341',
  },
  count: {
    fontSize: 11,
    color: '#A49CA9',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0EDF0',
    borderRadius: 12,
    paddingHorizontal: 13,
    minHeight: 44,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#393341',
    fontSize: 12,
  },
  clearSearchButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  noteList: {
    gap: 3,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0EDF0',
    borderRadius: 13,
    padding: 14,
  },
  noteIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#F0E9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedIcon: {
    backgroundColor: '#EDE5F7',
  },
  noteInfo: {
    flex: 1,
    gap: 4,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#393341',
  },
  noteSub: {
    color: '#928A97',
    fontSize: 10,
    lineHeight: 15,
  },
  noteMeta: {
    color: '#B3AAB8',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  pinAction: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    paddingHorizontal: 9,
    paddingTop: 7,
    paddingBottom: 10,
  },
  pinText: {
    fontSize: 10,
    color: '#A49CA9',
  },
  pinTextActive: {
    color: '#8661C3',
    fontWeight: '700',
  },
  state: {
    alignItems: 'center',
    paddingVertical: 35,
    gap: 10,
  },
  stateText: {
    color: '#928A97',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0EDF0',
    borderRadius: 15,
    padding: 24,
    marginTop: 2,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#F0E9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  emptyTitle: {
    color: '#393341',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    color: '#928A97',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 7,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.purple,
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 17,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  newNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginTop: 20,
    width: '100%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D8C9E7',
    borderRadius: 15,
    backgroundColor: '#FAF7FC',
    padding: 17,
  },
  newNoteIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEE5F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newNoteInfo: {
    flex: 1,
    gap: 5,
  },
  newNoteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#393341',
  },
  newNoteSub: {
    fontSize: 10,
    color: '#928A97',
  },
  pressed: {
    opacity: 0.75,
  },
});