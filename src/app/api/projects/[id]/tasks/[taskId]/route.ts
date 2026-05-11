import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { mapTask } from '@/lib/projects/mappers';

type RouteContext = {
  params: Promise<{ id: string; taskId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, taskId } = await context.params;
  const body = (await request.json()) as { completed?: boolean; title?: string };

  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...(body.completed !== undefined ? { completed: body.completed } : {}),
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
    })
    .eq('id', taskId)
    .eq('project_id', id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: allTasks } = await supabase
    .from('tasks')
    .select('completed')
    .eq('project_id', id);

  if (allTasks) {
    await supabase
      .from('projects')
      .update({
        task_count: allTasks.length,
        completed_task_count: allTasks.filter((t) => t.completed).length,
      })
      .eq('id', id);
  }

  return NextResponse.json(mapTask(data));
}

export async function DELETE(_: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, taskId } = await context.params;

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('project_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: allTasks } = await supabase
    .from('tasks')
    .select('completed')
    .eq('project_id', id);

  if (allTasks) {
    await supabase
      .from('projects')
      .update({
        task_count: allTasks.length,
        completed_task_count: allTasks.filter((t) => t.completed).length,
      })
      .eq('id', id);
  }

  return NextResponse.json({ ok: true });
}
