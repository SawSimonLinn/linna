import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseEnv } from '@/lib/supabase/env';
import type { Database } from '@/lib/supabase/types';

export async function createSupabaseServerClient() {
  const { getToken } = await auth();

  return createClient<Database>(supabaseEnv.url, supabaseEnv.anonKey, {
    accessToken: async () => {
      if (supabaseEnv.jwtTemplate) {
        return getToken({
          template: supabaseEnv.jwtTemplate,
        });
      }

      return getToken();
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
