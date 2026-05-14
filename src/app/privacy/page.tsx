import Link from 'next/link';
import { LinnaMark } from '@/components/linna-mark';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'Privacy Policy — Linna',
  description: 'How Linna collects, uses, and protects your data.',
};

const SECTIONS = [
  {
    title: 'What we collect',
    body: [
      'Account information (email address) when you sign up.',
      'Project data you create: project names, descriptions, tasks, and chat messages.',
      'GitHub repository data if you connect your GitHub account: repo metadata, languages, README contents, and labelled issues used as goals or blockers.',
      'Usage data: which features you use, how often, and when — used to improve the product.',
      'Stripe billing information (handled entirely by Stripe; we never store your card details).',
    ],
  },
  {
    title: 'What we do not collect',
    body: [
      'We do not collect the actual source code of your repositories — only metadata.',
      'We do not sell your data to third parties.',
      'We do not use your project content to train AI models.',
    ],
  },
  {
    title: 'How we use your data',
    body: [
      'To provide and operate the Linna service.',
      "To generate AI responses within your projects using OpenAI's API — your messages are sent to OpenAI for processing.",
      'To send transactional emails (account creation, billing receipts). We do not send marketing emails without your opt-in.',
      'To enforce usage limits and billing on the hosted plan.',
    ],
  },
  {
    title: 'Third-party services',
    body: [
      'Supabase — database and authentication hosting.',
      'OpenAI — AI language model processing.',
      'Stripe — payment processing.',
      'GitHub — OAuth integration (only when you connect your account).',
      'Each provider is subject to their own privacy policy.',
    ],
  },
  {
    title: 'Data retention',
    body: [
      'Your data is retained as long as your account is active.',
      'If you delete your account, your project data is permanently deleted within 30 days.',
      'Stripe retains billing records as required by applicable law.',
    ],
  },
  {
    title: 'Your rights',
    body: [
      'You can export or delete your data at any time from account settings.',
      'For data requests or concerns, email sawsimonelinn@gmail.com.',
    ],
  },
  {
    title: 'Cookies',
    body: [
      'We use a single session cookie for authentication. No tracking or advertising cookies are used.',
    ],
  },
  {
    title: 'Changes to this policy',
    body: [
      'We may update this policy as the product evolves. Material changes will be announced in the changelog.',
      'Continued use of Linna after changes constitutes acceptance.',
    ],
  },
];

export default function PrivacyPage() {
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
          </div>
          <Button asChild className="border-2 border-foreground bg-foreground text-background paper-btn-dark font-bold">
            <Link href="/sign-up">Get started free</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <section className="py-16 border-b-2 border-foreground">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="inline-block bg-green-200 border-2 border-foreground px-3 py-1 text-xs font-bold mb-6 paper-shadow-sm">
              LEGAL
            </div>
            <h1 className="font-headline text-4xl font-bold mb-3">Privacy Policy</h1>
            <p className="text-foreground/50 text-sm">Last updated: May 2026</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <p className="text-foreground/70 mb-12 leading-relaxed">
              Linna is operated by Code Heaven Studio LLC. This policy explains what data we collect when you use
              Linna, how we use it, and your rights over it. We aim to be straightforward — if anything is unclear,
              email us at <a href="mailto:sawsimonelinn@gmail.com" className="underline underline-offset-2">sawsimonelinn@gmail.com</a>.
            </p>

            <div className="space-y-10">
              {SECTIONS.map((section, i) => (
                <div key={section.title}>
                  <h2 className="font-headline text-lg font-bold mb-4 flex items-center gap-3">
                    <span className="font-code text-xs text-foreground/30 font-normal">{String(i + 1).padStart(2, '0')}</span>
                    {section.title}
                  </h2>
                  <ul className="space-y-2 border-l-2 border-foreground/10 pl-5">
                    {section.body.map((line, j) => (
                      <li key={j} className="text-sm text-foreground/70 leading-relaxed">{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
