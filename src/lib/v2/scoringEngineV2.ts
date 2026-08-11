/**
 * SCORING ENGINE V2 — Motor de cálculo multidimensional
 *
 * Calcula: Big Five (11 dim), RIASEC (6), Motivadores (8),
 * SJT (por função), Competências derivadas (10),
 * Confiabilidade, Fit (6+overall), Convergência/Tensão/Divergência,
 * Perguntas de entrevista, Recomendação final.
 */

import type { BehaviorQuestionWeight } from './behaviorQuestions';
import { V2_BEHAVIOR_QUESTIONS } from './behaviorQuestions';
import type { RiasecDimKey, MotivatorKey } from './riasecMotivationQuestions';
import { V2_RIASEC_MOTIVATION_QUESTIONS, V2_RIASEC_OPPORTUNITIES, RIASEC_DIMENSION_NAMES, MOTIVATOR_NAMES } from './riasecMotivationQuestions';
import { SJT_QUESTIONS_BY_JOB } from './sjtQuestions';
import type { V2JobProfile } from './jobProfilesV2';
import { V2_JOB_PROFILES, getV2JobProfile } from './jobProfilesV2';

// ─── Types ───

export interface V2AnswerInput {
  questionCode: string;
  selectedOption: string; // 'A' | 'B' | 'C' | 'D'
  responseTimeMs?: number;
}

export interface BehaviorScores {
  O: number; C: number; E: number; A: number; ES: number;
  AD: number; RA: number; MS: number; OR: number; AS: number; FC: number;
}

export interface RiasecScores {
  R: number; I: number; A: number; S: number; E: number; C: number;
  primaryCode: RiasecDimKey;
  secondaryCode: RiasecDimKey;
  tertiaryCode: RiasecDimKey;
  riasecCode: string; // "S-I-C"
}

export interface MotivationScores {
  AUT: number; EST: number; DES: number; REC: number;
  CHA: number; REL: number; ESTR: number; RES: number;
  topMotivators: { key: string; name: string; score: number }[];
}

export interface SjtScores {
  jobId: string;
  rawScore: number;
  maxScore: number;
  normalizedScore: number;
  competencyBreakdown: Record<string, number>;
}

export interface CompetencyScores {
  assertividade: number;
  tomada_decisao: number;
  gestao_conflitos: number;
  accountability: number;
  orientacao_resultado: number;
  disciplina_operacional: number;
  flexibilidade_cognitiva: number;
  tolerancia_ambiguidade: number;
  agilidade_aprendizagem: number;
  escuta_ativa: number;
}

export interface ReliabilityResult {
  score: number;
  classification: string;
  flags: string[];
  details: Record<string, any>;
}

export interface AlignmentItem {
  type: 'convergencia' | 'tensao' | 'divergencia';
  title: string;
  description: string;
  recommendation: string;
}

export interface FitResult {
  jobId: string;
  jobName: string;
  personalityFit: number;
  behaviorFit: number;
  interestFit: number;
  motivationFit: number;
  sjtFit: number;
  competencyFit: number;
  overallFit: number;
  fitClassification: string;
  hasSjtSpecific: boolean;
  convergences: AlignmentItem[];
  tensions: AlignmentItem[];
  divergences: AlignmentItem[];
}

export interface InterviewRecommendation {
  strengths: { name: string; score: number }[];
  attentionPoints: { name: string; candidateScore: number; requiredScore: number }[];
  adaptationRisks: string[];
  competenciesToDevelop: string[];
  interviewQuestions: string[];
  recommendationText: string;
  potentialText: string;
}

export interface V2AssessmentResult {
  behavior: BehaviorScores;
  riasec: RiasecScores;
  motivation: MotivationScores;
  sjt: SjtScores;
  competencies: CompetencyScores;
  reliability: ReliabilityResult;
  primaryFit: FitResult;
  crossFits: FitResult[];
  interview: InterviewRecommendation;
}

// ─── Utilities ───

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function calcDimensionFit(candidateScore: number, requiredScore: number): number {
  const diff = Math.abs(candidateScore - requiredScore);
  return clamp(100 - diff);
}

function weightedAvgFit(scores: Record<string, number>, weights: Record<string, number>): number {
  const keys = Object.keys(weights);
  if (keys.length === 0) return 0;
  let totalWeight = 0;
  let weightedSum = 0;
  for (const key of keys) {
    const w = weights[key] ?? 50;
    const s = scores[key] ?? 50;
    // Weight by importance: higher requirement = more weight in fit
    const importance = w / 100;
    const fit = calcDimensionFit(s, w);
    weightedSum += fit * importance;
    totalWeight += importance;
  }
  return totalWeight > 0 ? clamp(weightedSum / totalWeight) : 50;
}

// ─── 1. Behavior Scores ───

