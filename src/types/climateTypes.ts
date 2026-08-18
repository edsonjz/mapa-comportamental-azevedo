export type LikertRating = 1 | 2 | 3 | 4 | 5 | null; // null represents N/A

export type QuestionType = 'likert' | 'open_text';

export interface ClimateSurvey {
  id: string;
  name: string;
  description?: string | null;
  version: string;
  status: 'draft' | 'active' | 'closed';
  created_at?: string;
  created_by?: string;
}

export interface ClimateDimension {
  id: string;
  survey_id: string;
  code: string;
  name: string;
  description: string;
  display_order: number;
  active?: boolean;
}

export interface ClimateQuestion {
  id: string;
  survey_id: string;
  dimension_id: string;
  code: string;
  question: string;
  question_type: QuestionType;
  scale_type: '1_5' | 'text';
  reverse_scoring: boolean;
  required: boolean;
  display_order: number;
  active?: boolean;
}

export interface ClimateTeam {
  id: string;
  name: string;
  supervisor_id?: string | null;
  description?: string | null;
  created_at?: string;
  supervisor_name?: string;
}

export interface ClimateUserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gestor' | 'supervisor' | 'operador';
  team_id?: string | null;
  supervisor_id?: string | null;
  job_role?: string;
  created_at?: string;
  team_name?: string;
  supervisor_name?: string;
}

export interface ClimateOperator {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  job_role: string;
  team_id?: string | null;
  supervisor_id?: string | null;
  access_token: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  team_name?: string;
  supervisor_name?: string;
}

export interface ClimateResponse {
  id: string;
  survey_id: string;
  operator_id?: string | null;
  climate_operator_id?: string | null;
  team_id?: string | null;
  supervisor_id?: string | null;
  job_role?: string | null;
  started_at: string;
  completed_at?: string | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  operator_name?: string;
  team_name?: string;
  supervisor_name?: string;
}

export interface ClimateAnswer {
  id?: string;
  response_id: string;
  question_id: string;
  question_code?: string;
  likert_value: LikertRating;
  normalized_score?: number | null;
  text_value?: string | null;
  answered_at?: string;
  category?: string;
  subcategory?: string;
  sentiment?: string;
  priority?: string;
  impact?: string;
  analysis_status?: string;
}

export interface DimensionScoreResult {
  dimension_code: string;
  dimension_name: string;
  raw_score: number;
  normalized_score: number;
  answered_questions: number;
  na_questions: number;
  total_questions: number;
  classification: 'Crítico' | 'Atenção' | 'Regular' | 'Bom' | 'Muito bom';
}

export interface AggregatedQuestionStats {
  question_id: string;
  code: string;
  question: string;
  dimension_code: string;
  reverse_scoring: boolean;
  question_type: QuestionType;
  total_answers: number;
  na_count: number;
  valid_count: number;
  average_raw: number;
  average_normalized: number;
  distribution: {
    1: number; // percentage (0-100)
    2: number;
    3: number;
    4: number;
    5: number;
    na: number;
  };
  distribution_counts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    na: number;
  };
  is_critical: boolean;
  is_polarized: boolean;
}

export interface ClimateOverallReport {
  survey_id: string;
  total_eligible: number;
  total_responses: number;
  completed_responses: number;
  abandoned_responses: number;
  response_rate: number; // %
  abandonment_rate: number; // %
  general_climate_index: number; // 0-100
  general_classification: 'Crítico' | 'Atenção' | 'Regular' | 'Bom' | 'Muito bom';
  dimension_scores: DimensionScoreResult[];
  question_stats: AggregatedQuestionStats[];
  
  // Specific Indicators
  leadership_index: number;
  leadership_health_classification: 'Crítico' | 'Atenção' | 'Regular' | 'Bom' | 'Muito bom';
  communication_index: number;
  communication_noise_detected: boolean;
  productivity_quality_tension: boolean;
  retention_risk_level: 'Sinal de atenção elevado' | 'Atenção' | 'Moderado' | 'Favorável' | 'Muito favorável';
  retention_index: number;
  operator_voice_participation_rate: number;
  
  // High level alerts
  critical_questions_count: number;
  polarized_questions_count: number;
  divergences: string[];
}
