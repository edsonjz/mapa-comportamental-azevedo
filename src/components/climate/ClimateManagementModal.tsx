import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { ClimateTeam, ClimateUserProfile } from '../../types/climateTypes';
import { Users, X, CheckCircle2 } from 'lucide-react';

interface ClimateManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClimateManagementModal: React.FC<ClimateManagementModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<ClimateTeam[]>([]);
  const [profiles, setProfiles] = useState<ClimateUserProfile[]>([]);

  // New Team State
  const [newTeamName, setNewTeamName] = useState('');
  const [newSupervisorId, setNewSupervisorId] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchManagementData();
    }
  }, [isOpen]);

  const fetchManagementData = async () => {
    setLoading(true);
    try {
      const { data: teamList } = await supabase.from('climate_teams').select('*').order('created_at', { ascending: false });
      const { data: profileList } = await supabase.from('climate_user_profiles').select('*').order('name', { ascending: true });
      
      if (teamList) setTeams(teamList);
      if (profileList) setProfiles(profileList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setCreatingTeam(true);
    setMessage(null);

    try {
      const { error: err } = await supabase.from('climate_teams').insert({
        name: newTeamName.trim(),
        supervisor_id: newSupervisorId || null
      });

      if (err) throw err;

      setNewTeamName('');
      setNewSupervisorId('');
      setMessage('Equipe cadastrada com sucesso!');
      fetchManagementData();
    } catch (err: any) {
      console.error(err);
      setMessage(`Erro: ${err.message || 'Falha ao criar equipe.'}`);
    } finally {
      setCreatingTeam(false);
    }
  };

  if (!isOpen) return null;

  const supervisors = profiles.filter((p) => p.role === 'supervisor' || p.role === 'admin' || p.role === 'gestor');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/40 rounded-xl flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gestão de Equipes & Supervisores</h3>
              <p className="text-xs text-slate-400">Mapeamento estrutural para a Pesquisa de Clima</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-400" />
            <span>{message}</span>
          </div>
        )}

        <div className="space-y-6 overflow-y-auto pr-2 flex-1">
          
          {/* Create Team Form */}
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
                  value={newSupervisorId}
                  onChange={(e) => setNewSupervisorId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Sem supervisor atrelado</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={creatingTeam}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              {creatingTeam ? 'Salvando...' : 'Cadastrar Equipe'}
            </button>
          </form>

          {/* Existing Teams List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Equipes Cadastradas ({teams.length})</h4>
            <div className="space-y-2">
              {loading ? (
                <div className="p-4 text-center text-slate-400 text-xs">Carregando equipes...</div>
              ) : teams.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nenhuma equipe cadastrada ainda.</p>
              ) : (
                teams.map((team) => {
                  const sup = profiles.find((p) => p.id === team.supervisor_id);
                  return (
                    <div key={team.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white block">{team.name}</span>
                        <span className="text-[11px] text-slate-400">
                          Supervisor: {sup ? sup.name : 'Nenhum'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
