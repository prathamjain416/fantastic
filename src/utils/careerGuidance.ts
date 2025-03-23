import type { StudentProfile, Message, CareerPath } from '../types';

const careerPaths: Record<string, CareerPath[]> = {
  'Computer Science': [
    {
      title: 'Software Developer',
      description: 'Design and build applications and systems',
      requirements: ['Programming skills', 'Problem-solving ability', 'Bachelor\'s in CS or related field'],
      prospects: 'High demand with excellent growth potential',
      salary: '$70,000 - $150,000'
    },
    {
      title: 'Data Scientist',
      description: 'Analyze complex data sets to help guide business decisions',
      requirements: ['Statistics', 'Machine Learning', 'Programming', 'Master\'s degree recommended'],
      prospects: 'Growing field with increasing demand',
      salary: '$80,000 - $160,000'
    }
  ],
  'Biology': [
    {
      title: 'Medical Doctor',
      description: 'Diagnose and treat patients in various specialties',
      requirements: ['MBBS/MD', 'License', 'Strong academic background'],
      prospects: 'Stable career with various specialization options',
      salary: '$200,000 - $400,000'
    },
    {
      title: 'Biomedical Researcher',
      description: 'Conduct research to advance medical knowledge',
      requirements: ['PhD in Biology or related field', 'Research skills'],
      prospects: 'Good opportunities in academia and industry',
      salary: '$60,000 - $120,000'
    }
  ],
  'Mathematics': [
    {
      title: 'Financial Analyst',
      description: 'Analyze financial data and market trends',
      requirements: ['Strong mathematical skills', 'Financial modeling', 'Bachelor\'s in Mathematics/Finance'],
      prospects: 'Excellent growth opportunities in finance sector',
      salary: '$65,000 - $120,000'
    },
    {
      title: 'Actuary',
      description: 'Assess risk and uncertainty in insurance and finance',
      requirements: ['Advanced mathematics', 'Statistical analysis', 'Professional certification'],
      prospects: 'High demand in insurance and consulting',
      salary: '$70,000 - $150,000'
    }
  ],
  'Physics': [
    {
      title: 'Research Scientist',
      description: 'Conduct research in physics and related fields',
      requirements: ['PhD in Physics', 'Research experience', 'Advanced mathematics'],
      prospects: 'Opportunities in academia and industry research',
      salary: '$70,000 - $130,000'
    },
    {
      title: 'Aerospace Engineer',
      description: 'Design and develop aircraft and spacecraft',
      requirements: ['Strong physics background', 'Engineering principles', 'Bachelor\'s/Master\'s degree'],
      prospects: 'Growing demand in aerospace and defense',
      salary: '$75,000 - $140,000'
    }
  ]
};

export function generateInitialRecommendations(profile: StudentProfile): string {
  const recommendations = [];
  
  // Match subjects with career paths
  for (const subject of profile.subjects) {
    const paths = careerPaths[subject];
    if (paths) {
      recommendations.push(...paths);
    }
  }

  // Filter and rank recommendations based on interests and performance
  const rankedRecommendations = recommendations
    .filter((career, index, self) => 
      index === self.findIndex(c => c.title === career.title)
    )
    .sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Increase score based on matching interests
      profile.interests.forEach(interest => {
        if (a.description.toLowerCase().includes(interest.toLowerCase())) scoreA += 2;
        if (b.description.toLowerCase().includes(interest.toLowerCase())) scoreB += 2;
      });

      // Adjust score based on academic performance
      if (profile.performance === 'excellent') {
        if (a.requirements.some(r => r.includes('PhD') || r.includes('advanced'))) scoreA += 3;
        if (b.requirements.some(r => r.includes('PhD') || r.includes('advanced'))) scoreB += 3;
      }

      return scoreB - scoreA;
    })
    .slice(0, 4); // Get top 4 recommendations

  if (rankedRecommendations.length === 0) {
    return `Based on your profile as a ${profile.grade} grade student, here are some general career paths to consider:

1. Education and Teaching
   - Perfect for those who enjoy helping others learn
   - Requires strong communication skills
   - Various specialization options available

2. Business Administration
   - Combines analytical and interpersonal skills
   - Multiple career paths available
   - Good growth potential

3. Creative Arts
   - Ideal for expressing creativity
   - Various specializations (design, media, etc.)
   - Growing demand in digital media

Would you like to learn more about any of these fields?`;
  }

  const response = `Based on your profile as a ${profile.grade} grade student with interests in ${profile.subjects.join(', ')}, here are your personalized career recommendations:\n\n` +
    rankedRecommendations.map((career, index) => 
      `${index + 1}. ${career.title}\n` +
      `   - ${career.description}\n` +
      `   - Key Requirements: ${career.requirements.join(', ')}\n` +
      `   - Career Prospects: ${career.prospects}\n` +
      `   - Salary Range: ${career.salary}\n`
    ).join('\n') +
    '\nWould you like more details about any of these career paths? You can ask about educational requirements, skills needed, or job prospects.';

  return response;
}

