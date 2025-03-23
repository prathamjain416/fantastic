import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Menu, Loader, AlertCircle, X, Home } from 'lucide-react';
import { Button } from './Button';
import { ChatHistory } from './ChatHistory';
import { generateInitialRecommendations, generateAIResponse } from '../utils/openai';
import { supabase } from '../lib/supabase';
import type { StudentProfile, Message } from '../types';
import { useStore } from '../store/useStore';

interface ChatInterfaceProps {
  profile: StudentProfile;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ profile }) => {
  const { setCurrentStep } = useStore();
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadConversations = async () => {
      setIsInitializing(true);
      setError(null);
      
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          setIsInitializing(false);
          return;
        }

        let conversationsData;
        try {
          const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', session.session.user.id)
            .order('created_at', { ascending: false });
            
          if (!error) {
            conversationsData = data;
          } else {
            console.error('Error loading conversations:', error);
          }
        } catch (err) {
          console.error('Error loading conversations:', err);
        }

        if (conversationsData && conversationsData.length > 0) {
          const conversationsWithMessages = await Promise.all(
            conversationsData.map(async (conv) => {
              try {
                const { data: messages, error: messagesError } = await supabase
                  .from('chat_history')
                  .select('*')
                  .eq('conversation_id', conv.id)
                  .order('created_at', { ascending: true });

                if (messagesError) {
                  console.error('Error loading messages:', messagesError);
                  return null;
                }

                return {
                  id: conv.id,
                  title: conv.title,
                  messages: messages?.map(msg => ({
                    type: msg.type as 'user' | 'bot',
                    content: msg.content
                  })) || []
                };
              } catch (err) {
                console.error('Error processing conversation:', err);
                return null;
              }
            })
          );

          const validConversations = conversationsWithMessages.filter((conv): conv is Conversation => conv !== null);
          setConversations(validConversations);
          
          if (validConversations.length > 0) {
            const mostRecent = validConversations[0];
            setCurrentConversationId(mostRecent.id);
            setMessages(mostRecent.messages);
          } else {
            await initializeNewConversation();
          }
        } else {
          await initializeNewConversation();
        }
      } catch (err) {
        console.error('Error in conversation loading:', err);
        setError('Unable to load conversations. Please try refreshing the page.');
      } finally {
        setIsInitializing(false);
      }
    };

    loadConversations();
  }, [profile]);

  const initializeNewConversation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate a temporary local conversation ID
      const tempId = 'local-' + Date.now().toString();
      const welcomeMessage = {
        type: 'bot' as const,
        content: "Based on your profile, I'll provide personalized career recommendations. Feel free to ask questions about any career paths that interest you."
      };
      
      // Start with local messages first to improve user experience
      setMessages([welcomeMessage]);
      setCurrentConversationId(tempId);
      
      // Generate initial recommendations
      const initialRecommendations = await generateInitialRecommendations(profile);
      const recommendationsMessage = {
        type: 'bot' as const,
        content: initialRecommendations
      };
      
      setMessages([welcomeMessage, recommendationsMessage]);
      
      // Try to save to database if authenticated
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          const { data, error } = await supabase
            .from('conversations')
            .insert({
              user_id: session.session.user.id,
              title: 'New Career Guidance Chat'
            })
            .select()
            .single();

          if (error || !data) {
            console.error('Database error:', error || 'No data returned');
            // Continue with local conversation
          } else {
            // Update the conversation ID with the real one from the database
            setCurrentConversationId(data.id);
            
            // Save messages to database
            await Promise.all([
              saveMessage(welcomeMessage, data.id),
              saveMessage(recommendationsMessage, data.id)
            ]);
            
            // Update conversations list
            setConversations(prev => [{
              id: data.id,
              title: data.title,
              messages: [welcomeMessage, recommendationsMessage]
            }, ...prev]);
          }
        }
      } catch (dbErr) {
        console.error('Database operation failed:', dbErr);
        // Continue with local conversation
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Failed to initialize chat. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessage = async (message: Message, conversationId: string) => {
    // Skip saving for local conversations
    if (conversationId.startsWith('local-')) return;
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { error } = await supabase
        .from('chat_history')
        .insert({
          user_id: session.session.user.id,
          conversation_id: conversationId,
          content: message.content,
          type: message.type
        });

      if (error) {
        console.error('Error saving message:', error);
      }
    } catch (err) {
      console.error('Exception saving message:', err);
      // Continue without saving - the UI will still work
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentConversationId) return;

    const userMessage = { type: 'user' as const, content: input };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    
    try {
      // Try to save the message, but continue even if it fails
      try {
        await saveMessage(userMessage, currentConversationId);
      } catch (saveErr) {
        console.error('Failed to save user message:', saveErr);
        // Continue anyway - the UI will still work
      }
      
      setIsLoading(true);
      const aiResponse = await generateAIResponse(input, profile, messages);
      const botMessage = {
        type: 'bot' as const,
        content: aiResponse
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Try to save the bot message, but continue even if it fails
      try {
        await saveMessage(botMessage, currentConversationId);
      } catch (saveErr) {
        console.error('Failed to save bot message:', saveErr);
        // Continue anyway - the UI will still work
      }

      // Update conversations list if this is a saved conversation
      if (!currentConversationId.startsWith('local-')) {
        setConversations(prev => prev.map(conv => 
          conv.id === currentConversationId
            ? { ...conv, messages: [...conv.messages, userMessage, botMessage] }
            : conv
        ));
      }
    } catch (error) {
      console.error('Error in message exchange:', error);
      const errorMessage = {
        type: 'bot' as const,
        content: "I apologize, but I'm having trouble generating a response. Please try again later."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsSending(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setCurrentConversationId(id);
      setMessages(conversation.messages);
      setShowHistory(false);
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleHomeClick = () => {
    setCurrentStep(0);
  };

  if (isInitializing) {
    return (
      <div className="flex h-[600px] bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex-1 flex flex-col bg-gray-50 p-4">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your conversations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[600px] bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex-1 flex flex-col bg-gray-50 p-4">
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-md overflow-hidden">
      {showHistory && (
        <div className="absolute inset-0 z-10 md:relative md:inset-auto md:z-auto w-full md:w-64 bg-gray-900 flex-shrink-0 transition-all duration-300 ease-in-out transform">
          <ChatHistory
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            currentConversationId={currentConversationId}
            onClose={toggleHistory}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col bg-gray-50 sm:text-sm">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="outline"
              onClick={toggleHistory}
              className="flex items-center justify-center gap-2"
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">{showHistory ? 'Hide Chat History' : 'Show Chat History'}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleHomeClick}
              className="flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </div>

          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  } animate-fadeIn`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {message.type === 'bot' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={`${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800'
                    } rounded-2xl px-4 py-3 max-w-[85%] shadow-sm`}
                  >
                    {message.content}
                  </div>
                  {message.type === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isSending && (
              <div className="flex gap-3 justify-end animate-fadeIn">
                <div className="bg-blue-200 text-blue-800 rounded-2xl px-4 py-2 max-w-[85%] shadow-sm flex items-center">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="flex gap-3 animate-fadeIn">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="bg-white rounded-2xl px-6 py-4 shadow-sm">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about career paths, requirements, or opportunities..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading || isSending}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading || isSending}
              className="relative"
            >
              {isLoading || isSending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};