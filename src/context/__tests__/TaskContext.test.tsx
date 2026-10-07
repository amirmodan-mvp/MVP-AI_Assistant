import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';
import {
    TaskProvider,
    useTasks,
} from '../TaskContext';

jest.mock(
  '@react-native-async-storage/async-storage',
  () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
  }),
);

const mockedAsyncStorage =
  AsyncStorage as jest.Mocked<typeof AsyncStorage>;

function TestConsumer() {
  const {
    tasks,
    addTask,
    updateTask,
    toggleTask,
    removeTask,
  } = useTasks();

  return (
    <>
      <Text testID="task-count">
        {tasks.length}
      </Text>

      <Text testID="task-title">
        {tasks[0]?.title ?? ''}
      </Text>

      <Text testID="task-time">
        {tasks[0]?.time ?? ''}
      </Text>

      <Text testID="task-due">
        {tasks[0]?.due ?? ''}
      </Text>

      <Text testID="task-done">
        {String(tasks[0]?.done ?? false)}
      </Text>

      <Pressable
        testID="add-task"
        onPress={() =>
          addTask({
            title: 'New task',
            due: 'Tomorrow',
            time: '9:00 AM',
            category: 'Work',
          })
        }
      />

      <Pressable
        testID="update-task"
        onPress={() =>
          updateTask(tasks[0]?.id ?? 0, {
            title: 'Updated task',
            due: 'Tomorrow',
            time: '4:00 PM',
          })
        }
      />

      <Pressable
        testID="toggle-task"
        onPress={() =>
          toggleTask(tasks[0]?.id ?? 0)
        }
      />

      <Pressable
        testID="remove-task"
        onPress={() =>
          removeTask(tasks[0]?.id ?? 0)
        }
      />
    </>
  );
}

function renderProvider(
  children: ReactNode = <TestConsumer />,
) {
  return render(
    <TaskProvider>
      {children}
    </TaskProvider>,
  );
}

describe('TaskContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedAsyncStorage.getItem.mockResolvedValue(
      null,
    );

    mockedAsyncStorage.setItem.mockResolvedValue(
      undefined,
    );
  });

  it('loads initial tasks when nothing is stored', async () => {
    renderProvider();

    await waitFor(() => {
      expect(
        Number(
          screen.getByTestId('task-count').props
            .children,
        ),
      ).toBeGreaterThan(0);
    });

    expect(
      mockedAsyncStorage.getItem,
    ).toHaveBeenCalledWith('@mvp-ai/tasks');
  });

  it('loads tasks from AsyncStorage', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify([
        {
          id: 100,
          title: 'Stored task',
          time: '3:00 PM',
          category: 'Work',
          done: false,
          due: 'Today',
        },
      ]),
    );

    renderProvider();

    await waitFor(() => {
      expect(
        screen.getByTestId('task-title').props
          .children,
      ).toBe('Stored task');
    });

    expect(
      screen.getByTestId('task-time').props
        .children,
    ).toBe('3:00 PM');

    expect(
      screen.getByTestId('task-due').props
        .children,
    ).toBe('Today');
  });

  it('adds a task', async () => {
    renderProvider();

    await waitFor(() => {
      expect(
        Number(
          screen.getByTestId('task-count').props
            .children,
        ),
      ).toBeGreaterThan(0);
    });

    const initialCount = Number(
      screen.getByTestId('task-count').props
        .children,
    );

    fireEvent.press(
      screen.getByTestId('add-task'),
    );

    await waitFor(() => {
      expect(
        Number(
          screen.getByTestId('task-count').props
            .children,
        ),
      ).toBe(initialCount + 1);
    });

    expect(
      screen.getByTestId('task-title').props
        .children,
    ).toBe('New task');

    expect(
      mockedAsyncStorage.setItem,
    ).toHaveBeenCalled();
  });

  it('updates a task title, due date, and time', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify([
        {
          id: 1,
          title: 'Original task',
          time: '9:00 AM',
          category: 'Work',
          done: false,
          due: 'Today',
        },
      ]),
    );

    renderProvider();

    await waitFor(() => {
      expect(
        screen.getByTestId('task-title').props
          .children,
      ).toBe('Original task');
    });

    fireEvent.press(
      screen.getByTestId('update-task'),
    );

    await waitFor(() => {
      expect(
        screen.getByTestId('task-title').props
          .children,
      ).toBe('Updated task');
    });

    expect(
      screen.getByTestId('task-time').props
        .children,
    ).toBe('4:00 PM');

    expect(
      screen.getByTestId('task-due').props
        .children,
    ).toBe('Tomorrow');

    expect(
      mockedAsyncStorage.setItem,
    ).toHaveBeenCalled();
  });

  it('can update only the title', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify([
        {
          id: 1,
          title: 'Original task',
          time: '9:00 AM',
          category: 'Work',
          done: false,
          due: 'Today',
        },
      ]),
    );

    function TitleOnlyConsumer() {
      const { tasks, updateTask } = useTasks();

      return (
        <>
          <Text testID="title">
            {tasks[0]?.title}
          </Text>

          <Text testID="time">
            {tasks[0]?.time}
          </Text>

          <Text testID="due">
            {tasks[0]?.due}
          </Text>

          <Pressable
            testID="update"
            onPress={() =>
              updateTask(1, {
                title: 'New title',
              })
            }
          />
        </>
      );
    }

    renderProvider(<TitleOnlyConsumer />);

    await waitFor(() => {
      expect(
        screen.getByTestId('title').props
          .children,
      ).toBe('Original task');
    });

    fireEvent.press(
      screen.getByTestId('update'),
    );

    await waitFor(() => {
      expect(
        screen.getByTestId('title').props
          .children,
      ).toBe('New title');
    });

    expect(
      screen.getByTestId('time').props.children,
    ).toBe('9:00 AM');

    expect(
      screen.getByTestId('due').props.children,
    ).toBe('Today');
  });

  it('toggles a task between incomplete and complete', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify([
        {
          id: 1,
          title: 'Test task',
          time: '9:00 AM',
          category: 'Work',
          done: false,
          due: 'Today',
        },
      ]),
    );

    renderProvider();

    await waitFor(() => {
      expect(
        screen.getByTestId('task-done').props
          .children,
      ).toBe('false');
    });

    fireEvent.press(
      screen.getByTestId('toggle-task'),
    );

    await waitFor(() => {
      expect(
        screen.getByTestId('task-done').props
          .children,
      ).toBe('true');
    });

    fireEvent.press(
      screen.getByTestId('toggle-task'),
    );

    await waitFor(() => {
      expect(
        screen.getByTestId('task-done').props
          .children,
      ).toBe('false');
    });
  });

  it('removes a task', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify([
        {
          id: 1,
          title: 'Task to remove',
          time: '9:00 AM',
          category: 'Work',
          done: false,
          due: 'Today',
        },
      ]),
    );

    renderProvider();

    await waitFor(() => {
      expect(
        screen.getByTestId('task-count').props
          .children,
      ).toBe(1);
    });

    fireEvent.press(
      screen.getByTestId('remove-task'),
    );

    await waitFor(() => {
      expect(
        screen.getByTestId('task-count').props
          .children,
      ).toBe(0);
    });
  });

  it('persists task changes to AsyncStorage', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify([
        {
          id: 1,
          title: 'Persisted task',
          time: '9:00 AM',
          category: 'Work',
          done: false,
          due: 'Today',
        },
      ]),
    );

    renderProvider();

    await waitFor(() => {
      expect(
        screen.getByTestId('task-title').props
          .children,
      ).toBe('Persisted task');
    });

    fireEvent.press(
      screen.getByTestId('update-task'),
    );

    await waitFor(() => {
      expect(
        mockedAsyncStorage.setItem,
      ).toHaveBeenCalledWith(
        '@mvp-ai/tasks',
        expect.stringContaining(
          '"title":"Updated task"',
        ),
      );
    });
  });

  it('falls back to initial tasks when stored data is invalid', async () => {
    mockedAsyncStorage.getItem.mockResolvedValue(
      'not valid json',
    );

    renderProvider();

    await waitFor(() => {
      expect(
        Number(
          screen.getByTestId('task-count').props
            .children,
        ),
      ).toBeGreaterThan(0);
    });
  });

  it('throws when useTasks is used outside TaskProvider', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() =>
      render(<TestConsumer />),
    ).toThrow(
      'useTasks must be used inside a TaskProvider',
    );

    consoleError.mockRestore();
  });
});