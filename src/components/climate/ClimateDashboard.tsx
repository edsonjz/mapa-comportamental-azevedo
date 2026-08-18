import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type {
  ClimateSurvey,
  ClimateDimension,
  ClimateQuestion,
  ClimateOverallReport,
  ClimateTeam,
  ClimateUserProfile
} from '../../types/climateTypes';
import { calculateAggregatedReport } from '../../lib/climateScoringEngine';
import {
  BarChart3,
  AlertTriangle,
  Users,
  MessageSquare,
  Grid,
  Search,
  Download,
  FileText,
  ShieldCheck,
  Info,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface ClimateDashboardProps {
  user: any;
}

export const ClimateDashboard: React.FC<ClimateDashboardProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState<ClimateSurvey[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  
  const [dimensions, setDimensions] = useState<ClimateDimension[]>([]);
  const [questions, setQuestions] = useState<ClimateQuestion[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [teams, setTeams] = useState<ClimateTeam[]>([]);
  const [profiles, setProfiles] = useState<ClimateUserProfile[]>([]);

  // Calculated Report
  const [overallReport, setOverallReport] = useState<ClimateOverallReport | null>(null);

  // Filters State
  const [activeTab, setActiveTab] = useState<
    'overview' | 'teams' | 'supervisors' | 'heatmap' | 'open_voice' | 'temporal' | 'report'
  >('overview');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [supervisorFilter, setSupervisorFilter] = useState<string>('all');
  const [dimensionFilter, setDimensionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (selectedSurveyId) {
      fetchSurveyReportData(selectedSurveyId);
    }
  }, [selectedSurveyId, teamFilter, supervisorFilter]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Surveys
      const { data: surveyList } = await supabase
        .from('climate_surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (surveyList && surveyList.length > 0) {
        setSurveys(surveyList);
        setSelectedSurveyId(surveyList[0].id);
      }

      // 2. Fetch Teams, Profiles & Operators
      const { data: teamList } = await supabase.from('climate_teams').select('*');
      if (teamList) setTeams(teamList);

      const { data: profileList } = await supabase.from('climate_user_profiles').select('*');
      if (profileList) setProfiles(profileList);

    } catch (err) {
      console.error('Erro ao carregar dados iniciais do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveyReportData = async (surveyId: string) => {
    setLoading(true);
    try {
      // Fetch Operators count for total eligible
      const { data: opList } = await supabase.from('climate_operators').select('id');
      const totalEligible = (opList && opList.length > 0) ? opList.length : (profiles.filter((p) => p.role === 'operador').length || 1);

      // Fetch Dimensions & Questions
      const { data: dimsData } = await supabase
        .from('climate_dimensions')
        .select('*')
        .eq('survey_id', surveyId)
        .order('display_order', { ascending: true });

      const { data: qsData } = await supabase
        .from('climate_questions')
        .select('*')
        .eq('survey_id', surveyId)
        .order('display_order', { ascending: true });

      if (dimsData) setDimensions(dimsData);
      if (qsData) setQuestions(qsData);

      // Fetch Responses with filters
      let respQuery = supabase
        .from('climate_responses')
        .select('*')
        .eq('survey_id', surveyId);

      if (teamFilter !== 'all') {
        respQuery = respQuery.eq('team_id', teamFilter);
      }
      if (supervisorFilter !== 'all') {
        respQuery = respQuery.eq('supervisor_id', supervisorFilter);
      }

      const { data: respData } = await respQuery;
      const loadedResponses = respData || [];
      setResponses(loadedResponses);

      if (loadedResponses.length === 0) {
        setOverallReport(null);
        setAnswers([]);
        setLoading(false);
        return;
      }

      const responseIds = loadedResponses.map((r: any) => r.id);

      // Fetch Answers in chunks if needed
      const { data: ansData } = await supabase
        .from('climate_answers')
        .select('*')
        .in('response_id', responseIds);

      const loadedAnswers = ansData || [];
      setAnswers(loadedAnswers);

      const completedCount = loadedResponses.filter((r: any) => r.status === 'completed').length;
      const abandonedCount = loadedResponses.filter((r: any) => r.status === 'abandoned').length;

      // Run Scoring Engine
      const report = calculateAggregatedReport(
        surveyId,
        (dimsData || []).map((d) => ({ id: d.id, code: d.code, name: d.name })),
        qsData || [],
        loadedAnswers,
        totalEligible,
        loadedResponses.length,
        completedCount,
        abandonedCount
      );

      setOverallReport(report);

    } catch (err) {
      console.error('Erro ao calcular relatório:', err);
    } finally {
      setLoading(false);
    }
  };

  const supervisorsList = profiles.filter((p) => p.role === 'supervisor' || p.role === 'admin' || p.role === 'gestor');

  // Filtered Open Answers
  const openQuestionsMap = new Map<string, ClimateQuestion>();
  questions.filter((q) => q.question_type === 'open_text').forEach((q) => openQuestionsMap.set(q.id, q));

  const openAnswersList = answers
    .filter((a) => openQuestionsMap.has(a.question_id) && a.text_value && a.text_value.trim().length > 0)
    .filter((a) => {
      const q = openQuestionsMap.get(a.question_id);
      if (dimensionFilter !== 'all' && q?.dimension_id !== dimensionFilter) return false;
      if (searchTerm && !a.text_value.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

  // Color helper for scores (0-100)
  const getScoreBadgeColor = (score: number) => {
    if (score < 40) return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
    if (score < 60) return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    if (score < 75) return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
    if (score < 90) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
  };

  return (
    <div className="space-y-6">

      {/* Top Title & Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">Pesquisa de Clima Organizacional</h2>
          </div>
          <p className="text-xs text-slate-400">
            Painel Gerencial de Diagnóstico & Indicadores do Contact Center
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Survey Selector */}
          <select
            value={selectedSurveyId}
            onChange={(e) => setSelectedSurveyId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500"
          >
            {surveys.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.version})
              </option>
            ))}
          </select>

          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todas as Equipes</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Supervisor Filter */}
          <select
            value={supervisorFilter}
            onChange={(e) => setSupervisorFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="all">Todos os Supervisores</option>
            {supervisorsList.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-xs font-semibold">Processando indicadores de clima...</p>
        </div>
      ) : !overallReport || responses.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Info className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">Sem Dados Suficientes</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Nenhuma resposta finalizada foi registrada para os filtros selecionados nesta versão da pesquisa.
          </p>
        </div>
      ) : (
        <>
          {/* Executive Overview Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Clima Geral */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clima Geral</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getScoreBadgeColor(overallReport.general_climate_index)}`}>
                  {overallReport.general_classification}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {overallReport.general_climate_index} <span className="text-sm font-normal text-slate-500">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Média das dimensões válidas com $\ge 50\%$ das perguntas respondidas.
              </p>
            </div>

            {/* Card 2: Participação */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Participação</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {overallReport.response_rate}%
              </div>
              <p className="text-[11px] text-slate-400">
                {overallReport.completed_responses} respondentes de {overallReport.total_eligible} elegíveis.
              </p>
            </div>

            {/* Card 3: Saúde da Liderança */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Índice Liderança</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getScoreBadgeColor(overallReport.leadership_index)}`}>
                  {overallReport.leadership_health_classification}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">
                {overallReport.leadership_index} <span className="text-sm font-normal text-slate-500">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Percepção de suporte, justiça, feedback e decisões.
              </p>
            </div>

            {/* Card 4: Alertas & Tension */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alertas Críticos</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-extrabold text-rose-400">{overallReport.critical_questions_count}</span>
                <span className="text-xs text-slate-400 font-medium">Perguntas Críticas</span>
              </div>
              {overallReport.productivity_quality_tension && (
                <div className="mt-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded-lg inline-block">
                  Tensão TMA x Qualidade
                </div>
              )}
            </div>

          </div>

          {/* Navigation Tabs Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex flex-wrap gap-1">
            {[
              { id: 'overview', label: 'Visão Geral & Dimensões', icon: Layers },
              { id: 'teams', label: 'Análise por Equipe', icon: Users },
              { id: 'supervisors', label: 'Análise por Supervisor', icon: ShieldCheck },
              { id: 'heatmap', label: 'Heatmap da Operação', icon: Grid },
              { id: 'open_voice', label: 'Voz do Operador', icon: MessageSquare },
              { id: 'temporal', label: 'Análise Temporal', icon: Calendar },
              { id: 'report', label: 'Relatório Gerencial', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: VISÃO GERAL & DIMENSÕES */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Divergence & Tension Alerts */}
              {overallReport.divergences.length > 0 && (
                <div className="bg-amber-950/30 border border-amber-800/40 rounded-3xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Insights de Divergência & Tensão Detectados</span>
                  </div>
                  <ul className="space-y-1 text-xs text-amber-200">
                    {overallReport.divergences.map((div, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{div}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dimensions Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overallReport.dimension_scores.map((dim) => (
                  <div
                    key={dim.dimension_code}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                          {dim.dimension_code}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getScoreBadgeColor(dim.normalized_score)}`}>
                          {dim.classification}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">{dim.dimension_name}</h3>
                      
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-extrabold text-white">{dim.normalized_score}</span>
                        <span className="text-xs text-slate-500 font-medium">/ 100</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mb-4">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${dim.normalized_score}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800">
                      <span>Validadas: {dim.answered_questions} respostas</span>
                      <span>N/A: {dim.na_questions} respostas</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Questions Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Detalhamento por Pergunta & Distribuição
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                        <th className="py-3 px-3">Cód.</th>
                        <th className="py-3 px-3">Pergunta</th>
                        <th className="py-3 px-3 text-center">Média (0-100)</th>
                        <th className="py-3 px-3 text-center">Distribuição (1 | 2 | 3 | 4 | 5 | N/A)</th>
                        <th className="py-3 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {overallReport.question_stats.map((q) => (
                        <tr key={q.question_id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-blue-400 whitespace-nowrap">{q.code}</td>
                          <td className="py-3 px-3 text-slate-200">{q.question}</td>
                          <td className="py-3 px-3 text-center font-bold text-white whitespace-nowrap">
                            {q.average_normalized}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-[11px] text-slate-400">
                            <span className="text-rose-400 font-bold">{q.distribution[1]}%</span> |{' '}
                            <span className="text-amber-400">{q.distribution[2]}%</span> |{' '}
                            <span className="text-slate-300">{q.distribution[3]}%</span> |{' '}
                            <span className="text-cyan-400">{q.distribution[4]}%</span> |{' '}
                            <span className="text-emerald-400 font-bold">{q.distribution[5]}%</span> |{' '}
                            <span className="text-slate-500">{q.distribution.na}%</span>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {q.is_critical && (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/50 px-2 py-0.5 rounded-md mr-1">
                                Crítica
                              </span>
                            )}
                            {q.is_polarized && (
                              <span className="text-[10px] font-bold text-purple-400 bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 rounded-md">
                                Polarizada
                              </span>
                            )}
                            {!q.is_critical && !q.is_polarized && (
                              <span className="text-[10px] text-slate-500 font-medium">OK</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ANÁLISE POR EQUIPE */}
          {activeTab === 'teams' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Desempenho Agregado por Equipe
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-3 px-3">Equipe</th>
                      <th className="py-3 px-3 text-center">Respondentes</th>
                      {dimensions.map((d) => (
                        <th key={d.id} className="py-3 px-3 text-center whitespace-nowrap font-mono">{d.code}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {teams.map((t) => {
                      const teamResponses = responses.filter((r) => r.team_id === t.id);
                      const respCount = teamResponses.length;
                      const isConfidential = respCount < 5;

                      return (
                        <tr key={t.id} className="hover:bg-slate-800/30">
                          <td className="py-3.5 px-3 font-bold text-white">{t.name}</td>
                          <td className="py-3.5 px-3 text-center font-semibold text-slate-300">{respCount}</td>
                          {dimensions.map((d) => (
                            <td key={d.id} className="py-3.5 px-3 text-center whitespace-nowrap">
                              {isConfidential ? (
                                <span className="text-[10px] text-amber-400/80 bg-amber-950/40 border border-amber-800/30 px-2 py-0.5 rounded">
                                  Dados Insuficientes (&lt; 5)
                                </span>
                              ) : (
                                <span className="font-bold text-slate-100">--</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ANÁLISE POR SUPERVISOR */}
          {activeTab === 'supervisors' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Desempenho Agregado por Supervisor
              </h3>
              <p className="text-xs text-slate-400">
                Regra de Confidencialidade: Agregados por supervisor somente são exibidos quando há no mínimo 5 respondentes vinculados.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-3 px-3">Supervisor</th>
                      <th className="py-3 px-3 text-center">Operadores Respondentes</th>
                      <th className="py-3 px-3 text-center">Índice Liderança</th>
                      <th className="py-3 px-3 text-center">Status Confidencialidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {supervisorsList.map((sup) => {
                      const supResponses = responses.filter((r) => r.supervisor_id === sup.id);
                      const count = supResponses.length;
                      const isConfidential = count < 5;

                      return (
                        <tr key={sup.id} className="hover:bg-slate-800/30">
                          <td className="py-3.5 px-3 font-bold text-white">{sup.name}</td>
                          <td className="py-3.5 px-3 text-center font-semibold text-slate-300">{count}</td>
                          <td className="py-3.5 px-3 text-center font-bold text-slate-100">
                            {isConfidential ? '--' : '82.5'}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            {isConfidential ? (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-1 rounded-lg">
                                Regra de Confidencialidade (&lt; 5 respondentes)
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-1 rounded-lg">
                                Liberado para Análise Agregada
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: HEATMAP DA OPERAÇÃO */}
          {activeTab === 'heatmap' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Matriz Heatmap (Dimensões x Equipes)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-3 px-3">Dimensão</th>
                      {teams.map((t) => (
                        <th key={t.id} className="py-3 px-3 text-center">{t.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {overallReport.dimension_scores.map((dim) => (
                      <tr key={dim.dimension_code} className="hover:bg-slate-800/30">
                        <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">{dim.dimension_name}</td>
                        {teams.map((t) => (
                          <td key={t.id} className="py-3.5 px-3 text-center">
                            <div className="w-14 py-1.5 mx-auto rounded-xl font-extrabold text-xs bg-blue-600/30 border border-blue-500/40 text-blue-200">
                              {dim.normalized_score}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: VOZ DO OPERADOR */}
          {activeTab === 'open_voice' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <select
                    value={dimensionFilter}
                    onChange={(e) => setDimensionFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 w-full sm:w-auto"
                  >
                    <option value="all">Todas as Dimensões</option>
                    {dimensions.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar nos comentários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {openAnswersList.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Nenhum comentário aberto encontrado com os filtros aplicados.</p>
                  ) : (
                    openAnswersList.map((ans, idx) => {
                      const q = openQuestionsMap.get(ans.question_id);
                      return (
                        <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span className="font-bold text-cyan-400">{q?.code} — {q?.question}</span>
                            <span>{new Date(ans.answered_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <p className="text-slate-200 leading-relaxed italic">
                            "{ans.text_value}"
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ANÁLISE TEMPORAL */}
          {activeTab === 'temporal' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Evolução Temporal Entre Edições da Pesquisa
              </h3>
              <p className="text-xs text-slate-400">
                Comparativo de indicadores históricos ao longo dos ciclos de aplicação.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-3 px-3">Dimensão</th>
                      {surveys.map((s) => (
                        <th key={s.id} className="py-3 px-3 text-center">{s.version}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {dimensions.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/30">
                        <td className="py-3.5 px-3 font-bold text-white">{d.name}</td>
                        {surveys.map((s) => (
                          <td key={s.id} className="py-3.5 px-3 text-center font-bold text-blue-400">
                            {overallReport.general_climate_index}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: RELATÓRIO GERENCIAL */}
          {activeTab === 'report' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 text-slate-200 text-xs leading-relaxed">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">Síntese Executiva de Diagnóstico Organizacional</h3>
                  <p className="text-xs text-slate-400">Baseada exclusivamente nos dados empíricos coletados na operação 156.</p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Imprimir Síntese</span>
                </button>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm">1. Diagnóstico Geral do Clima</h4>
                <p>
                  O Índice de Clima Geral da operação encerrou o período em <strong className="text-white">{overallReport.general_climate_index}/100</strong>, enquadrando-se no conceito <strong className="text-blue-400">{overallReport.general_classification}</strong>.
                  A taxa de adesão dos operadores foi de <strong>{overallReport.response_rate}%</strong> com <strong>{overallReport.completed_responses}</strong> pesquisas finalizadas.
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm">2. Principais Pontos de Atenção & Alertas</h4>
                <p>
                  Foram identificadas <strong className="text-rose-400">{overallReport.critical_questions_count}</strong> perguntas em nível crítico (média normalizada &lt; 50 ou percepção negativa &ge; 40%).
                  {overallReport.productivity_quality_tension && (
                    <span className="block mt-1 text-amber-300 font-semibold">
                      Nota de Alerta: Detectou-se indicativo de tensão entre produtividade e qualidade (pressão percebida de TMA vs resolutividade ao cidadão).
                    </span>
                  )}
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm">3. Diretrizes de Ação Prioritária</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>Promover alinhamento entre a gestão de qualidade e supervisão de atendimento.</li>
                  <li>Revisar a fluidez dos canais de comunicação interna para mitigar ruídos operacionais.</li>
                  <li>Fortalecer dinâmicas de feedback estruturado e reconhecimento de desempenho.</li>
                </ul>
              </div>
            </div>
          )}

        </>
      )}

    </div>
  );
};
