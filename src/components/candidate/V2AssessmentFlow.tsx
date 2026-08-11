import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { V2_BEHAVIOR_QUESTIONS } from '../../lib/v2/behaviorQuestions';
import { V2_RIASEC_MOTIVATION_QUESTIONS } from '../../lib/v2/riasecMotivationQuestions';
import { SJT_QUESTIONS_BY_JOB } from '../../lib/v2/sjtQuestions';
import { V2_JOB_NAMES } from '../../lib/v2/jobProfilesV2';
import { calculateFullV2Assessment } from '../../lib/v2/scoringEngineV2';
import type { V2AnswerInput } from '../../lib/v2/scoringEngineV2';
import { getShuffledSjtOptions, getShuffledBinaryOptions } from '../../lib/shuffleOptions';
import { CheckCircle2, ChevronRight, Clock, Shield, Brain, Target, Sparkles } from 'lucide-react';

interface V2AssessmentFlowProps {
  assessmentId: string;
  candidateName: string;
  targetJobId: string;
  onComplete?: () => void;
}

type Module = 'behavior' | 'riasec' | 'sjt';
type FlowStep = 'welcome' | 'behavior' | 'riasec' | 'sjt' | 'completing' | 'done';

interface QuestionItem {
  code: string;
  questionNumber: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC?: string;
  optionD?: string;
  isSjt: boolean;
  questionId?: string; // DB id if loaded from DB
}

