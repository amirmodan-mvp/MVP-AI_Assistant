
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    Check,
    CheckSquare,
    ListTodo,
    Sparkles,
    Trash2,
    WandSparkles,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
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
import { useTasks } from '../../context/TaskContext';

type ToolMode = 'summary' | 'rewrite' | 'tasks' | null;

function summarizeText(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, ' ');

  if (!cleaned) return '';

  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [
    cleaned,
  ];

  if (sentences.length <= 3) {
    return sentences.map(sentence => sentence.trim()).join(' ');
  }

  const selected = sentences.slice(0, 3);
  const summary = selected.map(sentence => sentence.trim()).join(' ');

  return summary.length > 500
    ? `${summary.slice(0, 497).trimEnd()}...`
    : summary;
}

function improveWriting(text: string): string {
  return text
    .split('\n')
    .map(line =>
      line
        .replace(/[ \t]+/g, ' ')
        .replace(/\s+([,.!?;:])/g, '$1')
        .trim(),
    )
    .join('\n')
    .replace(/([.!?]){2,}/g, '$1')
    .replace(/([.!?]\s+)([a-z])/g, (_, punctuation, letter: string) =>
      `${punctuation}${letter.toUpperCase()}`,
    )
    .trim();
}

function extractTasks(text: string): string[] {
  const actionWords =
    /\b(need to|have to|must|should|remember to|todo|to-do|follow up|follow-up|call|email|send|finish|complete|schedule|book|buy|pick up|prepare|review|submit|create|update|fix|ask|contact|pay|research|write|read|organize|cancel|confirm|discuss|check|make|start|plan)\b/i;

  const candidates = text
    .split('\n')
    .map(line =>
      line
        .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '')
        .trim(),
    )
    .filter(line => line.length >= 3 && actionWords.test(line))
    .map(line =>
      line
        .replace(/^(?:i need to|i have to|i should|remember to)\s+/i, '')
        .replace(/[.!?]+$/, '')
        .trim(),
    )
    .filter(Boolean);

  return [...new Set(candidates)].slice(0, 12);
}

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

  const { addTask } = useTasks();

  const noteId = typeof id === 'string' ? id : undefined;
  const note = noteId ? getNote(noteId) : undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [initialized, setInitialized] = useState(false);

  const [activeTool, setActiveTool] = useState<ToolMode>(null);
  const [toolResult, setToolResult] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [tasksAdded, setTasksAdded] = useState(false);

  const extractedTasks = useMemo(
    () => extractTasks(content),
    [content],
  );

  useEffect(() => {
    if (!isLoaded || initialized) return;

    if (noteId && !note) {
      Alert.alert(
        'Note not found',
        'This note may have been deleted.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/notes'),
          },
        ],
      );
      return;
    }

    if (note) {
      setTitle(note.title === 'Untitled note' ? '' : note.title);
      setContent(note.content);
    }

    setInitialized(true);
  }, [isLoaded, initialized, noteId, note, router]);

  useEffect(() => {
    setToolResult('');
    setSelectedTasks([]);
    setTasksAdded(false);
  }, [content]);

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

  const openTool = (mode: Exclude<ToolMode, null>) => {
    if (!content.trim()) {
      Alert.alert(
        'Add some text first',
        'Write a little in your note before using this tool.',
      );
      return;
    }

    setActiveTool(mode);
    setToolResult('');
    setSelectedTasks([]);
    setTasksAdded(false);

    if (mode === 'summary') {
      setToolResult(summarizeText(content));
    } else if (mode === 'rewrite') {
      setToolResult(improveWriting(content));
    } else {
      const tasks = extractTasks(content);
      setSelectedTasks(tasks);
    }
  };

  const applyRewrite = () => {
    if (!toolResult.trim()) return;

    Alert.alert(
      'Replace note text?',
      'Your current note text will be replaced with this cleaned-up version.',
      [
        { text: 'Keep original', style: 'cancel' },
        {
          text: 'Replace text',
          onPress: () => {
            setContent(toolResult);
            setActiveTool(null);
            setToolResult('');
          },
        },
      ],
    );
  };

  const toggleSelectedTask = (task: string) => {
    setSelectedTasks(current =>
      current.includes(task)
        ? current.filter(item => item !== task)
        : [...current, task],
    );
  };

  const addSelectedTasks = () => {
    if (selectedTasks.length === 0) {
      Alert.alert(
        'Select tasks',
        'Choose at least one task to add.',
      );
      return;
    }

    selectedTasks.forEach(task => {
      addTask({ title: task });
    });

    setTasksAdded(true);

    Alert.alert(
      'Tasks added',
      `Added ${selectedTasks.length} ${
        selectedTasks.length === 1 ? 'task' : 'tasks'
      } to your Tasks list.`,
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

        <View style={styles.aiSection}>
          <View style={styles.aiHeading}>
            <View style={styles.aiIcon}>
              <Sparkles size={17} color={Colors.purple} />
            </View>
            <View style={styles.aiHeadingText}>
              <Text style={styles.aiTitle}>Note assistant</Text>
              <Text style={styles.aiSubtitle}>
                Quick tools for your writing
              </Text>
            </View>
          </View>

          <View style={styles.toolButtons}>
            <Pressable
              accessibilityRole="button"
              onPress={() => openTool('summary')}
              style={({ pressed }) => [
                styles.toolButton,
                pressed && styles.pressed,
              ]}
            >
              <ListTodo size={17} color={Colors.purple} />
              <Text style={styles.toolButtonText}>Summarize</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => openTool('rewrite')}
              style={({ pressed }) => [
                styles.toolButton,
                pressed && styles.pressed,
              ]}
            >
              <WandSparkles size={17} color={Colors.purple} />
              <Text style={styles.toolButtonText}>Improve writing</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => openTool('tasks')}
              style={({ pressed }) => [
                styles.toolButton,
                pressed && styles.pressed,
              ]}
            >
              <CheckSquare size={17} color={Colors.purple} />
              <Text style={styles.toolButtonText}>Extract tasks</Text>
            </Pressable>
          </View>

          {activeTool === 'summary' && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Quick summary</Text>
              <Text style={styles.resultText}>{toolResult}</Text>
              <Text style={styles.resultHint}>
                This selects the opening sentences; it does not generate
                a new AI-written summary.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setActiveTool(null)}
                style={styles.dismissButton}
              >
                <Text style={styles.dismissText}>Close</Text>
              </Pressable>
            </View>
          )}

          {activeTool === 'rewrite' && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Review cleaned-up text</Text>
              <Text style={styles.resultText}>
                {toolResult || 'No text to improve.'}
              </Text>
              <Text style={styles.resultHint}>
                This applies basic spacing and punctuation cleanup.
                Review the result before replacing your original text.
              </Text>
              <View style={styles.resultActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setActiveTool(null)}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={applyRewrite}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>
                    Replace text
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {activeTool === 'tasks' && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Possible tasks</Text>
              <Text style={styles.resultHint}>
                Select the items you want to add to your Tasks list.
              </Text>

              {extractedTasks.length === 0 ? (
                <Text style={styles.emptyTasksText}>
                  No obvious action items found. Try writing tasks as
                  bullet points or including action words such as
                  “call,” “finish,” or “schedule.”
                </Text>
              ) : (
                extractedTasks.map((task, index) => {
                  const selected = selectedTasks.includes(task);

                  return (
                    <Pressable
                      key={`${task}-${index}`}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      onPress={() => toggleSelectedTask(task)}
                      style={styles.taskChoice}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          selected && styles.checkboxSelected,
                        ]}
                      >
                        {selected && (
                          <Check size={13} color="#FFFFFF" />
                        )}
                      </View>
                      <Text style={styles.taskChoiceText}>{task}</Text>
                    </Pressable>
                  );
                })
              )}

              {extractedTasks.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  disabled={tasksAdded}
                  onPress={addSelectedTasks}
                  style={[
                    styles.primaryButton,
                    styles.addTasksButton,
                    tasksAdded && styles.disabledButton,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {tasksAdded
                      ? 'Tasks added'
                      : `Add selected (${selectedTasks.length})`}
                  </Text>
                </Pressable>
              )}

              <Pressable
                accessibilityRole="button"
                onPress={() => setActiveTool(null)}
                style={styles.dismissButton}
              >
                <Text style={styles.dismissText}>Close</Text>
              </Pressable>
            </View>
          )}
        </View>

        {noteId && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete note"
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
  aiSection: {
    marginTop: 30,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEE8F2',
  },
  aiHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2ECFA',
  },
  aiHeadingText: {
    marginLeft: 10,
    flex: 1,
  },
  aiTitle: {
    color: '#393341',
    fontSize: 14,
    fontWeight: '700',
  },
  aiSubtitle: {
    color: '#928A97',
    fontSize: 11,
    marginTop: 3,
  },
  toolButtons: {
    gap: 9,
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 13,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE8F2',
    backgroundColor: '#FDFBFF',
  },
  toolButtonText: {
    color: '#45394D',
    fontSize: 12,
    fontWeight: '600',
  },
  resultCard: {
    marginTop: 15,
    padding: 14,
    borderRadius: 13,
    backgroundColor: '#F8F5FC',
    borderWidth: 1,
    borderColor: '#E9DFF3',
  },
  resultTitle: {
    color: '#393341',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 9,
  },
  resultText: {
    color: '#514A57',
    fontSize: 13,
    lineHeight: 21,
  },
  resultHint: {
    color: '#928A97',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 15,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DCEC',
  },
  secondaryButtonText: {
    color: '#5A4A64',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.purple,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addTasksButton: {
    marginTop: 14,
  },
  disabledButton: {
    opacity: 0.65,
  },
  dismissButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    marginTop: 3,
  },
  dismissText: {
    color: Colors.purple,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyTasksText: {
    color: '#716878',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },
  taskChoice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#C9B9D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxSelected: {
    backgroundColor: Colors.purple,
    borderColor: Colors.purple,
  },
  taskChoiceText: {
    flex: 1,
    color: '#514A57',
    fontSize: 12,
    lineHeight: 19,
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