/**
 * MÓDULO 2 — INTERESSES E MOTIVADORES PROFISSIONAIS (V2)
 * 15 perguntas com duas alternativas.
 *
 * P01-P11: Medem RIASEC (R, I, A, S, E, C)
 * P12-P15: Medem Motivadores (AUT, EST, DES, REC, CHA, REL, ESTR, RES)
 */

export type RiasecDimKey = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type MotivatorKey = 'AUT' | 'EST' | 'DES' | 'REC' | 'CHA' | 'REL' | 'ESTR' | 'RES';

export interface V2RiasecMotivationQuestion {
  code: string;
  questionNumber: number;
  text: string;
  optionA: string;
  optionB: string;
  /** Which dimension option A maps to */
  dimensionA: RiasecDimKey | MotivatorKey;
  /** Which dimension option B maps to */
  dimensionB: RiasecDimKey | MotivatorKey;
  type: 'riasec' | 'motivator';
  measures: string[];
}

export const V2_RIASEC_MOTIVATION_QUESTIONS: V2RiasecMotivationQuestion[] = [
  // --- RIASEC questions (P01-P11) ---
  {
    code: 'P01',
    questionNumber: 1,
    text: 'Você recebe uma tarde livre para escolher uma atividade.',
    optionA: 'Ajudar alguém a aprender uma tarefa nova.',
    optionB: 'Investigar por que um problema continua acontecendo.',
    dimensionA: 'S',
    dimensionB: 'I',
    type: 'riasec',
    measures: ['Social', 'Investigativo']
  },
  {
    code: 'P02',
    questionNumber: 2,
    text: 'Você pode participar de uma melhoria.',
    optionA: 'Criar uma forma diferente de apresentar a informação.',
    optionB: 'Organizar a informação para facilitar consultas futuras.',
    dimensionA: 'A',
    dimensionB: 'C',
    type: 'riasec',
    measures: ['Artístico', 'Convencional']
  },
  {
    code: 'P03',
    questionNumber: 3,
    text: 'Você pode escolher um projeto.',
    optionA: 'Coordenar pessoas para alcançar um resultado.',
    optionB: 'Trabalhar diretamente na execução de uma solução.',
    dimensionA: 'E',
    dimensionB: 'R',
    type: 'riasec',
    measures: ['Empreendedor', 'Realista']
  },
  {
    code: 'P04',
    questionNumber: 4,
    text: 'Você recebe uma situação difícil de atendimento.',
    optionA: 'Conversar com a pessoa para entender sua necessidade.',
    optionB: 'Procurar informações para descobrir a origem do problema.',
    dimensionA: 'S',
    dimensionB: 'I',
    type: 'riasec',
    measures: ['Social', 'Investigativo']
  },
  {
    code: 'P05',
    questionNumber: 5,
    text: 'Você precisa melhorar uma atividade.',
    optionA: 'Criar uma solução diferente.',
    optionB: 'Criar uma estratégia para alcançar um resultado melhor.',
    dimensionA: 'A',
    dimensionB: 'E',
    type: 'riasec',
    measures: ['Artístico', 'Empreendedor']
  },
  {
    code: 'P06',
    questionNumber: 6,
    text: 'Você pode escolher entre:',
    optionA: 'Trabalhar com ferramentas e execução prática.',
    optionB: 'Organizar informações, registros e controles.',
    dimensionA: 'R',
    dimensionB: 'C',
    type: 'riasec',
    measures: ['Realista', 'Convencional']
  },
  {
    code: 'P07',
    questionNumber: 7,
    text: 'Você recebe um problema complexo.',
    optionA: 'Pesquisar e descobrir as possíveis causas.',
    optionB: 'Conversar com as pessoas envolvidas para compreender a situação.',
    dimensionA: 'I',
    dimensionB: 'S',
    type: 'riasec',
    measures: ['Investigativo', 'Social']
  },
  {
    code: 'P08',
    questionNumber: 8,
    text: 'Você precisa melhorar a comunicação da equipe.',
    optionA: 'Criar uma maneira visualmente diferente de apresentar o conteúdo.',
    optionB: 'Convencer a equipe a adotar uma nova estratégia.',
    dimensionA: 'A',
    dimensionB: 'E',
    type: 'riasec',
    measures: ['Artístico', 'Empreendedor']
  },
  {
    code: 'P09',
    questionNumber: 9,
    text: 'Você recebe liberdade para trabalhar em um projeto.',
    optionA: 'Criar algo novo.',
    optionB: 'Organizar um processo para garantir que nada seja esquecido.',
    dimensionA: 'A',
    dimensionB: 'C',
    type: 'riasec',
    measures: ['Artístico', 'Convencional']
  },
  {
    code: 'P10',
    questionNumber: 10,
    text: 'Você precisa resolver um problema operacional.',
    optionA: 'Testar diretamente diferentes formas de resolver.',
    optionB: 'Analisar informações antes de decidir.',
    dimensionA: 'R',
    dimensionB: 'I',
    type: 'riasec',
    measures: ['Realista', 'Investigativo']
  },
  {
    code: 'P11',
    questionNumber: 11,
    text: 'Você pode escolher uma atividade.',
    optionA: 'Orientar pessoas.',
    optionB: 'Trabalhar com metas e resultados.',
    dimensionA: 'S',
    dimensionB: 'E',
    type: 'riasec',
    measures: ['Social', 'Empreendedor']
  },
  // --- Motivator questions (P12-P15) ---
  {
    code: 'P12',
    questionNumber: 12,
    text: 'Você prefere uma atividade que permita:',
    optionA: 'Liberdade para decidir como fazer.',
    optionB: 'Diretrizes e métodos bem definidos para garantir a exatidão.',
    dimensionA: 'AUT',
    dimensionB: 'ESTR',
    type: 'motivator',
    measures: ['Autonomia', 'Estrutura']
  },
  {
    code: 'P13',
    questionNumber: 13,
    text: 'Entre duas oportunidades:',
    optionA: 'Uma oferece estabilidade e previsibilidade.',
    optionB: 'Outra oferece desafios e possibilidade de crescimento.',
    dimensionA: 'EST',
    dimensionB: 'DES',
    type: 'motivator',
    measures: ['Estabilidade', 'Desenvolvimento']
  },
  {
    code: 'P14',
    questionNumber: 14,
    text: 'Em uma função profissional, o que tende a motivar mais?',
    optionA: 'Perceber que meu trabalho ajudou alguém.',
    optionB: 'Perceber que alcancei um resultado difícil.',
    dimensionA: 'REL',
    dimensionB: 'RES',
    type: 'motivator',
    measures: ['Relacionamento', 'Resultado']
  },
  {
    code: 'P15',
    questionNumber: 15,
    text: 'Você recebe uma tarefa importante.',
    optionA: 'Prefere ter autonomia para decidir como executar.',
    optionB: 'Prefere contar com parâmetros definidos para assegurar a conformidade da entrega.',
    dimensionA: 'AUT',
    dimensionB: 'ESTR',
    type: 'motivator',
    measures: ['Autonomia', 'Estrutura']
  }
];

