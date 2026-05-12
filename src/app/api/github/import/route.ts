import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { mapProject } from '@/lib/projects/mappers'

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

  return {
    name: repoData.name as string,
    description: (repoData.description as string | null) ?? '',
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
    .select('github_token')
    .eq('id', user.id)
    .single()

  if (!profile?.github_token) {
    return NextResponse.json({ error: 'No GitHub token. Sign in with GitHub first.' }, { status: 403 })
  }

  const body = (await request.json()) as { owner: string; repo: string; goals?: string; blockers?: string; targetUser?: string }

  if (!body.owner || !body.repo) {
    return NextResponse.json({ error: 'owner and repo are required' }, { status: 400 })
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
