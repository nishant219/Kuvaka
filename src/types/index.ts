export interface ILead {
  name: string;
  role: string;
  company: string;
  industry: string;
  location: string;
  linkedin_bio: string;
  score?: number;
  intent?: 'High' | 'Medium' | 'Low';
  reasoning?: string;
  ruleScore?: number;
  aiScore?: number;
}

export interface IOffer {
  _id?: string;
  name: string;
  value_props: string[];
  ideal_use_cases: string[];
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  name: string;
  createdAt?: Date;
}

export interface IScoringResult {
  name: string;
  role: string;
  company: string;
  industry: string;
  location: string;
  linkedin_bio: string;
  intent: 'High' | 'Medium' | 'Low';
  score: number;
  reasoning: string;
  ruleScore: number;
  aiScore: number;
}

export interface IGeminiResponse {
  intent: 'High' | 'Medium' | 'Low';
  reasoning: string;
}
