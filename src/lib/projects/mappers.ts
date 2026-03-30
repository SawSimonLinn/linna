import type { Database } from '@/lib/supabase/types';
import type { Message, Project } from '@/lib/projects/types';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];

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
