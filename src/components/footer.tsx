import Link from 'next/link';
import { LinnaMark } from '@/components/linna-mark';

export function Footer() {
  return (
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
            <li><Link href="/#features" className="hover:underline underline-offset-2">Features</Link></li>
            <li><Link href="/pricing" className="hover:underline underline-offset-2">Pricing</Link></li>
            <li><Link href="/changelog" className="hover:underline underline-offset-2">Changelog</Link></li>
            <li><Link href="/roadmap" className="hover:underline underline-offset-2">Roadmap</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-xs mb-4 tracking-widest">DEVELOPERS</h4>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li><Link href="https://github.com/sawsimonlinn/linna" target="_blank" className="hover:underline underline-offset-2">GitHub</Link></li>
            <li><Link href="/open-source" className="hover:underline underline-offset-2">Self-hosting</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-xs mb-4 tracking-widest">COMPANY</h4>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li><Link href="/about" className="hover:underline underline-offset-2">About</Link></li>
            <li><Link href="/contact" className="hover:underline underline-offset-2">Contact</Link></li>
            <li><Link href="/privacy" className="hover:underline underline-offset-2">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:underline underline-offset-2">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t-2 border-foreground/15 text-center text-xs text-foreground/45">
        &copy; 2026 Code Heaven Studio LLC. Built by Saw Simon Linn.
      </div>
    </footer>
  );
}
