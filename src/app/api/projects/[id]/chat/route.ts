import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { mapMessage } from '@/lib/projects/mappers';
import { extractDecisions } from '@/ai/flows/extract-decisions-flow';
import { FREE_PLAN_LIMITS, getFreePlanHistoryCutoff } from '@/lib/plan-limits';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ChatRequestBody = {
  userMessage: string;
};

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.userMessage?.trim()) {
    return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
  }

  if (body.userMessage.length > 50000) {
    return NextResponse.json({ error: 'Message is too long. Please keep it under 50,000 characters.' }, { status: 400 });
  }

  // Fetch project (RLS allows owners + team members)
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
  }

  // Enforce free plan monthly limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle();
  const plan = profile?.plan ?? 'free';

  if (plan === 'free') {
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

  const historyCutoff = plan === 'free' ? getFreePlanHistoryCutoff().toISOString() : null;
  const existingMessagesQuery = historyCutoff
    ? supabase
        .from('messages')
        .select('*')
        .eq('project_id', id)
        .gte('created_at', historyCutoff)
        .order('created_at', { ascending: true })
    : supabase
        .from('messages')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });
  const pinnedMessagesQuery = historyCutoff
    ? supabase
        .from('messages')
        .select('content, role')
        .eq('project_id', id)
        .eq('pinned', true)
        .gte('created_at', historyCutoff)
        .order('created_at', { ascending: true })
    : supabase
        .from('messages')
        .select('content, role')
        .eq('project_id', id)
        .eq('pinned', true)
        .order('created_at', { ascending: true });

  // Load existing chat history and pinned messages in parallel
  const [{ data: existingMessages }, { data: pinnedMessages }] = await Promise.all([
    existingMessagesQuery,
    pinnedMessagesQuery,
  ]);

  // Save user message
  const { data: userMsgRow, error: userMsgError } = await supabase
    .from('messages')
    .insert({ project_id: id, role: 'user', content: body.userMessage.trim() })
    .select('*')
    .single();

  if (userMsgError || !userMsgRow) {
    return NextResponse.json({ error: 'Failed to save message.' }, { status: 500 });
  }

  await supabase
    .from('projects')
    .update({ last_active: new Date().toISOString(), message_count: (project.message_count || 0) + 1 })
    .eq('id', id);

  const userMsg = mapMessage(userMsgRow);

  const pinnedSection = pinnedMessages && pinnedMessages.length > 0
    ? `\n\nPinned decisions and notes from previous sessions:\n${pinnedMessages.map((m) => `- [${m.role}]: ${m.content}`).join('\n')}`
    : '';

  const readmeSection = project.readme
    ? `\n\nProject README (for technical context):\n${project.readme.slice(0, 4000)}${project.readme.length > 4000 ? '\n[README truncated]' : ''}`
    : '';

  const systemPrompt = `You are Linna, a highly intelligent and project-aware AI assistant designed to help developers. You specialize in understanding project context and providing relevant, personalized advice and answers without needing details re-explained.

Here is the full context for the project you are assisting with:
Project Name: ${project.name}
Description: ${project.description}
Target User: ${project.target_user}
Tech Stack: ${project.tech_stack}
Current Goals: ${project.goals}
Known Blockers: ${project.blockers}${pinnedSection}${readmeSection}

Be specific, grounded in the project context above, and reference details from the conversation history where relevant.`;

  const chatMessages = [
    ...(existingMessages ?? []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: body.userMessage.trim() },
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // controller may already be closed
        }
      };

      // Immediately notify client of the saved user message
      send({ type: 'user_message', message: userMsg });

      try {
        const model = plan === 'free' ? 'gpt-4o-mini' : 'gpt-4o';
        const result = streamText({
          model: openai(model),
          system: systemPrompt,
          messages: chatMessages,
          maxRetries: 3,
        });

        let fullText = '';
        for await (const chunk of result.textStream) {
          fullText += chunk;
          send({ type: 'chunk', text: chunk });
        }

        // Save assistant message
        const { data: aiMsgRow } = await supabase
          .from('messages')
          .insert({ project_id: id, role: 'assistant', content: fullText })
          .select('*')
          .single();

        if (!aiMsgRow) throw new Error('Failed to save assistant message.');

        await supabase
          .from('projects')
          .update({ last_active: new Date().toISOString(), message_count: (project.message_count || 0) + 2 })
          .eq('id', id);

        // Run decision extraction before closing — small latency cost but stream is already done
        const decision = await extractDecisions({
          lastUserMessage: body.userMessage.trim(),
          lastAssistantMessage: fullText,
          currentProject: {
            description: project.description,
            techStack: project.tech_stack,
            goals: project.goals,
            blockers: project.blockers,
            targetUser: project.target_user,
          },
        }).catch(() => null);

        send({ type: 'done', message: mapMessage(aiMsgRow), decision });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred. Please try again.';
        send({ type: 'error', message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