export function calculateBehaviorScores(answers: V2AnswerInput[]): BehaviorScores {
  const raw: BehaviorScores = { O: 0, C: 0, E: 0, A: 0, ES: 0, AD: 0, RA: 0, MS: 0, OR: 0, AS: 0, FC: 0 };
  const maxRaw: BehaviorScores = { O: 0, C: 0, E: 0, A: 0, ES: 0, AD: 0, RA: 0, MS: 0, OR: 0, AS: 0, FC: 0 };

  for (const q of V2_BEHAVIOR_QUESTIONS) {
    // Calculate max possible for each dimension from this question
    const allWeights = [q.weightsA, q.weightsB];
    for (const w of allWeights) {
      for (const [dim, val] of Object.entries(w)) {
        if (dim in maxRaw) {
          maxRaw[dim as keyof BehaviorScores] += val as number;
        }
      }
    }
  }

  // Recalculate max: for each question, max is the higher weight between A and B for each dim
  const maxPossible: BehaviorScores = { O: 0, C: 0, E: 0, A: 0, ES: 0, AD: 0, RA: 0, MS: 0, OR: 0, AS: 0, FC: 0 };
  for (const q of V2_BEHAVIOR_QUESTIONS) {
    const dims = new Set([...Object.keys(q.weightsA), ...Object.keys(q.weightsB)]);
    for (const dim of dims) {
      const va = (q.weightsA as any)[dim] ?? 0;
      const vb = (q.weightsB as any)[dim] ?? 0;
      maxPossible[dim as keyof BehaviorScores] += Math.max(va, vb);
    }
  }

  // Accumulate raw scores from answers
  for (const ans of answers) {
    const q = V2_BEHAVIOR_QUESTIONS.find(q => q.code === ans.questionCode);
    if (!q) continue;
    const weights: BehaviorQuestionWeight = ans.selectedOption === 'A' ? q.weightsA : q.weightsB;
    for (const [dim, val] of Object.entries(weights)) {
      if (dim in raw) {
        raw[dim as keyof BehaviorScores] += val as number;
      }
    }
  }

  // Normalize to 0-100
  const normalized: BehaviorScores = { O: 0, C: 0, E: 0, A: 0, ES: 0, AD: 0, RA: 0, MS: 0, OR: 0, AS: 0, FC: 0 };
  for (const dim of Object.keys(normalized) as (keyof BehaviorScores)[]) {
    const max = maxPossible[dim];
    normalized[dim] = max > 0 ? clamp((raw[dim] / max) * 100) : 50;
  }

  return normalized;
}

// ─── 2. RIASEC Scores ───

export function calculateRiasecScores(answers: V2AnswerInput[]): RiasecScores {
  const counts: Record<RiasecDimKey, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  for (const ans of answers) {
    const q = V2_RIASEC_MOTIVATION_QUESTIONS.find(q => q.code === ans.questionCode);
    if (!q || q.type !== 'riasec') continue;
    const dim = ans.selectedOption === 'A' ? q.dimensionA : q.dimensionB;
    if (dim in counts) {
      counts[dim as RiasecDimKey] += 1;
    }
  }

  const normalized: Record<RiasecDimKey, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  for (const dim of Object.keys(normalized) as RiasecDimKey[]) {
    const opp = V2_RIASEC_OPPORTUNITIES[dim];
    // Ensure minimum score of 10 if candidate answered questions for this dimension
    const rawPct = opp > 0 ? (counts[dim] / opp) * 100 : 0;
    normalized[dim] = clamp(Math.max(rawPct, opp > 0 && counts[dim] === 0 ? 8 : rawPct));
  }

  // Sort descending
  const sorted = (Object.keys(normalized) as RiasecDimKey[]).sort(
    (a, b) => normalized[b] - normalized[a]
  );

  return {
    ...normalized,
    primaryCode: sorted[0],
    secondaryCode: sorted[1],
    tertiaryCode: sorted[2],
    riasecCode: `${sorted[0]}-${sorted[1]}-${sorted[2]}`
  };
}

// ─── 3. Motivation Scores ───

