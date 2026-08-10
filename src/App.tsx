import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { RecruiterAuth } from './components/auth/RecruiterAuth';
import { Dashboard } from './components/recruiter/Dashboard';
import { CandidateAssessmentFlow } from './components/candidate/CandidateAssessmentFlow';
import { ThemeProvider } from './context/ThemeContext';
import type { Session } from '@supabase/supabase-js';

export const AppContent: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenFromUrl, setTokenFromUrl] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check for token in URL query parameters e.g. ?token=abc123xyz
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setTokenFromUrl(token);
    }

    // 2. Check Supabase auth session for recruiters
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, newSession: Session | null) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 dark:bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-slate-600 border-t-slate-200 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-xs font-medium">Iniciando Mapa Comportamental Azevedo...</p>
      </div>
    );
  }

  // A) Candidate Route: Token is provided in URL
  if (tokenFromUrl) {
    return <CandidateAssessmentFlow token={tokenFromUrl} />;
  }

  // B) Recruiter Authenticated View
  if (session && session.user) {
    return <Dashboard user={session.user} onLogout={handleLogout} />;
  }

  // C) Recruiter Login / Registration View
  return <RecruiterAuth onSuccess={() => {}} />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
