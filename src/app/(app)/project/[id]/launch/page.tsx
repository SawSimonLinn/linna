'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LinnaMark } from '@/components/linna-mark';
import {
  Copy,
  RefreshCw,
  Check,
  Edit2,
  Share2,
  ExternalLink,
  MessageSquare,
  Rocket,
  XIcon,
  Layout,
  Globe,
  BriefcaseBusiness,
  Camera,
  FileText,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GenerateLaunchContentOutput } from '@/ai/flows/generate-launch-content';
import { generateProjectLaunchContent } from '@/app/actions/launch';
import { updateProjectReadme } from '@/app/actions/readme';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { Project } from '@/lib/projects/types';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

type PlanInfo = { plan: 'free' | 'pro' };
type EditableContent = GenerateLaunchContentOutput;

const LOADING_STEPS = [
  'Reading your project context...',
  'Writing your Product Hunt post...',
  'Crafting your Reddit launch...',
  'Building your X thread...',
  'Writing your LinkedIn post...',
  'Designing your Instagram content...',
  'Drafting landing page copy...',
  'Finding the best communities...',
  'Polishing your launch strategy...',
];

export default function LaunchAssistantPage() {
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<Project | null>(null);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [content, setContent] = useState<GenerateLaunchContentOutput | null>(null);
  const [editableContent, setEditableContent] = useState<EditableContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [stepVisible, setStepVisible] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [readme, setReadme] = useState<string>('');
  const [editableReadme, setEditableReadme] = useState<string>('');
  const [isEditingReadme, setIsEditingReadme] = useState(false);
  const [isUpdatingReadme, setIsUpdatingReadme] = useState(false);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      const [response, planResponse] = await Promise.all([
        fetch(`/api/projects/${id}`, { cache: 'no-store' }),
        fetch('/api/user/plan', { cache: 'no-store' }),
      ]);

      if (!response.ok) {
        setLoadError(true);
        return;
      }

      const projectData = (await response.json()) as Project;
      setProject(projectData);

      if (projectData.readme) {
        setReadme(projectData.readme);
        setEditableReadme(projectData.readme);
      }

      // Load persisted launch content if it exists
      if (projectData.launchContent) {
        setContent(projectData.launchContent);
      }

      if (planResponse.ok) {
        const planData = (await planResponse.json()) as PlanInfo;
        setPlanInfo(planData);
      } else {
        setPlanInfo({ plan: 'free' });
      }
    };

    void loadProject();
  }, [id]);

  // Rotate loading step text while generating
  useEffect(() => {
    if (isGenerating) {
      setLoadingStep(0);
      setStepVisible(true);
      stepIntervalRef.current = setInterval(() => {
        setStepVisible(false);
        setTimeout(() => {
          setLoadingStep(prev => (prev + 1) % LOADING_STEPS.length);
          setStepVisible(true);
        }, 300);
      }, 2200);
    } else {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    }
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [isGenerating]);

  // Sync editable content whenever generated content changes
  useEffect(() => {
    if (content) {
      setEditableContent(JSON.parse(JSON.stringify(content)) as EditableContent);
      setEditingTab(null);
    }
  }, [content]);

  const handleGenerate = async () => {
    if (!project || isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generateProjectLaunchContent(project.id);
      if ('error' in result) {
        if (result.code === 'PLAN_REQUIRED') {
          toast({
            title: "Launch Assistant is Pro-only",
            description: "Upgrade to Pro to generate launch materials.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(result.error);
      }
      setContent(result.content);
      toast({
        title: "Launch content generated!",
        description: "Your custom launch materials are ready to review.",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateReadme = async () => {
    if (!project || isUpdatingReadme) return;
    setIsUpdatingReadme(true);
    try {
      const result = await updateProjectReadme(project.id);
      if ('error' in result) {
        if (result.code === 'PLAN_REQUIRED') {
          toast({ title: 'README update is Pro-only', description: 'Upgrade to Pro to update README from chat.', variant: 'destructive' });
          return;
        }
        throw new Error(result.error);
      }
      setReadme(result.readme);
      setEditableReadme(result.readme);
      toast({ title: 'README updated!', description: 'Your README has been updated based on your chat history.' });
    } catch {
      toast({ title: 'Update failed', description: 'Could not update README. Please try again.', variant: 'destructive' });
    } finally {
      setIsUpdatingReadme(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleEdit = (tab: string) => {
    setEditingTab(prev => (prev === tab ? null : tab));
  };

  const updateField = <
    S extends keyof EditableContent,
    F extends keyof EditableContent[S]
  >(
    section: S,
    field: F,
    value: string
  ) => {
    setEditableContent(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
  };

  const updateArrayField = <S extends keyof EditableContent>(
    section: S,
    field: keyof EditableContent[S],
    index: number,
    value: string
  ) => {
    setEditableContent(prev => {
      if (!prev) return prev;
      const arr = [...(prev[section][field] as string[])];
      arr[index] = value;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: arr,
        },
      };
    });
  };

  if (loadError) return (
    <div className="h-full overflow-y-auto bg-paper px-6 py-10 md:px-10">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-lg font-bold mb-2">Project not found</p>
        <p className="text-muted-foreground text-sm mb-6">This project may have been deleted or you don&apos;t have access.</p>
        <Link href="/dashboard" className="text-sm font-medium underline underline-offset-4">Back to dashboard</Link>
      </div>
    </div>
  );

  if (!project || !planInfo) return (
    <div className="flex h-full items-center justify-center overflow-y-auto bg-paper px-6 py-10 md:px-10">
      <div className="space-y-3 w-full max-w-2xl">
        <div className="h-8 bg-muted rounded-xl animate-pulse w-1/2" />
        <div className="h-4 bg-muted rounded-xl animate-pulse w-3/4" />
        <div className="h-32 bg-muted rounded-2xl animate-pulse mt-6" />
      </div>
    </div>
  );

  const isPro = planInfo?.plan === 'pro';
  const ec = editableContent;

  return (
    <div className="h-full overflow-y-auto bg-paper px-6 py-10 md:px-10">
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-headline font-bold text-dark mb-2 tracking-tight">Ready to ship? Let&apos;s launch this.</h1>
            <p className="text-body text-lg">Linna knows your project. Now it&apos;ll help the world know it too.</p>
          </div>
          {isPro ? (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="lg"
              className="rounded-none border-2 border-foreground bg-foreground px-8 font-mono text-xs uppercase tracking-[0.15em] text-background paper-btn-dark h-14"
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <LinnaMark className="w-5 h-5 mr-2" />
              )}
              {content ? 'Regenerate Content' : 'Generate with Linna'}
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="rounded-none border-2 border-foreground bg-foreground px-8 font-mono text-xs uppercase tracking-[0.15em] text-background paper-btn-dark h-14"
            >
              <Link href="/pricing">
                Upgrade for Launch
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </header>

      {/* Project Summary Bar */}
      <div className="bg-white rounded-2xl border p-6 mb-10 flex flex-wrap gap-8">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Project Name</p>
          <p className="text-sm font-bold">{project.name}</p>
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Description</p>
          <p className="text-sm line-clamp-1">{project.description}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Target User</p>
          <p className="text-sm">{project.targetUser}</p>
        </div>
      </div>

      {!isPro ? (
        <div className="border-2 border-foreground bg-yellow-50 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 border-2 border-foreground bg-yellow-300 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
                Pro
              </div>
              <h2 className="font-headline text-3xl font-black tracking-tight text-foreground">
                Launch Assistant is a Pro feature.
              </h2>
              <p className="mt-3 font-mono text-xs leading-6 text-foreground/60">
                Upgrade to generate Product Hunt copy, Reddit launch posts, X threads, LinkedIn posts, Instagram content, landing page copy, and community suggestions — saved to your project automatically.
              </p>
            </div>
            <Button
              asChild
              className="h-11 shrink-0 rounded-none border-2 border-foreground bg-foreground px-5 font-mono text-xs uppercase tracking-[0.15em] text-background hover:bg-background hover:text-foreground"
            >
              <Link href="/pricing">
                View Pro
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      ) : !content && !isGenerating ? (
        <div className="bg-white rounded-[2rem] border border-dashed border-border py-24 flex flex-col items-center justify-center text-center px-4">
           <div className="w-20 h-20 rounded-[2rem] bg-indigo-light flex items-center justify-center mb-8">
             <Rocket className="w-10 h-10 text-primary" />
           </div>
           <h2 className="text-2xl font-bold mb-3">Your launch strategy starts here.</h2>
           <p className="text-body max-w-sm mb-10">Click the button above to generate tailored content for Product Hunt, Reddit, X, and more.</p>
        </div>
      ) : isGenerating ? (
        <div className="bg-white rounded-[2rem] border py-24 flex flex-col items-center justify-center text-center px-6 min-h-[420px]">
          {/* Animated Linna orb */}
          <div className="relative w-24 h-24 mb-10">
            <div className="absolute inset-0 rounded-full bg-indigo-light animate-ping opacity-30" />
            <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-indigo-light flex items-center justify-center">
              <LinnaMark className="w-10 h-10 text-primary" />
            </div>
          </div>
          {/* Rotating step text */}
          <div className="h-8 flex items-center justify-center mb-4">
            <p
              className="text-lg font-bold text-foreground transition-all duration-300"
              style={{ opacity: stepVisible ? 1 : 0, transform: stepVisible ? 'translateY(0)' : 'translateY(6px)' }}
            >
              {LOADING_STEPS[loadingStep]}
            </p>
          </div>
          <p className="text-sm text-muted-foreground mb-10">This usually takes 15–30 seconds</p>
          {/* Progress dots */}
          <div className="flex gap-2">
            {LOADING_STEPS.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{ background: i === loadingStep ? 'var(--primary)' : 'var(--muted)', transform: i === loadingStep ? 'scale(1.4)' : 'scale(1)' }}
              />
            ))}
          </div>
        </div>
      ) : ec && (
        <Tabs defaultValue="producthunt" className="w-full">
          <TabsList className="bg-white border p-1 h-14 rounded-full mb-8 w-full justify-start overflow-x-auto">
            <TabsTrigger value="producthunt" className="rounded-full h-full px-6 data-[state=active]:bg-indigo-light data-[state=active]:text-primary font-bold gap-2">
              <Globe className="w-4 h-4" /> Product Hunt
            </TabsTrigger>
            <TabsTrigger value="reddit" className="rounded-full h-full px-6 data-[state=active]:bg-indigo-light data-[state=active]:text-primary font-bold gap-2">
              <MessageSquare className="w-4 h-4" /> Reddit Post
            </TabsTrigger>
            <TabsTrigger value="twitter" className="rounded-full h-full px-6 data-[state=active]:bg-indigo-light data-[state=active]:text-primary font-bold gap-2">
              <XIcon className="w-4 h-4" /> X Thread
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="rounded-full h-full px-6 data-[state=active]:bg-indigo-light data-[state=active]:text-primary font-bold gap-2">
              <BriefcaseBusiness className="w-4 h-4" /> LinkedIn
            </TabsTrigger>
            <TabsTrigger value="instagram" className="rounded-full h-full px-6 data-[state=active]:bg-indigo-light data-[state=active]:text-primary font-bold gap-2">
              <Camera className="w-4 h-4" /> Instagram
            </TabsTrigger>
            <TabsTrigger value="landing" className="rounded-full h-full px-6 data-[state=active]:bg-indigo-light data-[state=active]:text-primary font-bold gap-2">
              <Layout className="w-4 h-4" /> Landing Page
            </TabsTrigger>
            <TabsTrigger value="communities" className="rounded-full h-full px-6 data-[state=active]:bg-indigo-light data-[state=active]:text-primary font-bold gap-2">
              <Share2 className="w-4 h-4" /> Where to Post
            </TabsTrigger>
            <TabsTrigger value="readme" className="rounded-full h-full px-6 data-[state=active]:bg-indigo-light data-[state=active]:text-primary font-bold gap-2">
              <FileText className="w-4 h-4" /> README
            </TabsTrigger>
          </TabsList>

          <div className="bg-white rounded-[2rem] border shadow-sm p-8 min-h-[500px]">

            {/* ── Product Hunt ── */}
            <TabsContent value="producthunt" className="mt-0 outline-none">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Product Hunt Post</h3>
                <div className="flex gap-3">
                   <Button variant="outline" size="sm" className="rounded-full" onClick={() => toggleEdit('producthunt')}>
                     <Edit2 className="w-4 h-4 mr-2" /> {editingTab === 'producthunt' ? 'Done' : 'Edit'}
                   </Button>
                   <Button size="sm" className="rounded-full" onClick={() => handleCopy(
                     `${ec.productHunt.tagline}\n\n${ec.productHunt.description}\n\n${ec.productHunt.makerComment}`,
                     'ph'
                   )}>
                     {copied === 'ph' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                     {copied === 'ph' ? 'Copied!' : 'Copy Post'}
                   </Button>
                </div>
              </div>
              <div className="space-y-8">
                 <section>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Tagline</p>
                    {editingTab === 'producthunt' ? (
                      <input
                        className="w-full p-4 bg-surface rounded-xl font-headline font-bold text-xl border-2 border-primary focus:outline-none"
                        value={ec.productHunt.tagline}
                        onChange={e => updateField('productHunt', 'tagline', e.target.value)}
                      />
                    ) : (
                      <div className="p-4 bg-surface rounded-xl font-headline font-bold text-xl">{ec.productHunt.tagline}</div>
                    )}
                 </section>
                 <section>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Description</p>
                    {editingTab === 'producthunt' ? (
                      <textarea
                        rows={6}
                        className="w-full p-6 border-2 border-primary rounded-xl text-sm leading-relaxed focus:outline-none resize-none"
                        value={ec.productHunt.description}
                        onChange={e => updateField('productHunt', 'description', e.target.value)}
                      />
                    ) : (
                      <div className="p-6 border rounded-xl whitespace-pre-wrap text-sm leading-relaxed">{ec.productHunt.description}</div>
                    )}
                 </section>
                 <section>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Maker Comment</p>
                    {editingTab === 'producthunt' ? (
                      <textarea
                        rows={4}
                        className="w-full p-6 border-2 border-primary bg-indigo-light/30 rounded-xl text-sm leading-relaxed italic focus:outline-none resize-none"
                        value={ec.productHunt.makerComment}
                        onChange={e => updateField('productHunt', 'makerComment', e.target.value)}
                      />
                    ) : (
                      <div className="p-6 border bg-indigo-light/30 rounded-xl whitespace-pre-wrap text-sm leading-relaxed italic">&quot;{ec.productHunt.makerComment}&quot;</div>
                    )}
                 </section>
              </div>
            </TabsContent>

            {/* ── Reddit ── */}
            <TabsContent value="reddit" className="mt-0 outline-none">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Reddit Post</h3>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => toggleEdit('reddit')}>
                    <Edit2 className="w-4 h-4 mr-2" /> {editingTab === 'reddit' ? 'Done' : 'Edit'}
                  </Button>
                  <Button size="sm" className="rounded-full" onClick={() => handleCopy(
                    `${ec.redditPost.title}\n\n${ec.redditPost.body}`,
                    'reddit'
                  )}>
                    {copied === 'reddit' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied === 'reddit' ? 'Copied!' : 'Copy Post'}
                  </Button>
                </div>
              </div>
              <div className="space-y-6">
                {editingTab === 'reddit' ? (
                  <input
                    className="w-full p-4 bg-surface rounded-xl font-bold text-lg border-l-4 border-orange-500 border-2 border-primary focus:outline-none"
                    value={ec.redditPost.title}
                    onChange={e => updateField('redditPost', 'title', e.target.value)}
                  />
                ) : (
                  <div className="p-4 bg-surface rounded-xl font-bold text-lg border-l-4 border-orange-500">{ec.redditPost.title}</div>
                )}
                {editingTab === 'reddit' ? (
                  <textarea
                    rows={12}
                    className="w-full p-8 border-2 border-primary rounded-2xl text-sm leading-relaxed font-body focus:outline-none resize-none"
                    value={ec.redditPost.body}
                    onChange={e => updateField('redditPost', 'body', e.target.value)}
                  />
                ) : (
                  <div className="p-8 border rounded-2xl whitespace-pre-wrap text-sm leading-relaxed font-body">{ec.redditPost.body}</div>
                )}
              </div>
            </TabsContent>

            {/* ── X Thread ── */}
            <TabsContent value="twitter" className="mt-0 outline-none">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Twitter / X Thread</h3>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => toggleEdit('twitter')}>
                    <Edit2 className="w-4 h-4 mr-2" /> {editingTab === 'twitter' ? 'Done' : 'Edit'}
                  </Button>
                  <Button size="sm" className="rounded-full" onClick={() => handleCopy(
                    [ec.twitterXThread.tweet1, ec.twitterXThread.tweet2, ec.twitterXThread.tweet3, ec.twitterXThread.tweet4, ec.twitterXThread.tweet5].join('\n\n'),
                    'twitter'
                  )}>
                     {copied === 'twitter' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                     {copied === 'twitter' ? 'Copied!' : 'Copy Thread'}
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {(['tweet1', 'tweet2', 'tweet3', 'tweet4', 'tweet5'] as const).map((key, i) => (
                  <div key={i} className="flex gap-4 p-6 bg-surface rounded-2xl relative border">
                    <div className="w-10 h-10 rounded-full bg-indigo-light flex items-center justify-center shrink-0">
                       <XIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">Linna Assistant</span>
                        <span className="text-xs text-muted-foreground">@{project.name.toLowerCase().replace(/\s/g, '')} · {i + 1}/5</span>
                      </div>
                      {editingTab === 'twitter' ? (
                        <textarea
                          rows={3}
                          className="w-full text-sm leading-relaxed border-2 border-primary rounded-xl p-2 focus:outline-none resize-none bg-white"
                          value={ec.twitterXThread[key]}
                          onChange={e => updateField('twitterXThread', key, e.target.value)}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{ec.twitterXThread[key]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ── LinkedIn ── */}
            <TabsContent value="linkedin" className="mt-0 outline-none">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">LinkedIn Post</h3>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => toggleEdit('linkedin')}>
                    <Edit2 className="w-4 h-4 mr-2" /> {editingTab === 'linkedin' ? 'Done' : 'Edit'}
                  </Button>
                  <Button size="sm" className="rounded-full" onClick={() => handleCopy(
                    `${ec.linkedInPost.headline}\n\n${ec.linkedInPost.body}\n\n${ec.linkedInPost.hashtags.map(h => `#${h}`).join(' ')}`,
                    'linkedin'
                  )}>
                    {copied === 'linkedin' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied === 'linkedin' ? 'Copied!' : 'Copy Post'}
                  </Button>
                </div>
              </div>
              <div className="space-y-6">
                <section>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Headline</p>
                  {editingTab === 'linkedin' ? (
                    <input
                      className="w-full p-4 bg-surface rounded-xl font-bold text-lg border-2 border-primary focus:outline-none"
                      value={ec.linkedInPost.headline}
                      onChange={e => updateField('linkedInPost', 'headline', e.target.value)}
                    />
                  ) : (
                    <div className="p-4 bg-surface rounded-xl font-bold text-lg">{ec.linkedInPost.headline}</div>
                  )}
                </section>
                <section>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Body</p>
                  {editingTab === 'linkedin' ? (
                    <textarea
                      rows={10}
                      className="w-full p-6 border-2 border-primary rounded-xl text-sm leading-relaxed focus:outline-none resize-none"
                      value={ec.linkedInPost.body}
                      onChange={e => updateField('linkedInPost', 'body', e.target.value)}
                    />
                  ) : (
                    <div className="p-6 border rounded-xl whitespace-pre-wrap text-sm leading-relaxed">{ec.linkedInPost.body}</div>
                  )}
                </section>
                <section>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Hashtags</p>
                  <div className="flex flex-wrap gap-2">
                    {ec.linkedInPost.hashtags.map((tag, i) => (
                      editingTab === 'linkedin' ? (
                        <input
                          key={i}
                          className="px-3 py-1 bg-indigo-light text-primary text-sm font-medium rounded-full border-2 border-primary focus:outline-none w-32"
                          value={tag}
                          onChange={e => updateArrayField('linkedInPost', 'hashtags', i, e.target.value)}
                        />
                      ) : (
                        <span key={i} className="px-3 py-1 bg-indigo-light text-primary text-sm font-medium rounded-full">#{tag}</span>
                      )
                    ))}
                  </div>
                </section>
              </div>
            </TabsContent>

            {/* ── Instagram ── */}
            <TabsContent value="instagram" className="mt-0 outline-none">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Instagram Post</h3>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => toggleEdit('instagram')}>
                    <Edit2 className="w-4 h-4 mr-2" /> {editingTab === 'instagram' ? 'Done' : 'Edit'}
                  </Button>
                  <Button size="sm" className="rounded-full" onClick={() => handleCopy(
                    `${ec.instagramPost.caption}\n\n${ec.instagramPost.hashtags.map(h => `#${h}`).join(' ')}`,
                    'instagram'
                  )}>
                    {copied === 'instagram' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied === 'instagram' ? 'Copied!' : 'Copy Caption'}
                  </Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <section>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Caption</p>
                    {editingTab === 'instagram' ? (
                      <textarea
                        rows={10}
                        className="w-full p-6 border-2 border-primary rounded-xl text-sm leading-relaxed focus:outline-none resize-none"
                        value={ec.instagramPost.caption}
                        onChange={e => updateField('instagramPost', 'caption', e.target.value)}
                      />
                    ) : (
                      <div className="p-6 border rounded-xl whitespace-pre-wrap text-sm leading-relaxed">{ec.instagramPost.caption}</div>
                    )}
                  </section>
                  <section>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Hashtags</p>
                    <div className="flex flex-wrap gap-2">
                      {ec.instagramPost.hashtags.map((tag, i) => (
                        editingTab === 'instagram' ? (
                          <input
                            key={i}
                            className="px-3 py-1 bg-pink-50 text-pink-600 text-sm font-medium rounded-full border-2 border-pink-400 focus:outline-none w-32"
                            value={tag}
                            onChange={e => updateArrayField('instagramPost', 'hashtags', i, e.target.value)}
                          />
                        ) : (
                          <span key={i} className="px-3 py-1 bg-pink-50 text-pink-600 text-sm font-medium rounded-full">#{tag}</span>
                        )
                      ))}
                    </div>
                  </section>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Story Ideas</p>
                  <div className="space-y-4">
                    {ec.instagramPost.storyIdeas.map((idea, i) => (
                      <div key={i} className="flex gap-4 p-5 bg-surface border rounded-2xl">
                        <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center shrink-0 text-pink-600 font-bold text-sm">{i + 1}</div>
                        {editingTab === 'instagram' ? (
                          <textarea
                            rows={2}
                            className="flex-1 text-sm leading-relaxed border-2 border-primary rounded-xl p-2 focus:outline-none resize-none"
                            value={idea}
                            onChange={e => updateArrayField('instagramPost', 'storyIdeas', i, e.target.value)}
                          />
                        ) : (
                          <p className="text-sm leading-relaxed">{idea}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Landing Page ── */}
            <TabsContent value="landing" className="mt-0 outline-none">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Landing Page Copy</h3>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => toggleEdit('landing')}>
                    <Edit2 className="w-4 h-4 mr-2" /> {editingTab === 'landing' ? 'Done' : 'Edit'}
                  </Button>
                  <Button size="sm" className="rounded-full" onClick={() => handleCopy(JSON.stringify(ec.landingCopy, null, 2), 'landing')}>
                    {copied === 'landing' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied === 'landing' ? 'Copied!' : 'Copy JSON'}
                  </Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-8">
                   <div className="p-8 bg-indigo-light rounded-3xl border border-primary/10">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Hero Section</p>
                      {editingTab === 'landing' ? (
                        <>
                          <input
                            className="w-full text-3xl font-headline font-bold mb-4 bg-white/60 border-2 border-primary rounded-xl p-2 focus:outline-none"
                            value={ec.landingCopy.heroHeadline}
                            onChange={e => updateField('landingCopy', 'heroHeadline', e.target.value)}
                          />
                          <textarea
                            rows={3}
                            className="w-full text-body text-sm leading-relaxed bg-white/60 border-2 border-primary rounded-xl p-2 focus:outline-none resize-none"
                            value={ec.landingCopy.heroSubHeadline}
                            onChange={e => updateField('landingCopy', 'heroSubHeadline', e.target.value)}
                          />
                        </>
                      ) : (
                        <>
                          <h4 className="text-3xl font-headline font-bold mb-4">{ec.landingCopy.heroHeadline}</h4>
                          <p className="text-body text-sm leading-relaxed">{ec.landingCopy.heroSubHeadline}</p>
                        </>
                      )}
                   </div>
                   <div className="p-6 bg-surface rounded-2xl border">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">CTA Button Text</p>
                      {editingTab === 'landing' ? (
                        <input
                          className="w-full text-center font-medium border-2 border-primary rounded-xl p-3 focus:outline-none"
                          value={ec.landingCopy.pricingCta}
                          onChange={e => updateField('landingCopy', 'pricingCta', e.target.value)}
                        />
                      ) : (
                        <Button className="w-full rounded-xl">{ec.landingCopy.pricingCta}</Button>
                      )}
                   </div>
                </div>
                <div className="space-y-6">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Key Features</p>
                   {(['feature1', 'feature2', 'feature3'] as const).map((key, i) => (
                      <div key={i} className="flex gap-4 p-5 bg-white border rounded-2xl shadow-sm">
                         <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                           <Check className="w-5 h-5 text-green-600" />
                         </div>
                         {editingTab === 'landing' ? (
                           <textarea
                             rows={2}
                             className="flex-1 text-sm font-medium leading-relaxed border-2 border-primary rounded-xl p-2 focus:outline-none resize-none"
                             value={ec.landingCopy[key]}
                             onChange={e => updateField('landingCopy', key, e.target.value)}
                           />
                         ) : (
                           <p className="text-sm font-medium leading-relaxed">{ec.landingCopy[key]}</p>
                         )}
                      </div>
                   ))}
                </div>
              </div>
            </TabsContent>

            {/* ── Where to Post ── */}
            <TabsContent value="communities" className="mt-0 outline-none">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Where to Post</h3>
                <p className="text-sm text-muted-foreground">Relevant communities identified by Linna</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-orange-500" />
                    <h4 className="font-bold">Subreddits</h4>
                  </div>
                  {ec.communities.subreddits.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-xl text-sm font-medium">
                      <span>r/{s}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-indigo-500" />
                    <h4 className="font-bold">Discord Servers</h4>
                  </div>
                  {ec.communities.discordServers.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-xl text-sm font-medium">
                      <span>{s}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="w-5 h-5 text-green-500" />
                    <h4 className="font-bold">Slack Groups</h4>
                  </div>
                  {ec.communities.slackGroups.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-xl text-sm font-medium">
                      <span>{s}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ── README ── */}
            <TabsContent value="readme" className="mt-0 outline-none">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <h3 className="text-2xl font-bold">README</h3>
                <div className="flex gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      if (isEditingReadme) {
                        setReadme(editableReadme);
                      }
                      setIsEditingReadme(prev => !prev);
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {isEditingReadme ? 'Preview' : 'Edit'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={isUpdatingReadme}
                    onClick={handleUpdateReadme}
                  >
                    {isUpdatingReadme ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <LinnaMark className="w-4 h-4 mr-2" />
                    )}
                    {isUpdatingReadme ? 'Updating...' : 'Update from Chat'}
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleCopy(readme, 'readme')}
                  >
                    {copied === 'readme' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied === 'readme' ? 'Copied!' : 'Copy Markdown'}
                  </Button>
                </div>
              </div>

              {!readme && !isEditingReadme ? (
                <div className="border border-dashed rounded-2xl py-20 flex flex-col items-center justify-center text-center px-4">
                  <FileText className="w-10 h-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-bold mb-2">No README yet</p>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm">Click &quot;Update from Chat&quot; to generate a README based on your project chat history, or switch to Edit to write one manually.</p>
                  <Button variant="outline" className="rounded-full" onClick={handleUpdateReadme} disabled={isUpdatingReadme}>
                    {isUpdatingReadme ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <LinnaMark className="w-4 h-4 mr-2" />}
                    {isUpdatingReadme ? 'Generating...' : 'Generate README from Chat'}
                  </Button>
                </div>
              ) : isEditingReadme ? (
                <textarea
                  rows={30}
                  className="w-full p-6 border-2 border-primary rounded-2xl text-sm font-mono leading-relaxed focus:outline-none resize-y bg-white"
                  value={editableReadme}
                  onChange={e => setEditableReadme(e.target.value)}
                />
              ) : (
                <div className="prose prose-sm max-w-none p-8 bg-white border rounded-2xl">
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{readme}</ReactMarkdown>
                </div>
              )}
            </TabsContent>

          </div>
        </Tabs>
      )}
    </div>
    </div>
  );
}
