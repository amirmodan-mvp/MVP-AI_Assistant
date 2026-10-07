import type {
  Message,
  Task,
  TaskAction,
  TaskDue,
} from '@/types/assistant';

export type AIResponse = Omit<Message, 'id'> & {
  taskAction?: TaskAction;
};

export function createAIResponse(
  text: string,
  tasks: Task[] = [],
): AIResponse {
  const lower = text.toLowerCase().trim();

  /*
   * ---------------------------------------------------------
   * TASK MODIFICATION
   * ---------------------------------------------------------
   */

  const modification = createTaskModificationResponse(
    text,
    tasks,
  );

  if (modification) {
    return modification;
  }

  /*
   * ---------------------------------------------------------
   * TASK QUESTIONS
   * ---------------------------------------------------------
   */

  if (
    /what do i have today|what tasks do i have today|tasks for today|today's tasks|todays tasks|show me today's tasks|show me todays tasks|my tasks today/.test(
      lower,
    )
  ) {
    return createTodayTasksResponse(tasks);
  }

  if (
    /what do i have tomorrow|what tasks do i have tomorrow|tomorrow's tasks|tomorrows tasks|tasks for tomorrow|my tasks tomorrow/.test(
      lower,
    )
  ) {
    return createTomorrowTasksResponse(tasks);
  }

  if (
    /what's coming up|whats coming up|what is coming up|upcoming tasks|what tasks are coming up|what's next on my list|whats next on my list|show me upcoming tasks/.test(
      lower,
    )
  ) {
    return createUpcomingTasksResponse(tasks);
  }

  if (
    /how many tasks|how many task|number of tasks|count my tasks|how much do i have to do/.test(
      lower,
    )
  ) {
    return createTaskCountResponse(tasks);
  }

  if (
    /what should i work on|what should i do|what's next|whats next|what do i need to do|what do i have to do|what's most important|whats most important|prioritize my tasks|prioritize my task|help me prioritize|what should i prioritize|where should i start/.test(
      lower,
    )
  ) {
    return createPriorityResponse(tasks);
  }

  /*
   * ---------------------------------------------------------
   * TASK CREATION
   * ---------------------------------------------------------
   */

  if (
    /^(please\s+)?(create|make)\s+(a\s+)?(new\s+)?task\b/.test(
      lower,
    ) ||
    /^(please\s+)?(add|put)\s+.+\s+(to|on)\s+(my\s+)?(tasks?|task list|list)\b/.test(
      lower,
    ) ||
    /^remind me\s+to\b/.test(lower) ||
    /^remember\s+to\b/.test(lower) ||
    /^don't forget\s+to\b/.test(lower) ||
    /^dont forget\s+to\b/.test(lower) ||
    /^i need to\b/.test(lower) ||
    /^i have to\b/.test(lower) ||
    /^follow up\s+(with|on)\b/.test(lower)
  ) {
    const taskTitle =
      extractTaskTitle(text) || 'New task';

    return {
      role: 'assistant',
      text: "Here's the task. Add it to your task list when you're ready.",
      card: 'task',
      taskTitle,
      taskDue: extractDue(text),
      taskTime: extractTime(text),
    };
  }

  /*
   * ---------------------------------------------------------
   * DAY PLAN
   * ---------------------------------------------------------
   */

  if (
    /plan my day|plan my day out|help me plan my day|what should my day look like|make me a plan for today|give me a plan for today/.test(
      lower,
    )
  ) {
    return createDayPlanResponse(tasks);
  }

  /*
   * ---------------------------------------------------------
   * LISTS / CHECKLISTS
   * ---------------------------------------------------------
   */

  if (
    /make a list|create a list|give me a list|list of|make me a checklist|create a checklist|make a checklist|create .* checklist/.test(
      lower,
    )
  ) {
    return {
      role: 'assistant',
      text: 'Here’s a simple list to get you started.',
      card: 'list',
    };
  }

  /*
   * ---------------------------------------------------------
   * DECISIONS
   * ---------------------------------------------------------
   */

  if (
    /help me decide|should i|which should i|what should i choose|help me choose|pros and cons/.test(
      lower,
    )
  ) {
    return {
      role: 'assistant',
      text: 'Let’s make the decision simple. Tell me the options you’re weighing and I’ll help you compare them.',
      card: 'decision',
    };
  }

  /*
   * ---------------------------------------------------------
   * SCHEDULE
   * ---------------------------------------------------------
   */

  if (
    /schedule|schedule this|set a schedule|make a schedule|organize my schedule|what's on my schedule|whats on my schedule/.test(
      lower,
    )
  ) {
    return {
      role: 'assistant',
      text: 'I can help organize that into a simple schedule.',
      card: 'schedule',
    };
  }

  /*
   * ---------------------------------------------------------
   * NOTES
   * ---------------------------------------------------------
   */

  if (
    /take a note|make a note|create a note|write this down|save a note|remember this/.test(
      lower,
    )
  ) {
    return {
      role: 'assistant',
      text: 'I can turn that into a note for you.',
      card: 'note',
    };
  }

  /*
   * ---------------------------------------------------------
   * GENERAL FALLBACK
   * ---------------------------------------------------------
   */

  return {
    role: 'assistant',
    text: createFallbackResponse(text),
  };
}

