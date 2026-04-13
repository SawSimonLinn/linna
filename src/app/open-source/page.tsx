import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LinnaMark } from '@/components/linna-mark';
import { ArrowRight, Star, GitFork, BookOpen, Terminal, Code2, Globe } from 'lucide-react';

export const metadata = {
  title: 'Open Source — Linna',
  description: 'Linna is fully open source under the MIT license. Clone it, run it, modify it — yours forever.',
};

const STEPS = [
  { cmd: 'git clone https://github.com/sawsimonlinn/linna', label: 'Clone the repo' },
  { cmd: 'cp .env.example .env.local', label: 'Copy env file' },
  { cmd: 'npm install', label: 'Install deps' },
  { cmd: 'npm run db:push', label: 'Push the schema' },
  { cmd: 'npm run dev', label: 'Start the server' },
];

const STACK = [
  { name: 'Next.js', desc: 'App Router, RSC', color: 'bg-foreground text-background' },
  { name: 'Supabase', desc: 'Postgres + Auth', color: 'bg-green-200' },
  { name: 'Anthropic', desc: 'Claude API', color: 'bg-orange-200' },
  { name: 'Tailwind CSS', desc: 'Styling', color: 'bg-sky-200' },
  { name: 'Clerk', desc: 'Auth (hosted)', color: 'bg-violet-200' },
  { name: 'shadcn/ui', desc: 'Components', color: 'bg-pink-200' },
];

const CONTRIBUTE = [
  {
    icon: <Code2 className="w-5 h-5" />,
    title: 'Fix a bug',
    desc: 'Browse open issues on GitHub. Good first issues are labeled for newcomers.',
    color: 'bg-yellow-100',
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Improve docs',
    desc: 'Found something confusing? Better docs help everyone — PRs welcome.',
    color: 'bg-sky-100',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'Build an integration',
    desc: 'Connect Linna to Linear, Notion, GitHub Issues, or any tool you use.',
    color: 'bg-green-100',
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: 'Star the repo',
    desc: 'Takes 2 seconds and helps other indie devs find Linna. Genuinely appreciated.',
    color: 'bg-pink-100',
  },
];

