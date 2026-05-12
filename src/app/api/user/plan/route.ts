import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const [profileResult, projectCountResult, messageCountResult] = await Promise.all([
    supabase.from('profiles').select('plan, stripe_customer_id, stripe_subscription_id').eq('id', user.id).maybeSingle(),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('messages').select('id', { count: 'exact', head: true }).eq('role', 'user').gte('created_at', startOfMonth.toISOString()),
  ]);

  const plan = (profileResult.data?.plan as 'free' | 'pro') ?? 'free';
  const projectCount = projectCountResult.count ?? 0;
  const monthlyMessageCount = messageCountResult.count ?? 0;
  const hasStripeCustomer = !!profileResult.data?.stripe_customer_id;

  return NextResponse.json({ plan, projectCount, monthlyMessageCount, hasStripeCustomer });
}
