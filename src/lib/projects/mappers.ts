import type { Database } from '@/lib/supabase/types';
import type { Message, Project, ProjectInvitation, ProjectMember, Task } from '@/lib/projects/types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];
type ProjectMemberRow = Database['public']['Tables']['project_members']['Row'] & { email?: string | null };
type ProjectInvitationRow = Database['public']['Tables']['project_invitations']['Row'];

export function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    techStack: row.tech_stack,
    goals: row.goals,
    blockers: row.blockers,
    targetUser: row.target_user,
    lastActive: row.last_active,
    messageCount: row.message_count,
    createdAt: row.created_at,
    nextAction: row.next_action,
    mvpScope: row.mvp_scope,
    taskCount: row.task_count,
    completedTaskCount: row.completed_task_count,
    githubRepoUrl: row.github_repo_url,
    githubRepoName: row.github_repo_name,
    githubOwner: row.github_owner,
    readme: row.readme,
    lastSyncedAt: row.last_synced_at,
    launchContent: (row.launch_content ?? null) as import('@/ai/flows/generate-launch-content').GenerateLaunchContentOutput | null,
  };
}

export function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    projectId: row.project_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
    pinned: row.pinned,
  };
}

export function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    completed: row.completed,
    order: row.order,
    createdAt: row.created_at,
  };
}

export function mapProjectMember(row: ProjectMemberRow): ProjectMember {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    role: row.role,
    email: row.email ?? null,
    createdAt: row.created_at,
  };
}

export function mapProjectInvitation(row: ProjectInvitationRow): ProjectInvitation {
  return {
    id: row.id,
    projectId: row.project_id,
    invitedEmail: row.invited_email,
    invitedBy: row.invited_by,
    token: row.token,
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}
