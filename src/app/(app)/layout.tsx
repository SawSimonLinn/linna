'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { LinnaMark } from '@/components/linna-mark';
import { 
  LayoutDashboard, 
  Settings, 
  Plus, 
  Search, 
  Bell, 
  LogOut, 
  ChevronRight,
  TrendingUp,
  MessageCircle,
  FolderKanban
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import type { Project } from '@/lib/projects/types';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const { user } = useUser();

  useEffect(() => {
    const loadProjects = async () => {
      const response = await fetch('/api/projects', { cache: 'no-store' });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as Project[];
      setProjects(data);
    };

    void loadProjects();
  }, [pathname]);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || user?.primaryEmailAddress?.emailAddress || 'Account';
  const userInitials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || userName.slice(0, 2).toUpperCase();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-surface w-full">
        {/* Sidebar */}
        <Sidebar className="border-r border-border bg-white">
          <SidebarHeader className="p-6">
            <Link href="/dashboard" className="font-headline text-2xl font-bold text-primary flex items-center gap-2">
              <LinnaMark className="w-6 h-6" />
              Linna
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className={pathname === item.href ? 'bg-indigo-light text-primary font-semibold' : ''}
                    >
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground/50">Recent Projects</SidebarGroupLabel>
              <SidebarMenu>
                {projects.slice(0, 5).map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname.startsWith(`/project/${project.id}`)}
                    >
                      <Link href={`/project/${project.id}`} className="flex items-center gap-2">
                        <FolderKanban className="w-4 h-4" />
                        <span className="truncate">{project.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            <SidebarSeparator className="mx-4 my-2" />

            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/settings'}>
                    <Link href="#">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border">
            <div className="mb-4 bg-indigo-light p-3 rounded-xl border border-primary/10">
              <p className="text-[11px] font-bold text-primary uppercase mb-1">Free Tier</p>
              <p className="text-xs text-body mb-2">You have 20 messages left this month.</p>
              <Button size="sm" className="w-full text-[11px] h-7 rounded-lg">Upgrade Now</Button>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{userName}</p>
                <p className="text-[10px] text-muted-foreground truncate">Free Plan</p>
              </div>
              <SignOutButton>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <LogOut className="w-4 h-4" />
                </Button>
              </SignOutButton>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border bg-white flex items-center px-6 justify-between shrink-0">
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="w-full pl-10 pr-4 h-9 rounded-full bg-surface border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                <Bell className="w-5 h-5" />
              </Button>
              <UserButton />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 lg:p-10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
