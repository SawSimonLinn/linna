import { ChevronLeft, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectLoading() {
  return (
    <div className="min-h-svh bg-white">
      <div className="mx-auto grid w-full max-w-[1600px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="flex min-h-svh flex-col border-r-2 border-black">
          <header className="border-b-2 border-black px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-black/35 xl:hidden">
                  <ChevronLeft className="h-3 w-3" />
                  Back
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Skeleton className="h-8 w-48 rounded-none" />
                  <span className="inline-flex items-center gap-1.5 border border-black/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-black/40">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Opening
                  </span>
                </div>
                <Skeleton className="h-3 w-64 rounded-none" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-9 w-24 rounded-none" />
                <Skeleton className="h-9 w-24 rounded-none" />
              </div>
            </div>
          </header>

          <div className="flex-1 px-6 py-8">
            <div className="mx-auto w-full max-w-3xl space-y-8">
              <div className="border-2 border-black bg-[#fbf7ef] px-5 py-4 paper-shadow-sm">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/35">
                  Project
                </p>
                <p className="mt-2 flex items-center gap-2 font-mono text-xs text-black/60">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Loading conversation, context, and project details...
                </p>
              </div>

              <div className="flex justify-start gap-3">
                <div className="w-[65%] space-y-2">
                  <Skeleton className="h-3 w-10 rounded-none" />
                  <div className="space-y-2 border-2 border-black/10 p-5">
                    <Skeleton className="h-3 w-full rounded-none" />
                    <Skeleton className="h-3 w-full rounded-none" />
                    <Skeleton className="h-3 w-4/5 rounded-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <div className="w-[42%] space-y-2">
                  <div className="flex justify-end">
                    <Skeleton className="h-3 w-8 rounded-none" />
                  </div>
                  <div className="space-y-2 bg-black/5 p-5">
                    <Skeleton className="h-3 w-full rounded-none" />
                    <Skeleton className="h-3 w-3/4 rounded-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-start gap-3">
                <div className="w-[72%] space-y-2">
                  <Skeleton className="h-3 w-10 rounded-none" />
                  <div className="space-y-2 border-2 border-black/10 p-5">
                    <Skeleton className="h-3 w-full rounded-none" />
                    <Skeleton className="h-3 w-full rounded-none" />
                    <Skeleton className="h-3 w-full rounded-none" />
                    <Skeleton className="h-3 w-2/3 rounded-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-black px-6 py-4">
            <div className="mx-auto w-full max-w-3xl">
              <Skeleton className="h-[52px] w-full rounded-none" />
            </div>
          </div>
        </section>

        <aside className="hidden xl:flex xl:flex-col">
          <div className="space-y-4 border-b-2 border-black px-5 py-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16 rounded-none" />
              <Skeleton className="h-7 w-7 rounded-none" />
            </div>
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16 rounded-none" />
              <Skeleton className="h-5 w-20 rounded-none" />
              <Skeleton className="h-5 w-14 rounded-none" />
            </div>
            <div className="space-y-3 pt-2">
              <Skeleton className="h-10 w-full rounded-none" />
              <Skeleton className="h-10 w-full rounded-none" />
              <Skeleton className="h-10 w-full rounded-none" />
            </div>
          </div>

          <div className="space-y-3 px-5 py-5">
            <Skeleton className="h-3 w-14 rounded-none" />
            <Skeleton className="h-20 w-full rounded-none" />
            <Skeleton className="h-14 w-full rounded-none" />
            <Skeleton className="h-14 w-full rounded-none" />
          </div>
        </aside>
      </div>
    </div>
  );
}
