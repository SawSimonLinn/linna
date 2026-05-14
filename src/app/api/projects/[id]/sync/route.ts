import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { mapProject } from '@/lib/projects/mappers'
import { userHasGitHubProvider } from '@/lib/auth/providers'

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
    readme: readmeText,
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: project } = await supabase
    .from('projects')
    .select('github_owner, github_repo_name')
    .eq('id', id)
    .maybeSingle()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  if (!project.github_owner || !project.github_repo_name) {
    return NextResponse.json({ error: 'Project has no linked GitHub repo' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_token')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.github_token || !userHasGitHubProvider(user)) {
    return NextResponse.json({ error: 'No GitHub token. Sign in with GitHub first.' }, { status: 403 })
  }

  const repoData = await fetchRepoData(project.github_owner, project.github_repo_name, profile.github_token)

  const { data, error } = await supabase
    .from('projects')
    .update({ ...repoData, last_synced_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json(mapProject(data))
}
