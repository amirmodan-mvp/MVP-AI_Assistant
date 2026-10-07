import { createAIResponse } from '../lib/assistant';

describe('DayOne AI response routing', () => {
  it('creates a task response for reminders', () => {
    const response = createAIResponse(
      'Remind me to call Sarah tomorrow at 10 AM',
      [],
    );

    expect(response.card).toBe('task');
    expect(response.taskTitle).toBe('call Sarah');
    expect(response.taskDue).toBe('Tomorrow');
    expect(response.taskTime).toBe('10:00 AM');
    expect(response.taskAction).toBeUndefined();
  });

  it('creates a plan response', () => {
    const response = createAIResponse(
      'Plan my day',
      [],
    );

    expect(response.card).toBe('plan');
  });

  it('creates a checklist response', () => {
    const response = createAIResponse(
      'Create a grocery checklist',
      [],
    );

    expect(response.card).toBe('list');
  });

  it('falls back to general help', () => {
    const response = createAIResponse(
      'Hello',
      [],
    );

    expect(response.card).toBeUndefined();
    expect(response.text).toContain('make progress');
  });
});