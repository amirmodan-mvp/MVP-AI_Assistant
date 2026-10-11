import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    fireEvent,
    render,
    waitFor,
} from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';
import { NotesProvider, useNotes } from '../NotesContext';

jest.mock('@react-native-async-storage/async-storage', () => {
    let store: Record<string, string> = {};

    return {
        __esModule: true,
        default: {
            getItem: jest.fn(async (key: string) => store[key] ?? null),
            setItem: jest.fn(async (key: string, value: string) => {
                store[key] = value;
            }),
            removeItem: jest.fn(async (key: string) => {
                delete store[key];
            }),
            clear: jest.fn(async () => {
                store = {};
            }),
            getAllKeys: jest.fn(async () => Object.keys(store)),
            multiGet: jest.fn(async (keys: string[]) =>
                keys.map((key) => [key, store[key] ?? null]),
            ),
            multiSet: jest.fn(async (entries: [string, string][]) => {
                entries.forEach(([key, value]) => {
                    store[key] = value;
                });
            }),
            multiRemove: jest.fn(async (keys: string[]) => {
                keys.forEach((key) => {
                    delete store[key];
                });
            }),
        },
    };
});

function NotesTestConsumer() {
    const {
        notes,
        isLoaded,
        addNote,
        updateNote,
        removeNote,
        togglePin,
    } = useNotes();

    const firstNote = notes[0];

    return (<View> <Text testID="loaded">{String(isLoaded)}</Text> <Text testID="notes">{JSON.stringify(notes)}</Text>


        <Pressable
            testID="add-note"
            onPress={() =>
                addNote({
                    title: 'My first note',
                    content: 'Remember to test Notes.',
                })
            }
        >
            <Text>Add note</Text>
        </Pressable>

        <Pressable
            testID="update-note"
            onPress={() => {
                if (!firstNote) return;

                updateNote(firstNote.id, {
                    title: 'Updated note',
                    content: 'Updated content.',
                });
            }}
        >
            <Text>Update note</Text>
        </Pressable>

        <Pressable
            testID="toggle-pin"
            onPress={() => {
                if (firstNote) togglePin(firstNote.id);
            }}
        >
            <Text>Toggle pin</Text>
        </Pressable>

        <Pressable
            testID="delete-note"
            onPress={() => {
                if (firstNote) removeNote(firstNote.id);
            }}
        >
            <Text>Delete note</Text>
        </Pressable>
    </View>


    );
}

function renderNotes() {
    return render(<NotesProvider> <NotesTestConsumer /> </NotesProvider>,
    );
}

describe('NotesContext', () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
        jest.clearAllMocks();
    });

    it('loads and reports that notes are ready', async () => {
        const { getByTestId } = renderNotes();


        await waitFor(() => {
            expect(getByTestId('loaded').props.children).toBe('true');
        });

        expect(JSON.parse(getByTestId('notes').props.children)).toEqual([]);


    });

    it('creates a note with an ID, timestamps, and an unpinned state', async () => {
        const { getByTestId } = renderNotes();


        await waitFor(() => {
            expect(getByTestId('loaded').props.children).toBe('true');
        });

        fireEvent.press(getByTestId('add-note'));

        await waitFor(() => {
            const notes = JSON.parse(getByTestId('notes').props.children);

            expect(notes).toHaveLength(1);
            expect(notes[0]).toEqual(
                expect.objectContaining({
                    title: 'My first note',
                    content: 'Remember to test Notes.',
                    isPinned: false,
                }),
            );
            expect(typeof notes[0].id).toBe('string');
            expect(notes[0].id.length).toBeGreaterThan(0);
            expect(Number.isNaN(Date.parse(notes[0].createdAt))).toBe(false);
            expect(Number.isNaN(Date.parse(notes[0].updatedAt))).toBe(false);
        });


    });

    it('updates a note title and content', async () => {
        const { getByTestId } = renderNotes();


        await waitFor(() => {
            expect(getByTestId('loaded').props.children).toBe('true');
        });

        fireEvent.press(getByTestId('add-note'));

        await waitFor(() => {
            expect(
                JSON.parse(getByTestId('notes').props.children),
            ).toHaveLength(1);
        });

        fireEvent.press(getByTestId('update-note'));

        await waitFor(() => {
            const notes = JSON.parse(getByTestId('notes').props.children);

            expect(notes[0].title).toBe('Updated note');
            expect(notes[0].content).toBe('Updated content.');
        });


    });

    it('toggles the pinned state on and off', async () => {
        const { getByTestId } = renderNotes();


        await waitFor(() => {
            expect(getByTestId('loaded').props.children).toBe('true');
        });

        fireEvent.press(getByTestId('add-note'));

        await waitFor(() => {
            expect(
                JSON.parse(getByTestId('notes').props.children),
            ).toHaveLength(1);
        });

        fireEvent.press(getByTestId('toggle-pin'));

        await waitFor(() => {
            expect(
                JSON.parse(getByTestId('notes').props.children)[0].isPinned,
            ).toBe(true);
        });

        fireEvent.press(getByTestId('toggle-pin'));

        await waitFor(() => {
            expect(
                JSON.parse(getByTestId('notes').props.children)[0].isPinned,
            ).toBe(false);
        });


    });

    it('deletes a note', async () => {
        const { getByTestId } = renderNotes();


        await waitFor(() => {
            expect(getByTestId('loaded').props.children).toBe('true');
        });

        fireEvent.press(getByTestId('add-note'));

        await waitFor(() => {
            expect(
                JSON.parse(getByTestId('notes').props.children),
            ).toHaveLength(1);
        });

        fireEvent.press(getByTestId('delete-note'));

        await waitFor(() => {
            expect(JSON.parse(getByTestId('notes').props.children)).toEqual([]);
        });


    });

    it('persists created notes to AsyncStorage', async () => {
        const { getByTestId } = renderNotes();


        await waitFor(() => {
            expect(getByTestId('loaded').props.children).toBe('true');
        });

        fireEvent.press(getByTestId('add-note'));

        await waitFor(async () => {
            const stored = await AsyncStorage.getItem('@mvp-ai/notes');
            const notes = stored ? JSON.parse(stored) : [];

            expect(notes).toHaveLength(1);
            expect(notes[0].title).toBe('My first note');
        });


    });

    it('loads existing notes from AsyncStorage', async () => {
        const savedNotes = [
            {
                id: 'saved-note-1',
                title: 'Saved note',
                content: 'This note was saved previously.',
                createdAt: '2026-10-01T10:00:00.000Z',
                updatedAt: '2026-10-02T10:00:00.000Z',
                isPinned: true,
            },
        ];


        await AsyncStorage.setItem(
            '@mvp-ai/notes',
            JSON.stringify(savedNotes),
        );

        const { getByTestId } = renderNotes();

        await waitFor(() => {
            expect(getByTestId('loaded').props.children).toBe('true');
            expect(JSON.parse(getByTestId('notes').props.children)).toEqual(
                savedNotes,
            );
        });


    });
});

describe('useNotes', () => {
    it('throws when used outside NotesProvider', () => {
        function InvalidConsumer() {
            useNotes();
            return null;
        }

        expect(() => render(<InvalidConsumer />)).toThrow(
            'useNotes must be used inside a NotesProvider',
        );

    });
});
