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
          created_at: string;
          description: string;
          goals: string;
          id: string;
          last_active: string;
          message_count: number;
          name: string;
          target_user: string;
          tech_stack: string;
          user_id: string;
        };
        Insert: {
          blockers?: string;
          created_at?: string;
          description?: string;
          goals?: string;
          id?: string;
          last_active?: string;
          message_count?: number;
          name: string;
          target_user?: string;
          tech_stack?: string;
          user_id: string;
        };
        Update: {
          blockers?: string;
          created_at?: string;
          description?: string;
          goals?: string;
          id?: string;
          last_active?: string;
          message_count?: number;
          name?: string;
          target_user?: string;
          tech_stack?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
