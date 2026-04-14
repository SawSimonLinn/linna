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
