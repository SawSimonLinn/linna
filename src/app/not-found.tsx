import Link from 'next/link';
import { LinnaMark } from '@/components/linna-mark';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="fixed inset-0 bg-paper font-body flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-12">
        <div className="w-8 h-8 bg-foreground border-2 border-foreground flex items-center justify-center paper-shadow-sm shrink-0">
          <LinnaMark className="w-4 h-4 text-background" />
        </div>
        <span className="font-headline text-xl font-bold">Linna</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm border-2 border-foreground bg-white paper-shadow">
        {/* Top accent bar */}
        <div className="border-b-2 border-foreground px-8 py-4 flex items-center justify-between bg-foreground">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/60">
            Error
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-background/60">
            404
          </span>
        </div>

        <div className="px-8 py-10 text-center">
          <h1 className="font-headline text-7xl font-bold leading-none mb-3">Lost?</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            This page doesn't exist — it may have been moved, deleted, or you followed a broken link.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full border-2 border-foreground bg-foreground text-background paper-btn-dark font-bold gap-2 h-11">
              <Link href="/dashboard">
                <Home className="w-4 h-4" />
                Go to dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-2 border-foreground bg-white paper-btn font-bold gap-2 h-11">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
        Linna — Your project has a memory now
      </p>
    </div>
  );
}
