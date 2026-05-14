import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { token } = await context.params;

  const { data: invitation } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .maybeSingle();

  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found or already used.' }, { status: 404 });
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This invitation has expired.' }, { status: 410 });
  }

  const admin = createSupabaseAdminClient();

  // Idempotent: check if already a member
  const { data: existingMember } = await admin
    .from('project_members')
    .select('id')
    .eq('project_id', invitation.project_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existingMember) {
    const { error: memberError } = await admin
      .from('project_members')
      .insert({ project_id: invitation.project_id, user_id: user.id, role: 'member' });

    if (memberError) {
      return NextResponse.json({ error: 'Failed to join project.' }, { status: 500 });
    }
  }

  // Mark invitation accepted
  await admin
    .from('project_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id);

  return NextResponse.json({ projectId: invitation.project_id });
}
