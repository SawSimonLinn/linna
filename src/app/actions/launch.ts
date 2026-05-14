'use server';

import { generateLaunchContent, type GenerateLaunchContentOutput } from '@/ai/flows/generate-launch-content';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type LaunchContentResult =
  | { content: GenerateLaunchContentOutput; error?: never; code?: never }
  | { content?: never; error: string; code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'PLAN_REQUIRED' | 'GENERATION_FAILED' };

export async function generateProjectLaunchContent(projectId: string): Promise<LaunchContentResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized', code: 'UNAUTHORIZED' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle();

  if ((profile?.plan ?? 'free') !== 'pro') {
    return {
      error: 'Launch Assistant is available on Pro.',
      code: 'PLAN_REQUIRED',
    };
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();

  if (!project) {
    return { error: 'Project not found.', code: 'NOT_FOUND' };
  }

  try {
    const content = await generateLaunchContent({
      projectName: project.name,
      description: project.description,
      techStack: project.tech_stack,
      currentGoals: project.goals,
      knownBlockers: project.blockers,
      targetUser: project.target_user,
      readme: project.readme ?? undefined,
    });

    await supabase
      .from('projects')
      .update({ launch_content: content })
      .eq('id', projectId);

    return { content };
  } catch (error) {
    console.error('[launch assistant] generation failed:', error);
    return { error: 'Failed to generate launch content.', code: 'GENERATION_FAILED' };
  }
}
