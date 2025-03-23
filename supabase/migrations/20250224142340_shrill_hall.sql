/*
  # Add conversations table and update chat history relationships

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `created_at` (timestamptz)

  2. Changes
    - Add `conversation_id` to `chat_history` table
    - Add foreign key constraint to link messages to conversations
    - Add indexes for better query performance

  3. Security
    - Enable RLS on conversations table
    - Add policies for authenticated users to manage their conversations
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add conversation_id to chat_history
ALTER TABLE chat_history 
ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES conversations(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON conversations(user_id);
CREATE INDEX IF NOT EXISTS conversations_created_at_idx ON conversations(created_at);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
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

-- Update chat_history policies to include conversation check
DROP POLICY IF EXISTS "Users can read own chat history" ON chat_history;
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

DROP POLICY IF EXISTS "Users can insert own messages" ON chat_history;
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