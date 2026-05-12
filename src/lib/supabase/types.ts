export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          project_id: string;
          role: 'user' | 'assistant';
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          project_id: string;
          role: 'user' | 'assistant';
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
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
