import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LinnaMark } from '@/components/linna-mark';
import { Check, X, ArrowRight, Zap } from 'lucide-react';

export const metadata = {
  title: 'Pricing — Linna',
  description: 'Simple, transparent pricing. Free to start, free forever if you self-host.',
};

const FREE_FEATURES = [
  '1 project',
  '20 messages / month',
  '7-day chat history',
  'Project memory',
  'Context-aware chat',
];
const FREE_MISSING = ['Launch Assistant', 'Priority support'];

const PRO_FEATURES = [
  'Unlimited projects',
  'Unlimited messages',
  'Full chat history',
  'Project memory',
  'Context-aware chat',
  'Launch Assistant',
  'Priority support',
];

const SELF_FEATURES = [
  'Unlimited projects',
  'Unlimited messages',
  'Full chat history',
  'Full source access',
  'Bring your own API key',
  'Modify anything',
];
const SELF_MISSING = ['Managed hosting', 'Priority support'];

const FAQ = [
  {
    q: 'Can I switch plans later?',
    a: 'Yes — upgrade or downgrade at any time. If you downgrade, you keep Pro features until the end of your billing period.',
  },
  {
    q: 'What counts as a "message"?',
    a: 'One message = one request you send to Linna. AI responses do not count. The free plan gives you 20 per month.',
  },
  {
    q: 'Is there a student or open-source discount?',
    a: 'Email us. We\'re indie-built and happy to work something out for students and OSS maintainers.',
  },
  {
    q: 'Do you store my code?',
    a: 'No raw code is stored. Linna only stores the context you explicitly add — project descriptions, notes, and chat history.',
  },
];

