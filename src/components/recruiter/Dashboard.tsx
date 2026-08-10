import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Candidate, Assessment, Recruiter, AssessmentScores } from '../../types/database';
import { AssessmentReportModal } from './AssessmentReportModal';
import { ExcelImportModal } from './ExcelImportModal';
import { ThemeToggle } from '../common/ThemeToggle';
import { PROFILES_CATALOG } from '../../lib/profilesData';
import { 
  Users, CheckCircle2, Clock, PlayCircle, Plus, Search, Filter, Copy, Check, Eye, Trash2, 
  LogOut, History, RefreshCw, X, UserPlus, Link2, FileSpreadsheet, BookOpen, UserCheck
} from 'lucide-react';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

type AssessmentWithCandidate = Assessment & {
  candidate?: Candidate;
  score?: AssessmentScores;
};

const MASTER_ADMIN_EMAIL = 'edsonjz@gmail.com';

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [assessments, setAssessments] = useState<AssessmentWithCandidate[]>([]);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [profileFilter, setProfileFilter] = useState<string>('all');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExcelImportModal, setShowExcelImportModal] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [showCreateRecruiterModal, setShowCreateRecruiterModal] = useState(false);
  const [selectedAssessmentForReport, setSelectedAssessmentForReport] = useState<AssessmentWithCandidate | null>(null);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // New Candidate Form State
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateEmail, setNewCandidateEmail] = useState('');
  const [newCandidatePhone, setNewCandidatePhone] = useState('');
  const [newCandidatePosition, setNewCandidatePosition] = useState('Operador de Atendimento');
  const [newCandidateDept, setNewCandidateDept] = useState('Operações');
  const [creating, setCreating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // New Recruiter Form State (Master only)
  const [newRecruiterName, setNewRecruiterName] = useState('');
  const [newRecruiterEmail, setNewRecruiterEmail] = useState('');
  const [newRecruiterPassword, setNewRecruiterPassword] = useState('');
  const [creatingRecruiter, setCreatingRecruiter] = useState(false);

  const isMasterAdmin = user?.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    fetchRecruiterData();
    fetchAssessments();
  }, [user]);

  const fetchRecruiterData = async () => {
    try {
      const { data } = await supabase
        .from('recruiters')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) setRecruiter(data as Recruiter);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const { data: assessData, error: assessErr } = await supabase
        .from('assessments')
        .select(`
          *,
          candidate:candidates(*)
        `)
        .order('created_at', { ascending: false });

      if (assessErr) throw assessErr;

      const { data: scoresData } = await supabase
        .from('assessment_scores')
        .select('*');

      const scoresMap = new Map<string, AssessmentScores>();
      (scoresData || []).forEach((s: any) => scoresMap.set(s.assessment_id, s as AssessmentScores));

      const merged: AssessmentWithCandidate[] = (assessData || []).map((a: any) => ({
        ...a,
        score: scoresMap.get(a.id)
      }));

      setAssessments(merged);
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCandidateAndAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidateName.trim()) return;

    setCreating(true);
    try {
      const { data: candidateData, error: candErr } = await supabase
        .from('candidates')
        .insert({
          name: newCandidateName.trim(),
          email: newCandidateEmail.trim() || null,
          phone: newCandidatePhone.trim() || null,
          position: newCandidatePosition.trim() || 'Operador de Atendimento',
          department: newCandidateDept.trim() || 'Operações',
          recruiter_id: user.id
        })
        .select()
        .single();

      if (candErr) throw candErr;

      const { data: assessData, error: assessErr } = await supabase
        .from('assessments')
        .insert({
          candidate_id: candidateData.id,
          recruiter_id: user.id,
          status: 'pending',
          scoring_version: 'b5cx_v1'
        })
        .select()
        .single();

      if (assessErr) throw assessErr;

      await supabase.from('assessment_audit_logs').insert({
        assessment_id: assessData.id,
        actor_type: 'recruiter',
        actor_id: user.id,
        action: 'created',
        details: { candidate_name: candidateData.name }
      });

      const fullLink = `${window.location.origin}${window.location.pathname}?token=${assessData.access_token}`;
      setGeneratedLink(fullLink);
      await fetchAssessments();
    } catch (err: any) {
      console.error('Erro ao criar candidato:', err);
      alert('Ocorreu um erro ao cadastrar o candidato e gerar a avaliação.');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateNewRecruiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMasterAdmin) {
      alert('Apenas o Recrutador Master pode criar novas contas de recrutador.');
      return;
    }
    if (!newRecruiterEmail.trim() || !newRecruiterPassword.trim()) return;

    setCreatingRecruiter(true);
    try {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: newRecruiterEmail.trim(),
        password: newRecruiterPassword.trim(),
        options: {
          data: { name: newRecruiterName.trim() || 'Novo Recrutador' }
        }
      });

      if (signUpErr) throw signUpErr;

      if (data.user) {
        await supabase.from('recruiters').upsert({
          id: data.user.id,
          name: newRecruiterName.trim() || newRecruiterEmail.split('@')[0],
          email: newRecruiterEmail.trim(),
          role: 'recruiter'
        });
      }

      alert(`Conta de recrutador criada com sucesso para ${newRecruiterEmail}!`);
      setNewRecruiterName('');
      setNewRecruiterEmail('');
      setNewRecruiterPassword('');
      setShowCreateRecruiterModal(false);
    } catch (err: any) {
      console.error('Erro ao cadastrar recrutador:', err);
      alert(`Falha ao cadastrar recrutador: ${err.message || 'Erro de autenticação'}`);
    } finally {
      setCreatingRecruiter(false);
    }
  };

  const handleDeleteAssessment = async (assessmentItem: AssessmentWithCandidate) => {
    const candidateName = assessmentItem.candidate?.name || 'este candidato';
    if (!confirm(`Tem certeza que deseja excluir a avaliação e o registro de "${candidateName}"?`)) return;

    try {
      // 1. Try calling database RPC for complete cascade deletion
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('delete_assessment_and_candidate', {
        p_assessment_id: assessmentItem.id
      });

      if (rpcErr || (rpcRes && rpcRes.error)) {
        // Fallback: Delete related records in sequence
        await supabase.from('answers').delete().eq('assessment_id', assessmentItem.id);
        await supabase.from('assessment_scores').delete().eq('assessment_id', assessmentItem.id);
        await supabase.from('assessment_audit_logs').delete().eq('assessment_id', assessmentItem.id);
        
        const { error: assessDelErr } = await supabase.from('assessments').delete().eq('id', assessmentItem.id);
        if (assessDelErr) throw assessDelErr;

        if (assessmentItem.candidate_id) {
          await supabase.from('candidates').delete().eq('id', assessmentItem.candidate_id);
        }
      }

      setAssessments(prev => prev.filter(a => a.id !== assessmentItem.id));
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
      alert(`Não foi possível excluir o candidato: ${err.message || 'Erro desconhecido'}`);
    }
  };

  const copyToClipboard = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const fetchAuditLogs = async () => {
    setShowAuditLogs(true);
    try {
      const { data } = await supabase
        .from('assessment_audit_logs')
        .select('*, assessment:assessments(candidate:candidates(name))')
        .order('created_at', { ascending: false })
        .limit(30);

      setAuditLogs(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAssessments = assessments.filter(a => {
    const candidateName = a.candidate?.name || '';
    const position = a.candidate?.position || '';
    const token = a.access_token || '';

    const matchesSearch = 
      candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    
    const matchesProfile = profileFilter === 'all' || 
      a.score?.primary_profile === profileFilter || 
      a.score?.secondary_profile === profileFilter;

    return matchesSearch && matchesStatus && matchesProfile;
  });

  const totalCount = assessments.length;
  const pendingCount = assessments.filter(a => a.status === 'pending').length;
  const inProgressCount = assessments.filter(a => a.status === 'in_progress').length;
  const completedCount = assessments.filter(a => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-slate-100 shadow-sm text-sm">
            MA
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Mapa Comportamental
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Azevedo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <button
            onClick={() => setShowKnowledgeModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Base de Conhecimento das Métricas e Big Five"
          >
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Guia de Métricas</span>
          </button>

          {isMasterAdmin && (
            <button
              onClick={() => setShowCreateRecruiterModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Cadastrar Novo Recrutador"
            >
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Criar Recrutador</span>
            </button>
          )}

          <button
            onClick={fetchAuditLogs}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            title="Visualizar logs de auditoria"
          >
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Auditoria</span>
          </button>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

          <div className="flex items-center gap-2 text-xs">
            <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold relative">
              {recruiter?.name ? recruiter.name.substring(0, 2).toUpperCase() : 'R'}
              {isMasterAdmin && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" title="Recrutador Master"></span>
              )}
            </span>
            <div className="hidden md:block text-left">
              <div className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1">
                <span>{recruiter?.name || user.email}</span>
                {isMasterAdmin && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">Master</span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Recrutador Autenticado</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        
        {/* Executive Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total de Avaliações</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">{totalCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Avaliações Pendentes</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">{pendingCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Em Andamento</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">{inProgressCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
                <PlayCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Concluídas</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar & Action Header */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
          
          {/* Instant Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar candidato por nome, cargo ou token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 focus:border-slate-500 dark:focus:border-slate-600 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none transition-colors"
            />
          </div>

          {/* Filters & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendentes</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluídos</option>
              </select>
            </div>

            <select
              value={profileFilter}
              onChange={(e) => setProfileFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">Todos os Perfis</option>
              {Object.keys(PROFILES_CATALOG).map((pName) => (
                <option key={pName} value={pName}>{pName}</option>
              ))}
            </select>

            {/* Excel Import Button */}
            <button
              onClick={() => setShowExcelImportModal(true)}
              className="bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 font-semibold px-3.5 py-2 rounded-xl text-xs border border-emerald-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              title="Importar candidatos em lote via planilha Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Importar Excel</span>
            </button>

            {/* New Candidate Single Button */}
            <button
              onClick={() => {
                setGeneratedLink(null);
                setShowCreateModal(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded-xl text-xs border border-slate-800 dark:border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Candidato</span>
            </button>
          </div>
        </div>

        {/* Assessments & Candidates Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-200">
              Candidatos e Avaliações <span className="text-xs font-normal text-slate-500">({filteredAssessments.length})</span>
            </h2>
            <button
              onClick={fetchAssessments}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Atualizar</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-4 border-slate-400 border-t-slate-800 dark:border-slate-600 dark:border-t-slate-200 rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-xs">Carregando lista de candidatos...</span>
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="w-10 h-10 mx-auto mb-3 text-slate-400 dark:text-slate-600" />
              <p className="text-sm text-slate-700 dark:text-slate-400 font-medium">Nenhuma avaliação encontrada</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Cadastre ou importe candidatos para gerar os links de avaliação.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Candidato</th>
                    <th className="py-3.5 px-4 font-semibold">Cargo / Depto</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Perfil Principal</th>
                    <th className="py-3.5 px-4 font-semibold">Perfil Secundário</th>
                    <th className="py-3.5 px-4 font-semibold">Data</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                  {filteredAssessments.map((a) => {
                    const candidateName = a.candidate?.name || 'Candidato';
                    const position = a.candidate?.position || 'Operador';
                    const dept = a.candidate?.department || 'Operações';
                    const fullLink = `${window.location.origin}${window.location.pathname}?token=${a.access_token}`;

                    let statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                        Pendente
                      </span>
                    );
                    if (a.status === 'in_progress') {
                      statusBadge = (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                          Em Andamento
                        </span>
                      );
                    } else if (a.status === 'completed') {
                      statusBadge = (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                          Concluída
                        </span>
                      );
                    }

                    return (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">
                          <div className="font-semibold">{candidateName}</div>
                          {a.candidate?.email && <div className="text-[10px] text-slate-500">{a.candidate.email}</div>}
                        </td>
                        <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                          <div>{position}</div>
                          <div className="text-[10px] text-slate-500">{dept}</div>
                        </td>
                        <td className="py-4 px-4">{statusBadge}</td>
                        <td className="py-4 px-4">
                          {a.score?.primary_profile ? (
                            <span className="font-semibold text-blue-700 dark:text-blue-400">{a.score.primary_profile}</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">Aguardando término</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {a.score?.secondary_profile ? (
                            <span className="text-slate-700 dark:text-slate-300">{a.score.secondary_profile}</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                          {new Date(a.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {a.status === 'completed' && (
                              <button
                                onClick={() => setSelectedAssessmentForReport(a)}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-400 font-semibold border border-blue-200 dark:border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Abrir Relatório"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Relatório</span>
                              </button>
                            )}

                            <button
                              onClick={() => copyToClipboard(fullLink, a.access_token)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                              title="Copiar Link do Candidato"
                            >
                              {copiedToken === a.access_token ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteAssessment(a)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                              title="Excluir Candidato"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal 1: Create Single Candidate & Assessment */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Cadastrar Candidato & Criar Avaliação
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {generatedLink ? (
              <div className="space-y-6">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-5 text-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200 dark:border-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Avaliação Criada com Sucesso!</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">Envie o link seguro abaixo diretamente para o candidato.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-2">Link Único de Acesso do Candidato:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-blue-700 dark:text-blue-400 rounded-xl px-3 py-2 focus:outline-none select-all"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedLink, 'modal')}
                      className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white p-2 rounded-xl border border-slate-800 dark:border-slate-700 transition-colors shrink-0 cursor-pointer"
                    >
                      {copiedToken === 'modal' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setGeneratedLink(null);
                    setNewCandidateName('');
                    setNewCandidateEmail('');
                    setNewCandidatePhone('');
                    setShowCreateModal(false);
                  }}
                  className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold py-3 rounded-xl transition-colors cursor-pointer border border-slate-800 dark:border-slate-700"
                >
                  Concluir e Voltar ao Painel
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateCandidateAndAssessment} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nome Completo do Candidato *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mariana Silva"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-slate-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail (opcional)</label>
                    <input
                      type="email"
                      placeholder="candidato@email.com"
                      value={newCandidateEmail}
                      onChange={(e) => setNewCandidateEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-slate-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={newCandidatePhone}
                      onChange={(e) => setNewCandidatePhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-slate-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cargo Pretendido</label>
                    <input
                      type="text"
                      placeholder="Ex: Operador de Atendimento"
                      value={newCandidatePosition}
                      onChange={(e) => setNewCandidatePosition(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-slate-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Departamento</label>
                    <input
                      type="text"
                      placeholder="Ex: Operações Receptivo"
                      value={newCandidateDept}
                      onChange={(e) => setNewCandidateDept(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-slate-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={creating || !newCandidateName.trim()}
                    className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs border border-slate-800 dark:border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    {creating ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" />
                        <span>Gerar Link de Avaliação</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Create Recruiter (Master Only) */}
      {showCreateRecruiterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Cadastrar Novo Recrutador
                </h3>
              </div>
              <button
                onClick={() => setShowCreateRecruiterModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewRecruiter} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo do Recrutador *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Andrade"
                  value={newRecruiterName}
                  onChange={(e) => setNewRecruiterName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-slate-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-mail de Trabalho *
                </label>
                <input
                  type="email"
                  required
                  placeholder="recrutador@empresa.com"
                  value={newRecruiterEmail}
                  onChange={(e) => setNewRecruiterEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-slate-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Senha Inicial de Acesso *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newRecruiterPassword}
                  onChange={(e) => setNewRecruiterPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-slate-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateRecruiterModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={creatingRecruiter}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {creatingRecruiter ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Cadastrar Recrutador</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Knowledge Base / Metrics Guide Modal */}
      {showKnowledgeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Base de Conhecimento: Guia Metodológico & Cálculo de Notas
                </h3>
              </div>
              <button
                onClick={() => setShowKnowledgeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  1. O Modelo Psicométrico Big Five (OCEAN)
                </h4>
                <p>
                  O mapa avalia 5 grandes fatores universais da personalidade adaptados ao ambiente de atendimento:
                </p>
                <ul className="mt-2 space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-400">
                  <li><strong>Abertura a Experiências (O):</strong> Capacidade de aprendizado, flexibilidade com novos roteiros e sistemas.</li>
                  <li><strong>Conscienciosidade (C):</strong> Rigor com normas operacionais, atenção aos detalhes e pontualidade.</li>
                  <li><strong>Extroversão (E):</strong> Fluência verbal, assertividade na comunicação e facilidade em interagir.</li>
                  <li><strong>Amabilidade (A):</strong> Empatia, escuta ativa, paciência e foco na resolução amigável de conflitos.</li>
                  <li><strong>Estabilidade Emocional (ES):</strong> Resiliência, calma sob pressão e autocontrole em chamadas críticas.</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  2. O que significam os Pontos Positivos e Negativos (+ / - pts)?
                </h4>
                <p className="mb-2">
                  Na <strong>Simulação de Aderência a Cargos Operacionais</strong>, cada vaga de referência (ex: Atendimento Geral, Cobrança, SAC) possui uma meta ideal por competência. O número exibido indica a diferença (Delta) entre a nota do candidato e a meta do cargo:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-medium">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    <strong className="block mb-1 font-bold">+ Pontos (ex: +8 pts)</strong>
                    O candidato <strong>supera</strong> a meta recomendada do cargo nessa competência. É um ponto forte diferencial.
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400">
                    <strong className="block mb-1 font-bold">- Pontos (ex: -29 pts)</strong>
                    O candidato pontua <strong>abaixo</strong> da meta ideal do cargo. Representa uma oportunidade de desenvolvimento ou ponto para explorar em entrevista.
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400">
                    <strong className="block mb-1 font-bold">Próximo a Zero (ex: -2 pts)</strong>
                    O candidato está <strong>perfeitamente alinhado</strong> à expectativa ideal do cargo.
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  3. Aderência Global (%) e Classificação do Perfil
                </h4>
                <p>
                  A aderência global calcula a distância estatística entre o perfil real do candidato e o perfil ideal do cargo. Notas acima de 80% indicam altíssima compatibilidade operacional, enquanto notas abaixo de 60% sinalizam necessidade de treinamento intensivo ou reorientação de função.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                onClick={() => setShowKnowledgeModal(false)}
                className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Excel Import Modal */}
      {showExcelImportModal && (
        <ExcelImportModal
          isOpen={showExcelImportModal}
          onClose={() => setShowExcelImportModal(false)}
          userId={user.id}
          onSuccess={fetchAssessments}
        />
      )}

      {/* Modal 5: Report Viewer */}
      {selectedAssessmentForReport && (
        <AssessmentReportModal
          assessment={selectedAssessmentForReport}
          onClose={() => setSelectedAssessmentForReport(null)}
        />
      )}

      {/* Modal 6: Audit Logs */}
      {showAuditLogs && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Registros de Auditoria do Sistema</h3>
              </div>
              <button onClick={() => setShowAuditLogs(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {auditLogs.map((log: any) => (
                <div key={log.id} className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Ação: <span className="text-blue-600 dark:text-blue-400">{log.action}</span> por <span className="text-slate-500 dark:text-slate-400 font-normal">({log.actor_type})</span>
                    </div>
                    {log.assessment?.candidate?.name && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Candidato: {log.assessment.candidate.name}</div>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(log.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