export const V2AssessmentFlow: React.FC<V2AssessmentFlowProps> = ({
  assessmentId, candidateName, targetJobId, onComplete
}) => {
  const [step, setStep] = useState<FlowStep>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, V2AnswerInput>>({});
  const [transitioning, setTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const questionStartTime = useRef<number>(Date.now());

  const jobName = V2_JOB_NAMES[targetJobId] || targetJobId;
  const sjtQuestions = SJT_QUESTIONS_BY_JOB[targetJobId] || [];

  // Build question lists for each module
  const behaviorQuestions: QuestionItem[] = V2_BEHAVIOR_QUESTIONS.map(q => ({
    code: q.code,
    questionNumber: q.questionNumber,
    text: q.text,
    optionA: q.optionA,
    optionB: q.optionB,
    isSjt: false
  }));

  const riasecQuestions: QuestionItem[] = V2_RIASEC_MOTIVATION_QUESTIONS.map(q => ({
    code: q.code,
    questionNumber: q.questionNumber,
    text: q.text,
    optionA: q.optionA,
    optionB: q.optionB,
    isSjt: false
  }));

  const sjtItems: QuestionItem[] = sjtQuestions.map(q => ({
    code: q.code,
    questionNumber: q.questionNumber,
    text: q.situation,
    optionA: q.options[0]?.text || '',
    optionB: q.options[1]?.text || '',
    optionC: q.options[2]?.text || '',
    optionD: q.options[3]?.text || '',
    isSjt: true
  }));

  const getCurrentQuestions = (): QuestionItem[] => {
    if (step === 'behavior') return behaviorQuestions;
    if (step === 'riasec') return riasecQuestions;
    if (step === 'sjt') return sjtItems;
    return [];
  };

  const currentQuestions = getCurrentQuestions();
  const currentQuestion = currentQuestions[currentQuestionIndex];
  const totalQuestions = behaviorQuestions.length + riasecQuestions.length + sjtItems.length;

  const getModuleProgress = (): number => {
    if (step === 'behavior') return currentQuestionIndex + 1;
    if (step === 'riasec') return behaviorQuestions.length + currentQuestionIndex + 1;
    if (step === 'sjt') return behaviorQuestions.length + riasecQuestions.length + currentQuestionIndex + 1;
    return 0;
  };

  const getOverallProgress = (): number => {
    return (getModuleProgress() / totalQuestions) * 100;
  };

  const handleSelectOption = async (option: string) => {
    if (transitioning || !currentQuestion) return;

    const responseTimeMs = Date.now() - questionStartTime.current;

    const answerInput: V2AnswerInput = {
      questionCode: currentQuestion.code,
      selectedOption: option,
      responseTimeMs
    };

    setAnswers(prev => ({ ...prev, [currentQuestion.code]: answerInput }));

    // Save to Supabase in background (non-blocking)
    try {
      await supabase.rpc('save_v2_answer', {
        p_assessment_id: assessmentId,
        p_question_id: currentQuestion.questionId || null,
        p_selected_option: option,
        p_response_time_ms: responseTimeMs
      });
    } catch (e) {
      console.warn('Background save failed:', e);
    }

    // Animate transition
    setTransitioning(true);
    setTimeout(() => {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        questionStartTime.current = Date.now();
      } else {
        handleModuleComplete();
      }
      setTransitioning(false);
    }, 350);
  };

  const handleModuleComplete = async () => {
    const moduleId = step as Module;
    try {
      await supabase.rpc('update_v2_module_progress', {
        p_assessment_id: assessmentId,
        p_module_id: moduleId,
        p_status: 'completed'
      });
    } catch (e) {
      console.warn('Module progress update failed:', e);
    }

    if (step === 'behavior') {
      setStep('riasec');
      setCurrentQuestionIndex(0);
      questionStartTime.current = Date.now();
    } else if (step === 'riasec') {
      setStep('sjt');
      setCurrentQuestionIndex(0);
      questionStartTime.current = Date.now();
    } else if (step === 'sjt') {
      await handleCompleteAssessment();
    }
  };

  const handleCompleteAssessment = async () => {
    setStep('completing');
    setError(null);

    try {
      const behaviorAnswers = Object.values(answers).filter(a =>
        a.questionCode.startsWith('B')
      );
      const riasecAnswers = Object.values(answers).filter(a =>
        a.questionCode.startsWith('P')
      );
      const sjtAnswers = Object.values(answers).filter(a =>
        a.questionCode.startsWith('SJT')
      );

      const result = calculateFullV2Assessment(
        behaviorAnswers, riasecAnswers, sjtAnswers,
        targetJobId
      );

      const allFits = [result.primaryFit, ...result.crossFits];

      const { error: persistErr } = await supabase.rpc('persist_v2_scores', {
        p_assessment_id: assessmentId,
        p_behavior_scores: result.behavior,
        p_riasec_scores: { R: result.riasec.R, I: result.riasec.I, A: result.riasec.A, S: result.riasec.S, E: result.riasec.E, C: result.riasec.C },
        p_riasec_primary: result.riasec.primaryCode,
        p_riasec_secondary: result.riasec.secondaryCode,
        p_riasec_tertiary: result.riasec.tertiaryCode,
        p_riasec_code: result.riasec.riasecCode,
        p_motivation_scores: { AUT: result.motivation.AUT, EST: result.motivation.EST, DES: result.motivation.DES, REC: result.motivation.REC, CHA: result.motivation.CHA, REL: result.motivation.REL, ESTR: result.motivation.ESTR, RES: result.motivation.RES },
        p_top_motivators: result.motivation.topMotivators,
        p_sjt_job_id: targetJobId,
        p_sjt_raw: result.sjt.rawScore,
        p_sjt_max: result.sjt.maxScore,
        p_sjt_normalized: result.sjt.normalizedScore,
        p_sjt_breakdown: result.sjt.competencyBreakdown,
        p_competency_scores: result.competencies,
        p_reliability_score: result.reliability.score,
        p_reliability_classification: result.reliability.classification,
        p_reliability_flags: result.reliability.flags,
        p_reliability_details: result.reliability.details,
        p_fit_data: allFits,
        p_interview_data: result.interview,
        p_algorithm_snapshot: { version: 'v2.0.0', targetJobId }
      });

      if (persistErr) {
        console.error('Persist error:', persistErr);
        throw new Error('Erro ao salvar resultados.');
      }

      // 5. Mark assessment completed
      await supabase.rpc('complete_v2_assessment', {
        p_assessment_id: assessmentId
      });

      setStep('done');
      if (onComplete) onComplete();
    } catch (err: any) {
      console.error('Assessment completion error:', err);
      setError(err.message || 'Ocorreu um erro ao finalizar a avaliação.');
      setStep('sjt');
    }
  };

  // ─── Step indicators ───
  const getStepInfo = () => {
    const steps = [
      { key: 'behavior', label: 'Mapa Comportamental', icon: Brain, count: 15 },
      { key: 'riasec', label: 'Interesses Profissionais', icon: Target, count: 15 },
      { key: 'sjt', label: 'Julgamento Situacional', icon: Shield, count: 15 }
    ];
    return steps;
  };

  // ─── Render Welcome ───
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Olá, {candidateName}!
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Bem-vindo(a) à avaliação de perfil profissional para a função de
            </p>
            <p className="text-base font-bold text-blue-700 dark:text-blue-400 mt-1">
              {jobName}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-left space-y-3">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              O que esperar
            </p>
            <div className="space-y-2">
              {getStepInfo().map((s, i) => (
                <div key={s.key} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{s.label}</span>
                    <span className="text-slate-500 ml-1">— {s.count} perguntas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Tempo estimado: 10–15 minutos</span>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-left">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Dica importante:</strong> Não existe resposta certa ou errada nas primeiras duas etapas.
              Escolha a alternativa que mais se aproxima do que você faria naturalmente no seu dia a dia profissional.
            </p>
          </div>

          <button
            onClick={() => {
              setStep('behavior');
              questionStartTime.current = Date.now();
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/20"
          >
            <span>Iniciar Avaliação</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ─── Render Completing ───
  if (step === 'completing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 shadow-xl text-center space-y-6">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto"></div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Processando resultados...</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Aguarde enquanto calculamos seu perfil.</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render Done ───
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Avaliação Concluída!</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Obrigado, {candidateName}. Sua avaliação foi registrada com sucesso.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">
              O recrutador terá acesso ao seu relatório. Você pode fechar esta página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render Question ───
  if (!currentQuestion) return null;

  const moduleStepInfo = getStepInfo();
  const currentModuleIndex = step === 'behavior' ? 0 : step === 'riasec' ? 1 : 2;
  const currentModuleInfo = moduleStepInfo[currentModuleIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 dark:from-slate-950 dark:via-blue-950/10 dark:to-slate-950 flex flex-col">

      {/* Header with progress */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <currentModuleInfo.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Etapa {currentModuleIndex + 1}/3 — {currentModuleInfo.label}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Pergunta {currentQuestionIndex + 1} de {currentQuestions.length}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {Math.round(getOverallProgress())}%
            </span>
          </div>

          {/* Progress bars */}
          <div className="flex gap-1.5">
            {moduleStepInfo.map((s, i) => (
              <div key={s.key} className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: i < currentModuleIndex ? '100%' :
                           i === currentModuleIndex ? `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` : '0%',
                    background: i < currentModuleIndex ? 'linear-gradient(90deg, #10b981, #059669)' :
                                i === currentModuleIndex ? 'linear-gradient(90deg, #3b82f6, #6366f1)' : 'transparent'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className={`max-w-2xl w-full transition-all duration-300 ${transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Question Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg">

            {/* SJT situation label */}
            {currentQuestion.isSjt && (
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-700">
                  Situação {currentQuestion.questionNumber}
                </div>
              </div>
            )}

            {/* Question text */}
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-relaxed mb-6">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.isSjt && currentQuestion.optionC ? (
                // 4-option SJT (Deterministically Shuffled)
                getShuffledSjtOptions(
                  [
                    { key: 'A', text: currentQuestion.optionA },
                    { key: 'B', text: currentQuestion.optionB },
                    { key: 'C', text: currentQuestion.optionC || '' },
                    { key: 'D', text: currentQuestion.optionD || '' }
                  ],
                  `${assessmentId}-${currentQuestion.code}`
                ).map(opt => {
                  const isSelected = answers[currentQuestion.code]?.selectedOption === opt.originalKey;
                  return (
                    <button
                      key={opt.originalKey}
                      onClick={() => handleSelectOption(opt.originalKey)}
                      disabled={transitioning}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer group
                        ${isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5
                          ${isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-700 dark:group-hover:text-blue-400'
                          }`}
                        >
                          {opt.displayKey}
                        </span>
                        <span className={`text-sm leading-relaxed ${isSelected ? 'text-blue-800 dark:text-blue-200 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                          {opt.text}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                // 2-option binary (A/B) (Deterministically Shuffled)
                getShuffledBinaryOptions(
                  currentQuestion.optionA,
                  currentQuestion.optionB,
                  `${assessmentId}-${currentQuestion.code}`
                ).map(opt => {
                  const isSelected = answers[currentQuestion.code]?.selectedOption === opt.originalKey;
                  return (
                    <button
                      key={opt.originalKey}
                      onClick={() => handleSelectOption(opt.originalKey)}
                      disabled={transitioning}
                      className={`w-full text-left p-5 sm:p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer group
                        ${isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                        }`}
                    >
                      <span className={`text-sm sm:text-base leading-relaxed ${isSelected ? 'text-blue-800 dark:text-blue-200 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* SJT instruction */}
            {currentQuestion.isSjt && (
              <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-4 text-center italic">
                Escolha a alternativa que mais se aproxima do que você faria nesta situação.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
