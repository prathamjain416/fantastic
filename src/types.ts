export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Assessment {
  interests: string[];
  skills: Skill[];
  education: Education[];
  personalityTraits: string[];
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  year: number;
}

export interface CareerSuggestion {
  title: string;
  description: string;
  requiredSkills: string[];
  education: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  growthProspects: string;
  resources: Resource[];
}

export interface Resource {
  title: string;
  type: 'course' | 'scholarship' | 'internship';
  url: string;
  provider: string;
}

export interface StudentProfile {
  grade: '10th' | '12th' | '';
  subjects: string[];
  performance: 'excellent' | 'good' | 'average' | 'needs improvement' | '';
  interests: string[];
  careerPreferences: string[];
}

export interface Message {
  type: 'user' | 'bot';
  content: string;
}

export interface CareerPath {
  title: string;
  description: string;
  requirements: string[];
  prospects: string;
  salary: string;
}