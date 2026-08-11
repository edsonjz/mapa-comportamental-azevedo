/**
 * V2 JOB PROFILES — Matriz configurável de pesos por função
 *
 * Cada perfil contém pesos para todas as dimensões avaliadas.
 * Os pesos representam o nível de exigência da função (0-100).
 * A fórmula de fit é ponderada por fit_formula_weights.
 */

export interface V2JobProfileRequirements {
  big_five_weights: {
    O: number; C: number; E: number; A: number; ES: number;
  };
  behavior_weights: {
    AD: number; RA: number; MS: number; OR: number; AS: number; FC: number;
  };
  riasec_weights: {
    R: number; I: number; A: number; S: number; E: number; C: number;
  };
  motivator_weights: {
    AUT: number; EST: number; DES: number; REC: number;
    CHA: number; REL: number; ESTR: number; RES: number;
  };
  competency_weights: {
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
  };
  /** How much each fit component weighs in overall fit (must sum to ~1.0) */
  fit_formula_weights: {
    personality: number;
    behavior: number;
    interest: number;
    motivation: number;
    sjt: number;
    competency: number;
  };
}

export interface V2JobProfile {
  id: string;
  name: string;
  description: string;
  requirements: V2JobProfileRequirements;
  version: string;
  active: boolean;
}

export const V2_JOB_PROFILES: V2JobProfile[] = [
  {
    id: 'operador-atendimento',
    name: 'Operador de Atendimento',
    description: 'Atendimento receptivo ao cidadão com foco em comunicação, escuta, resolução de problemas, cumprimento de procedimentos e equilíbrio entre qualidade e produtividade.',
    version: 'v2.0',
    active: true,
    requirements: {
      big_five_weights: { O: 55, C: 75, E: 60, A: 85, ES: 80 },
      behavior_weights: { AD: 75, RA: 80, MS: 90, OR: 80, AS: 60, FC: 65 },
      riasec_weights: { R: 30, I: 60, A: 20, S: 90, E: 40, C: 70 },
      motivator_weights: {
        AUT: 40, EST: 70, DES: 65, REC: 50,
        CHA: 45, REL: 80, ESTR: 65, RES: 55
      },
      competency_weights: {
        assertividade: 60, tomada_decisao: 60, gestao_conflitos: 55,
        accountability: 70, orientacao_resultado: 60, disciplina_operacional: 75,
        flexibilidade_cognitiva: 65, tolerancia_ambiguidade: 50,
        agilidade_aprendizagem: 65, escuta_ativa: 85
      },
      fit_formula_weights: {
        personality: 0.20, behavior: 0.20, interest: 0.10,
        motivation: 0.10, sjt: 0.25, competency: 0.15
      }
    }
  },
  {
    id: 'monitor-qualidade',
    name: 'Monitor de Qualidade',
    description: 'Auditoria de atendimentos, análise de conformidade, feedback assertivo, imparcialidade e orientação à qualidade.',
    version: 'v2.0',
    active: true,
    requirements: {
      big_five_weights: { O: 65, C: 90, E: 45, A: 60, ES: 80 },
      behavior_weights: { AD: 60, RA: 75, MS: 80, OR: 95, AS: 80, FC: 70 },
      riasec_weights: { R: 25, I: 80, A: 20, S: 50, E: 40, C: 90 },
      motivator_weights: {
        AUT: 50, EST: 65, DES: 75, REC: 55,
        CHA: 50, REL: 45, ESTR: 80, RES: 70
      },
      competency_weights: {
        assertividade: 80, tomada_decisao: 75, gestao_conflitos: 60,
        accountability: 85, orientacao_resultado: 70, disciplina_operacional: 90,
        flexibilidade_cognitiva: 65, tolerancia_ambiguidade: 55,
        agilidade_aprendizagem: 65, escuta_ativa: 75
      },
      fit_formula_weights: {
        personality: 0.15, behavior: 0.20, interest: 0.10,
        motivation: 0.10, sjt: 0.30, competency: 0.15
      }
    }
  },
  {
    id: 'instrutor-treinamento',
    name: 'Instrutor de Treinamento',
    description: 'Condução de treinamentos, didática, empatia, flexibilidade, capacidade de explicar e influenciar, leitura das necessidades dos alunos.',
    version: 'v2.0',
    active: true,
    requirements: {
      big_five_weights: { O: 80, C: 65, E: 80, A: 80, ES: 70 },
      behavior_weights: { AD: 75, RA: 65, MS: 90, OR: 55, AS: 65, FC: 80 },
      riasec_weights: { R: 30, I: 55, A: 65, S: 90, E: 55, C: 40 },
      motivator_weights: {
        AUT: 70, EST: 45, DES: 85, REC: 70,
        CHA: 60, REL: 80, ESTR: 40, RES: 50
      },
      competency_weights: {
        assertividade: 65, tomada_decisao: 60, gestao_conflitos: 60,
        accountability: 65, orientacao_resultado: 55, disciplina_operacional: 50,
        flexibilidade_cognitiva: 80, tolerancia_ambiguidade: 70,
        agilidade_aprendizagem: 85, escuta_ativa: 85
      },
      fit_formula_weights: {
        personality: 0.20, behavior: 0.20, interest: 0.15,
        motivation: 0.10, sjt: 0.20, competency: 0.15
      }
    }
  },
  {
    id: 'supervisor-equipe',
    name: 'Supervisor de Equipe',
    description: 'Gestão de equipe, indicadores, conflitos, tomada de decisão, resiliência, cobrança, feedback e orientação para resultados.',
    version: 'v2.0',
    active: true,
    requirements: {
      big_five_weights: { O: 70, C: 80, E: 80, A: 70, ES: 85 },
      behavior_weights: { AD: 80, RA: 90, MS: 90, OR: 80, AS: 90, FC: 75 },
      riasec_weights: { R: 25, I: 60, A: 25, S: 80, E: 85, C: 65 },
      motivator_weights: {
        AUT: 75, EST: 55, DES: 80, REC: 70,
        CHA: 70, REL: 60, ESTR: 50, RES: 85
      },
      competency_weights: {
        assertividade: 90, tomada_decisao: 90, gestao_conflitos: 85,
        accountability: 85, orientacao_resultado: 85, disciplina_operacional: 80,
        flexibilidade_cognitiva: 70, tolerancia_ambiguidade: 65,
        agilidade_aprendizagem: 70, escuta_ativa: 75
      },
      fit_formula_weights: {
        personality: 0.15, behavior: 0.15, interest: 0.10,
        motivation: 0.10, sjt: 0.30, competency: 0.20
      }
    }
  }
];

export function getV2JobProfile(jobId: string): V2JobProfile | undefined {
  return V2_JOB_PROFILES.find(p => p.id === jobId);
}

export const V2_JOB_IDS = V2_JOB_PROFILES.map(p => p.id);
export const V2_JOB_NAMES: Record<string, string> = Object.fromEntries(
  V2_JOB_PROFILES.map(p => [p.id, p.name])
);
