import type { StudentProfile, Message } from '../types';

// OpenAI client is temporarily disabled
// const openai = new OpenAI({
//   apiKey: import.meta.env.VITE_OPENAI_API_KEY,
//   dangerouslyAllowBrowser: true
// });

export async function generateInitialRecommendations(profile: StudentProfile): Promise<string> {
  // Return a static response instead of making an API call
  return `Based on your profile as a ${profile.grade} grade student with interests in ${profile.subjects.join(', ')}, here are some career paths to consider:

1. Software Development
   - Perfect match for students interested in technology and problem-solving
   - Strong job market with excellent growth potential
   - Typical salary range: $70,000 - $150,000
   - Key skills: Programming, analytical thinking, teamwork

2. Data Science
   - Combines mathematics, statistics, and technology
   - Growing field with diverse applications
   - Typical salary range: $80,000 - $160,000
   - Key skills: Statistics, programming, machine learning

3. Digital Marketing
   - Great for creative minds with technical skills
   - Dynamic field with constant innovation
   - Typical salary range: $50,000 - $120,000
   - Key skills: Analytics, content creation, social media

Would you like to learn more about any of these career paths? Feel free to ask about specific requirements, day-to-day work, or growth opportunities.`;
}

export async function generateAIResponse(
  question: string,
  profile: StudentProfile,
  history: Message[]
): Promise<string> {
  // Return a static response instead of making an API call
  return `I can help you explore various career paths and provide information about:

1. Educational requirements
2. Skills needed
3. Job market outlook
4. Salary expectations
5. Career growth opportunities

What specific aspect would you like to know more about?`;
}