import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Assessment, Candidate, AssessmentScores } from '../../types/database';
import { BigFiveRadarChart } from './BigFiveRadarChart';
import { getFactorBadgeClass, calculateJobProfileCompatibility } from '../../lib/scoringEngine';
import { JOB_TARGET_PROFILES, PROFILES_CATALOG } from '../../lib/profilesData';
import { ThemeToggle } from '../common/ThemeToggle';
import { 
  X, Printer, RefreshCw, FileText, AlertTriangle, 
  Briefcase, HelpCircle, ShieldAlert, Sparkles, Building2, User, Calendar, BookOpen, Info
} from 'lucide-react';

interface AssessmentReportModalProps {
  assessment: Assessment & { candidate?: Candidate };
  onClose: () => void;
}

export const AssessmentReportModal: React.FC<AssessmentReportModalProps> = ({ assessment, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<AssessmentScores | null>(null);
  const [recalculating, setRecalculating] = useState(false);
  const [selectedJobTarget, setSelectedJobTarget] = useState<string>('operador-padrao');
  const [showGuide, setShowGuide] = useState<boolean>(false);

  useEffect(() => {
    fetchScores();
  }, [assessment.id]);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assessment_scores')
        .select('*')
        .eq('assessment_id', assessment.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar pontuações:', error);
      } else if (data) {
        setScores(data as AssessmentScores);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const { error } = await supabase.rpc('calculate_and_store_assessment_scores', {
        p_assessment_id: assessment.id
      });
      if (error) throw error;
      await fetchScores();
    } catch (err) {
      console.error('Erro ao recalcular:', err);
      alert('Não foi possível recalcular as pontuações.');
    } finally {
      setRecalculating(false);
    }
  };

  const handlePrint = () => {
    document.body.classList.add('printing-report');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-report');
    }, 1000);
  };

  const candidate = assessment.candidate;
  const jobFit = scores ? calculateJobProfileCompatibility(scores, selectedJobTarget) : null;
  const primaryProfileCatalog = scores?.primary_profile ? PROFILES_CATALOG[scores.primary_profile] : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl max-w-5xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh] card-print">
        
        {/* Header Action Bar */}
        <div className="bg-slate-950 dark:bg-slate-950 light:bg-slate-100 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 p-4 sm:px-6 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-300 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Mapa Comportamental
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Azevedo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Entender cálculos, notas e deltas (+ / - pts)"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showGuide ? 'Ocultar Guia' : 'Guia de Métricas'}</span>
            </button>

            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-700 text-slate-300 dark:text-slate-300 light:text-slate-800 text-xs font-medium border border-slate-700 dark:border-slate-700 light:border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Recalcular pontuações no servidor"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden sm:inline">Recalcular</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div id="report-printable-area" className="p-4 sm:p-8 overflow-y-auto space-y-8 flex-1 bg-slate-900 dark:bg-slate-900 light:bg-slate-50 print:bg-white text-slate-100 dark:text-slate-100 light:text-slate-900 print:text-slate-900">
          
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-10 h-10 border-4 border-slate-600 border-t-slate-200 rounded-full animate-spin mx-auto mb-3"></div>
              <span>Carregando e processando relatório psicométrico...</span>
            </div>
          ) : !scores ? (
            <div className="py-16 text-center text-slate-400 bg-slate-950/40 dark:bg-slate-950/40 light:bg-white rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 p-8">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-200 dark:text-slate-200 light:text-slate-900 mb-2">Pontuações ainda não calculadas</h3>
              <p className="text-sm mb-4">Esta avaliação ainda não foi finalizada pelo candidato ou aguarda processamento.</p>
              <button
                onClick={handleRecalculate}
                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md cursor-pointer"
              >
                Executar Processamento Agora
              </button>
            </div>
          ) : (
            <>
              {/* Document Header Info */}
              <div className="bg-slate-950/80 dark:bg-slate-950/80 light:bg-white print:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 print:border-slate-300 rounded-2xl p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 light:text-slate-500 print:text-slate-500 block mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-400" /> Nome do Candidato:
                    </span>
                    <strong className="text-slate-100 dark:text-slate-100 light:text-slate-900 print:text-slate-900 text-sm">{candidate?.name || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 light:text-slate-500 print:text-slate-500 block mb-1 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-400" /> Cargo Pretendido:
                    </span>
                    <strong className="text-slate-100 dark:text-slate-100 light:text-slate-900 print:text-slate-900 text-sm">{candidate?.position || 'Operador de Atendimento'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 light:text-slate-500 print:text-slate-500 block mb-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" /> Departamento:
                    </span>
                    <strong className="text-slate-100 dark:text-slate-100 light:text-slate-900 print:text-slate-900 text-sm">{candidate?.department || 'Operações'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-400 light:text-slate-500 print:text-slate-500 block mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" /> Data de Conclusão:
                    </span>
                    <strong className="text-slate-100 dark:text-slate-100 light:text-slate-900 print:text-slate-900 text-sm">
                      {assessment.completed_at ? new Date(assessment.completed_at).toLocaleDateString('pt-BR') : 'Finalizado'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Profiles Result Banner */}
              <div className="bg-slate-950 dark:bg-slate-950 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 sm:p-8 relative shadow-md">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-blue-400 print:text-blue-600" />
                      <span className="text-xs font-bold tracking-wider uppercase text-blue-300 dark:text-blue-300 light:text-blue-700">Classificação de Estilo Comportamental</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 dark:bg-slate-800 light:bg-slate-100 text-slate-200 dark:text-slate-200 light:text-slate-800 border border-slate-700 dark:border-slate-700 light:border-slate-300">
                        {scores.profile_classification_type}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white dark:text-white light:text-slate-900 print:text-slate-900 mb-1">
                      {scores.primary_profile}
                    </h3>
                    
                    {scores.secondary_profile && (
                      <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
                        Perfil Secundário de Apoio: <strong className="text-slate-200 dark:text-slate-200 light:text-slate-800 font-semibold">{scores.secondary_profile}</strong>
                      </p>
                    )}
                  </div>

                  {jobFit && (
                    <div className="bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-4 text-center shrink-0 min-w-[200px]">
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 light:text-slate-600 block mb-1">Aderência ao Cargo Selecionado</span>
                      <div className="text-3xl font-extrabold text-emerald-400 dark:text-emerald-400 light:text-emerald-700">{jobFit.compatibilityScore}%</div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 light:text-slate-600 mt-1">{jobFit.recommendation}</p>
                    </div>
                  )}
                </div>

                {primaryProfileCatalog && (
                  <p className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 mt-4 leading-relaxed border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 pt-4">
                    {primaryProfileCatalog.description}
                  </p>
                )}
              </div>

              {/* Big Five Radar Chart & Factor Scores */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-slate-950/80 dark:bg-slate-950/80 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col items-center justify-center p-4">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-wider mb-4">
                    Mapeamento de Competências Big Five
                  </h4>
                  <BigFiveRadarChart
                    openness={scores.openness_score}
                    conscientiousness={scores.conscientiousness_score}
                    extraversion={scores.extraversion_score}
                    agreeableness={scores.agreeableness_score}
                    emotionalStability={scores.emotional_stability_score}
                  />
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-wider mb-4">
                    Detalhamento dos Fatores Psicométricos
                  </h4>

                  {[
                    { label: 'Abertura a Experiências (O)', score: scores.openness_score, desc: 'Criatividade, facilidade de adaptação a novos roteiros e aprendizado.' },
                    { label: 'Conscienciosidade (C)', score: scores.conscientiousness_score, desc: 'Organização, rigor com normas operacionais e pontualidade.' },
                    { label: 'Extroversão (E)', score: scores.extraversion_score, desc: 'Energia de comunicação, assertividade e sociabilidade no atendimento.' },
                    { label: 'Amabilidade (A)', score: scores.agreeableness_score, desc: 'Empatia, cordialidade e espírito colaborativo em equipe.' },
                    { label: 'Estabilidade Emocional (ES)', score: scores.emotional_stability_score, desc: 'Tolerância ao estresse e controle emocional em chamadas críticas.' },
                  ].map((factor, idx) => (
                    <div key={idx} className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-200 dark:text-slate-200 light:text-slate-900">{factor.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900">{factor.score}%</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getFactorBadgeClass(factor.score)}`}>
                            {factor.score >= 70 ? 'Alto' : factor.score >= 40 ? 'Moderado' : 'Baixo'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 leading-tight">{factor.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Target Selector & Fit Analysis */}
              <div className="bg-slate-950/80 dark:bg-slate-950/80 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 dark:text-slate-200 light:text-slate-900 flex items-center gap-2">
                      <span>Simulação de Aderência a Cargos Operacionais</span>
                      <button
                        type="button"
                        onClick={() => setShowGuide(!showGuide)}
                        className="text-blue-400 hover:text-blue-300 text-xs no-print flex items-center gap-1 cursor-pointer font-normal underline"
                      >
                        <Info className="w-3.5 h-3.5" />
                        O que significam estes números?
                      </button>
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
                      Selecione um perfil de referência para comparar as competências do candidato.
                    </p>
                  </div>
                  <select
                    value={selectedJobTarget}
                    onChange={(e) => setSelectedJobTarget(e.target.value)}
                    className="bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {JOB_TARGET_PROFILES.map((job) => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                </div>

                {jobFit && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { name: 'Abertura (O)', diff: jobFit.opennessDiff },
                      { name: 'Conscienciosidade (C)', diff: jobFit.conscientiousnessDiff },
                      { name: 'Extroversão (E)', diff: jobFit.extraversionDiff },
                      { name: 'Amabilidade (A)', diff: jobFit.agreeablenessDiff },
                      { name: 'Estabilidade Emocional (ES)', diff: jobFit.emotionalStabilityDiff },
                    ].map((d, i) => {
                      let statusText = 'Alinhado à Meta';
                      let statusClass = 'text-blue-400 dark:text-blue-400 light:text-blue-700';

                      if (d.diff > 3) {
                        statusText = 'Supera a Meta';
                        statusClass = 'text-emerald-400 dark:text-emerald-400 light:text-emerald-700';
                      } else if (d.diff < -3) {
                        statusText = 'Abaixo da Meta';
                        statusClass = 'text-amber-400 dark:text-amber-400 light:text-amber-700';
                      }

                      return (
                        <div key={i} className="bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 p-3.5 rounded-2xl text-center">
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 light:text-slate-600 block mb-1">{d.name}</span>
                          <span className={`text-base font-extrabold block ${statusClass}`}>
                            {d.diff > 0 ? `+${d.diff}` : d.diff} pts
                          </span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                            {statusText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Collapsible Explanatory Knowledge Base Section */}
              {(showGuide || true) && (
                <div className="bg-slate-950/90 dark:bg-slate-950/90 light:bg-slate-100 border border-blue-500/20 dark:border-slate-800 light:border-slate-300 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 pb-3">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    <h4 className="text-sm font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                      Guia de Interpretação das Métricas & Deltas (+ / - pts)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-slate-300 dark:text-slate-300 light:text-slate-700">
                    {/* Column 1: Porcentagens */}
                    <div className="bg-slate-900 dark:bg-slate-900 light:bg-white p-4 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200">
                      <h5 className="font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-2 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        1. Porcentagens de Fator (0% a 100%)
                      </h5>
                      <p className="mb-2 text-[11px]">
                        Indicam a intensidade natural do candidato em cada uma das 5 dimensões psicométricas:
                      </p>
                      <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-400 dark:text-slate-400 light:text-slate-600">
                        <li><strong className="text-slate-200 dark:text-slate-200 light:text-slate-900">&lt; 40% (Baixo):</strong> Menor alinhamento com a característica. Ex: Conscienciosidade baixa indica perfil informal e espontâneo.</li>
                        <li><strong className="text-slate-200 dark:text-slate-200 light:text-slate-900">40% a 65% (Moderado):</strong> Nível equilibrado e adaptável conforme a exigência do momento.</li>
                        <li><strong className="text-slate-200 dark:text-slate-200 light:text-slate-900">&gt; 65% (Alto):</strong> Forte inclinação natural àquela competência no dia a dia.</li>
                      </ul>
                    </div>

                    {/* Column 2: O que são os Deltas + / - pts */}
                    <div className="bg-slate-900 dark:bg-slate-900 light:bg-white p-4 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200">
                      <h5 className="font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-2 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        2. Entendendo os Deltas (+ / - pts)
                      </h5>
                      <p className="mb-2 text-[11px]">
                        O Delta é a diferença exata entre a nota do candidato e a meta exigida pelo cargo selecionado:
                      </p>
                      <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-400 dark:text-slate-400 light:text-slate-600">
                        <li><strong className="text-emerald-400">Positivo (ex: +8 pts):</strong> O candidato ultrapassa a nota recomendada. É um <strong>diferencial / ponto forte</strong>.</li>
                        <li><strong className="text-amber-400">Negativo (ex: -29 pts):</strong> O candidato pontua abaixo do esperado para a vaga. É uma <strong>oportunidade de desenvolvimento</strong>.</li>
                        <li><strong className="text-blue-400">Próximo a Zero (ex: -2 pts):</strong> Perfeita sintonia com o perfil ideal recomendado.</li>
                      </ul>
                    </div>

                    {/* Column 3: Porcentagem de Aderência */}
                    <div className="bg-slate-900 dark:bg-slate-900 light:bg-white p-4 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200">
                      <h5 className="font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-2 text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                        3. Aderência Global (%)
                      </h5>
                      <p className="mb-2 text-[11px]">
                        Índice final de compatibilidade do candidato com o cargo de referência:
                      </p>
                      <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-400 dark:text-slate-400 light:text-slate-600">
                        <li><strong className="text-slate-200 dark:text-slate-200 light:text-slate-900">&ge; 80%:</strong> Altíssima compatibilidade. Rápida adaptação e alto desempenho projetado.</li>
                        <li><strong className="text-slate-200 dark:text-slate-200 light:text-slate-900">60% a 79%:</strong> Boa aderência com pontos pontuais a acompanhar em treinamento.</li>
                        <li><strong className="text-slate-200 dark:text-slate-200 light:text-slate-900">&lt; 60%:</strong> Exige validação aprofundada ou reavaliação para outro cargo.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Interview Questions */}
              <div className="bg-slate-950/80 dark:bg-slate-950/80 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-slate-200 dark:text-slate-200 light:text-slate-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <span>Perguntas Sugeridas para Validação em Entrevista</span>
                </h4>
                <div className="space-y-3">
                  {(scores.interview_questions || primaryProfileCatalog?.suggested_interview_questions || []).map((q: string, i: number) => (
                    <div key={i} className="bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-3.5 text-xs text-slate-200 dark:text-slate-200 light:text-slate-800 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs border border-slate-700 dark:border-slate-700 light:border-slate-300">
                        {i + 1}
                      </span>
                      <p className="leading-relaxed pt-0.5">{q}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-100 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 rounded-2xl p-4 text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed text-center italic flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  <strong>Observação Metodológica:</strong> Este relatório é uma ferramenta de apoio à avaliação comportamental e tomada de decisão no processo seletivo da Azevedo.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