export function generateAIResponse(
  question: string,
  profile: StudentProfile,
  history: Message[]
): string {
  const lowerQuestion = question.toLowerCase();
  
  // Analyze question intent
  const intents = {
    salary: lowerQuestion.includes('salary') || lowerQuestion.includes('pay') || lowerQuestion.includes('earn'),
    education: lowerQuestion.includes('study') || lowerQuestion.includes('degree') || lowerQuestion.includes('qualification'),
    skills: lowerQuestion.includes('skill') || lowerQuestion.includes('requirement') || lowerQuestion.includes('need to know'),
    prospects: lowerQuestion.includes('future') || lowerQuestion.includes('growth') || lowerQuestion.includes('opportunity'),
    specific: Object.keys(careerPaths).some(subject => 
      lowerQuestion.includes(subject.toLowerCase()) ||
      careerPaths[subject].some(career => 
        lowerQuestion.includes(career.title.toLowerCase())
      )
    )
  };

  // Generate contextual response based on intent
  if (intents.specific) {
    const relevantSubject = Object.keys(careerPaths).find(subject => 
      lowerQuestion.includes(subject.toLowerCase())
    );
    
    if (relevantSubject) {
      const careers = careerPaths[relevantSubject];
      return `Here's detailed information about careers in ${relevantSubject}:\n\n` +
        careers.map(career => 
          `${career.title}:\n` +
          `- ${career.description}\n` +
          `- Required Skills: ${career.requirements.join(', ')}\n` +
          `- Career Prospects: ${career.prospects}\n` +
          `- Typical Salary Range: ${career.salary}`
        ).join('\n\n');
    }
  }

  if (intents.salary) {
    return `Salary ranges vary significantly based on the career path, location, and experience. Here's a general overview:

Entry Level (0-2 years):
- Technical roles: $50,000 - $80,000
- Business roles: $45,000 - $65,000
- Healthcare roles: $60,000 - $90,000

Mid-Career (5+ years):
- Technical roles: $80,000 - $150,000
- Business roles: $70,000 - $120,000
- Healthcare roles: $90,000 - $200,000

Senior Level (10+ years):
- Technical roles: $120,000 - $200,000+
- Business roles: $100,000 - $180,000+
- Healthcare roles: $150,000 - $300,000+

Would you like salary information for a specific career?`;
  }

  if (intents.education) {
    return `Educational requirements vary by career path. Here's a general guide:

1. Technical Careers (Software, Engineering):
   - Bachelor's degree in related field
   - Professional certifications
   - Continuous learning/upskilling

2. Healthcare:
   - Bachelor's degree
   - Medical school for doctors
   - Specialized training/residency
   - Licensing requirements

3. Business:
   - Bachelor's degree in Business/related field
   - MBA for advanced positions
   - Professional certifications

4. Creative Fields:
   - Bachelor's degree (recommended)
   - Portfolio of work
   - Industry certifications

What specific career path's education requirements interest you?`;
  }

  if (intents.skills) {
    return `Key skills valued across most careers include:

1. Technical Skills:
   - Digital literacy
   - Data analysis
   - Industry-specific software

2. Soft Skills:
   - Communication
   - Problem-solving
   - Teamwork
   - Adaptability

3. Business Skills:
   - Project management
   - Time management
   - Strategic thinking

4. Personal Development:
   - Continuous learning
   - Leadership
   - Innovation

Would you like to know about skills for a specific career?`;
  }

  if (intents.prospects) {
    return `Career prospects vary by field. Here are some growing areas:

1. Technology:
   - AI/Machine Learning
   - Cybersecurity
   - Cloud Computing
   - Expected growth: 15-25% annually

2. Healthcare:
   - Telemedicine
   - Mental Health
   - Geriatric Care
   - Expected growth: 10-20% annually

3. Sustainability:
   - Renewable Energy
   - Environmental Science
   - Green Technology
   - Expected growth: 20-30% annually

Would you like to know more about prospects in a specific field?`;
  }

  // Default response for other questions
  return `I can help you with information about:

1. Career paths and opportunities
2. Educational requirements
3. Skill development
4. Industry trends
5. Salary expectations

What specific aspect would you like to know more about?`;
}