import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ id: string; invitationId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, invitationId } = await context.params;

  // RLS ensures only the project owner can delete invitations
  const { error } = await supabase
    .from('project_invitations')
    .delete()
    .eq('id', invitationId)
    .eq('project_id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to cancel invitation.' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
