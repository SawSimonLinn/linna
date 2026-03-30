'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LinnaMark } from '@/components/linna-mark';
import { 
  ChevronLeft, 
  Copy, 
  RefreshCw, 
  Check,
  Edit2,
  Share2,
  ExternalLink,
  MessageSquare,
  Twitter,
  Layout,
  Globe
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateLaunchContent, GenerateLaunchContentOutput } from '@/ai/flows/generate-launch-content';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { Project } from '@/lib/projects/types';

export default function LaunchAssistantPage() {
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState<GenerateLaunchContentOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      const response = await fetch(`/api/projects/${id}`, { cache: 'no-store' });

      if (!response.ok) {
        return;
      }

      const projectData = (await response.json()) as Project;
      setProject(projectData);
    };

    void loadProject();
  }, [id]);

  const handleGenerate = async () => {
    if (!project || isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generateLaunchContent({
        projectName: project.name,
        description: project.description,
        techStack: project.techStack,
        currentGoals: project.goals,
        knownBlockers: project.blockers,
        targetUser: project.targetUser,
      });
      setContent(result);
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

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-10">
        <Link 
          href={`/project/${id}`} 
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to chat
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-headline font-bold text-dark mb-2 tracking-tight">Ready to ship? Let's launch this.</h1>
            <p className="text-body text-lg">Linna knows your project. Now it'll help the world know it too.</p>
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            size="lg"
            className="rounded-full px-8 linna-gradient shadow-xl hover:shadow-primary/20 transition-all h-14"
          >
            {isGenerating ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <LinnaMark className="w-5 h-5 mr-2" />
            )}
            {content ? 'Regenerate Content' : 'Generate with Linna'}
          </Button>
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

      {!content && !isGenerating ? (
        <div className="bg-white rounded-[2rem] border border-dashed border-border py-24 flex flex-col items-center justify-center text-center px-4">
           <div className="w-20 h-20 rounded-[2rem] bg-indigo-light flex items-center justify-center mb-8">
             <Rocket className="w-10 h-10 text-primary" />
           </div>
           <h2 className="text-2xl font-bold mb-3">Your launch strategy starts here.</h2>
           <p className="text-body max-w-sm mb-10">Click the button above to generate tailored content for Product Hunt, Reddit, Twitter, and more.</p>
        </div>
      ) : isGenerating && !content ? (
        <div className="space-y-6">
          <div className="h-64 bg-white rounded-[2rem] border animate-pulse" />
          <div className="h-64 bg-white rounded-[2rem] border animate-pulse" />
        </div>
      ) : content && (
        <Tabs defaultValue="producthunt" className="w-full">
          <TabsList className="bg-white border p-1 h-14 rounded-full mb-8 w-full justify-start overflow-x-auto">
            <TabsTrigger value="producthunt" className="rounded-full h-full px-6 data-[state=active]:bg-indigo-light data-[state=active]:text-primary font-bold gap-2">
              <Globe className="w-4 h-4" /> Product Hunt
            </TabsTrigger>
            <TabsTrigger value="reddit" className="rounded-full h-full px-6 data-[state=active]:bg-indigo-light data-[state=active]:text-primary font-bold gap-2">
              <MessageSquare className="w-4 h-4" /> Reddit Post
            </TabsTrigger>
            <TabsTrigger value="twitter" className="rounded-full h-full px-6 data-[state=active]:bg-indigo-light data-[state=active]:text-primary font-bold gap-2">
              <Twitter className="w-4 h-4" /> X Thread
            </TabsTrigger>
            <TabsTrigger value="landing" className="rounded-full h-full px-6 data-[state=active]:bg-indigo-light data-[state=active]:text-primary font-bold gap-2">
              <Layout className="w-4 h-4" /> Landing Page
            </TabsTrigger>
            <TabsTrigger value="communities" className="rounded-full h-full px-6 data-[state=active]:bg-indigo-light data-[state=active]:text-primary font-bold gap-2">
              <Share2 className="w-4 h-4" /> Where to Post
            </TabsTrigger>
          </TabsList>

          <div className="bg-white rounded-[2rem] border shadow-sm p-8 min-h-[500px]">
            <TabsContent value="producthunt" className="mt-0 outline-none">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Product Hunt Post</h3>
                <div className="flex gap-3">
                   <Button variant="outline" size="sm" className="rounded-full" onClick={() => setIsEditing(!isEditing)}>
                     <Edit2 className="w-4 h-4 mr-2" /> {isEditing ? 'Finish' : 'Edit'}
                   </Button>
                   <Button size="sm" className="rounded-full" onClick={() => handleCopy(JSON.stringify(content.productHunt, null, 2), 'ph')}>
                     {copied === 'ph' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                     {copied === 'ph' ? 'Copied!' : 'Copy Post'}
                   </Button>
                </div>
              </div>
              <div className="space-y-8">
                 <section>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Tagline</p>
                    <div className="p-4 bg-surface rounded-xl font-headline font-bold text-xl">{content.productHunt.tagline}</div>
                 </section>
                 <section>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Description</p>
                    <div className="p-6 border rounded-xl whitespace-pre-wrap text-sm leading-relaxed">{content.productHunt.description}</div>
                 </section>
                 <section>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Maker Comment</p>
                    <div className="p-6 border bg-indigo-light/30 rounded-xl whitespace-pre-wrap text-sm leading-relaxed italic">"{content.productHunt.makerComment}"</div>
                 </section>
              </div>
            </TabsContent>

            <TabsContent value="reddit" className="mt-0 outline-none">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Reddit Post</h3>
                <Button size="sm" className="rounded-full" onClick={() => handleCopy(content.redditPost.body, 'reddit')}>
                  {copied === 'reddit' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied === 'reddit' ? 'Copied!' : 'Copy Body'}
                </Button>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-surface rounded-xl font-bold text-lg border-l-4 border-orange-500">{content.redditPost.title}</div>
                <div className="p-8 border rounded-2xl whitespace-pre-wrap text-sm leading-relaxed font-body">{content.redditPost.body}</div>
              </div>
            </TabsContent>

            <TabsContent value="twitter" className="mt-0 outline-none">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Twitter / X Thread</h3>
                <Button size="sm" className="rounded-full" onClick={() => handleCopy(Object.values(content.twitterXThread).join('\n\n'), 'twitter')}>
                   {copied === 'twitter' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                   {copied === 'twitter' ? 'Copied!' : 'Copy Thread'}
                </Button>
              </div>
              <div className="space-y-4">
                {[
                  content.twitterXThread.tweet1,
                  content.twitterXThread.tweet2,
                  content.twitterXThread.tweet3,
                  content.twitterXThread.tweet4,
                  content.twitterXThread.tweet5
                ].map((tweet, i) => (
                  <div key={i} className="flex gap-4 p-6 bg-surface rounded-2xl relative border">
                    <div className="w-10 h-10 rounded-full bg-indigo-light flex items-center justify-center shrink-0">
                       <Twitter className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">Linna Assistant</span>
                        <span className="text-xs text-muted-foreground">@{project.name.toLowerCase().replace(/\s/g, '')} · {i + 1}/5</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{tweet}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="landing" className="mt-0 outline-none">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Landing Page Copy</h3>
                <Button size="sm" className="rounded-full" onClick={() => handleCopy(JSON.stringify(content.landingCopy, null, 2), 'landing')}>
                  {copied === 'landing' ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied === 'landing' ? 'Copied!' : 'Copy JSON'}
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-8">
                   <div className="p-8 bg-indigo-light rounded-3xl border border-primary/10">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Hero Section</p>
                      <h4 className="text-3xl font-headline font-bold mb-4">{content.landingCopy.heroHeadline}</h4>
                      <p className="text-body text-sm leading-relaxed">{content.landingCopy.heroSubHeadline}</p>
                   </div>
                   <div className="p-6 bg-surface rounded-2xl border">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">CTA Section</p>
                      <Button className="w-full rounded-xl">{content.landingCopy.pricingCta}</Button>
                   </div>
                </div>
                <div className="space-y-6">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Key Features</p>
                   {[content.landingCopy.feature1, content.landingCopy.feature2, content.landingCopy.feature3].map((f, i) => (
                      <div key={i} className="flex gap-4 p-5 bg-white border rounded-2xl shadow-sm">
                         <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                           <Check className="w-5 h-5 text-green-600" />
                         </div>
                         <p className="text-sm font-medium leading-relaxed">{f}</p>
                      </div>
                   ))}
                </div>
              </div>
            </TabsContent>

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
                  {content.communities.subreddits.map((s, i) => (
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
                  {content.communities.discordServers.map((s, i) => (
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
                  {content.communities.slackGroups.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-xl text-sm font-medium">
                      <span>{s}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}

function Rocket(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
      <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
    </svg>
  )
}
