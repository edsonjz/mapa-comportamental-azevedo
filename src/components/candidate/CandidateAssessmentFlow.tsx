import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Question } from '../../types/database';
import { ThemeToggle } from '../common/ThemeToggle';
import { CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, ShieldCheck, Clock, FileText, Send } from 'lucide-react';

interface CandidateAssessmentFlowProps {
  token: string;
}

export const CandidateAssessmentFlow: React.FC<CandidateAssessmentFlowProps> = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [candidateName, setCandidateName] = useState('');
  const [position, setPosition] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B'>>({});
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);
  const [started, setStarted] = useState(false);

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
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setCandidateName(data.candidate_name || 'Candidato');
      setPosition(data.position || 'Operador de Atendimento');
      setQuestions(data.questions || []);
      setAnswers(data.answers || {});

      if (data.status === 'completed') {
        setCompletedSuccess(true);
      } else if (data.status === 'in_progress' || Object.keys(data.answers || {}).length > 0) {
        setStarted(true);
      }
    } catch (err: any) {
      console.error('Erro ao carregar avaliação:', err);
      setError('Ocorreu um erro ao carregar os dados da avaliação. Verifique a chave de acesso.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = async (option: 'A' | 'B') => {
    if (!questions[currentIndex]) return;
    const currentQ = questions[currentIndex];
    
    const updatedAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(updatedAnswers);

    setSavingAnswer(true);
    try {
      await supabase.rpc('save_candidate_answer', {
        p_token: token,
        p_question_id: currentQ.id,
        p_selected_option: option
      });
    } catch (err) {
      console.error('Erro ao salvar resposta:', err);
    } finally {
      setSavingAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsReviewMode(true);
    }
  };

  const handlePrev = () => {
    if (isReviewMode) {
      setIsReviewMode(false);
      setCurrentIndex(questions.length - 1);
    } else if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinalize = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: rpcErr } = await supabase.rpc('finalize_candidate_assessment', {
        p_token: token
      });

      if (rpcErr) throw rpcErr;
      if (data.error) {
        setError(data.error);
        setSubmitting(false);
        return;
      }

      setCompletedSuccess(true);
    } catch (err: any) {
      console.error('Erro ao finalizar avaliação:', err);
      setError('Não foi possível finalizar a avaliação. Verifique se respondeu todas as questões.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-100 dark:text-slate-100 light:text-slate-900 transition-colors relative">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <div className="w-12 h-12 border-4 border-slate-600 border-t-slate-200 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium text-xs">Carregando questionário de avaliação...</p>
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 flex items-center justify-center p-6 transition-colors relative">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-2">Acesso Restrito</h2>
          <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm mb-6">{error}</p>
          <p className="text-xs text-slate-500">Solicite um novo link ao recrutador responsável pelo seu processo seletivo.</p>
        </div>
      </div>
    );
  }

  if (completedSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 flex items-center justify-center p-6 transition-colors relative">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-3">
            Avaliação Concluída com Sucesso!
          </h2>
          <p className="text-slate-300 dark:text-slate-300 light:text-slate-700 text-sm leading-relaxed mb-6">
            Obrigado, <strong className="text-emerald-400">{candidateName}</strong>. Suas respostas foram salvas e enviadas com segurança ao recrutador responsável.
          </p>
          <div className="bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl p-4 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed text-left flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 dark:text-slate-200 light:text-slate-900 block mb-1">Informação sobre o processo</strong>
              Os resultados desta etapa são integrados diretamente ao painel da equipe de Seleção para análise de alinhamento ao cargo. Não é necessária nenhuma ação adicional de sua parte.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (!started) {
    return (
      <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 flex items-center justify-center p-4 sm:p-6 transition-colors relative">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-900 border border-slate-700 text-slate-100 font-bold flex items-center justify-center">
                MA
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  Mapa Comportamental
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  Azevedo
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/70 dark:bg-slate-950/70 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-3 mb-3 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
              <span>Candidato: <strong className="text-slate-200 dark:text-slate-200 light:text-slate-900">{candidateName}</strong></span>
              <span>Cargo: <strong className="text-blue-400 light:text-blue-700">{position}</strong></span>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>40 Questões Práticas</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Duração aprox.: 12 a 15 min</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-8 text-sm text-slate-300 dark:text-slate-300 light:text-slate-700">
            <h3 className="font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900 text-base">Instruções para realização:</h3>
            <ul className="space-y-2 list-disc list-inside text-slate-400 dark:text-slate-400 light:text-slate-600 text-xs sm:text-sm">
              <li>Apresentaremos 40 cenários reais enfrentados diariamente em operações de atendimento.</li>
              <li>Não existem respostas certas ou erradas. Escolha a alternativa que melhor representa seu comportamento habitual de trabalho.</li>
              <li>Seu progresso é salvo automaticamente a cada resposta. Você pode navegar entre as questões antes de finalizar.</li>
              <li>Você pode alternar entre o <strong>Modo Claro</strong> e <strong>Modo Escuro</strong> usando o botão no canto superior direito.</li>
            </ul>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 light:bg-slate-900 light:hover:bg-slate-800 text-white font-semibold py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            <span>Iniciar Avaliação</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);
  const currentQ = questions[currentIndex];
  const selectedOption = currentQ ? answers[currentQ.id] : undefined;

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 flex flex-col justify-between p-4 sm:p-8 transition-colors">
      {/* Header & Progress Bar */}
      <header className="max-w-3xl w-full mx-auto mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-semibold text-slate-200 dark:text-slate-200 light:text-slate-900">{candidateName}</span>
            <span className="text-slate-600">•</span>
            <span className="text-blue-400 light:text-blue-700 font-medium truncate max-w-[220px]">{position}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {savingAnswer && <span className="text-xs text-blue-400 animate-pulse">Salvando...</span>}
            <span className="font-medium text-slate-300 dark:text-slate-300 light:text-slate-600 text-xs">
              {answeredCount} de {totalCount} ({progressPercent}%)
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 dark:bg-slate-900 light:bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-800 dark:border-slate-800 light:border-slate-300">
          <div
            className="bg-slate-600 dark:bg-slate-400 light:bg-slate-800 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </header>

      {/* Main Question / Review Area */}
      <main className="max-w-3xl w-full mx-auto flex-1 flex flex-col justify-center my-4">
        {isReviewMode ? (
          <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-2">
              Revisão e Confirmação Final
            </h2>
            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm mb-6">
              Você respondeu <strong className="text-emerald-400">{answeredCount}</strong> de <strong className="text-slate-200 dark:text-slate-200 light:text-slate-900">{totalCount}</strong> questões. Clique em qualquer número para alterar sua resposta se desejar.
            </p>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-8">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsReviewMode(false);
                    }}
                    className={`h-10 rounded-xl font-medium text-xs border transition-all flex items-center justify-center cursor-pointer ${
                      isAnswered
                        ? 'bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border-slate-700 dark:border-slate-700 light:border-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-800'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
              <button
                onClick={() => {
                  setIsReviewMode(false);
                  setCurrentIndex(questions.length - 1);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 dark:border-slate-700 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar para as Questões</span>
              </button>

              <button
                onClick={handleFinalize}
                disabled={submitting || answeredCount < totalCount}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  answeredCount < totalCount
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processando e Finalizando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Finalizar Avaliação</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Single Question Display */
          <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-400 light:text-blue-700 mb-4 tracking-wider uppercase">
              <span>Questão {currentIndex + 1} de {totalCount}</span>
              {selectedOption && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Respondida</span>}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-8 leading-snug">
              {currentQ?.text}
            </h2>

            {/* Option Cards A & B */}
            <div className="space-y-4 mb-8">
              <button
                onClick={() => handleSelectOption('A')}
                className={`w-full p-5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 cursor-pointer group ${
                  selectedOption === 'A'
                    ? 'bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border-blue-500 ring-2 ring-blue-500/20 text-slate-100 dark:text-slate-100 light:text-slate-900 shadow-md'
                    : 'bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-sm shrink-0 transition-colors ${
                  selectedOption === 'A'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-700'
                }`}>
                  A
                </div>
                <div className="text-sm sm:text-base leading-relaxed pt-0.5">
                  {currentQ?.option_a}
                </div>
              </button>

              <button
                onClick={() => handleSelectOption('B')}
                className={`w-full p-5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-4 cursor-pointer group ${
                  selectedOption === 'B'
                    ? 'bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border-blue-500 ring-2 ring-blue-500/20 text-slate-100 dark:text-slate-100 light:text-slate-900 shadow-md'
                    : 'bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-sm shrink-0 transition-colors ${
                  selectedOption === 'B'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-700'
                }`}>
                  B
                </div>
                <div className="text-sm sm:text-base leading-relaxed pt-0.5">
                  {currentQ?.option_b}
                </div>
              </button>
            </div>

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`px-4 py-2.5 rounded-xl border text-sm flex items-center gap-2 transition-colors cursor-pointer ${
                  currentIndex === 0
                    ? 'border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-600 dark:text-slate-600 light:text-slate-400 cursor-not-allowed'
                    : 'border-slate-700 dark:border-slate-700 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <button
                onClick={handleNext}
                className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 light:bg-slate-900 light:hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>{currentIndex === totalCount - 1 ? 'Revisar Respostas' : 'Próxima'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Candidate Footer */}
      <footer className="max-w-3xl w-full mx-auto text-center text-xs text-slate-500 dark:text-slate-500 light:text-slate-600 py-3 border-t border-slate-900 dark:border-slate-900 light:border-slate-200">
        Mapa Comportamental Azevedo • Avaliação de Desempenho e Alinhamento
      </footer>
    </div>
  );
};