export function calculateMotivationScores(answers: V2AnswerInput[]): MotivationScores {
  const counts: Record<MotivatorKey, number> = {
    AUT: 0, EST: 0, DES: 0, REC: 0, CHA: 0, REL: 0, ESTR: 0, RES: 0
  };
  const opportunities: Record<MotivatorKey, number> = {
    AUT: 0, EST: 0, DES: 0, REC: 0, CHA: 0, REL: 0, ESTR: 0, RES: 0
  };

  for (const q of V2_RIASEC_MOTIVATION_QUESTIONS.filter(q => q.type === 'motivator')) {
    opportunities[q.dimensionA as MotivatorKey] = (opportunities[q.dimensionA as MotivatorKey] || 0) + 1;
    opportunities[q.dimensionB as MotivatorKey] = (opportunities[q.dimensionB as MotivatorKey] || 0) + 1;
  }

  for (const ans of answers) {
    const q = V2_RIASEC_MOTIVATION_QUESTIONS.find(q => q.code === ans.questionCode);
    if (!q || q.type !== 'motivator') continue;
    const dim = ans.selectedOption === 'A' ? q.dimensionA : q.dimensionB;
    if (dim in counts) {
      counts[dim as MotivatorKey] += 1;
    }
  }

  const scores: Record<MotivatorKey, number> = {
    AUT: 0, EST: 0, DES: 0, REC: 0, CHA: 0, REL: 0, ESTR: 0, RES: 0
  };

  for (const dim of Object.keys(scores) as MotivatorKey[]) {
    const opp = opportunities[dim];
    if (opp > 0) {
      scores[dim] = clamp((counts[dim] / opp) * 100);
    } else {
      // Derive from related dimensions
      if (dim === 'REC') scores[dim] = 50; // neutral
      if (dim === 'CHA') scores[dim] = scores.DES > 0 ? clamp(scores.DES * 0.8) : 50;
    }
  }

  // Top motivators
  const sorted = (Object.keys(scores) as MotivatorKey[])
    .map(k => ({ key: k, name: MOTIVATOR_NAMES[k], score: scores[k] }))
    .sort((a, b) => b.score - a.score);

  return {
    ...scores,
    topMotivators: sorted.slice(0, 3)
  };
}

// ─── 4. SJT Scores ───

export function calculateSjtScores(answers: V2AnswerInput[], jobId: string): SjtScores {
  const questions = SJT_QUESTIONS_BY_JOB[jobId] || [];
  const maxScore = questions.length * 3;
  let rawScore = 0;
  const competencyCounts: Record<string, { total: number; max: number }> = {};

  for (const q of questions) {
    // Track all competencies this question evaluates
    for (const comp of q.evaluates) {
      if (!competencyCounts[comp]) competencyCounts[comp] = { total: 0, max: 0 };
      competencyCounts[comp].max += 3;
    }
  }

  for (const ans of answers) {
    const q = questions.find(q => q.code === ans.questionCode);
    if (!q) continue;
    const opt = q.options.find(o => o.key === ans.selectedOption);
    if (!opt) continue;
    rawScore += opt.score;
    for (const comp of q.evaluates) {
      if (competencyCounts[comp]) {
        competencyCounts[comp].total += opt.score;
      }
    }
  }

  const competencyBreakdown: Record<string, number> = {};
  for (const [comp, data] of Object.entries(competencyCounts)) {
    competencyBreakdown[comp] = data.max > 0 ? clamp((data.total / data.max) * 100) : 0;
  }

  return {
    jobId,
    rawScore,
    maxScore,
    normalizedScore: maxScore > 0 ? clamp((rawScore / maxScore) * 100) : 0,
    competencyBreakdown
  };
}

// ─── 5. Competency Scores (derived) ───

export function calculateCompetencyScores(
  behavior: BehaviorScores,
  sjt: SjtScores
): CompetencyScores {
  const sjtComp = sjt.competencyBreakdown;

  return {
    assertividade: clamp((behavior.AS * 0.5) + ((sjtComp.assertividade ?? 50) * 0.5)),
    tomada_decisao: clamp(
      (behavior.C * 0.2) + (behavior.FC * 0.2) + (behavior.OR * 0.1) +
      ((sjtComp.tomada_decisao ?? sjtComp.julgamento ?? 50) * 0.5)
    ),
    gestao_conflitos: clamp(
      (behavior.MS * 0.2) + (behavior.ES * 0.15) + (behavior.AS * 0.15) +
      ((sjtComp.gestao_conflitos ?? 50) * 0.5)
    ),
    accountability: clamp(
      (behavior.C * 0.25) + (behavior.MS * 0.1) + (behavior.OR * 0.15) +
      ((sjtComp.responsabilidade ?? 50) * 0.5)
    ),
    orientacao_resultado: clamp(
      (behavior.C * 0.2) + (behavior.OR * 0.2) + (behavior.AS * 0.1) +
      ((sjtComp.orientacao_resultado ?? sjtComp.resolução ?? 50) * 0.5)
    ),
    disciplina_operacional: clamp(
      (behavior.C * 0.25) + (behavior.OR * 0.25) +
      ((sjtComp.disciplina ?? sjtComp.procedimento ?? sjtComp.disciplina_operacional ?? 50) * 0.5)
    ),
    flexibilidade_cognitiva: clamp(
      (behavior.FC * 0.3) + (behavior.O * 0.15) + (behavior.AD * 0.15) +
      ((sjtComp.flexibilidade ?? sjtComp.julgamento ?? 50) * 0.4)
    ),
    tolerancia_ambiguidade: calculateAmbiguityTolerance(behavior, sjt),
    agilidade_aprendizagem: clamp(
      (behavior.O * 0.25) + (behavior.AD * 0.2) + (behavior.FC * 0.15) +
      ((sjtComp.aprendizagem ?? 50) * 0.4)
    ),
    escuta_ativa: clamp(
      (behavior.A * 0.2) + (behavior.MS * 0.2) + (behavior.ES * 0.1) +
      ((sjtComp.escuta ?? 50) * 0.5)
    )
  };
}

