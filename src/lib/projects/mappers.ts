import type { Database } from '@/lib/supabase/types';
import type { Message, Project, Task } from '@/lib/projects/types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];

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
  };
}

export function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    projectId: row.project_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
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
