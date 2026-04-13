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
  Trash2,
} from 'lucide-react';
import type { NewProjectInput, Project } from '@/lib/projects/types';
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

  return (
    <div className="min-h-svh bg-white text-black">
      {/* Page header */}
      <div className="border-b-2 border-black px-6 py-8 md:px-12 md:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-black/35 mb-3">
                Linna / Workspace
              </p>
              <h1 className="font-headline text-5xl font-black leading-none tracking-tight text-black md:text-7xl">
                Projects
              </h1>
            </div>

            <div className="flex items-end gap-8">
              <div className="hidden text-right md:block">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/30">
                  Total
                </p>
                <p className="font-mono text-7xl font-black leading-none text-black/8 select-none">
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
                  <Button className="h-12 rounded-none border-2 border-black bg-black px-6 font-mono text-sm text-white hover:bg-white hover:text-black transition-colors duration-150">
                    <Plus className="mr-2 h-4 w-4" />
                    New project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_#000]">
                  <DialogHeader>
                    <DialogTitle className="font-mono text-base font-bold uppercase tracking-[0.2em]">
                      {editingProjectId ? '— Edit Project' : '— New Project'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="font-mono text-xs uppercase tracking-[0.2em] text-black/60">
                        Project Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="e.g. Linna, My SaaS App"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        className="rounded-none border-2 border-black bg-white font-mono text-sm focus-visible:ring-0 focus-visible:border-black"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description" className="font-mono text-xs uppercase tracking-[0.2em] text-black/60">
                        Description
                      </Label>
                      <Input
                        id="description"
                        placeholder="One line — what are you building?"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        className="rounded-none border-2 border-black bg-white font-mono text-sm focus-visible:ring-0 focus-visible:border-black"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tech" className="font-mono text-xs uppercase tracking-[0.2em] text-black/60">
                        Tech Stack
                      </Label>
                      <div
                        className="flex min-h-10 w-full cursor-text flex-wrap items-center gap-1.5 border-2 border-black bg-white px-2 py-1.5 text-sm focus-within:outline-none"
                        onClick={() => document.getElementById('tech')?.focus()}
                      >
                        {techTags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex shrink-0 items-center gap-1 border border-black/30 bg-black/5 px-2 py-0.5 font-mono text-[11px] text-black select-none"
                          >
                            {tag}
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setTechTags((prev) => prev.filter((_, i) => i !== index));
                              }}
                              className="flex h-3.5 w-3.5 items-center justify-center text-[10px] leading-none text-black/40 hover:text-black transition-colors"
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
                          className="min-w-[120px] flex-1 border-0 bg-transparent py-0.5 font-mono text-sm focus:outline-none focus:ring-0 placeholder:text-black/30"
                        />
                      </div>
                      <p className="font-mono text-[10px] text-black/35 uppercase tracking-[0.2em]">
                        Space or Enter to add · Backspace to remove
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="goals" className="font-mono text-xs uppercase tracking-[0.2em] text-black/60">
                        Current Goals
                      </Label>
                      <Textarea
                        id="goals"
                        placeholder="What are you trying to accomplish this week?"
                        value={newProject.goals}
                        onChange={(e) => setNewProject({ ...newProject, goals: e.target.value })}
                        className="rounded-none border-2 border-black bg-white font-mono text-sm focus-visible:ring-0 focus-visible:border-black"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="blockers" className="font-mono text-xs uppercase tracking-[0.2em] text-black/60">
                        Known Blockers
                      </Label>
                      <Textarea
                        id="blockers"
                        placeholder="What's slowing you down right now?"
                        value={newProject.blockers}
                        onChange={(e) => setNewProject({ ...newProject, blockers: e.target.value })}
                        className="rounded-none border-2 border-black bg-white font-mono text-sm focus-visible:ring-0 focus-visible:border-black"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="target" className="font-mono text-xs uppercase tracking-[0.2em] text-black/60">
                        Target User
                      </Label>
                      <Input
                        id="target"
                        placeholder="e.g. indie hackers, students"
                        value={newProject.targetUser}
                        onChange={(e) => setNewProject({ ...newProject, targetUser: e.target.value })}
                        className="rounded-none border-2 border-black bg-white font-mono text-sm focus-visible:ring-0 focus-visible:border-black"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateProject}
                      className="w-full rounded-none border-2 border-black bg-black font-mono text-sm uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-colors duration-150"
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

      {/* Column headers */}
      <div className="border-b border-black/15 px-6 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-[2rem_1fr_auto] gap-6 py-3 md:grid-cols-[2rem_1fr_12rem_auto]">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/30">#</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/30">Project</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-black/30 md:block">
              Activity
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/30">—</span>
          </div>
        </div>
      </div>

      {/* Project rows */}
      <div className="px-6 md:px-12">
        <div className="mx-auto max-w-5xl">
          {featuredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-black/25 mb-6">
                — Empty —
              </p>
              <h2 className="font-headline text-4xl font-black text-black/10 md:text-6xl">
                No projects yet
              </h2>
              <p className="mt-6 max-w-sm font-mono text-sm leading-6 text-black/40">
                Create your first project to get a persistent conversation with goals, blockers, and stack context.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-8 border-2 border-black px-6 py-3 font-mono text-sm uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white transition-colors duration-150"
              >
                + New project
              </button>
            </div>
          ) : (
            featuredProjects.map((project, index) => {
              const tags = project.techStack.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 4);

              return (
                <div
                  key={project.id}
                  className="group border-b border-black/10 transition-colors duration-100 hover:bg-black"
                >
                  <div className="grid grid-cols-[2rem_1fr_auto] gap-6 py-5 pl-0 transition-all duration-150 group-hover:pl-4 md:grid-cols-[2rem_1fr_12rem_auto]">
                    {/* Index */}
                    <span className="font-mono text-sm text-black/25 group-hover:text-white/30 pt-0.5">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Main content */}
                    <div className="min-w-0">
                      <div className="flex items-start gap-3">
                        <h3 className="font-headline text-xl font-bold text-black group-hover:text-white leading-tight">
                          {project.name}
                        </h3>
                      </div>
                      {project.description ? (
                        <p className="mt-1 line-clamp-1 font-mono text-xs text-black/45 group-hover:text-white/50">
                          {project.description}
                        </p>
                      ) : null}
                      {tags.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="border border-black/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-black/50 group-hover:border-white/20 group-hover:text-white/50"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {/* Activity (desktop) */}
                    <div className="hidden flex-col justify-center gap-1.5 md:flex">
                      <div className="flex items-center gap-2 font-mono text-xs text-black/35 group-hover:text-white/40">
                        <MessageSquare className="h-3 w-3 shrink-0" />
                        <span>{project.messageCount} messages</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs text-black/35 group-hover:text-white/40">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{formatDistanceToNow(new Date(project.lastActive))} ago</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none text-black/30 hover:bg-transparent hover:text-black group-hover:text-white/40 group-hover:hover:text-white"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-none border-2 border-black bg-white shadow-[2px_2px_0px_#000] font-mono text-xs"
                        >
                          <DropdownMenuItem
                            onClick={() => handleEdit(project)}
                            className="rounded-none font-mono text-xs uppercase tracking-[0.15em] focus:bg-black focus:text-white"
                          >
                            <Edit2 className="mr-2 h-3 w-3" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(project.id)}
                            className="rounded-none font-mono text-xs uppercase tracking-[0.15em] text-black/60 focus:bg-black focus:text-white"
                          >
                            <Trash2 className="mr-2 h-3 w-3" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none text-black/40 hover:bg-transparent hover:text-black group-hover:text-white/50 group-hover:hover:text-white"
                      >
                        <Link href={`/project/${project.id}`}>
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer bar */}
      {featuredProjects.length > 0 && (
        <div className="border-t-2 border-black px-6 py-4 md:px-12 mt-8">
          <div className="mx-auto max-w-5xl flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/30">
              Showing {featuredProjects.length} of {projects.length} projects
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/20">
              Linna — Project Workspace
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
