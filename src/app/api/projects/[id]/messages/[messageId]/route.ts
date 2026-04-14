import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ id: string; messageId: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, messageId } = await context.params;
  const supabase = await createSupabaseServerClient();

  // Verify the message belongs to a project owned by this user
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)
    .eq('project_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
