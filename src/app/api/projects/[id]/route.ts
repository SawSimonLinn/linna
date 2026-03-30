import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { mapProject } from '@/lib/projects/mappers';
import type { NewProjectInput } from '@/lib/projects/types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(mapProject(data));
}

export async function DELETE(_: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Partial<NewProjectInput>;

  if (body.name !== undefined && !body.name.trim()) {
    return NextResponse.json({ error: 'Project name is required.' }, { status: 400 });
  }

  const updates = {
    ...(body.name !== undefined ? { name: body.name.trim() } : {}),
    ...(body.description !== undefined ? { description: body.description.trim() } : {}),
    ...(body.techStack !== undefined ? { tech_stack: body.techStack.trim() } : {}),
    ...(body.goals !== undefined ? { goals: body.goals.trim() } : {}),
    ...(body.blockers !== undefined ? { blockers: body.blockers.trim() } : {}),
    ...(body.targetUser !== undefined ? { target_user: body.targetUser.trim() } : {}),
    last_active: new Date().toISOString(),
  };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapProject(data));
}
