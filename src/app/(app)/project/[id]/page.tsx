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
  ChevronLeft,
  Edit3,
  History,
  MessageSquareText,
  Send,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { contextAwareChat } from '@/ai/flows/context-aware-chat-flow';
import type { Message, NewProjectInput, Project } from '@/lib/projects/types';
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

  useEffect(() => {
    const loadProject = async () => {
      setIsLoadingMessages(true);
      setLoadError(null);
      try {
        const [projectResponse, messagesResponse] = await Promise.all([
          fetch(`/api/projects/${id}`, { cache: 'no-store' }),
          fetch(`/api/projects/${id}/messages`, { cache: 'no-store' }),
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

        const [projectData, messagesData] = await Promise.all([
          projectResponse.json() as Promise<Project>,
          messagesResponse.json() as Promise<Message[]>,
        ]);

        setProject(projectData);
        setMessages(messagesData);
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
    const combined = overrideText ?? input.trim();
    if (!combined || !project || isLoading) return;

    const userText = combined;
    setInput('');
    setIsLoading(true);

    try {
      const userMessageResponse = await fetch(`/api/projects/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content: userText }),
      });

      if (!userMessageResponse.ok) throw new Error('Failed to save the user message.');

      const userMsg = (await userMessageResponse.json()) as Message;
      setMessages((prev) => [...prev, userMsg]);

      const result = await contextAwareChat({
        projectName: project.name,
        projectDescription: project.description,
        techStack: project.techStack,
        goals: project.goals,
        blockers: project.blockers,
        targetUser: project.targetUser,
        chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        userMessage: userText,
      });

      const assistantMessageResponse = await fetch(`/api/projects/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'assistant', content: result.response }),
      });

      if (!assistantMessageResponse.ok) throw new Error('Failed to save the assistant message.');

      const aiMsg = (await assistantMessageResponse.json()) as Message;
      setMessages((prev) => [...prev, aiMsg]);
      setProject((curr) =>
        curr ? { ...curr, lastActive: aiMsg.createdAt, messageCount: curr.messageCount + 2 } : curr,
      );
    } catch (error) {
      console.error('Chat error:', error);

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
    }
  };

  const handleQuickChip = (text: string) => {
    void handleSend(text);
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
      <div className="min-h-svh bg-paper">
        <div className="mx-auto grid w-full max-w-[1600px] xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="flex min-h-svh flex-col border-r-2 border-black">
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
                  <Skeleton className="h-9 w-24 rounded-none" />
                  <Skeleton className="h-9 w-24 rounded-none" />
                </div>
              </div>
            </header>

            {/* Message skeletons */}
            <div className="flex-1 px-6 py-8">
              <div className="mx-auto w-full max-w-3xl space-y-8">
                {/* AI message */}
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
                {/* User message */}
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
                {/* AI message */}
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
            <div className="border-b-2 border-black px-5 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16 rounded-none" />
                <Skeleton className="h-7 w-7 rounded-none" />
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
          </aside>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-svh bg-paper">
        <div className="mx-auto grid w-full max-w-[1600px] xl:grid-cols-[minmax(0,1fr)_300px]">

          {/* Chat column */}
          <section className="flex min-h-svh flex-col border-r-2 border-black">
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
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsSessionHistoryOpen(true)}
                    className="h-9 rounded-none border-2 border-black bg-background font-mono text-xs uppercase tracking-[0.15em] text-black hover:bg-black hover:text-white transition-colors"
                  >
                    <History className="mr-2 h-3.5 w-3.5" />
                    History
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsSettingsOpen(true)}
                    className="h-9 rounded-none border-2 border-black bg-background font-mono text-xs uppercase tracking-[0.15em] text-black hover:bg-black hover:text-white transition-colors"
                  >
                    <Settings className="mr-2 h-3.5 w-3.5" />
                    Settings
                  </Button>
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
                            ) : (
                              <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                            )}
                          </div>

                          <div className="font-mono text-[10px] text-black/25">
                            {format(new Date(message.createdAt), 'h:mm a')}
                          </div>
                        </div>
                      </article>
                    ))}

                    {isLoading ? (
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

            {/* Input bar */}
            <div className="border-t-2 border-black bg-paper px-6 py-4">
              <div className="mx-auto w-full max-w-3xl">
                <div className="flex items-end gap-0 border-2 border-black bg-background">
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
              </div>
            </div>
          </section>

          {/* Context sidebar */}
          <aside className="hidden border-l-2 border-black xl:flex xl:min-h-svh xl:flex-col">
            <div className="border-b-2 border-black px-5 py-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-black/35">Context</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none text-black/35 hover:bg-black hover:text-white transition-colors"
                  onClick={openEdit}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
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
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* History sheet */}
      <Sheet open={isSessionHistoryOpen} onOpenChange={setIsSessionHistoryOpen}>
        <SheetContent side="right" className="flex w-96 flex-col rounded-none border-l-2 border-black bg-paper shadow-none">
          <SheetHeader className="shrink-0 border-b-2 border-black pb-4">
            <SheetTitle className="font-mono text-xs uppercase tracking-[0.3em] text-black">
              Session History
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="mt-4 flex-1 -mx-6 px-6">
            {sessionGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <History className="mb-3 h-6 w-6 text-black/20" />
                <p className="font-mono text-xs text-black/30">No messages yet.</p>
              </div>
            ) : (
              <div className="space-y-6 pb-6">
                {[...sessionGroups].reverse().map((group) => (
                  <div key={group.date}>
                    <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.4em] text-black/30">
                      {group.date}
                    </p>
                    <div className="space-y-2">
                      {group.msgs.map((message) => (
                        <div
                          key={message.id}
                          className={`border px-3 py-2 text-xs leading-relaxed ${
                            message.role === 'user'
                              ? 'ml-4 border-black bg-black text-white'
                              : 'mr-4 border-black/20 bg-background text-black'
                          }`}
                        >
                          <span className="mb-0.5 block font-mono text-[9px] uppercase tracking-[0.3em] opacity-50">
                            {message.role === 'user' ? 'You' : 'Linna'}
                          </span>
                          <p className="line-clamp-3 font-mono text-[11px]">{message.content}</p>
                          <span className="mt-1 block font-mono text-[9px] opacity-40">
                            {format(new Date(message.createdAt), 'h:mm a')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
