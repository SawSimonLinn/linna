'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn, signInWithGitHub, signInWithGoogle } from '@/app/actions/auth'
import { LinnaMark } from '@/components/linna-mark'
import { Zap, MessageSquare, History, Check, Eye, EyeOff } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

const features = [
  { icon: <Zap className="w-4 h-4" />, text: 'Project memory for your stack, goals, blockers, decisions, and chat history' },
  { icon: <MessageSquare className="w-4 h-4" />, text: 'Context-aware answers grounded in your project' },
  { icon: <History className="w-4 h-4" />, text: 'Every session picks up exactly where you left off' },
]

export default function SignInPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'oauth'
      ? 'OAuth sign-in failed. If you already have an account with this email, try signing in with that method first.'
      : null
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('error') === 'oauth') {
      setError('OAuth sign-in failed. If you already have an account with this email, try signing in with that method first.')
    }
  }, [searchParams])
  const [googleLoading, setGoogleLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setLoading(true)
    setError(null)
    const result = await signIn(
      formData.get('email') as string,
      formData.get('password') as string,
    )
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError(null)
    const result = await signInWithGoogle()
    if (result?.error) {
      setError(result.error)
      setGoogleLoading(false)
    }
  }

  async function handleGitHub() {
    setGithubLoading(true)
    setError(null)
    const result = await signInWithGitHub()
    if (result?.error) {
      setError(result.error)
      setGithubLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left panel ───────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-foreground text-background flex-col p-14 relative overflow-hidden border-r-2 border-foreground">

        {/* Decorative shapes */}
        <div className="pointer-events-none select-none" aria-hidden>
          <div className="absolute top-16 right-12 w-20 h-20 border-2 border-background/15 rotate-12" />
          <div className="absolute bottom-24 left-10 w-14 h-14 border-2 border-background/10 rounded-full -rotate-6" />
          <div className="absolute top-1/2 right-1/4 w-8 h-8 border-2 border-background/10 rotate-3" />
          <div className="absolute bottom-40 right-16 w-10 h-10 bg-yellow-300/10 border-2 border-yellow-300/20 rotate-[-8deg]" />
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-16 z-10">
          <div className="w-9 h-9 bg-background/10 border-2 border-background/25 flex items-center justify-center shrink-0">
            <LinnaMark className="w-5 h-5 text-background" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight">Linna</span>
        </Link>

        {/* Headline */}
        <div className="z-10 my-auto">
          <div className="inline-flex items-center gap-2 bg-yellow-300 border-2 border-yellow-300 px-3 py-1 text-xs font-bold text-foreground mb-8 paper-shadow-sm">
            <Zap className="w-3 h-3" />
            PROJECT-AWARE AI
          </div>

          <h2 className="font-headline text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Your project has a<br />
            <span className="relative inline-block mt-1">
              <span className="relative z-10 px-1">memory</span>
              <span className="absolute inset-x-0 bottom-1 h-4 bg-yellow-300/20 -z-0 rotate-[-1deg]" />
            </span>{' '}now.
          </h2>

          <p className="text-background/60 text-sm leading-relaxed mb-10 max-w-sm">
            Stop re-explaining your project every session. Linna remembers your stack, goals, blockers, decisions, and chat history so you can focus on building.
          </p>

          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f.text} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-background/10 border-2 border-background/20 flex items-center justify-center shrink-0 mt-0.5">
                  {f.icon}
                </div>
                <span className="text-sm text-background/75 leading-relaxed">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className="z-10 border-2 border-background/20 bg-background/5 p-6 mt-12">
          <p className="text-sm text-background/75 leading-relaxed mb-4 italic">
            &ldquo;Linna keeps my project context together. I stopped explaining my stack, blockers, and decisions from scratch.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-300 border-2 border-background/20 flex items-center justify-center font-bold text-foreground text-xs">
              MK
            </div>
            <div>
              <p className="text-xs font-bold text-background">Marcus K.</p>
              <p className="text-[10px] text-background/50 font-mono">Indie hacker, SaaS founder</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-paper">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 bg-foreground border-2 border-foreground flex items-center justify-center shrink-0">
              <LinnaMark className="w-4 h-4 text-background" />
            </div>
            <span className="font-headline text-xl font-bold">Linna</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-headline text-3xl font-black mb-1.5">Welcome back</h1>
            <p className="font-mono text-xs text-foreground/45">Sign in to continue to Linna.</p>
          </div>

          {/* OAuth buttons */}
          <div className="flex flex-col gap-3 mb-6">
            <button
              onClick={handleGitHub}
              disabled={githubLoading || googleLoading || loading}
              className="grid w-full grid-cols-[1fr_auto] items-center gap-3 border-2 border-foreground bg-white px-3 py-3 font-mono text-xs uppercase tracking-[0.15em] paper-btn hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex min-w-0 items-center justify-center gap-3">
                <GithubIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">{githubLoading ? 'Redirecting…' : 'Continue with GitHub'}</span>
              </span>
              <span className="shrink-0 border border-yellow-400 bg-yellow-100 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em]">
                Recommended
              </span>
            </button>
            <button
              onClick={handleGoogle}
              disabled={googleLoading || githubLoading || loading}
              className="w-full flex items-center justify-center gap-3 border-2 border-foreground bg-white py-3 font-mono text-xs uppercase tracking-[0.15em] paper-btn hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleIcon />
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center mb-6">
            <div className="flex-1 border-t-2 border-foreground/10" />
            <span className="mx-4 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/35">or</span>
            <div className="flex-1 border-t-2 border-foreground/10" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 mb-1.5 block">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-none border-2 border-foreground bg-background px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-0 focus:border-foreground placeholder:text-foreground/25"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50">
                  Password
                </label>
                <Link href="/forgot-password" className="font-mono text-[10px] text-foreground/40 hover:text-foreground underline underline-offset-2 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-none border-2 border-foreground bg-background px-3 py-2.5 pr-10 font-mono text-sm focus:outline-none focus:ring-0 focus:border-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 border-2 border-red-400 bg-red-50 px-3 py-2.5">
                <span className="text-red-500 mt-0.5 text-xs">✕</span>
                <p className="font-mono text-xs text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading || githubLoading}
              className="w-full rounded-none border-2 border-foreground bg-foreground py-3 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-background hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed paper-btn-dark"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 font-mono text-xs text-foreground/45 text-center">
            No account?{' '}
            <Link href="/sign-up" className="text-foreground underline underline-offset-2 hover:text-foreground/70 font-medium">
              Create one free
            </Link>
          </p>

          {/* Trust indicators */}
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            {['MIT License', 'Open Source', 'No credit card'].map((tag) => (
              <span key={tag} className="flex items-center gap-1 font-mono text-[10px] text-foreground/35">
                <Check className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
