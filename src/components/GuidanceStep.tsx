import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Star, Lightbulb, ArrowRight, ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from './Button';
import { useStore } from '../store/useStore';
import { ChatInterface } from './ChatInterface';
import type { StudentProfile } from '../types';
import { supabase } from '../lib/supabase';

const academicSubjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Geography',
  'Economics',
  'Literature',
  'Art',
  'Music'
];

const performanceLevels = [
  { value: 'excellent', label: 'Excellent (Above 90%)' },
  { value: 'good', label: 'Good (70-90%)' },
  { value: 'average', label: 'Average (50-70%)' },
  { value: 'needs improvement', label: 'Needs Improvement (Below 50%)' }
];

export const GuidanceStep: React.FC = () => {
  const { setCurrentStep } = useStore();
  const [step, setStep] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [hasPreviousChats, setHasPreviousChats] = useState(false);
  const [profile, setProfile] = useState<StudentProfile>({
    grade: '',
    subjects: [],
    performance: '',
    interests: [],
    careerPreferences: []
  });
  const [customInterest, setCustomInterest] = useState('');
  const [customCareer, setCustomCareer] = useState('');

  useEffect(() => {
    const checkPreviousChats = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', session.session.user.id)
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

  const handleGradeSelect = (grade: '10th' | '12th') => {
    setProfile(prev => ({ ...prev, grade }));
    setStep(1);
  };

  const handleSubjectToggle = (subject: string) => {
    setProfile(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handlePerformanceSelect = (performance: StudentProfile['performance']) => {
    setProfile(prev => ({ ...prev, performance }));
    setStep(3);
  };

  const handleInterestAdd = () => {
    if (customInterest.trim()) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, customInterest.trim()]
      }));
      setCustomInterest('');
    }
  };

  const handleInterestDelete = (interestToDelete: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToDelete)
    }));
  };

  const handleCareerAdd = () => {
    if (customCareer.trim()) {
      setProfile(prev => ({
        ...prev,
        careerPreferences: [...prev.careerPreferences, customCareer.trim()]
      }));
      setCustomCareer('');
    }
  };

  const handleCareerDelete = (careerToDelete: string) => {
    setProfile(prev => ({
      ...prev,
      careerPreferences: prev.careerPreferences.filter(career => career !== careerToDelete)
    }));
  };

  const handleBack = () => {
    if (showChat) {
      setShowChat(false);
    } else if (step > 0) {
      setStep(prev => Math.max(0, prev - 1));
    } else {
      setCurrentStep(0); // Go back to onboarding
    }
  };

  const handleGetGuidance = () => {
    setShowChat(true);
  };

  const handleContinueChat = () => {
    setShowChat(true);
  };

  const renderGradeSelection = () => (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-lg">
          <GraduationCap className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-secondary">What grade are you in?</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            grade: '10th',
            title: '10th Grade',
            description: 'Perfect time to explore career paths and plan your academic journey',
            delay: '100ms'
          },
          {
            grade: '12th',
            title: '12th Grade',
            description: "Let's focus on college admissions and specific career choices",
            delay: '200ms'
          }
        ].map((option) => (
          <button
            key={option.grade}
            onClick={() => handleGradeSelect(option.grade as '10th' | '12th')}
            className="p-8 bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:border-primary/60 transition-all duration-300 transform hover:scale-[1.02] animate-fadeIn text-left group"
            style={{ animationDelay: option.delay }}
          >
            <h3 className="text-2xl font-semibold mb-3 text-secondary group-hover:text-primary transition-colors">
              {option.title}
            </h3>
            <p className="text-gray-600 text-lg">
              {option.description}
            </p>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleBack} className="group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Welcome
        </Button>
        
        {hasPreviousChats && (
          <Button 
            onClick={handleContinueChat}
            className="group flex items-center"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Continue Previous Chat
          </Button>
        )}
      </div>
    </div>
  );

  const renderSubjectSelection = () => (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-lg">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            What are your favorite subjects?
          </h2>
          <p className="text-lg text-gray-600">
            Select the subjects you enjoy and perform well in. This helps us understand your academic strengths.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {academicSubjects.map((subject, index) => (
          <button
            key={subject}
            onClick={() => handleSubjectToggle(subject)}
            className={`p-6 rounded-xl text-left transition-all duration-300 animate-fadeIn transform hover:scale-[1.02] ${
              profile.subjects.includes(subject)
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white border-2 border-gray-200 hover:border-primary/60 text-secondary'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-lg font-medium">{subject}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleBack} className="group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
        <Button 
          onClick={() => setStep(2)} 
          disabled={profile.subjects.length === 0}
          className="group"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );

  const renderPerformanceSelection = () => (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Star className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-secondary mb-2">
            How would you rate your academic performance?
          </h2>
          <p className="text-lg text-gray-600">
            This helps us recommend suitable career paths based on your current academic standing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {performanceLevels.map((level, index) => (
          <button
            key={level.value}
            onClick={() => handlePerformanceSelect(level.value as StudentProfile['performance'])}
            className="p-8 bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:border-primary/60 transition-all duration-300 transform hover:scale-[1.02] animate-fadeIn text-left group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h3 className="text-2xl font-semibold text-secondary group-hover:text-primary transition-colors">
              {level.label}
            </h3>
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleBack} className="group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
      </div>
    </div>
  );

  const renderInterestsAndHobbies = () => (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-lg w-fit">
          <Lightbulb className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-secondary mb-2">
            What are your interests and hobbies?
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Tell us about activities you enjoy outside of academics. This helps us suggest careers that align with your passions.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            value={customInterest}
            onChange={e => setCustomInterest(e.target.value)}
            placeholder="Enter an interest or hobby"
            className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleInterestAdd()}
          />
          <Button onClick={handleInterestAdd} className="w-full sm:w-auto">Add Interest</Button>
        </div>

        <div className="flex flex-wrap gap-3">
          {profile.interests.map((interest, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium animate-scaleIn flex items-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {interest}
              <button 
                onClick={() => handleInterestDelete(interest)}
                className="ml-2 text-primary hover:text-red-500 transition-colors focus:outline-none"
                aria-label="Delete interest"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6 gap-4">
        <Button variant="outline" onClick={handleBack} className="group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
        <Button 
          onClick={() => setStep(4)} 
          disabled={profile.interests.length === 0}
          className="group"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );

  const renderCareerPreferences = () => (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-lg w-fit">
          <ArrowRight className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-secondary mb-2">
            Do you have any specific careers in mind?
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            List any careers or fields you're interested in. Don't worry if you're not sure - we'll help you explore options!
          </p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            value={customCareer}
            onChange={e => setCustomCareer(e.target.value)}
            placeholder="Enter a career or field"
            className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleCareerAdd()}
          />
          <Button onClick={handleCareerAdd} className="w-full sm:w-auto">Add Career</Button>
        </div>

        <div className="flex flex-wrap gap-3">
          {profile.careerPreferences.map((career, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium animate-scaleIn flex items-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {career}
              <button 
                onClick={() => handleCareerDelete(career)}
                className="ml-2 text-primary hover:text-red-500 transition-colors focus:outline-none"
                aria-label="Delete career"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6 gap-4">
        <Button variant="outline" onClick={handleBack} className="group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
        <Button onClick={handleGetGuidance} className="group">
          Get Career Guidance
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );

  if (showChat) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <ChatInterface profile={profile} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div className="flex gap-3">
          {[GraduationCap, BookOpen, Star, Lightbulb, ArrowRight].map((Icon, index) => (
            <div
              key={index}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                index === step
                  ? 'bg-primary text-white shadow-lg'
                  : index < step
                  ? 'bg-primary/20 text-primary'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>
          ))}
        </div>
        <p className="text-lg font-medium text-secondary">
          Step {step + 1} of 5
        </p>
      </div>

      {step === 0 && renderGradeSelection()}
      {step === 1 && renderSubjectSelection()}
      {step === 2 && renderPerformanceSelection()}
      {step === 3 && renderInterestsAndHobbies()}
      {step === 4 && renderCareerPreferences()}
    </div>
  );
};