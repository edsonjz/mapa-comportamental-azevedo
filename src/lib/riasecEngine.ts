import type { RiasecDimension } from '../types/database';

export interface RiasecCalculationResult {
  rScore: number;
  iScore: number;
  aScore: number;
  sScore: number;
  eScore: number;
  cScore: number;
  primary: string;
  secondary: string;
  tertiary: string;
  code: string;
  summary: string;
}

export const RIASEC_DIMENSION_NAMES: Record<RiasecDimension, string> = {
  R: 'Realista',
  I: 'Investigativo',
  A: 'Artístico',
  S: 'Social',
  E: 'Empreendedor',
  C: 'Convencional'
};

export const RIASEC_DIMENSION_DESCRIPTIONS: Record<RiasecDimension, string> = {
  R: 'Preferência por atividades práticas, ferramentas, operação e soluções concretas.',
  I: 'Preferência por análise de dados, investigação de problemas complexos e busca por causas.',
  A: 'Preferência por criatividade, inovação, novas abordagens e liberdade de expressão.',
  S: 'Preferência por ajudar, orientar, ensinar, desenvolver pessoas e atendimento.',
  E: 'Preferência por influência, negociação, atingimento de metas e liderança.',
  C: 'Preferência por organização, controle de processos, padrões, registros e precisão.'
};

// Opportunity count per dimension across the 24 forced-choice questions
const RIASEC_OPPORTUNITIES: Record<RiasecDimension, number> = {
  R: 7,
  I: 9,
  A: 8,
  S: 8,
  E: 8,
  C: 8
};

export function calculateRiasecScores(
  answers: Array<{ dimension: string }>
): RiasecCalculationResult {
  const counts: Record<RiasecDimension, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  answers.forEach((ans) => {
    const dim = ans.dimension as RiasecDimension;
    if (counts[dim] !== undefined) {
      counts[dim] += 1;
    }
  });

  // Calculate 0-100 normalized scores
  const normalized: Record<RiasecDimension, number> = {
    R: Math.min(100, Math.round((counts.R / RIASEC_OPPORTUNITIES.R) * 100)),
    I: Math.min(100, Math.round((counts.I / RIASEC_OPPORTUNITIES.I) * 100)),
    A: Math.min(100, Math.round((counts.A / RIASEC_OPPORTUNITIES.A) * 100)),
    S: Math.min(100, Math.round((counts.S / RIASEC_OPPORTUNITIES.S) * 100)),
    E: Math.min(100, Math.round((counts.E / RIASEC_OPPORTUNITIES.E) * 100)),
    C: Math.min(100, Math.round((counts.C / RIASEC_OPPORTUNITIES.C) * 100))
  };

  // Sort dimensions descending by normalized score
  const sortedDimensions = (Object.keys(normalized) as RiasecDimension[]).sort(
    (a, b) => normalized[b] - normalized[a]
  );

  const top1 = sortedDimensions[0];
  const top2 = sortedDimensions[1];
  const top3 = sortedDimensions[2];

  const primary = RIASEC_DIMENSION_NAMES[top1];
  const secondary = RIASEC_DIMENSION_NAMES[top2];
  const tertiary = RIASEC_DIMENSION_NAMES[top3];

  const code = `${top1}-${top2}-${top3}`;

  const summary = `Perfil de interesses com predominância ${primary}, ${secondary} e ${tertiary}. Indica maior inclinação motivacional por atividades que envolvem ${RIASEC_DIMENSION_DESCRIPTIONS[top1].toLowerCase()} ${RIASEC_DIMENSION_DESCRIPTIONS[top2].toLowerCase()}`;

  return {
    rScore: normalized.R,
    iScore: normalized.I,
    aScore: normalized.A,
    sScore: normalized.S,
    eScore: normalized.E,
    cScore: normalized.C,
    primary,
    secondary,
    tertiary,
    code,
    summary
  };
}
