'use server';

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function extractNextAction(input: {
  projectName: string;
  recentMessages: { role: 'user' | 'assistant'; content: string }[];
}): Promise<string> {
  const transcript = input.recentMessages
    .slice(-10)
    .map((m) => `${m.role === 'user' ? 'User' : 'Linna'}: ${m.content}`)
    .join('\n\n');

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system:
      'You extract the single most concrete next action from a project conversation. ' +
      'Respond with one short sentence starting with a verb (e.g. "Set up the database schema", "Fix the auth redirect bug"). ' +
      'No punctuation at the end. If nothing specific is actionable, respond with an empty string.',
    prompt: `Project: ${input.projectName}\n\nRecent conversation:\n${transcript}`,
  });

  return text.trim().replace(/\.$/, '');
}
