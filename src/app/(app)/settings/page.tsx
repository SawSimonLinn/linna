'use client';

import { useUser, SignOutButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { ExternalLink, LogOut, Shield, Sliders, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
  const { user } = useUser();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setMounted(true);
  }, []);

  const updatePref = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      savePrefs(next);
      return next;
    });
  };

  const userName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    'Account';
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? '';
  const userInitials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() ||
    userName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-svh bg-background text-foreground">
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
              <AvatarImage src={user?.imageUrl} />
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
                Managed by Clerk
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="shrink-0 rounded-none border-2 border-foreground bg-background font-mono text-xs uppercase tracking-[0.15em] hover:bg-foreground hover:text-background transition-colors"
            >
              <a href="https://accounts.clerk.dev/user" target="_blank" rel="noopener noreferrer">
                Edit profile
                <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
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

        {/* Account */}
        <Section title="Account" icon={<Shield className="h-3.5 w-3.5" />}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs font-semibold">Sign out</p>
              <p className="mt-0.5 font-mono text-[11px] text-foreground/45">
                You will be redirected to the login page.
              </p>
            </div>
            <SignOutButton>
              <Button
                variant="outline"
                className="rounded-none border-2 border-foreground bg-background font-mono text-xs uppercase tracking-[0.15em] hover:bg-foreground hover:text-background transition-colors"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign out
              </Button>
            </SignOutButton>
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