/*
 * -----------------------------------------------------------
 * TASK MODIFICATION
 * -----------------------------------------------------------
 */

function createTaskModificationResponse(
  text: string,
  tasks: Task[],
): AIResponse | undefined {
  const lower = text.toLowerCase().trim();

  if (!tasks.length) {
    return undefined;
  }

  /*
   * COMPLETE / MARK DONE
   */

  const completeTarget = extractTaskTarget(text, [
    /^mark\s+(?:my\s+)?(.+?)\s+(?:as\s+)?(?:complete|completed|done)$/i,
    /^complete\s+(?:my\s+)?(.+?)(?:\s+task)?$/i,
    /^finish\s+(?:my\s+)?(.+?)(?:\s+task)?$/i,
    /^mark\s+(?:my\s+)?(.+?)\s+task\s+as\s+(?:complete|completed|done)$/i,
  ]);

  if (completeTarget) {
    const task = findTask(completeTarget, tasks);

    if (task) {
      if (task.done) {
        return {
          role: 'assistant',
          text: `"${task.title}" is already marked as complete.`,
        };
      }

      return {
        role: 'assistant',
        text: `Done. I've marked "${task.title}" as complete.`,
        taskAction: {
          type: 'toggle',
          taskId: task.id,
        },
      };
    }

    return createTaskNotFoundResponse(
      completeTarget,
      tasks,
    );
  }

  /*
   * DELETE / REMOVE
   */

  const deleteTarget = extractTaskTarget(text, [
    /^(?:delete|remove)\s+(?:my\s+)?(.+?)(?:\s+task)?$/i,
    /^(?:delete|remove)\s+(?:the\s+)?task\s+(.+)$/i,
    /^(?:get rid of|cancel)\s+(?:my\s+)?(.+?)(?:\s+task)?$/i,
  ]);

  if (deleteTarget) {
    const task = findTask(deleteTarget, tasks);

    if (task) {
      return {
        role: 'assistant',
        text: `I've removed "${task.title}" from your tasks.`,
        taskAction: {
          type: 'remove',
          taskId: task.id,
        },
      };
    }

    return createTaskNotFoundResponse(
      deleteTarget,
      tasks,
    );
  }

  /*
   * RENAME
   */

  const renameMatch = text.match(
    /^(?:rename)\s+(?:my\s+|the\s+)?(.+?)\s+to\s+(.+)$/i,
  );

  if (renameMatch) {
    const target = cleanReferencedTaskName(
      renameMatch[1],
    );

    const newTitle = cleanTaskTitle(renameMatch[2]);

    if (target && newTitle) {
      const task = findTask(target, tasks);

      if (task) {
        if (
          task.title.toLowerCase().trim() ===
          newTitle.toLowerCase().trim()
        ) {
          return {
            role: 'assistant',
            text: `"${task.title}" already has that name.`,
          };
        }

        return {
          role: 'assistant',
          text: `Done. I've renamed "${task.title}" to "${newTitle}".`,
          taskAction: {
            type: 'update',
            taskId: task.id,
            title: newTitle,
          },
        };
      }

      return createTaskNotFoundResponse(
        target,
        tasks,
      );
    }
  }

  /*
   * CHANGE / MOVE TIME
   */

  const timeMatch = text.match(
    /^(?:change|move|set|reschedule)\s+(?:my\s+|the\s+)?(.+?)\s+(?:to|at)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i,
  );

  if (timeMatch) {
    const target = cleanReferencedTaskName(
      timeMatch[1],
    );

    const hour = Number(timeMatch[2]);
    const minute = timeMatch[3] ?? '00';
    const period = timeMatch[4].toUpperCase();

    if (
      target &&
      hour >= 1 &&
      hour <= 12
    ) {
      const time = `${hour}:${minute} ${period}`;
      const task = findTask(target, tasks);

      if (task) {
        return {
          role: 'assistant',
          text: `Done. I've changed "${task.title}" to ${time}.`,
          taskAction: {
            type: 'update',
            taskId: task.id,
            time,
          },
        };
      }

      return createTaskNotFoundResponse(
        target,
        tasks,
      );
    }
  }

  /*
   * CHANGE / MOVE DUE DATE
   */

  const dueMatch = text.match(
    /^(?:move|change|set|reschedule|schedule|push)\s+(?:my\s+|the\s+)?(.+?)\s+(?:to|for)\s+(today|tomorrow|upcoming)$/i,
  );

  if (dueMatch) {
    const target = cleanReferencedTaskName(
      dueMatch[1],
    );

    const due = normalizeDue(dueMatch[2]);

    if (target && due) {
      const task = findTask(target, tasks);

      if (task) {
        return {
          role: 'assistant',
          text: `Done. I've moved "${task.title}" to ${due.toLowerCase()}.`,
          taskAction: {
            type: 'update',
            taskId: task.id,
            due,
          },
        };
      }

      return createTaskNotFoundResponse(
        target,
        tasks,
      );
    }
  }

  /*
   * CHANGE NAME
   */

  const changeNameMatch = text.match(
    /^(?:change)\s+(?:my\s+|the\s+)?(.+?)\s+to\s+(.+)$/i,
  );

  if (changeNameMatch) {
    const target = cleanReferencedTaskName(
      changeNameMatch[1],
    );

    const newTitle = cleanTaskTitle(
      changeNameMatch[2],
    );

    const looksLikeTime =
      /^\d{1,2}(?::\d{2})?\s*(?:am|pm)$/i.test(
        newTitle,
      );

    const looksLikeDue =
      /^(today|tomorrow|upcoming)$/i.test(
        newTitle,
      );

    if (
      target &&
      newTitle &&
      !looksLikeTime &&
      !looksLikeDue
    ) {
      const task = findTask(target, tasks);

      if (task) {
        return {
          role: 'assistant',
          text: `Done. I've renamed "${task.title}" to "${newTitle}".`,
          taskAction: {
            type: 'update',
            taskId: task.id,
            title: newTitle,
          },
        };
      }

      return createTaskNotFoundResponse(
        target,
        tasks,
      );
    }
  }

  return undefined;
}

