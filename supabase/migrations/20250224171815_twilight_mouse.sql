/*
  # Fix chat system tables and policies

  1. Tables
    - Ensure conversations and chat_history tables exist
    - Add proper indexes for performance
  
  2. Security
    - Enable RLS on both tables
    - Create policies safely with IF NOT EXISTS
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read own conversations" ON conversations;
  DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
  DROP POLICY IF EXISTS "Users can read own chat history" ON chat_history;
  DROP POLICY IF EXISTS "Users can insert own messages" ON chat_history;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create chat_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  conversation_id uuid REFERENCES conversations(id) NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('user', 'bot')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON conversations(user_id);
CREATE INDEX IF NOT EXISTS conversations_created_at_idx ON conversations(created_at);
CREATE INDEX IF NOT EXISTS chat_history_user_id_idx ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS chat_history_conversation_id_idx ON chat_history(conversation_id);
CREATE INDEX IF NOT EXISTS chat_history_created_at_idx ON chat_history(created_at);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Recreate policies for conversations
CREATE POLICY "Users can read own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Recreate policies for chat_history
CREATE POLICY "Users can read own chat history"
  ON chat_history
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id AND
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages"
  ON chat_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );