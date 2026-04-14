'use server';

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ContextAwareChatInputSchema = z.object({
  projectName: z.string(),
  projectDescription: z.string(),
  techStack: z.string(),
  goals: z.string(),
  blockers: z.string(),
  targetUser: z.string(),
  chatHistory: z.array(ChatMessageSchema),
  userMessage: z.string(),
});

export type ContextAwareChatInput = z.infer<typeof ContextAwareChatInputSchema>;

export type ContextAwareChatOutput = {
  response: string;
};

export async function contextAwareChat(
  input: ContextAwareChatInput
): Promise<ContextAwareChatOutput> {
  const systemPrompt = `You are Linna, a highly intelligent and project-aware AI assistant designed to help developers. You specialize in understanding project context and providing relevant, personalized advice and answers without needing details re-explained.

Here is the full context for the project you are assisting with:
Project Name: ${input.projectName}
Description: ${input.projectDescription}
Target User: ${input.targetUser}
Tech Stack: ${input.techStack}
Current Goals: ${input.goals}
Known Blockers: ${input.blockers}

Be specific, grounded in the project context above, and reference details from the conversation history where relevant.`;

  const messages = [
    ...input.chatHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: input.userMessage },
  ];

  const maxRetries = 3;
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        messages,
      });
      return { response: text };
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient =
        msg.includes('503') ||
        msg.includes('529') ||
        msg.includes('overloaded') ||
        msg.includes('rate limit');
      if (!isTransient || attempt === maxRetries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastError;
}
