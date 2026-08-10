import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lhbjkxpbhzfmzmrqdswq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoYmpreHBiaHpmbXptcnFkc3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzODU1ODMsImV4cCI6MjEwMTk2MTU4M30.E64y1MvcBrbOe1XlB-LTP1HqREqUI5Cja1tNuejsN2k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
