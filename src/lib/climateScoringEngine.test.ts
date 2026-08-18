import {
  calculateNormalizedScore,
  getScoreClassification,
  getRetentionClassification,
  calculateAggregatedReport
} from './climateScoringEngine';
import type { ClimateQuestion, ClimateAnswer } from '../types/climateTypes';

export function runClimateEngineTests() {
  console.log('=== RUNNING CLIMATE SCORING ENGINE TESTS ===');
  let passed = 0;
  let failed = 0;

  function assertEqual(actual: any, expected: any, testName: string) {
    if (actual === expected) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - Expected ${expected}, got ${actual}`);
      failed++;
    }
  }

  // Test 1: Positive Likert Scoring
  assertEqual(calculateNormalizedScore(1, false), 0, 'Positive Likert 1 -> 0');
  assertEqual(calculateNormalizedScore(2, false), 25, 'Positive Likert 2 -> 25');
  assertEqual(calculateNormalizedScore(3, false), 50, 'Positive Likert 3 -> 50');
  assertEqual(calculateNormalizedScore(4, false), 75, 'Positive Likert 4 -> 75');
  assertEqual(calculateNormalizedScore(5, false), 100, 'Positive Likert 5 -> 100');

  // Test 2: Reverse Likert Scoring
  assertEqual(calculateNormalizedScore(1, true), 100, 'Reverse Likert 1 -> 100');
  assertEqual(calculateNormalizedScore(2, true), 75, 'Reverse Likert 2 -> 75');
  assertEqual(calculateNormalizedScore(3, true), 50, 'Reverse Likert 3 -> 50');
  assertEqual(calculateNormalizedScore(4, true), 25, 'Reverse Likert 4 -> 25');
  assertEqual(calculateNormalizedScore(5, true), 0, 'Reverse Likert 5 -> 0');

  // Test 3: N/A Handling (NULL)
  assertEqual(calculateNormalizedScore(null, false), null, 'N/A null -> null');
  assertEqual(calculateNormalizedScore(undefined as any, false), null, 'N/A undefined -> null');

  // Test 4: Classification Ranges
  assertEqual(getScoreClassification(35), 'Crítico', 'Score 35 -> Crítico');
  assertEqual(getScoreClassification(55), 'Atenção', 'Score 55 -> Atenção');
  assertEqual(getScoreClassification(70), 'Regular', 'Score 70 -> Regular');
  assertEqual(getScoreClassification(85), 'Bom', 'Score 85 -> Bom');
  assertEqual(getScoreClassification(95), 'Muito bom', 'Score 95 -> Muito bom');

  // Test 5: Retention Classification
  assertEqual(getRetentionClassification(30), 'Sinal de atenção elevado', 'Retention 30 -> Sinal de atenção elevado');
  assertEqual(getRetentionClassification(50), 'Atenção', 'Retention 50 -> Atenção');
  assertEqual(getRetentionClassification(80), 'Favorável', 'Retention 80 -> Favorável');

  // Test 6: Aggregated Report Calculation with Polarization
  const dummyDimensions = [
    { id: 'dim1', code: 'CLIMA_E_AMBIENTE', name: 'Clima e Ambiente' },
    { id: 'dim2', code: 'LIDERANCA', name: 'Liderança' }
  ];

  const dummyQuestions: ClimateQuestion[] = [
    {
      id: 'q1',
      survey_id: 's1',
      dimension_id: 'dim1',
      code: 'C01',
      question: 'Clima bom?',
      question_type: 'likert',
      scale_type: '1_5',
      reverse_scoring: false,
      required: true,
      display_order: 1
    },
    {
      id: 'q2',
      survey_id: 's1',
      dimension_id: 'dim1',
      code: 'C06',
      question: 'Conflitos?',
      question_type: 'likert',
      scale_type: '1_5',
      reverse_scoring: true,
      required: true,
      display_order: 2
    }
  ];

  // Answers with 50% 1 and 50% 5 for q1 (Polarization)
  const dummyAnswers: ClimateAnswer[] = [
    { response_id: 'r1', question_id: 'q1', likert_value: 1 },
    { response_id: 'r2', question_id: 'q1', likert_value: 1 },
    { response_id: 'r3', question_id: 'q1', likert_value: 5 },
    { response_id: 'r4', question_id: 'q1', likert_value: 5 },
    // N/A for q2
    { response_id: 'r1', question_id: 'q2', likert_value: null }
  ];

  const report = calculateAggregatedReport(
    's1',
    dummyDimensions,
    dummyQuestions,
    dummyAnswers,
    10,
    4,
    4,
    0
  );

  const q1Stats = report.question_stats.find((q) => q.code === 'C01');
  assertEqual(q1Stats?.is_polarized, true, 'Q1 detected as Polarized (50% 1, 50% 5)');
  assertEqual(q1Stats?.average_normalized, 50, 'Q1 average normalized is 50');

  console.log(`\n=== TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);
  return { passed, failed };
}

// Auto execute if run via node
if (typeof window === 'undefined') {
  runClimateEngineTests();
}
