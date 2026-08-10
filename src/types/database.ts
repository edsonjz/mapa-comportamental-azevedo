export type AssessmentStatus = 'pending' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
export type AssessmentOption = 'A' | 'B';

export interface Question {
  id: string;
  question_number: number;
  text: string;
  option_a: string;
  option_b: string;
  active?: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  recruiter_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Recruiter {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Assessment {
  id: string;
  candidate_id: string;
  recruiter_id: string;
  access_token: string;
  status: AssessmentStatus;
  started_at?: string | null;
  completed_at?: string | null;
  expires_at?: string | null;
  scoring_version: string;
  target_position?: string | null;
  created_at: string;
  updated_at?: string;
  candidate?: Candidate;
}

export interface ProfileScoreDetail {
  name: string;
  score: number;
}

export interface AssessmentScores {
  id: string;
  assessment_id: string;
  
  // Big Five Factors (0-100)
  openness_score: number;
  conscientiousness_score: number;
  extraversion_score: number;
  agreeableness_score: number;
  emotional_stability_score: number;
  
  // Operational Indicators (0-100)
  adaptability_score: number;
  resilience_score: number;
  social_maturity_score: number;
  operational_orientation_score: number;
  
  // Factor Levels
  openness_level: string;
  conscientiousness_level: string;
  extraversion_level: string;
  agreeableness_level: string;
  emotional_stability_level: string;
  
  // Profiles
  primary_profile: string;
  secondary_profile: string;
  primary_profile_score: number;
  secondary_profile_score: number;
  profile_classification_type: string;
  
  // Detailed Lists
  strengths: string[];
  attention_points: string[];
  recommended_areas: string[];
  less_compatible_areas: string[];
  interview_questions: string[];
  all_profile_scores: ProfileScoreDetail[];
  automatic_summary: string;
  scoring_version: string;
  created_at: string;
}

export interface AssessmentAuditLog {
  id: string;
  assessment_id: string;
  actor_type: 'recruiter' | 'candidate' | 'system';
  actor_id?: string;
  action: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface JobProfileTarget {
  id: string;
  title: string;
  expected_openness: number;
  expected_conscientiousness: number;
  expected_extraversion: number;
  expected_agreeableness: number;
  expected_emotional_stability: number;
  description: string;
}
