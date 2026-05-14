import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { mapProject } from '@/lib/projects/mappers'
import { FREE_PLAN_LIMITS } from '@/lib/plan-limits'
import { userHasGitHubProvider } from '@/lib/auth/providers'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

async function generateDescriptionFromReadme(readme: string, repoName: string): Promise<string> {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: `Write a single concise sentence (max 120 characters) describing this project based on its README. Return only the sentence, no quotes or punctuation at the end.

Project name: ${repoName}

README:
${readme.slice(0, 3000)}`,
  })
  return text.trim().replace(/[."']$/, '')
}

async function fetchRepoData(owner: string, repo: string, token: string) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  }

  const [repoRes, langRes, issuesRes, readmeRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=50`, { headers }),
    fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers }),
  ])

  const [repoData, languages, issues] = await Promise.all([
    repoRes.json(),
    langRes.ok ? langRes.json() : {},
    issuesRes.ok ? issuesRes.json() : [],
  ])

  let readmeText = ''
  if (readmeRes.ok) {
    const readme = await readmeRes.json()
    try { readmeText = atob(readme.content.replace(/\n/g, '')) } catch { /* no readme */ }
  }

  const blockers = (issues as Array<{ labels: Array<{ name: string }>; title: string }>)
    .filter((i) => i.labels.some((l) => ['bug', 'blocker', 'help wanted'].includes(l.name)))
    .map((i) => i.title)
    .join('\n')

  const goals = (issues as Array<{ labels: Array<{ name: string }>; title: string }>)
    .filter((i) => i.labels.some((l) => ['enhancement', 'feature', 'goal'].includes(l.name)))
    .map((i) => i.title)
    .join('\n')

  const repoDescription = (repoData.description as string | null) ?? ''
  const description = (!repoDescription && readmeText)
    ? await generateDescriptionFromReadme(readmeText, repoData.name as string)
    : repoDescription

  return {
    name: repoData.name as string,
    description,
    tech_stack: Object.keys(languages as Record<string, number>).join(', '),
    goals,
    blockers,
    github_repo_url: repoData.html_url as string,
    github_repo_name: repo,
    github_owner: owner,
    readme: readmeText,
  }
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_token, plan')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.github_token || !userHasGitHubProvider(user)) {
    return NextResponse.json({ error: 'No GitHub token. Sign in with GitHub first.' }, { status: 403 })
  }

  const body = (await request.json()) as { owner: string; repo: string; goals?: string; blockers?: string; targetUser?: string }

  if (!body.owner || !body.repo) {
    return NextResponse.json({ error: 'owner and repo are required' }, { status: 400 })
  }

  if ((profile.plan ?? 'free') === 'free') {
    const { count } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= FREE_PLAN_LIMITS.projects) {
      return NextResponse.json(
        { error: `Free plan is limited to ${FREE_PLAN_LIMITS.projects} projects. Upgrade to Pro for unlimited projects.`, code: 'PLAN_LIMIT' },
        { status: 403 },
      )
    }
  }

  const repoData = await fetchRepoData(body.owner, body.repo, profile.github_token)

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      ...repoData,
      goals: body.goals || repoData.goals,
      blockers: body.blockers || repoData.blockers,
      target_user: body.targetUser ?? '',
      last_synced_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(mapProject(data), { status: 201 })
}
