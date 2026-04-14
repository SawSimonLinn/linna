'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowUpRight,
  Clock,
  Edit2,
  MessageSquare,
  MoreVertical,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import type { NewProjectInput, Project } from '@/lib/projects/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<NewProjectInput>({
    name: '',
    description: '',
    techStack: '',
    goals: '',
    blockers: '',
    targetUser: '',
  });
  const [techTags, setTechTags] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [openingProjectId, setOpeningProjectId] = useState<string | null>(null);

  useEffect(() => {
    void loadProjects();
  }, []);

  const loadProjects = async () => {
    const response = await fetch('/api/projects', { cache: 'no-store' });

    if (!response.ok) {
      return;
    }

    const data = (await response.json()) as Project[];
    setProjects(data);
  };

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setTechTags([]);
    setTechInput('');
    setNewProject({
      name: '',
      description: '',
      techStack: '',
      goals: '',
      blockers: '',
      targetUser: '',
    });
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;

    const allTags = techInput.trim() ? [...techTags, techInput.trim()] : techTags;
    const payload = { ...newProject, techStack: allTags.join(', ') };

    const isEditing = editingProjectId !== null;
    const response = await fetch(isEditing ? `/api/projects/${editingProjectId}` : '/api/projects', {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return;

    const project = (await response.json()) as Project;

    if (isEditing) {
      setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
    } else {
      setProjects((prev) => [project, ...prev]);
    }

    setIsModalOpen(false);
    resetProjectForm();
  };

  const handleEdit = (project: Project) => {
    setEditingProjectId(project.id);
    const tags = project.techStack.split(',').map((t) => t.trim()).filter(Boolean);
    setTechTags(tags);
    setTechInput('');
    setNewProject({
      name: project.name,
      description: project.description,
      techStack: project.techStack,
      goals: project.goals,
      blockers: project.blockers,
      targetUser: project.targetUser,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });

      if (!response.ok) return;

      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const featuredProjects = useMemo(() => projects.slice(0, 6), [projects]);

  // Pastel paper colours cycling per card index
  const CARD_COLORS = [
    'bg-yellow-100',
    'bg-sky-100',
    'bg-green-100',
    'bg-pink-100',
    'bg-violet-100',
    'bg-orange-100',
  ];

  return (
    <div className="min-h-svh bg-paper text-foreground">

      {/* ─── Page header ──────────────────────────────────────── */}
      <div className="border-b-2 border-foreground px-6 py-8 md:px-12 md:py-10 bg-paper">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/35 mb-3">
                Linna / Workspace
              </p>
              <h1 className="font-headline text-5xl font-black leading-none tracking-tight md:text-7xl">
                Projects
              </h1>
            </div>

            <div className="flex items-end gap-6">
              <div className="hidden text-right md:block">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/30">Total</p>
                <p className="font-mono text-7xl font-black leading-none text-foreground/8 select-none">
                  {String(projects.length).padStart(2, '0')}
                </p>
              </div>

              <Dialog
                open={isModalOpen}
                onOpenChange={(open) => {
                  setIsModalOpen(open);
                  if (!open) resetProjectForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="h-12 rounded-none border-2 border-foreground bg-foreground px-6 font-mono text-sm text-background paper-btn-dark">
                    <Plus className="mr-2 h-4 w-4" />
                    New project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg rounded-none border-2 border-foreground bg-paper paper-shadow-lg">
                  <DialogHeader>
                    <DialogTitle className="font-mono text-base font-bold uppercase tracking-[0.2em]">
                      {editingProjectId ? '— Edit Project' : '— New Project'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/60">
                        Project Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g. Linna, My SaaS App"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        className="rounded-none border-2 border-foreground bg-white font-mono text-sm focus-visible:ring-0 focus-visible:border-foreground"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description" className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/60">
                        Description
                      </Label>
                      <Input
                        id="description"
                        placeholder="One line — what are you building?"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        className="rounded-none border-2 border-foreground bg-white font-mono text-sm focus-visible:ring-0 focus-visible:border-foreground"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tech" className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/60">
                        Tech Stack
                      </Label>
                      <div
                        className="flex min-h-10 w-full cursor-text flex-wrap items-center gap-1.5 border-2 border-foreground bg-white px-2 py-1.5 text-sm focus-within:outline-none"
                        onClick={() => document.getElementById('tech')?.focus()}
                      >
                        {techTags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex shrink-0 items-center gap-1 border border-foreground/30 bg-yellow-100 px-2 py-0.5 font-mono text-[11px] text-foreground select-none"
                          >
                            {tag}
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setTechTags((prev) => prev.filter((_, i) => i !== index));
                              }}
                              className="flex h-3.5 w-3.5 items-center justify-center text-[10px] leading-none text-foreground/40 hover:text-foreground transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <input
                          id="tech"
                          type="text"
                          autoComplete="off"
                          placeholder={techTags.length === 0 ? 'e.g. Next.js, Supabase' : ''}
                          value={techInput}
                          onChange={(e) => setTechInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === ' ' && techInput.trim()) {
                              e.preventDefault();
                              setTechTags((prev) => [...prev, techInput.trim()]);
                              setTechInput('');
                            } else if (e.key === 'Backspace' && techInput === '' && techTags.length > 0) {
                              setTechTags((prev) => prev.slice(0, -1));
                            } else if (e.key === 'Enter') {
                              e.preventDefault();
                              if (techInput.trim()) {
                                setTechTags((prev) => [...prev, techInput.trim()]);
                                setTechInput('');
                              }
                            }
                          }}
                          className="min-w-[120px] flex-1 border-0 bg-transparent py-0.5 font-mono text-sm focus:outline-none focus:ring-0 placeholder:text-foreground/30"
                        />
                      </div>
                      <p className="font-mono text-[10px] text-foreground/35 uppercase tracking-[0.2em]">
                        Space or Enter to add · Backspace to remove
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="goals" className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/60">
                        Current Goals
                      </Label>
                      <Textarea
                        id="goals"
                        placeholder="What are you trying to accomplish this week?"
                        value={newProject.goals}
                        onChange={(e) => setNewProject({ ...newProject, goals: e.target.value })}
                        className="rounded-none border-2 border-foreground bg-white font-mono text-sm focus-visible:ring-0 focus-visible:border-foreground"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="blockers" className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/60">
                        Known Blockers
                      </Label>
                      <Textarea
                        id="blockers"
                        placeholder="What's slowing you down right now?"
                        value={newProject.blockers}
                        onChange={(e) => setNewProject({ ...newProject, blockers: e.target.value })}
                        className="rounded-none border-2 border-foreground bg-white font-mono text-sm focus-visible:ring-0 focus-visible:border-foreground"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="target" className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/60">
                        Target User
                      </Label>
                      <Input
                        id="target"
                        placeholder="e.g. indie hackers, students"
                        value={newProject.targetUser}
                        onChange={(e) => setNewProject({ ...newProject, targetUser: e.target.value })}
                        className="rounded-none border-2 border-foreground bg-white font-mono text-sm focus-visible:ring-0 focus-visible:border-foreground"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateProject}
                      className="w-full rounded-none border-2 border-foreground bg-foreground font-mono text-sm uppercase tracking-[0.2em] text-background paper-btn-dark"
                    >
                      {editingProjectId ? 'Save Changes' : 'Create Project'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Project grid / empty state ───────────────────────── */}
      <div className="px-6 py-10 md:px-12">
        <div className="mx-auto max-w-5xl">
          {featuredProjects.length === 0 ? (

            /* Empty state — pinned paper note */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="max-w-sm border-2 border-foreground bg-yellow-100 p-10 paper-shadow rotate-[-1deg]">
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/40 mb-4">
                  — Empty workspace —
                </p>
                <h2 className="font-headline text-3xl font-black mb-4">
                  No projects yet.
                </h2>
                <p className="font-mono text-xs leading-6 text-foreground/60 mb-6">
                  Create your first project to give your AI assistant a persistent memory for goals, stack, and blockers.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="border-2 border-foreground bg-foreground text-background px-6 py-3 font-mono text-sm uppercase tracking-[0.2em] paper-btn-dark w-full"
                >
                  + New project
                </button>
              </div>
            </div>

          ) : (

            /* Project cards grid */
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project, index) => {
                const tags = project.techStack.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 4);
                const cardColor = CARD_COLORS[index % CARD_COLORS.length];
                const tiltClass = index % 3 === 1 ? 'rotate-[0.4deg]' : index % 3 === 2 ? 'rotate-[-0.3deg]' : '';
                const isOpening = openingProjectId === project.id;
                const isAnotherProjectOpening = openingProjectId !== null && !isOpening;

                return (
                  <div key={project.id} className={`relative ${isAnotherProjectOpening ? 'opacity-60' : ''}`}>
                    <Link
                      href={`/project/${project.id}`}
                      aria-busy={isOpening}
                      onNavigate={() => setOpeningProjectId((current) => current ?? project.id)}
                      className={`${cardColor} ${tiltClass} ${
                        isOpening
                          ? 'paper-shadow-sm translate-x-[4px] translate-y-[4px]'
                          : 'paper-shadow hover:paper-shadow-sm hover:translate-x-[4px] hover:translate-y-[4px]'
                      } ${
                        isAnotherProjectOpening ? 'pointer-events-none' : ''
                      } relative flex h-full flex-col border-2 border-foreground transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-paper`}
                    >
                      {/* Card header */}
                      <div className="p-5 pb-3 pr-14">
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/40">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <h3 className="mt-1 truncate font-headline text-xl font-bold leading-tight">
                            {project.name}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      {project.description ? (
                        <p className="px-5 font-mono text-xs text-foreground/60 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      ) : null}

                      {/* Tags */}
                      {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 px-5 pt-3 pb-1">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="border border-foreground/30 bg-white/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-foreground/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {/* Task progress bar */}
                      {project.taskCount > 0 ? (
                        <div className="px-5 pt-3 pb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/50 font-bold">Progress</span>
                            <span className="font-mono text-[9px] font-bold text-foreground/70">
                              {project.completedTaskCount}/{project.taskCount}
                            </span>
                          </div>
                          <Progress
                            value={(project.completedTaskCount / project.taskCount) * 100}
                            className="h-2 rounded-none bg-foreground/15 [&>div]:bg-foreground [&>div]:rounded-none"
                          />
                        </div>
                      ) : null}

                      {/* Card footer */}
                      <div className="mt-auto flex items-center justify-between border-t-2 border-foreground/20 px-5 py-3">
                        <div className="flex items-center gap-3 font-mono text-[10px] text-foreground/45">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {project.messageCount}
                          </span>
                          <span className="flex items-center gap-1">
                            {isOpening ? (
                              <>
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                Opening...
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(project.lastActive))} ago
                              </>
                            )}
                          </span>
                        </div>
                        <span className="flex h-7 w-7 items-center justify-center rounded-none border-2 border-foreground bg-foreground text-background">
                          {isOpening ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </div>

                      {isOpening ? (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-paper/45">
                          <div className="border-2 border-foreground bg-white px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] paper-shadow-sm">
                            Opening project
                          </div>
                        </div>
                      ) : null}
                    </Link>

                    <div className="absolute right-5 top-5 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 rounded-none text-foreground/30 hover:bg-foreground/10 hover:text-foreground"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-none border-2 border-foreground bg-white paper-shadow-sm font-mono text-xs"
                        >
                          <DropdownMenuItem
                            onClick={() => handleEdit(project)}
                            className="rounded-none font-mono text-xs uppercase tracking-[0.15em] focus:bg-foreground focus:text-background"
                          >
                            <Edit2 className="mr-2 h-3 w-3" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(project.id)}
                            className="rounded-none font-mono text-xs uppercase tracking-[0.15em] text-red-600 focus:bg-red-600 focus:text-white"
                          >
                            <Trash2 className="mr-2 h-3 w-3" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}

              {/* "Add new" ghost card */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="border-2 border-dashed border-foreground/30 bg-transparent min-h-[180px] flex flex-col items-center justify-center gap-3 text-foreground/30 hover:border-foreground hover:text-foreground transition-colors duration-150 group"
              >
                <div className="w-10 h-10 border-2 border-dashed border-foreground/30 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background flex items-center justify-center transition-colors duration-150">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.2em]">New project</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer bar */}
      {featuredProjects.length > 0 && (
        <div className="border-t-2 border-foreground/15 px-6 py-4 md:px-12 mt-4">
          <div className="mx-auto max-w-5xl flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/30">
              {projects.length} project{projects.length !== 1 ? 's' : ''} total
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/20">
              Linna Workspace
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