function calculateAmbiguityTolerance(behavior: BehaviorScores, sjt: SjtScores): number {
  const sjtAvg = sjt.normalizedScore;
  return clamp(
    (behavior.O * 0.25) + (behavior.FC * 0.25) + (behavior.AD * 0.20) +
    (sjtAvg * 0.20) + (50 * 0.10) // DES motivator placeholder
  );
}

// ─── 6. Reliability ───

export function calculateReliability(
  behaviorAnswers: V2AnswerInput[],
  riasecAnswers: V2AnswerInput[],
  sjtAnswers: V2AnswerInput[],
  behavior: BehaviorScores,
  riasec: RiasecScores
): ReliabilityResult {
  const flags: string[] = [];
  let penaltyScore = 0;

  // 1. Check response speed (too fast = potentially random)
  const allAnswers = [...behaviorAnswers, ...riasecAnswers, ...sjtAnswers];
  const answersWithTime = allAnswers.filter(a => a.responseTimeMs != null && a.responseTimeMs > 0);
  if (answersWithTime.length > 0) {
    const avgTime = answersWithTime.reduce((s, a) => s + (a.responseTimeMs || 0), 0) / answersWithTime.length;
    const fastCount = answersWithTime.filter(a => (a.responseTimeMs || 0) < 2000).length;
    const fastPct = fastCount / answersWithTime.length;

    if (avgTime < 3000) {
      flags.push('tempo_medio_muito_rapido');
      penaltyScore += 20;
    } else if (avgTime < 5000) {
      flags.push('tempo_medio_rapido');
      penaltyScore += 8;
    }

    if (fastPct > 0.5) {
      flags.push('muitas_respostas_rapidas');
      penaltyScore += 15;
    }
  }

  // 2. Check for all-same pattern (all A or all B)
  const behaviorOptions = behaviorAnswers.map(a => a.selectedOption);
  const allSame = behaviorOptions.length > 0 && behaviorOptions.every(o => o === behaviorOptions[0]);
  if (allSame && behaviorOptions.length >= 10) {
    flags.push('padrao_respostas_identicas');
    penaltyScore += 25;
  }

  // 3. Check for contradictions between correlated dimensions
  // High Amability + Low Social Maturity is unusual
  if (behavior.A >= 80 && behavior.MS < 35) {
    flags.push('inconsistencia_amabilidade_maturidade');
    penaltyScore += 10;
  }
  // High Resilience + Low Emotional Stability is contradictory
  if (behavior.RA >= 80 && behavior.ES < 30) {
    flags.push('inconsistencia_resiliencia_estabilidade');
    penaltyScore += 12;
  }
  // High Operational Orientation + Low Conscientiousness is unusual
  if (behavior.OR >= 80 && behavior.C < 30) {
    flags.push('inconsistencia_orientacao_conscienciosidade');
    penaltyScore += 8;
  }

  // 4. Social desirability check
  // All dimensions above 80 is suspicious
  const allDims = [behavior.O, behavior.C, behavior.E, behavior.A, behavior.ES,
    behavior.AD, behavior.RA, behavior.MS, behavior.OR, behavior.AS, behavior.FC];
  const highCount = allDims.filter(d => d >= 80).length;
  if (highCount >= 9) {
    flags.push('possivel_desejabilidade_social');
    penaltyScore += 15;
  }

  // 5. Cross-module coherence
  // High RIASEC Social + Low Amability = tension (not necessarily bad, but note)
  if (riasec.S >= 80 && behavior.A < 40) {
    flags.push('tensao_riasec_social_baixa_amabilidade');
    penaltyScore += 5;
  }

  const reliabilityScore = clamp(100 - penaltyScore);
  let classification: string;
  if (reliabilityScore >= 85) classification = 'Os resultados apresentam alta consistência.';
  else if (reliabilityScore >= 70) classification = 'Os resultados apresentam consistência moderada.';
  else if (reliabilityScore >= 55) classification = 'Os resultados apresentam algumas inconsistências que recomendam aprofundamento em entrevista.';
  else classification = 'Os resultados apresentam inconsistências significativas que recomendam aprofundamento detalhado em entrevista.';

  return {
    score: reliabilityScore,
    classification,
    flags,
    details: {
      answersWithTimeCount: answersWithTime.length,
      totalAnswers: allAnswers.length,
      penaltyApplied: penaltyScore
    }
  };
}

// ─── 7. Fit Calculation ───

