'use server';
/**
 * @fileOverview A Genkit flow for context-aware chat with the Linna AI assistant.
 * This flow allows a user to ask questions, and the AI will respond using the provided project context.
 *
 * - contextAwareChat - A function that handles the context-aware chat process.
 * - ContextAwareChatInput - The input type for the contextAwareChat function.
 * - ContextAwareChatOutput - The return type for the contextAwareChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ContextAwareChatInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  projectDescription: z.string().describe('A one-line description of the project.'),
  techStack: z
    .string()
    .describe(
      'A comma-separated string listing the technologies and frameworks used in the project. e.g., Next.js, Supabase, Stripe'
    ),
  goals: z
    .string()
    .describe(
      'A description of the current goals or objectives for the project. e.g., Implement user authentication, build dashboard UI'
    ),
  blockers: z
    .string()
    .describe(
      'A description of any known blockers or challenges currently faced in the project. e.g., Struggling with Supabase RLS policies'
    ),
  targetUser: z.string().describe('Who the project is built for.'),
  chatHistory: z
    .array(ChatMessageSchema)
    .describe('The conversation history so far, oldest first.'),
  userMessage: z
    .string()
    .describe('The latest message or question from the user.'),
});
export type ContextAwareChatInput = z.infer<typeof ContextAwareChatInputSchema>;

const ContextAwareChatOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response to the user.'),
});
export type ContextAwareChatOutput = z.infer<
  typeof ContextAwareChatOutputSchema
>;

export async function contextAwareChat(
  input: ContextAwareChatInput
): Promise<ContextAwareChatOutput> {
  return contextAwareChatFlow(input);
}

const contextAwareChatPrompt = ai.definePrompt({
  name: 'contextAwareChatPrompt',
  input: { schema: ContextAwareChatInputSchema },
  output: { schema: ContextAwareChatOutputSchema },
  prompt: `You are Linna, a highly intelligent and project-aware AI assistant designed to help developers. You specialize in understanding project context and providing relevant, personalized advice and answers without needing details re-explained.

Here is the full context for the project you are assisting with:
Project Name: {{{projectName}}}
Description: {{{projectDescription}}}
Target User: {{{targetUser}}}
Tech Stack: {{{techStack}}}
Current Goals: {{{goals}}}
Known Blockers: {{{blockers}}}

{{#if chatHistory.length}}
Here is the conversation so far:
{{#each chatHistory}}
{{role}}: {{{content}}}
{{/each}}
{{/if}}

Now respond to the user's latest message. Be specific, grounded in the project context above, and reference details from the conversation history where relevant.
User: {{{userMessage}}}`,
});

const contextAwareChatFlow = ai.defineFlow(
  {
    name: 'contextAwareChatFlow',
    inputSchema: ContextAwareChatInputSchema,
    outputSchema: ContextAwareChatOutputSchema,
  },
  async (input) => {
    const { output } = await contextAwareChatPrompt(input);
    return output!;
  }
);
