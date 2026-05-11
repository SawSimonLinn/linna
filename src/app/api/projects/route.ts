import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { mapProject } from '@/lib/projects/mappers';
import type { NewProjectInput } from '@/lib/projects/types';

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
