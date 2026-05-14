'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Copy,
  Download,
  Edit3,
  GitBranch,
  History,
  MessageSquareText,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { extractNextAction } from '@/ai/flows/extract-next-action-flow';
import { generateCodexPrompt } from '@/ai/flows/generate-codex-prompt-flow';
import type { ExtractedDecision } from '@/ai/flows/extract-decisions-flow';
import type { Message, NewProjectInput, Project, ProjectInvitation, ProjectMember, Task } from '@/lib/projects/types';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FREE_PLAN_LIMITS } from '@/lib/plan-limits';

export default function ProjectChatPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [pendingUndo, setPendingUndo] = useState<{
    message: Message;
    timerId: ReturnType<typeof setTimeout>;
  } | null>(null);

  const [isSessionHistoryOpen, setIsSessionHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editForm, setEditForm] = useState<NewProjectInput>({
    name: '',
    description: '',
    techStack: '',
    goals: '',
    blockers: '',
    targetUser: '',
  });
  const [editTechTags, setEditTechTags] = useState<string[]>([]);
  const [editTechInput, setEditTechInput] = useState('');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [mvpScopeInput, setMvpScopeInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [inlinePrompt, setInlinePrompt] = useState<string | null>(null);
  const [messageLimitReached, setMessageLimitReached] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [captureTaskMsgId, setCaptureTaskMsgId] = useState<string | null>(null);
  const [captureTaskInput, setCaptureTaskInput] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [attachment, setAttachment] = useState('');
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);
  const [pinnedView, setPinnedView] = useState(false);
  const [userPlan, setUserPlan] = useState<{ plan: 'free' | 'pro'; monthlyMessageCount: number } | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<ProjectInvitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [pendingDecision, setPendingDecision] = useState<ExtractedDecision | null>(null);
  const [isApplyingDecision, setIsApplyingDecision] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant');

  const handleGeneratePrompt = async () => {
    if (!project || !lastAssistantMessage) return;
    setIsGeneratingPrompt(true);
    setInlinePrompt(null);
    try {
      const result = await generateCodexPrompt({
        projectName: project.name,
        projectDescription: project.description,
        techStack: project.techStack,
        goals: project.goals,
        blockers: project.blockers,
        targetUser: project.targetUser,
        lastAssistantMessage: lastAssistantMessage.content,
      });
      setInlinePrompt(result.prompt);
    } catch {
      setInlinePrompt('Failed to generate prompt. Please try again.');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!inlinePrompt) return;
    void navigator.clipboard.writeText(inlinePrompt).then(() => {
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    });
  };

  const handleApplyDecision = async () => {
    if (!pendingDecision || !project) return;
    setIsApplyingDecision(true);
    const { updates } = pendingDecision;
    const body: Record<string, string> = {};
    if (updates.techStack) body.techStack = updates.techStack;
    if (updates.goals) body.goals = updates.goals;
    if (updates.blockers) body.blockers = updates.blockers;
    if (updates.description) body.description = updates.description;
    if (updates.targetUser) body.targetUser = updates.targetUser;
    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const updated = (await res.json()) as Project;
      setProject(updated);
    }
    setPendingDecision(null);
    setIsApplyingDecision(false);
  };

  const handleSync = async () => {
    if (!project) return;
    setIsSyncing(true);
    const res = await fetch(`/api/projects/${project.id}/sync`, { method: 'POST' });
    if (res.ok) {
      const updated = (await res.json()) as Project;
      setProject(updated);
    }
    setIsSyncing(false);
  };

  const loadMembers = async () => {
    const res = await fetch(`/api/projects/${id}/members`);
    if (!res.ok) return;
    const data = (await res.json()) as { members: ProjectMember[]; pendingInvitations: ProjectInvitation[] };
    setMembers(data.members);
    setPendingInvitations(data.pendingInvitations);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    setInviteError(null);
    setInviteLink(null);
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const body = (await res.json()) as { token?: string; error?: string };
      if (!res.ok) {
        setInviteError(body.error ?? 'Failed to create invitation.');
        return;
      }
      if (body.token) {
        setInviteLink(`${window.location.origin}/invite/${body.token}`);
      }
      setInviteEmail('');
      void loadMembers();
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    await fetch(`/api/projects/${id}/members/${memberId}`, { method: 'DELETE' });
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleCancelInvitation = async (invitationId: string) => {
    await fetch(`/api/projects/${id}/invitations/${invitationId}`, { method: 'DELETE' });
    setPendingInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
  };

  const handleExportMarkdown = () => {
    if (!project || messages.length === 0) return;
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const lines: string[] = [
      `# ${project.name}`,
      '',
      `*Exported from Linna on ${date}*`,
      '',
      '---',
      '',
    ];
    for (const msg of messages) {
      const label = msg.role === 'user' ? '**You**' : '**Linna**';
      lines.push(label, '', msg.content, '', '---', '');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-chat.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const loadProject = async () => {
      setIsLoadingMessages(true);
      setLoadError(null);
      try {
        const [projectResponse, messagesResponse, tasksResponse, planResponse] = await Promise.all([
          fetch(`/api/projects/${id}`, { cache: 'no-store' }),
          fetch(`/api/projects/${id}/messages`, { cache: 'no-store' }),
          fetch(`/api/projects/${id}/tasks`, { cache: 'no-store' }),
          fetch('/api/user/plan', { cache: 'no-store' }),
        ]);

        if (!projectResponse.ok) {
          setLoadError(`Failed to load project (${projectResponse.status})`);
          return;
        }

        if (!messagesResponse.ok) {
          setLoadError(`Failed to load messages (${messagesResponse.status})`);
          const projectData = (await projectResponse.json()) as Project;
          setProject(projectData);
          return;
        }

        const [projectData, messagesData, tasksData, planData] = await Promise.all([
          projectResponse.json() as Promise<Project>,
          messagesResponse.json() as Promise<Message[]>,
          tasksResponse.ok ? (tasksResponse.json() as Promise<Task[]>) : Promise.resolve([]),
          planResponse.ok ? (planResponse.json() as Promise<{ plan: 'free' | 'pro'; monthlyMessageCount: number }>) : Promise.resolve(null),
        ]);

        setProject(projectData);
        setMessages(messagesData);
        setTasks(tasksData);
        if (planData) setUserPlan(planData);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to load chat');
      } finally {
        setIsLoadingMessages(false);
      }
    };

    void loadProject();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [messages]);

  useEffect(() => {
    if (streamingContent) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamingContent]);

  // Auto-sync GitHub if linked and last sync is stale (>30 min)
  useEffect(() => {
    if (!project?.githubOwner || !project.githubRepoName) return;
    const staleCutoff = Date.now() - 30 * 60 * 1000;
    const lastSync = project.lastSyncedAt ? new Date(project.lastSyncedAt).getTime() : 0;
    if (lastSync > staleCutoff) return;

    const prevBlockers = project.blockers;
    fetch(`/api/projects/${project.id}/sync`, { method: 'POST' })
      .then((res) => res.ok ? res.json() as Promise<typeof project> : null)
      .then((updated) => {
        if (!updated) return;
        setProject(updated);
        if (updated.blockers !== prevBlockers) {
          setSyncNotification('GitHub sync found new issues — blockers updated.');
        }
      })
      .catch(() => { /* non-critical */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  const openEdit = () => {
    if (!project) return;

    const tags = project.techStack.split(',').map((tag) => tag.trim()).filter(Boolean);
    setEditTechTags(tags);
    setEditTechInput('');
    setEditForm({
      name: project.name,
      description: project.description,
      techStack: project.techStack,
      goals: project.goals,
      blockers: project.blockers,
      targetUser: project.targetUser,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) return;

    const allTags = editTechInput.trim() ? [...editTechTags, editTechInput.trim()] : editTechTags;
    const payload = { ...editForm, techStack: allTags.join(', ') };

    const response = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return;

    const updated = (await response.json()) as Project;
    setProject(updated);
    setIsEditOpen(false);
    setIsSettingsOpen(false);
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all its messages? This cannot be undone.')) return;

    const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!response.ok) return;

    router.push('/dashboard');
  };

  const sessionGroups = messages.reduce<{ date: string; msgs: Message[] }[]>((groups, message) => {
    const day = format(new Date(message.createdAt), 'MMMM d, yyyy');
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.date === day) {
      lastGroup.msgs.push(message);
    } else {
      groups.push({ date: day, msgs: [message] });
    }

    return groups;
  }, []);

  const handleSend = async (overrideText?: string) => {
    const rawText = overrideText ?? input.trim();
    if (!rawText || !project || isLoading) return;

    const combined = attachment.trim()
      ? `[context]\n${attachment.trim()}\n[/context]\n\n${rawText}`
      : rawText;

    const userText = combined;
    setInput('');
    setAttachment('');
    setIsAttachmentOpen(false);
    setInlinePrompt(null);
    setIsLoading(true);
    setStreamingContent('');

    // Track messages locally so we can pass them to extractNextAction at the end
    let localUserMsg: Message | null = null;
    let localAiMsg: Message | null = null;

    try {
      const response = await fetch(`/api/projects/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: userText }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          const errData = (await response.json()) as { code?: string };
          if (errData.code === 'MESSAGE_LIMIT') {
            setMessageLimitReached(true);
            setIsLoading(false);
            setInput(userText);
            return;
          }
        }
        throw new Error(`Request failed: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;

          let event: { type: string; [key: string]: unknown };
          try {
            event = JSON.parse(line.slice(6)) as typeof event;
          } catch {
            continue;
          }

          if (event.type === 'user_message') {
            localUserMsg = event.message as Message;
            setMessages((prev) => [...prev, localUserMsg!]);
          } else if (event.type === 'chunk') {
            setStreamingContent((prev) => prev + (event.text as string));
          } else if (event.type === 'done') {
            localAiMsg = event.message as Message;
            setMessages((prev) => [...prev, localAiMsg!]);
            setStreamingContent('');
            setProject((curr) =>
              curr
                ? { ...curr, lastActive: localAiMsg!.createdAt, messageCount: curr.messageCount + 2 }
                : curr,
            );
            if (event.decision) {
              setPendingDecision(event.decision as ExtractedDecision);
            }
          } else if (event.type === 'error') {
            throw new Error(event.message as string);
          }
        }
      }

      // Background: extract next action
      if (localUserMsg && localAiMsg) {
        const allMsgs = [...messages, localUserMsg, localAiMsg];
        extractNextAction({
          projectName: project.name,
          recentMessages: allMsgs.map((m) => ({ role: m.role, content: m.content })),
        }).then((nextAction) => {
          if (!nextAction) return;
          void fetch(`/api/projects/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nextAction }),
          });
          setProject((curr) => (curr ? { ...curr, nextAction } : curr));
        }).catch(() => { /* non-critical */ });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setStreamingContent('');

      const errorResponse = await fetch(`/api/projects/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }),
      });

      if (errorResponse.ok) {
        const errorMsg = (await errorResponse.json()) as Message;
        setMessages((prev) => [...prev, errorMsg]);
        setProject((curr) =>
          curr ? { ...curr, lastActive: errorMsg.createdAt, messageCount: curr.messageCount + 2 } : curr,
        );
      }
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const handleCopy = (messageId: string, content: string) => {
    void navigator.clipboard.writeText(content).then(() => {
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    setDeletingMessageId(messageId);
  };

  const handleConfirmDelete = () => {
    const messageId = deletingMessageId;
    if (!messageId) return;
    setDeletingMessageId(null);

    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    if (pendingUndo) {
      clearTimeout(pendingUndo.timerId);
      void fetch(`/api/projects/${id}/messages/${pendingUndo.message.id}`, { method: 'DELETE' });
    }

    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    const timerId = setTimeout(() => {
      void fetch(`/api/projects/${id}/messages/${messageId}`, { method: 'DELETE' });
      setPendingUndo(null);
    }, 5000);

    setPendingUndo({ message, timerId });
  };

  const handleUndoDelete = () => {
    if (!pendingUndo) return;
    clearTimeout(pendingUndo.timerId);
    const restored = pendingUndo.message;
    setMessages((prev) => {
      const insertIndex = prev.findIndex((m) => m.createdAt > restored.createdAt);
      if (insertIndex === -1) return [...prev, restored];
      return [...prev.slice(0, insertIndex), restored, ...prev.slice(insertIndex)];
    });
    setPendingUndo(null);
  };

  const handleQuickChip = (text: string) => {
    void handleSend(text);
  };

  const handleAddTask = async () => {
    if (!taskInput.trim()) return;
    const title = taskInput.trim();
    setTaskInput('');
    const res = await fetch(`/api/projects/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) return;
    const task = (await res.json()) as Task;
    setTasks((prev) => [...prev, task]);
    setProject((curr) => curr ? { ...curr, taskCount: curr.taskCount + 1 } : curr);
  };

  const handleToggleTask = async (task: Task) => {
    const newCompleted = !task.completed;
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, completed: newCompleted } : t));
    setProject((curr) => curr ? {
      ...curr,
      completedTaskCount: newCompleted ? curr.completedTaskCount + 1 : curr.completedTaskCount - 1,
    } : curr);
    const res = await fetch(`/api/projects/${id}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: newCompleted }),
    });
    if (!res.ok) {
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, completed: task.completed } : t));
      setProject((curr) => curr ? {
        ...curr,
        completedTaskCount: task.completed ? curr.completedTaskCount + 1 : curr.completedTaskCount - 1,
      } : curr);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (task) {
      setProject((curr) => curr ? {
        ...curr,
        taskCount: curr.taskCount - 1,
        completedTaskCount: task.completed ? curr.completedTaskCount - 1 : curr.completedTaskCount,
      } : curr);
    }
    await fetch(`/api/projects/${id}/tasks/${taskId}`, { method: 'DELETE' });
  };

  const handleGenerateTasksFromMvp = async () => {
    if (!mvpScopeInput.trim()) return;
    setIsGeneratingTasks(true);
    const res = await fetch(`/api/projects/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromMvp: mvpScopeInput }),
    });
    setIsGeneratingTasks(false);
    if (!res.ok) return;
    const newTasks = (await res.json()) as Task[];
    setTasks(newTasks);
    setProject((curr) => curr ? {
      ...curr,
      taskCount: newTasks.length,
      completedTaskCount: newTasks.filter((t) => t.completed).length,
      mvpScope: mvpScopeInput,
    } : curr);
    setMvpScopeInput('');
    setIsSettingsOpen(false);
  };

  const handleCaptureTask = async () => {
    const title = captureTaskInput.trim();
    if (!title) return;
    setCaptureTaskMsgId(null);
    setCaptureTaskInput('');
    const res = await fetch(`/api/projects/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) return;
    const task = (await res.json()) as Task;
    setTasks((prev) => [...prev, task]);
    setProject((curr) => (curr ? { ...curr, taskCount: curr.taskCount + 1 } : curr));
  };

  const handlePinMessage = async (messageId: string, currentPinned: boolean) => {
    const newPinned = !currentPinned;
    setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, pinned: newPinned } : m));
    const res = await fetch(`/api/projects/${id}/messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: newPinned }),
    });
    if (!res.ok) {
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, pinned: currentPinned } : m));
    }
  };

  if (!project) {
    if (loadError) {
      return (
        <div className="flex min-h-svh items-center justify-center px-4 py-8">
          <div className="flex items-center gap-3 border-2 border-black bg-background px-6 py-4 text-black">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-mono text-sm">{loadError}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col bg-paper">
        <div className={`mx-auto grid h-full w-full max-w-[1600px] flex-1 ${sidebarCollapsed ? 'xl:grid-cols-[minmax(0,1fr)_40px]' : 'xl:grid-cols-[minmax(0,1fr)_300px]'}`}>
          <section className="flex min-h-0 flex-col border-r-2 border-black">
            {/* Header skeleton */}
            <header className="border-b-2 border-black bg-background px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16 rounded-none" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-48 rounded-none" />
                    <Skeleton className="h-5 w-14 rounded-none" />
                  </div>
                  <Skeleton className="h-3 w-64 rounded-none" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-28 rounded-none" />
                  <Skeleton className="h-9 w-24 rounded-none" />
                  <Skeleton className="h-9 w-8 rounded-none" />
                </div>
              </div>
            </header>

            {/* Message skeletons */}
            <div className="flex-1 px-6 py-8">
              <div className="mx-auto w-full max-w-3xl space-y-8">
                <div className="flex justify-start gap-3">
                  <div className="w-[65%] space-y-2">
                    <Skeleton className="h-3 w-10 rounded-none" />
                    <div className="border-2 border-black/10 bg-background p-5 space-y-2">
                      <Skeleton className="h-3 w-full rounded-none" />
                      <Skeleton className="h-3 w-full rounded-none" />
                      <Skeleton className="h-3 w-4/5 rounded-none" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <div className="w-[42%] space-y-2">
                    <div className="flex justify-end">
                      <Skeleton className="h-3 w-8 rounded-none" />
                    </div>
                    <div className="bg-black/5 p-5 space-y-2">
                      <Skeleton className="h-3 w-full rounded-none" />
                      <Skeleton className="h-3 w-3/4 rounded-none" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-start gap-3">
                  <div className="w-[72%] space-y-2">
                    <Skeleton className="h-3 w-10 rounded-none" />
                    <div className="border-2 border-black/10 bg-background p-5 space-y-2">
                      <Skeleton className="h-3 w-full rounded-none" />
                      <Skeleton className="h-3 w-full rounded-none" />
                      <Skeleton className="h-3 w-full rounded-none" />
                      <Skeleton className="h-3 w-2/3 rounded-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input skeleton */}
            <div className="border-t-2 border-black px-6 py-4">
              <div className="mx-auto w-full max-w-3xl">
                <Skeleton className="h-[52px] w-full rounded-none" />
              </div>
            </div>
          </section>

          {/* Sidebar skeleton */}
          <aside className="hidden border-l-2 border-black xl:flex xl:flex-col">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center pt-3">
                <Skeleton className="h-7 w-7 rounded-none" />
              </div>
            ) : (
              <>
                <div className="border-b-2 border-black px-5 py-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-16 rounded-none" />
                    <div className="flex gap-1">
                      <Skeleton className="h-7 w-7 rounded-none" />
                      <Skeleton className="h-7 w-7 rounded-none" />
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-none" />
                    <Skeleton className="h-5 w-20 rounded-none" />
                    <Skeleton className="h-5 w-14 rounded-none" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <Skeleton className="h-10 w-full rounded-none" />
                    <Skeleton className="h-10 w-full rounded-none" />
                    <Skeleton className="h-10 w-full rounded-none" />
                  </div>
                </div>
                <div className="px-5 py-5 space-y-3">
                  <Skeleton className="h-3 w-14 rounded-none" />
                  <Skeleton className="h-20 w-full rounded-none" />
                  <Skeleton className="h-14 w-full rounded-none" />
                  <Skeleton className="h-14 w-full rounded-none" />
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full flex-col bg-paper">
        <div className={`mx-auto grid h-full w-full max-w-[1600px] flex-1 ${sidebarCollapsed ? 'xl:grid-cols-[minmax(0,1fr)_40px]' : 'xl:grid-cols-[minmax(0,1fr)_300px]'} transition-all duration-200`}>

          {/* Chat column */}
          <section className="flex min-h-0 flex-col border-r-2 border-black">
            {/* Header */}
            <header className="border-b-2 border-black bg-background px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-black/35 transition-colors hover:text-black xl:hidden"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Back
                  </Link>
                  <div className="flex flex-wrap items-center gap-4">
                    <h1 className="font-headline text-2xl font-black tracking-tight text-black md:text-3xl">
                      {project.name}
                    </h1>
                    <span className="border border-black/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-black/40">
                      {isLoading ? 'Thinking...' : 'Ready'}
                    </span>
                  </div>
                  {project.description ? (
                    <p className="font-mono text-xs text-black/55">
                      {project.description}
                    </p>
                  ) : null}
                  {project.nextAction ? (
                    <div className="inline-flex items-center gap-2 border-2 border-yellow-400 bg-yellow-100 px-3 py-1 font-mono text-[10px]">
                      <ArrowRight className="h-3 w-3 shrink-0 text-yellow-600" />
                      <span className="uppercase tracking-[0.15em] text-yellow-700 font-bold">Next</span>
                      <span className="text-yellow-900">{project.nextAction}</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    asChild
                    className="h-9 rounded-none border-2 border-black bg-yellow-300 px-3 font-mono text-xs uppercase tracking-[0.15em] text-black hover:bg-black hover:text-white transition-colors"
                  >
                    <Link href={`/project/${id}/launch`}>
                      <Sparkles className="mr-2 h-3.5 w-3.5" />
                      Launch Assistant
                      {userPlan?.plan === 'free' ? (
                        <span className="ml-2 border border-black/25 px-1.5 py-0.5 text-[9px] leading-none">
                          Pro
                        </span>
                      ) : null}
                    </Link>
                  </Button>
                  {project.githubOwner && project.githubRepoName && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="h-9 rounded-none border-2 border-black bg-background font-mono text-xs uppercase tracking-[0.15em] text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                          >
                            <GitBranch className={`mr-2 h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing…' : 'Sync GitHub'}
                          </Button>
                        </TooltipTrigger>
                        {project.lastSyncedAt && (
                          <TooltipContent>
                            <p>Last synced {formatDistanceToNow(new Date(project.lastSyncedAt), { addSuffix: true })}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <TooltipProvider>
                    <div className="flex items-center border-2 border-black">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={() => setIsSessionHistoryOpen(true)}
                            className="h-8 w-8 rounded-none p-0 text-black hover:bg-black hover:text-white transition-colors"
                          >
                            <History className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>History</p></TooltipContent>
                      </Tooltip>
                      <div className="w-px h-5 bg-black/20" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={handleExportMarkdown}
                            disabled={messages.length === 0}
                            className="h-8 w-8 rounded-none p-0 text-black hover:bg-black hover:text-white transition-colors disabled:opacity-40"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Export</p></TooltipContent>
                      </Tooltip>
                      <div className="w-px h-5 bg-black/20" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={() => { setIsSettingsOpen(true); void loadMembers(); }}
                            className="h-8 w-8 rounded-none p-0 text-black hover:bg-black hover:text-white transition-colors"
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Settings</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
              </div>
            </header>

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="mx-auto flex w-full max-w-3xl flex-col px-6 pb-12 pt-8">
                {loadError ? (
                  <div className="mb-4 flex items-center gap-2 border-2 border-black bg-background px-4 py-3 font-mono text-sm text-black">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{loadError}</span>
                  </div>
                ) : null}

                {isLoadingMessages ? (
                  <div className="space-y-8 py-8">
                    <div className="flex justify-start">
                      <div className="w-[62%] space-y-2">
                        <Skeleton className="h-3 w-10 rounded-none" />
                        <div className="border-2 border-black/10 bg-background p-5 space-y-2">
                          <Skeleton className="h-3 w-full rounded-none" />
                          <Skeleton className="h-3 w-full rounded-none" />
                          <Skeleton className="h-3 w-4/5 rounded-none" />
                        </div>
                        <Skeleton className="h-3 w-8 rounded-none" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="w-[38%] space-y-2">
                        <div className="flex justify-end"><Skeleton className="h-3 w-8 rounded-none" /></div>
                        <div className="bg-black p-5 space-y-2">
                          <Skeleton className="h-3 w-full rounded-none bg-white/20" />
                          <Skeleton className="h-3 w-3/4 rounded-none bg-white/20" />
                        </div>
                        <div className="flex justify-end"><Skeleton className="h-3 w-8 rounded-none" /></div>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="w-[70%] space-y-2">
                        <Skeleton className="h-3 w-10 rounded-none" />
                        <div className="border-2 border-black/10 bg-background p-5 space-y-2">
                          <Skeleton className="h-3 w-full rounded-none" />
                          <Skeleton className="h-3 w-full rounded-none" />
                          <Skeleton className="h-3 w-full rounded-none" />
                          <Skeleton className="h-3 w-2/3 rounded-none" />
                        </div>
                        <Skeleton className="h-3 w-8 rounded-none" />
                      </div>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
                    <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.4em] text-black/20">
                      — Start —
                    </p>
                    <h2 className="font-headline text-4xl font-black text-black">
                      Ask anything about
                    </h2>
                    <h2 className="font-headline text-4xl font-black text-black/20">
                      {project.name}
                    </h2>
                    <p className="mt-4 max-w-md font-mono text-xs leading-6 text-black/50">
                      This thread knows your stack, goals, blockers, and target user.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      {[
                        'Where should I start today?',
                        'Review my current architecture',
                        'Help me plan this week',
                      ].map((chip) => (
                        <button
                          key={chip}
                          onClick={() => handleQuickChip(chip)}
                          className="border-2 border-black px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-black hover:bg-black hover:text-white transition-colors duration-150"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 py-4">
                    {messages.map((message) => (
                      <article
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] md:max-w-[78%] flex flex-col gap-1.5 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-black/30">
                            {message.role === 'assistant' ? (
                              <>
                                <Sparkles className="h-3 w-3" />
                                Linna
                              </>
                            ) : (
                              <>
                                <MessageSquareText className="h-3 w-3" />
                                You
                              </>
                            )}
                          </div>

                          <div className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                            {message.role === 'assistant' ? (
                              <div className="prose-ai">
                                <ReactMarkdown
                                  rehypePlugins={[rehypeHighlight]}
                                  components={{
                                    h1: ({ children }) => <h1 className="font-headline text-xl font-black text-black mt-4 mb-2 first:mt-0">{children}</h1>,
                                    h2: ({ children }) => <h2 className="font-headline text-lg font-black text-black mt-4 mb-2 first:mt-0">{children}</h2>,
                                    h3: ({ children }) => <h3 className="font-headline text-base font-bold text-black mt-3 mb-1 first:mt-0">{children}</h3>,
                                    p: ({ children }) => <p className="text-sm leading-7 my-2 first:mt-0 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="my-2 space-y-1 list-disc pl-5 text-sm leading-7">{children}</ul>,
                                    ol: ({ children }) => <ol className="my-2 space-y-1 list-decimal pl-5 text-sm leading-7">{children}</ol>,
                                    li: ({ children }) => <li className="text-sm leading-7">{children}</li>,
                                    strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
                                    em: ({ children }) => <em className="italic">{children}</em>,
                                    blockquote: ({ children }) => (
                                      <blockquote className="my-3 border-l-4 border-black/20 pl-4 font-mono text-xs text-black/50 italic">
                                        {children}
                                      </blockquote>
                                    ),
                                    a: ({ href, children }) => (
                                      <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 decoration-black/30 hover:decoration-black transition-colors">
                                        {children}
                                      </a>
                                    ),
                                    hr: () => <hr className="my-4 border-black/15" />,
                                    code: ({ className, children, ...props }) => {
                                      const isBlock = className?.includes('language-');
                                      if (isBlock) {
                                        return (
                                          <code className={`${className ?? ''} block text-[12.5px] leading-6`} {...props}>
                                            {children}
                                          </code>
                                        );
                                      }
                                      return (
                                        <code className="rounded-sm bg-black/8 px-1.5 py-0.5 font-mono text-[12px] text-black" {...props}>
                                          {children}
                                        </code>
                                      );
                                    },
                                    pre: ({ children }) => (
                                      <pre className="my-3 overflow-x-auto border-2 border-black/10 bg-[#f6f8fa] p-4 font-mono text-[12.5px] leading-6 first:mt-0 last:mb-0">
                                        {children}
                                      </pre>
                                    ),
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            ) : (() => {
                              const attachRe = /^\[context\]\n([\s\S]*?)\n\[\/context\]\n\n([\s\S]*)$/;
                              const match = message.content.match(attachRe);
                              if (match) {
                                return (
                                  <>
                                    <details className="mb-2 group/att">
                                      <summary className="flex cursor-pointer items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white/80 transition-colors list-none">
                                        <Paperclip className="h-2.5 w-2.5" />
                                        Attached context
                                      </summary>
                                      <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-none border border-white/20 bg-white/10 p-3 font-mono text-[11px] leading-5 text-white/70">
                                        {match[1]}
                                      </pre>
                                    </details>
                                    <p className="whitespace-pre-wrap text-sm leading-7">{match[2]}</p>
                                  </>
                                );
                              }
                              return <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>;
                            })()}
                          </div>

                          <div className={`flex items-center gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="font-mono text-[10px] text-black/25">
                              {format(new Date(message.createdAt), 'h:mm a')}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleCopy(message.id, message.content)}
                                className="flex h-5 w-5 items-center justify-center text-black/20 transition-colors hover:text-black/60"
                                title="Copy"
                              >
                                {copiedId === message.id ? (
                                  <Check className="h-3 w-3 text-black/60" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                              {message.role === 'assistant' ? (
                                <>
                                  <button
                                    onClick={() => void handlePinMessage(message.id, message.pinned)}
                                    className={`flex h-5 w-5 items-center justify-center transition-colors ${message.pinned ? 'text-black/60' : 'text-black/20 hover:text-black/60'}`}
                                    title={message.pinned ? 'Unpin' : 'Pin as reference'}
                                  >
                                    <Bookmark className={`h-3 w-3 ${message.pinned ? 'fill-current' : ''}`} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      const suggestion = message.content.replace(/[#*`>\-]/g, '').trim().slice(0, 80);
                                      setCaptureTaskInput(suggestion);
                                      setCaptureTaskMsgId(message.id);
                                    }}
                                    className="flex h-5 w-5 items-center justify-center text-black/20 transition-colors hover:text-black/60"
                                    title="Capture as task"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </>
                              ) : null}
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="flex h-5 w-5 items-center justify-center text-black/20 transition-colors hover:text-red-500"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          {captureTaskMsgId === message.id ? (
                            <div className="mt-2 flex items-center gap-1 border-2 border-black bg-background">
                              <input
                                autoFocus
                                type="text"
                                value={captureTaskInput}
                                onChange={(e) => setCaptureTaskInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') void handleCaptureTask();
                                  if (e.key === 'Escape') { setCaptureTaskMsgId(null); setCaptureTaskInput(''); }
                                }}
                                placeholder="Task title..."
                                className="flex-1 border-0 bg-transparent px-3 py-1.5 font-mono text-xs placeholder:text-black/25 focus:outline-none"
                              />
                              <button
                                onClick={() => void handleCaptureTask()}
                                disabled={!captureTaskInput.trim()}
                                className="border-l-2 border-black px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-black/50 hover:bg-black hover:text-white transition-colors disabled:opacity-30"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => { setCaptureTaskMsgId(null); setCaptureTaskInput(''); }}
                                className="border-l-2 border-black px-2 py-1.5 text-black/30 hover:bg-black hover:text-white transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </article>
                    ))}

                    {isGeneratingPrompt ? (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] md:max-w-[78%] space-y-1.5">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-black/30">
                            <Sparkles className="h-3 w-3" />
                            Prompt
                          </div>
                          <div className="border-2 border-dashed border-black/30 bg-background p-4 flex items-center gap-2">
                            <div className="h-1.5 w-1.5 animate-bounce bg-black [animation-delay:-0.3s]" />
                            <div className="h-1.5 w-1.5 animate-bounce bg-black [animation-delay:-0.15s]" />
                            <div className="h-1.5 w-1.5 animate-bounce bg-black" />
                          </div>
                        </div>
                      </div>
                    ) : inlinePrompt ? (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] md:max-w-[78%] space-y-1.5">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-black/30">
                            <Sparkles className="h-3 w-3" />
                            Prompt
                          </div>
                          <div className="border-2 border-dashed border-black bg-[#f6f8fa] p-4">
                            <pre className="whitespace-pre-wrap font-mono text-[12px] leading-6 text-black">{inlinePrompt}</pre>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleCopyPrompt}
                              className="flex items-center gap-1.5 border border-black/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-black/50 transition-colors hover:border-black hover:text-black"
                            >
                              {promptCopied ? (
                                <><Check className="h-3 w-3" />Copied</>
                              ) : (
                                <><Copy className="h-3 w-3" />Copy Prompt</>
                              )}
                            </button>
                            <button
                              onClick={() => setInlinePrompt(null)}
                              className="flex h-5 w-5 items-center justify-center text-black/20 transition-colors hover:text-black/60"
                              title="Dismiss"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {isLoading && streamingContent ? (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] md:max-w-[78%] flex flex-col gap-1.5 items-start">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-black/30">
                            <Sparkles className="h-3 w-3" />
                            Linna
                          </div>
                          <div className="chat-bubble-ai">
                            <div className="prose-ai">
                              <ReactMarkdown
                                rehypePlugins={[rehypeHighlight]}
                                components={{
                                  h1: ({ children }) => <h1 className="font-headline text-xl font-black text-black mt-4 mb-2 first:mt-0">{children}</h1>,
                                  h2: ({ children }) => <h2 className="font-headline text-lg font-black text-black mt-4 mb-2 first:mt-0">{children}</h2>,
                                  h3: ({ children }) => <h3 className="font-headline text-base font-bold text-black mt-3 mb-1 first:mt-0">{children}</h3>,
                                  p: ({ children }) => <p className="text-sm leading-7 my-2 first:mt-0 last:mb-0">{children}</p>,
                                  ul: ({ children }) => <ul className="my-2 space-y-1 list-disc pl-5 text-sm leading-7">{children}</ul>,
                                  ol: ({ children }) => <ol className="my-2 space-y-1 list-decimal pl-5 text-sm leading-7">{children}</ol>,
                                  li: ({ children }) => <li className="text-sm leading-7">{children}</li>,
                                  strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
                                  em: ({ children }) => <em className="italic">{children}</em>,
                                  code: ({ className, children, ...props }) => {
                                    const isBlock = className?.includes('language-');
                                    if (isBlock) {
                                      return <code className={`${className ?? ''} block text-[12.5px] leading-6`} {...props}>{children}</code>;
                                    }
                                    return <code className="rounded-sm bg-black/8 px-1.5 py-0.5 font-mono text-[12px] text-black" {...props}>{children}</code>;
                                  },
                                  pre: ({ children }) => (
                                    <pre className="my-3 overflow-x-auto border-2 border-black/10 bg-[#f6f8fa] p-4 font-mono text-[12.5px] leading-6 first:mt-0 last:mb-0">{children}</pre>
                                  ),
                                }}
                              >
                                {streamingContent}
                              </ReactMarkdown>
                              <span className="inline-block h-3.5 w-0.5 animate-pulse bg-black/50 ml-0.5 align-middle" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : isLoading ? (
                      <div className="flex justify-start">
                        <div className="chat-bubble-ai flex items-center gap-2">
                          <div className="h-1.5 w-1.5 animate-bounce bg-black [animation-delay:-0.3s]" />
                          <div className="h-1.5 w-1.5 animate-bounce bg-black [animation-delay:-0.15s]" />
                          <div className="h-1.5 w-1.5 animate-bounce bg-black" />
                        </div>
                      </div>
                    ) : null}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Undo banner */}
            {pendingUndo ? (
              <div className="flex items-center justify-between border-t-2 border-black bg-yellow-50 px-6 py-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/60">
                  Message deleted
                </span>
                <button
                  onClick={handleUndoDelete}
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-black underline underline-offset-2 hover:no-underline transition-all"
                >
                  Undo
                </button>
              </div>
            ) : null}

            {/* GitHub sync notification */}
            {syncNotification ? (
              <div className="flex items-center justify-between border-t-2 border-black bg-sky-50 px-6 py-2">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-3 w-3 shrink-0 text-sky-600" />
                  <span className="font-mono text-[10px] text-sky-800">{syncNotification}</span>
                </div>
                <button
                  onClick={() => setSyncNotification(null)}
                  className="text-sky-600 hover:text-sky-900 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null}

            {/* Input bar */}
            <div className="border-t-2 border-black bg-paper px-6 py-4">
              <div className="mx-auto w-full max-w-3xl">
                {lastAssistantMessage && !isLoading ? (
                  <div className="mb-3 flex justify-end">
                    <button
                      onClick={() => void handleGeneratePrompt()}
                      disabled={isGeneratingPrompt}
                      className="flex items-center gap-1.5 border-2 border-black bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                    >
                      <Sparkles className="h-3 w-3" />
                      {isGeneratingPrompt ? 'Creating…' : 'Create Prompt'}
                    </button>
                  </div>
                ) : null}
                {pendingDecision ? (
                  <div className="border-2 border-emerald-400 bg-emerald-50 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-emerald-300 border-2 border-foreground flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs font-bold text-foreground mb-1">Decision detected</p>
                        <p className="font-mono text-[11px] text-foreground/70 leading-5 mb-3">{pendingDecision.summary}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => void handleApplyDecision()}
                            disabled={isApplyingDecision}
                            className="inline-flex items-center gap-1.5 border-2 border-foreground bg-foreground text-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" />
                            {isApplyingDecision ? 'Updating…' : 'Update project'}
                          </button>
                          <button
                            onClick={() => setPendingDecision(null)}
                            className="inline-flex items-center gap-1.5 border-2 border-foreground bg-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors"
                          >
                            <X className="w-3 h-3" />
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
                {messageLimitReached ? (
                  <div className="border-2 border-yellow-400 bg-yellow-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-300 border-2 border-foreground flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs font-bold text-foreground mb-1">Monthly limit reached</p>
                        <p className="font-mono text-[11px] text-foreground/60 leading-5 mb-3">
                          Free plan allows {FREE_PLAN_LIMITS.monthlyMessages} messages per month. Upgrade to Pro for unlimited messages.
                        </p>
                        <Link
                          href="/pricing"
                          className="inline-flex items-center gap-1.5 border-2 border-foreground bg-foreground text-background px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-background hover:text-foreground transition-colors"
                        >
                          Upgrade to Pro
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Attachment panel */}
                    {isAttachmentOpen ? (
                      <div className="mb-2 border-2 border-black/20 bg-background">
                        <div className="flex items-center justify-between border-b border-black/10 px-3 py-1.5">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-black/40">
                            <Paperclip className="h-2.5 w-2.5" />
                            Paste context (error log, stack trace, code…)
                          </div>
                          <button
                            onClick={() => { setIsAttachmentOpen(false); setAttachment(''); }}
                            className="text-black/25 hover:text-black transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <textarea
                          autoFocus
                          rows={5}
                          placeholder="Paste your code, error log, or stack trace here..."
                          value={attachment}
                          onChange={(e) => setAttachment(e.target.value)}
                          className="w-full resize-none border-0 bg-transparent px-3 py-2 font-mono text-[12px] leading-5 placeholder:text-black/25 focus:outline-none focus:ring-0"
                        />
                        {attachment.trim() ? (
                          <div className="border-t border-black/10 px-3 py-1.5 flex items-center justify-between">
                            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/30">
                              {attachment.trim().split('\n').length} lines · will be sent with your next message
                            </span>
                            <span className={`font-mono text-[9px] ${(attachment.length + input.length) > 45000 ? 'text-red-500' : 'text-black/25'}`}>
                              {attachment.length + input.length}/50k
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="flex items-end gap-0 border-2 border-black bg-background">
                      <button
                        onClick={() => setIsAttachmentOpen((v) => !v)}
                        className={`flex h-[52px] w-[44px] shrink-0 items-center justify-center border-r-2 border-black transition-colors ${isAttachmentOpen || attachment ? 'bg-black text-white' : 'text-black/30 hover:text-black'}`}
                        title="Attach context"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        {attachment.trim() ? (
                          <span className="absolute ml-5 mb-5 h-1.5 w-1.5 rounded-full bg-sky-500" />
                        ) : null}
                      </button>
                      <textarea
                        rows={1}
                        placeholder="Message Linna about this project..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            void handleSend();
                          }
                        }}
                        className="min-h-[52px] flex-1 resize-none border-0 bg-transparent px-4 py-3.5 font-mono text-sm leading-6 placeholder:text-black/30 focus:outline-none focus:ring-0"
                      />
                      <Button
                        onClick={() => void handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="h-[52px] w-[52px] rounded-none border-0 border-l-2 border-black bg-black p-0 text-white hover:bg-background hover:text-black disabled:opacity-30 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-black/25">
                      Enter to send · Shift+Enter for new line
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Context sidebar */}
          <aside className="hidden border-l-2 border-black xl:flex xl:flex-col xl:overflow-y-auto">
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center pt-3 gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none text-black/35 hover:bg-black hover:text-white transition-colors"
                        onClick={() => setSidebarCollapsed(false)}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left"><p>Expand sidebar</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : (
            <>
            <div className="border-b-2 border-black px-5 py-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-black/35">Context</p>
                <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none text-black/35 hover:bg-black hover:text-white transition-colors"
                  onClick={openEdit}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none text-black/35 hover:bg-black hover:text-white transition-colors"
                        onClick={() => setSidebarCollapsed(true)}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left"><p>Collapse sidebar</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                </div>
              </div>

              {project.techStack.split(',').map((t) => t.trim()).filter(Boolean).length > 0 ? (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {project.techStack
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <span
                        key={tag}
                        className="border border-black/25 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-black/50"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              ) : null}

              <Accordion type="multiple" defaultValue={['goals', 'blockers', 'audience']}>
                <AccordionItem value="goals" className="border-b border-black/15">
                  <AccordionTrigger className="font-mono text-xs uppercase tracking-[0.2em] text-black hover:no-underline py-3">
                    Goals
                  </AccordionTrigger>
                  <AccordionContent className="font-mono text-xs leading-6 text-black/50 pb-3">
                    {project.goals || 'No goals added yet.'}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="blockers" className="border-b border-black/15">
                  <AccordionTrigger className="font-mono text-xs uppercase tracking-[0.2em] text-black hover:no-underline py-3">
                    Blockers
                  </AccordionTrigger>
                  <AccordionContent className="font-mono text-xs leading-6 text-black/50 pb-3">
                    {project.blockers || 'No blockers recorded yet.'}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="audience" className="border-0">
                  <AccordionTrigger className="font-mono text-xs uppercase tracking-[0.2em] text-black hover:no-underline py-3">
                    Target user
                  </AccordionTrigger>
                  <AccordionContent className="font-mono text-xs leading-6 text-black/50 pb-3">
                    {project.targetUser || 'No audience noted yet.'}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Tasks section */}
            <div className="border-b-2 border-black px-5 py-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-black/35">Tasks</p>
                {project.taskCount > 0 ? (
                  <span className="font-mono text-[10px] text-black/35">
                    {project.completedTaskCount}/{project.taskCount}
                  </span>
                ) : null}
              </div>

              {project.taskCount > 0 ? (
                <Progress
                  value={(project.completedTaskCount / project.taskCount) * 100}
                  className="h-1 rounded-none mb-4 bg-black/10 [&>div]:bg-black [&>div]:rounded-none"
                />
              ) : null}

              <div className="space-y-1 mb-3">
                {tasks.map((task, index) => {
                  const TASK_COLORS = ['bg-yellow-100', 'bg-sky-100', 'bg-green-100', 'bg-pink-100', 'bg-violet-100', 'bg-orange-100'];
                  const taskColor = TASK_COLORS[index % TASK_COLORS.length];
                  return (
                  <div key={task.id} className={`group flex items-start gap-2 px-2 py-1 ${task.completed ? 'bg-black/4' : taskColor}`}>
                    <button
                      onClick={() => void handleToggleTask(task)}
                      className="mt-0.5 shrink-0 text-black/25 hover:text-black transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-black" />
                      ) : (
                        <Circle className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <span className={`flex-1 font-mono text-[11px] leading-5 ${task.completed ? 'line-through text-black/25' : 'text-black/70'}`}>
                      {task.title}
                    </span>
                    <button
                      onClick={() => void handleDeleteTask(task.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-black/25 hover:text-black transition-all"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  );
                })}
                {tasks.length === 0 ? (
                  <p className="font-mono text-[10px] text-black/25 py-1">No tasks yet.</p>
                ) : null}
              </div>

              <div className="flex items-center border border-black/15 focus-within:border-black transition-colors">
                <input
                  type="text"
                  placeholder="Add a task..."
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && taskInput.trim()) void handleAddTask();
                  }}
                  className="flex-1 border-0 bg-transparent px-2.5 py-1.5 font-mono text-[11px] placeholder:text-black/20 focus:outline-none"
                />
                <button
                  onClick={() => void handleAddTask()}
                  disabled={!taskInput.trim()}
                  className="shrink-0 px-2 py-1.5 text-black/25 hover:text-black disabled:pointer-events-none transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="px-5 py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-black/35 mb-4">Activity</p>
              <div className="space-y-3">
                <div className="border-2 border-black p-4">
                  <p className="font-mono text-3xl font-black text-black">{project.messageCount}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/35 mt-1">Messages</p>
                </div>
                <div className="border border-black/15 p-4">
                  <p className="font-mono text-xs font-semibold text-black">
                    {formatDistanceToNow(new Date(project.lastActive))} ago
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/35 mt-0.5">Last active</p>
                </div>
                <div className="border border-black/15 p-4">
                  <p className="font-mono text-xs font-semibold text-black">
                    {formatDistanceToNow(new Date(project.createdAt))} ago
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/35 mt-0.5">Created</p>
                </div>
                {userPlan?.plan === 'free' ? (
                  <div className="border-2 border-black/20 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/35">Monthly usage</p>
                      <p className="font-mono text-[10px] font-semibold text-black">
                        {userPlan.monthlyMessageCount}<span className="text-black/35">/{FREE_PLAN_LIMITS.monthlyMessages}</span>
                      </p>
                    </div>
                    <Progress
                      value={(userPlan.monthlyMessageCount / FREE_PLAN_LIMITS.monthlyMessages) * 100}
                      className={`h-1.5 rounded-none bg-black/10 [&>div]:rounded-none ${userPlan.monthlyMessageCount >= Math.floor(FREE_PLAN_LIMITS.monthlyMessages * 0.9) ? '[&>div]:bg-red-500' : '[&>div]:bg-black'}`}
                    />
                    {userPlan.monthlyMessageCount >= Math.floor(FREE_PLAN_LIMITS.monthlyMessages * 0.9) ? (
                      <p className="font-mono text-[9px] text-red-600 leading-relaxed">
                        {userPlan.monthlyMessageCount >= FREE_PLAN_LIMITS.monthlyMessages ? 'Limit reached.' : 'Almost at limit.'}{' '}
                        <a href="/pricing" className="underline hover:no-underline">Upgrade to Pro</a> for unlimited messages.
                      </p>
                    ) : (
                      <p className="font-mono text-[9px] text-black/30 leading-relaxed">
                        {Math.max(FREE_PLAN_LIMITS.monthlyMessages - userPlan.monthlyMessageCount, 0)} messages left this month.
                      </p>
                    )}
                  </div>
                ) : userPlan?.plan === 'pro' ? (
                  <div className="border border-black/15 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/35">Plan</p>
                    <p className="font-mono text-xs font-semibold text-black mt-0.5">Pro — Unlimited</p>
                  </div>
                ) : null}
              </div>
            </div>
            </>
            )}
          </aside>
        </div>
      </div>

      {/* History sheet */}
      <Sheet open={isSessionHistoryOpen} onOpenChange={(open) => { setIsSessionHistoryOpen(open); if (!open) { setHistorySearch(''); setPinnedView(false); } }}>
        <SheetContent side="right" className="flex w-96 flex-col rounded-none border-l-2 border-black bg-paper shadow-none">
          <SheetHeader className="shrink-0 border-b-2 border-black pb-4">
            <SheetTitle className="font-mono text-xs uppercase tracking-[0.3em] text-black">
              Session History
            </SheetTitle>
          </SheetHeader>

          {/* Tabs: All / Pinned */}
          <div className="shrink-0 flex border-b-2 border-black">
            <button
              onClick={() => setPinnedView(false)}
              className={`flex-1 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${!pinnedView ? 'bg-black text-white' : 'text-black/40 hover:text-black'}`}
            >
              All
            </button>
            <button
              onClick={() => { setPinnedView(true); setHistorySearch(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${pinnedView ? 'bg-black text-white' : 'text-black/40 hover:text-black'}`}
            >
              <Bookmark className="h-2.5 w-2.5" />
              Pinned ({messages.filter((m) => m.pinned).length})
            </button>
          </div>

          {!pinnedView ? (
            <div className="shrink-0 border-b border-black/10 py-3">
              <div className="flex items-center gap-2 border border-black/20 bg-background px-2.5 py-1.5 focus-within:border-black transition-colors">
                <Search className="h-3 w-3 shrink-0 text-black/30" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="flex-1 border-0 bg-transparent font-mono text-[11px] placeholder:text-black/25 focus:outline-none"
                />
                {historySearch ? (
                  <button onClick={() => setHistorySearch('')} className="text-black/30 hover:text-black transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                ) : null}
              </div>
              {historySearch ? (
                <p className="mt-1.5 font-mono text-[9px] text-black/30">
                  {messages.filter((m) => m.content.toLowerCase().includes(historySearch.toLowerCase())).length} result(s)
                </p>
              ) : null}
            </div>
          ) : null}

          <ScrollArea className="mt-4 flex-1 -mx-6 px-6">
            {pinnedView ? (
              (() => {
                const pinned = messages.filter((m) => m.pinned && m.role === 'assistant');
                if (pinned.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Bookmark className="mb-3 h-6 w-6 text-black/20" />
                      <p className="font-mono text-xs text-black/30">No pinned messages yet.</p>
                      <p className="mt-2 font-mono text-[10px] text-black/20 leading-5">
                        Pin an AI response to build your reference library.
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-4 pb-6">
                    {[...pinned].reverse().map((msg) => {
                      const msgIndex = messages.indexOf(msg);
                      const precedingUser = msgIndex > 0 && messages[msgIndex - 1].role === 'user'
                        ? messages[msgIndex - 1]
                        : null;
                      return (
                        <div key={msg.id} className="border-2 border-black/10 bg-background">
                          {precedingUser ? (
                            <div className="border-b border-black/10 px-3 py-2">
                              <span className="block font-mono text-[9px] uppercase tracking-[0.3em] text-black/30 mb-0.5">Q</span>
                              <p className="font-mono text-[11px] leading-5 text-black/50 line-clamp-2">
                                {precedingUser.content.replace(/^\[context\]\n[\s\S]*?\n\[\/context\]\n\n/, '')}
                              </p>
                            </div>
                          ) : null}
                          <div className="px-3 py-2">
                            <span className="block font-mono text-[9px] uppercase tracking-[0.3em] text-black/30 mb-0.5">A</span>
                            <p className="font-mono text-[11px] leading-5 text-black line-clamp-6">
                              {msg.content.replace(/[#*`>]/g, '').trim()}
                            </p>
                          </div>
                          <div className="flex items-center justify-between border-t border-black/10 px-3 py-1.5">
                            <span className="font-mono text-[9px] text-black/30">
                              {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                            </span>
                            <button
                              onClick={() => void handlePinMessage(msg.id, msg.pinned)}
                              className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/30 hover:text-black transition-colors"
                            >
                              Unpin
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            ) : (
              (() => {
                const query = historySearch.toLowerCase();
                const filteredGroups = sessionGroups
                  .map((group) => ({
                    ...group,
                    msgs: group.msgs.filter((m) =>
                      !query || m.content.toLowerCase().includes(query)
                    ),
                  }))
                  .filter((group) => group.msgs.length > 0);

                if (messages.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <History className="mb-3 h-6 w-6 text-black/20" />
                      <p className="font-mono text-xs text-black/30">No messages yet.</p>
                    </div>
                  );
                }

                if (filteredGroups.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Search className="mb-3 h-6 w-6 text-black/20" />
                      <p className="font-mono text-xs text-black/30">No messages match your search.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6 pb-6">
                    {[...filteredGroups].reverse().map((group) => (
                      <div key={group.date}>
                        <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.4em] text-black/30">
                          {group.date}
                        </p>
                        <div className="space-y-2">
                          {group.msgs.map((message) => {
                            const content = message.content;
                            const highlight = (text: string) => {
                              if (!query) return <>{text}</>;
                              const idx = text.toLowerCase().indexOf(query);
                              if (idx === -1) return <>{text}</>;
                              return (
                                <>
                                  {text.slice(0, idx)}
                                  <mark className="bg-yellow-200 text-black">{text.slice(idx, idx + query.length)}</mark>
                                  {text.slice(idx + query.length)}
                                </>
                              );
                            };
                            const displayContent = message.role === 'user'
                              ? content.replace(/^\[context\]\n[\s\S]*?\n\[\/context\]\n\n/, '')
                              : content;
                            return (
                              <div
                                key={message.id}
                                className={`border px-3 py-2 text-xs leading-relaxed ${
                                  message.role === 'user'
                                    ? 'ml-4 border-black bg-black text-white'
                                    : 'mr-4 border-black/20 bg-background text-black'
                                }`}
                              >
                                <div className="mb-0.5 flex items-center justify-between">
                                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-50">
                                    {message.role === 'user' ? 'You' : 'Linna'}
                                  </span>
                                  {message.pinned ? (
                                    <Bookmark className="h-2.5 w-2.5 fill-current opacity-50" />
                                  ) : null}
                                </div>
                                <p className="line-clamp-3 font-mono text-[11px]">
                                  {highlight(displayContent.slice(0, 200))}
                                </p>
                                <span className="mt-1 block font-mono text-[9px] opacity-40">
                                  {format(new Date(message.createdAt), 'h:mm a')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Settings sheet */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent side="right" className="flex w-96 flex-col rounded-none border-l-2 border-black bg-paper shadow-none">
          <SheetHeader className="shrink-0 border-b-2 border-black pb-4">
            <SheetTitle className="font-mono text-xs uppercase tracking-[0.3em] text-black">
              Project Settings
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="mt-4 flex-1 -mx-6 px-6">
            <div className="space-y-6 pb-6">
              <div className="space-y-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-black/30">About</p>
                <div className="space-y-3 border-2 border-black p-4 font-mono text-xs">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-black/35 mb-0.5">Name</p>
                    <p className="font-semibold text-black">{project.name}</p>
                  </div>
                  {project.description ? (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.3em] text-black/35 mb-0.5">Description</p>
                      <p className="text-black/60">{project.description}</p>
                    </div>
                  ) : null}
                  {project.targetUser ? (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.3em] text-black/35 mb-0.5">Target User</p>
                      <p className="text-black/60">{project.targetUser}</p>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-black/35 mb-0.5">Created</p>
                    <p className="text-black/60">{formatDistanceToNow(new Date(project.createdAt))} ago</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-none border-2 border-black bg-background font-mono text-xs uppercase tracking-[0.15em] text-black hover:bg-black hover:text-white transition-colors"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    openEdit();
                  }}
                >
                  <Edit3 className="mr-2 h-3.5 w-3.5" />
                  Edit Context
                </Button>
              </div>

              <div className="space-y-3 border-t border-black/10 pt-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-black/30">Generate Tasks from MVP</p>
                <Textarea
                  placeholder="Paste your MVP scope, feature list, or PRD here..."
                  value={mvpScopeInput}
                  onChange={(e) => setMvpScopeInput(e.target.value)}
                  className="rounded-none border-2 border-black/20 bg-white font-mono text-xs focus-visible:ring-0 focus-visible:border-black min-h-[80px] resize-none placeholder:text-black/25"
                />
                <Button
                  onClick={() => void handleGenerateTasksFromMvp()}
                  disabled={!mvpScopeInput.trim() || isGeneratingTasks}
                  variant="outline"
                  className="w-full rounded-none border-2 border-black bg-background font-mono text-xs uppercase tracking-[0.15em] text-black hover:bg-black hover:text-white transition-colors disabled:opacity-40"
                >
                  {isGeneratingTasks ? (
                    <><RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />Generating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-3.5 w-3.5" />Generate Tasks</>
                  )}
                </Button>
                <p className="font-mono text-[9px] text-black/30 leading-relaxed">
                  Replaces existing tasks with AI-generated ones from your scope.
                </p>
              </div>

              <div className="space-y-3 border-t border-black/10 pt-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-black/30">Team Members</p>
                  {userPlan?.plan !== 'pro' && (
                    <span className="border border-black/20 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-black/40">Pro</span>
                  )}
                </div>

                {userPlan?.plan === 'pro' ? (
                  <div className="space-y-3">
                    {/* Current members */}
                    {members.length > 0 ? (
                      <div className="space-y-1">
                        {members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between border border-black/10 px-3 py-2">
                            <div>
                              <p className="font-mono text-[10px] text-black">{member.email ?? member.userId.slice(0, 8) + '…'}</p>
                              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/30">{member.role}</p>
                            </div>
                            {member.role !== 'owner' && (
                              <button
                                onClick={() => void handleRemoveMember(member.id)}
                                className="text-black/25 hover:text-black transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-mono text-[10px] text-black/30">No team members yet.</p>
                    )}

                    {/* Pending invitations */}
                    {pendingInvitations.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/25">Pending</p>
                        {pendingInvitations.map((inv) => (
                          <div key={inv.id} className="flex items-center justify-between border border-dashed border-black/15 px-3 py-2">
                            <p className="font-mono text-[10px] text-black/50">{inv.invitedEmail}</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  void navigator.clipboard.writeText(`${window.location.origin}/invite/${inv.token}`);
                                }}
                                className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/40 hover:text-black transition-colors"
                                title="Copy invite link"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => void handleCancelInvitation(inv.id)}
                                className="text-black/25 hover:text-black transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Invite form */}
                    <div className="space-y-2">
                      <div className="flex items-center border border-black/20 focus-within:border-black transition-colors">
                        <input
                          type="email"
                          placeholder="teammate@example.com"
                          value={inviteEmail}
                          onChange={(e) => { setInviteEmail(e.target.value); setInviteError(null); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') void handleInvite(); }}
                          className="flex-1 border-0 bg-transparent px-3 py-2 font-mono text-xs placeholder:text-black/25 focus:outline-none"
                        />
                        <button
                          onClick={() => void handleInvite()}
                          disabled={isInviting || !inviteEmail.trim()}
                          className="shrink-0 border-l border-black/20 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-black/50 hover:text-black disabled:pointer-events-none transition-colors"
                        >
                          {isInviting ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Invite'}
                        </button>
                      </div>
                      {inviteError && (
                        <p className="font-mono text-[10px] text-red-600">{inviteError}</p>
                      )}
                      {inviteLink && (
                        <div className="border border-black/15 p-3 space-y-1.5">
                          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-black/40">Invite link created</p>
                          <p className="font-mono text-[10px] text-black/60 break-all leading-relaxed">{inviteLink}</p>
                          <button
                            onClick={() => void navigator.clipboard.writeText(inviteLink)}
                            className="font-mono text-[9px] uppercase tracking-[0.15em] text-black hover:underline"
                          >
                            Copy link
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border border-black/10 p-4 space-y-2">
                    <p className="font-mono text-xs text-black/60">
                      Invite teammates to collaborate on this project together.
                    </p>
                    <a
                      href="/pricing"
                      className="inline-block font-mono text-[10px] uppercase tracking-[0.15em] text-black underline hover:no-underline"
                    >
                      Upgrade to Pro →
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t-2 border-black pt-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-black/30">Danger Zone</p>
                <Button
                  variant="outline"
                  className="w-full rounded-none border-2 border-black bg-background font-mono text-xs uppercase tracking-[0.15em] text-black hover:bg-black hover:text-white transition-colors"
                  onClick={handleDeleteProject}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete Project
                </Button>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Delete message confirm */}
      <AlertDialog open={deletingMessageId !== null} onOpenChange={(open) => { if (!open) setDeletingMessageId(null); }}>
        <AlertDialogContent className="rounded-none border-2 border-black bg-paper shadow-[4px_4px_0px_#000]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-mono text-xs uppercase tracking-[0.3em] text-black">
              Delete message?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs text-black/50">
              You can undo this for 5 seconds after confirming.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none border-2 border-black bg-background font-mono text-xs uppercase tracking-[0.15em] text-black hover:bg-black hover:text-white transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-none border-2 border-black bg-black font-mono text-xs uppercase tracking-[0.15em] text-white hover:bg-background hover:text-black transition-colors"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditTechTags([]);
            setEditTechInput('');
          }
        }}
      >
        <DialogContent className="max-w-lg rounded-none border-2 border-black bg-paper shadow-[4px_4px_0px_#000]">
          <DialogHeader>
            <DialogTitle className="font-mono text-xs uppercase tracking-[0.3em] text-black">
              — Edit Project
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/50">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="rounded-none border-2 border-black font-mono text-sm focus-visible:ring-0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-desc" className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/50">
                Description
              </Label>
              <Input
                id="edit-desc"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="rounded-none border-2 border-black font-mono text-sm focus-visible:ring-0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tech" className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/50">
                Tech Stack
              </Label>
              <div
                className="flex min-h-10 w-full cursor-text flex-wrap items-center gap-1.5 border-2 border-black bg-background px-2 py-1.5"
                onClick={() => document.getElementById('edit-tech')?.focus()}
              >
                {editTechTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex shrink-0 select-none items-center gap-1 border border-black/25 px-2 py-0.5 font-mono text-[10px] text-black"
                  >
                    {tag}
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setEditTechTags((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="text-[10px] text-black/40 hover:text-black transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  id="edit-tech"
                  type="text"
                  autoComplete="off"
                  placeholder={editTechTags.length === 0 ? 'e.g. Next.js, Supabase' : ''}
                  value={editTechInput}
                  onChange={(e) => setEditTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' && editTechInput.trim()) {
                      e.preventDefault();
                      setEditTechTags((prev) => [...prev, editTechInput.trim()]);
                      setEditTechInput('');
                    } else if (e.key === 'Backspace' && editTechInput === '' && editTechTags.length > 0) {
                      setEditTechTags((prev) => prev.slice(0, -1));
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (editTechInput.trim()) {
                        setEditTechTags((prev) => [...prev, editTechInput.trim()]);
                        setEditTechInput('');
                      }
                    }
                  }}
                  className="min-w-[120px] flex-1 border-0 bg-transparent py-0.5 font-mono text-xs focus:outline-none focus:ring-0 placeholder:text-black/25"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-goals" className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/50">
                Goals
              </Label>
              <Textarea
                id="edit-goals"
                value={editForm.goals}
                onChange={(e) => setEditForm({ ...editForm, goals: e.target.value })}
                className="rounded-none border-2 border-black font-mono text-sm focus-visible:ring-0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-blockers" className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/50">
                Blockers
              </Label>
              <Textarea
                id="edit-blockers"
                value={editForm.blockers}
                onChange={(e) => setEditForm({ ...editForm, blockers: e.target.value })}
                className="rounded-none border-2 border-black font-mono text-sm focus-visible:ring-0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-target" className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/50">
                Target User
              </Label>
              <Input
                id="edit-target"
                value={editForm.targetUser}
                onChange={(e) => setEditForm({ ...editForm, targetUser: e.target.value })}
                className="rounded-none border-2 border-black font-mono text-sm focus-visible:ring-0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveEdit}
              className="w-full rounded-none border-2 border-black bg-black font-mono text-xs uppercase tracking-[0.2em] text-white hover:bg-background hover:text-black transition-colors"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
