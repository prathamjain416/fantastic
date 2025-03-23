import React from 'react';
import { MessageSquare, ChevronRight, X } from 'lucide-react';
import type { Message } from '../types';
import { Button } from './Button';

interface ChatHistoryProps {
  conversations: Array<{
    id: string;
    title: string;
    messages: Message[];
  }>;
  onSelectConversation: (id: string) => void;
  currentConversationId: string | null;
  onClose?: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  conversations,
  onSelectConversation,
  currentConversationId,
  onClose
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h3 className="font-semibold">Your Conversations</h3>
        {onClose && (
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="p-1 h-8 w-8 flex items-center justify-center border-gray-700 hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-center p-4 text-gray-400 text-sm">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 hover:bg-gray-800 transition-colors ${
                  currentConversationId === conversation.id ? 'bg-gray-800' : ''
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate flex-1">{conversation.title}</span>
                <ChevronRight className="w-4 h-4 opacity-50 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};