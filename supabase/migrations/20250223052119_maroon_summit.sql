/*
  # Create chat history table

  1. New Tables
    - `chat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `type` (text, either 'user' or 'bot')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `chat_history` table
    - Add policies for authenticated users to:
      - Read their own chat history
      - Insert new messages
*/

CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('user', 'bot')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chat history"
  ON chat_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON chat_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX chat_history_user_id_idx ON chat_history(user_id);
CREATE INDEX chat_history_created_at_idx ON chat_history(created_at);