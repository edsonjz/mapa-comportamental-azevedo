import type {
  LikertRating,
  ClimateQuestion,
  ClimateAnswer,
  DimensionScoreResult,
  AggregatedQuestionStats,
  ClimateOverallReport
} from '../types/climateTypes';

/**
 * Calculates normalized score (0-100) for a Likert rating.
 * Positive questions: 1->0, 2->25, 3->50, 4->75, 5->100
 * Reverse questions:  1->100, 2->75, 3->50, 4->25, 5->0
 * N/A (null): returns null (MUST NOT be replaced by 0 or 3)
 */
export function calculateNormalizedScore(
  value: LikertRating,
  reverseScoring: boolean
): number | null {
  if (value === null || value === undefined || (value as any) === 'N/A' || (value as any) === 0) {
    return null;
  }

  const numericValue = Number(value);
  if (numericValue < 1 || numericValue > 5 || isNaN(numericValue)) {
    return null;
  }

  if (reverseScoring) {
    switch (numericValue) {
      case 1: return 100;
      case 2: return 75;
      case 3: return 50;
      case 4: return 25;
      case 5: return 0;
      default: return null;
    }
  } else {
    switch (numericValue) {
      case 1: return 0;
      case 2: return 25;
      case 3: return 50;
      case 4: return 75;
      case 5: return 100;
      default: return null;
    }
  }
}

/**
 * Classifies score from 0-100 into standard ranges
 */
export function getScoreClassification(
  score: number
): 'Crítico' | 'Atenção' | 'Regular' | 'Bom' | 'Muito bom' {
  if (score < 40) return 'Crítico';
  if (score < 60) return 'Atenção';
  if (score < 75) return 'Regular';
  if (score < 90) return 'Bom';
  return 'Muito bom';
}

/**
 * Classifies Retention Index into risk ranges
 */
export function getRetentionClassification(
  score: number
): 'Sinal de atenção elevado' | 'Atenção' | 'Moderado' | 'Favorável' | 'Muito favorável' {
  if (score < 40) return 'Sinal de atenção elevado';
  if (score < 60) return 'Atenção';
  if (score < 75) return 'Moderado';
  if (score < 90) return 'Favorável';
  return 'Muito favorável';
}

/**
 * Calculates single response scores across dimensions
 */
export function calculateResponseDimensionScores(
  questions: ClimateQuestion[],
  answers: ClimateAnswer[]
): Map<string, { raw_score: number; normalized_score: number; answered_questions: number; na_questions: number; total_questions: number }> {
  const answerMap = new Map<string, ClimateAnswer>();
  answers.forEach((ans) => answerMap.set(ans.question_id, ans));

  const dimensionMap = new Map<string, { totalScores: number[]; naCount: number; totalQuestions: number }>();

  questions.forEach((q) => {
    if (!dimensionMap.has(q.dimension_id)) {
      dimensionMap.set(q.dimension_id, { totalScores: [], naCount: 0, totalQuestions: 0 });
    }
    const dimData = dimensionMap.get(q.dimension_id)!;

    if (q.question_type === 'likert') {
      dimData.totalQuestions += 1;
      const ans = answerMap.get(q.id);
      const score = ans ? calculateNormalizedScore(ans.likert_value, q.reverse_scoring) : null;

      if (score !== null) {
        dimData.totalScores.push(score);
      } else {
        dimData.naCount += 1;
      }
    }
  });

  const result = new Map<string, { raw_score: number; normalized_score: number; answered_questions: number; na_questions: number; total_questions: number }>();

  dimensionMap.forEach((dimData, dimId) => {
    const answered = dimData.totalScores.length;
    const avgNormalized = answered > 0
      ? dimData.totalScores.reduce((acc, curr) => acc + curr, 0) / answered
      : 0;
    const avgRaw = (avgNormalized / 100) * 4 + 1; // 0-100 back to 1-5 scale

    result.set(dimId, {
      raw_score: Number(avgRaw.toFixed(2)),
      normalized_score: Number(avgNormalized.toFixed(2)),
      answered_questions: answered,
      na_questions: dimData.naCount,
      total_questions: dimData.totalQuestions
    });
  });

  return result;
}

/**
 * Calculates aggregated question statistics, polarization, critical alerts and overall report
 */
