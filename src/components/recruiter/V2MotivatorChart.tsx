import React from 'react';
import { MOTIVATOR_NAMES, MotivatorKey } from '../../lib/v2/riasecMotivationQuestions';

interface V2MotivatorChartProps {
  scores: Record<string, number>;
  topMotivators?: { key: string; name: string; score: number }[];
}

export const V2MotivatorChart: React.FC<V2MotivatorChartProps> = ({ scores, topMotivators }) => {
  const motivators: { key: MotivatorKey; name: string; score: number }[] = [
    { key: 'AUT', name: MOTIVATOR_NAMES.AUT, score: scores.AUT || 0 },
    { key: 'EST', name: MOTIVATOR_NAMES.EST, score: scores.EST || 0 },
    { key: 'DES', name: MOTIVATOR_NAMES.DES, score: scores.DES || 0 },
    { key: 'REC', name: MOTIVATOR_NAMES.REC, score: scores.REC || 0 },
    { key: 'CHA', name: MOTIVATOR_NAMES.CHA, score: scores.CHA || 0 },
    { key: 'REL', name: MOTIVATOR_NAMES.REL, score: scores.REL || 0 },
    { key: 'ESTR', name: MOTIVATOR_NAMES.ESTR, score: scores.ESTR || 0 },
    { key: 'RES', name: MOTIVATOR_NAMES.RES, score: scores.RES || 0 },
  ];

  return (
    <div className="space-y-4">
      {topMotivators && topMotivators.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Principais Motivadores:</span>
          {topMotivators.map((m, idx) => (
            <span
              key={m.key}
              className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
            >
              #{idx + 1} {m.name} ({m.score}%)
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {motivators.map((item) => (
          <div key={item.key} className="space-y-1 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.score}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
