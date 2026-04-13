import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LinnaMark } from '@/components/linna-mark';
import {
  Zap,
  MessageSquare,
  Sparkles,
  Layers,
  History,
  ShieldCheck,
  ArrowRight,
  Check,
} from 'lucide-react';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default async function LandingPage() {
  const { userId } = await auth();
  const primaryHref = userId ? '/dashboard' : '/sign-up';
  const primaryLabel = userId ? 'Go to dashboard' : 'Get started free';

  return (
    <div className="flex flex-col min-h-screen bg-paper font-body">

      {/* ─── Navbar ──────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-paper border-b-2 border-foreground">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-foreground border-2 border-foreground flex items-center justify-center paper-shadow-sm shrink-0">
                <LinnaMark className="w-4 h-4 text-background" />
              </div>
              <span className="font-headline text-xl font-bold">Linna</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="#features" className="hover:underline underline-offset-2">Features</Link>
              <Link href="/pricing" className="hover:underline underline-offset-2">Pricing</Link>
              <Link href="/open-source" className="hover:underline underline-offset-2">Open Source</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="https://github.com/sawsimonlinn/linna"
              target="_blank"
              className="hidden sm:flex items-center gap-2 text-sm font-medium border-2 border-foreground bg-white px-3 py-1.5 paper-btn"
            >
              <GithubIcon className="w-4 h-4" />
              GitHub
            </Link>
            <Button
              asChild
              className="border-2 border-foreground bg-foreground text-background paper-btn-dark font-bold"
            >
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">

        {/* ─── Hero ────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b-2 border-foreground py-20 md:py-32">

          {/* Scattered decorative paper shapes */}
          <div className="pointer-events-none select-none">
            <div className="absolute top-12 left-6 w-20 h-20 bg-yellow-200 border-2 border-foreground rotate-12 paper-shadow-sm opacity-80" />
            <div className="absolute top-8 right-20 w-14 h-14 bg-sky-200 border-2 border-foreground -rotate-6 paper-shadow-sm opacity-80 rounded-full" />
            <div className="absolute bottom-16 left-1/3 w-10 h-10 bg-green-200 border-2 border-foreground rotate-3 paper-shadow-sm opacity-80" />
            <div className="absolute top-1/2 right-8 w-16 h-16 bg-pink-200 border-2 border-foreground rotate-[-8deg] paper-shadow-sm opacity-80" />
            <div className="absolute bottom-8 right-1/4 w-8 h-8 bg-orange-200 border-2 border-foreground rotate-6 paper-shadow-sm opacity-80 rounded-full" />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-yellow-300 border-2 border-foreground px-3 py-1 text-xs font-bold mb-8 paper-shadow-sm rotate-[-1deg]">
              <Zap className="w-3 h-3" />
              OPEN SOURCE AI DEV TOOL
            </div>

            {/* Headline */}
            <h1 className="font-headline text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              Your project has a{' '}
              <span className="relative inline-block">
                <span className="relative z-10 px-1">memory</span>
                <span className="absolute inset-x-0 bottom-1 h-5 bg-yellow-300 -z-0 rotate-[-1deg]" aria-hidden />
              </span>
              {' '}now.
            </h1>

            <p className="max-w-xl mx-auto text-lg md:text-xl mb-10 leading-relaxed text-foreground/75">
              Linna is a project-aware AI assistant that picks up exactly where you left off.
              No more re-explaining your stack, goals, or blockers.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base font-bold border-2 border-foreground bg-foreground text-background paper-btn-dark"
              >
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base font-medium border-2 border-foreground bg-white paper-btn"
              >
                <Link href="https://github.com/sawsimonlinn/linna" target="_blank">
                  <GithubIcon className="w-4 h-4 mr-2" />
                  View on GitHub
                </Link>
              </Button>
            </div>

            {/* Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-medium">
              {['MIT License', 'Open Source', 'Self-hostable', 'No credit card needed'].map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-white border-2 border-foreground px-3 py-1 paper-shadow-sm">
                  <Check className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Chat Mockup */}
            <div className="mt-20 max-w-4xl mx-auto border-2 border-foreground paper-shadow-xl bg-white rotate-[-0.4deg]">
              {/* Title bar */}
              <div className="bg-foreground h-10 flex items-center px-4 gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full border-2 border-white/30" />
                  <div className="w-3 h-3 rounded-full border-2 border-white/30" />
                  <div className="w-3 h-3 rounded-full border-2 border-white/30" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/10 border border-white/20 px-10 py-1 text-[10px] text-white/60 font-code">
                    linna.dev/project/my-saas
                  </div>
                </div>
              </div>
              {/* Mock UI */}
              <div className="flex h-64 bg-paper/50">
                <div className="w-48 border-r-2 border-foreground bg-white p-4 hidden md:block text-left">
                  <div className="w-24 h-4 bg-foreground/10 border border-foreground/20 mb-5" />
                  <div className="space-y-2">
                    {[100, 80, 90].map((w, i) => (
                      <div key={i} className="h-3 bg-yellow-100 border border-foreground/15" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
                <div className="flex-1 p-6 flex flex-col gap-4 relative">
                  <div className="self-start bg-sky-100 border-2 border-foreground px-4 py-2 text-sm max-w-[75%] paper-shadow-sm">
                    Welcome back! You were working on the Supabase integration. Should we finish the auth logic?
                  </div>
                  <div className="self-end bg-foreground text-background border-2 border-foreground px-4 py-2 text-sm max-w-[65%] paper-shadow-sm">
                    Yes, help me write the RLS policies for the projects table.
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 h-10 bg-white border-2 border-foreground flex items-center px-4 text-foreground/40 text-sm">
                    Ask Linna anything...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Features ─────────────────────────────────────────────── */}
        <section id="features" className="py-24 bg-white border-b-2 border-foreground">
          <div className="container mx-auto px-4">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
              <div>
                <div className="inline-block bg-green-200 border-2 border-foreground px-3 py-1 text-xs font-bold mb-4 paper-shadow-sm">
                  FEATURES
                </div>
                <h2 className="font-headline text-3xl md:text-5xl font-bold leading-tight">
                  Everything you need to<br />stop starting over.
                </h2>
              </div>
              <p className="text-foreground/70 max-w-xs text-sm leading-relaxed">
                Linna provides a persistent layer of context for your entire development process.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: <Zap className="w-5 h-5" />,
                  title: 'Project Memory',
                  desc: 'Linna remembers your stack, decisions, and goals. Every session picks up exactly where you left off.',
                  bg: 'bg-yellow-100',
                  rotate: '',
                },
                {
                  icon: <MessageSquare className="w-5 h-5" />,
                  title: 'Context-Aware Chat',
                  desc: 'Every answer is grounded in your specific project — not generic advice for the whole internet.',
                  bg: 'bg-sky-100',
                  rotate: 'rotate-[0.5deg]',
                },
                {
                  icon: <Sparkles className="w-5 h-5" />,
                  title: 'Launch Assistant',
                  desc: 'When you\'re ready to ship, Linna writes your Product Hunt post, Reddit launch, and landing page copy.',
                  bg: 'bg-green-100',
                  rotate: 'rotate-[-0.5deg]',
                },
                {
                  icon: <Layers className="w-5 h-5" />,
                  title: 'Multiple Projects',
                  desc: 'Manage all your side projects in one place. Switch instantly with full context always loaded.',
                  bg: 'bg-pink-100',
                  rotate: 'rotate-[0.3deg]',
                },
                {
                  icon: <History className="w-5 h-5" />,
                  title: 'Session History',
                  desc: 'Scroll back through past conversations. Your decisions, ideas, and breakthroughs are always there.',
                  bg: 'bg-violet-100',
                  rotate: 'rotate-[-0.3deg]',
                },
                {
                  icon: <ShieldCheck className="w-5 h-5" />,
                  title: 'Open Source',
                  desc: 'Full codebase on GitHub. Self-host it yourself or use our hosted version — your choice.',
                  bg: 'bg-orange-100',
                  rotate: '',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className={`${f.bg} ${f.rotate} border-2 border-foreground p-6 paper-shadow hover:paper-shadow-sm hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150`}
                >
                  <div className="w-9 h-9 bg-foreground text-background border-2 border-foreground flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="font-headline text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-foreground/75">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How it works ─────────────────────────────────────────── */}
        <section className="py-24 bg-paper border-b-2 border-foreground">
          <div className="container mx-auto px-4">
            <div className="inline-block bg-sky-200 border-2 border-foreground px-3 py-1 text-xs font-bold mb-4 paper-shadow-sm">
              HOW IT WORKS
            </div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-16">Three steps. That&apos;s it.</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { num: '01', title: 'Create a project', desc: 'Name it, describe it, paste in your tech stack. Takes 60 seconds.' },
                { num: '02', title: 'Start chatting', desc: 'Ask questions, get help, think out loud. Linna remembers everything.' },
                { num: '03', title: 'Pick up later', desc: 'Come back tomorrow, next week, whenever. Your context is still there.' },
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-foreground text-background border-2 border-foreground flex items-center justify-center font-headline font-bold text-lg z-10">
                    {step.num}
                  </div>
                  <div className="border-2 border-foreground bg-white p-8 pt-10 paper-shadow">
                    <h3 className="font-headline text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-foreground/75">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Banner ───────────────────────────────────────────── */}
        <section className="py-20 bg-foreground text-background border-b-2 border-foreground relative overflow-hidden">
          <div className="pointer-events-none select-none">
            <div className="absolute top-8 left-12 w-16 h-16 border-2 border-background/20 rotate-12" />
            <div className="absolute bottom-8 right-16 w-10 h-10 border-2 border-background/20 rounded-full -rotate-6" />
            <div className="absolute top-1/2 right-1/3 w-8 h-8 border-2 border-background/20 rotate-3" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="font-headline text-3xl md:text-5xl font-bold mb-4">
              Ready to give your project a brain?
            </h2>
            <p className="text-background/60 mb-10 max-w-lg mx-auto">
              Join indie hackers and solo devs who never re-explain their project again.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base font-bold bg-yellow-300 text-foreground border-2 border-background paper-btn"
              >
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Link
                href="/pricing"
                className="text-sm text-background/70 underline underline-offset-2 hover:text-background transition-colors"
              >
                See pricing →
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-paper border-t-2 border-foreground py-14">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-foreground border-2 border-foreground flex items-center justify-center shrink-0">
                <LinnaMark className="w-3.5 h-3.5 text-background" />
              </div>
              <span className="font-headline font-bold text-lg">Linna</span>
            </Link>
            <p className="text-sm text-foreground/60 leading-relaxed max-w-[200px]">
              Project-aware AI for indie devs and solo builders.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-xs mb-4 tracking-widest">PRODUCT</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li><Link href="#features" className="hover:underline underline-offset-2">Features</Link></li>
              <li><Link href="/pricing" className="hover:underline underline-offset-2">Pricing</Link></li>
              <li><Link href="#" className="hover:underline underline-offset-2">Changelog</Link></li>
              <li><Link href="#" className="hover:underline underline-offset-2">Roadmap</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs mb-4 tracking-widest">DEVELOPERS</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li><Link href="https://github.com/sawsimonlinn/linna" className="hover:underline underline-offset-2">GitHub</Link></li>
              <li><Link href="/open-source" className="hover:underline underline-offset-2">Self-hosting</Link></li>
              <li><Link href="#" className="hover:underline underline-offset-2">API Docs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs mb-4 tracking-widest">LEGAL</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li><Link href="#" className="hover:underline underline-offset-2">Privacy</Link></li>
              <li><Link href="#" className="hover:underline underline-offset-2">Terms</Link></li>
              <li><Link href="#" className="hover:underline underline-offset-2">Twitter / X</Link></li>
              <li><Link href="#" className="hover:underline underline-offset-2">Discord</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t-2 border-foreground/15 text-center text-xs text-foreground/45">
          &copy; 2026 Code Heaven Studio LLC. Built by Saw Simon Linn.
        </div>
      </footer>
    </div>
  );
}
