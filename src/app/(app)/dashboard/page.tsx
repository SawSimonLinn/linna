'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Edit2,
  GitBranch,
  MessageSquare,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  Zap,
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
import { FREE_PLAN_LIMITS } from '@/lib/plan-limits';

type GithubRepo = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  owner: string;
  language: string | null;
  private: boolean;
  updatedAt: string;
};

type PlanInfo = { plan: 'free' | 'pro'; projectCount: number; hasGitHubToken: boolean };

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [planInfo, setPlanInfo] = useState<PlanInfo>({ plan: 'free', projectCount: 0, hasGitHubToken: false });
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
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

  // GitHub import state
  const [modalTab, setModalTab] = useState<'manual' | 'github'>('manual');
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);
  const [importingRepo, setImportingRepo] = useState<string | null>(null);
  const [repoSearch, setRepoSearch] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [importExtras, setImportExtras] = useState({ goals: '', blockers: '', targetUser: '' });
  const [syncingProjectId, setSyncingProjectId] = useState<string | null>(null);

  useEffect(() => {
    void loadProjects();

    const upgradeSuccess = searchParams.get('upgrade') === 'success';

    const fetchPlan = async (attempt = 0): Promise<void> => {
      const r = await fetch('/api/user/plan');
      if (!r.ok) return;
      const d = (await r.json()) as PlanInfo;
      setPlanInfo(d);

      // If we're coming from Stripe and the webhook hasn't fired yet, retry a few times
      if (upgradeSuccess && d.plan !== 'pro' && attempt < 5) {
        await new Promise((res) => setTimeout(res, 1500));
        return fetchPlan(attempt + 1);
      }

      if (upgradeSuccess && d.plan === 'pro') {
        setShowUpgradeBanner(true);
        router.replace('/dashboard', { scroll: false });
      }
    };

    void fetchPlan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!planInfo.hasGitHubToken) {
      setRepos([]);
      setReposError(null);
      setReposLoading(false);
      if (modalTab === 'github') setModalTab('manual');
      return;
    }

    void loadRepos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planInfo.hasGitHubToken]);

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
    setModalTab('manual');
    setRepoSearch('');
    setSelectedRepo(null);
    setImportExtras({ goals: '', blockers: '', targetUser: '' });
    setNewProject({
      name: '',
      description: '',
      techStack: '',
      goals: '',
      blockers: '',
      targetUser: '',
    });
  };

  const loadRepos = async () => {
    setReposLoading(true);
    setReposError(null);
    const res = await fetch('/api/github/repos');
    if (!res.ok) {
      const { error } = (await res.json()) as { error: string };
      setReposError(error);
    } else {
      const data = (await res.json()) as GithubRepo[];
      setRepos(data);
    }
    setReposLoading(false);
  };

  const handleImportRepo = async () => {
    if (!selectedRepo) return;
    setImportingRepo(selectedRepo.fullName);
    const res = await fetch('/api/github/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner: selectedRepo.owner,
        repo: selectedRepo.name,
        goals: importExtras.goals,
        blockers: importExtras.blockers,
        targetUser: importExtras.targetUser,
      }),
    });
    if (res.ok) {
      const project = (await res.json()) as Project;
      setProjects((prev) => [project, ...prev]);
      setPlanInfo((prev) => ({ ...prev, projectCount: prev.projectCount + 1 }));
      setIsModalOpen(false);
      resetProjectForm();
      router.push(`/project/${project.id}`);
    }
    setImportingRepo(null);
  };

  const handleSync = async (project: Project) => {
    setSyncingProjectId(project.id);
    const res = await fetch(`/api/projects/${project.id}/sync`, { method: 'POST' });
    if (res.ok) {
      const updated = (await res.json()) as Project;
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
    setSyncingProjectId(null);
  };

  const openNewProject = () => {
    if (planInfo.plan === 'free' && projects.length >= FREE_PLAN_LIMITS.projects) {
      setShowUpgradePrompt(true);
    } else {
      setModalTab('manual');
      setIsModalOpen(true);
    }
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
      setPlanInfo((prev) => ({ ...prev, projectCount: prev.projectCount + 1 }));
    }

    setIsModalOpen(false);
    resetProjectForm();
    if (!isEditing) {
      router.push(`/project/${project.id}`);
    }
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

  const [searchQuery, setSearchQuery] = useState('');

  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());

  const inactiveProjects = useMemo(() => {
    const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
    return projects.filter(
      (p) => new Date(p.lastActive).getTime() < tenDaysAgo && !dismissedNudges.has(p.id),
    );
  }, [projects, dismissedNudges]);

  const featuredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? projects.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            p.techStack?.toLowerCase().includes(q),
        )
      : projects;
    return filtered.slice(0, 6);
  }, [projects, searchQuery]);

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
      <div className="border-b-2 border-foreground px-6 py-6 md:px-10 md:py-8 bg-paper">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-foreground/35 mb-2">
                Linna / Workspace
              </p>
              <h1 className="font-headline text-4xl font-black leading-none tracking-tight md:text-5xl">
                Projects
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-4 py-2 font-mono text-[11px] uppercase tracking-[0.1em] border-2 border-foreground/20 bg-transparent text-foreground placeholder:text-foreground/30 focus:border-foreground focus:outline-none transition-colors w-48"
                />
              </div>

              <div className="hidden text-right md:block">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/30">Total</p>
                <p className="font-mono text-3xl font-black leading-none text-foreground/20 select-none">
                  {String(projects.length).padStart(2, '0')}
                </p>
              </div>

              {/* Plan badge */}
              {planInfo.plan === 'free' && (
                <Link
                  href="/pricing"
                  className="hidden md:inline-flex items-center gap-1.5 border-2 border-yellow-400 bg-yellow-100 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-foreground hover:bg-yellow-200 transition-colors"
                >
                  <Zap className="h-3 w-3" />
                  Free
                </Link>
              )}
              {planInfo.plan === 'pro' && (
                <span className="hidden md:inline-flex items-center gap-1.5 border-2 border-foreground bg-foreground px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-background">
                  <Zap className="h-3 w-3" />
                  Pro
                </span>
              )}

              <Dialog
                open={isModalOpen}
                onOpenChange={(open) => {
                  setIsModalOpen(open);
                  if (!open) resetProjectForm();
                }}
              >
                <Button
                  onClick={openNewProject}
                  className="h-10 rounded-none border-2 border-foreground bg-foreground px-5 font-mono text-xs text-background paper-btn-dark"
                >
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  New project
                </Button>
                <DialogContent className="max-w-lg rounded-none border-2 border-foreground bg-paper paper-shadow-lg">
                  <DialogHeader>
                    <DialogTitle className="font-mono text-base font-bold uppercase tracking-[0.2em]">
                      {editingProjectId ? '— Edit Project' : '— New Project'}
                    </DialogTitle>
                  </DialogHeader>

                  {/* Tab switcher — only show GitHub import when the account has a GitHub token */}
                  {!editingProjectId && planInfo.hasGitHubToken && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                      <button
                        onClick={() => setModalTab('manual')}
                        style={{ flex: 1, minWidth: 0 }}
                        className={`py-3 font-mono text-[10px] uppercase tracking-[0.2em] border-2 transition-colors ${
                          modalTab === 'manual'
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-foreground/30 bg-transparent text-foreground/50 hover:border-foreground hover:text-foreground'
                        }`}
                      >
                        Manual
                      </button>
                      <button
                        onClick={() => setModalTab('github')}
                        style={{ flex: 1, minWidth: 0 }}
                        className={`py-3 font-mono text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 border-2 transition-colors ${
                          modalTab === 'github'
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-foreground/30 bg-transparent text-foreground/50 hover:border-foreground hover:text-foreground'
                        }`}
                      >
                        <GitBranch className="w-3 h-3" />
                        GitHub
                      </button>
                    </div>
                  )}

                  {/* GitHub import tab */}
                  {planInfo.hasGitHubToken && modalTab === 'github' && !editingProjectId ? (
                    <div style={{ minWidth: 0 }}>
                      {selectedRepo ? (
                        /* Step 2 — fill in project details */
                        <div className="grid gap-4">
                          <div className="flex items-center gap-2 border-2 border-foreground/20 bg-white px-4 py-3">
                            <GitBranch className="w-3.5 h-3.5 shrink-0 text-foreground/50" />
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-bold truncate">{selectedRepo.name}</p>
                              {selectedRepo.description && (
                                <p className="font-mono text-[10px] text-foreground/50 truncate">{selectedRepo.description}</p>
                              )}
                            </div>
                            <button
                              onClick={() => setSelectedRepo(null)}
                              className="ml-auto font-mono text-[10px] uppercase tracking-[0.1em] text-foreground/40 hover:text-foreground transition-colors"
                            >
                              Change
                            </button>
                          </div>
                          <div className="grid gap-2">
                            <Label className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/60">Current Goals</Label>
                            <Textarea
                              placeholder="What are you trying to accomplish this week?"
                              value={importExtras.goals}
                              onChange={(e) => setImportExtras({ ...importExtras, goals: e.target.value })}
                              className="rounded-none border-2 border-foreground bg-white font-mono text-sm focus-visible:ring-0 focus-visible:border-foreground resize-none"
                              rows={3}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/60">Known Blockers</Label>
                            <Textarea
                              placeholder="What's slowing you down right now?"
                              value={importExtras.blockers}
                              onChange={(e) => setImportExtras({ ...importExtras, blockers: e.target.value })}
                              className="rounded-none border-2 border-foreground bg-white font-mono text-sm focus-visible:ring-0 focus-visible:border-foreground resize-none"
                              rows={3}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/60">Target User</Label>
                            <Input
                              placeholder="e.g. indie hackers, students"
                              value={importExtras.targetUser}
                              onChange={(e) => setImportExtras({ ...importExtras, targetUser: e.target.value })}
                              className="rounded-none border-2 border-foreground bg-white font-mono text-sm focus-visible:ring-0 focus-visible:border-foreground"
                            />
                          </div>
                          <Button
                            onClick={handleImportRepo}
                            disabled={importingRepo !== null}
                            className="w-full rounded-none border-2 border-foreground bg-foreground text-background font-mono text-xs uppercase tracking-[0.2em] paper-btn-dark"
                          >
                            {importingRepo ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
                            Import Project
                          </Button>
                        </div>
                      ) : (
                        /* Step 1 — pick a repo */
                        <>
                          {reposLoading && (
                            <div className="flex items-center justify-center py-12 gap-2 font-mono text-xs text-foreground/50">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Loading repos…
                            </div>
                          )}
                          {reposError && (
                            <div className="border-2 border-red-400 bg-red-50 px-4 py-3 font-mono text-xs text-red-700">
                              {reposError.includes('No GitHub token')
                                ? 'Connect your GitHub account to import repos.'
                                : reposError}
                            </div>
                          )}
                          {!reposLoading && !reposError && repos.length === 0 && (
                            <p className="py-8 text-center font-mono text-xs text-foreground/40">No repos found.</p>
                          )}
                          {!reposLoading && repos.length > 0 && (
                            <div className="relative mb-3">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/40" />
                              <input
                                type="text"
                                placeholder="Search repos..."
                                value={repoSearch}
                                onChange={(e) => setRepoSearch(e.target.value)}
                                className="w-full pl-8 pr-4 py-2.5 font-mono text-[11px] border-2 border-foreground/20 bg-transparent text-foreground placeholder:text-foreground/30 focus:border-foreground focus:outline-none transition-colors"
                              />
                            </div>
                          )}
                          {!reposLoading && repos.length > 0 && (
                            <div className="max-h-72 overflow-y-auto border-2 border-foreground divide-y-2 divide-foreground">
                              {repos.filter((r) => {
                                const q = repoSearch.trim().toLowerCase();
                                return !q || r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
                              }).map((repo) => (
                                <button
                                  key={repo.id}
                                  onClick={() => setSelectedRepo(repo)}
                                  className="flex items-center justify-between gap-3 bg-white px-4 py-3 text-left hover:bg-foreground hover:text-background transition-colors group"
                                  style={{ width: '100%', minWidth: 0 }}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="font-mono text-xs font-bold truncate">{repo.name}</p>
                                      {repo.language && (
                                        <span className="shrink-0 border border-foreground/25 group-hover:border-background/30 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider">
                                          {repo.language}
                                        </span>
                                      )}
                                    </div>
                                    {repo.description && (
                                      <p className="font-mono text-[10px] text-foreground/50 group-hover:text-background/60 truncate mt-0.5">
                                        {repo.description}
                                      </p>
                                    )}
                                  </div>
                                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-foreground/30 group-hover:text-background" />
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Upgrade success banner ──────────────────────────── */}
      {showUpgradeBanner && (
        <div className="px-6 md:px-12 pt-6">
          <div className="mx-auto max-w-5xl flex items-center justify-between gap-4 border-2 border-foreground bg-foreground text-background px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p className="font-mono text-xs font-bold uppercase tracking-[0.15em]">
                You&apos;re on Pro — unlimited projects, messages, and full history.
              </p>
            </div>
            <button
              onClick={() => setShowUpgradeBanner(false)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Inactivity nudges ───────────────────────────────── */}
      {inactiveProjects.length > 0 ? (
        <div className="px-6 md:px-12 pt-6 space-y-2">
          {inactiveProjects.map((project) => (
            <div
              key={project.id}
              className="mx-auto max-w-5xl flex items-center justify-between gap-4 border-2 border-amber-400 bg-amber-50 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Clock className="h-4 w-4 shrink-0 text-amber-700" />
                <p className="font-mono text-xs text-foreground/80 truncate">
                  <span className="font-bold">{project.name}</span>
                  {' '}hasn't been touched in{' '}
                  {formatDistanceToNow(new Date(project.lastActive))}.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/project/${project.id}`}
                  className="inline-flex items-center gap-1 border-2 border-foreground bg-foreground text-background px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-background hover:text-foreground transition-colors"
                >
                  Jump back in
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <button
                  onClick={() => setDismissedNudges((prev) => new Set([...prev, project.id]))}
                  className="border-2 border-foreground bg-background p-1 hover:bg-foreground hover:text-background transition-colors"
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

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
                  onClick={openNewProject}
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
                          {project.githubOwner && project.githubRepoName && (
                            <DropdownMenuItem
                              onClick={() => handleSync(project)}
                              disabled={syncingProjectId === project.id}
                              className="rounded-none font-mono text-xs uppercase tracking-[0.15em] focus:bg-foreground focus:text-background"
                            >
                              <RefreshCw className={`mr-2 h-3 w-3 ${syncingProjectId === project.id ? 'animate-spin' : ''}`} />
                              Sync GitHub
                            </DropdownMenuItem>
                          )}
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
              {planInfo.plan === 'free' && projects.length >= FREE_PLAN_LIMITS.projects ? (
                <button
                  onClick={() => setShowUpgradePrompt(true)}
                  className="border-2 border-dashed border-yellow-400 bg-yellow-50 min-h-[180px] flex flex-col items-center justify-center gap-3 text-foreground/50 hover:bg-yellow-100 transition-colors duration-150 group"
                >
                  <div className="w-10 h-10 border-2 border-yellow-400 bg-yellow-300 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/60">Upgrade for more</span>
                </button>
              ) : (
                <button
                  onClick={openNewProject}
                  className="border-2 border-dashed border-foreground/30 bg-transparent min-h-[180px] flex flex-col items-center justify-center gap-3 text-foreground/30 hover:border-foreground hover:text-foreground transition-colors duration-150 group"
                >
                  <div className="w-10 h-10 border-2 border-dashed border-foreground/30 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background flex items-center justify-center transition-colors duration-150">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-[0.2em]">New project</span>
                </button>
              )}
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

      {/* Upgrade prompt dialog */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40">
          <div className="mx-4 w-full max-w-sm border-2 border-foreground bg-paper paper-shadow-lg">
            <div className="border-b-2 border-foreground px-6 py-5">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-7 h-7 bg-yellow-300 border-2 border-foreground flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <h2 className="font-headline text-xl font-black">Project limit reached</h2>
              </div>
              <p className="font-mono text-xs text-foreground/60 leading-5">
                Free plan includes {FREE_PLAN_LIMITS.projects} projects. Upgrade to Pro for unlimited projects, unlimited messages, and full history.
              </p>
            </div>
            <div className="px-6 py-5 space-y-3">
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 w-full border-2 border-foreground bg-foreground text-background px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] paper-btn-dark hover:bg-background hover:text-foreground transition-colors"
              >
                Upgrade to Pro — $12/mo
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="w-full border-2 border-foreground/30 bg-transparent text-foreground/60 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:border-foreground hover:text-foreground transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