/*
 * -----------------------------------------------------------
 * TASK LOOKUP HELPERS
 * -----------------------------------------------------------
 */

function extractTaskTarget(
  text: string,
  patterns: RegExp[],
): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      return cleanReferencedTaskName(match[1]);
    }
  }

  return undefined;
}

function cleanReferencedTaskName(
  value: string,
): string {
  return value
    .replace(/[.!?]+$/, '')
    .replace(/^(?:my|the)\s+/i, '')
    .replace(/\s+task$/i, '')
    .trim();
}

function findTask(
  reference: string,
  tasks: Task[],
): Task | undefined {
  const normalizedReference =
    normalizeTaskText(reference);

  if (!normalizedReference) {
    return undefined;
  }

  const exact = tasks.find(
    task =>
      normalizeTaskText(task.title) ===
      normalizedReference,
  );

  if (exact) {
    return exact;
  }

  const containing = tasks.find(task => {
    const title = normalizeTaskText(task.title);

    return (
      title.includes(normalizedReference) ||
      normalizedReference.includes(title)
    );
  });

  if (containing) {
    return containing;
  }

  /*
   * Handle simple singular/plural references:
   *
   * "grocery" -> "groceries"
   * "report" -> "reports"
   * "proposal" -> "proposals"
   */

  const referenceWords =
    normalizedReference.split(/\s+/);

  const stemmedReferenceWords =
    referenceWords.map(stemWord);

  const fuzzy = tasks.find(task => {
    const titleWords = normalizeTaskText(
      task.title,
    ).split(/\s+/);

    return stemmedReferenceWords.some(
      referenceWord =>
        referenceWord.length >= 4 &&
        titleWords.some(
          titleWord =>
            stemWord(titleWord) ===
            referenceWord,
        ),
    );
  });

  return fuzzy;
}

