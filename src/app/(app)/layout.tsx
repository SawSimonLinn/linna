'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Settings, 
  Plus, 
  Search, 
  Bell, 
  LogOut, 
  Sparkles,
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
import { getProjects, Project } from '@/app/lib/mock-data';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();

  useEffect(() => {
    setProjects(getProjects());
  }, [pathname]);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-surface w-full">
        {/* Sidebar */}
        <Sidebar className="border-r border-border bg-white">
          <SidebarHeader className="p-6">
            <Link href="/dashboard" className="font-headline text-2xl font-bold text-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
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
                <AvatarImage src="https://picsum.photos/seed/user/100/100" />
                <AvatarFallback>SL</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">Simon Linn</p>
                <p className="text-[10px] text-muted-foreground truncate">Free Plan</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href="/"><LogOut className="w-4 h-4" /></Link>
              </Button>
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
              <Avatar className="h-8 w-8 border">
                <AvatarImage src="https://picsum.photos/seed/user/100/100" />
                <AvatarFallback>SL</AvatarFallback>
              </Avatar>
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