import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from '@clerk/nextjs'
import { AppAuthHeader } from '@/components/app-auth-header'

export const metadata: Metadata = {
  title: 'Linna | Your project has a memory now.',
  description: 'Linna is a project-aware AI assistant that picks up exactly where you left off. No more re-explaining your stack.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/20">
        <ClerkProvider>
          <AppAuthHeader />
          {children}
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
