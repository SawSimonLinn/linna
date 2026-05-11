'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSupabaseAuth } from '@/context/supabase-provider'

const HIDDEN_ON_APP_ROUTES = ['/dashboard', '/project', '/sign-in', '/sign-up']

export function AppAuthHeader() {
  const pathname = usePathname()
  const { user, loading } = useSupabaseAuth()

  if (HIDDEN_ON_APP_ROUTES.some((route) => pathname.startsWith(route))) {
    return null
  }

  if (loading) {
    return <header className="h-16" />
  }

  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16">
      {!user && (
        <>
          <Link
            href="/sign-in"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 inline-flex items-center justify-center"
          >
            Sign Up
          </Link>
        </>
      )}
    </header>
  )
}
