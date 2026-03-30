'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  MoreVertical, 
  MessageSquare, 
  Clock, 
  Sparkles,
  Archive,
  Trash2,
  Edit2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getProjects, saveProject, deleteProject, Project } from '@/app/lib/mock-data';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    techStack: '',
    goals: '',
    blockers: '',
    targetUser: ''
  });

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const handleCreateProject = () => {
    if (!newProject.name) return;
    
    const project: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: newProject.name!,
      description: newProject.description || '',
      techStack: newProject.techStack || '',
      goals: newProject.goals || '',
      blockers: newProject.blockers || '',
      targetUser: newProject.targetUser || '',
      lastActive: new Date().toISOString(),
      messageCount: 0,
    };
    
    saveProject(project);
    setProjects(getProjects());
    setIsModalOpen(false);
    setNewProject({ name: '', description: '', techStack: '', goals: '', blockers: '', targetUser: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
      setProjects(getProjects());
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-headline font-bold mb-1">Your Projects</h1>
          <p className="text-body text-sm">Create and manage your project contexts.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full px-6">
              <Plus className="w-4 h-4 mr-2" />
              New project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-headline font-bold">New Project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Linna, My SaaS App" 
                  value={newProject.name} 
                  onChange={e => setNewProject({...newProject, name: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  placeholder="One line — what are you building?" 
                  value={newProject.description} 
                  onChange={e => setNewProject({...newProject, description: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tech">Tech Stack</Label>
                <Input 
                  id="tech" 
                  placeholder="e.g. Next.js, Supabase, Stripe" 
                  value={newProject.techStack} 
                  onChange={e => setNewProject({...newProject, techStack: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goals">Current Goals</Label>
                <Textarea 
                  id="goals" 
                  placeholder="What are you trying to accomplish this week?" 
                  value={newProject.goals} 
                  onChange={e => setNewProject({...newProject, goals: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="blockers">Known Blockers</Label>
                <Textarea 
                  id="blockers" 
                  placeholder="What's slowing you down right now?" 
                  value={newProject.blockers} 
                  onChange={e => setNewProject({...newProject, blockers: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target">Target User</Label>
                <Input 
                  id="target" 
                  placeholder="e.g. indie hackers, students" 
                  value={newProject.targetUser} 
                  onChange={e => setNewProject({...newProject, targetUser: e.target.value})} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateProject} className="w-full">Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-border text-center px-4">
          <div className="w-16 h-16 rounded-3xl bg-surface flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">No projects yet.</h2>
          <p className="text-body text-sm mb-8 max-w-sm">Create your first project and give Linna the context it needs to start assisting you.</p>
          <Button onClick={() => setIsModalOpen(true)} className="rounded-full px-8">
            Create your first project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="group hover:border-primary transition-all duration-300 relative overflow-hidden bg-white border">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <Link href={`/project/${project.id}`} className="flex-1">
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{project.name}</CardTitle>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit2 className="w-4 h-4 mr-2" /> Edit Context
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="w-4 h-4 mr-2" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(project.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <Link href={`/project/${project.id}`}>
                <CardContent className="pb-4">
                  <p className="text-xs text-body line-clamp-2 mb-4 h-8">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.split(',').map((tag, i) => (
                      <Badge key={i} variant="secondary" className="bg-surface text-[10px] py-0 px-2 font-medium">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px]">
                      Active {formatDistanceToNow(new Date(project.lastActive))} ago
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-medium">{project.messageCount} messages</span>
                  </div>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}