export function calculateFit(
  behavior: BehaviorScores,
  riasec: RiasecScores,
  motivation: MotivationScores,
  sjt: SjtScores | null,
  competencies: CompetencyScores,
  jobProfile: V2JobProfile,
  hasSjtSpecific: boolean
): FitResult {
  const req = jobProfile.requirements;
  const fw = req.fit_formula_weights;

  // Personality Fit (Big Five)
  const personalityFit = weightedAvgFit(
    { O: behavior.O, C: behavior.C, E: behavior.E, A: behavior.A, ES: behavior.ES },
    req.big_five_weights
  );

  // Behavior Fit
  const behaviorFit = weightedAvgFit(
    { AD: behavior.AD, RA: behavior.RA, MS: behavior.MS, OR: behavior.OR, AS: behavior.AS, FC: behavior.FC },
    req.behavior_weights
  );

  // Interest Fit (RIASEC)
  const interestFit = weightedAvgFit(
    { R: riasec.R, I: riasec.I, A: riasec.A, S: riasec.S, E: riasec.E, C: riasec.C },
    req.riasec_weights
  );

  // Motivation Fit
  const motivationFit = weightedAvgFit(
    { AUT: motivation.AUT, EST: motivation.EST, DES: motivation.DES, REC: motivation.REC,
      CHA: motivation.CHA, REL: motivation.REL, ESTR: motivation.ESTR, RES: motivation.RES },
    req.motivator_weights
  );

  // SJT Fit
  const sjtFit = sjt ? sjt.normalizedScore : 50; // neutral if no specific SJT

  // Competency Fit
  const competencyFit = weightedAvgFit(
    competencies as any,
    req.competency_weights as any
  );

  // Overall Fit (weighted formula from job profile)
  const sjtWeight = hasSjtSpecific ? fw.sjt : fw.sjt * 0.3; // Reduce SJT weight if not specific
  const redistributedWeight = hasSjtSpecific ? 0 : fw.sjt * 0.7;
  const adjustedWeights = {
    personality: fw.personality + redistributedWeight * 0.3,
    behavior: fw.behavior + redistributedWeight * 0.3,
    interest: fw.interest + redistributedWeight * 0.15,
    motivation: fw.motivation + redistributedWeight * 0.1,
    sjt: sjtWeight,
    competency: fw.competency + redistributedWeight * 0.15
  };

  const overallFit = clamp(
    personalityFit * adjustedWeights.personality +
    behaviorFit * adjustedWeights.behavior +
    interestFit * adjustedWeights.interest +
    motivationFit * adjustedWeights.motivation +
    sjtFit * adjustedWeights.sjt +
    competencyFit * adjustedWeights.competency
  );

  const fitClassification = getFitClassification(overallFit);

  // Alignment analysis
  const { convergences, tensions, divergences } = analyzeAlignment(
    behavior, riasec, competencies
  );

  return {
    jobId: jobProfile.id,
    jobName: jobProfile.name,
    personalityFit, behaviorFit, interestFit, motivationFit,
    sjtFit, competencyFit, overallFit, fitClassification,
    hasSjtSpecific,
    convergences, tensions, divergences
  };
}

export function getFitClassification(score: number): string {
  if (score >= 90) return 'Aderência muito alta';
  if (score >= 80) return 'Aderência alta';
  if (score >= 70) return 'Aderência moderada/alta';
  if (score >= 60) return 'Aderência moderada';
  if (score >= 50) return 'Aderência baixa/moderada';
  return 'Baixa aderência';
}

// ─── 8. Alignment Analysis ───

