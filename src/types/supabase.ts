export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
          grade: string | null
          subjects: string[] | null
          performance: string | null
          interests: string[] | null
          career_preferences: string[] | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          grade?: string | null
          subjects?: string[] | null
          performance?: string | null
          interests?: string[] | null
          career_preferences?: string[] | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
          grade?: string | null
          subjects?: string[] | null
          performance?: string | null
          interests?: string[] | null
          career_preferences?: string[] | null
        }
      }
      chat_history: {
        Row: {
          id: string
          user_id: string
          content: string
          type: 'user' | 'bot'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          type: 'user' | 'bot'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          type?: 'user' | 'bot'
          created_at?: string
        }
      }
    }
  }
}