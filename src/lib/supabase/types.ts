export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          pinned: boolean;
          project_id: string;
          role: 'user' | 'assistant';
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          pinned?: boolean;
          project_id: string;
          role: 'user' | 'assistant';
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          pinned?: boolean;
          project_id?: string;
          role?: 'user' | 'assistant';
        };
        Relationships: [
          {
            foreignKeyName: 'messages_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          github_token: string | null;
          plan: 'free' | 'pro';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          github_token?: string | null;
          plan?: 'free' | 'pro';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          github_token?: string | null;
          plan?: 'free' | 'pro';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      stripe_events: {
        Row: { event_id: string; created_at: string };
        Insert: { event_id: string; created_at?: string };
        Update: { event_id?: string; created_at?: string };
        Relationships: [];
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: 'owner' | 'member';
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role?: 'owner' | 'member';
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role?: 'owner' | 'member';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_members_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      project_invitations: {
        Row: {
          id: string;
          project_id: string;
          invited_email: string;
          invited_by: string;
          token: string;
          accepted_at: string | null;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          invited_email: string;
          invited_by: string;
          token?: string;
          accepted_at?: string | null;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          invited_email?: string;
          invited_by?: string;
          token?: string;
          accepted_at?: string | null;
          created_at?: string;
          expires_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_invitations_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      projects: {
        Row: {
          blockers: string;
          completed_task_count: number;
          created_at: string;
          description: string;
          goals: string;
          id: string;
          last_active: string;
          message_count: number;
          mvp_scope: string;
          name: string;
          next_action: string;
          target_user: string;
          task_count: number;
          tech_stack: string;
          user_id: string;
          github_repo_url: string | null;
          github_repo_name: string | null;
          github_owner: string | null;
          readme: string | null;
          last_synced_at: string | null;
          launch_content: Json | null;
        };
        Insert: {
          blockers?: string;
          completed_task_count?: number;
          created_at?: string;
          description?: string;
          goals?: string;
          id?: string;
          last_active?: string;
          message_count?: number;
          mvp_scope?: string;
          name: string;
          next_action?: string;
          target_user?: string;
          task_count?: number;
          tech_stack?: string;
          user_id: string;
          github_repo_url?: string | null;
          github_repo_name?: string | null;
          github_owner?: string | null;
          readme?: string | null;
          last_synced_at?: string | null;
          launch_content?: Json | null;
        };
        Update: {
          blockers?: string;
          completed_task_count?: number;
          created_at?: string;
          description?: string;
          goals?: string;
          id?: string;
          last_active?: string;
          message_count?: number;
          mvp_scope?: string;
          name?: string;
          next_action?: string;
          target_user?: string;
          task_count?: number;
          tech_stack?: string;
          user_id?: string;
          github_repo_url?: string | null;
          github_repo_name?: string | null;
          github_owner?: string | null;
          readme?: string | null;
          last_synced_at?: string | null;
          launch_content?: Json | null;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          completed: boolean;
          created_at: string;
          id: string;
          order: number;
          project_id: string;
          title: string;
        };
        Insert: {
          completed?: boolean;
          created_at?: string;
          id?: string;
          order?: number;
          project_id: string;
          title: string;
        };
        Update: {
          completed?: boolean;
          created_at?: string;
          id?: string;
          order?: number;
          project_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