function analyzeAlignment(
  behavior: BehaviorScores,
  riasec: RiasecScores,
  competencies: CompetencyScores
): { convergences: AlignmentItem[]; tensions: AlignmentItem[]; divergences: AlignmentItem[] } {
  const convergences: AlignmentItem[] = [];
  const tensions: AlignmentItem[] = [];
  const divergences: AlignmentItem[] = [];

  // Convergência: Social + Amabilidade + Maturidade Social
  if (riasec.S >= 65 && behavior.A >= 65 && behavior.MS >= 65) {
    convergences.push({
      type: 'convergencia',
      title: 'Forte convergência para atividades de relacionamento e atendimento',
      description: 'Interesse social elevado, amabilidade alta e maturidade social consistente apontam na mesma direção.',
      recommendation: 'Potencial para funções que dependam de empatia, escuta e acolhimento.'
    });
  }

  // Convergência: Investigativo + Conscienciosidade + Orientação Operacional
  if (riasec.I >= 60 && behavior.C >= 65 && behavior.OR >= 65) {
    convergences.push({
      type: 'convergencia',
      title: 'Convergência analítica e processual',
      description: 'Interesse investigativo aliado a conscienciosidade e orientação operacional elevadas.',
      recommendation: 'Aptidão para funções de monitoria, auditoria e análise de qualidade.'
    });
  }

  // Convergência: Empreendedor + Assertividade + Extroversão
  if (riasec.E >= 60 && behavior.AS >= 65 && behavior.E >= 60) {
    convergences.push({
      type: 'convergencia',
      title: 'Convergência para liderança e orientação a resultados',
      description: 'Interesse empreendedor, assertividade e extroversão convergem para perfil de gestão.',
      recommendation: 'Potencial para supervisão, coordenação e funções de liderança.'
    });
  }

  if (convergences.length === 0) {
    convergences.push({
      type: 'convergencia',
      title: 'Perfil equilibrado',
      description: 'O candidato apresenta perfil sem extremos comportamentais, com flexibilidade para diferentes contextos.',
      recommendation: 'Apto para posições que exijam adaptabilidade e multifuncionalidade.'
    });
  }

  // Tensão: RIASEC Convencional alto + Conscienciosidade baixa
  if (riasec.C >= 60 && behavior.C < 50) {
    tensions.push({
      type: 'tensao',
      title: 'Tensão entre interesse por processos e rigor comportamental',
      description: 'Interesse por ambientes estruturados (RIASEC Convencional), mas menor tendência comportamental para seguir rotinas rígidas.',
      recommendation: 'Aprofundar em entrevista: verificar se consegue manter disciplina em rotinas diárias.'
    });
  }

  // Tensão: RIASEC Social alto + Extroversão baixa
  if (riasec.S >= 60 && behavior.E < 40) {
    tensions.push({
      type: 'tensao',
      title: 'Tensão: interesse relacional com perfil reservado',
      description: 'Gosta de ajudar pessoas, mas possui estilo pessoal mais reservado.',
      recommendation: 'Pode ser excelente em canais escritos (chat, e-mail) onde a escuta supera a extroversão.'
    });
  }

  // Tensão: Interesse por liderança + baixa assertividade
  if (riasec.E >= 60 && behavior.AS < 45) {
    tensions.push({
      type: 'tensao',
      title: 'Tensão: interesse por liderança com menor assertividade',
      description: 'Demonstra interesse por influência e resultados, mas assertividade comportamental abaixo do esperado.',
      recommendation: 'Investigar capacidade de cobrança e posicionamento firme em situações de conflito.'
    });
  }

  // Divergência: Estabilidade + Resiliência baixas
  if (behavior.ES < 40 && behavior.RA < 45) {
    divergences.push({
      type: 'divergencia',
      title: 'Vulnerabilidade potencial a ambientes de alta pressão',
      description: 'Estabilidade emocional e resiliência abaixo do esperado indicam sensibilidade a situações de estresse.',
      recommendation: 'Recomendar entrevista focada em autocontrole e estratégias de autorregulação.'
    });
  }

  // Divergência: Interesse declarado vs comportamento oposto
  if (riasec.E >= 70 && behavior.AS < 35 && competencies.tomada_decisao < 40) {
    divergences.push({
      type: 'divergencia',
      title: 'Divergência entre interesse declarado e padrão comportamental',
      description: 'Forte interesse por liderança, mas assertividade e tomada de decisão abaixo do esperado.',
      recommendation: 'Aprofundar significativamente em entrevista. Considerar estágio de desenvolvimento.'
    });
  }

  return { convergences, tensions, divergences };
}

// ─── 9. Interview Questions Generator ───

