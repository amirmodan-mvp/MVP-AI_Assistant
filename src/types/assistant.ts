export type Tab = 'home' | 'ai' | 'tasks' | 'notes' | 'more';

export type TaskDue = 'Today' | 'Tomorrow' | 'Upcoming';

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

export type Message = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  card?: ResponseCardType;
  taskTitle?: string;
  taskDue?: TaskDue;
  taskTime?: string;
};

export type Panel =
  | 'notifications'
  | 'search'
  | 'new-task'
  | 'memory'
  | null;
