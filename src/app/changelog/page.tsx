import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LinnaMark } from '@/components/linna-mark';
import { Footer } from '@/components/footer';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Changelog — Linna',
  description: 'Every update, fix, and improvement to Linna — in order.',
};

const RELEASES = [
  {
    version: '0.5.0',
    date: 'May 2026',
    tag: 'NEW',
    tagColor: 'bg-green-300',
    title: 'Stripe billing + free tier limits',
    changes: [
      { type: 'new', text: 'Pro plan with Stripe Checkout and webhook handling' },
      { type: 'new', text: 'Free tier: 3 projects, 50 messages/month, 7-day history' },
      { type: 'new', text: 'Upgrade prompt shown when limits are reached' },
      { type: 'new', text: 'Plan status visible in account settings' },
    ],
  },
  {
    version: '0.4.0',
    date: 'April 2026',
    tag: 'NEW',
    tagColor: 'bg-green-300',
    title: 'GitHub import',
    changes: [
	      { type: 'new', text: 'Connect your GitHub account and import repos as projects' },
	      { type: 'new', text: 'Linna reads repo metadata, languages, README, and labelled issues on import' },
	      { type: 'new', text: 'Re-sync a project to refresh repo metadata, README, languages, and labelled issues' },
	      { type: 'fix', text: 'GitHub OAuth token refresh now handled silently' },
    ],
  },
  {
    version: '0.3.0',
    date: 'March 2026',
    tag: 'NEW',
    tagColor: 'bg-green-300',
    title: 'Launch Assistant',
    changes: [
	      { type: 'new', text: 'Generate launch content for Product Hunt, Reddit, X, landing pages, and community posting' },
      { type: 'new', text: 'Content adapts to your project context automatically' },
      { type: 'new', text: 'One-click copy for each platform format' },
      { type: 'improvement', text: 'Chat context window expanded to include full task list' },
    ],
  },
  {
    version: '0.2.0',
    date: 'February 2026',
    tag: 'IMPROVEMENT',
    tagColor: 'bg-yellow-300',
    title: 'Context-aware chat',
    changes: [
      { type: 'new', text: 'Chat now references your project description, tasks, and recent messages' },
      { type: 'new', text: 'Smart next-action extraction from conversation' },
      { type: 'improvement', text: 'Message history limited by token budget, not message count' },
      { type: 'fix', text: 'Fixed message ordering bug on project reload' },
    ],
  },
  {
    version: '0.1.0',
    date: 'January 2026',
    tag: 'LAUNCH',
    tagColor: 'bg-sky-300',
    title: 'Initial release',
    changes: [
      { type: 'new', text: 'Project dashboard with task management' },
      { type: 'new', text: 'Per-project AI chat with GPT-4o' },
      { type: 'new', text: 'Supabase auth + Postgres backend' },
      { type: 'new', text: 'Open source under MIT license' },
    ],
  },
];

const TYPE_STYLE: Record<string, string> = {
  new: 'bg-green-100 text-green-800',
  fix: 'bg-red-100 text-red-800',
  improvement: 'bg-yellow-100 text-yellow-800',
};

const TYPE_LABEL: Record<string, string> = {
  new: 'New',
  fix: 'Fix',
  improvement: 'Improved',
};

export default function ChangelogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-paper font-body">
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
              <Link href="/open-source" className="hover:underline underline-offset-2">Open Source</Link>
            </nav>
          </div>
          <Button asChild className="border-2 border-foreground bg-foreground text-background paper-btn-dark font-bold">
            <Link href="/sign-up">Get started free</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <section className="py-20 border-b-2 border-foreground">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <div className="inline-block bg-yellow-300 border-2 border-foreground px-3 py-1 text-xs font-bold mb-6 paper-shadow-sm rotate-[-1deg]">
              CHANGELOG
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">What&apos;s new in Linna.</h1>
            <p className="text-foreground/60 text-lg">Every update, fix, and improvement — in order.</p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="space-y-12">
              {RELEASES.map((release) => (
                <div key={release.version} className="flex gap-6">
                  <div className="hidden md:flex flex-col items-center pt-1">
                    <div className="w-2.5 h-2.5 bg-foreground border-2 border-foreground rounded-full shrink-0" />
                    <div className="w-0.5 bg-foreground/15 flex-1 mt-2" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="font-code text-xs text-foreground/40">v{release.version}</span>
                      <span className="text-xs text-foreground/40">{release.date}</span>
                      <span className={`${release.tagColor} border-2 border-foreground px-2 py-0.5 text-xs font-bold paper-shadow-sm`}>
                        {release.tag}
                      </span>
                    </div>
                    <h2 className="font-headline text-xl font-bold mb-4">{release.title}</h2>
                    <ul className="space-y-2">
                      {release.changes.map((change, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <span className={`${TYPE_STYLE[change.type]} border border-current/20 px-1.5 py-0.5 text-xs font-bold shrink-0 mt-0.5`}>
                            {TYPE_LABEL[change.type]}
                          </span>
                          <span className="text-foreground/75">{change.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-foreground text-background border-t-2 border-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-2xl md:text-3xl font-bold mb-3">Want to shape what&apos;s next?</h2>
            <p className="text-background/60 mb-8 max-w-sm mx-auto text-sm">See the roadmap and vote on upcoming features.</p>
            <Button asChild size="lg" className="h-11 px-7 text-base font-bold bg-yellow-300 text-foreground border-2 border-background paper-btn">
              <Link href="/roadmap">
                View roadmap
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