function stemWord(word: string): string {
  if (word.endsWith('ies') && word.length > 4) {
    return `${word.slice(0, -3)}y`;
  }

  if (
    word.endsWith('es') &&
    word.length > 4
  ) {
    return word.slice(0, -2);
  }

  if (
    word.endsWith('s') &&
    word.length > 3
  ) {
    return word.slice(0, -1);
  }

  return word;
}

function normalizeTaskText(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createTaskNotFoundResponse(
  reference: string,
  tasks: Task[],
): AIResponse {
  const activeTasks = tasks
    .filter(task => !task.done)
    .slice(0, 5);

  if (!activeTasks.length) {
    return {
      role: 'assistant',
      text: `I couldn't find a task matching "${reference}", and your active task list is empty.`,
    };
  }

  const suggestions = activeTasks
    .map(task => `"${task.title}"`)
    .join(', ');

  return {
    role: 'assistant',
    text: `I couldn't find a task matching "${reference}". Your current tasks include ${suggestions}.`,
  };
}

/*
 * -----------------------------------------------------------
 * TASK QUESTIONS
 * -----------------------------------------------------------
 */

function createTodayTasksResponse(
  tasks: Task[],
): AIResponse {
  const today = tasks.filter(
    task => task.due === 'Today' && !task.done,
  );

  if (!today.length) {
    return {
      role: 'assistant',
      text: "You don't have any incomplete tasks for today. Your list is clear.",
    };
  }

  const lines = today.map(
    task => `• ${task.title} — ${task.time}`,
  );

  return {
    role: 'assistant',
    text: `You have ${today.length} task${
      today.length === 1 ? '' : 's'
    } today:\n\n${lines.join('\n')}`,
  };
}

function createTomorrowTasksResponse(
  tasks: Task[],
): AIResponse {
  const tomorrow = tasks.filter(
    task =>
      task.due === 'Tomorrow' &&
      !task.done,
  );

  if (!tomorrow.length) {
    return {
      role: 'assistant',
      text: "You don't have any incomplete tasks for tomorrow.",
    };
  }

  const lines = tomorrow.map(
    task => `• ${task.title} — ${task.time}`,
  );

  return {
    role: 'assistant',
    text: `You have ${tomorrow.length} task${
      tomorrow.length === 1 ? '' : 's'
    } tomorrow:\n\n${lines.join('\n')}`,
  };
}

function createUpcomingTasksResponse(
  tasks: Task[],
): AIResponse {
  const upcoming = tasks.filter(
    task =>
      task.due !== 'Today' &&
      !task.done,
  );

  if (!upcoming.length) {
    return {
      role: 'assistant',
      text: "You don't have any upcoming incomplete tasks.",
    };
  }

  const lines = upcoming.map(
    task =>
      `• ${task.title} — ${task.due}, ${task.time}`,
  );

  return {
    role: 'assistant',
    text: `Here are your upcoming tasks:\n\n${lines.join(
      '\n',
    )}`,
  };
}

function createTaskCountResponse(
  tasks: Task[],
): AIResponse {
  const incomplete = tasks.filter(
    task => !task.done,
  ).length;

  const completed = tasks.filter(
    task => task.done,
  ).length;

  return {
    role: 'assistant',
    text: `You have ${incomplete} incomplete task${
      incomplete === 1 ? '' : 's'
    } and ${completed} completed task${
      completed === 1 ? '' : 's'
    }.`,
  };
}

function createPriorityResponse(
  tasks: Task[],
): AIResponse {
  const activeTasks = tasks.filter(
    task => !task.done,
  );

  if (!activeTasks.length) {
    return {
      role: 'assistant',
      text: 'You have no incomplete tasks right now. That is a good place to be.',
    };
  }

  const sorted = [...activeTasks].sort(
    (a, b) =>
      duePriority(a.due) -
      duePriority(b.due),
  );

  const first = sorted[0];

  return {
    role: 'assistant',
    text: `I'd start with "${first.title}". It's your highest-priority task based on when it's due.`,
  };
}

/*
 * -----------------------------------------------------------
 * DAY PLAN
 * -----------------------------------------------------------
 */

function createDayPlanResponse(
  tasks: Task[],
): AIResponse {
  const activeTasks = tasks.filter(
    task => !task.done,
  );

  const today = activeTasks.filter(
    task => task.due === 'Today',
  );

  const tomorrow = activeTasks.filter(
    task => task.due === 'Tomorrow',
  );

  let text =
    'Here’s a simple plan for your day.';

  if (today.length) {
    text += `\n\nToday:\n${today
      .map(
        task =>
          `• ${task.time} — ${task.title}`,
      )
      .join('\n')}`;
  }

  if (tomorrow.length) {
    text += `\n\nTomorrow:\n${tomorrow
      .map(
        task =>
          `• ${task.time} — ${task.title}`,
      )
      .join('\n')}`;
  }

  if (!today.length && !tomorrow.length) {
    text +=
      '\n\nYour task list is clear for today. Use the time to focus on what matters most.';
  }

  return {
    role: 'assistant',
    text,
    card: 'plan',
  };
}

/*
 * -----------------------------------------------------------
 * TASK CREATION HELPERS
 * -----------------------------------------------------------
 */

function extractTaskTitle(
  text: string,
): string {
  let title = text.trim();

  title = title.replace(
    /^(please\s+)?(create|make)\s+(a\s+)?(new\s+)?task\s*/i,
    '',
  );

  /*
   * Handle:
   * "Create a task to finish the report"
   */

  title = title.replace(
    /^to\s+/i,
    '',
  );

  title = title.replace(
    /^(please\s+)?(add|put)\s+/i,
    '',
  );

  title = title.replace(
    /\s+(to|on)\s+(my\s+)?(tasks?|task list|list)\s*$/i,
    '',
  );

  title = title.replace(
    /^remind me\s+to\s+/i,
    '',
  );

  title = title.replace(
    /^remember\s+to\s+/i,
    '',
  );

  title = title.replace(
    /^(?:don't|dont)\s+forget\s+to\s+/i,
    '',
  );

  title = title.replace(
    /^i need to\s+/i,
    '',
  );

  title = title.replace(
    /^i have to\s+/i,
    '',
  );

  title = title.replace(
    /^follow up\s+(?:with|on)\s+/i,
    '',
  );

  title = removeDateAndTimeFromTitle(title);

  return cleanTaskTitle(title);
}

function cleanTaskTitle(
  title: string,
): string {
  return title
    .replace(/\s+/g, ' ')
    .replace(/^[\s,.:;-]+/, '')
    .replace(/[\s,.:;-]+$/, '')
    .trim();
}

function removeDateAndTimeFromTitle(
  title: string,
): string {
  return title
    .replace(
      /\b(today|tomorrow|upcoming)\b/gi,
      '',
    )
    .replace(
      /\b(?:at|by)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi,
      '',
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDue(
  text: string,
): TaskDue {
  const lower = text.toLowerCase();

  if (/\btoday\b/.test(lower)) {
    return 'Today';
  }

  if (/\btomorrow\b/.test(lower)) {
    return 'Tomorrow';
  }

  return 'Tomorrow';
}

function extractTime(
  text: string,
): string {
  const match = text.match(
    /\b(?:at|by)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i,
  );

  if (!match) {
    return '9:00 AM';
  }

  const hour = Number(match[1]);
  const minute = match[2] ?? '00';
  const period = match[3].toUpperCase();

  if (
    hour < 1 ||
    hour > 12
  ) {
    return '9:00 AM';
  }

  return `${hour}:${minute} ${period}`;
}

/*
 * -----------------------------------------------------------
 * GENERAL HELPERS
 * -----------------------------------------------------------
 */

function normalizeDue(
  value: string,
): TaskDue | undefined {
  switch (value.toLowerCase()) {
    case 'today':
      return 'Today';

    case 'tomorrow':
      return 'Tomorrow';

    case 'upcoming':
      return 'Upcoming';

    default:
      return undefined;
  }
}

function duePriority(
  due: TaskDue,
): number {
  switch (due) {
    case 'Today':
      return 0;

    case 'Tomorrow':
      return 1;

    case 'Upcoming':
      return 2;

    default:
      return 3;
  }
}

function createFallbackResponse(
  text: string,
): string {
  const trimmed = text.trim();

  if (!trimmed) {
    return 'What would you like help with?';
  }

  return `I can help you make progress. I can organize tasks, plan your day, make lists, help you make decisions, and keep things moving.`;
}