export function calculateAggregatedReport(
  surveyId: string,
  dimensions: { id: string; code: string; name: string }[],
  questions: ClimateQuestion[],
  allAnswers: ClimateAnswer[],
  totalEligible: number = 0,
  totalResponses: number = 0,
  completedResponses: number = 0,
  abandonedResponses: number = 0
): ClimateOverallReport {
  const answersByQuestion = new Map<string, ClimateAnswer[]>();
  allAnswers.forEach((ans) => {
    if (!answersByQuestion.has(ans.question_id)) {
      answersByQuestion.set(ans.question_id, []);
    }
    answersByQuestion.get(ans.question_id)!.push(ans);
  });

  const questionStats: AggregatedQuestionStats[] = [];

  questions.forEach((q) => {
    if (q.question_type !== 'likert') return;

    const qAnswers = answersByQuestion.get(q.id) || [];
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, na: 0 };
    let scoreSum = 0;
    let rawSum = 0;
    let validCount = 0;

    qAnswers.forEach((ans) => {
      const val = ans.likert_value;
      if (val === 1 || val === 2 || val === 3 || val === 4 || val === 5) {
        counts[val] += 1;
        const normScore = calculateNormalizedScore(val, q.reverse_scoring);
        if (normScore !== null) {
          scoreSum += normScore;
          rawSum += val;
          validCount += 1;
        }
      } else {
        counts.na += 1;
      }
    });

    const totalAns = qAnswers.length;
    const avgNorm = validCount > 0 ? scoreSum / validCount : 0;
    const avgRaw = validCount > 0 ? rawSum / validCount : 0;

    const distPct = {
      1: totalAns > 0 ? Number(((counts[1] / totalAns) * 100).toFixed(1)) : 0,
      2: totalAns > 0 ? Number(((counts[2] / totalAns) * 100).toFixed(1)) : 0,
      3: totalAns > 0 ? Number(((counts[3] / totalAns) * 100).toFixed(1)) : 0,
      4: totalAns > 0 ? Number(((counts[4] / totalAns) * 100).toFixed(1)) : 0,
      5: totalAns > 0 ? Number(((counts[5] / totalAns) * 100).toFixed(1)) : 0,
      na: totalAns > 0 ? Number(((counts.na / totalAns) * 100).toFixed(1)) : 0
    };

    // Negative response count calculation
    // For positive questions, negative responses are 1 & 2
    // For reverse questions, negative responses (negative perception) are 4 & 5
    const negativeCount = q.reverse_scoring ? counts[4] + counts[5] : counts[1] + counts[2];
    const negativePct = validCount > 0 ? (negativeCount / validCount) * 100 : 0;

    const isCritical = avgNorm < 50 || negativePct >= 40;

    // Polarization check: simultaneous concentration in low (1-2) and high (4-5)
    const lowPct = validCount > 0 ? ((counts[1] + counts[2]) / validCount) * 100 : 0;
    const highPct = validCount > 0 ? ((counts[4] + counts[5]) / validCount) * 100 : 0;
    const isPolarized = lowPct >= 25 && highPct >= 25;

    const dimObj = dimensions.find((d) => d.id === q.dimension_id);

    questionStats.push({
      question_id: q.id,
      code: q.code,
      question: q.question,
      dimension_code: dimObj?.code || '',
      reverse_scoring: q.reverse_scoring,
      question_type: q.question_type,
      total_answers: totalAns,
      na_count: counts.na,
      valid_count: validCount,
      average_raw: Number(avgRaw.toFixed(2)),
      average_normalized: Number(avgNorm.toFixed(2)),
      distribution: distPct,
      distribution_counts: counts,
      is_critical: isCritical,
      is_polarized: isPolarized
    });
  });

  // Calculate Dimension Scores
  const dimScoreResults: DimensionScoreResult[] = dimensions.map((dim) => {
    const dimQuestions = questionStats.filter((qs) => qs.dimension_code === dim.code);
    const validDimQs = dimQuestions.filter((qs) => qs.valid_count > 0);
    const avgScore = validDimQs.length > 0
      ? validDimQs.reduce((acc, curr) => acc + curr.average_normalized, 0) / validDimQs.length
      : 0;

    const answeredQs = dimQuestions.reduce((acc, curr) => acc + curr.valid_count, 0);
    const naQs = dimQuestions.reduce((acc, curr) => acc + curr.na_count, 0);
    const totalQs = dimQuestions.reduce((acc, curr) => acc + curr.total_answers, 0);

    const normScore = Number(avgScore.toFixed(2));
    const rawScore = Number(((normScore / 100) * 4 + 1).toFixed(2));

    return {
      dimension_code: dim.code,
      dimension_name: dim.name,
      raw_score: rawScore,
      normalized_score: normScore,
      answered_questions: answeredQs,
      na_questions: naQs,
      total_questions: totalQs,
      classification: getScoreClassification(normScore)
    };
  });

  // Calculate General Climate Index (using dimensions with >= 50% answered questions)
  const validDimensions = dimScoreResults.filter((ds) => ds.answered_questions > 0);
  const generalClimate = validDimensions.length > 0
    ? validDimensions.reduce((acc, curr) => acc + curr.normalized_score, 0) / validDimensions.length
    : 0;
  const roundedGeneral = Number(generalClimate.toFixed(2));

  // Specific Indicators:
  // Leadership Index (Dim 2 - LIDERANCA)
  const leadershipDim = dimScoreResults.find((d) => d.dimension_code === 'LIDERANCA');
  const leadershipIndex = leadershipDim ? leadershipDim.normalized_score : 0;
  const leadershipHealth = getScoreClassification(leadershipIndex);

  // Communication Index (Dim 6 - COMUNICACAO)
  const commDim = dimScoreResults.find((d) => d.dimension_code === 'COMUNICACAO');
  const commIndex = commDim ? commDim.normalized_score : 0;

  // Communication noise check (CI03 or CI04 negative perception)
  const ci03 = questionStats.find((q) => q.code === 'CI03');
  const ci04 = questionStats.find((q) => q.code === 'CI04');
  const commNoiseDetected = (ci03 && ci03.average_normalized < 50) || (ci04 && ci04.average_normalized < 50) || false;

  // Productivity vs Quality Tension (Q01, Q02, Q07, Q08, M03, M04, M05)
  const q01 = questionStats.find((q) => q.code === 'Q01')?.average_normalized || 100;
  const q02 = questionStats.find((q) => q.code === 'Q02')?.average_normalized || 100;
  const q07 = questionStats.find((q) => q.code === 'Q07')?.average_normalized || 100;
  const m05 = questionStats.find((q) => q.code === 'M05')?.average_normalized || 100;
  const qualityProductivityTension = q02 < 50 || q07 < 50 || m05 < 50 || (q01 < 60 && q02 < 60);

  // Retention Risk Indicator (Dim 7 + Motivação)
  const retentionDim = dimScoreResults.find((d) => d.dimension_code === 'RECONHECIMENTO_CARREIRA');
  const retentionIndex = retentionDim ? retentionDim.normalized_score : 0;
  const retentionRiskLevel = getRetentionClassification(retentionIndex);

  // Operator Voice Participation Rate (% of completed open questions)
  const openQuestions = questions.filter((q) => q.question_type === 'open_text');
  const openAnswersCount = allAnswers.filter((a) => a.text_value && a.text_value.trim().length > 0).length;
  const maxPossibleOpen = completedResponses * (openQuestions.length || 1);
  const operatorVoiceParticipationRate = maxPossibleOpen > 0
    ? Number(((openAnswersCount / maxPossibleOpen) * 100).toFixed(1))
    : 0;

  // Divergence Detection
  const divergences: string[] = [];
  if (leadershipIndex >= 75 && commIndex < 60) {
    divergences.push('Boa percepção da liderança, mas percepção significativamente inferior da comunicação interna.');
  }
  const qualDim = dimScoreResults.find((d) => d.dimension_code === 'QUALIDADE_ATENDIMENTO');
  const metasDim = dimScoreResults.find((d) => d.dimension_code === 'METAS_INDICADORES');
  if (qualDim && metasDim && qualDim.normalized_score >= 75 && metasDim.normalized_score < 60) {
    divergences.push('Boa percepção da qualidade do atendimento, porém percepção desfavorável em relação às metas e indicadores.');
  }
  if (qualityProductivityTension) {
    divergences.push('Foi identificada possível tensão entre produtividade e qualidade (pressão por TMA vs qualidade percebida).');
  }

  const responseRate = totalEligible > 0 ? Number(((completedResponses / totalEligible) * 100).toFixed(1)) : 0;
  const abandonmentRate = totalResponses > 0 ? Number(((abandonedResponses / totalResponses) * 100).toFixed(1)) : 0;

  return {
    survey_id: surveyId,
    total_eligible: totalEligible,
    total_responses: totalResponses,
    completed_responses: completedResponses,
    abandoned_responses: abandonedResponses,
    response_rate: responseRate,
    abandonment_rate: abandonmentRate,
    general_climate_index: roundedGeneral,
    general_classification: getScoreClassification(roundedGeneral),
    dimension_scores: dimScoreResults,
    question_stats: questionStats,
    leadership_index: leadershipIndex,
    leadership_health_classification: leadershipHealth,
    communication_index: commIndex,
    communication_noise_detected: commNoiseDetected,
    productivity_quality_tension: qualityProductivityTension,
    retention_risk_level: retentionRiskLevel,
    retention_index: retentionIndex,
    operator_voice_participation_rate: operatorVoiceParticipationRate,
    critical_questions_count: questionStats.filter((q) => q.is_critical).length,
    polarized_questions_count: questionStats.filter((q) => q.is_polarized).length,
    divergences
  };
}
