import React from 'react';
import { VerificationBadge } from '../../types';
import { ShieldCheck } from 'lucide-react';
import { Modal } from '../common/Modal';

interface BadgeAuditModalProps {
  badge: VerificationBadge | null;
  onClose: () => void;
}

export const BadgeAuditModal: React.FC<BadgeAuditModalProps> = ({ badge, onClose }) => {
  if (!badge) return null;

  return (
    <Modal
      isOpen={Boolean(badge)}
      onClose={onClose}
      title={badge.title}
      subtitle={`Emitido por ${badge.issuer}`}
      maxWidthClass="max-w-md"
      headerBadge={
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          AUDITORIA DO SELO DE VERIFICAÇÃO
        </span>
      }
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-brand hover:bg-slate-800 dark:hover:bg-brand-hover text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      }
    >
      <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
        <div>
          <span className="text-slate-600 dark:text-slate-400 font-semibold block mb-0.5">Certidão / Selo</span>
          <strong className="text-slate-900 dark:text-white">{badge.title}</strong>
        </div>
        <div>
          <span className="text-slate-600 dark:text-slate-400 font-semibold block mb-0.5">Órgão Emissor</span>
          <span className="text-slate-900 dark:text-slate-200">{badge.issuer}</span>
        </div>
        <div>
          <span className="text-slate-600 dark:text-slate-400 font-semibold block mb-0.5">Detalhes da Checagem</span>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{badge.details}</p>
        </div>
        <div>
          <span className="text-slate-600 dark:text-slate-400 font-semibold block mb-0.5">Registro / Hash de Integridade</span>
          <code className="p-2 bg-slate-100 dark:bg-slate-950 rounded-lg block font-mono text-[11px] break-all border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-emerald-400">
            {badge.documentHash}
          </code>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1 tabular-nums">
          <div>
            <span className="text-slate-600 dark:text-slate-400 font-semibold block">Verificado em</span>
            <span className="text-slate-900 dark:text-white">{badge.verifiedAt}</span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400 font-semibold block">Validade</span>
            <span className="text-slate-900 dark:text-white">Até {badge.expiresAt}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