/** RIASEC dimension opportunities (how many times each appears across P01-P11) */
export const V2_RIASEC_OPPORTUNITIES: Record<RiasecDimKey, number> = {
  R: 3,
  I: 4,
  A: 4,
  S: 4,
  E: 4,
  C: 3
};

/** Motivator dimension opportunities */
export const V2_MOTIVATOR_OPPORTUNITIES: Record<MotivatorKey, number> = {
  AUT: 2,
  EST: 1,
  DES: 1,
  REC: 0, // Computed indirectly: high E + high CHA
  CHA: 0, // Computed from DES context
  REL: 1,
  ESTR: 2,
  RES: 1
};

export const RIASEC_DIMENSION_NAMES: Record<RiasecDimKey, string> = {
  R: 'Realista',
  I: 'Investigativo',
  A: 'Artístico',
  S: 'Social',
  E: 'Empreendedor',
  C: 'Convencional'
};

export const MOTIVATOR_NAMES: Record<MotivatorKey, string> = {
  AUT: 'Autonomia',
  EST: 'Estabilidade',
  DES: 'Desenvolvimento',
  REC: 'Reconhecimento',
  CHA: 'Desafio',
  REL: 'Relacionamento',
  ESTR: 'Estrutura',
  RES: 'Resultado'
};
