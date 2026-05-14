import type { User } from '@supabase/supabase-js';

export function userHasProvider(user: User, provider: string) {
  const primaryProvider = user.app_metadata?.provider;
  const providers = user.app_metadata?.providers;

  return (
    primaryProvider === provider ||
    (Array.isArray(providers) && providers.includes(provider)) ||
    user.identities?.some((identity) => identity.provider === provider) ||
    false
  );
}

export function userHasGitHubProvider(user: User) {
  return userHasProvider(user, 'github');
}
