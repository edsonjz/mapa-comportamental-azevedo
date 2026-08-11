import type { AssessmentScores, JobProfile } from '../types/database';
import { PROFILES_CATALOG, JOB_TARGET_PROFILES } from './profilesData';
import type { ProfileDetail } from './profilesData';
import { INITIAL_JOB_PROFILES } from './jobProfilesData';

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

export function getFitClassification(overallFit: number): string {
  if (overallFit >= 90) return 'Aderência muito alta';
  if (overallFit >= 80) return 'Aderência alta';
  if (overallFit >= 70) return 'Aderência moderada/alta';
  if (overallFit >= 60) return 'Aderência moderada';
  if (overallFit >= 50) return 'Aderência baixa/moderada';
  return 'Baixa aderência';
}

export function getFitBadgeClass(overallFit: number): string {
  if (overallFit >= 90) return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700';
  if (overallFit >= 80) return 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/60 dark:text-teal-200 dark:border-teal-700';
  if (overallFit >= 70) return 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700';
  if (overallFit >= 60) return 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-700';
  if (overallFit >= 50) return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700';
  return 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700';
}

export interface AlignmentItem {
  type: 'convergencia' | 'tensao' | 'divergencia';
  title: string;
  description: string;
  recommendation: string;
}

export interface IntegratedFitResult {
  jobProfile: JobProfile;
  personalityFit: number;
  situationalFit: number;
  interestFit: number;
  overallFit: number;
  fitClassification: string;
  dynamicStyleSummary: string;
  convergences: AlignmentItem[];
  tensions: AlignmentItem[];
  divergences: AlignmentItem[];
  synergies: string[];
  contradictions: string[];
  topMatchingRoles: Array<{ name: string; score: number }>;
  adaptationRoles: Array<{ name: string; score: number }>;
  recruiterRecommendations: {
    investigate_points: string[];
    situational_questions: string[];
    potential_risks: string[];
    strengths_to_explore: string[];
  };
}

export function generateDynamicStyleSummary(scores: AssessmentScores): string {
  const isHighA = scores.agreeableness_score >= 65;
  const isHighMS = scores.social_maturity_score >= 65;
  const isLowC = scores.conscientiousness_score < 45;
  const isLowOR = scores.operational_orientation_score < 45;
  const isLowES = scores.emotional_stability_score < 45;

  let summary = '';

  if (isHighA && isHighMS) {
    summary += 'Apresenta forte orientação interpessoal, com elevada amabilidade e maturidade social. Demonstra potencial para atividades de atendimento que dependam de empatia, paciência e compreensão das necessidades do cidadão. ';
  } else if (scores.extraversion_score >= 65) {
    summary += 'Demonstra perfil comunicativo e expansivo, com boa facilidade para estabelecer contatos iniciais e engajar o interlocutor. ';
  } else {
    summary += 'Apresenta perfil reservado e focado, atuando com escuta atenta e objetividade nos atendimentos. ';
  }

  if (isLowC || isLowOR) {
    summary += 'Como ponto de atenção, apresenta menor aderência a ambientes altamente estruturados e orientados por controle operacional rígido, aspecto que deve ser aprofundado em entrevista. ';
  } else if (scores.conscientiousness_score >= 65 && scores.operational_orientation_score >= 65) {
    summary += 'Demonstra forte rigor procedural, organização sistemática e aderência a scripts e regras operacionais. ';
  }

  if (isLowES) {
    summary += 'Recomenda-se observar em entrevista a capacidade de autorregulação emocional em momentos de picos de demanda ou chamadas de alta fricção.';
  } else if (scores.emotional_stability_score >= 65) {
    summary += 'Exibe excelente tolerância ao estresse e controle emocional mesmo sob pressão continuada.';
  }

  return summary.trim();
}

