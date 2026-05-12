'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CreditCard, LogOut, Shield, Sliders, User, Zap } from 'lucide-react';
import { useSupabaseAuth } from '@/context/supabase-provider';
import { signOut } from '@/app/actions/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type PlanInfo = { plan: 'free' | 'pro'; projectCount: number; hasStripeCustomer: boolean };

const PREFS_KEY = 'linna:preferences';

type Preferences = {
  compactSidebar: boolean;
  aiResponseStyle: 'concise' | 'detailed';
  showProjectDescriptions: boolean;
};

const DEFAULT_PREFS: Preferences = {
  compactSidebar: false,
  aiResponseStyle: 'detailed',
  showProjectDescriptions: true,
};

function loadPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Preferences>) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: Preferences) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

type SectionProps = { title: string; icon: React.ReactNode; children: React.ReactNode };
function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="border-b-2 border-foreground">
      <div className="border-b border-foreground/15 px-6 py-4 md:px-10">
        <div className="flex items-center gap-2.5">
          <span className="text-foreground/40">{icon}</span>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/50">{title}</h2>
        </div>
      </div>
      <div className="px-6 py-6 md:px-10">{children}</div>
    </div>
  );
}

type PrefRowProps = {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
};
function PrefRow({ label, description, checked, onCheckedChange }: PrefRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-foreground/8 last:border-0">
      <div className="min-w-0">
        <Label className="font-mono text-xs font-semibold text-foreground cursor-pointer">{label}</Label>
        <p className="mt-0.5 font-mono text-[11px] text-foreground/45 leading-5">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-0.5 shrink-0 rounded-none data-[state=checked]:bg-foreground"
      />
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useSupabaseAuth();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [mounted, setMounted] = useState(false);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setMounted(true);
    void fetch('/api/user/plan')
      .then((r) => r.json())
      .then((d) => setPlanInfo(d as PlanInfo));
  }, []);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  };

  const updatePref = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      savePrefs(next);
      return next;
    });
  };

  const userName = user?.user_metadata?.full_name || user?.email || 'Account';
  const userEmail = user?.email ?? '';
  const userInitials = userName.slice(0, 2).toUpperCase();

  return (
    <div className="h-full overflow-y-auto bg-background text-foreground">
      {/* Header */}
      <div className="border-b-2 border-foreground px-6 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/35 mb-3">
            Linna / Settings
          </p>
          <h1 className="font-headline text-5xl font-black leading-none tracking-tight md:text-6xl">
            Settings
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Profile */}
        <Section title="Profile" icon={<User className="h-3.5 w-3.5" />}>
          <div className="flex items-center gap-5">
            <Avatar className="h-16 w-16 rounded-none border-2 border-foreground">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="rounded-none bg-foreground font-mono text-lg text-background">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-base font-bold leading-tight">{userName}</p>
              {userEmail && (
                <p className="mt-1 font-mono text-xs text-foreground/45">{userEmail}</p>
              )}
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/30">
                Linna account
              </p>
            </div>
          </div>
        </Section>

        {/* Preferences */}
        <Section title="Preferences" icon={<Sliders className="h-3.5 w-3.5" />}>
          {mounted ? (
            <div>
              <PrefRow
                label="Show project descriptions"
                description="Display the description line under each project name in the sidebar."
                checked={prefs.showProjectDescriptions}
                onCheckedChange={(v) => updatePref('showProjectDescriptions', v)}
              />
              <PrefRow
                label="Compact sidebar"
                description="Reduce the padding on sidebar project items for a denser list."
                checked={prefs.compactSidebar}
                onCheckedChange={(v) => updatePref('compactSidebar', v)}
              />
              <div className="flex items-start justify-between gap-6 py-4">
                <div className="min-w-0">
                  <Label className="font-mono text-xs font-semibold text-foreground">AI response style</Label>
                  <p className="mt-0.5 font-mono text-[11px] text-foreground/45 leading-5">
                    Controls how verbose the AI assistant is when responding.
                  </p>
                </div>
                <div className="flex shrink-0 border-2 border-foreground">
                  {(['concise', 'detailed'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updatePref('aiResponseStyle', opt)}
                      className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                        prefs.aiResponseStyle === opt
                          ? 'bg-foreground text-background'
                          : 'bg-background text-foreground/50 hover:text-foreground'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 border border-foreground/10 bg-foreground/3 animate-pulse" />
              ))}
            </div>
          )}
        </Section>

        {/* Plan & Billing */}
        <Section title="Plan & Billing" icon={<CreditCard className="h-3.5 w-3.5" />}>
          {!planInfo ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-12 border border-foreground/10 bg-foreground/3 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current plan badge */}
              <div className="flex items-center justify-between border-2 border-foreground bg-white px-5 py-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1.5 border-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.25em] font-bold ${
                      planInfo.plan === 'pro'
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-foreground/30 bg-foreground/5 text-foreground/60'
                    }`}>
                      {planInfo.plan === 'pro' && <Zap className="h-2.5 w-2.5" />}
                      {planInfo.plan === 'pro' ? 'Pro' : 'Free'}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-foreground/50">
                    {planInfo.plan === 'pro'
                      ? 'Unlimited projects · Unlimited messages · Full chat history'
                      : `${planInfo.projectCount}/1 project · 20 messages/month · 7-day history`}
                  </p>
                </div>
                {planInfo.plan === 'pro' ? (
                  <span className="font-mono text-xs font-bold text-foreground">$12/mo</span>
                ) : (
                  <span className="font-mono text-xs text-foreground/40">$0/mo</span>
                )}
              </div>

              {/* Feature comparison rows */}
              <div className="border-2 border-foreground divide-y-2 divide-foreground/10 bg-white">
                {[
                  { label: 'Projects', free: '1', pro: 'Unlimited' },
                  { label: 'Messages / month', free: '20', pro: 'Unlimited' },
                  { label: 'Chat history', free: '7 days', pro: 'Full' },
                  { label: 'Launch Assistant', free: '—', pro: '✓' },
                  { label: 'Priority support', free: '—', pro: '✓' },
                ].map(({ label, free, pro }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3">
                    <span className="font-mono text-xs text-foreground/60">{label}</span>
                    <div className="flex items-center gap-6">
                      <span className={`font-mono text-xs w-16 text-right ${planInfo.plan === 'free' ? 'font-bold text-foreground' : 'text-foreground/30'}`}>{free}</span>
                      <span className={`font-mono text-xs w-16 text-right ${planInfo.plan === 'pro' ? 'font-bold text-foreground' : 'text-foreground/40'}`}>{pro}</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-5 py-2 bg-foreground/3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/30" />
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/30 w-16 text-right">Free</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/30 w-16 text-right">Pro</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              {planInfo.plan === 'free' ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs font-semibold">Upgrade to Pro</p>
                    <p className="mt-0.5 font-mono text-[11px] text-foreground/45">
                      Unlock unlimited projects and messages for $12/mo.
                    </p>
                  </div>
                  <Button
                    asChild
                    className="rounded-none border-2 border-foreground bg-foreground font-mono text-xs uppercase tracking-[0.15em] text-background hover:bg-background hover:text-foreground transition-colors"
                  >
                    <Link href="/pricing">
                      Upgrade
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs font-semibold">Manage subscription</p>
                    <p className="mt-0.5 font-mono text-[11px] text-foreground/45">
                      Update payment method, view invoices, or cancel.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => void handleManageBilling()}
                    disabled={portalLoading}
                    className="rounded-none border-2 border-foreground bg-background font-mono text-xs uppercase tracking-[0.15em] hover:bg-foreground hover:text-background transition-colors"
                  >
                    {portalLoading ? 'Redirecting…' : 'Manage'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* Account */}
        <Section title="Account" icon={<Shield className="h-3.5 w-3.5" />}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs font-semibold">Sign out</p>
              <p className="mt-0.5 font-mono text-[11px] text-foreground/45">
                You will be redirected to the login page.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => void signOut()}
              className="rounded-none border-2 border-foreground bg-background font-mono text-xs uppercase tracking-[0.15em] hover:bg-foreground hover:text-background transition-colors"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </Section>

        <div className="px-6 py-6 md:px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/20">
            Linna — Preferences are saved locally to this browser.
          </p>
        </div>
      </div>
    </div>
  );
}