export function generateInterviewQuestions(
  behavior: BehaviorScores,
  jobProfile: V2JobProfile
): string[] {
  const questions: string[] = [];
  const req = jobProfile.requirements;

  // Generate questions based on biggest gaps
  const gaps: { name: string; gap: number }[] = [];

  // Check behavior gaps
  const behaviorMap: Record<string, { candidate: number; label: string }> = {
    AS: { candidate: behavior.AS, label: 'assertividade' },
    OR: { candidate: behavior.OR, label: 'orientação operacional' },
    RA: { candidate: behavior.RA, label: 'resiliência' },
    MS: { candidate: behavior.MS, label: 'maturidade social' },
    AD: { candidate: behavior.AD, label: 'adaptabilidade' },
    FC: { candidate: behavior.FC, label: 'flexibilidade cognitiva' },
    ES: { candidate: behavior.ES, label: 'estabilidade emocional' },
    C: { candidate: behavior.C, label: 'conscienciosidade' },
  };

  for (const [key, val] of Object.entries(behaviorMap)) {
    const reqVal = (req.behavior_weights as any)[key] ?? (req.big_five_weights as any)[key] ?? 50;
    if (val.candidate < reqVal - 15) {
      gaps.push({ name: val.label, gap: reqVal - val.candidate });
    }
  }

  gaps.sort((a, b) => b.gap - a.gap);

  const questionBank: Record<string, string[]> = {
    'assertividade': [
      'Conte uma situação em que você precisou cobrar alguém com quem tinha bom relacionamento.',
      'Como você reage quando precisa defender uma posição impopular diante de um grupo?'
    ],
    'orientação operacional': [
      'Conte uma situação em que você precisou acompanhar uma rotina repetitiva por um período prolongado.',
      'Como você lida com a necessidade de seguir procedimentos detalhados todos os dias?'
    ],
    'resiliência': [
      'Como você reage quando recebe várias críticas ou cobranças em sequência?',
      'Descreva um período em que enfrentou muita pressão no trabalho. Como administrou?'
    ],
    'maturidade social': [
      'Conte sobre uma situação em que precisou mediar um conflito entre colegas.',
      'Como você age quando percebe que um colega está passando por dificuldades?'
    ],
    'adaptabilidade': [
      'Descreva uma situação em que tudo mudou de última hora. Como se adaptou?',
      'Como você lida quando precisa aprender algo novo sem aviso prévio?'
    ],
    'flexibilidade cognitiva': [
      'Conte sobre uma situação complexa em que precisou encontrar uma solução criativa.',
      'Como você procede quando recebe informações contraditórias e precisa tomar uma decisão?'
    ],
    'estabilidade emocional': [
      'Como você se recupera após uma situação de muito estresse no trabalho?',
      'Descreva como mantém a calma em situações de pressão intensa.'
    ],
    'conscienciosidade': [
      'Como você organiza suas atividades quando tem muitas tarefas simultâneas?',
      'Conte sobre uma situação em que sua organização foi decisiva para um bom resultado.'
    ]
  };

  for (const gap of gaps.slice(0, 5)) {
    const bankQuestions = questionBank[gap.name];
    if (bankQuestions && bankQuestions.length > 0) {
      questions.push(bankQuestions[0]);
    }
  }

  // Ensure at least 5 questions
  if (questions.length < 5) {
    const genericQuestions = [
      'Qual foi o maior desafio profissional que você enfrentou e como o superou?',
      'Como você se descreveria em situações de trabalho sob pressão?',
      'O que você valoriza em um ambiente de trabalho?',
      'Conte sobre um feedback difícil que recebeu. Como reagiu?',
      'Como você equilibra produtividade e qualidade no dia a dia?'
    ];
    for (const q of genericQuestions) {
      if (questions.length >= 5) break;
      if (!questions.includes(q)) questions.push(q);
    }
  }

  return questions.slice(0, 5);
}

// ─── 10. Interview Recommendation ───

