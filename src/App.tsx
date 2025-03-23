import React, { useEffect } from 'react';
import { OnboardingStep } from './components/OnboardingStep';
import { AssessmentStep } from './components/AssessmentStep';
import { GuidanceStep } from './components/GuidanceStep';
import { AuthForm } from './components/AuthForm';
import { useStore } from './store/useStore';
import { supabase } from './lib/supabase';
import { LogOut } from 'lucide-react';
import { Button } from './components/Button';

function App() {
  const { currentStep, setCurrentStep, isAuthenticated, setIsAuthenticated, signOut } = useStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [setIsAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen-dynamic bg-gradient-to-br from-primary/5 to-accent/5 py-6 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <AuthForm onSuccess={() => setIsAuthenticated(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-dynamic bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {currentStep === 0 && (
          <div className="flex justify-end mb-6 sm:mb-8 animate-fadeIn">
            <Button variant="outline" onClick={signOut} className="group">
              <LogOut className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
              <span className="hidden xs:inline">Sign Out</span>
            </Button>
          </div>
        )}
        <div className="transition-all duration-300 transform">
          {currentStep === 0 && <OnboardingStep onStart={() => setCurrentStep(1)} />}
          {currentStep === 1 && <GuidanceStep />}
        </div>
      </div>
    </div>
  );
}

export default App;