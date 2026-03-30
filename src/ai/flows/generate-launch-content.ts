'use server';
/**
 * @fileOverview A Genkit flow for generating various types of launch content based on project details.
 *
 * - generateLaunchContent - A function that orchestrates the content generation process.
 * - GenerateLaunchContentInput - The input type for the generateLaunchContent function.
 * - GenerateLaunchContentOutput - The return type for the generateLaunchContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLaunchContentInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  description: z.string().describe('A one-line description of what the project is building.'),
  techStack: z
    .string()
    .describe('Comma-separated tech stack used in the project (e.g., Next.js, Supabase, Stripe).'),
  currentGoals: z.string().describe('What the project is trying to accomplish this week.'),
  knownBlockers: z.string().describe('Any known blockers slowing down the project right now.'),
  targetUser: z.string().describe('Who the project is for (e.g., indie hackers, students).'),
});
export type GenerateLaunchContentInput = z.infer<typeof GenerateLaunchContentInputSchema>;

const ProductHuntOutputSchema = z.object({
  tagline: z.string().describe('A catchy tagline for Product Hunt.'),
  description: z.string().describe('A detailed description for the Product Hunt post.'),
  makerComment: z.string().describe('A comment from the maker, introducing the product.'),
  firstComment: z.string().describe('A suggested first comment to kickstart engagement.'),
});

const RedditPostOutputSchema = z.object({
  title: z.string().describe('A catchy title for a Reddit post (e.g., r/indiehackers or r/webdev).'),
  body: z
    .string()
    .describe('The main body of the Reddit post, introducing the project, problem, solution, and inviting discussion.'),
});

const TwitterXOutputSchema = z.object({
  tweet1: z.string().describe('The first tweet (hook).'),
  tweet2: z.string().describe('The second tweet (problem).'),
  tweet3: z.string().describe('The third tweet (solution).'),
  tweet4: z.string().describe('The fourth tweet (demo/how it works).'),
  tweet5: z.string().describe('The fifth tweet (call to action).'),
});

const LandingCopyOutputSchema = z.object({
  heroHeadline: z.string().describe('Hero headline for the landing page.'),
  heroSubHeadline: z.string().describe('Sub-headline for the landing page hero section.'),
  feature1: z.string().describe('First feature bullet point.'),
  feature2: z.string().describe('Second feature bullet point.'),
  feature3: z.string().describe('Third feature bullet point.'),
  pricingCta: z.string().describe('Call to action for the pricing section.'),
});

const CommunitiesOutputSchema = z.object({
  subreddits: z.array(z.string()).describe('List of relevant subreddits.'),
  discordServers: z.array(z.string()).describe('List of relevant Discord servers.'),
  slackGroups: z.array(z.string()).describe('List of relevant Slack groups.'),
});

const GenerateLaunchContentOutputSchema = z.object({
  productHunt: ProductHuntOutputSchema,
  redditPost: RedditPostOutputSchema,
  twitterXThread: TwitterXOutputSchema,
  landingCopy: LandingCopyOutputSchema,
  communities: CommunitiesOutputSchema,
});
export type GenerateLaunchContentOutput = z.infer<typeof GenerateLaunchContentOutputSchema>;

export async function generateLaunchContent(
  input: GenerateLaunchContentInput
): Promise<GenerateLaunchContentOutput> {
  return generateLaunchContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLaunchContentPrompt',
  input: { schema: GenerateLaunchContentInputSchema },
  output: { schema: GenerateLaunchContentOutputSchema },
  prompt: `You are Linna, an expert marketing assistant specializing in launching developer tools and SaaS products. Your task is to generate comprehensive launch content based on the provided project details.\n\nProject Name: {{{projectName}}}\nDescription: {{{description}}}\nTech Stack: {{{techStack}}}\nCurrent Goals: {{{currentGoals}}}\nKnown Blockers: {{{knownBlockers}}}\nTarget User: {{{targetUser}}}\n\nGenerate the following launch content in a single JSON object. Ensure all fields are populated and follow the specified format.\n\n1.  **Product Hunt Post**:\n    -   A catchy tagline.\n    -   A detailed description.\n    -   A maker comment introducing the product.\n    -   A suggested first comment to kickstart engagement.\n\n2.  **Reddit Post**:\n    -   A catchy title optimized for communities like r/indiehackers or r/webdev.\n    -   The main body of the Reddit post, introducing the project, problem, solution, and inviting discussion.\n\n3.  **Twitter/X Thread (5 Tweets)**:\n    -   Tweet 1: A compelling hook.\n    -   Tweet 2: Describe the problem the project solves.\n    -   Tweet 3: Introduce the project as the solution.\n    -   Tweet 4: Briefly explain how it works or show a demo idea.\n    -   Tweet 5: A clear call to action.\n\n4.  **Landing Page Copy**:\n    -   A hero headline.\n    -   A compelling sub-headline for the hero section.\n    -   Three concise feature bullet points.\n    -   A call to action for the pricing section.\n\n5.  **Community List**:\n    -   A list of relevant subreddits.\n    -   A list of relevant Discord servers.\n    -   A list of relevant Slack groups.\n\nRespond with a JSON object strictly following the output schema.`,
});

const generateLaunchContentFlow = ai.defineFlow(
  {
    name: 'generateLaunchContentFlow',
    inputSchema: GenerateLaunchContentInputSchema,
    outputSchema: GenerateLaunchContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