export default async function PricingPage() {
  const { userId } = await auth();
  const ctaHref = userId ? '/dashboard' : '/sign-up';

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
              <Link href="/pricing" className="hover:underline underline-offset-2 underline">Pricing</Link>
              <Link href="/open-source" className="hover:underline underline-offset-2">Open Source</Link>
            </nav>
          </div>
          <Button
            asChild
            className="border-2 border-foreground bg-foreground text-background paper-btn-dark font-bold"
          >
            <Link href={ctaHref}>{userId ? 'Dashboard' : 'Get started free'}</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 pt-16">

        {/* ─── Hero ─────────────────────────────────────────────── */}
        <section className="py-20 border-b-2 border-foreground relative overflow-hidden">
          <div className="pointer-events-none select-none">
            <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-200 border-2 border-foreground rotate-12 paper-shadow-sm opacity-60" />
            <div className="absolute bottom-10 left-16 w-12 h-12 bg-sky-200 border-2 border-foreground -rotate-6 paper-shadow-sm opacity-60 rounded-full" />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-block bg-yellow-300 border-2 border-foreground px-3 py-1 text-xs font-bold mb-6 paper-shadow-sm rotate-[-1deg]">
              PRICING
            </div>
            <h1 className="font-headline text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Simple pricing.<br />No surprises.
            </h1>
            <p className="text-foreground/70 max-w-md mx-auto text-lg">
              Start free. Upgrade when you need more. Self-host forever for free.
            </p>
          </div>
        </section>

        {/* ─── Pricing Cards ───────────────────────────────────── */}
        <section className="py-20 bg-white border-b-2 border-foreground">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">

              {/* Free */}
              <div className="border-2 border-foreground bg-[#FFFBF0] p-8 paper-shadow rotate-[-0.4deg]">
                <div className="inline-block bg-foreground/10 border border-foreground/20 px-2 py-0.5 text-xs font-bold mb-6">
                  FREE
                </div>
                <div className="font-headline text-5xl font-bold mb-1">$0</div>
                <div className="text-sm text-foreground/60 mb-8">per month, forever</div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-2 border-foreground bg-white paper-btn font-bold mb-8"
                >
                  <Link href={ctaHref}>Start for free</Link>
                </Button>
                <ul className="space-y-3 text-sm">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-200 border-2 border-foreground flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      {f}
                    </li>
                  ))}
                  {FREE_MISSING.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-foreground/40">
                      <div className="w-5 h-5 border-2 border-foreground/20 flex items-center justify-center shrink-0">
                        <X className="w-3 h-3" />
                      </div>
                      <span className="line-through">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro — featured */}
              <div className="border-2 border-foreground bg-foreground text-background p-8 paper-shadow-lg rotate-[0.4deg] relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-300 text-foreground border-2 border-foreground px-4 py-1 text-xs font-bold paper-shadow-sm whitespace-nowrap">
                  MOST POPULAR
                </div>
                <div className="inline-block bg-background/10 border border-background/20 px-2 py-0.5 text-xs font-bold mb-6">
                  PRO
                </div>
                <div className="font-headline text-5xl font-bold mb-1">$12</div>
                <div className="text-sm text-background/50 mb-8">per month</div>
                <Button
                  asChild
                  className="w-full border-2 border-background bg-yellow-300 text-foreground hover:bg-yellow-200 paper-btn font-bold mb-8"
                >
                  <Link href={ctaHref}>
                    Upgrade to Pro
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <ul className="space-y-3 text-sm">
                  {PRO_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-300 border-2 border-background/30 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-foreground" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Self-host */}
              <div className="border-2 border-foreground bg-sky-50 p-8 paper-shadow rotate-[-0.2deg]">
                <div className="inline-block bg-sky-200 border border-foreground/20 px-2 py-0.5 text-xs font-bold mb-6">
                  SELF-HOST
                </div>
                <div className="font-headline text-5xl font-bold mb-1">Free</div>
                <div className="text-sm text-foreground/60 mb-8">forever, run it yourself</div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-2 border-foreground bg-white paper-btn font-bold mb-8"
                >
                  <Link href="/open-source">Read the guide →</Link>
                </Button>
                <ul className="space-y-3 text-sm">
                  {SELF_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-sky-200 border-2 border-foreground flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      {f}
                    </li>
                  ))}
                  {SELF_MISSING.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-foreground/40">
                      <div className="w-5 h-5 border-2 border-foreground/20 flex items-center justify-center shrink-0">
                        <X className="w-3 h-3" />
                      </div>
                      <span className="line-through">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature comparison note */}
            <p className="text-center text-sm text-foreground/50 mt-10">
              All plans include SSL, 99.9% uptime SLA, and full GDPR compliance.
            </p>
          </div>
        </section>

        {/* ─── FAQ ─────────────────────────────────────────────── */}
        <section className="py-20 bg-paper border-b-2 border-foreground">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="inline-block bg-pink-200 border-2 border-foreground px-3 py-1 text-xs font-bold mb-4 paper-shadow-sm">
              FAQ
            </div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-12">
              Questions you&apos;re probably thinking.
            </h2>
            <div className="space-y-4">
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  className="border-2 border-foreground bg-white p-6 paper-shadow-sm"
                >
                  <h3 className="font-headline font-bold text-lg mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 shrink-0" />
                    {item.q}
                  </h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─────────────────────────────────────────────── */}
        <section className="py-20 bg-foreground text-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl md:text-5xl font-bold mb-4">
              Start free. No card needed.
            </h2>
            <p className="text-background/60 mb-10 max-w-md mx-auto">
              Create your first project in 60 seconds and see why your old workflow feels broken.
            </p>
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base font-bold bg-yellow-300 text-foreground border-2 border-background paper-btn"
            >
              <Link href={ctaHref}>
                Get started free
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
            <Link href="/open-source" className="hover:underline underline-offset-2">Open Source</Link>
            <Link href="https://github.com/sawsimonlinn/linna" className="hover:underline underline-offset-2">GitHub</Link>
          </div>
          <span>&copy; 2026 Code Heaven Studio LLC</span>
        </div>
      </footer>
    </div>
  );
}
