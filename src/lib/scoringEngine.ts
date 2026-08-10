import type { AssessmentScores } from '../types/database';
import { PROFILES_CATALOG, JOB_TARGET_PROFILES } from './profilesData';
import type { ProfileDetail } from './profilesData';

export function getFactorLevelLabel(score: number): string {
  if (score < 20) return 'Muito baixo';
  if (score < 40) return 'Baixo';
  if (score < 60) return 'Moderado';
  if (score < 80) return 'Alto';
  return 'Muito alto';
}

export function getFactorBadgeClass(score: number): string {
  if (score < 20) return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
  if (score < 40) return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
  if (score < 60) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
  if (score < 80) return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
}

export interface JobFitResult {
  jobTitle: string;
  compatibilityScore: number;
  opennessDiff: number;
  conscientiousnessDiff: number;
  extraversionDiff: number;
  agreeablenessDiff: number;
  emotionalStabilityDiff: number;
  recommendation: string;
}

export function calculateJobProfileCompatibility(scores: AssessmentScores, targetJobId: string): JobFitResult | null {
  const target = JOB_TARGET_PROFILES.find(j => j.id === targetJobId);
  if (!target) return null;

  const oDiff = Math.abs(scores.openness_score - target.expected_openness);
  const cDiff = Math.abs(scores.conscientiousness_score - target.expected_conscientiousness);
  const eDiff = Math.abs(scores.extraversion_score - target.expected_extraversion);
  const aDiff = Math.abs(scores.agreeableness_score - target.expected_agreeableness);
  const esDiff = Math.abs(scores.emotional_stability_score - target.expected_emotional_stability);

  // Mean absolute distance (max distance 100) -> Convert to compatibility %
  const avgDistance = (oDiff + cDiff + eDiff + aDiff + esDiff) / 5;
  const compatibilityScore = Math.max(0, Math.round(100 - avgDistance));

  let recommendation = 'Elevada aderência comportamental às exigências do cargo.';
  if (compatibilityScore < 60) {
    recommendation = 'Pode exigir maior acompanhamento inicial em competências específicas do cargo.';
  } else if (compatibilityScore < 80) {
    recommendation = 'Boa aderência com potencial de adaptação rápida.';
  }

  return {
    jobTitle: target.title,
    compatibilityScore,
    opennessDiff: Math.round(scores.openness_score - target.expected_openness),
    conscientiousnessDiff: Math.round(scores.conscientiousness_score - target.expected_conscientiousness),
    extraversionDiff: Math.round(scores.extraversion_score - target.expected_extraversion),
    agreeablenessDiff: Math.round(scores.agreeableness_score - target.expected_agreeableness),
    emotionalStabilityDiff: Math.round(scores.emotional_stability_score - target.expected_emotional_stability),
    recommendation
  };
}

export function getProfileDetails(profileName: string): ProfileDetail | null {
  return PROFILES_CATALOG[profileName] || null;
}
