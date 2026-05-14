import Link from 'next/link';
import { LinnaMark } from '@/components/linna-mark';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'Terms of Service — Linna',
  description: 'The terms that govern your use of Linna.',
};

const SECTIONS = [
  {
    title: 'Acceptance',
    body: [
      'By creating an account or using Linna, you agree to these terms. If you do not agree, do not use the service.',
      'These terms apply to the hosted version of Linna. Self-hosted instances are governed only by the MIT license.',
    ],
  },
  {
    title: 'Your account',
    body: [
      'You must provide a valid email address and keep your account credentials secure.',
      'You are responsible for all activity under your account.',
      'You must be at least 16 years old to use Linna.',
    ],
  },
  {
    title: 'Acceptable use',
    body: [
      'You may use Linna for any lawful purpose, personal or commercial.',
      'You may not use Linna to generate spam, harmful content, or to violate any applicable law.',
      'You may not attempt to reverse-engineer, scrape, or abuse the service infrastructure.',
      'Free tier limits exist to ensure fair access — do not attempt to circumvent them.',
    ],
  },
  {
    title: 'Your content',
    body: [
      'You own all content you create in Linna — project data, tasks, messages.',
      'By using Linna, you grant us a limited license to store and process your content solely to operate the service.',
      'We do not claim ownership of your content and will not share it with third parties except as described in the Privacy Policy.',
    ],
  },
  {
    title: 'Billing and refunds',
    body: [
      'The Pro plan is billed monthly. You can cancel at any time; access continues until the end of the billing period.',
      'Refunds are issued at our discretion for billing errors. Contact sawsimonelinn@gmail.com within 7 days of a charge.',
      'We reserve the right to change pricing with 30 days notice.',
    ],
  },
  {
    title: 'Service availability',
    body: [
      'We aim for high availability but do not guarantee uptime. Linna is provided "as is."',
      'We may modify, suspend, or discontinue features with reasonable notice.',
      'We will provide at least 30 days notice before shutting down the hosted service entirely, giving you time to export your data.',
    ],
  },
  {
    title: 'Limitation of liability',
    body: [
      'To the maximum extent permitted by law, Code Heaven Studio LLC is not liable for any indirect, incidental, or consequential damages arising from your use of Linna.',
      'Our total liability is limited to the amount you paid us in the 3 months preceding any claim.',
    ],
  },
  {
    title: 'Termination',
    body: [
      'We may suspend or terminate accounts that violate these terms.',
      'You may delete your account at any time from settings. Your data will be removed within 30 days.',
    ],
  },
  {
    title: 'Changes',
    body: [
      'We may update these terms. Material changes will be announced in the changelog with at least 14 days notice.',
      'Continued use after changes take effect constitutes acceptance.',
    ],
  },
  {
    title: 'Governing law',
    body: [
      'These terms are governed by the laws of the State of New York, USA.',
      'Questions? Email sawsimonelinn@gmail.com.',
    ],
  },
];

export default function TermsPage() {
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
            <div className="inline-block bg-orange-200 border-2 border-foreground px-3 py-1 text-xs font-bold mb-6 paper-shadow-sm">
              LEGAL
            </div>
            <h1 className="font-headline text-4xl font-bold mb-3">Terms of Service</h1>
            <p className="text-foreground/50 text-sm">Last updated: May 2026</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <p className="text-foreground/70 mb-12 leading-relaxed">
              These Terms of Service govern your use of Linna, operated by Code Heaven Studio LLC.
              Please read them. If something is unclear, reach out at{' '}
              <a href="mailto:sawsimonelinn@gmail.com" className="underline underline-offset-2">sawsimonelinn@gmail.com</a>.
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
