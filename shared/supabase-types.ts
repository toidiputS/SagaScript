export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          website: string | null;
          plan: string;
          created_at: string;
          updated_at: string;
          social_links: Json | null;
          preferences: Json | null;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          plan?: string;
          created_at?: string;
          updated_at?: string;
          social_links?: Json | null;
          preferences?: Json | null;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          plan?: string;
          created_at?: string;
          updated_at?: string;
          social_links?: Json | null;
          preferences?: Json | null;
        };
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          total_words: number;
          total_series: number;
          total_books: number;
          total_chapters: number;
          current_streak: number;
          longest_streak: number;
          total_writing_days: number;
          average_words_per_day: number;
          join_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_words?: number;
          total_series?: number;
          total_books?: number;
          total_chapters?: number;
          current_streak?: number;
          longest_streak?: number;
          total_writing_days?: number;
          average_words_per_day?: number;
          join_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_words?: number;
          total_series?: number;
          total_books?: number;
          total_chapters?: number;
          current_streak?: number;
          longest_streak?: number;
          total_writing_days?: number;
          average_words_per_day?: number;
          join_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      recent_activity: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          description: string;
          related_title: string | null;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          description: string;
          related_title?: string | null;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          description?: string;
          related_title?: string | null;
          timestamp?: string;
          created_at?: string;
        };
      };
      achievements: {
        Row: {
          id: number;
          name: string;
          description: string;
          icon: string;
          type: string;
          required_value: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description: string;
          icon: string;
          type: string;
          required_value: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string;
          icon?: string;
          type?: string;
          required_value?: number;
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: number;
          earned_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: number;
          earned_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: number;
          earned_at?: string;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      plan_usage: {
        Row: {
          id: string;
          user_id: string;
          series_used: number;
          series_limit: number;
          ai_prompts_used: number;
          ai_prompts_limit: number;
          collaborators_used: number;
          collaborators_limit: number;
          storage_used: number;
          storage_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          series_used?: number;
          series_limit: number;
          ai_prompts_used?: number;
          ai_prompts_limit: number;
          collaborators_used?: number;
          collaborators_limit: number;
          storage_used?: number;
          storage_limit: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          series_used?: number;
          series_limit?: number;
          ai_prompts_used?: number;
          ai_prompts_limit?: number;
          collaborators_used?: number;
          collaborators_limit?: number;
          storage_used?: number;
          storage_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
