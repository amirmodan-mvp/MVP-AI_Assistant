import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { initialTasks } from '../data/assistant';
import type { Task, TaskDue } from '../types/assistant';

const TASKS_STORAGE_KEY = '@mvp-ai/tasks';

type AddTaskInput = {
  title: string;
  due?: TaskDue;
  time?: string;
  category?: string;
};

type UpdateTaskInput = {
  title?: string;
  due?: TaskDue;
  time?: string;
};

type TaskContextValue = {
  tasks: Task[];
  addTask: (input: AddTaskInput) => void;
  updateTask: (id: number, input: UpdateTaskInput) => void;
  toggleTask: (id: number) => void;
  removeTask: (id: number) => void;
};

const TaskContext = createContext<TaskContextValue | undefined>(
  undefined,
);

export function TaskProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadTasks = async () => {
      try {
        const stored = await AsyncStorage.getItem(
          TASKS_STORAGE_KEY,
        );

        if (!mounted) return;

        if (stored) {
          try {
            const parsed = JSON.parse(stored);

            if (Array.isArray(parsed)) {
              setTasks(parsed);
            } else {
              setTasks(initialTasks);
            }
          } catch {
            setTasks(initialTasks);
          }
        } else {
          setTasks(initialTasks);
        }
      } catch (error) {
        console.warn('Failed to load tasks:', error);

        if (mounted) {
          setTasks(initialTasks);
        }
      } finally {
        if (mounted) {
          setLoaded(true);
        }
      }
    };

    loadTasks();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(
          TASKS_STORAGE_KEY,
          JSON.stringify(tasks),
        );
      } catch (error) {
        console.warn('Failed to save tasks:', error);
      }
    };

    saveTasks();
  }, [tasks, loaded]);

  const addTask = ({
    title,
    due = 'Tomorrow',
    time = '9:00 AM',
    category = 'Work',
  }: AddTaskInput) => {
    setTasks(current => [
      {
        id: Date.now(),
        title,
        time,
        category,
        done: false,
        due,
      },
      ...current,
    ]);
  };

  const updateTask = (
    id: number,
    input: UpdateTaskInput,
  ) => {
    setTasks(current =>
      current.map(task =>
        task.id === id
          ? {
              ...task,
              ...(input.title !== undefined
                ? { title: input.title }
                : {}),
              ...(input.due !== undefined
                ? { due: input.due }
                : {}),
              ...(input.time !== undefined
                ? { time: input.time }
                : {}),
            }
          : task,
      ),
    );
  };

  const toggleTask = (id: number) => {
    setTasks(current =>
      current.map(task =>
        task.id === id
          ? { ...task, done: !task.done }
          : task,
      ),
    );
  };

  const removeTask = (id: number) => {
    setTasks(current =>
      current.filter(task => task.id !== id),
    );
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        toggleTask,
        removeTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error(
      'useTasks must be used inside a TaskProvider',
    );
  }

  return context;
}