import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ThemeToggle } from '../common/ThemeToggle';
import { Lock, Mail, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface RecruiterAuthProps {
  onSuccess: () => void;
}

export const RecruiterAuth: React.FC<RecruiterAuthProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });
      if (authErr) throw authErr;
      onSuccess();
    } catch (err: any) {
      console.error('Erro na autenticação:', err);
      setError(err.message || 'Falha ao autenticar. Verifique suas credenciais de recrutador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-200">
      
      {/* Theme Toggle Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl relative z-10">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-slate-900 dark:bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-slate-100 mx-auto mb-4 shadow-md">
            <ShieldCheck className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">
            Mapa Comportamental
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Azevedo
          </p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
          Acesso Restrito ao Painel de Recrutadores
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 p-3.5 rounded-xl text-xs mb-6 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              E-mail de Trabalho
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="edsonjz@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Acessar Painel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Acesso exclusivo para recrutadores autorizados Azevedo.<br />
            Novos recrutadores são cadastrados pelo Recrutador Master (edsonjz@gmail.com).
          </p>
        </div>
      </div>
    </div>
  );
};
