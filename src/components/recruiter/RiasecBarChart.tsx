import React from 'react';

interface RiasecBarChartProps {
  rScore: number;
  iScore: number;
  aScore: number;
  sScore: number;
  eScore: number;
  cScore: number;
  code?: string;
}

export const RiasecBarChart: React.FC<RiasecBarChartProps> = ({
  rScore = 0,
  iScore = 0,
  aScore = 0,
  sScore = 0,
  eScore = 0,
  cScore = 0,
  code = 'S-C-I'
}) => {
  const dimensions = [
    { key: 'S', label: 'Social (S)', score: sScore, color: 'bg-emerald-500 dark:bg-emerald-400', textColor: 'text-emerald-700 dark:text-emerald-300', desc: 'Atendimento, orientação e desenvolvimento de pessoas.' },
    { key: 'C', label: 'Convencional (C)', score: cScore, color: 'bg-blue-500 dark:bg-blue-400', textColor: 'text-blue-700 dark:text-blue-300', desc: 'Organização, controle de processos, registros e precisão.' },
    { key: 'I', label: 'Investigativo (I)', score: iScore, color: 'bg-purple-500 dark:bg-purple-400', textColor: 'text-purple-700 dark:text-purple-300', desc: 'Análise de dados, busca de causas e solução de problemas.' },
    { key: 'E', label: 'Empreendedor (E)', score: eScore, color: 'bg-amber-500 dark:bg-amber-400', textColor: 'text-amber-700 dark:text-amber-300', desc: 'Influência, foco em metas comerciais e negociação.' },
    { key: 'A', label: 'Artístico (A)', score: aScore, color: 'bg-pink-500 dark:bg-pink-400', textColor: 'text-pink-700 dark:text-pink-300', desc: 'Criatividade, novas abordagens e liberdade de inovação.' },
    { key: 'R', label: 'Realista (R)', score: rScore, color: 'bg-slate-500 dark:bg-slate-400', textColor: 'text-slate-700 dark:text-slate-300', desc: 'Atividades práticas, ferramentas e operação concreta.' },
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4">
      {/* Code Badge */}
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
            Código Dominante RIASEC (Holland)
          </span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Três Interesses de Maior Predominância
          </span>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-sm tracking-widest shadow-sm">
          {code}
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        {dimensions.map((dim) => (
          <div key={dim.key} className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-900 dark:text-slate-200">{dim.label}</span>
              <span className={dim.textColor}>{dim.score}%</span>
            </div>

            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
              <div
                className={`h-full transition-all duration-500 rounded-full ${dim.color}`}
                style={{ width: `${Math.min(100, Math.max(4, dim.score))}%` }}
              ></div>
            </div>

            <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
              {dim.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
