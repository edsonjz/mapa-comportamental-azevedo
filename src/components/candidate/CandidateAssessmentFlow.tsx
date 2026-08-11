import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Question, RiasecQuestion } from '../../types/database';
import { RIASEC_QUESTIONS_CATALOG } from '../../lib/riasecQuestions';
import { ThemeToggle } from '../common/ThemeToggle';
import { CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, ShieldCheck, Clock, FileText, Send, Sparkles } from 'lucide-react';

interface CandidateAssessmentFlowProps {
  token: string;
}

export const CandidateAssessmentFlow: React.FC<CandidateAssessmentFlowProps> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [candidateName, setCandidateName] = useState('');
  const [position, setPosition] = useState('');
  
  // Stage 1: Behavioral (40 questions)
  const [behavioralQuestions, setBehavioralQuestions] = useState<Question[]>([]);
  const [behavioralAnswers, setBehavioralAnswers] = useState<Record<string, 'A' | 'B'>>({});
  const [behavioralIndex, setBehavioralIndex] = useState(0);

  // Stage 2: RIASEC (24 questions)
  const [riasecQuestions, setRiasecQuestions] = useState<RiasecQuestion[]>([]);
  const [riasecAnswers, setRiasecAnswers] = useState<Record<string, 'A' | 'B'>>({});
  const [riasecIndex, setRiasecIndex] = useState(0);

  // Flow Stages: 'welcome' | 'behavioral' | 'transition' | 'riasec' | 'completed'
  const [stage, setStage] = useState<'welcome' | 'behavioral' | 'transition' | 'riasec' | 'completed'>('welcome');
  
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAssessment();
  }, [token]);

  const loadAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_candidate_assessment_by_token', {
        p_token: token
      });

      if (rpcError) throw rpcError;
      if (data && !data.success) {
        setError(data.error || 'Avaliação não encontrada ou token inválido');
        setLoading(false);
        return;
      }

      const assessmentObj = data.assessment || {};
      const candidateObj = data.candidate || {};
      setAssessmentId(assessmentObj.id || '');
      setCandidateName(candidateObj.name || 'Candidato');
      setPosition(candidateObj.position || 'Operador de Atendimento');

      // Set Behavioral questions & answers
      setBehavioralQuestions(data.questions || []);
      const bAnsMap: Record<string, 'A' | 'B'> = {};
      (data.answers || []).forEach((a: any) => {
        if (a.question_id && a.selected_option) {
          bAnsMap[a.question_id] = a.selected_option;
        }
      });
      setBehavioralAnswers(bAnsMap);

      // Set RIASEC questions & answers
      let rQuestions: RiasecQuestion[] = data.riasec_questions || [];
      if (!rQuestions || rQuestions.length === 0) {
        rQuestions = RIASEC_QUESTIONS_CATALOG.map((rq, idx) => ({
          ...rq,
          id: `static-rq-${idx + 1}`
        }));
      }
      setRiasecQuestions(rQuestions);

      const rAnsMap: Record<string, 'A' | 'B'> = {};
      (data.riasec_answers || []).forEach((ra: any) => {
        if (ra.question_id && ra.selected_option) {
          rAnsMap[ra.question_id] = ra.selected_option;
        }
      });
      setRiasecAnswers(rAnsMap);

      const hasCompletedRiasec = (data.riasec_answers || []).length >= 24;

      if (assessmentObj.status === 'completed' && hasCompletedRiasec) {
        setStage('completed');
      } else if (assessmentObj.status === 'completed' && !hasCompletedRiasec) {
        // If behavioral part was completed before RIASEC function was active, resume at Stage 2 transition
        setStage('transition');
      }
    } catch (err: any) {
      console.error('Erro ao carregar avaliação:', err);
      setError('Ocorreu um erro ao carregar os dados da avaliação. Verifique a chave de acesso.');
    } finally {
      setLoading(false);
    }
  };

  // Stage 1 Answer Selection
  const handleSelectBehavioralOption = async (option: 'A' | 'B') => {
    const currentQ = behavioralQuestions[behavioralIndex];
    if (!currentQ) return;

    const updated = { ...behavioralAnswers, [currentQ.id]: option };
    setBehavioralAnswers(updated);

    setSavingAnswer(true);
    try {
      await supabase.rpc('save_candidate_answer', {
        p_token: token,
        p_question_id: currentQ.id,
        p_selected_option: option
      });
    } catch (err) {
      console.error('Erro ao salvar resposta comportamental:', err);
    } finally {
      setSavingAnswer(false);
    }
  };

  // Stage 2 Answer Selection
  const handleSelectRiasecOption = async (option: 'A' | 'B') => {
    const currentRQ = riasecQuestions[riasecIndex];
    if (!currentRQ) return;

    const chosenDimension = option === 'A' ? currentRQ.dimension_a : currentRQ.dimension_b;
    const updated = { ...riasecAnswers, [currentRQ.id]: option };
    setRiasecAnswers(updated);

    setSavingAnswer(true);
    try {
      if (assessmentId) {
        await supabase.rpc('save_candidate_riasec_answer', {
          p_assessment_id: assessmentId,
          p_question_id: currentRQ.id,
          p_selected_option: option,
          p_dimension: chosenDimension
        });
      }
    } catch (err) {
      console.error('Erro ao salvar resposta RIASEC:', err);
    } finally {
      setSavingAnswer(false);
    }
  };

  // Next Question logic for Stage 1
  const handleNextBehavioral = () => {
    if (behavioralIndex < behavioralQuestions.length - 1) {
      setBehavioralIndex(prev => prev + 1);
    } else {
      // Transition to Stage 2
      setStage('transition');
    }
  };

  // Next Question logic for Stage 2
  const handleNextRiasec = async () => {
    if (riasecIndex < riasecQuestions.length - 1) {
      setRiasecIndex(prev => prev + 1);
    } else {
      // Submit assessment
      await handleSubmitAssessment();
    }
  };

  const handleSubmitAssessment = async () => {
    setSubmitting(true);
    try {
      // Use SECURITY DEFINER RPC to complete the assessment (bypasses RLS for anon users)
      const { error: completeError } = await supabase.rpc('complete_candidate_assessment', {
        p_assessment_id: assessmentId
      });

      if (completeError) throw completeError;

      setStage('completed');
    } catch (err: any) {
      console.error('Erro ao finalizar avaliação:', err);
      alert('Ocorreu um erro ao finalizar sua avaliação. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-900 dark:border-slate-800 dark:border-t-slate-100 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Carregando sua avaliação...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Acesso Restrito</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <div className="text-[11px] text-slate-500">Solicite um novo link ao recrutador responsável pelo seu processo seletivo.</div>
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (stage === 'welcome') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8">
        <header className="max-w-3xl mx-auto w-full flex items-center justify-between py-4">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">Mapa Comportamental</h1>
            <p className="text-xs font-medium text-slate-500">Azevedo</p>
          </div>
          <ThemeToggle />
        </header>

        <main className="max-w-2xl mx-auto w-full my-auto py-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
            <div className="w-14 h-14 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Bem-vindo(a), {candidateName}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Você foi convidado(a) a participar da Avaliação de Perfil Profissional para o cargo de <strong className="text-slate-900 dark:text-slate-100">{position}</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 dark:text-slate-100 font-semibold">Tempo Estimado</strong>
                  <span className="text-slate-500 text-[11px]">Cerca de 10 a 15 minutos.</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 dark:text-slate-100 font-semibold">Sem Respostas Certas</strong>
                  <span className="text-slate-500 text-[11px]">Responda com naturalidade e sinceridade.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStage('behavioral')}
              className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Iniciar Avaliação</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        <footer className="text-center py-4 text-xs text-slate-400">
          Azevedo • Gestão de Avaliação Comportamental
        </footer>
      </div>
    );
  }

  // Transition Stage between Behavioral and RIASEC
  if (stage === 'transition') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8">
        <header className="max-w-3xl mx-auto w-full flex items-center justify-between py-4">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">Mapa Comportamental</h1>
            <p className="text-xs font-medium text-slate-500">Azevedo</p>
          </div>
          <ThemeToggle />
        </header>

        <main className="max-w-2xl mx-auto w-full my-auto py-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Primeira Etapa Concluída!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                Parabéns! Você concluiu as perguntas comportamentais. Agora você encontrará algumas situações envolvendo diferentes tipos de atividades profissionais.
              </p>
            </div>

            <button
              onClick={() => setStage('riasec')}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Continuar para a Segunda Etapa</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        <footer className="text-center py-4 text-xs text-slate-400">
          Etapa 2 de 2 • Preferências Profissionais
        </footer>
      </div>
    );
  }

  // Completion Screen
  if (stage === 'completed') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8">
        <header className="max-w-3xl mx-auto w-full flex items-center justify-between py-4">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">Mapa Comportamental</h1>
            <p className="text-xs font-medium text-slate-500">Azevedo</p>
          </div>
          <ThemeToggle />
        </header>

        <main className="max-w-md mx-auto w-full my-auto py-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Avaliação Concluída!</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Obrigado, <strong className="text-slate-900 dark:text-slate-100">{candidateName}</strong>! Suas respostas foram registradas com sucesso no sistema da Azevedo.
            </p>
            <p className="text-[11px] text-slate-500 italic">
              O recrutador responsável analisará o seu perfil e entrará em contato para os próximos passos do processo seletivo.
            </p>
          </div>
        </main>

        <footer className="text-center py-4 text-xs text-slate-400">
          Azevedo • Avaliação Finalizada
        </footer>
      </div>
    );
  }

  // Active Stage 1 (Behavioral) or Stage 2 (RIASEC)
  const isRiasec = stage === 'riasec';
  const currentQ = isRiasec ? null : behavioralQuestions[behavioralIndex];
  const currentRQ = isRiasec ? riasecQuestions[riasecIndex] : null;

  const totalQuestions = isRiasec ? riasecQuestions.length : behavioralQuestions.length;
  const currentIndex = isRiasec ? riasecIndex : behavioralIndex;
  const selectedOption = isRiasec
    ? (currentRQ ? riasecAnswers[currentRQ.id] : undefined)
    : (currentQ ? behavioralAnswers[currentQ.id] : undefined);

  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar & Progress */}
      <header className="max-w-3xl mx-auto w-full space-y-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {isRiasec ? 'Etapa 2 de 2: Preferências Profissionais' : 'Etapa 1 de 2: Situações Práticas de Atendimento'}
            </span>
            <h2 className="text-xs font-semibold text-slate-500">Candidato: {candidateName}</h2>
          </div>
          <ThemeToggle />
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>Questão {currentIndex + 1} de {totalQuestions}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${isRiasec ? 'bg-blue-600' : 'bg-slate-900 dark:bg-slate-100'}`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Question Card */}
      <main className="max-w-3xl mx-auto w-full my-auto py-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
              Cenário {currentIndex + 1}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {isRiasec ? currentRQ?.text : currentQ?.text}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            {/* Option A */}
            <button
              type="button"
              onClick={() => isRiasec ? handleSelectRiasecOption('A') : handleSelectBehavioralOption('A')}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer ${
                selectedOption === 'A'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/30'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700'
              }`}
            >
              <span className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center shrink-0 text-xs ${
                selectedOption === 'A' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                A
              </span>
              <span className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                {isRiasec ? currentRQ?.option_a : currentQ?.option_a}
              </span>
            </button>

            {/* Option B */}
            <button
              type="button"
              onClick={() => isRiasec ? handleSelectRiasecOption('B') : handleSelectBehavioralOption('B')}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer ${
                selectedOption === 'B'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/30'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-700'
              }`}
            >
              <span className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center shrink-0 text-xs ${
                selectedOption === 'B' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                B
              </span>
              <span className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                {isRiasec ? currentRQ?.option_b : currentQ?.option_b}
              </span>
            </button>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => isRiasec ? setRiasecIndex(prev => Math.max(0, prev - 1)) : setBehavioralIndex(prev => Math.max(0, prev - 1))}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <button
              type="button"
              disabled={!selectedOption || savingAnswer || submitting}
              onClick={isRiasec ? handleNextRiasec : handleNextBehavioral}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {submitting ? (
                <span>Finalizando...</span>
              ) : isRiasec && currentIndex === riasecQuestions.length - 1 ? (
                <>
                  <span>Concluir Avaliação</span>
                  <Send className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Próxima</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <footer className="text-center py-2 text-xs text-slate-400">
        Respostas salvas automaticamente em ambiente seguro Azevedo.
      </footer>
    </div>
  );
};
