import React, { useState, useEffect } from 'react';
import { Brain, GraduationCap, User, MessageSquare } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '../lib/supabase';

interface OnboardingStepProps {
  onStart: () => void;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({ onStart }) => {
  const [hasPreviousChats, setHasPreviousChats] = useState(false);

  useEffect(() => {
    const checkPreviousChats = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('id')
          .limit(1);

        if (!error && data && data.length > 0) {
          setHasPreviousChats(true);
        }
      } catch (error) {
        console.error("Error checking previous chats:", error);
      }
    };

    checkPreviousChats();
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center animate-fadeIn">
      <div className="mb-12">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <Brain className="w-24 h-24 text-primary animate-scaleIn" />
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
        </div>
        <h1 className="text-5xl font-bold mb-6 text-secondary animate-slideIn">
          Welcome to CareerAI Guide
        </h1>
        <p className="text-xl text-gray-600 mb-8 animate-slideIn" style={{ animationDelay: '100ms' }}>
          Your intelligent companion for discovering the perfect career path. Let's explore your
          interests, skills, and potential together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {[
          {
            icon: User,
            title: 'Personalized Analysis',
            description: 'Tailored career suggestions based on your unique profile',
            delay: '200ms'
          },
          {
            icon: Brain,
            title: 'AI-Powered Insights',
            description: 'Advanced AI analysis of your skills and interests',
            delay: '300ms'
          },
          {
            icon: GraduationCap,
            title: 'Learning Resources',
            description: 'Curated educational content and opportunities',
            delay: '400ms'
          }
        ].map((feature, index) => (
          <div
            key={index}
            className="p-8 bg-white rounded-xl shadow-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300 animate-fadeIn"
            style={{ animationDelay: feature.delay }}
          >
            <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3 text-secondary">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Button
          size="lg"
          onClick={onStart}
          className="animate-scaleIn"
          style={{ animationDelay: '500ms' }}
        >
          Start Your Career Journey
        </Button>
        
        {hasPreviousChats && (
          <Button
            size="lg"
            variant="outline"
            onClick={() => onStart()}
            className="animate-scaleIn flex items-center justify-center"
            style={{ animationDelay: '600ms' }}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Continue Previous Chat
          </Button>
        )}
      </div>
    </div>
  );
};