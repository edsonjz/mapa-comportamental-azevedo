import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { V2FitDashboard } from './V2FitDashboard';
import { V2MotivatorChart } from './V2MotivatorChart';
import { V2CompetencyChart } from './V2CompetencyChart';
import { RiasecBarChart } from './RiasecBarChart';
import { V2_JOB_NAMES, getV2JobProfile } from '../../lib/v2/jobProfilesV2';
import { V2_DISCLAIMER } from '../../lib/v2/scoringEngineV2';
import {
  X, CheckCircle2, AlertTriangle, ShieldCheck, Brain, Target, MessageSquare,
  TrendingUp, Award, Layers, AlertCircle
} from 'lucide-react';

interface V2AssessmentReportModalProps {
  assessmentId: string;
  candidateName: string;
  targetJobId: string;
  createdAt?: string;
  completedAt?: string;
  onClose: () => void;
}

export const V2AssessmentReportModal: React.FC<V2AssessmentReportModalProps> = ({
  assessmentId, candidateName, targetJobId, onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'fit' | 'competencies' | 'behavior' | 'interview'>('fit');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchV2ReportData();
  }, [assessmentId]);

  const fetchV2ReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all V2 tables in parallel
      const [
        { data: behavior },
        { data: riasec },
        { data: motivation },
        { data: sjt },
        { data: competencies },
        { data: reliability },
        { data: fits },
        { data: interview }
      ] = await Promise.all([
        supabase.from('v2_behavior_scores').select('*').eq('assessment_id', assessmentId).single(),
        supabase.from('v2_riasec_scores').select('*').eq('assessment_id', assessmentId).single(),
        supabase.from('v2_motivation_scores').select('*').eq('assessment_id', assessmentId).single(),
        supabase.from('v2_sjt_scores').select('*').eq('assessment_id', assessmentId).single(),
        supabase.from('v2_competency_scores').select('*').eq('assessment_id', assessmentId).single(),
        supabase.from('v2_reliability_scores').select('*').eq('assessment_id', assessmentId).single(),
        supabase.from('v2_fit_scores').select('*').eq('assessment_id', assessmentId),
        supabase.from('v2_interview_recommendations').select('*').eq('assessment_id', assessmentId).single()
      ]);

      setReportData({
        behavior: behavior?.scores || {},
        riasec: {
          scores: riasec?.scores || {},
          riasecCode: riasec?.riasec_code || 'S-I-C',
          primaryCode: riasec?.primary_code || 'S',
          secondaryCode: riasec?.secondary_code || 'I',
          tertiaryCode: riasec?.tertiary_code || 'C'
        },
        motivation: {
          scores: motivation?.scores || {},
          topMotivators: motivation?.top_motivators || []
        },
        sjt: {
          rawScore: sjt?.raw_score || 0,
          maxScore: sjt?.max_score || 45,
          normalizedScore: sjt?.normalized_score || 0,
          breakdown: sjt?.competency_breakdown || {}
        },
        competencies: competencies?.scores || {},
        reliability: {
          score: reliability?.score || 90,
          classification: reliability?.classification || 'Os resultados apresentam alta consistência.',
          flags: reliability?.flags || []
        },
        fits: fits || [],
        interview: {
          strengths: interview?.strengths || [],
          attentionPoints: interview?.attention_points || [],
          adaptationRisks: interview?.adaptation_risks || [],
          competenciesToDevelop: interview?.competencies_to_develop || [],
          interviewQuestions: interview?.interview_questions || [],
          recommendationText: interview?.recommendation_text || '',
          potentialText: interview?.potential_text || ''
        }
      });
    } catch (err: any) {
      console.error('Error fetching V2 report:', err);
      setError('Erro ao carregar dados do relatório V2.');
    } finally {
      setLoading(false);
    }
  };

  const jobName = V2_JOB_NAMES[targetJobId] || targetJobId;
  const jobProfile = getV2JobProfile(targetJobId);

  // Find primary fit
  const primaryFitRaw = reportData?.fits?.find((f: any) => f.job_id === targetJobId);
  const primaryFit = primaryFitRaw ? {
    jobId: primaryFitRaw.job_id,
    jobName,
    personalityFit: Number(primaryFitRaw.personality_fit),
    behaviorFit: Number(primaryFitRaw.behavior_fit),
    interestFit: Number(primaryFitRaw.interest_fit),
    motivationFit: Number(primaryFitRaw.motivation_fit),
    sjtFit: Number(primaryFitRaw.sjt_fit),
    competencyFit: Number(primaryFitRaw.competency_fit),
    overallFit: Number(primaryFitRaw.overall_fit),
    fitClassification: primaryFitRaw.fit_classification,
    hasSjtSpecific: primaryFitRaw.has_sjt_specific,
    convergences: primaryFitRaw.convergences || [],
    tensions: primaryFitRaw.tensions || [],
    divergences: primaryFitRaw.divergences || []
  } : null;

  const crossFits = reportData?.fits
    ?.filter((f: any) => f.job_id !== targetJobId)
    ?.map((f: any) => ({
      jobId: f.job_id,
      jobName: V2_JOB_NAMES[f.job_id] || f.job_id,
      personalityFit: Number(f.personality_fit),
      behaviorFit: Number(f.behavior_fit),
      interestFit: Number(f.interest_fit),
      motivationFit: Number(f.motivation_fit),
      sjtFit: Number(f.sjt_fit),
      competencyFit: Number(f.competency_fit),
      overallFit: Number(f.overall_fit),
      fitClassification: f.fit_classification,
      hasSjtSpecific: f.has_sjt_specific,
      convergences: f.convergences || [],
      tensions: f.tensions || [],
      divergences: f.divergences || []
    })) || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">

        {/* Modal Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white px-6 py-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">
              V2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
                  Relatório de Decisão de Recrutamento — {candidateName}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Contact Center V2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Função avaliada: <strong className="text-blue-300">{jobName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 my-auto">
            <div className="w-10 h-10 border-4 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium">Carregando relatório multidimensional V2...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 my-auto">
            <AlertCircle className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm font-bold">{error}</p>
            <button
              onClick={fetchV2ReportData}
              className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 cursor-pointer"
            >
              Tentar Novamente
            </button>
          </div>
        ) : (
          <>
            {/* Top Bar Summary: Fit Score + Reliability */}
            <div className="bg-slate-50 dark:bg-slate-950/80 px-6 py-4 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                  {primaryFit ? Math.round(primaryFit.overallFit) : 0}%
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Classificação de Aderência</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{primaryFit?.fitClassification || 'N/A'}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  {reportData.reliability.score}%
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Índice de Confiabilidade</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                    {reportData.reliability.score >= 80 ? 'Alta consistência' : 'Consistência moderada'}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                  {reportData.riasec.riasecCode}
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Código RIASEC</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                    {reportData.riasec.primaryCode}-{reportData.riasec.secondaryCode}-{reportData.riasec.tertiaryCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900 shrink-0">
              {[
                { id: 'fit', label: 'Aderência & Diagnóstico', icon: Target },
                { id: 'competencies', label: 'Competências & SJT', icon: Award },
                { id: 'behavior', label: 'Motivadores & Perfil', icon: Brain },
                { id: 'interview', label: 'Recomendações de Entrevista', icon: MessageSquare }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                      isActive
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Content (scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* TAB 1: Fit & Alignment */}
              {activeTab === 'fit' && primaryFit && (
                <div className="space-y-6">
                  {/* Dashboard Fit */}
                  <V2FitDashboard primaryFit={primaryFit} crossFits={crossFits} />

                  {/* Alignment Analysis: Convergences, Tensions, Divergences */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Análise de Alinhamento: Convergências, Tensões e Divergências</span>
                    </h3>

                    <div className="space-y-3">
                      {/* Convergences */}
                      {primaryFit.convergences.map((item: any, idx: number) => (
                        <div key={idx} className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 space-y-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">{item.title}</h4>
                          </div>
                          <p className="text-xs text-emerald-800 dark:text-emerald-300 pl-6">{item.description}</p>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 pl-6 font-medium">💡 {item.recommendation}</p>
                        </div>
                      ))}

                      {/* Tensions */}
                      {primaryFit.tensions.map((item: any, idx: number) => (
                        <div key={idx} className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">{item.title}</h4>
                          </div>
                          <p className="text-xs text-amber-800 dark:text-amber-300 pl-6">{item.description}</p>
                          <p className="text-[11px] text-amber-700 dark:text-amber-400 pl-6 font-medium">🔍 {item.recommendation}</p>
                        </div>
                      ))}

                      {/* Divergences */}
                      {primaryFit.divergences.map((item: any, idx: number) => (
                        <div key={idx} className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 rounded-xl p-4 space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                            <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">{item.title}</h4>
                          </div>
                          <p className="text-xs text-rose-800 dark:text-rose-300 pl-6">{item.description}</p>
                          <p className="text-[11px] text-rose-700 dark:text-rose-400 pl-6 font-medium">⚠️ {item.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Competencies & SJT */}
              {activeTab === 'competencies' && (
                <div className="space-y-6">
                  {/* SJT Summary Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          Julgamento Situacional (SJT) — {jobName}
                        </h3>
                      </div>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {reportData.sjt.normalizedScore}% ({reportData.sjt.rawScore}/{reportData.sjt.maxScore} pts)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Avalia o alinhamento das decisões do candidato diante de 15 cenários críticos reais da operação.
                    </p>
                  </div>

                  {/* Competencies Chart */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>10 Competências Derivadas (Avaliado vs Exigência da Função)</span>
                    </h3>
                    <V2CompetencyChart
                      scores={reportData.competencies}
                      requiredWeights={jobProfile?.requirements?.competency_weights}
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: Behavior & Motivators */}
              {activeTab === 'behavior' && (
                <div className="space-y-6">
                  {/* Motivators Chart */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Motivadores de Engajamento Profissional</span>
                    </h3>
                    <V2MotivatorChart
                      scores={reportData.motivation.scores}
                      topMotivators={reportData.motivation.topMotivators}
                    />
                  </div>

                  {/* RIASEC Chart */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Interesses Profissionais (RIASEC)</span>
                    </h3>
                    <RiasecBarChart
                      rScore={reportData.riasec.scores.R || 0}
                      iScore={reportData.riasec.scores.I || 0}
                      aScore={reportData.riasec.scores.A || 0}
                      sScore={reportData.riasec.scores.S || 0}
                      eScore={reportData.riasec.scores.E || 0}
                      cScore={reportData.riasec.scores.C || 0}
                      code={reportData.riasec.riasecCode}
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: Interview Recommendations */}
              {activeTab === 'interview' && (
                <div className="space-y-6">
                  {/* Narrative Recommendation */}
                  <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 space-y-2">
                    <h3 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                      Parecer Sintético de Recomendação
                    </h3>
                    <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
                      {reportData.interview.recommendationText}
                    </p>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300 italic pt-1">
                      {reportData.interview.potentialText}
                    </p>
                  </div>

                  {/* Strengths & Attention Points Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                      <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Principais Pontos Fortes</span>
                      </h4>
                      <ul className="space-y-2">
                        {reportData.interview.strengths.map((s: any, idx: number) => (
                          <li key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-700 dark:text-slate-300">
                            <span className="font-semibold">{s.name}</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.score}%</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Attention Points */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                      <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Pontos de Atenção para Entrevista</span>
                      </h4>
                      <ul className="space-y-2">
                        {reportData.interview.attentionPoints.map((a: any, idx: number) => (
                          <li key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 text-slate-700 dark:text-slate-300">
                            <span className="font-semibold">{a.name}</span>
                            <span className="text-[11px] text-amber-700 dark:text-amber-300">
                              Avaliador: <strong>{a.candidateScore}%</strong> / Exigido: <strong>{a.requiredScore}%</strong>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Personalized Interview Questions */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span>5 Perguntas Direcionadas para Entrevista Estruturada</span>
                    </h3>
                    <div className="space-y-2.5">
                      {reportData.interview.interviewQuestions.map((q: string, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium pt-0.5">
                            {q}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Legal Disclaimer */}
              <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80 leading-relaxed">
                <strong>Aviso Legal & Metodológico:</strong> {V2_DISCLAIMER}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">
                Avaliação ID: <code className="text-slate-600 dark:text-slate-300">{assessmentId.substring(0, 8)}</code> • Versão Algoritmo: v2.0
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Fechar Relatório
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
