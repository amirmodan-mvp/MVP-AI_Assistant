
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import type {
    CreateNoteInput,
    Note,
    UpdateNoteInput,
} from '../types/note';

const NOTES_STORAGE_KEY = '@mvp-ai/notes';

type NotesContextValue = {
  notes: Note[];
  isLoaded: boolean;
  addNote: (input: CreateNoteInput) => Note;
  updateNote: (id: string, input: UpdateNoteInput) => void;
  removeNote: (id: string) => void;
  togglePin: (id: string) => void;
  getNote: (id: string) => Note | undefined;
};

const NotesContext = createContext<NotesContextValue | undefined>(
  undefined,
);

function isNote(value: unknown): value is Note {
  if (!value || typeof value !== 'object') return false;

  const note = value as Partial<Note>;

  return (
    typeof note.id === 'string' &&
    typeof note.title === 'string' &&
    typeof note.content === 'string' &&
    typeof note.createdAt === 'string' &&
    typeof note.updatedAt === 'string' &&
    typeof note.isPinned === 'boolean'
  );
}

export function NotesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadNotes() {
      try {
        const stored = await AsyncStorage.getItem(
          NOTES_STORAGE_KEY,
        );

        if (!mounted) return;

        if (stored !== null) {
          const parsed: unknown = JSON.parse(stored);

          if (Array.isArray(parsed) && parsed.every(isNote)) {
            setNotes(parsed);
          } else {
            setNotes([]);
          }
        }
      } catch (error) {
        console.warn('Failed to load notes:', error);
      } finally {
        if (mounted) {
          setIsLoaded(true);
        }
      }
    }

    void loadNotes();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const saveNotes = async () => {
      try {
        await AsyncStorage.setItem(
          NOTES_STORAGE_KEY,
          JSON.stringify(notes),
        );
      } catch (error) {
        console.warn('Failed to save notes:', error);
      }
    };

    void saveNotes();
  }, [notes, isLoaded]);

  const addNote = useCallback(
    ({ title, content }: CreateNoteInput): Note => {
      const now = new Date().toISOString();

      const note: Note = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim() || 'Untitled note',
        content,
        createdAt: now,
        updatedAt: now,
        isPinned: false,
      };

      setNotes(current => [note, ...current]);

      return note;
    },
    [],
  );

  const updateNote = useCallback(
    (id: string, input: UpdateNoteInput) => {
      setNotes(current =>
        current.map(note =>
          note.id === id
            ? {
                ...note,
                ...(input.title !== undefined
                  ? { title: input.title.trim() || 'Untitled note' }
                  : {}),
                ...(input.content !== undefined
                  ? { content: input.content }
                  : {}),
                updatedAt: new Date().toISOString(),
              }
            : note,
        ),
      );
    },
    [],
  );

  const removeNote = useCallback((id: string) => {
    setNotes(current =>
      current.filter(note => note.id !== id),
    );
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotes(current =>
      current.map(note =>
        note.id === id
          ? { ...note, isPinned: !note.isPinned }
          : note,
      ),
    );
  }, []);

  const getNote = useCallback(
    (id: string) => notes.find(note => note.id === id),
    [notes],
  );

  return (
    <NotesContext.Provider
      value={{
        notes,
        isLoaded,
        addNote,
        updateNote,
        removeNote,
        togglePin,
        getNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);

  if (!context) {
    throw new Error('useNotes must be used inside a NotesProvider');
  }

  return context;
}