import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ id: string; memberId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, memberId } = await context.params;

  // RLS handles the "owner or self" check — just attempt the delete
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('id', memberId)
    .eq('project_id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to remove member.' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
