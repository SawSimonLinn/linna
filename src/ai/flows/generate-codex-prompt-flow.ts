'use server';

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';

const GenerateCodexPromptInputSchema = z.object({
  projectName: z.string(),
  projectDescription: z.string(),
  techStack: z.string(),
  goals: z.string(),
  blockers: z.string(),
  targetUser: z.string(),
  lastAssistantMessage: z.string(),
});

export type GenerateCodexPromptInput = z.infer<typeof GenerateCodexPromptInputSchema>;

export async function generateCodexPrompt(
  input: GenerateCodexPromptInput
): Promise<{ prompt: string }> {
  const systemPrompt = `You are an expert at writing precise, actionable prompts for AI coding assistants like Claude Code and OpenAI Codex.

Given a project context and an AI assistant's advice or feature suggestion, your job is to distill it into a single, well-structured prompt that a developer can paste directly into Claude Code or Codex to implement it.

Rules:
- Be extremely specific and technical
- Include file paths, function names, or component names when the context implies them
- Reference the tech stack explicitly
- The prompt should be self-contained — no external context needed to understand it
- Start with the action (e.g. "Implement...", "Create...", "Refactor...", "Add...")
- Include acceptance criteria as a short bullet list at the end under "Requirements:"
- Keep it under 300 words
- Do NOT add markdown headers or wrap in code blocks — output raw prompt text only`;

  const userMessage = `Project: ${input.projectName}
Description: ${input.projectDescription}
Tech Stack: ${input.techStack}
Goals: ${input.goals}
Blockers: ${input.blockers}
Target User: ${input.targetUser}

The AI assistant just said:
"""
${input.lastAssistantMessage}
"""

Write a Claude Code / Codex prompt that implements the most actionable feature or fix from that response.`;

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  return { prompt: text.trim() };
}
