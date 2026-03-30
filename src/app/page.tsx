import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Github, Sparkles, MessageSquare, Zap, Layers, History, ShieldCheck, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-headline text-2xl font-bold text-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Linna
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
              <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
              <Link href="#open-source" className="text-sm font-medium hover:text-primary transition-colors">Open Source</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="https://github.com/sawsimonlinn/linna" target="_blank" className="hidden sm:flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <Github className="w-4 h-4" />
              <span>Star on GitHub</span>
              <span className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">1.2k</span>
            </Link>
            <Button asChild variant="default" className="rounded-full px-6">
              <Link href="/dashboard">Get started free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="py-24 md:py-32 bg-gradient-to-b from-white to-surface overflow-hidden">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-light text-primary text-xs font-semibold mb-8 border border-primary/10">
              <Zap className="w-3 h-3" />
              OPEN SOURCE AI DEV TOOL
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-bold text-dark mb-6 tracking-tight">
              Your project has a <span className="text-primary italic">memory</span> now.
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-body mb-10 leading-relaxed">
              Linna is a project-aware AI assistant that picks up exactly where you left off. 
              No more re-explaining your stack, goals, or blockers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="rounded-full px-8 h-12 text-base">
                <Link href="/dashboard">
                  Get started free
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 text-base">
                <Link href="https://github.com/sawsimonlinn/linna" target="_blank">
                  View on GitHub
                </Link>
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span>Used by indie hackers & solo devs</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span>Open source</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground" />
              <span>MIT License</span>
            </div>
            
            {/* Browser Mockup */}
            <div className="mt-20 max-w-5xl mx-auto rounded-2xl border shadow-2xl overflow-hidden bg-white">
              <div className="bg-muted h-10 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/20" />
                  <div className="w-3 h-3 rounded-full bg-amber/20" />
                  <div className="w-3 h-3 rounded-full bg-green/20" />
                </div>
                <div className="mx-auto bg-white rounded px-12 py-1 text-[10px] text-muted-foreground border">linna.dev/project/my-saas</div>
              </div>
              <div className="aspect-[16/9] flex bg-surface">
                <div className="w-64 border-r bg-white p-6 text-left hidden md:block">
                  <div className="w-32 h-6 bg-muted rounded mb-6" />
                  <div className="space-y-3">
                    <div className="w-full h-4 bg-muted/60 rounded" />
                    <div className="w-4/5 h-4 bg-muted/60 rounded" />
                    <div className="w-full h-4 bg-muted/60 rounded" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-8 gap-6 relative">
                  <div className="chat-bubble-ai self-start">
                    Welcome back! You were working on the Supabase integration. Should we finish the auth logic?
                  </div>
                  <div className="chat-bubble-user self-end">
                    Yes, help me write the RLS policies for the projects table.
                  </div>
                  <div className="absolute bottom-8 left-8 right-8 h-12 bg-white rounded-full border shadow-sm flex items-center px-4 text-muted-foreground text-sm">
                    Ask Linna anything...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">Everything you need to stop starting over.</h2>
              <p className="text-body max-w-2xl mx-auto">Linna provides continuous context for your development process.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <Zap />, title: "Project Memory", desc: "Linna remembers your stack, decisions, and goals. Every session picks up exactly where you left off." },
                { icon: <MessageSquare />, title: "Context-Aware Chat", desc: "Every answer is grounded in your specific project — not generic advice for the whole internet." },
                { icon: <Sparkles />, title: "Launch Assistant", desc: "When you're ready to ship, Linna writes your Product Hunt post, Reddit launch, and landing page copy." },
                { icon: <Layers />, title: "Multiple Projects", desc: "Manage all your side projects in one place. Switch instantly with full context always loaded." },
                { icon: <History />, title: "Session History", desc: "Scroll back through past conversations. Your decisions, ideas, and breakthroughs are always there." },
                { icon: <ShieldCheck />, title: "Open Source", desc: "Full codebase on GitHub. Self-host it yourself or use our hosted version — your choice." },
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-2xl border hover:border-primary transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-indigo-light text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-body text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-surface">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">Simple pricing. No surprises.</h2>
              <p className="text-body">Choose the plan that works best for your development workflow.</p>
            </div>
            <div className="grid md:grid-cols-3 max-w-5xl mx-auto gap-8">
              {/* Free */}
              <div className="bg-white p-8 rounded-2xl border">
                <h3 className="text-lg font-bold mb-1">FREE</h3>
                <div className="text-3xl font-bold mb-6">$0 <span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-4 mb-8 text-sm">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> 1 Project</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> 20 Messages/month</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> 7 Days chat history</li>
                  <li className="text-muted-foreground line-through">Launch Assistant</li>
                </ul>
                <Button variant="outline" className="w-full rounded-full">Start free</Button>
              </div>
              {/* Pro */}
              <div className="bg-white p-8 rounded-2xl border-2 border-primary relative">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full">POPULAR</div>
                <h3 className="text-lg font-bold mb-1">PRO</h3>
                <div className="text-3xl font-bold mb-6">$12 <span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-4 mb-8 text-sm">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Unlimited Projects</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Unlimited Messages</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Full chat history</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Launch Assistant</li>
                </ul>
                <Button className="w-full rounded-full">Upgrade now</Button>
              </div>
              {/* Self Host */}
              <div className="bg-white p-8 rounded-2xl border">
                <h3 className="text-lg font-bold mb-1">SELF-HOST</h3>
                <div className="text-3xl font-bold mb-6">FREE <span className="text-sm font-normal text-muted-foreground">forever</span></div>
                <ul className="space-y-4 mb-8 text-sm">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Unlimited Projects</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Unlimited Messages</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Full chat history</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Manage servers</li>
                </ul>
                <Button variant="outline" className="w-full rounded-full" asChild>
                   <Link href="https://github.com/sawsimonlinn/linna">View on GitHub</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Open Source Section */}
        <section id="open-source" className="py-24 bg-dark text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">Free forever if you self-host.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
              Linna is fully open source under the MIT license. Clone it, run it, modify it.
            </p>
            <div className="max-w-xl mx-auto bg-black/40 p-6 rounded-xl text-left border border-white/10 font-mono text-sm mb-12">
              <div className="flex gap-2 mb-2">
                <span className="text-primary">$</span>
                <span>git clone https://github.com/sawsimonlinn/linna</span>
              </div>
              <div className="flex gap-2 mb-2">
                <span className="text-primary">$</span>
                <span>npm install</span>
              </div>
              <div className="flex gap-2">
                <span className="text-primary">$</span>
                <span>npm run dev</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {['Next.js', 'Supabase', 'Anthropic API', 'Tailwind CSS'].map((tech, i) => (
                <div key={i} className="text-muted-foreground font-medium">{tech}</div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-body">
              <li><Link href="#features">Features</Link></li>
              <li><Link href="#pricing">Pricing</Link></li>
              <li><Link href="#">Changelog</Link></li>
              <li><Link href="#">Roadmap</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Developers</h4>
            <ul className="space-y-2 text-sm text-body">
              <li><Link href="https://github.com/sawsimonlinn/linna">GitHub</Link></li>
              <li><Link href="#">Self-hosting guide</Link></li>
              <li><Link href="#">API Docs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-body">
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Social</h4>
            <ul className="space-y-2 text-sm text-body">
              <li><Link href="#">Twitter / X</Link></li>
              <li><Link href="#">Product Hunt</Link></li>
              <li><Link href="#">Discord</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
          &copy; 2026 Code Heaven Studio LLC. Built with 💜 by Saw Simon Linn.
        </div>
      </footer>
    </div>
  );
}