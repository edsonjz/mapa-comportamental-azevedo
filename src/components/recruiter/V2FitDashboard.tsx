import React from 'react';
import type { FitResult } from '../../lib/v2/scoringEngineV2';
import { Target } from 'lucide-react';

interface V2FitDashboardProps {
  primaryFit: FitResult;
  crossFits: FitResult[];
  onSelectCrossJob?: (jobId: string) => void;
}

export const V2FitDashboard: React.FC<V2FitDashboardProps> = ({ primaryFit, crossFits }) => {
  const getBadgeStyle = (classification: string) => {
    const text = classification.toLowerCase();
    if (text.includes('muito alta') || text.includes('alta')) {
      return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
    if (text.includes('moderada')) {
      return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
    return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
  };

  const components = [
    { label: 'Perfil de Personalidade (Big Five)', value: primaryFit.personalityFit },
    { label: 'Tendências Comportamentais', value: primaryFit.behaviorFit },
    { label: 'Interesses Profissionais (RIASEC)', value: primaryFit.interestFit },
    { label: 'Motivadores de Engajamento', value: primaryFit.motivationFit },
    { label: 'Julgamento Situacional (SJT Especifico)', value: primaryFit.sjtFit },
    { label: 'Competências Derivadas', value: primaryFit.competencyFit },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Fit Card */}
      <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-white dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 dark:border-blue-800/60 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Aderência Global — {primaryFit.jobName}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Função alvo avaliada com SJT direcionado de 15 situações reais
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${getBadgeStyle(primaryFit.fitClassification)}`}>
              {primaryFit.fitClassification}
            </span>
            <div className="text-right">
              <span className="text-2xl font-black text-blue-700 dark:text-blue-300">
                {Math.round(primaryFit.overallFit)}%
              </span>
            </div>
          </div>
        </div>

        {/* Component breakdown grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {components.map((comp) => (
            <div key={comp.label} className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-1">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block truncate" title={comp.label}>
                {comp.label}
              </span>
              <div className="flex items-center justify-between">
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mr-3">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                    style={{ width: `${comp.value}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{Math.round(comp.value)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Job Fits (Estimativa Preliminar) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Aderência Estimada a Outras Funções de Contact Center
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Calculada a partir dos módulos Comportamental e Motivacional (sem o SJT específico destas funções):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {crossFits.map((fit) => (
            <div
              key={fit.jobId}
              className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{fit.jobName}</span>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  {Math.round(fit.overallFit)}%
                </span>
              </div>

              <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${fit.overallFit}%` }}
                />
              </div>

              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                {fit.fitClassification} (Estimativa)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
