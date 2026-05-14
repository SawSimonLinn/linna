import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LinnaMark } from '@/components/linna-mark';
import { Footer } from '@/components/footer';
import { Mail, Github, Linkedin, Instagram, Globe, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Contact — Linna',
  description: 'Get in touch with the Linna team.',
};

const CHANNELS = [
  {
    icon: <Mail className="w-5 h-5" />,
    label: 'Email',
    desc: 'Best for billing, account issues, or anything private.',
    href: 'mailto:sawsimonelinn@gmail.com',
    display: 'sawsimonelinn@gmail.com',
    color: 'bg-yellow-100',
  },
  {
    icon: <Github className="w-5 h-5" />,
    label: 'GitHub Issues',
    desc: 'Bug reports, feature requests, and open source discussion.',
    href: 'https://github.com/SawSimonLinn/linna/issues',
    display: 'github.com/SawSimonLinn/linna',
    color: 'bg-foreground',
    dark: true,
  },
  {
    icon: <Globe className="w-5 h-5" />,
    label: 'Personal site',
    desc: 'More about what I build and write.',
    href: 'https://simonlinn.dev',
    display: 'simonlinn.dev',
    color: 'bg-sky-100',
  },
  {
    icon: <Linkedin className="w-5 h-5" />,
    label: 'LinkedIn',
    desc: 'Professional inquiries, collaborations, or just connecting.',
    href: 'https://www.linkedin.com/in/sawsimonlinn',
    display: 'linkedin.com/in/sawsimonlinn',
    color: 'bg-blue-100',
  },
  {
    icon: <Instagram className="w-5 h-5" />,
    label: 'Instagram',
    desc: 'Follow the build journey and behind-the-scenes.',
    href: 'https://www.instagram.com/simonlinn.codes',
    display: '@simonlinn.codes',
    color: 'bg-pink-100',
  },
];

export default function ContactPage() {
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
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="inline-block bg-pink-200 border-2 border-foreground px-3 py-1 text-xs font-bold mb-6 paper-shadow-sm rotate-[1deg]">
              CONTACT
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">Say hello.</h1>
            <p className="text-foreground/60 text-lg leading-relaxed max-w-lg">
              Linna is a one-person project. Pick the channel that fits and I&apos;ll get back to you.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="space-y-4">
              {CHANNELS.map((ch) => (
                <Link
                  key={ch.label}
                  href={ch.href}
                  target={ch.href.startsWith('mailto') ? undefined : '_blank'}
                  className={`flex items-center gap-5 border-2 border-foreground p-5 paper-shadow hover:paper-shadow-sm hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150 group ${ch.color}`}
                >
                  <div className={`w-10 h-10 border-2 flex items-center justify-center shrink-0 ${ch.dark ? 'border-background/30 bg-white/10 text-background' : 'border-foreground bg-foreground text-background'}`}>
                    {ch.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold mb-0.5 ${ch.dark ? 'text-background' : ''}`}>{ch.label}</div>
                    <div className={`text-sm mb-1 ${ch.dark ? 'text-background/60' : 'text-foreground/60'}`}>{ch.desc}</div>
                    <div className={`font-code text-xs truncate ${ch.dark ? 'text-background/45' : 'text-foreground/45'}`}>{ch.display}</div>
                  </div>
                  <ExternalLink className={`w-4 h-4 transition-colors shrink-0 ${ch.dark ? 'text-background/30 group-hover:text-background/70' : 'text-foreground/30 group-hover:text-foreground/60'}`} />
                </Link>
              ))}
            </div>

            <div className="mt-12 border-2 border-foreground bg-white p-6 paper-shadow-sm text-sm text-foreground/60 leading-relaxed">
              <strong className="text-foreground">Response time:</strong> I try to reply within 1–2 business days.
              For bugs, opening a GitHub issue is fastest — it keeps the fix public so others can benefit too.
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
