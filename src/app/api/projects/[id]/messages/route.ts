import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { mapMessage } from '@/lib/projects/mappers';
import type { Database } from '@/lib/supabase/types';
import { FREE_PLAN_LIMITS, getFreePlanHistoryCutoff } from '@/lib/plan-limits';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type NewMessage = Pick<Database['public']['Tables']['messages']['Insert'], 'content' | 'role'>;

export async function GET(_: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle();
  const plan = profile?.plan ?? 'free';

  let query = supabase
    .from('messages')
    .select('*')
    .eq('project_id', id);

  if (plan === 'free') {
    query = query.gte('created_at', getFreePlanHistoryCutoff().toISOString());
  }

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data.map(mapMessage));
}

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Partial<NewMessage>;

  if (!body.content?.trim() || !body.role) {
    return NextResponse.json({ error: 'Message content and role are required.' }, { status: 400 });
  }

  if (body.content.length > 10000) {
    return NextResponse.json({ error: 'Message is too long. Please keep it under 10,000 characters.' }, { status: 400 });
  }

  // Enforce free plan monthly message limit (only count user-sent messages)
  if (body.role === 'user') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .maybeSingle();

    if ((profile?.plan ?? 'free') === 'free') {
      const startOfMonth = new Date();
      startOfMonth.setUTCDate(1);
      startOfMonth.setUTCHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'user')
        .gte('created_at', startOfMonth.toISOString());

      if ((count ?? 0) >= FREE_PLAN_LIMITS.monthlyMessages) {
        return NextResponse.json(
          { error: `You have reached the ${FREE_PLAN_LIMITS.monthlyMessages} messages/month limit on the free plan. Upgrade to Pro for unlimited messages.`, code: 'MESSAGE_LIMIT' },
          { status: 403 },
        );
      }
    }
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      project_id: id,
      role: body.role,
      content: body.content.trim(),
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: project } = await supabase.from('projects').select('message_count').eq('id', id).maybeSingle();
  const nextCount = (project?.message_count || 0) + 1;

  await supabase
    .from('projects')
    .update({
      last_active: new Date().toISOString(),
      message_count: nextCount,
    })
    .eq('id', id);

  return NextResponse.json(mapMessage(data), { status: 201 });
}
