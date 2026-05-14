import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LinnaMark } from '@/components/linna-mark';
import { Footer } from '@/components/footer';
import { ArrowRight, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'About — Linna',
  description: 'Linna is built by Saw Simon Linn, an indie developer and founder of Code Heaven Studio.',
};

const LINKS = [
  { label: 'Personal site', href: 'https://simonlinn.dev', display: 'simonlinn.dev' },
  { label: 'Studio', href: 'https://www.codeheavenstudio.com', display: 'codeheavenstudio.com' },
  { label: 'GitHub', href: 'https://github.com/SawSimonLinn', display: 'github.com/SawSimonLinn' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sawsimonlinn', display: 'linkedin.com/in/sawsimonlinn' },
  { label: 'Instagram', href: 'https://www.instagram.com/simonlinn.codes', display: '@simonlinn.codes' },
  { label: 'Facebook', href: 'https://www.facebook.com/sawsimonlinn', display: 'facebook.com/sawsimonlinn' },
];

const STACK_FACTS = [
  { label: 'Started', value: 'January 2026' },
  { label: 'Built by', value: '1 person' },
  { label: 'Stack', value: 'Next.js, Supabase, OpenAI, Stripe' },
  { label: 'License', value: 'MIT' },
  { label: 'Hosted in', value: 'Vercel' },
  { label: 'Company', value: 'Code Heaven Studio LLC' },
];

export default function AboutPage() {
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

        {/* Hero */}
        <section className="py-20 border-b-2 border-foreground relative overflow-hidden">
          <div className="pointer-events-none select-none">
            <div className="absolute top-10 right-16 w-14 h-14 bg-yellow-200 border-2 border-foreground rotate-12 paper-shadow-sm opacity-60" />
            <div className="absolute bottom-10 left-1/3 w-10 h-10 bg-pink-200 border-2 border-foreground -rotate-6 paper-shadow-sm opacity-60 rounded-full" />
          </div>
          <div className="container mx-auto px-4 max-w-2xl relative z-10">
            <div className="inline-block bg-sky-200 border-2 border-foreground px-3 py-1 text-xs font-bold mb-6 paper-shadow-sm rotate-[-1deg]">
              ABOUT
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Built by one person,<br />for indie builders.
            </h1>
            <p className="text-foreground/70 text-lg leading-relaxed">
              Linna is a solo project. No team, no VC funding, no roadmap decided by committee.
              Just a developer building tools they actually want to use.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 border-b-2 border-foreground">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="inline-block bg-orange-200 border-2 border-foreground px-3 py-1 text-xs font-bold mb-8 paper-shadow-sm">
              THE STORY
            </div>
            <div className="space-y-5 text-foreground/75 leading-relaxed">
              <p>
                Hi, I&apos;m <strong className="text-foreground">Saw Simon Linn</strong> — a developer and founder based at{' '}
                <Link href="https://www.codeheavenstudio.com" target="_blank" className="underline underline-offset-2 font-medium">Code Heaven Studio</Link>.
                I build web apps, ship indie products, and write about the process.
              </p>
              <p>
                Linna started as a frustration. I was managing multiple side projects and constantly losing context —
                what was I building, what was left to do, what had I already tried? I wanted an AI that actually
                knew my project, not a generic chatbot I had to re-explain everything to.
              </p>
              <p>
                So I built it. Linna lives with your project. It knows your stack, your tasks, your recent
                conversations. When you ask it something, it already has the context to give you a useful answer.
              </p>
              <p>
                It&apos;s open source, MIT licensed, and free to self-host. If you find it useful, the hosted
                plan helps keep the lights on. Either way, the code is yours.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-11 px-7 font-bold border-2 border-foreground bg-foreground text-background paper-btn-dark">
                <Link href="/sign-up">
                  Try Linna free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 px-7 font-bold border-2 border-foreground paper-shadow-sm">
                <Link href="/contact">Get in touch</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Facts + Links */}
        <section className="py-20 border-b-2 border-foreground">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <div className="inline-block bg-green-200 border-2 border-foreground px-3 py-1 text-xs font-bold mb-6 paper-shadow-sm">
                  PROJECT FACTS
                </div>
                <dl className="space-y-3">
                  {STACK_FACTS.map((f) => (
                    <div key={f.label} className="flex gap-4 text-sm border-b border-foreground/10 pb-3">
                      <dt className="text-foreground/45 w-24 shrink-0">{f.label}</dt>
                      <dd className="font-medium">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <div className="inline-block bg-violet-200 border-2 border-foreground px-3 py-1 text-xs font-bold mb-6 paper-shadow-sm">
                  FIND ME
                </div>
                <ul className="space-y-3">
                  {LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        target="_blank"
                        className="flex items-center justify-between group border-2 border-foreground bg-white px-4 py-3 paper-shadow-sm hover:paper-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150"
                      >
                        <div>
                          <div className="text-xs text-foreground/45 mb-0.5">{link.label}</div>
                          <div className="text-sm font-medium">{link.display}</div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-foreground/30 group-hover:text-foreground/60 transition-colors" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
