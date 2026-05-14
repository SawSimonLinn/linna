'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type State = 'loading' | 'accepting' | 'success' | 'error';

export default function InvitePage() {
  const { token } = useParams() as { token: string };
  const router = useRouter();
  const [state, setState] = useState<State>('loading');
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    const accept = async () => {
      setState('accepting');
      try {
        const res = await fetch(`/api/invite/${token}`, { method: 'POST' });
        const body = (await res.json()) as { projectId?: string; error?: string };

        if (!res.ok) {
          setError(body.error ?? 'Failed to accept invitation.');
          setState('error');
          return;
        }

        setProjectId(body.projectId ?? null);
        setState('success');
        setTimeout(() => {
          if (body.projectId) router.push(`/project/${body.projectId}`);
        }, 2000);
      } catch {
        setError('Something went wrong. Please try again.');
        setState('error');
      }
    };

    void accept();
  }, [token, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm border-2 border-black p-8 shadow-[4px_4px_0px_#000]">
        <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.4em] text-black/30">— Linna —</p>

        {(state === 'loading' || state === 'accepting') && (
          <>
            <h1 className="font-headline text-2xl font-black text-black">Joining project…</h1>
            <p className="mt-3 font-mono text-xs text-black/50">Accepting your invitation.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <h1 className="font-headline text-2xl font-black text-black">You're in!</h1>
            <p className="mt-3 font-mono text-xs text-black/50">Redirecting you to the project…</p>
            {projectId ? (
              <Link
                href={`/project/${projectId}`}
                className="mt-4 inline-block font-mono text-xs underline text-black hover:no-underline"
              >
                Go now →
              </Link>
            ) : null}
          </>
        )}

        {state === 'error' && (
          <>
            <h1 className="font-headline text-2xl font-black text-black">Invitation invalid</h1>
            <p className="mt-3 font-mono text-xs text-black/50">{error}</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block font-mono text-xs underline text-black hover:no-underline"
            >
              Go to dashboard →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
