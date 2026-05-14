import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { mapProjectInvitation, mapProjectMember } from '@/lib/projects/mappers';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;

  // Verify caller has access to the project
  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle();

  if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });

  const [membersResult, invitationsResult] = await Promise.all([
    supabase.from('project_members').select('*').eq('project_id', id).order('created_at'),
    project.user_id === user.id
      ? supabase.from('project_invitations').select('*').eq('project_id', id).is('accepted_at', null).order('created_at')
      : Promise.resolve({ data: [] as unknown[], error: null }),
  ]);

  return NextResponse.json({
    members: (membersResult.data ?? []).map(mapProjectMember),
    pendingInvitations: (invitationsResult.data ?? []).map((inv) =>
      mapProjectInvitation(inv as Parameters<typeof mapProjectInvitation>[0]),
    ),
  });
}

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;

  // Only owners can invite
  const { data: project } = await supabase
    .from('projects')
    .select('id, user_id, name')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });

  // Require Pro plan to invite team members
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle();

  if ((profile?.plan ?? 'free') !== 'pro') {
    return NextResponse.json(
      { error: 'Team projects require a Pro plan. Upgrade to invite collaborators.', code: 'PLAN_REQUIRED' },
      { status: 403 },
    );
  }

  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
  }

  // Check if invitation already exists (pending)
  const { data: existing } = await supabase
    .from('project_invitations')
    .select('id')
    .eq('project_id', id)
    .eq('invited_email', email)
    .is('accepted_at', null)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'An invitation for this email is already pending.' }, { status: 409 });
  }

  const { data: invitation, error } = await supabase
    .from('project_invitations')
    .insert({ project_id: id, invited_email: email, invited_by: user.id })
    .select('*')
    .single();

  if (error || !invitation) {
    return NextResponse.json({ error: 'Failed to create invitation.' }, { status: 500 });
  }

  return NextResponse.json(mapProjectInvitation(invitation), { status: 201 });
}
