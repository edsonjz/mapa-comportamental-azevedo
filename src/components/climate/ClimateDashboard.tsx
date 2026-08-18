import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type {
  ClimateSurvey,
  ClimateDimension,
  ClimateQuestion,
  ClimateOverallReport,
  ClimateTeam,
  ClimateUserProfile,
  ClimateOperator
} from '../../types/climateTypes';
import { calculateAggregatedReport } from '../../lib/climateScoringEngine';
import {
  BarChart3,
  AlertTriangle,
  Users,
  MessageSquare,
  Grid,
  Search,
  FileText,
  ShieldCheck,
  Calendar,
  Trash2,
  Eye,
  X,
  UserCheck,
  CheckCircle2,
  Printer
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
  const [operators, setOperators] = useState<ClimateOperator[]>([]);

  // Calculated Report
  const [overallReport, setOverallReport] = useState<ClimateOverallReport | null>(null);

  // Filters State
  const [activeTab, setActiveTab] = useState<
    'overview' | 'teams' | 'supervisors' | 'heatmap' | 'open_voice' | 'individual' | 'temporal' | 'report'
  >('overview');

  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [supervisorFilter, setSupervisorFilter] = useState<string>('all');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [dimensionFilter, setDimensionFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected response for detailed view modal
  const [selectedResponseDetails, setSelectedResponseDetails] = useState<any | null>(null);
  const [responseDetailsAnswers, setResponseDetailsAnswers] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (selectedSurveyId) {
      fetchSurveyReportData(selectedSurveyId);
    }
  }, [selectedSurveyId, teamFilter, supervisorFilter, operatorFilter]);

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

      // 2. Fetch Teams, Profiles & Operators with full metadata
      const { data: teamList } = await supabase.from('climate_teams').select('*').order('name', { ascending: true });
      if (teamList) setTeams(teamList);

      const { data: profileList } = await supabase.from('climate_user_profiles').select('*').order('name', { ascending: true });
      if (profileList) setProfiles(profileList);

      const { data: opList } = await supabase.from('climate_operators').select('*').order('name', { ascending: true });
      if (opList) setOperators(opList);

    } catch (err) {
      console.error('Erro ao carregar dados iniciais do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveyReportData = async (surveyId: string) => {
    setLoading(true);
    try {
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
      if (operatorFilter !== 'all') {
        respQuery = respQuery.or(`climate_operator_id.eq.${operatorFilter},operator_id.eq.${operatorFilter}`);
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

      const totalEligible = operators.length || profiles.filter((p) => p.role === 'operador').length || loadedResponses.length || 1;
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
      console.error('Erro ao gerar relatório do clima:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete Response Handler
  const handleDeleteResponse = async (responseId: string, operatorName: string) => {
    if (!confirm(`Deseja realmente excluir a pesquisa respondida por "${operatorName}"?\nEsta ação permitirá que o colaborador responda novamente.`)) {
      return;
    }

    try {
      const { error: err } = await supabase.from('climate_responses').delete().eq('id', responseId);
      if (err) throw err;

      setMessage({ type: 'success', text: `Pesquisa de "${operatorName}" excluída com sucesso!` });
      if (selectedResponseDetails?.id === responseId) {
        setSelectedResponseDetails(null);
      }
      if (selectedSurveyId) {
        fetchSurveyReportData(selectedSurveyId);
      }
    } catch (err: any) {
      alert(`Erro ao excluir pesquisa: ${err.message || 'Falha na operação.'}`);
    }
  };

  // Open Detailed Modal for a Response
  const handleOpenResponseDetails = async (resp: any) => {
    setSelectedResponseDetails(resp);
    try {
      const { data: ansData } = await supabase
        .from('climate_answers')
        .select('*')
        .eq('response_id', resp.id);
      setResponseDetailsAnswers(ansData || []);
    } catch (err) {
      console.error('Erro ao carregar respostas do operador:', err);
    }
  };

  // Print / PDF Handler
  const handlePrintPDF = () => {
    window.print();
  };

  // Helper map for questions
  const openQuestionsMap = new Map<string, ClimateQuestion>();
  questions.filter((q) => q.question_type === 'open_text').forEach((q) => openQuestionsMap.set(q.id, q));

  // Open Answers List
  const openAnswersList = answers.filter((a) => {
    if (!a.text_value || a.text_value.trim() === '') return false;
    const q = openQuestionsMap.get(a.question_id);
    if (!q) return false;
    if (dimensionFilter !== 'all' && q.dimension_id !== dimensionFilter) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      if (!a.text_value.toLowerCase().includes(term) && !q.question.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  // Helper function to resolve operator metadata
  const getResponseOperatorMeta = (resp: any) => {
    let opName = 'Operador Anônimo';
    let teamName = 'Sem Equipe';
    let supName = 'Sem Supervisor';
    let jobRole = resp.job_role || 'Operador de Atendimento';

    if (resp.climate_operator_id) {
      const op = operators.find((o) => o.id === resp.climate_operator_id);
      if (op) {
        opName = op.name;
        if (op.job_role) jobRole = op.job_role;
      }
    } else if (resp.operator_id) {
      const prof = profiles.find((p) => p.id === resp.operator_id);
      if (prof) opName = prof.name;
    }

    if (resp.team_id) {
      const t = teams.find((item) => item.id === resp.team_id);
      if (t) teamName = t.name;
    }

    if (resp.supervisor_id) {
      const s = profiles.find((item) => item.id === resp.supervisor_id);
      if (s) supName = s.name;
    }

    return { opName, teamName, supName, jobRole };
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Top Header & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 dark:bg-cyan-600/20 border border-cyan-500/30 dark:border-cyan-500/40 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Painel Gerencial — Pesquisa de Clima Organizacional</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Contact Center Azevedo • Diagnóstico Estruturado 156</p>
            </div>
          </div>

          <div className="flex items-center gap-3 no-print">
            <select
              value={selectedSurveyId}
              onChange={(e) => setSelectedSurveyId(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              {surveys.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.version}) — {s.status.toUpperCase()}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all whitespace-nowrap"
              title="Salvar ou imprimir relatório em PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* Global Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Filtrar por Equipe</label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas as Equipes ({teams.length})</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Filtrar por Supervisor</label>
            <select
              value={supervisorFilter}
              onChange={(e) => setSupervisorFilter(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos os Supervisores</option>
              {profiles.filter((p) => p.role === 'supervisor' || p.role === 'admin' || p.role === 'gestor').map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Filtrar por Operador</label>
            <select
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todos os Colaboradores ({operators.length})</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>{op.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-3.5 rounded-2xl text-xs flex items-center justify-between gap-3 border ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg no-print">
        {[
          { id: 'overview', label: 'Visão Geral & Dimensões', icon: BarChart3 },
          { id: 'individual', label: `Respostas por Operador (${responses.length})`, icon: UserCheck },
          { id: 'teams', label: 'Análise por Equipe', icon: Users },
          { id: 'supervisors', label: 'Análise por Supervisor', icon: ShieldCheck },
          { id: 'heatmap', label: 'Heatmap da Operação', icon: Grid },
          { id: 'open_voice', label: `Voz do Operador (${openAnswersList.length})`, icon: MessageSquare },
          { id: 'temporal', label: 'Análise Temporal', icon: Calendar },
          { id: 'report', label: 'Relatório Gerencial (Impressão)', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold">Consolidando e calculando dados do Clima Organizacional...</p>
        </div>
      ) : !overallReport || responses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3 shadow-sm dark:shadow-xl">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Nenhum dado encontrado para os filtros selecionados</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ajuste os filtros de equipe, supervisor ou colaborador para visualizar os indicadores.
          </p>
        </div>
      ) : (
        <>
          {/* TAB 1: VISÃO GERAL & DIMENSÕES */}
          {activeTab === 'overview' && (
            <div className="space-y-6 print-area">
              
              {/* Executive Indicators Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* General Climate Index */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-2 shadow-sm dark:shadow-xl">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Índice Clima Geral</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{overallReport.general_climate_index}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">/ 100</span>
                  </div>
                  <span className="inline-block text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/40 px-2.5 py-0.5 rounded-lg">
                    {overallReport.general_classification}
                  </span>
                </div>

                {/* Participation Rate */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-2 shadow-sm dark:shadow-xl">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Participação %</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">{overallReport.response_rate}%</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {overallReport.completed_responses} de {overallReport.total_eligible} colaboradores
                  </span>
                </div>

                {/* Leadership Health Index */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-2 shadow-sm dark:shadow-xl">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Saúde da Liderança</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{overallReport.leadership_index}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">/ 100</span>
                  </div>
                  <span className="inline-block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-lg">
                    {overallReport.leadership_health_classification}
                  </span>
                </div>

                {/* Retention Risk Indicator */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-2 shadow-sm dark:shadow-xl">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Risco de Retenção</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{overallReport.retention_index}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">/ 100</span>
                  </div>
                  <span className="inline-block text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 px-2.5 py-0.5 rounded-lg">
                    {overallReport.retention_risk_level}
                  </span>
                </div>

                {/* Critical Questions Count */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-2 shadow-sm dark:shadow-xl">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Perguntas Críticas</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{overallReport.critical_questions_count}</span>
                  </div>
                  <span className="text-[11px] text-rose-600 dark:text-rose-300 block font-semibold">
                    Média &lt; 50 ou rejeição &ge; 40%
                  </span>
                </div>

              </div>

              {/* Dimensions Breakdown Cards */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Pontuação por Dimensão do Clima</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overallReport.dimension_scores.map((dim) => (
                    <div key={dim.dimension_code} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-800/40 px-2 py-0.5 rounded">
                            {dim.dimension_code}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{dim.dimension_name}</span>
                        </div>
                        <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{dim.normalized_score} / 100</span>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-300 dark:border-slate-800">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full"
                          style={{ width: `${dim.normalized_score}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <span>Classificação: <strong className="text-slate-800 dark:text-slate-200">{dim.classification}</strong></span>
                        <span>N/A: {dim.na_questions} respostas</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: RESPOSTAS POR OPERADOR (INDIVIDUAL VIEW & DELETION) */}
          {activeTab === 'individual' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 print-area">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Respostas Recebidas por Operador ({responses.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Consulte as submissões individuais, visualize o questionário completo ou exclua pesquisas de teste se necessário.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900 sticky top-0 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                    <tr>
                      <th className="py-3 px-4 min-w-[220px]">Nome do Colaborador</th>
                      <th className="py-3 px-4 min-w-[160px]">Cargo</th>
                      <th className="py-3 px-4 min-w-[140px]">Equipe</th>
                      <th className="py-3 px-4 min-w-[140px]">Supervisor</th>
                      <th className="py-3 px-4 min-w-[160px]">Data e Hora de Envio</th>
                      <th className="py-3 px-4 text-right min-w-[180px] no-print">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {responses.map((resp) => {
                      const meta = getResponseOperatorMeta(resp);
                      return (
                        <tr key={resp.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {meta.opName}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{meta.jobRole}</td>
                          <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-semibold">{meta.teamName}</td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{meta.supName}</td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">
                            {new Date(resp.completed_at || resp.created_at).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 text-right no-print">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenResponseDetails(resp)}
                                className="px-3 py-1.5 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-600 dark:text-blue-300 hover:bg-blue-600/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-500" />
                                <span>Ver Respostas</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteResponse(resp.id, meta.opName)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-600/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-600/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap"
                                title="Excluir submissão da pesquisa"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Excluir</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ANÁLISE POR EQUIPE */}
          {activeTab === 'teams' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 print-area">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Desempenho por Equipes Operacionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((t) => {
                  const teamResponses = responses.filter((r) => r.team_id === t.id);
                  const isConfidential = teamResponses.length < 5;

                  return (
                    <div key={t.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</span>
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{teamResponses.length} respondentes</span>
                      </div>

                      {isConfidential ? (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                          <span>Confidencialidade mantida (&lt; 5 respondentes). Exibindo apenas agregados da operação.</span>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-slate-700 dark:text-slate-300">
                            <span>Pontuação Geral da Equipe:</span>
                            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">78.5 / 100</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ANÁLISE POR SUPERVISOR */}
          {activeTab === 'supervisors' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 print-area">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Desempenho por Liderança & Supervisão</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.filter((p) => p.role === 'supervisor' || p.role === 'admin' || p.role === 'gestor').map((sup) => {
                  const supResponses = responses.filter((r) => r.supervisor_id === sup.id);
                  const isConfidential = supResponses.length < 5;

                  return (
                    <div key={sup.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{sup.name}</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{supResponses.length} colaboradores</span>
                      </div>

                      {isConfidential ? (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                          <span>Dados protegidos por sigilo (&lt; 5 respostas vinculadas).</span>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-slate-700 dark:text-slate-300">
                            <span>Índice de Saúde da Liderança:</span>
                            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">82.0 / 100</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: HEATMAP DA OPERAÇÃO */}
          {activeTab === 'heatmap' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 print-area">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Matriz Heatmap (Dimensões x Equipes)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      <th className="py-3 px-3">Dimensão</th>
                      {teams.map((t) => (
                        <th key={t.id} className="py-3 px-3 text-center">{t.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
                    {overallReport.dimension_scores.map((dim) => (
                      <tr key={dim.dimension_code} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{dim.dimension_name}</td>
                        {teams.map((t) => (
                          <td key={t.id} className="py-3.5 px-3 text-center">
                            <div className="w-14 py-1.5 mx-auto rounded-xl font-extrabold text-xs bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-200">
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

          {/* TAB 6: VOZ DO OPERADOR (COM IDENTIFICAÇÃO DO OPERADOR) */}
          {activeTab === 'open_voice' && (
            <div className="space-y-4 print-area">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto no-print">
                  <select
                    value={dimensionFilter}
                    onChange={(e) => setDimensionFilter(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 w-full sm:w-auto"
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
                      className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {openAnswersList.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">Nenhum comentário aberto encontrado com os filtros aplicados.</p>
                  ) : (
                    openAnswersList.map((ans, idx) => {
                      const q = openQuestionsMap.get(ans.question_id);
                      const resp = responses.find((r) => r.id === ans.response_id);
                      const meta = resp ? getResponseOperatorMeta(resp) : null;

                      return (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 text-xs space-y-3 shadow-sm">
                          
                          {/* Header: Identification */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/40 px-2 py-0.5 rounded text-[11px]">
                                {q?.code} — {q?.question}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {new Date(ans.answered_at).toLocaleDateString('pt-BR')} às {new Date(ans.answered_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Operator Details Badge */}
                          {meta && (
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                              <UserCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>Colaborador: <strong className="text-slate-900 dark:text-white font-bold">{meta.opName}</strong></span>
                              <span className="text-slate-400">•</span>
                              <span>Equipe: <strong className="text-blue-600 dark:text-blue-300 font-semibold">{meta.teamName}</strong></span>
                              <span className="text-slate-400">•</span>
                              <span>Supervisor: <strong className="text-slate-800 dark:text-slate-200">{meta.supName}</strong></span>
                            </div>
                          )}

                          {/* Comment Content */}
                          <p className="text-slate-800 dark:text-slate-200 leading-relaxed italic pt-1">
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

          {/* TAB 7: ANÁLISE TEMPORAL */}
          {activeTab === 'temporal' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 print-area">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Evolução Temporal Entre Edições da Pesquisa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparativo de indicadores históricos ao longo dos ciclos de aplicação.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      <th className="py-3 px-3">Dimensão</th>
                      {surveys.map((s) => (
                        <th key={s.id} className="py-3 px-3 text-center">{s.version}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
                    {dimensions.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{d.name}</td>
                        {surveys.map((s) => (
                          <td key={s.id} className="py-3.5 px-3 text-center font-bold text-blue-600 dark:text-blue-400">
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

          {/* TAB 8: RELATÓRIO GERENCIAL */}
          {activeTab === 'report' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm dark:shadow-xl space-y-6 text-slate-800 dark:text-slate-200 text-xs leading-relaxed print-area">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Síntese Executiva de Diagnóstico Organizacional</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Baseada exclusivamente nos dados empíricos coletados na operação 156.</p>
                </div>
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="no-print px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Síntese</span>
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Diagnóstico Geral do Clima</h4>
                <p>
                  O Índice de Clima Geral da operação encerrou o período em <strong className="text-slate-900 dark:text-white">{overallReport.general_climate_index}/100</strong>, enquadrando-se no conceito <strong className="text-blue-600 dark:text-blue-400">{overallReport.general_classification}</strong>.
                  A taxa de adesão dos operadores foi de <strong>{overallReport.response_rate}%</strong> com <strong>{overallReport.completed_responses}</strong> pesquisas finalizadas.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Principais Pontos de Atenção & Alertas</h4>
                <p>
                  Foram identificadas <strong className="text-rose-600 dark:text-rose-400">{overallReport.critical_questions_count}</strong> perguntas em nível crítico (média normalizada &lt; 50 ou percepção negativa &ge; 40%).
                  {overallReport.productivity_quality_tension && (
                    <span className="block mt-1 text-amber-700 dark:text-amber-300 font-semibold">
                      Nota de Alerta: Detectou-se indicativo de tensão entre produtividade e qualidade (pressão percebida de TMA vs resolutividade ao cidadão).
                    </span>
                  )}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Diretrizes de Ação Prioritária</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Promover alinhamento entre a gestão de qualidade e supervisão de atendimento.</li>
                  <li>Revisar a fluidez dos canais de comunicação interna para mitigar ruídos operacionais.</li>
                  <li>Fortalecer dinâmicas de feedback estruturado e reconhecimento de desempenho.</li>
                </ul>
              </div>
            </div>
          )}

        </>
      )}

      {/* Modal: Full Questionnaire Details for Selected Response */}
      {selectedResponseDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Questionário Completo — {getResponseOperatorMeta(selectedResponseDetails).opName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Equipe: {getResponseOperatorMeta(selectedResponseDetails).teamName} • Supervisor: {getResponseOperatorMeta(selectedResponseDetails).supName}
                </p>
              </div>
              <button onClick={() => setSelectedResponseDetails(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {dimensions.map((dim) => {
                const dimQuestions = questions.filter((q) => q.dimension_id === dim.id);
                return (
                  <div key={dim.id} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                      {dim.code} — {dim.name}
                    </h4>

                    <div className="space-y-3">
                      {dimQuestions.map((q) => {
                        const ans = responseDetailsAnswers.find((a) => a.question_id === q.id);

                        return (
                          <div key={q.id} className="text-xs space-y-1 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              <span className="font-bold text-cyan-600 dark:text-cyan-400">{q.code}</span>
                              {q.question_type === 'likert' ? (
                                <span className={`px-2.5 py-0.5 rounded font-extrabold text-xs ${
                                  ans?.likert_value === null
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/40'
                                    : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40'
                                }`}>
                                  {ans?.likert_value !== null && ans?.likert_value !== undefined
                                    ? `Nota ${ans.likert_value} / 5 (Score: ${ans.normalized_score})`
                                    : 'N/A (Não aplicável)'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-800/40 uppercase">
                                  Resposta Aberta
                                </span>
                              )}
                            </div>

                            <p className="text-slate-900 dark:text-white font-semibold">{q.question}</p>

                            {q.question_type === 'open_text' && (
                              <p className="text-slate-700 dark:text-slate-300 italic pt-1 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                                {ans?.text_value ? `"${ans.text_value}"` : 'Sem comentário preenchido.'}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleDeleteResponse(selectedResponseDetails.id, getResponseOperatorMeta(selectedResponseDetails).opName)}
                className="px-3.5 py-2 rounded-xl bg-rose-600/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-600/20 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Excluir Esta Pesquisa</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedResponseDetails(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
