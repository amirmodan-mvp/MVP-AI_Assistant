import { createAIResponse } from '@/lib/assistant';
import type { Task } from '@/types/assistant';

const tasks: Task[] = [
  {
    id: 1,
    title: 'Call Sarah',
    time: '10:00 AM',
    category: 'Personal',
    done: false,
    due: 'Today',
  },
  {
    id: 2,
    title: 'Finish project proposal',
    time: '2:00 PM',
    category: 'Work',
    done: false,
    due: 'Tomorrow',
  },
  {
    id: 3,
    title: 'Buy groceries',
    time: '5:00 PM',
    category: 'Personal',
    done: false,
    due: 'Upcoming',
  },
];

describe('createAIResponse task editing', () => {
  describe('renaming tasks', () => {
    it('renames a task', () => {
      const response = createAIResponse(
        'Rename Call Sarah to Call John',
        tasks,
      );


      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        title: 'Call John',
      });

      expect(response.text).toContain('Call Sarah');
      expect(response.text).toContain('Call John');
    });

    it('supports "change ... to ..." for renaming', () => {
      const response = createAIResponse(
        'Change Call Sarah to Call John',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        title: 'Call John',
      });
    });

    it('does not create a rename action when the task already has that name', () => {
      const response = createAIResponse(
        'Rename Call Sarah to Call Sarah',
        tasks,
      );

      expect(response.taskAction).toBeUndefined();
      expect(response.text).toContain(
        'already has that name',
      );
    });


  });

  describe('changing task time', () => {
    it('changes a task time', () => {
      const response = createAIResponse(
        'Change Call Sarah to 3 PM',
        tasks,
      );


      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        time: '3:00 PM',
      });
    });

    it('supports "change the time of ..."', () => {
      const response = createAIResponse(
        'Change the time of Call Sarah to 3:30 PM',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        time: '3:30 PM',
      });
    });

    it('supports "move ... at ..." for time changes', () => {
      const response = createAIResponse(
        'Move Call Sarah at 4 PM',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        time: '4:00 PM',
      });
    });

    it('does not create an action when the time is already the same', () => {
      const response = createAIResponse(
        'Change Call Sarah to 10 AM',
        tasks,
      );

      expect(response.taskAction).toBeUndefined();
      expect(response.text).toContain(
        'already scheduled for 10:00 AM',
      );
    });


  });

  describe('changing task due date', () => {
    it('moves a task to tomorrow', () => {
      const response = createAIResponse(
        'Move Call Sarah to tomorrow',
        tasks,
      );


      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        due: 'Tomorrow',
      });
    });

    it('moves a task to today', () => {
      const response = createAIResponse(
        'Move Finish project proposal to today',
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
        'Move Call Sarah to upcoming',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        due: 'Upcoming',
      });
    });

    it('does not create an action when the due date is already the same', () => {
      const response = createAIResponse(
        'Move Call Sarah to today',
        tasks,
      );

      expect(response.taskAction).toBeUndefined();
      expect(response.text).toContain(
        'already scheduled for today',
      );
    });


  });

  describe('rescheduling tasks', () => {
    it('changes both due date and time', () => {
      const response = createAIResponse(
        'Reschedule Call Sarah to tomorrow at 3 PM',
        tasks,
      );


      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        due: 'Tomorrow',
        time: '3:00 PM',
      });

      expect(response.text).toContain('tomorrow');
      expect(response.text).toContain('3:00 PM');
    });

    it('supports a different time format with minutes', () => {
      const response = createAIResponse(
        'Reschedule Call Sarah to tomorrow at 3:45 PM',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        due: 'Tomorrow',
        time: '3:45 PM',
      });
    });

    it('supports moving a task to a new time without changing its due date', () => {
      const response = createAIResponse(
        'Move Call Sarah to 6:30 PM',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        time: '6:30 PM',
      });
    });


  });

  describe('completing tasks', () => {
    it('marks a task as complete', () => {
      const response = createAIResponse(
        'Mark Call Sarah complete',
        tasks,
      );


      expect(response.taskAction).toEqual({
        type: 'toggle',
        taskId: 1,
      });

      expect(response.text).toContain(
        'marked "Call Sarah" as complete',
      );
    });

    it('supports "finish" commands', () => {
      const response = createAIResponse(
        'Finish Call Sarah',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'toggle',
        taskId: 1,
      });
    });

    it('does not toggle an already completed task', () => {
      const completedTasks: Task[] = [
        ...tasks,
        {
          id: 4,
          title: 'Submit report',
          time: '8:00 AM',
          category: 'Work',
          done: true,
          due: 'Today',
        },
      ];

      const response = createAIResponse(
        'Complete Submit report',
        completedTasks,
      );

      expect(response.taskAction).toBeUndefined();
      expect(response.text).toContain(
        'already marked as complete',
      );
    });


  });

  describe('deleting tasks', () => {
    it('deletes a task', () => {
      const response = createAIResponse(
        'Delete Call Sarah',
        tasks,
      );


      expect(response.taskAction).toEqual({
        type: 'remove',
        taskId: 1,
      });

      expect(response.text).toContain(
        'removed "Call Sarah"',
      );
    });

    it('supports "remove" commands', () => {
      const response = createAIResponse(
        'Remove Call Sarah',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'remove',
        taskId: 1,
      });
    });

    it('supports "get rid of" commands', () => {
      const response = createAIResponse(
        'Get rid of Call Sarah',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'remove',
        taskId: 1,
      });
    });


  });

  describe('task matching', () => {
    it('matches a task when the user omits part of the title', () => {
      const response = createAIResponse(
        'Rename project proposal to Finish proposal',
        tasks,
      );


      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 2,
        title: 'Finish proposal',
      });
    });

    it('matches singular and plural wording', () => {
      const taskList: Task[] = [
        {
          id: 10,
          title: 'Buy groceries',
          time: '5:00 PM',
          category: 'Personal',
          done: false,
          due: 'Today',
        },
      ];

      const response = createAIResponse(
        'Delete grocery',
        taskList,
      );

      expect(response.taskAction).toEqual({
        type: 'remove',
        taskId: 10,
      });
    });

    it('does not modify a task when no matching task exists', () => {
      const response = createAIResponse(
        'Delete Walk the dog',
        tasks,
      );

      expect(response.taskAction).toBeUndefined();
      expect(response.text).toContain(
        'couldn\'t find a task matching "Walk the dog"',
      );
    });


  });

  describe('editing safety', () => {
    it('creates a task action instead of treating a creation request as an edit', () => {
      const response = createAIResponse(
        'Create a task to call John tomorrow at 3 PM',
        tasks,
      );


      expect(response.taskAction).toEqual({
        type: 'add',
        title: 'call John',
        due: 'Tomorrow',
        time: '3:00 PM',
        category: 'Work',
      });

      expect(response.card).toBeUndefined();
      expect(response.taskTitle).toBeUndefined();
      expect(response.taskDue).toBeUndefined();
      expect(response.taskTime).toBeUndefined();
    });

    it('does not include unsupported category data in update actions', () => {
      const response = createAIResponse(
        'Rename Call Sarah to Call John',
        tasks,
      );

      expect(response.taskAction).toEqual({
        type: 'update',
        taskId: 1,
        title: 'Call John',
      });

      expect(
        response.taskAction &&
        'category' in response.taskAction,
      ).toBe(false);
    });


  });
});

