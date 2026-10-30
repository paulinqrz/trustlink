import React from 'react';
import { JobApplicant } from '../../types';

interface StageBadgeProps {
  stage: JobApplicant['stage'];
}

const STAGE_STYLES: Record<JobApplicant['stage'], string> = {
  triagem: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800/60',
  entrevista: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-800/60',
  proposta: 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-950/50 dark:text-purple-200 dark:border-purple-800/60',
  contratado: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800/60',
};

const STAGE_LABELS: Record<JobApplicant['stage'], string> = {
  triagem: '1. Em Triagem',
  entrevista: '2. Entrevista Agendada',
  proposta: '3. Proposta Emitida',
  contratado: '4. Plantão Contratado',
};

export const StageBadge: React.FC<StageBadgeProps> = ({ stage }) => {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STAGE_STYLES[stage]}`}>
      {STAGE_LABELS[stage]}
    </span>
  );
};
