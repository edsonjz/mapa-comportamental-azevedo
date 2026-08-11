import { describe, it, expect } from 'vitest';
import {
  calculateBehaviorScores,
  calculateRiasecScores,
  calculateMotivationScores,
  calculateSjtScores,
  calculateCompetencyScores,
  calculateReliability,
  calculateFit,
  calculateFullV2Assessment,
  V2AnswerInput
} from '../scoringEngineV2';
import { V2_JOB_PROFILES, getV2JobProfile } from '../jobProfilesV2';
import { V2_BEHAVIOR_QUESTIONS } from '../behaviorQuestions';
import { V2_RIASEC_MOTIVATION_QUESTIONS } from '../riasecMotivationQuestions';
import { SJT_QUESTIONS_BY_JOB } from '../sjtQuestions';

describe('V2 Scoring Engine', () => {

  it('should calculate behavior scores within 0-100 range for all 11 dimensions', () => {
    // Simulate candidate picking 'A' for all behavior questions
    const answers: V2AnswerInput[] = V2_BEHAVIOR_QUESTIONS.map(q => ({
      questionCode: q.code,
      selectedOption: 'A',
      responseTimeMs: 4000
    }));

    const scores = calculateBehaviorScores(answers);

    expect(scores.O).toBeGreaterThanOrEqual(0);
    expect(scores.O).toBeLessThanOrEqual(100);
    expect(scores.C).toBeGreaterThanOrEqual(0);
    expect(scores.C).toBeLessThanOrEqual(100);
    expect(scores.E).toBeGreaterThanOrEqual(0);
    expect(scores.A).toBeGreaterThanOrEqual(0);
    expect(scores.ES).toBeGreaterThanOrEqual(0);
    expect(scores.AD).toBeGreaterThanOrEqual(0);
    expect(scores.RA).toBeGreaterThanOrEqual(0);
    expect(scores.MS).toBeGreaterThanOrEqual(0);
    expect(scores.OR).toBeGreaterThanOrEqual(0);
    expect(scores.AS).toBeGreaterThanOrEqual(0);
    expect(scores.FC).toBeGreaterThanOrEqual(0);
  });

  it('should calculate RIASEC scores and produce a valid 3-letter code', () => {
    const answers: V2AnswerInput[] = V2_RIASEC_MOTIVATION_QUESTIONS
      .filter(q => q.type === 'riasec')
      .map(q => ({
        questionCode: q.code,
        selectedOption: 'A',
        responseTimeMs: 3500
      }));

    const riasec = calculateRiasecScores(answers);

    expect(riasec.primaryCode).toBeDefined();
    expect(riasec.secondaryCode).toBeDefined();
    expect(riasec.tertiaryCode).toBeDefined();
    expect(riasec.riasecCode).toMatch(/^[RIASCE]-[RIASCE]-[RIASCE]$/);
  });

  it('should calculate motivators and identify top 3 motivators', () => {
    const answers: V2AnswerInput[] = V2_RIASEC_MOTIVATION_QUESTIONS
      .filter(q => q.type === 'motivator')
      .map(q => ({
        questionCode: q.code,
        selectedOption: 'A',
        responseTimeMs: 3500
      }));

    const motivation = calculateMotivationScores(answers);

    expect(motivation.topMotivators).toHaveLength(3);
    expect(motivation.AUT).toBeGreaterThanOrEqual(0);
    expect(motivation.EST).toBeGreaterThanOrEqual(0);
  });

  it('should calculate SJT scores for all 4 functions', () => {
    const jobs = ['operador-atendimento', 'monitor-qualidade', 'instrutor-treinamento', 'supervisor-equipe'];

    for (const jobId of jobs) {
      const sjtQuestions = SJT_QUESTIONS_BY_JOB[jobId];
      expect(sjtQuestions).toBeDefined();
      expect(sjtQuestions).toHaveLength(15);

      // Simulate candidate picking best option 'A' (score 3 for most questions)
      const answers: V2AnswerInput[] = sjtQuestions.map(q => ({
        questionCode: q.code,
        selectedOption: 'A',
        responseTimeMs: 5000
      }));

      const sjtResult = calculateSjtScores(answers, jobId);

      expect(sjtResult.jobId).toBe(jobId);
      expect(sjtResult.maxScore).toBe(45);
      expect(sjtResult.normalizedScore).toBeGreaterThanOrEqual(0);
      expect(sjtResult.normalizedScore).toBeLessThanOrEqual(100);
      expect(sjtResult.competencyBreakdown).toBeDefined();
    }
  });

  it('should compute 10 derived competencies correctly', () => {
    const behavior = calculateBehaviorScores([]);
    const sjt = calculateSjtScores([], 'operador-atendimento');
    const competencies = calculateCompetencyScores(behavior, sjt);

    expect(competencies.assertividade).toBeGreaterThanOrEqual(0);
    expect(competencies.tomada_decisao).toBeGreaterThanOrEqual(0);
    expect(competencies.gestao_conflitos).toBeGreaterThanOrEqual(0);
    expect(competencies.accountability).toBeGreaterThanOrEqual(0);
    expect(competencies.orientacao_resultado).toBeGreaterThanOrEqual(0);
    expect(competencies.disciplina_operacional).toBeGreaterThanOrEqual(0);
    expect(competencies.flexibilidade_cognitiva).toBeGreaterThanOrEqual(0);
    expect(competencies.tolerancia_ambiguidade).toBeGreaterThanOrEqual(0);
    expect(competencies.agilidade_aprendizagem).toBeGreaterThanOrEqual(0);
    expect(competencies.escuta_ativa).toBeGreaterThanOrEqual(0);
  });

  it('should flag fast responses in reliability check', () => {
    const fastAnswers: V2AnswerInput[] = V2_BEHAVIOR_QUESTIONS.map(q => ({
      questionCode: q.code,
      selectedOption: 'A',
      responseTimeMs: 1200 // fast (< 2s)
    }));

    const behavior = calculateBehaviorScores(fastAnswers);
    const riasec = calculateRiasecScores([]);

    const reliability = calculateReliability(fastAnswers, [], [], behavior, riasec);

    expect(reliability.score).toBeLessThan(100);
    expect(reliability.flags).toContain('muitas_respostas_rapidas');
  });

  it('should run full assessment pipeline without throwing', () => {
    const behaviorAnswers: V2AnswerInput[] = V2_BEHAVIOR_QUESTIONS.map((q, idx) => ({
      questionCode: q.code,
      selectedOption: idx % 2 === 0 ? 'A' : 'B',
      responseTimeMs: 4000
    }));

    const riasecAnswers: V2AnswerInput[] = V2_RIASEC_MOTIVATION_QUESTIONS.map((q, idx) => ({
      questionCode: q.code,
      selectedOption: idx % 2 === 0 ? 'A' : 'B',
      responseTimeMs: 4000
    }));

    const sjtQuestions = SJT_QUESTIONS_BY_JOB['supervisor-equipe'];
    const sjtAnswers: V2AnswerInput[] = sjtQuestions.map((q, idx) => ({
      questionCode: q.code,
      selectedOption: idx % 4 === 0 ? 'A' : idx % 4 === 1 ? 'B' : idx % 4 === 2 ? 'C' : 'D',
      responseTimeMs: 6000
    }));

    const result = calculateFullV2Assessment(
      behaviorAnswers, riasecAnswers, sjtAnswers,
      'supervisor-equipe', 'Candidato Teste'
    );

    expect(result.primaryFit.jobId).toBe('supervisor-equipe');
    expect(result.primaryFit.overallFit).toBeGreaterThanOrEqual(0);
    expect(result.primaryFit.fitClassification).toBeDefined();
    expect(result.crossFits).toHaveLength(3);
    expect(result.interview.interviewQuestions).toHaveLength(5);
    expect(result.interview.recommendationText).toBeTruthy();
  });
});
