import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LinnaMark } from '@/components/linna-mark';
import { Footer } from '@/components/footer';
import { Circle, CheckCircle2, Clock } from 'lucide-react';

export const metadata = {
  title: 'Roadmap — Linna',
  description: "What's planned, what's in progress, and what's done.",
};

const DONE = [
  'Project dashboard with task management',
  'Context-aware AI chat per project',
  'GitHub repo import + sync',
  'Launch Assistant (Product Hunt, HN, Twitter)',
  'Stripe billing + free tier limits',
  'Open source (MIT)',
];

const IN_PROGRESS = [
  { title: 'Daily digest', desc: 'Morning summary of open tasks and blockers across all your projects.' },
  { title: 'Smarter task extraction', desc: 'Auto-create tasks from chat — no manual copy-paste.' },
];

const PLANNED = [
  { title: 'Linear integration', desc: 'Two-way sync between Linna tasks and Linear issues.' },
  { title: 'Notion integration', desc: 'Push project notes and updates to a Notion page.' },
  { title: 'Mobile app', desc: 'Check task status and chat with Linna from your phone.' },
  { title: 'Team workspaces', desc: 'Invite collaborators to a shared project.' },
  { title: 'Custom AI instructions', desc: 'Per-project system prompt so Linna speaks your language.' },
  { title: 'Webhook events', desc: 'Trigger external actions when tasks change state.' },
];

export default function RoadmapPage() {
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
            <div className="inline-block bg-sky-300 border-2 border-foreground px-3 py-1 text-xs font-bold mb-6 paper-shadow-sm rotate-[1deg]">
              ROADMAP
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">What we&apos;re building.</h1>
            <p className="text-foreground/60 text-lg">Planned, in progress, and shipped.</p>
          </div>
        </section>

        <section className="py-20 border-b-2 border-foreground">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-yellow-300 border-2 border-foreground flex items-center justify-center paper-shadow-sm shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="font-headline text-2xl font-bold">In progress</h2>
            </div>
            <div className="space-y-4">
              {IN_PROGRESS.map((item) => (
                <div key={item.title} className="border-2 border-foreground bg-yellow-50 p-5 paper-shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-400 border-2 border-foreground rounded-full shrink-0 mt-1.5" />
                    <div>
                      <div className="font-bold mb-1">{item.title}</div>
                      <div className="text-sm text-foreground/60">{item.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 border-b-2 border-foreground">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-sky-200 border-2 border-foreground flex items-center justify-center paper-shadow-sm shrink-0">
                <Circle className="w-4 h-4" />
              </div>
              <h2 className="font-headline text-2xl font-bold">Planned</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {PLANNED.map((item) => (
                <div key={item.title} className="border-2 border-foreground bg-white p-5 paper-shadow-sm hover:paper-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150">
                  <div className="font-bold mb-1">{item.title}</div>
                  <div className="text-sm text-foreground/60">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-foreground/5 border-b-2 border-foreground">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-green-300 border-2 border-foreground flex items-center justify-center paper-shadow-sm shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="font-headline text-2xl font-bold">Shipped</h2>
            </div>
            <ul className="space-y-3">
              {DONE.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-foreground/60">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="line-through">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
