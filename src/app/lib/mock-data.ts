'use client';

export type Project = {
  id: string;
  name: string;
  description: string;
  techStack: string;
  goals: string;
  blockers: string;
  targetUser: string;
  lastActive: string;
  messageCount: number;
};

export type Message = {
  id: string;
  projectId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Linna',
    description: 'Project-aware AI developer tool',
    techStack: 'Next.js, Supabase, Genkit, Anthropic',
    goals: 'Implement chat interface and project context management.',
    blockers: 'Figuring out best way to manage context window with project data.',
    targetUser: 'Indie hackers, solo devs',
    lastActive: new Date().toISOString(),
    messageCount: 42,
  },
];

export function getProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('linna_projects');
  if (!stored) {
    localStorage.setItem('linna_projects', JSON.stringify(INITIAL_PROJECTS));
    return INITIAL_PROJECTS;
  }
  return JSON.parse(stored);
}

export function saveProject(project: Project) {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem('linna_projects', JSON.stringify(projects));
}

export function deleteProject(id: string) {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem('linna_projects', JSON.stringify(projects));
  // Also clear messages
  const messages = getMessages(id).filter(m => m.projectId !== id);
  localStorage.setItem(`linna_messages_${id}`, JSON.stringify([]));
}

export function getMessages(projectId: string): Message[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`linna_messages_${projectId}`);
  return stored ? JSON.parse(stored) : [];
}

export function addMessage(projectId: string, role: 'user' | 'assistant', content: string) {
  const messages = getMessages(projectId);
  const newMessage: Message = {
    id: Math.random().toString(36).substr(2, 9),
    projectId,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
  messages.push(newMessage);
  localStorage.setItem(`linna_messages_${projectId}`, JSON.stringify(messages));
  
  // Update project stats
  const projects = getProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex >= 0) {
    projects[projectIndex].messageCount += 1;
    projects[projectIndex].lastActive = new Date().toISOString();
    localStorage.setItem('linna_projects', JSON.stringify(projects));
  }
  
  return newMessage;
}