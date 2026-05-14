import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { userHasGitHubProvider } from '@/lib/auth/providers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const provider = searchParams.get('provider')

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.session) {
      const { session } = data
      const isGitHubCallback =
        provider === 'github' || (!provider && userHasGitHubProvider(session.user))

      await supabase.from('profiles').upsert({
        id: session.user.id,
        updated_at: new Date().toISOString(),
        ...(isGitHubCallback && session.provider_token ? { github_token: session.provider_token } : {}),
      })
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=oauth`)
}
