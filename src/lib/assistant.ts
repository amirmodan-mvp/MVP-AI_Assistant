import type { Message, Task, TaskDue } from '@/types/assistant';

export function createAIResponse(
  text: string,
  addTask: (title: string, due?: TaskDue, time?: string) => void,
): Omit<Message, 'id'> {
  const lower = text.toLowerCase();

  if (/remind me|add .+ to my tasks|create a task|follow up/.test(lower)) {
    let taskTitle =
      text.match(/[“"]([^”"]+)[”"]/)?.[1] ||
      text
        .replace(/^(remind me to|add|create a task to)\s*/i, '')
        .replace(/\s+(to my tasks|tomorrow.*|today.*)$/i, '')
        .replace(/[.!]$/, '') ||
      'New task';

    if (!taskTitle || taskTitle.toLowerCase() === 'create a task') taskTitle = 'New task';
    taskTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);

    const due: TaskDue = lower.includes('today') ? 'Today' : 'Tomorrow';
    const match = text.match(/(?:at\s+)(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    const time = match
      ? `${Number(match[1]) > 12 ? Number(match[1]) - 12 : Number(match[1])}:${match[2] || '00'} ${(match[3] || (Number(match[1]) >= 12 ? 'PM' : 'AM')).toUpperCase()}`
      : '9:00 AM';

    addTask(taskTitle, due, time);
    return { role: 'assistant', text: 'Done — I added this to your tasks. You can edit or complete it anytime.', card: 'task', taskTitle, taskDue: due, taskTime: time };
  }

  if (/plan my day|priorit|my day|briefing/.test(lower)) {
    return { role: 'assistant', text: "Here's a thoughtful plan for today. I put your most important work first, when your energy is highest.", card: 'plan' };
  }
  if (/grocery|checklist|break .+ down/.test(lower)) {
    return { role: 'assistant', text: "Let's turn that into something you can actually work through.", card: 'list' };
  }
  if (/decide|compare|should i buy|option/.test(lower)) {
    return { role: 'assistant', text: "Let's make the trade-offs a little clearer before you decide.", card: 'decision' };
  }
  if (/schedule|tomorrow|meeting/.test(lower)) {
    return { role: 'assistant', text: "Here's a snapshot of what's coming up. Your mornings are usually best for focused work.", card: 'schedule' };
  }
  if (/summari|note|document|file/.test(lower)) {
    return {
      role: 'assistant',
      text: lower.includes('file')
        ? "File attached. This concept preview shows an example of how a structured summary could look; it doesn't analyze uploaded documents yet."
        : "Here's a quick overview of your sample meeting note, with the key takeaways separated out.",
      card: 'note',
    };
  }

  return {
    role: 'assistant',
    text: "I'm here to help you make progress. I can plan your day, create tasks, organize notes, or help you think through a decision. What would you like to do first?",
  };
}
