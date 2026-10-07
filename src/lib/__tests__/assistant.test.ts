import type { Task } from '@/types/assistant';
import {
    createAIResponse
} from '../assistant';

const tasks: Task[] = [
  {
    id: 1,
    title: 'Finish the proposal',
    time: '2:00 PM',
    category: 'Work',
    done: false,
    due: 'Today',
  },
  {
    id: 2,
    title: 'Buy groceries',
    time: '5:00 PM',
    category: 'Personal',
    done: false,
    due: 'Tomorrow',
  },
  {
    id: 3,
    title: 'Review project brief',
    time: '10:00 AM',
    category: 'Work',
    done: true,
    due: 'Today',
  },
];

describe('createAIResponse', () => {
  describe('task questions', () => {
    it('returns today tasks', () => {
      const response = createAIResponse(
        'What do I have today?',
        tasks,
      );

      expect(response.role).toBe('assistant');
      expect(response.text).toContain(
        'Finish the proposal',
      );
      expect(response.text).not.toContain(
        'Buy groceries',
      );
      expect(response.text).not.toContain(
        'Review project brief',
      );
    });

    it('returns tomorrow tasks', () => {
      const response = createAIResponse(
        'What do I have tomorrow?',
        tasks,
      );

      expect(response.text).toContain(
        'Buy groceries',
      );
      expect(response.text).not.toContain(
        'Finish the proposal',
      );
    });

    it('returns upcoming tasks', () => {
      const response = createAIResponse(
        "What's coming up?",
        tasks,
      );

      expect(response.text).toContain(
        'Buy groceries',
      );
      expect(response.text).not.toContain(
        'Review project brief',
      );
    });

    it('counts incomplete and completed tasks', () => {
      const response = createAIResponse(
        'How many tasks do I have?',
        tasks,
      );

      expect(response.text).toContain(
        '2 incomplete',
      );
      expect(response.text).toContain(
        '1 completed',
      );
    });

    it('prioritizes the task due today', () => {
      const response = createAIResponse(
        'What should I work on?',
        tasks,
      );

      expect(response.text).toContain(
        'Finish the proposal',
      );
    });

    it('does not interpret a task question as task creation', () => {
      const response = createAIResponse(
        'What do I need to do today?',
        tasks,
      );

      expect(response.card).not.toBe('task');
      expect(response.taskTitle).toBeUndefined();
    });
  });

  describe('task creation', () => {
    it('creates a task response', () => {
      const response = createAIResponse(
        'Create a task to finish the report',
        tasks,
      );

      expect(response.card).toBe('task');
      expect(response.taskTitle).toBe(
        'finish the report',
      );
    });

    it('extracts today as the due date', () => {
      const response = createAIResponse(
        'Create a task to finish the report today',
        tasks,
      );

      expect(response.taskDue).toBe('Today');
    });

    it('extracts tomorrow as the due date', () => {
      const response = createAIResponse(
        'Create a task to finish the report tomorrow',
        tasks,
      );

      expect(response.taskDue).toBe('Tomorrow');
    });

    it('extracts the task time', () => {
      const response = createAIResponse(
        'Create a task to finish the report today at 4 PM',
        tasks,
      );

      expect(response.taskTime).toBe('4:00 PM');
    });

    it('does not immediately return a task action when creating a task', () => {
      const response = createAIResponse(
        'Create a task to finish the report',
        tasks,
      );

      expect(response.taskAction).toBeUndefined();
    });
  });

  describe('task completion', () => {
    it('marks a task complete', () => {
      const response = createAIResponse(
        'Mark the proposal complete',
        tasks,
      );

      expect(response.text).toContain(
        'marked "Finish the proposal" as complete',
      );

      expect(response.taskAction).toEqual({
        type: 'toggle',
        taskId: 1,
      });
    });

    it('supports "mark as done"', () => {
      const response = createAIResponse(
        'Mark my proposal as done',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'toggle',
        taskId: 1,
      });
    });

    it('supports "complete"', () => {
      const response = createAIResponse(
        'Complete the proposal',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'toggle',
        taskId: 1,
      });
    });

    it('supports "finish"', () => {
      const response = createAIResponse(
        'Finish the proposal',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'toggle',
        taskId: 1,
      });
    });

    it('does not toggle an already completed task', () => {
      const response = createAIResponse(
        'Complete the project brief',
        tasks,
      );

      expect(response.text).toContain(
        'already marked as complete',
      );
      expect(response.taskAction).toBeUndefined();
    });
  });

  describe('task deletion', () => {
    it('deletes a task', () => {
      const response = createAIResponse(
        'Delete my grocery task',
        tasks,
      );

      expect(response.text).toContain(
        'removed "Buy groceries"',
      );

      expect(response.taskAction).toEqual({
        type: 'remove',
        taskId: 2,
      });
    });

    it('supports "remove"', () => {
      const response = createAIResponse(
        'Remove the proposal',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'remove',
        taskId: 1,
      });
    });
  });

  describe('task due date modification', () => {
    it('moves a task to tomorrow', () => {
      const response = createAIResponse(
        'Move the proposal to tomorrow',
        tasks,
      );

      expect(response.text).toContain(
        'moved "Finish the proposal" to tomorrow',
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        due: 'Tomorrow',
      });
    });

    it('moves a task to today', () => {
      const response = createAIResponse(
        'Move the groceries to today',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 2,
        due: 'Today',
      });
    });

    it('moves a task to upcoming', () => {
      const response = createAIResponse(
        'Move the proposal to upcoming',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        due: 'Upcoming',
      });
    });

    it('supports rescheduling', () => {
      const response = createAIResponse(
        'Reschedule the proposal for tomorrow',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        due: 'Tomorrow',
      });
    });
  });

  describe('task time modification', () => {
    it('changes a task time', () => {
      const response = createAIResponse(
        'Change the proposal to 4 PM',
        tasks,
      );

      expect(response.text).toContain(
        'changed "Finish the proposal" to 4:00 PM',
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        time: '4:00 PM',
      });
    });

    it('supports minutes', () => {
      const response = createAIResponse(
        'Change the proposal to 4:30 PM',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        time: '4:30 PM',
      });
    });

    it('supports lowercase am/pm', () => {
      const response = createAIResponse(
        'Move the proposal to 8:15 am',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        time: '8:15 AM',
      });
    });
  });

  describe('task renaming', () => {
    it('renames a task', () => {
      const response = createAIResponse(
        'Rename the proposal to Finish the client proposal',
        tasks,
      );

      expect(response.text).toContain(
        'renamed "Finish the proposal" to "Finish the client proposal"',
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        title: 'Finish the client proposal',
      });
    });

    it('supports "my" before the task name', () => {
      const response = createAIResponse(
        'Rename my proposal to Send the client proposal',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        title: 'Send the client proposal',
      });
    });

    it('supports change as a rename command', () => {
      const response = createAIResponse(
        'Change the proposal to Finish the client proposal',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        title: 'Finish the client proposal',
      });
    });
  });

  describe('task matching', () => {
    it('matches part of a task title', () => {
      const response = createAIResponse(
        'Move the proposal to tomorrow',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        due: 'Tomorrow',
      });
    });

    it('matches a task with "my"', () => {
      const response = createAIResponse(
        'Delete my groceries',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'remove',
        taskId: 2,
      });
    });

    it('does not create an action for an unknown task', () => {
      const response = createAIResponse(
        'Delete my dentist appointment',
        tasks,
      );

      expect(response.taskAction).toBeUndefined();
      expect(response.text).toContain(
        "couldn't find a task matching",
      );
    });

    it('does not create an action when there are no tasks', () => {
      const response = createAIResponse(
        'Delete my grocery task',
        [],
      );

      expect(response.taskAction).toBeUndefined();
    });
  });

  describe('other assistant responses', () => {
    it('returns a plan card', () => {
      const response = createAIResponse(
        'Plan my day',
        tasks,
      );

      expect(response.card).toBe('plan');
    });

    it('returns a list card', () => {
      const response = createAIResponse(
        'Make a list',
        tasks,
      );

      expect(response.card).toBe('list');
    });

    it('returns a decision card', () => {
      const response = createAIResponse(
        'Help me decide what to do',
        tasks,
      );

      expect(response.card).toBe('decision');
    });

    it('returns a schedule card', () => {
      const response = createAIResponse(
        'Help me schedule this',
        tasks,
      );

      expect(response.card).toBe('schedule');
    });

    it('returns a note card', () => {
      const response = createAIResponse(
        'Take a note',
        tasks,
      );

      expect(response.card).toBe('note');
    });

    it('returns a fallback response', () => {
      const response = createAIResponse(
        'Tell me something interesting',
        tasks,
      );

      expect(response.role).toBe('assistant');
      expect(response.text).toBeTruthy();
    });
  });
});