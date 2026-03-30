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
  createdAt: string;
};

export type Message = {
  id: string;
  projectId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type NewProjectInput = {
  name: string;
  description: string;
  techStack: string;
  goals: string;
  blockers: string;
  targetUser: string;
};
