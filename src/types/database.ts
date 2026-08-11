export type AssessmentStatus = 'pending' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
export type AssessmentOption = 'A' | 'B';

export type RiasecDimension = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface Question {
  id: string;
  question_number: number;
  text: string;
  option_a: string;
  option_b: string;
  active?: boolean;
}

export interface RiasecQuestion {
  id: string;
  question_number: number;
  text: string;
  option_a: string;
  option_b: string;
  dimension_a: RiasecDimension;
  dimension_b: RiasecDimension;
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

export interface JobProfile {
  id: string;
  name: string;
  description: string;
  // Big Five Weights
  openness_weight: number;
  conscientiousness_weight: number;
  extraversion_weight: number;
  agreeableness_weight: number;
  emotional_stability_weight: number;
  // Behavioral Weights
  adaptability_weight: number;
  resilience_weight: number;
  social_maturity_weight: number;
  operational_orientation_weight: number;
  // RIASEC Weights
  realistic_weight: number;
  investigative_weight: number;
  artistic_weight: number;
  social_weight: number;
  enterprising_weight: number;
  conventional_weight: number;
  active?: boolean;
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

  // RIASEC Scores & Codes (0-100)
  riasec_r_score?: number;
  riasec_i_score?: number;
  riasec_a_score?: number;
  riasec_s_score?: number;
  riasec_e_score?: number;
  riasec_c_score?: number;
  riasec_primary?: string;
  riasec_secondary?: string;
  riasec_tertiary?: string;
  riasec_code?: string;
  riasec_summary?: string;

  // Multi-Fit Indices (0-100)
  personality_fit?: number;
  situational_fit?: number;
  interest_fit?: number;
  overall_fit?: number;
  fit_classification?: string;

  // Insights, Synergies & Contradictions
  synergies?: string[];
  contradictions?: string[];
  top_matching_roles?: string[];
  adaptation_roles?: string[];
  recruiter_recommendations?: {
    investigate_points?: string[];
    situational_questions?: string[];
    potential_risks?: string[];
    strengths_to_explore?: string[];
  };

  // Versioning
  riasec_version?: string;
  job_profile_version?: string;
  integration_algorithm_version?: string;
  
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
