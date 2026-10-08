export type Tab = 'home' | 'ai' | 'tasks' | 'notes' | 'more';

export type TaskDue =
  | 'Today'
  | 'Tomorrow'
  | 'Upcoming';

export type Task = {
  id: number;
  title: string;
  time: string;
  category: string;
  done: boolean;
  due: TaskDue;
};

export type ResponseCardType =
  | 'plan'
  | 'task'
  | 'list'
  | 'decision'
  | 'schedule'
  | 'note';

export type TaskAction =
  | {
    type: 'toggle';
    taskId: number;
  }
  | {
    type: 'remove';
    taskId: number;
  }
  | {
    type: 'update';
    taskId: number;
    title?: string;
    due?: TaskDue;
    time?: string;
  };

export type Message = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  card?: ResponseCardType;
  taskTitle?: string;
  taskDue?: TaskDue;
  taskTime?: string;
  imageUri?: string;
  documentUri?: string;
  documentName?: string;
  taskAction?: TaskAction;
};

export type Panel =
  | 'notifications'
  | 'search'
  | 'new-task'
  | 'memory'
  | null;