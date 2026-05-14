'use server';

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function generateUpdatedReadme(params: {
  currentReadme: string;
  chatHistory: string;
  projectName: string;
  description: string;
  techStack: string;
}): Promise<string> {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `You are a technical writer. Update the README.md for "${params.projectName}" based on recent development chat and current project context.

Current README:
${params.currentReadme || `# ${params.projectName}\n\nNo README yet.`}

Tech Stack: ${params.techStack}
Description: ${params.description}

Recent Development Chat (use this to update features, decisions, and progress):
${params.chatHistory || 'No recent messages.'}

Generate an updated README.md in Markdown format that:
1. Reflects the current state of the project based on the chat history
2. Updates or adds features, installation steps, and usage that were discussed
3. Keeps the existing structure if it's good, improves it if not
4. Stays factual — only include what's confirmed in the README or chat
5. Is clear, developer-friendly, and well-organized

Return ONLY the raw Markdown content with no explanation or code fences.`,
  });

  return text.trim();
}
