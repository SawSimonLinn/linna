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
  githubRepoUrl: string | null;
  githubRepoName: string | null;
  githubOwner: string | null;
  readme: string | null;
  lastSyncedAt: string | null;
  launchContent: import('@/ai/flows/generate-launch-content').GenerateLaunchContentOutput | null;
};

export type Message = {
  id: string;
  projectId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  pinned: boolean;
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

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'member';
  email: string | null;
  createdAt: string;
};

export type ProjectInvitation = {
  id: string;
  projectId: string;
  invitedEmail: string;
  invitedBy: string;
  token: string;
  acceptedAt: string | null;
  createdAt: string;
  expiresAt: string;
};
