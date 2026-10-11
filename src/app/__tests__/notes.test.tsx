import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import NotesScreen from '../(tabs)/notes';
import { useNotes } from '../../context/NotesContext';
import type { Note } from '../../types/note';

jest.mock('lucide-react-native', () => ({
  BookOpen: () => null,
  ChevronRight: () => null,
  FileText: () => null,
  Pin: () => null,
  Plus: () => null,
  Search: () => null,
  Sparkles: () => null,
  X: () => null,
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../context/NotesContext', () => ({
  useNotes: jest.fn(),
}));

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Project ideas',
    content: 'Plan the next app release',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-02T10:00:00.000Z',
    isPinned: true,
  },
  {
    id: '2',
    title: 'Shopping list',
    content: 'Milk, eggs, and bread',
    createdAt: '2026-10-01T11:00:00.000Z',
    updatedAt: '2026-10-01T11:00:00.000Z',
    isPinned: false,
  },
];

const mockAddNote = jest.fn();
const mockUpdateNote = jest.fn();
const mockRemoveNote = jest.fn();
const mockTogglePin = jest.fn();
const mockGetNote = jest.fn();
const mockPush = jest.fn();
const mockNavigate = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockSetParams = jest.fn();
const mockCanGoBack = jest.fn(() => true);

const mockedUseNotes = jest.mocked(useNotes);
const mockedUseRouter = jest.mocked(useRouter);

function renderNotes(notes: Note[] = mockNotes, isLoaded = true) {
  mockedUseNotes.mockReturnValue({
    notes,
    isLoaded,
    addNote: mockAddNote,
    updateNote: mockUpdateNote,
    removeNote: mockRemoveNote,
    togglePin: mockTogglePin,
    getNote: mockGetNote,
  } as unknown as ReturnType<typeof useNotes>);

  mockedUseRouter.mockReturnValue({
    push: mockPush,
    navigate: mockNavigate,
    back: mockBack,
    replace: mockReplace,
    setParams: mockSetParams,
    canGoBack: mockCanGoBack,
  } as unknown as ReturnType<typeof useRouter>);

  return render(<NotesScreen />);
}

describe('NotesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Notes screen heading', () => {
    renderNotes();

    expect(screen.getByText('Your notes.')).toBeTruthy();
  });

  it('renders existing notes', () => {
    renderNotes();

    expect(screen.getByText('Project ideas')).toBeTruthy();
    expect(screen.getByText('Shopping list')).toBeTruthy();
  });

  it('renders the search input', () => {
    renderNotes();

    expect(
      screen.getByPlaceholderText('Search your notes...'),
    ).toBeTruthy();
  });

  it('filters notes by title', () => {
    renderNotes();

    fireEvent.changeText(
      screen.getByPlaceholderText('Search your notes...'),
      'shopping',
    );

    expect(screen.getByText('Shopping list')).toBeTruthy();
    expect(screen.queryByText('Project ideas')).toBeNull();
  });

  it('filters notes by content', () => {
    renderNotes();

    fireEvent.changeText(
      screen.getByPlaceholderText('Search your notes...'),
      'next app release',
    );

    expect(screen.getByText('Project ideas')).toBeTruthy();
    expect(screen.queryByText('Shopping list')).toBeNull();
  });

  it('filters notes without case sensitivity', () => {
    renderNotes();

    fireEvent.changeText(
      screen.getByPlaceholderText('Search your notes...'),
      'SHOPPING',
    );

    expect(screen.getByText('Shopping list')).toBeTruthy();
    expect(screen.queryByText('Project ideas')).toBeNull();
  });

  it('shows the empty state when there are no notes', () => {
    renderNotes([]);

    expect(screen.getByText('Start with a thought')).toBeTruthy();
    expect(screen.getByText('Create your first note')).toBeTruthy();
  });

  it('keeps the screen heading visible while notes are loading', () => {
    renderNotes([], false);

    expect(screen.getByText('Your notes.')).toBeTruthy();
  });

  it('shows the current note count', () => {
    renderNotes();

    expect(screen.getByText('2 notes')).toBeTruthy();
  });

  it('shows a singular count when there is one note', () => {
    renderNotes([mockNotes[0]]);

    expect(screen.getByText('1 note')).toBeTruthy();
  });

  it('opens a note when its card is pressed', () => {
    renderNotes();

    fireEvent.press(
      screen.getByLabelText('Open note Project ideas'),
    );

    expect(mockPush).toHaveBeenCalled();
  });

  it('opens the new-note screen when the create button is pressed', () => {
    renderNotes();

    fireEvent.press(
      screen.getByLabelText('Create a new note'),
    );

    expect(mockPush).toHaveBeenCalled();
  });

  it('toggles the pin state when the pin control is pressed', () => {
    renderNotes();

    fireEvent.press(
      screen.getByLabelText('Pin Shopping list'),
    );

    expect(mockTogglePin).toHaveBeenCalledWith('2');
  });

  it('provides a create-note action when there are no notes', () => {
    renderNotes([]);

    fireEvent.press(screen.getByText('Create your first note'));

    expect(mockPush).toHaveBeenCalled();
  });
});