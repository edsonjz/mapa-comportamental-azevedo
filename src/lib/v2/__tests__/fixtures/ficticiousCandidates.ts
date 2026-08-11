/**
 * FIXTURE GENERATOR — 20 Candidatos Fictícios (5 por função de Contact Center)
 *
 * Gera perfis variados para testes:
 * - Alta Aderência (Perfil Ideal)
 * - Boa Aderência com ponto de atenção específico
 * - Aderência Moderada (Perfil Híbrido)
 * - Tensão Comportamental (RIASEC vs Comportamento)
 * - Baixa Aderência
 */

import { V2_BEHAVIOR_QUESTIONS } from '../../behaviorQuestions';
import { V2_RIASEC_MOTIVATION_QUESTIONS } from '../../riasecMotivationQuestions';
import { SJT_QUESTIONS_BY_JOB } from '../../sjtQuestions';
import { calculateFullV2Assessment } from '../../scoringEngineV2';
import type { V2AnswerInput, V2AssessmentResult } from '../../scoringEngineV2';

export interface FictitiousCandidate {
  id: string;
  name: string;
  targetJobId: string;
  targetJobName: string;
  profileType: 'Ideal (Alta Aderência)' | 'Forte com Ponto de Atenção' | 'Moderado' | 'Tensão Declarado vs Ação' | 'Baixa Aderência';
  behaviorAnswers: V2AnswerInput[];
  riasecAnswers: V2AnswerInput[];
  sjtAnswers: V2AnswerInput[];
}

export function generateFictitiousCandidates(): FictitiousCandidate[] {
  const candidates: FictitiousCandidate[] = [];

  const roles = [
    { id: 'operador-atendimento', name: 'Operador de Atendimento', prefix: 'OP' },
    { id: 'monitor-qualidade', name: 'Monitor de Qualidade', prefix: 'MQ' },
    { id: 'instrutor-treinamento', name: 'Instrutor de Treinamento', prefix: 'IT' },
    { id: 'supervisor-equipe', name: 'Supervisor de Equipe', prefix: 'SE' }
  ];

  const profileTypes: FictitiousCandidate['profileType'][] = [
    'Ideal (Alta Aderência)',
    'Forte com Ponto de Atenção',
    'Moderado',
    'Tensão Declarado vs Ação',
    'Baixa Aderência'
  ];

  const names = [
    ['Ana Clara Silva', 'Bruno Oliveira', 'Camila Santos', 'Diego Ferreira', 'Elena Lima'], // Operadores
    ['Fernando Costa', 'Gabriela Rocha', 'Heitor Alves', 'Isabela Martins', 'João Pedro Souza'], // Monitores
    ['Karina Ribeiro', 'Lucas Barbosa', 'Mariana Carvalho', 'Nicolas Gomes', 'Olivia Araujo'], // Instrutores
    ['Paulo Henrique', 'Quintino Viana', 'Rafaela Mendes', 'Samuel Pereira', 'Tatiane Cardoso']  // Supervisores
  ];

  roles.forEach((role, roleIdx) => {
    profileTypes.forEach((pType, pIdx) => {
      const candidateName = names[roleIdx][pIdx];

      // Behavior answers: alternate based on profile type
      const bAnswers: V2AnswerInput[] = V2_BEHAVIOR_QUESTIONS.map((q, qIdx) => {
        let opt: string = 'A';
        if (pIdx === 0) opt = 'A'; // Ideal
        else if (pIdx === 1) opt = qIdx % 4 === 0 ? 'B' : 'A';
        else if (pIdx === 2) opt = qIdx % 2 === 0 ? 'A' : 'B';
        else if (pIdx === 3) opt = qIdx % 3 === 0 ? 'A' : 'B';
        else opt = 'B'; // Low

        return {
          questionCode: q.code,
          selectedOption: opt,
          responseTimeMs: 3500 + (qIdx * 100)
        };
      });

      // RIASEC answers
      const rAnswers: V2AnswerInput[] = V2_RIASEC_MOTIVATION_QUESTIONS.map((q, qIdx) => {
        let opt: string = 'A';
        if (pIdx === 0) opt = 'A';
        else if (pIdx === 4) opt = 'B';
        else opt = (qIdx + pIdx) % 2 === 0 ? 'A' : 'B';

        return {
          questionCode: q.code,
          selectedOption: opt,
          responseTimeMs: 3800
        };
      });

      // SJT answers
      const sjtQuestions = SJT_QUESTIONS_BY_JOB[role.id] || [];
      const sAnswers: V2AnswerInput[] = sjtQuestions.map((q, qIdx) => {
        let opt: string = 'A'; // highest score (3)
        if (pIdx === 1) opt = qIdx % 5 === 0 ? 'B' : 'A';
        else if (pIdx === 2) opt = qIdx % 2 === 0 ? 'A' : 'B';
        else if (pIdx === 3) opt = qIdx % 3 === 0 ? 'C' : 'B';
        else if (pIdx === 4) opt = 'D'; // lowest score (0)

        return {
          questionCode: q.code,
          selectedOption: opt,
          responseTimeMs: 5500
        };
      });

      candidates.push({
        id: `fictitious-${role.prefix}-${pIdx + 1}`,
        name: candidateName,
        targetJobId: role.id,
        targetJobName: role.name,
        profileType: pType,
        behaviorAnswers: bAnswers,
        riasecAnswers: rAnswers,
        sjtAnswers: sAnswers
      });
    });
  });

  return candidates;
}

export function testAllFictitiousCandidates(): { candidate: FictitiousCandidate; result: V2AssessmentResult }[] {
  const candidates = generateFictitiousCandidates();
  return candidates.map(c => ({
    candidate: c,
    result: calculateFullV2Assessment(
      c.behaviorAnswers,
      c.riasecAnswers,
      c.sjtAnswers,
      c.targetJobId,
      c.name
    )
  }));
}
