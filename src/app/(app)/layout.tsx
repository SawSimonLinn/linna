'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Compass, LogOut, MoreHorizontal, Pin, PinOff, Plus, Settings, Trash2, Pencil } from 'lucide-react';
import type { Project } from '@/lib/projects/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LinnaMark } from '@/components/linna-mark';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const PIN_STORAGE_KEY = 'linna:pinned_projects';
const MAX_PINS = 3;

function loadPinnedIds(): string[] {
  try {
    const raw = localStorage.getItem(PIN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function savePinnedIds(ids: string[]) {
  localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(ids));
}

type ProjectItemProps = {
  project: Project;
  isActive: boolean;
  isPinned: boolean;
  pinCount: number;
  onPin: (id: string) => void;
  onRenameSubmit: (id: string, name: string) => Promise<void>;
  onDeleteRequest: (project: Project) => void;
};

function ProjectItem({
  project,
  isActive,
  isPinned,
  pinCount,
  onPin,
  onRenameSubmit,
  onDeleteRequest,
}: ProjectItemProps) {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(project.name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) {
      setRenameValue(project.name);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [renaming, project.name]);

  const submitRename = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === project.name) {
      setRenaming(false);
      return;
    }
    setSaving(true);
    await onRenameSubmit(project.id, trimmed);
    setSaving(false);
    setRenaming(false);
  };

  const canPin = !isPinned && pinCount < MAX_PINS;

  return (
    <SidebarMenuItem>
      <div className="group/item relative flex items-start">
        {renaming ? (
          <div className="flex w-full items-center gap-1 px-2 py-1.5">
            <Input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void submitRename();
                if (e.key === 'Escape') setRenaming(false);
              }}
              onBlur={() => void submitRename()}
              disabled={saving}
              className="h-7 rounded-none border-2 border-foreground bg-background/90 font-mono text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        ) : (
          <SidebarMenuButton
            asChild
            isActive={isActive}
            className="h-auto w-full rounded-none p-0 data-[active=true]:bg-background data-[active=true]:text-foreground"
          >
            <Link
              href={`/project/${project.id}`}
              className="grid w-full grid-cols-[14px_minmax(0,1fr)] items-start gap-x-3 gap-y-1 px-2 py-2.5 pr-8"
            >
              <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/40 opacity-60" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-mono text-xs font-semibold leading-4 text-foreground">
                    {project.name}
                  </p>
                  {isPinned && (
                    <Pin className="h-2.5 w-2.5 shrink-0 text-foreground/30 opacity-60" />
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 font-mono text-[10px] leading-4 text-foreground/40">
                  {project.description || 'No description'}
                </p>
              </div>
            </Link>
          </SidebarMenuButton>
        )}

        {!renaming && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="absolute right-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center text-foreground/0 transition-colors group-hover/item:text-foreground/40 hover:!text-foreground focus-visible:text-foreground/40 data-[state=open]:text-foreground"
                onClick={(e) => e.preventDefault()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-none border-2 border-foreground bg-background p-0 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]"
            >
              <DropdownMenuItem
                className="cursor-pointer rounded-none px-3 py-2 font-mono text-xs focus:bg-foreground focus:text-background"
                onSelect={() => setRenaming(true)}
              >
                <Pencil className="mr-2 h-3 w-3" />
                Rename
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer rounded-none px-3 py-2 font-mono text-xs focus:bg-foreground focus:text-background disabled:pointer-events-none disabled:opacity-40"
                disabled={!canPin && !isPinned}
                onSelect={() => onPin(project.id)}
              >
                {isPinned ? (
                  <>
                    <PinOff className="mr-2 h-3 w-3" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="mr-2 h-3 w-3" />
                    {canPin ? 'Pin' : `Pin (${MAX_PINS} max)`}
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-foreground/15" />

              <DropdownMenuItem
                className="cursor-pointer rounded-none px-3 py-2 font-mono text-xs text-red-600 focus:bg-red-600 focus:text-white"
                onSelect={() => onDeleteRequest(project)}
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </SidebarMenuItem>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setPinnedIds(loadPinnedIds());
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      const response = await fetch('/api/projects', { cache: 'no-store' });
      if (!response.ok) return;
      const data = (await response.json()) as Project[];
      setProjects(data);
    };
    void loadProjects();
  }, [pathname]);

  const handlePin = (id: string) => {
    setPinnedIds((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((p) => p !== id);
      } else {
        if (prev.length >= MAX_PINS) return prev;
        next = [...prev, id];
      }
      savePinnedIds(next);
      return next;
    });
  };

  const handleRename = async (id: string, name: string) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const updated = (await res.json()) as Project;
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleting(false);
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setPinnedIds((prev) => {
        const next = prev.filter((id) => id !== deleteTarget.id);
        savePinnedIds(next);
        return next;
      });
      if (pathname.startsWith(`/project/${deleteTarget.id}`)) {
        router.push('/dashboard');
      }
    }
    setDeleteTarget(null);
  };

  const userName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    'Account';
  const userInitials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() ||
    userName.slice(0, 2).toUpperCase();

  const activeProject = useMemo(
    () => projects.find((project) => pathname.startsWith(`/project/${project.id}`)),
    [pathname, projects],
  );

  const pinnedProjects = pinnedIds
    .map((id) => projects.find((p) => p.id === id))
    .filter(Boolean) as Project[];
  const unpinnedProjects = projects.filter((p) => !pinnedIds.includes(p.id));

  const renderProject = (project: Project) => (
    <ProjectItem
      key={project.id}
      project={project}
      isActive={pathname.startsWith(`/project/${project.id}`)}
      isPinned={pinnedIds.includes(project.id)}
      pinCount={pinnedIds.length}
      onPin={handlePin}
      onRenameSubmit={handleRename}
      onDeleteRequest={setDeleteTarget}
    />
  );

  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-svh w-full bg-paper">
          <Sidebar className="border-r-2 border-foreground bg-paper">
            <SidebarHeader className="gap-4 border-b-2 border-foreground px-4 py-4">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border-2 border-foreground bg-foreground text-background">
                  <LinnaMark className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-headline text-base font-black tracking-tight text-foreground">Linna</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/35">Project memory</p>
                </div>
              </Link>
              <Button
                asChild
                className="h-10 w-full justify-start rounded-none border-2 border-foreground bg-foreground px-4 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-background hover:text-foreground transition-colors duration-150"
              >
                <Link href="/dashboard">
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  New project
                </Link>
              </Button>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4">
              <SidebarGroup>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === '/dashboard'}
                      className="h-10 rounded-none font-mono text-xs uppercase tracking-[0.2em] data-[active=true]:bg-background data-[active=true]:text-foreground"
                    >
                      <Link href="/dashboard">
                        <Compass className="h-3.5 w-3.5" />
                        <span>Workspace</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>

              <SidebarSeparator className="my-3 bg-foreground/15" />

              {pinnedProjects.length > 0 && (
                <>
                  <SidebarGroup>
                    <SidebarGroupLabel className="px-2 font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/30">
                      Pinned
                    </SidebarGroupLabel>
                    <SidebarMenu>{pinnedProjects.map(renderProject)}</SidebarMenu>
                  </SidebarGroup>
                  <SidebarSeparator className="my-3 bg-foreground/15" />
                </>
              )}

              <SidebarGroup>
                <SidebarGroupLabel className="px-2 font-mono text-[9px] uppercase tracking-[0.4em] text-foreground/30">
                  Projects
                </SidebarGroupLabel>
                <SidebarMenu>
                  {projects.length === 0 ? (
                    <div className="rounded-none border border-dashed border-foreground/20 bg-background/40 px-3 py-4 font-mono text-[11px] text-foreground/35">
                      No projects yet.
                    </div>
                  ) : unpinnedProjects.length === 0 ? (
                    <div className="px-2 font-mono text-[11px] text-foreground/30">All projects pinned.</div>
                  ) : (
                    unpinnedProjects.map(renderProject)
                  )}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="gap-3 border-t-2 border-foreground px-4 py-4">
              {activeProject ? (
                <div className="border-2 border-foreground bg-background/50 p-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/35 mb-1.5">Active</p>
                  <p className="truncate font-mono text-xs font-bold text-foreground">{activeProject.name}</p>
                  <p className="mt-0.5 line-clamp-1 font-mono text-[10px] text-foreground/40">
                    {activeProject.description || 'Context loaded.'}
                  </p>
                </div>
              ) : null}

              {/* Profile — single click opens dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 border-2 border-foreground bg-background/40 p-3 text-left transition-colors hover:bg-background/70">
                    <Avatar className="h-8 w-8 shrink-0 rounded-none border-2 border-foreground">
                      <AvatarImage src={user?.imageUrl} />
                      <AvatarFallback className="rounded-none bg-foreground font-mono text-xs text-background">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs font-semibold text-foreground">{userName}</p>
                      <p className="font-mono text-[10px] text-foreground/35">Linna workspace</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="end"
                  className="w-48 rounded-none border-2 border-foreground bg-background p-0 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]"
                >
                  <DropdownMenuItem asChild className="cursor-pointer rounded-none px-3 py-2.5 font-mono text-xs focus:bg-foreground focus:text-background">
                    <Link href="/settings">
                      <Settings className="mr-2 h-3.5 w-3.5" />
                      Settings & Preferences
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-foreground/15" />
                  <SignOutButton>
                    <DropdownMenuItem className="cursor-pointer rounded-none px-3 py-2.5 font-mono text-xs text-red-600 focus:bg-red-600 focus:text-white">
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      Sign out
                    </DropdownMenuItem>
                  </SignOutButton>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarFooter>
          </Sidebar>

          <div className="flex min-h-svh min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b-2 border-foreground px-4 py-3 md:hidden">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9 rounded-none border-2 border-foreground bg-background" />
                <div>
                  <p className="font-headline text-base font-black">Linna</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/35">
                    {activeProject ? activeProject.name : 'Workspace'}
                  </p>
                </div>
              </div>
            </div>
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </SidebarProvider>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-none border-2 border-foreground bg-background shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-sm font-bold uppercase tracking-[0.15em]">
              Delete project?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs text-foreground/60">
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span> and all its messages will be
              permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-2 border-foreground font-mono text-xs uppercase tracking-[0.15em] hover:bg-foreground hover:text-background">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              disabled={deleting}
              className="rounded-none border-2 border-red-600 bg-red-600 font-mono text-xs uppercase tracking-[0.15em] text-white hover:bg-red-700 hover:border-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
