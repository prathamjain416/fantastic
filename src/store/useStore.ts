import { create } from 'zustand';
import type { User, Assessment, CareerSuggestion } from '../types';
import { supabase } from '../lib/supabase';

interface State {
  user: User | null;
  assessment: Assessment | null;
  suggestions: CareerSuggestion[];
  currentStep: number;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAssessment: (assessment: Assessment) => void;
  setSuggestions: (suggestions: CareerSuggestion[]) => void;
  setCurrentStep: (step: number) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  signOut: () => Promise<void>;
}

export const useStore = create<State>((set) => ({
  user: null,
  assessment: null,
  suggestions: [],
  currentStep: 0,
  isAuthenticated: false,
  setUser: (user) => set({ user }),
  setAssessment: (assessment) => set({ assessment }),
  setSuggestions: (suggestions) => set({ suggestions }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, currentStep: 0 });
  },
}));