export function generateInterviewRecommendation(
  behavior: BehaviorScores,
  riasec: RiasecScores,
  competencies: CompetencyScores,
  fit: FitResult,
  jobProfile: V2JobProfile
): InterviewRecommendation {
  const req = jobProfile.requirements;

  // Top 5 strengths (highest scores relative to job requirement)
  const allDimensions: { name: string; score: number; required: number }[] = [
    { name: 'Resiliência', score: behavior.RA, required: req.behavior_weights.RA },
    { name: 'Maturidade Social', score: behavior.MS, required: req.behavior_weights.MS },
    { name: 'Adaptabilidade', score: behavior.AD, required: req.behavior_weights.AD },
    { name: 'Assertividade', score: behavior.AS, required: req.behavior_weights.AS },
    { name: 'Flexibilidade Cognitiva', score: behavior.FC, required: req.behavior_weights.FC },
    { name: 'Orientação Operacional', score: behavior.OR, required: req.behavior_weights.OR },
    { name: 'Conscienciosidade', score: behavior.C, required: req.big_five_weights.C },
    { name: 'Estabilidade Emocional', score: behavior.ES, required: req.big_five_weights.ES },
    { name: 'Amabilidade', score: behavior.A, required: req.big_five_weights.A },
    { name: 'Extroversão', score: behavior.E, required: req.big_five_weights.E },
    { name: 'Abertura', score: behavior.O, required: req.big_five_weights.O },
    { name: `Interesse ${RIASEC_DIMENSION_NAMES[riasec.primaryCode]}`, score: riasec[riasec.primaryCode], required: 50 },
    { name: 'Escuta Ativa', score: competencies.escuta_ativa, required: req.competency_weights.escuta_ativa },
    { name: 'Tomada de Decisão', score: competencies.tomada_decisao, required: req.competency_weights.tomada_decisao },
  ];

  const strengths = allDimensions
    .filter(d => d.score >= 65)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const attentionPoints = allDimensions
    .filter(d => d.score < d.required - 10)
    .sort((a, b) => (b.required - b.score) - (a.required - a.score))
    .slice(0, 5)
    .map(d => ({ name: d.name, candidateScore: d.score, requiredScore: d.required }));

  const adaptationRisks: string[] = [];
  if (behavior.ES < 45 && behavior.RA < 50) {
    adaptationRisks.push('Pode apresentar dificuldade em ambientes de alta pressão contínua.');
  }
  if (behavior.OR < 45 && req.behavior_weights.OR >= 80) {
    adaptationRisks.push('Pode necessitar de acompanhamento para manutenção de rotinas operacionais rígidas.');
  }
  if (behavior.AS < 45 && req.behavior_weights.AS >= 80) {
    adaptationRisks.push('Pode apresentar dificuldade em situações que exijam posicionamento firme.');
  }

  const competenciesToDevelop: string[] = [];
  const compEntries = Object.entries(competencies) as [string, number][];
  const compReq = req.competency_weights as any;
  for (const [key, val] of compEntries) {
    if (val < (compReq[key] ?? 50) - 15) {
      const nameMap: Record<string, string> = {
        assertividade: 'Assertividade',
        tomada_decisao: 'Tomada de Decisão',
        gestao_conflitos: 'Gestão de Conflitos',
        accountability: 'Accountability',
        orientacao_resultado: 'Orientação para Resultado',
        disciplina_operacional: 'Disciplina Operacional',
        flexibilidade_cognitiva: 'Flexibilidade Cognitiva',
        tolerancia_ambiguidade: 'Tolerância à Ambiguidade',
        agilidade_aprendizagem: 'Agilidade de Aprendizagem',
        escuta_ativa: 'Escuta Ativa'
      };
      competenciesToDevelop.push(nameMap[key] || key);
    }
  }

  const interviewQuestions = generateInterviewQuestions(behavior, jobProfile);

  // Recommendation text
  const fitLevel = fit.fitClassification.toLowerCase();
  const topStrengthNames = strengths.slice(0, 3).map(s => s.name.toLowerCase()).join(', ');
  const topAttentionNames = attentionPoints.slice(0, 2).map(a => a.name.toLowerCase()).join(' e ');

  let recommendationText = `O perfil apresenta ${fitLevel} à função de ${jobProfile.name}`;
  if (strengths.length > 0) {
    recommendationText += `, especialmente nas dimensões de ${topStrengthNames}`;
  }
  if (attentionPoints.length > 0) {
    recommendationText += `. Entretanto, foram identificados pontos de atenção relacionados a ${topAttentionNames}, que devem ser validados por meio de entrevista estruturada e/ou simulação prática`;
  }
  recommendationText += '.';

  const potentialText = strengths.length >= 3
    ? `Maior potencial identificado nas áreas de ${strengths.slice(0, 3).map(s => s.name).join(', ')}.`
    : 'Perfil com potencial a ser investigado em entrevista.';

  return {
    strengths: strengths.map(s => ({ name: s.name, score: s.score })),
    attentionPoints,
    adaptationRisks,
    competenciesToDevelop,
    interviewQuestions,
    recommendationText,
    potentialText
  };
}

// ─── 11. Full Assessment Pipeline ───

export function calculateFullV2Assessment(
  behaviorAnswers: V2AnswerInput[],
  riasecMotivationAnswers: V2AnswerInput[],
  sjtAnswers: V2AnswerInput[],
  targetJobId: string
): V2AssessmentResult {
  const jobProfile = getV2JobProfile(targetJobId);
  if (!jobProfile) throw new Error(`Job profile not found: ${targetJobId}`);

  // 1. Calculate all dimension scores
  const behavior = calculateBehaviorScores(behaviorAnswers);
  const riasec = calculateRiasecScores(riasecMotivationAnswers);
  const motivation = calculateMotivationScores(riasecMotivationAnswers);
  const sjt = calculateSjtScores(sjtAnswers, targetJobId);
  const competencies = calculateCompetencyScores(behavior, sjt);

  // 2. Reliability
  const reliability = calculateReliability(
    behaviorAnswers, riasecMotivationAnswers, sjtAnswers,
    behavior, riasec
  );

  // 3. Primary fit (with specific SJT)
  const primaryFit = calculateFit(behavior, riasec, motivation, sjt, competencies, jobProfile, true);

  // 4. Cross fits (without specific SJT = estimativa preliminar)
  const crossFits: FitResult[] = V2_JOB_PROFILES
    .filter(p => p.id !== targetJobId)
    .map(p => calculateFit(behavior, riasec, motivation, null, competencies, p, false));

  // 5. Interview recommendations
  const interview = generateInterviewRecommendation(
    behavior, riasec, competencies, primaryFit, jobProfile
  );

  return {
    behavior, riasec, motivation, sjt, competencies,
    reliability, primaryFit, crossFits, interview
  };
}

// ─── Disclaimer ───

export const V2_DISCLAIMER = 'Esta avaliação é uma ferramenta de apoio à análise de perfil profissional. Os resultados representam tendências inferidas a partir das respostas fornecidas e não constituem diagnóstico psicológico ou avaliação psicológica. A decisão de seleção deve considerar entrevista, histórico profissional, competências técnicas e demais evidências relevantes.';
