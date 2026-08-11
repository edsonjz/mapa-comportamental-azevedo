/**
 * V2 Database Types — Interfaces TypeScript para as tabelas V2
 * Coexiste com os tipos V1 em database.ts
 */

// ─── Assessment Modules ───
export interface V2Module {
  id: string;
  name: string;
  description: string;
  module_order: number;
  question_count: number;
  version: string;
  active: boolean;
}

// ─── V2 Question (unified) ───
export interface V2Question {
  id: string;
  module_id: string;
  question_code: string;
  question_number: number;
  text: string;
  options: V2QuestionOption[];
  target_job_id: string | null;
  measures: Record<string, any>;
  version: string;
  active: boolean;
}

export interface V2QuestionOption {
  key: string;
  text: string;
  weights?: Record<string, number>;
  score?: number;
  competencies?: string[];
}

// ─── V2 Answer ───
export interface V2Answer {
  id: string;
  assessment_id: string;
  question_id: string;
  selected_option: string;
  answered_at: string;
  response_time_ms: number | null;
}

// ─── V2 Job Profile ───
export interface V2JobProfileDB {
  id: string;
  name: string;
  description: string;
  requirements: Record<string, any>;
  version: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── V2 Scores ───
export interface V2BehaviorScoresDB {
  id: string;
  assessment_id: string;
  scores: Record<string, number>;
  version: string;
  created_at: string;
}

export interface V2RiasecScoresDB {
  id: string;
  assessment_id: string;
  scores: Record<string, number>;
  primary_code: string;
  secondary_code: string;
  tertiary_code: string;
  riasec_code: string;
  version: string;
  created_at: string;
}

export interface V2MotivationScoresDB {
  id: string;
  assessment_id: string;
  scores: Record<string, number>;
  top_motivators: { key: string; name: string; score: number }[];
  version: string;
  created_at: string;
}

export interface V2SjtScoresDB {
  id: string;
  assessment_id: string;
  job_id: string;
  raw_score: number;
  max_score: number;
  normalized_score: number;
  competency_breakdown: Record<string, number>;
  version: string;
  created_at: string;
}

export interface V2CompetencyScoresDB {
  id: string;
  assessment_id: string;
  scores: Record<string, number>;
  version: string;
  created_at: string;
}

export interface V2FitScoresDB {
  id: string;
  assessment_id: string;
  job_id: string;
  personality_fit: number;
  behavior_fit: number;
  interest_fit: number;
  motivation_fit: number;
  sjt_fit: number;
  competency_fit: number;
  overall_fit: number;
  fit_classification: string;
  has_sjt_specific: boolean;
  convergences: any[];
  tensions: any[];
  divergences: any[];
  version: string;
  created_at: string;
}

export interface V2ReliabilityScoreDB {
  id: string;
  assessment_id: string;
  score: number;
  classification: string;
  flags: string[];
  details: Record<string, any>;
  version: string;
  created_at: string;
}

export interface V2InterviewRecommendationDB {
  id: string;
  assessment_id: string;
  job_id: string;
  strengths: { name: string; score: number }[];
  attention_points: { name: string; candidateScore: number; requiredScore: number }[];
  adaptation_risks: string[];
  competencies_to_develop: string[];
  interview_questions: string[];
  recommendation_text: string;
  potential_text: string;
  version: string;
  created_at: string;
}

// ─── V2 Algorithm ───
export interface AlgorithmVersionDB {
  id: string;
  version_code: string;
  description: string;
  behavior_version: string;
  riasec_version: string;
  motivation_version: string;
  sjt_version: string;
  job_profile_version: string;
  algorithm_version: string;
  parameters_snapshot: Record<string, any>;
  active: boolean;
  created_at: string;
}

export interface AssessmentAlgorithmSnapshotDB {
  id: string;
  assessment_id: string;
  algorithm_version_id: string;
  job_profile_snapshot: Record<string, any>;
  question_weights_snapshot: Record<string, any>;
  created_at: string;
}

// ─── V2 Full Report (aggregated) ───
export interface V2FullReport {
  behavior: V2BehaviorScoresDB;
  riasec: V2RiasecScoresDB;
  motivation: V2MotivationScoresDB;
  sjt: V2SjtScoresDB;
  competencies: V2CompetencyScoresDB;
  reliability: V2ReliabilityScoreDB;
  fits: V2FitScoresDB[];
  interview: V2InterviewRecommendationDB;
}
