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
  nextAction: string;
  mvpScope: string;
  taskCount: number;
  completedTaskCount: number;
};

export type Message = {
  id: string;
  projectId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
  order: number;
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
