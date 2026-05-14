'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase/server'

async function getOrigin() {
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

export async function signIn(email: string, password: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signUp(email: string, password: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signInWithGoogle() {
  const supabase = await createSupabaseServerClient()
  const redirectTo = `${await getOrigin()}/auth/callback?provider=google`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
  if (error) return { error: error.message }
  if (data.url) redirect(data.url)
}

export async function signInWithGitHub() {
  const supabase = await createSupabaseServerClient()
  const redirectTo = `${await getOrigin()}/auth/callback?provider=github`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo,
      scopes: 'repo read:user',
    },
  })
  if (error) return { error: error.message }
  if (data.url) redirect(data.url)
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/sign-in')
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return { error: 'Email is required.' }

  const supabase = await createSupabaseServerClient()
  const resetRedirectTo = new URL('/auth/callback', await getOrigin())
  resetRedirectTo.searchParams.set('next', '/reset-password')

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: resetRedirectTo.toString(),
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePassword(password: string) {
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Password reset link expired. Request a new reset email.' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  redirect('/dashboard')
}
