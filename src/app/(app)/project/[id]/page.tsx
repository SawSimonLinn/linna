'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LinnaMark } from '@/components/linna-mark';
import { 
  Send, 
  Paperclip, 
  Settings, 
  ChevronLeft,
  Info,
  Edit3,
  Rocket
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { contextAwareChat } from '@/ai/flows/context-aware-chat-flow';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from 'next/link';
import { format } from 'date-fns';
import type { Message, Project } from '@/lib/projects/types';

export default function ProjectChatPage() {
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProject = async () => {
      const [projectResponse, messagesResponse] = await Promise.all([
        fetch(`/api/projects/${id}`, { cache: 'no-store' }),
        fetch(`/api/projects/${id}/messages`, { cache: 'no-store' }),
      ]);

      if (!projectResponse.ok || !messagesResponse.ok) {
        return;
      }

      const [projectData, messagesData] = await Promise.all([
        projectResponse.json() as Promise<Project>,
        messagesResponse.json() as Promise<Message[]>,
      ]);

      setProject(projectData);
      setMessages(messagesData);
    };

    void loadProject();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !project || isLoading) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const userMessageResponse = await fetch(`/api/projects/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'user',
          content: userText,
        }),
      });

      if (!userMessageResponse.ok) {
        throw new Error('Failed to save the user message.');
      }

      const userMsg = (await userMessageResponse.json()) as Message;
      setMessages((currentMessages) => [...currentMessages, userMsg]);

      const result = await contextAwareChat({
        techStack: project.techStack,
        goals: project.goals,
        blockers: project.blockers,
        userMessage: userText
      });

      const assistantMessageResponse = await fetch(`/api/projects/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'assistant',
          content: result.response,
        }),
      });

      if (!assistantMessageResponse.ok) {
        throw new Error('Failed to save the assistant message.');
      }

      const aiMsg = (await assistantMessageResponse.json()) as Message;
      setMessages(prev => [...prev, aiMsg]);
      setProject((currentProject) =>
        currentProject
          ? {
              ...currentProject,
              lastActive: aiMsg.createdAt,
              messageCount: currentProject.messageCount + 2,
            }
          : currentProject,
      );
    } catch (error) {
      console.error('Chat error:', error);

      const errorResponse = await fetch(`/api/projects/${id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Please try again.",
        }),
      });

      if (errorResponse.ok) {
        const errorMsg = (await errorResponse.json()) as Message;
        setMessages(prev => [...prev, errorMsg]);
        setProject((currentProject) =>
          currentProject
            ? {
                ...currentProject,
                lastActive: errorMsg.createdAt,
                messageCount: currentProject.messageCount + 2,
              }
            : currentProject,
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickChip = (text: string) => {
    setInput(text);
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 max-w-[1600px] mx-auto">
      {/* Left Panel: Context */}
      <aside className="w-80 flex flex-col shrink-0">
        <div className="bg-white rounded-3xl border p-6 flex flex-col gap-6 flex-1 overflow-auto">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Project</p>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-muted-foreground">
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <h1 className="text-2xl font-headline font-bold text-dark mb-4">{project.name}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.techStack.split(',').filter(Boolean).map((tag, i) => (
                <Badge key={i} variant="secondary" className="bg-indigo-light text-primary text-[10px]">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Accordion type="multiple" defaultValue={['goals', 'blockers']}>
              <AccordionItem value="goals" className="border-b-0">
                <AccordionTrigger className="text-xs font-bold py-2 hover:no-underline">CURRENT GOALS</AccordionTrigger>
                <AccordionContent className="text-xs text-body leading-relaxed">
                  {project.goals}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="blockers" className="border-b-0">
                <AccordionTrigger className="text-xs font-bold py-2 hover:no-underline">KNOWN BLOCKERS</AccordionTrigger>
                <AccordionContent className="text-xs text-body leading-relaxed">
                  {project.blockers}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="mt-auto pt-6 border-t border-border/50">
            <div className="flex items-center gap-3 text-muted-foreground mb-6">
              <div className="bg-surface rounded-lg p-2">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider">Activity</p>
                <p className="text-xs font-medium">{project.messageCount} messages across {Math.ceil(project.messageCount/10)} sessions</p>
              </div>
            </div>
            
            <Button asChild className="w-full rounded-2xl h-12 flex items-center justify-between px-6 linna-gradient shadow-lg">
              <Link href={`/project/${id}/launch`}>
                <span className="font-bold">Launch Assistant</span>
                <Rocket className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Right Panel: Chat */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border overflow-hidden relative shadow-sm">
        {/* Chat Top Bar */}
        <header className="h-14 border-b px-6 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
             <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
               <ChevronLeft className="w-5 h-5" />
             </Link>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
               <span className="text-sm font-bold">Linna is thinking</span>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" className="rounded-full text-xs font-bold px-4 h-8 bg-surface">
               Session History
             </Button>
             <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
               <Settings className="w-4 h-4" />
             </Button>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-20">
              <div className="w-16 h-16 rounded-3xl bg-indigo-light flex items-center justify-center mb-6">
                <LinnaMark className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-headline font-bold mb-3">Hey, I'm Linna. I know your project.</h2>
              <p className="text-body text-sm mb-10">Ask me anything — architecture decisions, what to build next, or how to fix a bug. I have full context of your goals and stack.</p>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                {[
                  "Where should I start today?",
                  "Review my tech stack",
                  "Help me plan this week"
                ].map((chip) => (
                  <button 
                    key={chip}
                    onClick={() => handleQuickChip(chip)}
                    className="bg-surface hover:bg-indigo-light hover:text-primary border border-border px-5 py-2.5 rounded-2xl text-sm font-medium transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-20">
              {messages.map((m) => (
                <div key={m.id} className="flex flex-col gap-2">
                  <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                  <div className={`text-[10px] text-muted-foreground ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {format(new Date(m.createdAt), 'h:mm a')}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-bubble-ai flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Bar */}
        <div className="p-6 pt-0 shrink-0">
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white border-2 border-border focus-within:border-primary/50 transition-colors rounded-3xl shadow-lg flex items-end p-2 pr-4">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-surface rounded-full">
                <Paperclip className="w-5 h-5" />
              </Button>
              <textarea 
                rows={1}
                placeholder="Ask Linna anything about your project..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 bg-transparent border-0 focus:ring-0 text-sm py-3 px-2 resize-none max-h-40"
              />
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="rounded-full w-10 h-10 p-0 shadow-md transition-transform active:scale-95"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-[10px] text-center mt-3 text-muted-foreground font-medium uppercase tracking-widest">
              Cmd + Enter to send
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
