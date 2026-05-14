'use server';

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export type ProjectFieldUpdates = {
  description?: string;
  techStack?: string;
  goals?: string;
  blockers?: string;
  targetUser?: string;
};

export type ExtractedDecision = {
  summary: string;
  updates: ProjectFieldUpdates;
};

export async function extractDecisions(input: {
  lastUserMessage: string;
  lastAssistantMessage: string;
  currentProject: {
    description: string;
    techStack: string;
    goals: string;
    blockers: string;
    targetUser: string;
  };
}): Promise<ExtractedDecision | null> {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `You detect project decisions from a developer conversation and return structured JSON.

Only flag genuine changes to: tech stack, goals, blockers, project description, or target user.
Ignore questions, hypotheticals, and exploratory discussion.

If a real decision was made, respond with JSON:
{
  "summary": "one sentence describing the decision",
  "updates": {
    "techStack"?: "new value",
    "goals"?: "new value",
    "blockers"?: "new value",
    "description"?: "new value",
    "targetUser"?: "new value"
  }
}

Only include fields that actually changed. If no real decision was made, respond with exactly: null`,
    prompt: `Current project state:
- Tech stack: ${input.currentProject.techStack}
- Goals: ${input.currentProject.goals}
- Blockers: ${input.currentProject.blockers}
- Description: ${input.currentProject.description}
- Target user: ${input.currentProject.targetUser}

Last exchange:
User: ${input.lastUserMessage}
Assistant: ${input.lastAssistantMessage}`,
  });

  const trimmed = text.trim();
  if (trimmed === 'null' || trimmed === '') return null;

  try {
    const parsed = JSON.parse(trimmed) as ExtractedDecision;
    if (!parsed.updates || Object.keys(parsed.updates).length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}
