import { createAIResponse } from '..//../lib/assistant';

describe('DayOne AI response routing', () => {
  it('creates a task action for reminders', () => {
    const response = createAIResponse(
      'Remind me to call Sarah tomorrow at 10 AM',
      [],
    );


    expect(response.taskAction).toEqual({
      type: 'add',
      title: 'call Sarah',
      due: 'Tomorrow',
      time: '10:00 AM',
      category: 'Work',
    });

    expect(response.card).toBeUndefined();


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
