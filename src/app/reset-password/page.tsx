'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react'
import { updatePassword } from '@/app/actions/auth'
import { LinnaMark } from '@/components/linna-mark'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const result = await updatePassword(password)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <div className="hidden lg:flex lg:w-[52%] bg-foreground text-background flex-col p-14 relative overflow-hidden border-r-2 border-foreground">
        <div className="pointer-events-none select-none" aria-hidden>
          <div className="absolute top-16 right-12 w-20 h-20 border-2 border-background/15 rotate-12" />
          <div className="absolute bottom-24 left-10 w-14 h-14 border-2 border-background/10 rounded-full -rotate-6" />
          <div className="absolute top-1/2 right-1/4 w-8 h-8 border-2 border-background/10 rotate-3" />
        </div>

        <Link href="/" className="flex items-center gap-3 mb-16 z-10">
          <div className="w-9 h-9 bg-background/10 border-2 border-background/25 flex items-center justify-center shrink-0">
            <LinnaMark className="w-5 h-5 text-background" />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight">Linna</span>
        </Link>

        <div className="z-10 my-auto max-w-sm">
          <div className="inline-flex items-center gap-2 bg-sky-300 border-2 border-sky-300 px-3 py-1 text-xs font-bold text-foreground mb-8 paper-shadow-sm">
            NEW PASSWORD
          </div>
          <h2 className="font-headline text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Secure your Linna account.
          </h2>
          <p className="text-background/60 text-sm leading-relaxed">
            Choose a new password, then continue back to your projects.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">
          <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 bg-foreground border-2 border-foreground flex items-center justify-center shrink-0">
              <LinnaMark className="w-4 h-4 text-background" />
            </div>
            <span className="font-headline text-xl font-bold">Linna</span>
          </Link>

          <Link
            href="/forgot-password"
            className="mb-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Request a new link
          </Link>

          <div className="mb-8">
            <div className="mb-6 flex h-10 w-10 items-center justify-center border-2 border-foreground bg-sky-200">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="font-headline text-3xl font-black mb-1.5">Set a new password</h1>
            <p className="font-mono text-xs text-foreground/45">
              Enter a new password for your Linna account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 mb-1.5 block">
                New password
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 mb-1.5 block">
                Confirm password
              </label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                minLength={6}
                className="w-full rounded-none border-2 border-foreground bg-background px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-0 focus:border-foreground"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 border-2 border-red-400 bg-red-50 px-3 py-2.5">
                <span className="text-red-500 mt-0.5 text-xs">x</span>
                <p className="font-mono text-xs text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-none border-2 border-foreground bg-foreground py-3 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-background hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed paper-btn-dark"
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
