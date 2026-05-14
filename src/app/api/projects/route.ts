import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { mapProject } from '@/lib/projects/mappers';
import type { NewProjectInput } from '@/lib/projects/types';
import { FREE_PLAN_LIMITS } from '@/lib/plan-limits';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('last_active', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data.map(mapProject));
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check plan and enforce free tier limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle();

  const plan = profile?.plan ?? 'free';

  if (plan === 'free') {
    const { count } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((count ?? 0) >= FREE_PLAN_LIMITS.projects) {
      return NextResponse.json(
        { error: `Free plan is limited to ${FREE_PLAN_LIMITS.projects} projects. Upgrade to Pro for unlimited projects.`, code: 'PLAN_LIMIT' },
        { status: 403 },
      );
    }
  }

  const body = (await request.json()) as Partial<NewProjectInput>;

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Project name is required.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: body.name.trim(),
      description: body.description?.trim() || '',
      tech_stack: body.techStack?.trim() || '',
      goals: body.goals?.trim() || '',
      blockers: body.blockers?.trim() || '',
      target_user: body.targetUser?.trim() || '',
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapProject(data), { status: 201 });
}