export function analyzeTripleAlignment(scores: AssessmentScores): {
  convergences: AlignmentItem[];
  tensions: AlignmentItem[];
  divergences: AlignmentItem[];
} {
  const convergences: AlignmentItem[] = [];
  const tensions: AlignmentItem[] = [];
  const divergences: AlignmentItem[] = [];

  const rS = scores.riasec_s_score ?? 0;
  const rC = scores.riasec_c_score ?? 0;
  const rI = scores.riasec_i_score ?? 0;
  const rE = scores.riasec_e_score ?? 0;

  const hasRiasecData = (rS + rC + rI + rE + (scores.riasec_r_score ?? 0) + (scores.riasec_a_score ?? 0)) > 0;

  // 1. Convergências
  if (scores.agreeableness_score >= 60 && scores.social_maturity_score >= 60 && (rS >= 60 || !hasRiasecData)) {
    convergences.push({
      type: 'convergencia',
      title: '🟢 Forte Orientação Relacional Integrada',
      description: 'Alta empatia (Big Five), maturidade social situacional e interesse motivacional por pessoas (RIASEC Social).',
      recommendation: 'Excelente aptidão para atendimento receptivo, ouvidoria e suporte humanizado.'
    });
  }

  if (scores.openness_score >= 60 && scores.adaptability_score >= 60 && (rI >= 55 || !hasRiasecData)) {
    convergences.push({
      type: 'convergencia',
      title: '🟢 Aprendizagem e Investigação Prática',
      description: 'Elevada abertura a novidades, rápida assimilação de sistemas e interesse por entender causas de problemas.',
      recommendation: 'Ideal para suporte técnico de nível 2, canais digitais e produtos com roteiros mutáveis.'
    });
  }

  if (convergences.length === 0) {
    convergences.push({
      type: 'convergencia',
      title: '🟢 Perfil de Atuação Equilibrado',
      description: 'Demonstra flexibilidade operacional sem extremos comportamentais rígidos.',
      recommendation: 'Apto para posições multifuncionais de atendimento geral.'
    });
  }

  // 2. Tensões (Interesse existe, mas comportamento exige adaptação)
  if (hasRiasecData && rC >= 60 && (scores.conscientiousness_score < 50 || scores.operational_orientation_score < 50)) {
    tensions.push({
      type: 'tensao',
      title: '🟡 Tensão: Interesse por Processos vs Rigor Comportamental',
      description: 'Demonstra atração pela ideia de trabalhar em ambiente organizado (RIASEC Convencional), mas apresenta menor tendência comportamental para seguir rotinas altamente rígidas (Conscienciosidade/Orientação Operacional).',
      recommendation: 'Aprofundar em entrevista: verificar se consegue manter disciplina em checagens diárias repetitivas.'
    });
  }

  if (hasRiasecData && rS >= 60 && (scores.extraversion_score < 45 && scores.agreeableness_score >= 65)) {
    tensions.push({
      type: 'tensao',
      title: '🟡 Tensão: Interesse Relacional com Perfil Reservado',
      description: 'Gosta de ajudar pessoas (RIASEC Social), mas possui extroversão baixa. Não precisa ser expansivo para ser empático.',
      recommendation: 'Excelente para atendimento receptivo/chat, onde a escuta atenta supera a necessidade de extroversão.'
    });
  }

  if (hasRiasecData && rE >= 60 && scores.extraversion_score < 45) {
    tensions.push({
      type: 'tensao',
      title: '🟡 Tensão: Motivação por Resultados vs Menor Expansividade',
      description: 'Interesse por negociação e metas (RIASEC Empreendedor), porém estilo pessoal mais reservado.',
      recommendation: 'Investigar se prefere negociações por canais escritos ou vendas consultivas individuais.'
    });
  }

  // 3. Divergências (Interesse e Comportamento em direções opostas)
  if (scores.emotional_stability_score < 40 && scores.resilience_score < 50) {
    divergenciasPush(divergences, {
      type: 'divergencia',
      title: '🔴 Ponto Crítico: Vulnerabilidade a Alta Pressão',
      description: 'Estabilidade Emocional e Resiliência baixas indicam sensibilidade elevada em chamadas com clientes agressivos.',
      recommendation: 'Recomenda-se evitar operações de cobrança agressiva, retenção difícil ou chamadas críticas sem supervisão.'
    });
  }

  if (hasRiasecData && rC >= 65 && scores.conscientiousness_score < 35 && scores.operational_orientation_score < 30) {
    divergenciasPush(divergences, {
      type: 'divergencia',
      title: '🔴 Divergência: Motivação Convencional vs Baixíssima Orientação Procedural',
      description: 'Desejo por regras claras contrasta com comportamento prático de informalidade e omissão de etapas.',
      recommendation: 'Investigar detalhadamente em entrevista o histórico de cumprimento de normas e pontualidade.'
    });
  }

  return { convergences, tensions, divergences };
}