describe('task creation', () => {
  it('creates a task with a title, due date, and time', () => {
    const response = createAIResponse(
      'Remind me to call Sarah tomorrow at 3 PM',
      [],
    );


    expect(response.taskAction).toEqual({
      type: 'add',
      title: 'call Sarah',
      due: 'Tomorrow',
      time: '3:00 PM',
      category: 'Work',
    });

    expect(response.card).toBeUndefined();
    expect(response.text).toContain(
      'added "call Sarah" to your tasks',
    );


  });

  it('creates a task for today', () => {
    const response = createAIResponse(
      'Add buy groceries to my tasks today at 5 PM',
      [],
    );


    expect(response.taskAction).toEqual({
      type: 'add',
      title: 'buy groceries',
      due: 'Today',
      time: '5:00 PM',
      category: 'Work',
    });


  });

  it('uses tomorrow and 9 AM when no date or time is provided', () => {
    const response = createAIResponse(
      'Remind me to call John',
      [],
    );


    expect(response.taskAction).toEqual({
      type: 'add',
      title: 'call John',
      due: 'Tomorrow',
      time: '9:00 AM',
      category: 'Work',
    });


  });

  it('supports "I need to" task creation', () => {
    const response = createAIResponse(
      'I need to finish the proposal tomorrow at 2:30 PM',
      [],
    );


    expect(response.taskAction).toEqual({
      type: 'add',
      title: 'finish the proposal',
      due: 'Tomorrow',
      time: '2:30 PM',
      category: 'Work',
    });


  });

  it('supports "follow up with" task creation', () => {
    const response = createAIResponse(
      'Follow up with Sarah tomorrow',
      [],
    );


    expect(response.taskAction).toEqual({
      type: 'add',
      title: 'Follow up with Sarah',
      due: 'Tomorrow',
      time: '9:00 AM',
      category: 'Work',
    });


  });
});
