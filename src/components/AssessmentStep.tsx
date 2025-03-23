import React, { useState } from 'react';
import { Brain, Book, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from './Button';
import { useStore } from '../store/useStore';
import type { Assessment, Skill, Education } from '../types';

const interestOptions = [
  'Technology & Computing',
  'Science & Research',
  'Art & Design',
  'Business & Finance',
  'Healthcare & Medicine',
  'Education & Teaching',
  'Writing & Communication',
  'Engineering & Architecture',
  'Social Services & Community',
  'Entertainment & Media'
];

const skillLevels: Array<Skill['level']> = ['beginner', 'intermediate', 'advanced'];

export const AssessmentStep: React.FC = () => {
  const { setAssessment, setCurrentStep } = useStore();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner' as const });
  const [newEducation, setNewEducation] = useState({
    degree: '',
    field: '',
    institution: '',
    year: new Date().getFullYear()
  });

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleAddSkill = () => {
    if (newSkill.name.trim()) {
      setSkills(prev => [...prev, { ...newSkill }]);
      setNewSkill({ name: '', level: 'beginner' });
    }
  };

  const handleAddEducation = () => {
    if (newEducation.degree && newEducation.field && newEducation.institution) {
      setEducation(prev => [...prev, { ...newEducation }]);
      setNewEducation({
        degree: '',
        field: '',
        institution: '',
        year: new Date().getFullYear()
      });
    }
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      const assessment: Assessment = {
        interests,
        skills,
        education,
        personalityTraits: [] // To be implemented in personality assessment
      };
      setAssessment(assessment);
      setCurrentStep(2); // Move to career suggestions
    }
  };

  const renderInterests = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold">What are your interests?</h2>
      </div>
      <p className="text-gray-600 mb-6">
        Select all areas that interest you. This helps us understand your potential career directions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {interestOptions.map(interest => (
          <button
            key={interest}
            onClick={() => handleInterestToggle(interest)}
            className={`p-4 rounded-lg text-left transition-colors ${
              interests.includes(interest)
                ? 'bg-blue-100 border-2 border-blue-600'
                : 'bg-white border-2 border-gray-200 hover:border-blue-400'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Book className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold">What skills do you have?</h2>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={newSkill.name}
            onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
            placeholder="Enter a skill (e.g., Python, Project Management)"
            className="p-2 border rounded-lg col-span-2"
          />
          <select
            value={newSkill.level}
            onChange={e => setNewSkill({ ...newSkill, level: e.target.value as Skill['level'] })}
            className="p-2 border rounded-lg"
          >
            {skillLevels.map(level => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleAddSkill}>Add Skill</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold">{skill.name}</h3>
            <p className="text-gray-600">Level: {skill.level}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold">What's your educational background?</h2>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={newEducation.degree}
            onChange={e => setNewEducation({ ...newEducation, degree: e.target.value })}
            placeholder="Degree (e.g., Bachelor's, Master's)"
            className="p-2 border rounded-lg"
          />
          <input
            type="text"
            value={newEducation.field}
            onChange={e => setNewEducation({ ...newEducation, field: e.target.value })}
            placeholder="Field of Study"
            className="p-2 border rounded-lg"
          />
          <input
            type="text"
            value={newEducation.institution}
            onChange={e => setNewEducation({ ...newEducation, institution: e.target.value })}
            placeholder="Institution"
            className="p-2 border rounded-lg"
          />
          <input
            type="number"
            value={newEducation.year}
            onChange={e => setNewEducation({ ...newEducation, year: parseInt(e.target.value) })}
            placeholder="Year"
            className="p-2 border rounded-lg"
          />
        </div>
        <Button onClick={handleAddEducation}>Add Education</Button>
      </div>
      <div className="space-y-4">
        {education.map((edu, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold">{edu.degree} in {edu.field}</h3>
            <p className="text-gray-600">{edu.institution} - {edu.year}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-2">
          {[Brain, Book, Briefcase].map((Icon, index) => (
            <div
              key={index}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index === step
                  ? 'bg-blue-600 text-white'
                  : index < step
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
          ))}
        </div>
        <p className="text-gray-600">Step {step + 1} of 3</p>
      </div>

      {step === 0 && renderInterests()}
      {step === 1 && renderSkills()}
      {step === 2 && renderEducation()}

      <div className="mt-8 flex justify-end gap-4">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            Previous
          </Button>
        )}
        <Button onClick={handleNext}>
          {step === 2 ? 'Complete Assessment' : 'Next'}
        </Button>
      </div>
    </div>
  );
};