function divergenciasPush(arr: AlignmentItem[], item: AlignmentItem) {
  if (!arr.some(i => i.title === item.title)) {
    arr.push(item);
  }
}

export function calculateIntegratedFit(
  scores: AssessmentScores,
  targetJobId: string = 'operador-padrao',
  customProfiles: JobProfile[] = INITIAL_JOB_PROFILES
): IntegratedFitResult {
  const jobProfiles = customProfiles.length > 0 ? customProfiles : INITIAL_JOB_PROFILES;
  const targetJob = jobProfiles.find(j => j.id === targetJobId) || jobProfiles[0];

  // 1. Personality Fit (Big Five distance)
  const oDiff = Math.abs(scores.openness_score - targetJob.openness_weight);
  const cDiff = Math.abs(scores.conscientiousness_score - targetJob.conscientiousness_weight);
  const eDiff = Math.abs(scores.extraversion_score - targetJob.extraversion_weight);
  const aDiff = Math.abs(scores.agreeableness_score - targetJob.agreeableness_weight);
  const esDiff = Math.abs(scores.emotional_stability_score - targetJob.emotional_stability_weight);
  const avgBigFiveDist = (oDiff + cDiff + eDiff + aDiff + esDiff) / 5;
  const personalityFit = Math.max(0, Math.min(100, Math.round(100 - avgBigFiveDist)));

  // 2. Situational Fit (Behavioral indicators distance)
  const adDiff = Math.abs(scores.adaptability_score - targetJob.adaptability_weight);
  const raDiff = Math.abs(scores.resilience_score - targetJob.resilience_weight);
  const msDiff = Math.abs(scores.social_maturity_score - targetJob.social_maturity_weight);
  const orDiff = Math.abs(scores.operational_orientation_score - targetJob.operational_orientation_weight);
  const avgSituationalDist = (adDiff + raDiff + msDiff + orDiff) / 4;
  const situationalFit = Math.max(0, Math.min(100, Math.round(100 - avgSituationalDist)));

  // 3. Interest Fit (RIASEC distance)
  const hasRiasecData = (
    (scores.riasec_r_score ?? 0) + 
    (scores.riasec_i_score ?? 0) + 
    (scores.riasec_a_score ?? 0) + 
    (scores.riasec_s_score ?? 0) + 
    (scores.riasec_e_score ?? 0) + 
    (scores.riasec_c_score ?? 0)
  ) > 0;

  const rScore = scores.riasec_r_score ?? 33;
  const iScore = scores.riasec_i_score ?? 50;
  const aScore = scores.riasec_a_score ?? 42;
  const sScore = scores.riasec_s_score ?? 75;
  const eScore = scores.riasec_e_score ?? 50;
  const cScore = scores.riasec_c_score ?? 67;

  const rDiff = Math.abs(rScore - targetJob.realistic_weight);
  const iDiff = Math.abs(iScore - targetJob.investigative_weight);
  const artDiff = Math.abs(aScore - targetJob.artistic_weight);
  const sDiff = Math.abs(sScore - targetJob.social_weight);
  const entDiff = Math.abs(eScore - targetJob.enterprising_weight);
  const convDiff = Math.abs(cScore - targetJob.conventional_weight);
  const avgRiasecDist = (rDiff + iDiff + artDiff + sDiff + entDiff + convDiff) / 6;
  const interestFit = hasRiasecData ? Math.max(0, Math.min(100, Math.round(100 - avgRiasecDist))) : 60;

  // 4. Overall Fit: 35% Personality + 30% Situational + 25% Interest + 10% Operational Orientation
  const overallFit = Math.max(0, Math.min(100, Math.round(
    (0.35 * personalityFit) +
    (0.30 * situationalFit) +
    (0.25 * interestFit) +
    (0.10 * scores.operational_orientation_score)
  )));

  const fitClassification = getFitClassification(overallFit);
  const dynamicStyleSummary = generateDynamicStyleSummary(scores);
  const { convergences, tensions, divergences } = analyzeTripleAlignment(scores);

  const synergies = convergences.map(c => `${c.title}: ${c.description}`);
  const contradictions = [...tensions, ...divergences].map(t => `${t.title}: ${t.description}`);

  // 7. Rank all job profiles by Overall Fit
  const rankedRoles = jobProfiles.map(job => {
    const pFit = Math.max(0, Math.min(100, Math.round(100 - (
      Math.abs(scores.openness_score - job.openness_weight) +
      Math.abs(scores.conscientiousness_score - job.conscientiousness_weight) +
      Math.abs(scores.extraversion_score - job.extraversion_weight) +
      Math.abs(scores.agreeableness_score - job.agreeableness_weight) +
      Math.abs(scores.emotional_stability_score - job.emotional_stability_weight)
    ) / 5)));

    const sFit = Math.max(0, Math.min(100, Math.round(100 - (
      Math.abs(scores.adaptability_score - job.adaptability_weight) +
      Math.abs(scores.resilience_score - job.resilience_weight) +
      Math.abs(scores.social_maturity_score - job.social_maturity_weight) +
      Math.abs(scores.operational_orientation_score - job.operational_orientation_weight)
    ) / 4)));

    const iFit = Math.max(0, Math.min(100, Math.round(100 - (
      Math.abs(rScore - job.realistic_weight) +
      Math.abs(iScore - job.investigative_weight) +
      Math.abs(aScore - job.artistic_weight) +
      Math.abs(sScore - job.social_weight) +
      Math.abs(eScore - job.enterprising_weight) +
      Math.abs(cScore - job.conventional_weight)
    ) / 6)));

    const fit = Math.max(0, Math.min(100, Math.round(
      (0.35 * pFit) + (0.30 * sFit) + (0.25 * iFit) + (0.10 * scores.operational_orientation_score)
    )));

    return { name: job.name, score: fit };
  }).sort((a, b) => b.score - a.score);

  const topMatchingRoles = rankedRoles.slice(0, 3);
  const adaptationRoles = rankedRoles.slice(-2);

  // 8. Custom Recruiter Interview Recommendations
  const investigate_points: string[] = [
    `Verificar o alinhamento comportamental do candidato com as exigências de ${targetJob.name}.`,
    `Explorar como lida com variações de rotina e cumprimento de procedimentos operacionais.`,
    tensions.length > 0 
      ? `Aprofundar a tensão identificada: ${tensions[0].title}`
      : 'Avaliar a estabilidade emocional e resiliência em momentos de picos de atendimento.'
  ];

  const situational_questions: string[] = [
    'Conte uma situação em que precisou atender alguém muito insatisfeito e como conduziu a conversa.',
    'Como você reage quando precisa seguir rigorosamente um procedimento com o qual não concorda plenamente?',
    'Conte uma situação em que precisou mudar rapidamente sua forma de trabalhar devido a uma nova norma ou sistema.'
  ];

  const potential_risks: string[] = [
    scores.conscientiousness_score < 50 
      ? 'Risco de informalidade ou pequenas omissões em registros de atendimento.'
      : 'Risco de rigidez excessiva diante de imprevistos que fujam ao script.',
    scores.emotional_stability_score < 50 
      ? 'Sensibilidade maior a críticas diretas de clientes em chamadas difíceis.'
      : 'Sensibilidade moderada a picos de demanda continuada sem pausas.'
  ];

  const strengths_to_explore: string[] = [
    scores.agreeableness_score >= 60 ? 'Empatia e cordialidade na escuta do cliente' : 'Foco direto e objetividade nas respostas',
    scores.operational_orientation_score >= 60 ? 'Orientação prática para solução de chamados' : 'Facilidade em propor caminhos alternativos',
    `Código de interesses profissionais ${scores.riasec_code || 'S-C-I'}`
  ];

  return {
    jobProfile: targetJob,
    personalityFit,
    situationalFit,
    interestFit,
    overallFit,
    fitClassification,
    dynamicStyleSummary,
    convergences,
    tensions,
    divergences,
    synergies,
    contradictions,
    topMatchingRoles,
    adaptationRoles,
    recruiterRecommendations: {
      investigate_points,
      situational_questions,
      potential_risks,
      strengths_to_explore
    }
  };
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
