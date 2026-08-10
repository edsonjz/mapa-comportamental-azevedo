import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ThemeToggle } from '../common/ThemeToggle';
import { Lock, Mail, User, ShieldCheck, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

interface RecruiterAuthProps {
  onSuccess: () => void;
}

const MASTER_ADMIN_EMAIL = 'edsonjz@gmail.com';

export const RecruiterAuth: React.FC<RecruiterAuthProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (mode === 'login') {
        const { error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (authErr) throw authErr;
      } else {
        // Registration rule: Only master recruiter (edsonjz@gmail.com) can create recruiter accounts
        if (cleanEmail !== MASTER_ADMIN_EMAIL.toLowerCase()) {
          setError(`Permissão negada. Apenas o Recrutador Master (${MASTER_ADMIN_EMAIL}) tem autorização para cadastrar novas contas.`);
          setLoading(false);
          return;
        }

        const { data, error: authErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { name: name.trim() || 'Recrutador Master' }
          }
        });
        if (authErr) throw authErr;

        if (data.user) {
          await supabase.from('recruiters').upsert({
            id: data.user.id,
            name: name.trim() || 'Edson Azevedo',
            email: cleanEmail,
            role: 'master_admin'
          });
        }
      }
      onSuccess();
    } catch (err: any) {
      console.error('Erro na autenticação:', err);
      setError(err.message || 'Falha ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-200">
      
      {/* Theme Toggle Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-3xl max-w-md w-full p-8 shadow-2xl relative z-10">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-slate-800 dark:bg-slate-800 light:bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-slate-100 mx-auto mb-4 shadow-md">
            <ShieldCheck className="w-8 h-8 text-blue-400 light:text-blue-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">
            Mapa Comportamental
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Azevedo
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-100 p-1 rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-300 flex gap-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-slate-800 dark:bg-slate-800 light:bg-slate-900 text-white shadow-sm'
                : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-200'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-slate-800 dark:bg-slate-800 light:bg-slate-900 text-white shadow-sm'
                : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-200'
            }`}
          >
            Criar Conta Recrutador
          </button>
        </div>

        {mode === 'signup' && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 dark:text-amber-300 light:text-amber-800 p-3 rounded-xl text-xs mb-4 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Cadastro restrito ao Recrutador Master <strong>({MASTER_ADMIN_EMAIL})</strong>.
            </span>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 dark:bg-rose-500/10 light:bg-rose-50 border border-rose-500/20 text-rose-400 dark:text-rose-400 light:text-rose-700 p-3.5 rounded-xl text-xs mb-6 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1.5">
                Nome Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 focus:border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 dark:text-slate-200 light:text-slate-900 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1.5">
              E-mail de Trabalho
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="recrutador@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 focus:border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 dark:text-slate-200 light:text-slate-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 dark:bg-slate-950/80 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-300 focus:border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 dark:text-slate-200 light:text-slate-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 light:bg-slate-900 light:hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{mode === 'login' ? 'Acessar Painel' : 'Concluir Cadastro'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-500 light:text-slate-600">
            Acesso exclusivo para profissionais de R&S e Gestão de Pessoas Azevedo.
          </p>
        </div>
      </div>
    </div>
  );
};
