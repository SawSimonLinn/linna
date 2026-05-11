'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp, signInWithGoogle } from '@/app/actions/auth'
import { LinnaMark } from '@/components/linna-mark'
import { Zap, Layers, ShieldCheck, Check, Eye, EyeOff } from 'lucide-react'

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

const perks = [
  { icon: <Zap className="w-4 h-4" />, title: 'Free to start', desc: 'No credit card required. Get your first project running in 60 seconds.' },
  { icon: <Layers className="w-4 h-4" />, title: 'Multiple projects', desc: 'Manage all your side projects with full context always loaded.' },
  { icon: <ShieldCheck className="w-4 h-4" />, title: 'Open source', desc: 'Full codebase on GitHub. Self-host or use our cloud — your choice.' },
]

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setLoading(true)
    setError(null)
    const result = await signUp(
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

  return (
    <div className="flex min-h-screen">

      {/* ── Left panel ───────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-foreground text-background flex-col p-14 relative overflow-hidden border-r-2 border-foreground">

        {/* Decorative shapes */}
        <div className="pointer-events-none select-none" aria-hidden>
          <div className="absolute top-20 right-10 w-24 h-24 border-2 border-background/10 rotate-[-12deg]" />
          <div className="absolute bottom-32 left-8 w-12 h-12 border-2 border-background/10 rounded-full rotate-6" />
          <div className="absolute top-2/3 right-1/3 w-8 h-8 border-2 border-background/10 rotate-[-3deg]" />
          <div className="absolute top-36 right-1/3 w-10 h-10 bg-sky-300/10 border-2 border-sky-300/20 rotate-6" />
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
          <div className="inline-flex items-center gap-2 bg-sky-300 border-2 border-sky-300 px-3 py-1 text-xs font-bold text-foreground mb-8 paper-shadow-sm">
            FREE TO START
          </div>

          <h2 className="font-headline text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Give your project<br />a brain.
          </h2>

          <p className="text-background/60 text-sm leading-relaxed mb-12 max-w-sm">
            Join indie hackers and solo builders who ship faster because they never have to re-explain their project again.
          </p>

          <div className="space-y-6">
            {perks.map((p) => (
              <div key={p.title} className="flex items-start gap-4">
                <div className="w-9 h-9 bg-background/10 border-2 border-background/20 flex items-center justify-center shrink-0 mt-0.5">
                  {p.icon}
                </div>
                <div>
                  <p className="font-bold text-sm mb-0.5">{p.title}</p>
                  <p className="text-xs text-background/55 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="z-10 mt-12 grid grid-cols-3 gap-3">
          {[
            { value: '100%', label: 'Open source' },
            { value: 'MIT', label: 'License' },
            { value: '60s', label: 'To first project' },
          ].map((s) => (
            <div key={s.label} className="border-2 border-background/15 bg-background/5 p-4 text-center">
              <p className="font-headline text-2xl font-bold mb-1">{s.value}</p>
              <p className="font-mono text-[10px] text-background/45 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
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
            <h1 className="font-headline text-3xl font-black mb-1.5">Create account</h1>
            <p className="font-mono text-xs text-foreground/45">Give your projects a memory.</p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 border-2 border-foreground bg-white py-3 font-mono text-xs uppercase tracking-[0.15em] paper-btn hover:bg-foreground/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <GoogleIcon />
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

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
              <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  minLength={6}
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
              <p className="mt-1.5 font-mono text-[10px] text-foreground/35">Minimum 6 characters.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 border-2 border-red-400 bg-red-50 px-3 py-2.5">
                <span className="text-red-500 mt-0.5 text-xs">✕</span>
                <p className="font-mono text-xs text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-none border-2 border-foreground bg-foreground py-3 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-background hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed paper-btn-dark"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          {/* Terms note */}
          <p className="mt-4 font-mono text-[10px] text-foreground/30 leading-relaxed text-center">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground/60">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground/60">Privacy Policy</Link>.
          </p>

          {/* Footer */}
          <p className="mt-8 font-mono text-xs text-foreground/45 text-center">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-foreground underline underline-offset-2 hover:text-foreground/70 font-medium">
              Sign in
            </Link>
          </p>

          {/* Trust indicators */}
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            {['MIT License', 'Self-hostable', 'No spam'].map((tag) => (
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
