'use server';

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const GenerateLaunchContentInputSchema = z.object({
  projectName: z.string(),
  description: z.string(),
  techStack: z.string(),
  currentGoals: z.string(),
  knownBlockers: z.string(),
  targetUser: z.string(),
  readme: z.string().optional(),
});
export type GenerateLaunchContentInput = z.infer<typeof GenerateLaunchContentInputSchema>;

const GenerateLaunchContentOutputSchema = z.object({
  productHunt: z.object({
    tagline: z.string(),
    description: z.string(),
    makerComment: z.string(),
    firstComment: z.string(),
  }),
  redditPost: z.object({
    title: z.string(),
    body: z.string(),
  }),
  twitterXThread: z.object({
    tweet1: z.string(),
    tweet2: z.string(),
    tweet3: z.string(),
    tweet4: z.string(),
    tweet5: z.string(),
  }),
  linkedInPost: z.object({
    headline: z.string(),
    body: z.string(),
    hashtags: z.array(z.string()),
  }),
  instagramPost: z.object({
    caption: z.string(),
    hashtags: z.array(z.string()),
    storyIdeas: z.array(z.string()),
  }),
  landingCopy: z.object({
    heroHeadline: z.string(),
    heroSubHeadline: z.string(),
    feature1: z.string(),
    feature2: z.string(),
    feature3: z.string(),
    pricingCta: z.string(),
  }),
  communities: z.object({
    subreddits: z.array(z.string()),
    discordServers: z.array(z.string()),
    slackGroups: z.array(z.string()),
  }),
});
export type GenerateLaunchContentOutput = z.infer<typeof GenerateLaunchContentOutputSchema>;

export async function generateLaunchContent(
  input: GenerateLaunchContentInput,
): Promise<GenerateLaunchContentOutput> {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: GenerateLaunchContentOutputSchema,
    prompt: `You are Linna, an expert marketing assistant specializing in launching developer tools and SaaS products. Generate comprehensive launch content based on the project details below.

Project Name: ${input.projectName}
Description: ${input.description}
Tech Stack: ${input.techStack}
Current Goals: ${input.currentGoals}
Known Blockers: ${input.knownBlockers}
Target User: ${input.targetUser}${input.readme ? `\n\nREADME (use for deeper context on features, installation, and usage):\n${input.readme.slice(0, 4000)}` : ''}

Generate:
1. Product Hunt post (tagline, description, maker comment, first comment)
2. Reddit post (title + body for r/indiehackers or r/webdev)
3. Twitter/X thread (5 tweets: hook, problem, solution, how it works, CTA)
4. LinkedIn post (professional headline, body copy, 5 relevant hashtags)
5. Instagram post (engaging caption, 10 hashtags, 3 story ideas)
6. Landing page copy (hero headline, sub-headline, 3 feature bullets, pricing CTA)
7. Community list (relevant subreddits, Discord servers, Slack groups)`,
  });

  return object;
}
