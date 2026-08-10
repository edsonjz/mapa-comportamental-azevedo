import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
        theme === 'dark'
          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 shadow-sm'
      } ${className}`}
      title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
    >
      {theme === 'dark' ? (
        <>
          <Moon className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="hidden sm:inline">Modo Escuro</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="hidden sm:inline">Modo Claro</span>
        </>
      )}
    </button>
  );
};
