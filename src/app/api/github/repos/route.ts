import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { userHasGitHubProvider } from '@/lib/auth/providers'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('github_token')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.github_token || !userHasGitHubProvider(user)) {
    return NextResponse.json({ error: 'No GitHub token. Sign in with GitHub first.' }, { status: 403 })
  }

  const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100&type=owner', {
    headers: {
      Authorization: `Bearer ${profile.github_token}`,
      Accept: 'application/vnd.github+json',
    },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'GitHub API error' }, { status: res.status })
  }

  const repos = await res.json() as Array<{
    id: number
    name: string
    full_name: string
    description: string | null
    html_url: string
    owner: { login: string }
    language: string | null
    private: boolean
    updated_at: string
  }>

  return NextResponse.json(
    repos.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      url: r.html_url,
      owner: r.owner.login,
      language: r.language,
      private: r.private,
      updatedAt: r.updated_at,
    }))
  )
}
