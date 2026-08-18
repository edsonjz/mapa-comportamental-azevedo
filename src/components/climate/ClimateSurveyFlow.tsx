import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { ClimateQuestion, ClimateDimension, LikertRating } from '../../types/climateTypes';
import { calculateNormalizedScore } from '../../lib/climateScoringEngine';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Send,
  AlertCircle,
  Info
} from 'lucide-react';

interface ClimateSurveyFlowProps {
  user: any;
  onFinished?: () => void;
}

export const ClimateSurveyFlow: React.FC<ClimateSurveyFlowProps> = ({ user, onFinished }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [survey, setSurvey] = useState<any>(null);
  const [dimensions, setDimensions] = useState<ClimateDimension[]>([]);
  const [questions, setQuestions] = useState<ClimateQuestion[]>([]);
  
  // User profile metadata in DB
  const [userProfile, setUserProfile] = useState<any>(null);

  // Flow State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { likert: LikertRating; text: string }>>({});

  useEffect(() => {
    loadSurveyData();
  }, [user]);

  const loadSurveyData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch user profile or create draft profile if missing
      let { data: profile } = await supabase
        .from('climate_user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        // Auto-create default profile for operator if doesn't exist
        const { data: newProfile } = await supabase
          .from('climate_user_profiles')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Operador',
            email: user.email,
            role: 'operador',
            job_role: 'Operador de Atendimento'
          })
          .select('*')
          .single();
        profile = newProfile;
      }
      setUserProfile(profile);

      // 2. Fetch Active Climate Survey
      const { data: activeSurvey, error: surveyErr } = await supabase
        .from('climate_surveys')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (surveyErr || !activeSurvey) {
        setError('Nenhuma pesquisa de clima ativa no momento.');
        setLoading(false);
        return;
      }
      setSurvey(activeSurvey);

      // 3. Check if user already submitted this survey version
      const { data: existingResp } = await supabase
        .from('climate_responses')
        .select('*')
        .eq('operator_id', user.id)
        .eq('survey_id', activeSurvey.id)
        .eq('status', 'completed')
        .maybeSingle();

      if (existingResp) {
        setSubmitted(true);
        setLoading(false);
        return;
      }

      // 4. Fetch Dimensions and Questions
      const { data: dimsData } = await supabase
        .from('climate_dimensions')
        .select('*')
        .eq('survey_id', activeSurvey.id)
        .order('display_order', { ascending: true });

      const { data: qsData } = await supabase
        .from('climate_questions')
        .select('*')
        .eq('survey_id', activeSurvey.id)
        .order('display_order', { ascending: true });

      if (dimsData) setDimensions(dimsData);
      if (qsData) setQuestions(qsData);

      // Initialize empty answers map
      const initialAnswers: Record<string, { likert: LikertRating; text: string }> = {};
      (qsData || []).forEach((q: ClimateQuestion) => {
        initialAnswers[q.id] = { likert: null, text: '' };
      });
      setAnswers(initialAnswers);

    } catch (err: any) {
      console.error('Erro ao carregar pesquisa de clima:', err);
      setError(err.message || 'Falha ao carregar formulário da pesquisa.');
    } finally {
      setLoading(false);
    }
  };

  const handleLikertSelect = (questionId: string, rating: LikertRating) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        likert: rating
      }
    }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        text
      }
    }));
  };

  const currentDimension = dimensions[currentStepIndex];
  const currentQuestions = questions.filter((q) => q.dimension_id === currentDimension?.id);

  const isCurrentStepValid = () => {
    if (!currentQuestions.length) return true;
    for (const q of currentQuestions) {
      if (q.required) {
        const ans = answers[q.id];
        if (q.question_type === 'likert') {
          // Likert required: must select 1-5 or N/A (null)
          if (!ans || (ans.likert === undefined)) return false;
        } else if (q.question_type === 'open_text') {
          if (!ans || !ans.text || ans.text.trim().length === 0) return false;
        }
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStepIndex < dimensions.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!survey || !userProfile) return;
    setSubmitting(true);
    setError(null);

    try {
      const now = new Date().toISOString();

      // 1. Insert Climate Response Header
      const { data: responseHeader, error: respErr } = await supabase
        .from('climate_responses')
        .insert({
          survey_id: survey.id,
          operator_id: user.id,
          team_id: userProfile.team_id || null,
          supervisor_id: userProfile.supervisor_id || null,
          job_role: userProfile.job_role || 'Operador de Atendimento',
          started_at: now,
          completed_at: now,
          status: 'completed'
        })
        .select('*')
        .single();

      if (respErr) throw respErr;

      // 2. Format and insert all Answers
      const answerRows = questions.map((q) => {
        const userAns = answers[q.id];
        const likertVal = userAns?.likert ?? null;
        const normScore = calculateNormalizedScore(likertVal, q.reverse_scoring);
        const textVal = userAns?.text?.trim() || null;

        return {
          response_id: responseHeader.id,
          question_id: q.id,
          likert_value: likertVal,
          normalized_score: normScore,
          text_value: textVal,
          answered_at: now
        };
      });

      const { error: answersErr } = await supabase
        .from('climate_answers')
        .insert(answerRows);

      if (answersErr) throw answersErr;

      // 3. Log Audit
      await supabase.from('climate_audit_logs').insert({
        survey_id: survey.id,
        operator_id: user.id,
        actor_id: user.id,
        action: 'SUBMIT_CLIMATE_SURVEY',
        details: { response_id: responseHeader.id, answered_count: answerRows.length }
      });

      setSubmitted(true);
      if (onFinished) onFinished();

    } catch (err: any) {
      console.error('Erro ao enviar pesquisa:', err);
      setError(err.message || 'Ocorreu um erro ao salvar suas respostas. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-xs font-semibold">Carregando Pesquisa de Clima Organizacional...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold mb-2 text-white">Pesquisa Enviada com Sucesso!</h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            Sua opinião é fundamental para a evolução do nosso ambiente de trabalho e da operação do 156.
          </p>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between text-slate-400">
              <span>Pesquisa:</span>
              <span className="font-semibold text-slate-200">{survey?.name || 'Clima 2026'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Status:</span>
              <span className="font-semibold text-emerald-400">Concluída & Registrada</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Data de Envio:</span>
              <span className="font-semibold text-slate-200">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Suas respostas foram registradas com segurança e serão utilizadas para análises agregadas e melhoria contínua da operação.
          </p>
        </div>
      </div>
    );
  }

  if (error || dimensions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-rose-400 mb-2">Aviso de Acesso</h3>
          <p className="text-slate-300 text-xs mb-6">{error || 'Não foi possível carregar a pesquisa.'}</p>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentStepIndex + 1) / dimensions.length) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Bar Navigation */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/40 rounded-xl flex items-center justify-center text-blue-400 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">Pesquisa de Clima Organizacional</h1>
              <p className="text-[11px] text-slate-400">Contact Center Azevedo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col">
        
        {/* Transparency Disclaimer Box */}
        <div className="bg-blue-950/40 border border-blue-800/50 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-inner">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-200 leading-relaxed">
            <span className="font-semibold text-blue-100 block mb-0.5">Sua participação é valiosa</span>
            Suas respostas serão registradas para fins de análise organizacional e melhoria contínua da operação.
          </div>
        </div>

        {/* Progress Bar & Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-blue-400 uppercase tracking-wider">
              Etapa {currentStepIndex + 1} de {dimensions.length}
            </span>
            <span className="text-slate-400 font-semibold">{progressPercent}% Concluído</span>
          </div>

          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mb-4 border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">
            {currentDimension?.name}
          </h2>
          <p className="text-xs text-slate-400">
            {currentDimension?.description}
          </p>
        </div>

        {/* Error message banner */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-xs mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Questions Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8 flex-1">
          {currentQuestions.map((q) => {
            const currentAns = answers[q.id];

            if (q.question_type === 'likert') {
              return (
                <div key={q.id} className="border-b border-slate-800/80 pb-8 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-800/40">
                      {q.code}
                    </span>
                    {q.required && (
                      <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        Obrigatória
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 leading-relaxed mb-5">
                    {q.question}
                  </h3>

                  {/* Likert Scale Buttons (1 to 5) + N/A */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {[
                      { value: 1, label: 'Discordo totalmente', short: '1' },
                      { value: 2, label: 'Discordo parcialmente', short: '2' },
                      { value: 3, label: 'Nem concordo, nem discordo', short: '3' },
                      { value: 4, label: 'Concordo parcialmente', short: '4' },
                      { value: 5, label: 'Concordo totalmente', short: '5' }
                    ].map((option) => {
                      const isSelected = currentAns?.likert === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleLikertSelect(q.id, option.value as LikertRating)}
                          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 scale-[1.02]'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                          }`}
                        >
                          <span className="text-base font-extrabold mb-1">{option.short}</span>
                          <span className="text-[10px] leading-tight font-medium opacity-90">{option.label}</span>
                        </button>
                      );
                    })}

                    {/* N/A Button */}
                    <button
                      type="button"
                      onClick={() => handleLikertSelect(q.id, null)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                        currentAns?.likert === null
                          ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/30 scale-[1.02]'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="text-base font-extrabold mb-1">N/A</span>
                      <span className="text-[10px] leading-tight font-medium opacity-90">Não tenho elementos</span>
                    </button>
                  </div>
                </div>
              );
            } else {
              // Open text question
              return (
                <div key={q.id} className="border-b border-slate-800/80 pb-8 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/40">
                      {q.code}
                    </span>
                    {q.required ? (
                      <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        Prioritária
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        Opcional
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 leading-relaxed mb-3">
                    {q.question}
                  </h3>

                  <textarea
                    rows={3}
                    value={currentAns?.text || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    placeholder="Escreva sua contribuição detalhada aqui..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl p-4 text-xs text-white focus:outline-none transition-colors leading-relaxed resize-y"
                  />
                </div>
              );
            }
          })}
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0 || submitting}
            className="px-5 py-3 rounded-2xl border border-slate-800 text-slate-300 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {currentStepIndex < dimensions.length - 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!isCurrentStepValid() || submitting}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Próxima Etapa</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isCurrentStepValid() || submitting}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <span>Finalizar e Enviar Respostas</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

      </main>
    </div>
  );
};
