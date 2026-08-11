import React from 'react';

interface V2CompetencyChartProps {
  scores: Record<string, number>;
  requiredWeights?: Record<string, number>;
}

const COMPETENCY_LABELS: Record<string, string> = {
  assertividade: 'Assertividade',
  tomada_decisao: 'Tomada de Decisão',
  gestao_conflitos: 'Gestão de Conflitos',
  accountability: 'Accountability & Responsabilidade',
  orientacao_resultado: 'Orientação para Resultados',
  disciplina_operacional: 'Disciplina Operacional',
  flexibilidade_cognitiva: 'Flexibilidade Cognitiva',
  tolerancia_ambiguidade: 'Tolerância à Ambiguidade',
  agilidade_aprendizagem: 'Agilidade de Aprendizagem',
  escuta_ativa: 'Escuta Ativa & Empatia',
};

export const V2CompetencyChart: React.FC<V2CompetencyChartProps> = ({ scores, requiredWeights }) => {
  const keys = Object.keys(COMPETENCY_LABELS);

  return (
    <div className="space-y-3">
      {keys.map((key) => {
        const score = scores[key] || 0;
        const required = requiredWeights ? (requiredWeights[key] || 50) : undefined;

        let barColor = 'from-blue-500 to-indigo-600';
        if (required !== undefined) {
          const diff = score - required;
          if (diff >= 0) barColor = 'from-emerald-500 to-teal-600';
          else if (diff >= -15) barColor = 'from-amber-500 to-orange-500';
          else barColor = 'from-rose-500 to-red-600';
        }

        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {COMPETENCY_LABELS[key]}
              </span>
              <div className="flex items-center gap-2">
                {required !== undefined && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Req: <span className="font-semibold">{required}%</span>
                  </span>
                )}
                <span className="font-bold text-slate-900 dark:text-slate-100">{score}%</span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
              {required !== undefined && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-slate-100 z-10 opacity-70"
                  style={{ left: `${required}%` }}
                  title={`Exigência da função: ${required}%`}
                />
              )}
              <div
                className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
