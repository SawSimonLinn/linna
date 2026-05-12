'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Props {
  isLoggedIn: boolean;
}

export function UpgradeButton({ isLoggedIn }: Props) {
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) {
    return (
      <Button
        asChild
        className="w-full border-2 border-background bg-yellow-300 text-foreground hover:bg-yellow-200 paper-btn font-bold mb-8"
      >
        <Link href="/sign-up">
          Upgrade to Pro
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    );
  }

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full border-2 border-background bg-yellow-300 text-foreground hover:bg-yellow-200 paper-btn font-bold mb-8"
    >
      {loading ? 'Redirecting…' : 'Upgrade to Pro'}
      {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
    </Button>
  );
}
