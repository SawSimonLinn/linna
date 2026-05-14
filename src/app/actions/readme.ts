'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generateUpdatedReadme } from '@/ai/flows/generate-readme-flow';

type ReadmeResult =
  | { readme: string; error?: never; code?: never }
  | { readme?: never; error: string; code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'PLAN_REQUIRED' | 'GENERATION_FAILED' };

export async function updateProjectReadme(projectId: string): Promise<ReadmeResult> {
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
    return { error: 'README update is available on Pro.', code: 'PLAN_REQUIRED' };
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();

  if (!project) {
    return { error: 'Project not found.', code: 'NOT_FOUND' };
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('role, content')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(40);

  const chatHistory = (messages ?? [])
    .reverse()
    .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Developer' : 'Linna'}: ${m.content}`)
    .join('\n\n');

  try {
    const readme = await generateUpdatedReadme({
      currentReadme: project.readme ?? '',
      chatHistory,
      projectName: project.name,
      description: project.description ?? '',
      techStack: project.tech_stack ?? '',
    });

    await supabase
      .from('projects')
      .update({ readme })
      .eq('id', projectId);

    return { readme };
  } catch (error) {
    console.error('[readme] generation failed:', error);
    return { error: 'Failed to generate README.', code: 'GENERATION_FAILED' };
  }
}
