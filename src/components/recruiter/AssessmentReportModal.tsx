import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Assessment, Candidate, AssessmentScores, JobProfile } from '../../types/database';
import { BigFiveRadarChart } from './BigFiveRadarChart';
import { RiasecBarChart } from './RiasecBarChart';
import { getFactorBadgeClass, calculateIntegratedFit, getFitBadgeClass, getFitClassification } from '../../lib/scoringEngine';
import { INITIAL_JOB_PROFILES } from '../../lib/jobProfilesData';
import { ThemeToggle } from '../common/ThemeToggle';
import { 
  X, Printer, RefreshCw, FileText, AlertTriangle, 
  Briefcase, ShieldAlert, User, Calendar, BookOpen, Info,
  Compass, Target, CheckSquare, Layers, HelpCircle as QuestionIcon
} from 'lucide-react';

interface AssessmentReportModalProps {
  assessment: Assessment & { candidate?: Candidate };
  onClose: () => void;
}

export const AssessmentReportModal: React.FC<AssessmentReportModalProps> = ({ assessment, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<AssessmentScores | null>(null);
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>(INITIAL_JOB_PROFILES);
  const [recalculating, setRecalculating] = useState(false);
  const [selectedJobTarget, setSelectedJobTarget] = useState<string>('operador-padrao');
  const [showGuide, setShowGuide] = useState<boolean>(true);

  useEffect(() => {
    fetchScoresAndProfiles();
  }, [assessment.id]);

  const fetchScoresAndProfiles = async () => {
    setLoading(true);
    try {
      // Fetch scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('assessment_scores')
        .select('*')
        .eq('assessment_id', assessment.id)
        .single();

      if (scoresError && scoresError.code !== 'PGRST116') {
        console.error('Erro ao buscar pontuações:', scoresError);
      } else if (scoresData) {
        setScores(scoresData as AssessmentScores);
      }

      // Fetch custom job profiles if available
      const { data: profilesData } = await supabase
        .from('job_profiles')
        .select('*')
        .eq('active', true);

      if (profilesData && profilesData.length > 0) {
        setJobProfiles(profilesData as JobProfile[]);
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
      await fetchScoresAndProfiles();
    } catch (err) {
      console.error('Erro ao recalcular:', err);
      alert('Não foi possível recalcular as pontuações.');
    } finally {
      setRecalculating(false);
    }
  };

  const candidate = assessment.candidate;

  const handlePrint = () => {
    const printElement = document.getElementById('report-printable-area');
    if (!printElement) {
      window.print();
      return;
    }

    let iframe = document.getElementById('report-print-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'report-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(s => s.outerHTML)
      .join('\n');

    const candidateName = candidate?.name || 'Candidato';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatorio_Comportamental_RIASEC_${candidateName.replace(/\s+/g, '_')}_Azevedo</title>
          ${styleTags}
          <style>
            html, body {
              background-color: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
              height: auto !important;
              min-height: 0 !important;
              max-height: none !important;
              overflow: visible !important;
            }
            .no-print { display: none !important; }
            * {
              overflow: visible !important;
              max-height: none !important;
              box-shadow: none !important;
            }
            body > #report-printable-area {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              width: 100% !important;
              height: auto !important;
              max-height: none !important;
              overflow: visible !important;
              padding: 24px !important;
              background-color: #ffffff !important;
              color: #0f172a !important;
            }
            .bg-slate-900, .bg-slate-950, .bg-slate-950\\/80, .bg-slate-900\\/90, .bg-slate-50, .bg-slate-100 {
              background-color: #ffffff !important;
              color: #0f172a !important;
            }
            .border-slate-800, .border-slate-700, .border-slate-200 {
              border-color: #cbd5e1 !important;
            }
            .text-slate-100, .text-slate-200, .text-slate-300, .text-slate-900, .text-white {
              color: #0f172a !important;
            }
            .text-slate-400, .text-slate-500, .text-slate-600 {
              color: #475569 !important;
            }
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
          </style>
        </head>
        <body>
          <div id="report-printable-area">
            ${printElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 450);
  };

  const integratedFit = scores ? calculateIntegratedFit(scores, selectedJobTarget, jobProfiles) : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh] card-print">
        
        {/* Header Action Bar */}
        <div className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 sm:px-6 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Mapa Comportamental Azevedo
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Avaliação de Personalidade, Interesses RIASEC & Aderência a Cargos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Guia de interpretação das 4 dimensões"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showGuide ? 'Ocultar Guia' : 'Guia de Métricas'}</span>
            </button>

            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-medium border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Recalcular no servidor"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
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
              className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div id="report-printable-area" className="p-4 sm:p-8 overflow-y-auto space-y-8 flex-1 bg-slate-50 dark:bg-slate-900 print:bg-white text-slate-900 dark:text-slate-100 print:text-slate-900">
          
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-10 h-10 border-4 border-slate-400 border-t-slate-800 dark:border-slate-600 dark:border-t-slate-200 rounded-full animate-spin mx-auto mb-3"></div>
              <span>Processando matriz de personalidade, RIASEC e aderência profissional...</span>
            </div>
          ) : !scores ? (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-2">Pontuações ainda não calculadas</h3>
              <p className="text-sm mb-4">Esta avaliação ainda não foi finalizada pelo candidato ou aguarda processamento.</p>
              <button
                onClick={handleRecalculate}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md cursor-pointer"
              >
                Executar Processamento Agora
              </button>
            </div>
          ) : (
            <>
              {/* Document Info Header */}
              <div className="bg-white dark:bg-slate-950/80 print:bg-slate-50 border border-slate-200 dark:border-slate-800 print:border-slate-300 rounded-2xl p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 print:text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Nome do Candidato:
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100 print:text-slate-900 text-sm">{candidate?.name || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 print:text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Cargo Pretendido:
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100 print:text-slate-900 text-sm">{candidate?.position || 'Operador de Atendimento'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 print:text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                      <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Código RIASEC (Holland):
                    </span>
                    <strong className="text-blue-700 dark:text-blue-300 print:text-blue-700 text-sm font-extrabold">{scores.riasec_code || 'S-C-I'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 print:text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Data de Conclusão:
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100 print:text-slate-900 text-sm">
                      {assessment.completed_at ? new Date(assessment.completed_at).toLocaleDateString('pt-BR') : 'Finalizado'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Integrated Multi-Fit Banner */}
              {integratedFit && (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 relative shadow-md">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 print:text-blue-600" />
                        <span className="text-xs font-bold tracking-wider uppercase text-blue-700 dark:text-blue-300">Análise Integrada de Aderência Profissional</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getFitBadgeClass(integratedFit.overallFit)}`}>
                          {integratedFit.fitClassification}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white print:text-slate-900 mb-1">
                        Cargo Avaliado: {integratedFit.jobProfile.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {integratedFit.jobProfile.description}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center shrink-0 min-w-[220px]">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Aderência Global (Overall Fit)</span>
                      <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{integratedFit.overallFit}%</div>
                      <span className="text-[10px] font-bold text-slate-500 block mt-1 uppercase tracking-wider">{integratedFit.fitClassification}</span>
                    </div>
                  </div>

                  {/* 4 Fit Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">1. Personalidade Fit</span>
                      <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{integratedFit.personalityFit}%</div>
                      <span className="text-[9px] text-slate-600 dark:text-slate-400 font-medium">Big Five vs Função</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">2. Interesse Fit</span>
                      <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{integratedFit.interestFit}%</div>
                      <span className="text-[9px] text-slate-600 dark:text-slate-400 font-medium">RIASEC vs Função</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">3. Comportamento Fit</span>
                      <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{integratedFit.situationalFit}%</div>
                      <span className="text-[9px] text-slate-600 dark:text-slate-400 font-medium">AD, RA, MS, OR vs Função</span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">4. Aderência Global</span>
                      <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{integratedFit.overallFit}%</div>
                      <span className="text-[9px] text-slate-600 dark:text-slate-400 font-medium">Média Ponderada</span>
                    </div>
                  </div>
                </div>
              )}

              {/* BLOCO 01: Personalidade (Big Five) */}
              <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold text-xs flex items-center justify-center border border-blue-200 dark:border-blue-800">
                    01
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Perfil de Personalidade (Big Five)</h3>
                    <p className="text-xs text-slate-500">Dimensão 1: Como essa pessoa tende a funcionar naturalmente</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="flex flex-col items-center justify-center p-4">
                    <BigFiveRadarChart
                      openness={scores.openness_score}
                      conscientiousness={scores.conscientiousness_score}
                      extraversion={scores.extraversion_score}
                      agreeableness={scores.agreeableness_score}
                      emotionalStability={scores.emotional_stability_score}
                    />
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">
                      Detalhamento dos 5 Fatores
                    </h4>

                    {[
                      { label: 'Abertura a Experiências (O)', score: scores.openness_score, desc: 'Criatividade, facilidade de adaptação a novos roteiros e aprendizado.' },
                      { label: 'Conscienciosidade (C)', score: scores.conscientiousness_score, desc: 'Organização, rigor com normas operacionais e pontualidade.' },
                      { label: 'Extroversão (E)', score: scores.extraversion_score, desc: 'Energia de comunicação, assertividade e sociabilidade no atendimento.' },
                      { label: 'Amabilidade (A)', score: scores.agreeableness_score, desc: 'Empatia, cordialidade e espírito colaborativo em equipe.' },
                      { label: 'Estabilidade Emocional (ES)', score: scores.emotional_stability_score, desc: 'Tolerância ao estresse e controle emocional em chamadas críticas.' },
                    ].map((factor, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">{factor.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">{factor.score}%</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getFactorBadgeClass(factor.score)}`}>
                              {factor.score >= 70 ? 'Alto' : factor.score >= 40 ? 'Moderado' : 'Baixo'}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">{factor.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {integratedFit && (
                  <div className="bg-slate-50 dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      Resumo Analítico do Estilo de Atendimento ({scores.primary_profile}):
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {integratedFit.dynamicStyleSummary}
                    </p>
                  </div>
                )}
              </div>

              {/* BLOCO 02: Interesses Profissionais (RIASEC) */}
              <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-extrabold text-xs flex items-center justify-center border border-purple-200 dark:border-purple-800">
                      02
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Interesses Profissionais (RIASEC — Holland)</h3>
                      <p className="text-xs text-slate-500">Dimensão 2: Que tipos de atividades despertam maior motivação nesta pessoa</p>
                    </div>
                  </div>
                  {scores.riasec_code && scores.riasec_code !== 'Pendente' && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-xs rounded-full border border-purple-300 dark:border-purple-800">
                      Código Dominante: {scores.riasec_code}
                    </span>
                  )}
                </div>

                {((scores.riasec_s_score ?? 0) + (scores.riasec_c_score ?? 0) + (scores.riasec_i_score ?? 0) + (scores.riasec_r_score ?? 0)) > 0 ? (
                  <>
                    <RiasecBarChart
                      rScore={scores.riasec_r_score ?? 33}
                      iScore={scores.riasec_i_score ?? 50}
                      aScore={scores.riasec_a_score ?? 42}
                      sScore={scores.riasec_s_score ?? 75}
                      eScore={scores.riasec_e_score ?? 50}
                      cScore={scores.riasec_c_score ?? 67}
                      code={scores.riasec_code || 'S-C-I'}
                    />

                    {scores.riasec_summary && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <strong>Resumo de Interesses:</strong> {scores.riasec_summary}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 rounded-2xl text-amber-900 dark:text-amber-300 text-xs flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <strong>Etapa RIASEC Não Concluída:</strong> O candidato concluiu o questionário comportamental Big Five, mas o módulo de interesses profissionais (RIASEC) ainda não foi respondido.
                    </div>
                  </div>
                )}
              </div>

              {/* BLOCO 03: Comportamento Situacional */}
              <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                    03
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Comportamento Situacional (Questionário Prático de Contact Center)</h3>
                    <p className="text-xs text-slate-500">Dimensão 3: Como tende a agir diante de situações reais de atendimento e rotina</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Adaptabilidade (AD)', score: scores.adaptability_score, desc: 'Facilidade com novos roteiros e sistemas.' },
                    { label: 'Resiliência (RA)', score: scores.resilience_score, desc: 'Recuperação rápida após chamadas difíceis.' },
                    { label: 'Maturidade Social (MS)', score: scores.social_maturity_score, desc: 'Diplomacia, paciência e inteligência emocional.' },
                    { label: 'Orientação Operacional (OR)', score: scores.operational_orientation_score, desc: 'Rigor com metas, scripts e tempo de atendimento.' },
                  ].map((ind, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">{ind.label}</span>
                      <div className="text-3xl font-extrabold text-slate-900 dark:text-white my-1">{ind.score}%</div>
                      <p className="text-[10px] text-slate-500 leading-tight">{ind.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* BLOCO 04: Matriz Integrada de Aderência ao Cargo */}
              {integratedFit && (
                <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center justify-center border border-amber-200 dark:border-amber-800">
                        04
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Matriz Integrada de Aderência</h3>
                        <p className="text-xs text-slate-500">Cruzamento das 4 dimensões com as exigências do cargo selecionado</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 no-print">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Cargo de Referência:</span>
                      <select
                        value={selectedJobTarget}
                        onChange={(e) => setSelectedJobTarget(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
                      >
                        {jobProfiles.map((job) => (
                          <option key={job.id} value={job.id}>{job.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Matrix Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                          <th className="p-3.5 font-bold">DIMENSÃO AVALIADA</th>
                          <th className="p-3.5 font-bold text-center">PONTUAÇÃO CANDIDATO</th>
                          <th className="p-3.5 font-bold text-center">EXIGÊNCIA DO CARGO</th>
                          <th className="p-3.5 font-bold text-center">CLASSIFICAÇÃO DE ADERÊNCIA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr>
                          <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">1. Personalidade (Big Five)</td>
                          <td className="p-3.5 text-center font-bold text-slate-900 dark:text-slate-100">{integratedFit.personalityFit}%</td>
                          <td className="p-3.5 text-center text-slate-500">80% recomendados</td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getFitBadgeClass(integratedFit.personalityFit)}`}>
                              {getFitClassification(integratedFit.personalityFit)}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">2. Interesse Profissional (RIASEC)</td>
                          <td className="p-3.5 text-center font-bold text-blue-600 dark:text-blue-400">{integratedFit.interestFit}%</td>
                          <td className="p-3.5 text-center text-slate-500">Foco {integratedFit.jobProfile.name}</td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getFitBadgeClass(integratedFit.interestFit)}`}>
                              {getFitClassification(integratedFit.interestFit)}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">3. Comportamento Situacional</td>
                          <td className="p-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">{integratedFit.situationalFit}%</td>
                          <td className="p-3.5 text-center text-slate-500">AD, RA, MS, OR</td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getFitBadgeClass(integratedFit.situationalFit)}`}>
                              {getFitClassification(integratedFit.situationalFit)}
                            </span>
                          </td>
                        </tr>
                        <tr className="bg-slate-50 dark:bg-slate-900/60 font-bold">
                          <td className="p-3.5 text-slate-900 dark:text-white font-extrabold">ADERÊNCIA GLOBAL (OVERALL FIT)</td>
                          <td className="p-3.5 text-center font-extrabold text-purple-600 dark:text-purple-400 text-sm">{integratedFit.overallFit}%</td>
                          <td className="p-3.5 text-center text-slate-500">—</td>
                          <td className="p-3.5 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getFitBadgeClass(integratedFit.overallFit)}`}>
                              {integratedFit.fitClassification}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tri-Class Alignment Engine: Convergência, Tensão e Divergência */}
              {integratedFit && (
                <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span>Análise Cruzada de Alinhamento (Convergência × Tensão × Divergência)</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Cruzamento inteligente entre Motivação Profissional (RIASEC), Fatores de Personalidade (Big Five) e Comportamento Situacional.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* 🟢 Convergências */}
                    {integratedFit.convergences.map((item, idx) => (
                      <div key={`conv-${idx}`} className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl space-y-1.5">
                        <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 block">{item.title}</span>
                        <p className="text-xs text-emerald-900 dark:text-emerald-200">{item.description}</p>
                        <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"><strong>Recomendação:</strong> {item.recommendation}</p>
                      </div>
                    ))}

                    {/* 🟡 Tensões */}
                    {integratedFit.tensions.map((item, idx) => (
                      <div key={`tens-${idx}`} className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl space-y-1.5">
                        <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 block">{item.title}</span>
                        <p className="text-xs text-amber-900 dark:text-amber-200">{item.description}</p>
                        <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400"><strong>Como Aprofundar em Entrevista:</strong> {item.recommendation}</p>
                      </div>
                    ))}

                    {/* 🔴 Divergências */}
                    {integratedFit.divergences.map((item, idx) => (
                      <div key={`div-${idx}`} className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-4 rounded-2xl space-y-1.5">
                        <span className="text-xs font-extrabold text-rose-800 dark:text-rose-300 block">{item.title}</span>
                        <p className="text-xs text-rose-900 dark:text-rose-200">{item.description}</p>
                        <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-400"><strong>Ponto Crítico:</strong> {item.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Role Ranking & Recommendations */}
              {integratedFit && (
                <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Mapeamento de Aderência a Outras Funções da Operação</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Top Matching Roles */}
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <h5 className="font-bold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5 uppercase text-[11px]">
                        <CheckSquare className="w-4 h-4" /> Funções de Maior Aderência
                      </h5>
                      <div className="space-y-2">
                        {integratedFit.topMatchingRoles.map((r, i) => (
                          <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{i + 1}. {r.name}</span>
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{r.score}% fit</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Adaptation Roles */}
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <h5 className="font-bold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-1.5 uppercase text-[11px]">
                        <Info className="w-4 h-4" /> Funções que Podem Exigir Maior Adaptação
                      </h5>
                      <div className="space-y-2">
                        {integratedFit.adaptationRoles.map((r, i) => (
                          <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{r.name}</span>
                            <span className="font-bold text-slate-500">{r.score}% fit</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recruiter Interview Recommendations */}
              {integratedFit && (
                <div className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                    <QuestionIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Guia de Recomendação para o Recrutador (Entrevista)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Situational Questions */}
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Perguntas Situacionais Recomendadas:</h5>
                      {integratedFit.recruiterRecommendations.situational_questions.map((q, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 leading-relaxed text-slate-800 dark:text-slate-200">
                          <strong>{i + 1}.</strong> {q}
                        </div>
                      ))}
                    </div>

                    {/* Investigation Points & Risks */}
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Pontos para Investigar:</h5>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                          {integratedFit.recruiterRecommendations.investigate_points.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Possíveis Riscos a Acompanhar:</h5>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                          {integratedFit.recruiterRecommendations.potential_risks.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Explanatory Knowledge Base Section */}
              {showGuide && (
                <div className="bg-white dark:bg-slate-950/90 border border-blue-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Guia de Interpretação das 4 Dimensões
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-1">1. Personalidade (Big Five)</h5>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Responde: <em>"Como tende a funcionar?"</em>. Mede tendências comportamentais consolidadas.</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <h5 className="font-bold text-blue-600 dark:text-blue-400 mb-1">2. Interesse (RIASEC)</h5>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Responde: <em>"O que gosta de fazer?"</em>. Mede motivação profissional por Holland.</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <h5 className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">3. Comportamento Situacional</h5>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Responde: <em>"Como age no trabalho?"</em>. Avalia resiliência e maturidade social em chamadas.</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <h5 className="font-bold text-purple-600 dark:text-purple-400 mb-1">4. Exigência do Cargo</h5>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Responde: <em>"O que a função exige?"</em>. Compara o perfil com as metas do cargo.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Methodological Disclaimer (Verbatim from prompt section 30) */}
              <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed text-center italic flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  <strong>Observação Metodológica:</strong> Este resultado representa uma hipótese de aderência comportamental e de interesses profissionais baseada nas respostas fornecidas. Não constitui diagnóstico psicológico nem substitui avaliação psicológica, entrevista profissional ou instrumento psicométrico validado.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
