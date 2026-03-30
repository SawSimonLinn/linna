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

const ContextAwareChatInputSchema = z.object({
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
  userMessage: z
    .string()
    .describe('The message or question from the user to the AI assistant.'),
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

Here is the current context for the project you are assisting with:
Tech Stack: {{{techStack}}}
Current Goals: {{{goals}}}
Known Blockers: {{{blockers}}}

Based on this project context, please provide an insightful and helpful response to the following user message:
User Message: {{{userMessage}}}`,
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