export default function OpenSourcePage() {
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
              <Link href="/#features" className="hover:underline underline-offset-2">Features</Link>
              <Link href="/pricing" className="hover:underline underline-offset-2">Pricing</Link>
              <Link href="/open-source" className="hover:underline underline-offset-2 underline">Open Source</Link>
            </nav>
          </div>
          <Button
            asChild
            className="border-2 border-foreground bg-foreground text-background paper-btn-dark font-bold"
          >
            <Link href="/sign-up">Get started free</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 pt-16">

        {/* ─── Hero ─────────────────────────────────────────────── */}
        <section className="py-20 border-b-2 border-foreground relative overflow-hidden">
          <div className="pointer-events-none select-none">
            <div className="absolute top-8 left-8 w-16 h-16 bg-green-200 border-2 border-foreground rotate-12 paper-shadow-sm opacity-70" />
            <div className="absolute top-16 right-12 w-10 h-10 bg-yellow-200 border-2 border-foreground -rotate-6 paper-shadow-sm opacity-70 rounded-full" />
            <div className="absolute bottom-8 right-1/4 w-14 h-14 bg-sky-200 border-2 border-foreground rotate-3 paper-shadow-sm opacity-70" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-block bg-green-300 border-2 border-foreground px-3 py-1 text-xs font-bold mb-6 paper-shadow-sm rotate-[-1deg]">
                OPEN SOURCE · MIT LICENSE
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Free forever<br />if you self-host.
              </h1>
              <p className="text-foreground/70 text-lg mb-8 max-w-xl leading-relaxed">
                Linna&apos;s full source code is on GitHub. Clone it, run it on your own server, modify it however
                you like. No license fees. No usage limits. It&apos;s yours.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-8 text-base font-bold border-2 border-foreground bg-foreground text-background paper-btn-dark"
                >
                  <Link href="https://github.com/sawsimonlinn/linna" target="_blank">
                    View on GitHub
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border-2 border-foreground bg-white px-4 py-2 paper-shadow-sm text-sm font-medium">
                    <Star className="w-4 h-4" />
                    1.2k stars
                  </div>
                  <div className="flex items-center gap-2 border-2 border-foreground bg-white px-4 py-2 paper-shadow-sm text-sm font-medium">
                    <GitFork className="w-4 h-4" />
                    94 forks
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Self-hosting guide ───────────────────────────────── */}
        <section className="py-20 bg-foreground text-background border-b-2 border-foreground">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="inline-block bg-green-300 text-foreground border-2 border-background/30 px-3 py-1 text-xs font-bold mb-4 paper-shadow-sm">
              SELF-HOSTING GUIDE
            </div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-12 text-background">
              Up and running in 5 minutes.
            </h2>

            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <div key={i} className="flex items-stretch gap-0 border-2 border-background/20 bg-background/5">
                  {/* Step number */}
                  <div className="w-12 bg-background/10 border-r-2 border-background/20 flex items-center justify-center shrink-0">
                    <span className="font-headline font-bold text-background/50 text-sm">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  {/* Label */}
                  <div className="flex items-center px-4 py-3 border-r-2 border-background/20 min-w-[160px] hidden sm:flex">
                    <span className="text-xs font-medium text-background/50 uppercase tracking-wide">{step.label}</span>
                  </div>
                  {/* Command */}
                  <div className="flex items-center gap-3 px-4 py-3 flex-1">
                    <Terminal className="w-4 h-4 text-green-400 shrink-0" />
                    <code className="font-code text-sm text-green-300 break-all">{step.cmd}</code>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-2 border-background/20 bg-background/5 p-6">
              <p className="text-sm text-background/60 leading-relaxed">
                <strong className="text-background">You&apos;ll need:</strong> Node.js 18+, a Supabase project (free tier works), and an Anthropic API key.
                Clerk is optional — you can replace it with any auth provider or roll your own.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Tech stack ───────────────────────────────────────── */}
        <section className="py-20 bg-white border-b-2 border-foreground">
          <div className="container mx-auto px-4">
            <div className="inline-block bg-sky-200 border-2 border-foreground px-3 py-1 text-xs font-bold mb-4 paper-shadow-sm">
              TECH STACK
            </div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-12">
              What Linna is built on.
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
              {STACK.map((tech) => (
                <div
                  key={tech.name}
                  className={`${tech.color} border-2 border-foreground p-5 paper-shadow-sm`}
                >
                  <div className="font-headline font-bold text-lg mb-1">{tech.name}</div>
                  <div className="text-xs text-foreground/60">{tech.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Contribute ───────────────────────────────────────── */}
        <section className="py-20 bg-paper border-b-2 border-foreground">
          <div className="container mx-auto px-4">
            <div className="inline-block bg-orange-200 border-2 border-foreground px-3 py-1 text-xs font-bold mb-4 paper-shadow-sm">
              CONTRIBUTING
            </div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-12">
              Help make it better.
            </h2>
            <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
              {CONTRIBUTE.map((item) => (
                <div
                  key={item.title}
                  className={`${item.color} border-2 border-foreground p-6 paper-shadow hover:paper-shadow-sm hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150`}
                >
                  <div className="w-9 h-9 bg-foreground text-background border-2 border-foreground flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-headline font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-foreground/75 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 border-2 border-foreground bg-white p-8 paper-shadow max-w-3xl">
              <h3 className="font-headline text-xl font-bold mb-3">Contribution guidelines</h3>
              <ul className="space-y-2 text-sm text-foreground/75">
                <li className="flex items-start gap-2"><span className="mt-0.5 w-1.5 h-1.5 bg-foreground rounded-full shrink-0" />Open an issue before big PRs — let&apos;s align first.</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 w-1.5 h-1.5 bg-foreground rounded-full shrink-0" />Keep PRs focused. One thing per PR.</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 w-1.5 h-1.5 bg-foreground rounded-full shrink-0" />Linting is enforced — run <code className="font-code bg-foreground/5 px-1">npm run lint</code> before pushing.</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 w-1.5 h-1.5 bg-foreground rounded-full shrink-0" />Be kind. This is an indie project built with care.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ─── CTA ─────────────────────────────────────────────── */}
        <section className="py-20 bg-foreground text-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl md:text-5xl font-bold mb-4">
              Don&apos;t want to self-host?
            </h2>
            <p className="text-background/60 mb-10 max-w-md mx-auto">
              Use the hosted version free. We handle the infra, you handle the building.
            </p>
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base font-bold bg-yellow-300 text-foreground border-2 border-background paper-btn"
            >
              <Link href="/sign-up">
                Start for free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

      </main>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-paper border-t-2 border-foreground py-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground/60">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-foreground border-2 border-foreground flex items-center justify-center shrink-0">
              <LinnaMark className="w-3.5 h-3.5 text-background" />
            </div>
            <span className="font-headline font-bold text-foreground">Linna</span>
          </Link>
          <div className="flex gap-6">
            <Link href="/" className="hover:underline underline-offset-2">Home</Link>
            <Link href="/#features" className="hover:underline underline-offset-2">Features</Link>
            <Link href="/pricing" className="hover:underline underline-offset-2">Pricing</Link>
            <Link href="https://github.com/sawsimonlinn/linna" className="hover:underline underline-offset-2">GitHub</Link>
          </div>
          <span>&copy; 2026 Code Heaven Studio LLC</span>
        </div>
      </footer>
    </div>
  );
}
