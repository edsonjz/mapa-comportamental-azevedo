import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import type { ClimateTeam, ClimateUserProfile, ClimateOperator } from '../../types/climateTypes';
import * as XLSX from 'xlsx';
import {
  Users,
  X,
  CheckCircle2,
  UserPlus,
  FileSpreadsheet,
  Copy,
  Check,
  Search,
  Trash2,
  Link2,
  ShieldCheck,
  Pencil,
  Settings
} from 'lucide-react';

interface ClimateManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClimateManagementModal: React.FC<ClimateManagementModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'operators' | 'teams' | 'supervisors'>('operators');
  const [loading, setLoading] = useState(false);
  
  const [teams, setTeams] = useState<ClimateTeam[]>([]);
  const [profiles, setProfiles] = useState<ClimateUserProfile[]>([]);
  const [operators, setOperators] = useState<ClimateOperator[]>([]);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Notifications
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Forms State - Add
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamSupervisorId, setNewTeamSupervisorId] = useState('');
  
  const [newSupName, setNewSupName] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');

  const [newOpName, setNewOpName] = useState('');
  const [newOpJobRole, setNewOpJobRole] = useState('Operador de Atendimento');
  const [newOpTeamId, setNewOpTeamId] = useState('');
  const [newOpSupervisorId, setNewOpSupervisorId] = useState('');
  const [newOpEmail, setNewOpEmail] = useState('');
  const [newOpPhone, setNewOpPhone] = useState('');

  // Modals & Edit States
  const [showAddOpModal, setShowAddOpModal] = useState(false);
  const [editingOperator, setEditingOperator] = useState<ClimateOperator | null>(null);
  
  const [editOpName, setEditOpName] = useState('');
  const [editOpJobRole, setEditOpJobRole] = useState('');
  const [editOpTeamId, setEditOpTeamId] = useState('');
  const [editOpSupervisorId, setEditOpSupervisorId] = useState('');
  const [editOpEmail, setEditOpEmail] = useState('');
  const [editOpPhone, setEditOpPhone] = useState('');

  // Team Edit & Member Management State
  const [editingTeam, setEditingTeam] = useState<ClimateTeam | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamSupervisorId, setEditTeamSupervisorId] = useState('');
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);
  const [teamMemberSearch, setTeamMemberSearch] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchManagementData();
    }
  }, [isOpen]);

  const fetchManagementData = async () => {
    setLoading(true);
    try {
      const { data: teamList } = await supabase.from('climate_teams').select('*').order('name', { ascending: true });
      const { data: profileList } = await supabase.from('climate_user_profiles').select('*').order('name', { ascending: true });
      const { data: opList } = await supabase.from('climate_operators').select('*').order('created_at', { ascending: false });

      if (teamList) setTeams(teamList);
      if (profileList) setProfiles(profileList);
      if (opList) setOperators(opList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers: Create Team ---
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const { error: err } = await supabase.from('climate_teams').insert({
        name: newTeamName.trim(),
        supervisor_id: newTeamSupervisorId || null
      });

      if (err) throw err;

      setNewTeamName('');
      setNewTeamSupervisorId('');
      setMessage({ type: 'success', text: 'Equipe cadastrada com sucesso!' });
      fetchManagementData();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Erro ao criar equipe.' });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handlers: Edit Team & Manage Members ---
  const openEditTeamModal = (team: ClimateTeam) => {
    setEditingTeam(team);
    setEditTeamName(team.name);
    setEditTeamSupervisorId(team.supervisor_id || '');
    
    // Initial members of this team
    const members = operators.filter((o) => o.team_id === team.id).map((o) => o.id);
    setTeamMemberIds(members);
    setTeamMemberSearch('');
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam || !editTeamName.trim()) return;
    setSubmitting(true);
    setMessage(null);

    try {
      // 1. Update Team Info
      const { error: teamErr } = await supabase
        .from('climate_teams')
        .update({
          name: editTeamName.trim(),
          supervisor_id: editTeamSupervisorId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTeam.id);

      if (teamErr) throw teamErr;

      // 2. Update Members:
      // A) Set team_id for all operators currently checked
      if (teamMemberIds.length > 0) {
        const updatePayload: any = {
          team_id: editingTeam.id,
          updated_at: new Date().toISOString()
        };
        if (editTeamSupervisorId) {
          updatePayload.supervisor_id = editTeamSupervisorId;
        }

        await supabase
          .from('climate_operators')
          .update(updatePayload)
          .in('id', teamMemberIds);
      }

      // B) Remove team_id for operators previously in team but now unchecked
      const previousMembers = operators.filter((o) => o.team_id === editingTeam.id).map((o) => o.id);
      const removedMembers = previousMembers.filter((id) => !teamMemberIds.includes(id));

      if (removedMembers.length > 0) {
        await supabase
          .from('climate_operators')
          .update({ team_id: null, updated_at: new Date().toISOString() })
          .in('id', removedMembers);
      }

      setEditingTeam(null);
      setMessage({ type: 'success', text: 'Equipe e lista de membros atualizadas com sucesso!' });
      fetchManagementData();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar equipe.' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTeamMember = (operatorId: string) => {
    setTeamMemberIds((prev) =>
      prev.includes(operatorId) ? prev.filter((id) => id !== operatorId) : [...prev, operatorId]
    );
  };

  // --- Handlers: Create Supervisor ---
  const handleCreateSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const cleanEmail = newSupEmail.trim() ? newSupEmail.trim().toLowerCase() : null;
      const { error: err } = await supabase.from('climate_user_profiles').insert({
        name: newSupName.trim(),
        email: cleanEmail,
        role: 'supervisor',
        job_role: 'Supervisor de Operações'
      });

      if (err) throw err;

      setNewSupName('');
      setNewSupEmail('');
      setMessage({ type: 'success', text: 'Supervisor cadastrado com sucesso!' });
      fetchManagementData();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Erro ao cadastrar supervisor.' });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handlers: Create Single Operator ---
  const handleCreateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpName.trim()) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const { error: err } = await supabase.from('climate_operators').insert({
        name: newOpName.trim(),
        job_role: newOpJobRole.trim() || 'Operador de Atendimento',
        team_id: newOpTeamId || null,
        supervisor_id: newOpSupervisorId || null,
        email: newOpEmail.trim() || null,
        phone: newOpPhone.trim() || null,
        access_token: token
      });

      if (err) throw err;

      setNewOpName('');
      setNewOpEmail('');
      setNewOpPhone('');
      setShowAddOpModal(false);
      setMessage({ type: 'success', text: 'Operador cadastrado com link exclusivo gerado!' });
      fetchManagementData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao cadastrar operador.' });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handlers: Edit Existing Operator ---
  const openEditOperatorModal = (op: ClimateOperator) => {
    setEditingOperator(op);
    setEditOpName(op.name);
    setEditOpJobRole(op.job_role || 'Operador de Atendimento');
    setEditOpTeamId(op.team_id || '');
    setEditOpSupervisorId(op.supervisor_id || '');
    setEditOpEmail(op.email || '');
    setEditOpPhone(op.phone || '');
  };

  const handleUpdateOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOperator || !editOpName.trim()) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const { error: err } = await supabase
        .from('climate_operators')
        .update({
          name: editOpName.trim(),
          job_role: editOpJobRole.trim() || 'Operador de Atendimento',
          team_id: editOpTeamId || null,
          supervisor_id: editOpSupervisorId || null,
          email: editOpEmail.trim() || null,
          phone: editOpPhone.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingOperator.id);

      if (err) throw err;

      setEditingOperator(null);
      setMessage({ type: 'success', text: `Cadastro de "${editOpName.trim()}" atualizado com sucesso!` });
      fetchManagementData();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Erro ao atualizar colaborador.' });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handlers: Excel Import ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData = XLSX.utils.sheet_to_json<any>(ws);

        if (!rawData || rawData.length === 0) {
          alert('Nenhum dado encontrado no arquivo Excel.');
          return;
        }

        setLoading(true);
        let importedCount = 0;

        for (const row of rawData) {
          const name = row['Nome'] || row['NOME'] || row['nome'] || row['Operador'] || row['OPERADOR'];
          if (!name) continue;

          const teamName = row['Equipe'] || row['EQUIPE'] || row['equipe'];
          const supervisorName = row['Supervisor'] || row['SUPERVISOR'] || row['supervisor'];
          const jobRole = row['Cargo'] || row['CARGO'] || row['cargo'] || 'Operador de Atendimento';
          const email = row['Email'] || row['E-mail'] || row['EMAIL'] || null;
          const phone = row['Telefone'] || row['TELEFONE'] || row['phone'] || null;

          // Match or create Team
          let targetTeamId: string | null = null;
          if (teamName) {
            const existingTeam = teams.find((t) => t.name.toLowerCase() === String(teamName).toLowerCase());
            if (existingTeam) {
              targetTeamId = existingTeam.id;
            } else {
              const { data: newTeam } = await supabase
                .from('climate_teams')
                .insert({ name: String(teamName).trim() })
                .select()
                .single();
              if (newTeam) {
                targetTeamId = newTeam.id;
                teams.push(newTeam);
              }
            }
          }

          // Match Supervisor
          let targetSupId: string | null = null;
          if (supervisorName) {
            const existingSup = profiles.find(
              (p) => p.name.toLowerCase().includes(String(supervisorName).toLowerCase()) || (p.email && p.email.toLowerCase().includes(String(supervisorName).toLowerCase()))
            );
            if (existingSup) {
              targetSupId = existingSup.id;
            }
          }

          const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

          await supabase.from('climate_operators').insert({
            name: String(name).trim(),
            job_role: String(jobRole).trim(),
            team_id: targetTeamId,
            supervisor_id: targetSupId,
            email: email ? String(email).trim() : null,
            phone: phone ? String(phone).trim() : null,
            access_token: token
          });

          importedCount++;
        }

        setMessage({ type: 'success', text: `${importedCount} operadores importados com sucesso do Excel!` });
        fetchManagementData();
      } catch (err: any) {
        console.error('Erro na importação de Excel:', err);
        alert(`Falha ao ler Excel: ${err.message || 'Formato inválido.'}`);
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- Handlers: Copy Links ---
  const getOperatorLink = (token: string) => {
    return `${window.location.origin}${window.location.pathname}?clima_token=${token}`;
  };

  const handleCopyLink = (token: string) => {
    const link = getOperatorLink(token);
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleCopyAllLinks = () => {
    if (operators.length === 0) return;
    const textReport = operators
      .map((op) => {
        const team = teams.find((t) => t.id === op.team_id);
        const sup = profiles.find((p) => p.id === op.supervisor_id);
        return `• ${op.name} (${team ? team.name : 'Sem Equipe'} / Sup: ${sup ? sup.name : 'N/A'}):\n  ${getOperatorLink(op.access_token)}`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(`LINKS DE RESPOSTA DA PESQUISA DE CLIMA 156:\n\n${textReport}`);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  const handleDeleteOperator = async (opId: string, opName: string) => {
    if (!confirm(`Deseja realmente remover o colaborador "${opName}"?`)) return;
    try {
      await supabase.from('climate_operators').delete().eq('id', opId);
      setOperators((prev) => prev.filter((o) => o.id !== opId));
      setMessage({ type: 'success', text: 'Operador removido.' });
    } catch (err: any) {
      alert(`Erro ao remover: ${err.message}`);
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Deseja realmente excluir a equipe "${teamName}"? Os colaboradores vinculados ficarão sem equipe.`)) return;
    try {
      await supabase.from('climate_teams').delete().eq('id', teamId);
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      setMessage({ type: 'success', text: 'Equipe removida.' });
      fetchManagementData();
    } catch (err: any) {
      alert(`Erro ao remover equipe: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  const supervisorsList = profiles.filter((p) => p.role === 'supervisor' || p.role === 'admin' || p.role === 'gestor');

  const filteredOperators = operators.filter((op) => {
    const team = teams.find((t) => t.id === op.team_id);
    const sup = profiles.find((p) => p.id === op.supervisor_id);
    const term = searchTerm.toLowerCase();

    return (
      op.name.toLowerCase().includes(term) ||
      (team && team.name.toLowerCase().includes(term)) ||
      (sup && sup.name.toLowerCase().includes(term)) ||
      (op.job_role && op.job_role.toLowerCase().includes(term))
    );
  });

  const filteredTeamMembers = operators.filter((op) => {
    const term = teamMemberSearch.toLowerCase();
    return op.name.toLowerCase().includes(term) || (op.job_role && op.job_role.toLowerCase().includes(term));
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-[96vw] xl:max-w-7xl w-full p-5 sm:p-7 shadow-2xl relative overflow-hidden text-slate-900 dark:text-slate-100 h-[92vh] max-h-[950px] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-600/20 border border-blue-500/30 dark:border-blue-500/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Gestão Organizacional & Links da Pesquisa</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mapeamento de colaboradores, supervisores, equipes e envio de links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-header Tabs */}
        <div className="flex items-center gap-2 mb-4 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          {[
            { id: 'operators', label: `Operadores & Links (${operators.length})`, icon: Link2 },
            { id: 'teams', label: `Equipes (${teams.length})`, icon: Users },
            { id: 'supervisors', label: `Supervisores (${supervisorsList.length})`, icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {message && (
          <div className={`p-3.5 rounded-2xl text-xs mb-4 flex items-center justify-between gap-3 border ${
            message.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TAB 1: OPERADORES & LINKS DE RESPOSTA */}
        {activeTab === 'operators' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por operador, equipe ou supervisor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-400 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Importar planilha de colaboradores"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Importar Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddOpModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Operador</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyAllLinks}
                  disabled={operators.length === 0}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Copiar relatório formatado com todos os links"
                >
                  {copiedAll ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copiados!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Todos os Links</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Operators Table */}
            <div className="flex-1 overflow-x-auto overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950">
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-xs">Carregando operadores...</div>
              ) : filteredOperators.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <Users className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-xs font-semibold text-slate-400">Nenhum operador encontrado.</p>
                  <p className="text-[11px] text-slate-500">Cadastre um operador manualmente ou importe uma planilha Excel.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-900 sticky top-0 z-10 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 min-w-[280px]">Nome do Colaborador</th>
                      <th className="py-3.5 px-4 min-w-[180px]">Cargo</th>
                      <th className="py-3.5 px-4 min-w-[160px]">Equipe</th>
                      <th className="py-3.5 px-4 min-w-[160px]">Supervisor</th>
                      <th className="py-3.5 px-4 min-w-[170px] text-center">Link Exclusivo da Pesquisa</th>
                      <th className="py-3.5 px-4 min-w-[100px] text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredOperators.map((op) => {
                      const team = teams.find((t) => t.id === op.team_id);
                      const sup = profiles.find((p) => p.id === op.supervisor_id);
                      const isCopied = copiedToken === op.access_token;

                      return (
                        <tr key={op.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">
                            <span className="block text-slate-100 font-bold">{op.name}</span>
                            {op.email && <div className="text-[10px] text-slate-400 font-normal">{op.email}</div>}
                          </td>
                          <td className="py-3 px-4 text-slate-300">{op.job_role}</td>
                          <td className="py-3 px-4 text-blue-400 font-semibold">
                            {team ? team.name : <span className="text-slate-500 font-normal">Sem Equipe</span>}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {sup ? sup.name : <span className="text-slate-500 font-normal">Sem Supervisor</span>}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(op.access_token)}
                              className={`px-3.5 py-1.5 rounded-xl font-semibold text-[11px] border transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer whitespace-nowrap ${
                                isCopied
                                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-blue-500'
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                                  <span>Link Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Link2 className="w-3.5 h-3.5 text-blue-400" />
                                  <span>Copiar Link</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditOperatorModal(op)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 border border-slate-800 transition-colors cursor-pointer"
                                title="Editar dados, equipe e supervisor"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteOperator(op.id, op.name)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                                title="Remover operador"
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
              )}
            </div>
          </div>
        )}

        {/* TAB 2: EQUIPES */}
        {activeTab === 'teams' && (
          <div className="space-y-6 overflow-y-auto pr-1 flex-1">
            <form onSubmit={handleCreateTeam} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cadastrar Nova Equipe</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nome da Equipe</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Equipe A - Atendimento 156"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Supervisor Responsável</label>
                  <select
                    value={newTeamSupervisorId}
                    onChange={(e) => setNewTeamSupervisorId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Sem supervisor atrelado</option>
                    {supervisorsList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                {submitting ? 'Salvando...' : 'Cadastrar Equipe'}
              </button>
            </form>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Equipes Cadastradas ({teams.length})</h4>
              {teams.map((team) => {
                const sup = profiles.find((p) => p.id === team.supervisor_id);
                const teamOpsCount = operators.filter((o) => o.team_id === team.id).length;

                return (
                  <div key={team.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block text-sm mb-0.5">{team.name}</span>
                      <span className="text-[11px] text-slate-400">
                        Supervisor: <strong className="text-slate-200">{sup ? sup.name : 'Nenhum'}</strong> • Colaboradores: <strong className="text-blue-400">{teamOpsCount}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditTeamModal(team)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Settings className="w-3.5 h-3.5 text-blue-400" />
                        <span>Gerenciar Membros & Supervisor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTeam(team.id, team.name)}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                        title="Excluir equipe"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SUPERVISORES */}
        {activeTab === 'supervisors' && (
          <div className="space-y-6 overflow-y-auto pr-1 flex-1">
            <form onSubmit={handleCreateSupervisor} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cadastrar Novo Supervisor</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo Azevedo"
                    value={newSupName}
                    onChange={(e) => setNewSupName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">E-mail (Opcional)</label>
                  <input
                    type="email"
                    placeholder="carlos.supervisor@contactcenter.com"
                    value={newSupEmail}
                    onChange={(e) => setNewSupEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                {submitting ? 'Salvando...' : 'Cadastrar Supervisor'}
              </button>
            </form>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Supervisores & Gestores ({supervisorsList.length})</h4>
              {supervisorsList.map((sup) => {
                const supOpsCount = operators.filter((o) => o.supervisor_id === sup.id).length;
                return (
                  <div key={sup.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block text-sm mb-0.5">{sup.name}</span>
                      <span className="text-[11px] text-slate-400">
                        {sup.email || 'Sem e-mail'} • Colaboradores vinculados: <strong className="text-emerald-400">{supOpsCount}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal 1: Manual Create Operator */}
        {showAddOpModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">Cadastrar Novo Operador</h3>
                <button onClick={() => setShowAddOpModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateOperator} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria das Dores Silva"
                    value={newOpName}
                    onChange={(e) => setNewOpName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Cargo</label>
                  <input
                    type="text"
                    placeholder="Ex: Operador de Atendimento 156"
                    value={newOpJobRole}
                    onChange={(e) => setNewOpJobRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Equipe</label>
                    <select
                      value={newOpTeamId}
                      onChange={(e) => {
                        const tid = e.target.value;
                        setNewOpTeamId(tid);
                        const selTeam = teams.find((t) => t.id === tid);
                        if (selTeam && selTeam.supervisor_id && !newOpSupervisorId) {
                          setNewOpSupervisorId(selTeam.supervisor_id);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Sem Equipe</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Supervisor</label>
                    <select
                      value={newOpSupervisorId}
                      onChange={(e) => setNewOpSupervisorId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Sem Supervisor</option>
                      {supervisorsList.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">E-mail (Opcional)</label>
                    <input
                      type="email"
                      placeholder="maria@email.com"
                      value={newOpEmail}
                      onChange={(e) => setNewOpEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Telefone (Opcional)</label>
                    <input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={newOpPhone}
                      onChange={(e) => setNewOpPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddOpModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                  >
                    {submitting ? 'Salvando...' : 'Salvar & Gerar Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Edit Existing Operator (Change Team, Supervisor & Info) */}
        {editingOperator && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Editar Cadastro do Colaborador</h3>
                </div>
                <button onClick={() => setEditingOperator(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateOperator} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={editOpName}
                    onChange={(e) => setEditOpName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Cargo</label>
                  <input
                    type="text"
                    value={editOpJobRole}
                    onChange={(e) => setEditOpJobRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Equipe</label>
                    <select
                      value={editOpTeamId}
                      onChange={(e) => {
                        const tid = e.target.value;
                        setEditOpTeamId(tid);
                        const selTeam = teams.find((t) => t.id === tid);
                        if (selTeam && selTeam.supervisor_id) {
                          setEditOpSupervisorId(selTeam.supervisor_id);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Sem Equipe</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Supervisor</label>
                    <select
                      value={editOpSupervisorId}
                      onChange={(e) => setEditOpSupervisorId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Sem Supervisor</option>
                      {supervisorsList.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">E-mail</label>
                    <input
                      type="email"
                      value={editOpEmail}
                      onChange={(e) => setEditOpEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Telefone</label>
                    <input
                      type="text"
                      value={editOpPhone}
                      onChange={(e) => setEditOpPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOperator(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                  >
                    {submitting ? 'Atualizando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Manage Team & Member Selection */}
        {editingTeam && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Gerenciar Equipe & Membros</h3>
                </div>
                <button onClick={() => setEditingTeam(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateTeam} className="space-y-4 text-xs flex-1 flex flex-col min-h-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Nome da Equipe *</label>
                    <input
                      type="text"
                      required
                      value={editTeamName}
                      onChange={(e) => setEditTeamName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Supervisor Responsável</label>
                    <select
                      value={editTeamSupervisorId}
                      onChange={(e) => setEditTeamSupervisorId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Sem Supervisor</option>
                      {supervisorsList.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Member Selection List */}
                <div className="flex-1 flex flex-col min-h-0 space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs uppercase tracking-wider">
                      Membros da Equipe ({teamMemberIds.length} selecionados)
                    </span>
                    <input
                      type="text"
                      placeholder="Filtrar colaboradores..."
                      value={teamMemberSearch}
                      onChange={(e) => setTeamMemberSearch(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950 p-2 space-y-1">
                    {filteredTeamMembers.length === 0 ? (
                      <p className="text-[11px] text-slate-500 text-center py-4">Nenhum operador encontrado.</p>
                    ) : (
                      filteredTeamMembers.map((op) => {
                        const isMember = teamMemberIds.includes(op.id);
                        return (
                          <label
                            key={op.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isMember
                                ? 'bg-blue-600/10 border-blue-500/40 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isMember}
                                onChange={() => toggleTeamMember(op.id)}
                                className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                              />
                              <div>
                                <span className="font-bold text-xs block">{op.name}</span>
                                <span className="text-[10px] text-slate-400">{op.job_role}</span>
                              </div>
                            </div>
                            {isMember && (
                              <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded-md">
                                Incluído na Equipe
                              </span>
                            )}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingTeam(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                  >
                    {submitting ? 'Atualizando...' : 'Salvar Membros & Equipe'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
