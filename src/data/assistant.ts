import type { Task } from '@/types/assistant';

export const initialTasks: Task[] = [
  { id: 1, title: 'Finish client proposal', time: '10:00 AM', category: 'Work', done: false, due: 'Today' },
  { id: 2, title: 'Review landing page', time: '2:30 PM', category: 'Work', done: false, due: 'Today' },
  { id: 3, title: 'Pick up groceries', time: '6:00 PM', category: 'Personal', done: false, due: 'Today' },
  { id: 4, title: 'Send project update to Sarah', time: '9:00 AM', category: 'Work', done: false, due: 'Tomorrow' },
];

export const initialMemories = [
  'Prefers morning meetings',
  'Likes concise summaries',
  'Work projects are high priority',
];

export const initialNotes = [
  {
    id: 'meeting',
    title: 'Product launch meeting',
    subtitle: 'October launch, website, API updates...',
    meta: 'MEETING NOTES · EDITED TODAY',
    tone: 'purple' as const,
  },
  {
    id: 'ideas',
    title: 'Ideas to explore',
    subtitle: "Things I'd love to make time for",
    meta: 'PERSONAL · YESTERDAY',
    tone: 'cream' as const,
  },
];
