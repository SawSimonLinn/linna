import { auth } from '@clerk/nextjs/server';
import { openai } from '@ai-sdk/openai';
import { generateText, Output } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { mapTask } from '@/lib/projects/mappers';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', id)
    .order('order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(mapTask));
}

export async function POST(request: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const body = (await request.json()) as { title?: string; fromMvp?: string };

  const supabase = await createSupabaseServerClient();

  // Generate tasks from MVP scope via AI
  if (body.fromMvp) {
    const { output } = await generateText({
      model: openai('gpt-4o-mini'),
      output: Output.object({
        schema: z.object({
          tasks: z.array(z.object({ title: z.string() })),
        }),
      }),
      prompt: `You are a project planning assistant. Break the following MVP scope into a clear, actionable task list. Each task should be a single concrete action (e.g. "Build user auth flow", "Design dashboard layout"). Return 5–15 tasks max. Do not include numbering or bullet prefixes in the titles.\n\nMVP Scope:\n${body.fromMvp}`,
    });

    // Save MVP scope on project
    await supabase.from('projects').update({ mvp_scope: body.fromMvp }).eq('id', id);

    const inserts = output.tasks.map((t, i) => ({
      project_id: id,
      title: t.title,
      order: i,
    }));

    const { data, error } = await supabase.from('tasks').insert(inserts).select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await syncTaskCounts(supabase, id);
    return NextResponse.json(data.map(mapTask), { status: 201 });
  }

  // Add a single task manually
  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Task title is required.' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('tasks')
    .select('order')
    .eq('project_id', id)
    .order('order', { ascending: false })
    .limit(1)
    .single();

  const nextOrder = existing ? existing.order + 1 : 0;

  const { data, error } = await supabase
    .from('tasks')
    .insert({ project_id: id, title: body.title.trim(), order: nextOrder })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await syncTaskCounts(supabase, id);
  return NextResponse.json(mapTask(data), { status: 201 });
}

async function syncTaskCounts(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  projectId: string,
) {
  const { data } = await supabase
    .from('tasks')
    .select('completed')
    .eq('project_id', projectId);

  if (!data) return;
  await supabase
    .from('projects')
    .update({ task_count: data.length, completed_task_count: data.filter((t) => t.completed).length })
    .eq('id', projectId);
}
