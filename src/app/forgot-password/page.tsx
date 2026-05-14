'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import { requestPasswordReset } from '@/app/actions/auth'
import { LinnaMark } from '@/components/linna-mark'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await requestPasswordReset(email)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
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
          <div className="inline-flex items-center gap-2 bg-yellow-300 border-2 border-yellow-300 px-3 py-1 text-xs font-bold text-foreground mb-8 paper-shadow-sm">
            ACCOUNT RECOVERY
          </div>
          <h2 className="font-headline text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Get back to your project memory.
          </h2>
          <p className="text-background/60 text-sm leading-relaxed">
            Send yourself a secure reset link, choose a new password, and return to your dashboard.
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
            href="/sign-in"
            className="mb-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to sign in
          </Link>

          {sent ? (
            <div>
              <div className="mb-6 flex h-10 w-10 items-center justify-center border-2 border-foreground bg-green-200">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h1 className="font-headline text-3xl font-black mb-1.5">Check your email</h1>
              <p className="font-mono text-xs text-foreground/50 leading-5">
                We sent a password reset link to {email.trim()}. Open it to set a new password.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-headline text-3xl font-black mb-1.5">Forgot password?</h1>
                <p className="font-mono text-xs text-foreground/45">Enter your email and we will send a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/50 mb-1.5 block">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full rounded-none border-2 border-foreground bg-background px-3 py-2.5 pl-10 font-mono text-sm focus:outline-none focus:ring-0 focus:border-foreground placeholder:text-foreground/25"
                    />
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
                  </div>
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
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
