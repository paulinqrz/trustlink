import React from 'react';
import { VerificationBadge } from '../../types';
import { ShieldCheck, Lock } from 'lucide-react';
import { Modal } from '../common/Modal';

interface BadgeAuditModalProps {
  badge: VerificationBadge | null;
  onClose: () => void;
}

export const BadgeAuditModal: React.FC<BadgeAuditModalProps> = ({ badge, onClose }) => {
  if (!badge) return null;

  const layerLabel =
    badge.layer === 'identidade' || badge.type === 'identity'
      ? 'Camada 1 · Identidade (Documento + Selfie)'
      : badge.layer === 'antecedentes' || badge.type === 'criminal_record'
      ? 'Camada 2 · Antecedentes Polícia Federal (90 dias)'
      : badge.layer === 'formacao' || badge.type === 'training_certificate'
      ? 'Camada 3 · Formação & Certificado Conferido'
      : 'Camada Verilar';

  return (
    <Modal
      isOpen={Boolean(badge)}
      onClose={onClose}
      title={badge.title}
      subtitle={`Conferido em ${badge.issuer}`}
      maxWidthClass="max-w-md"
      headerBadge={
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          VERIFICAÇÃO GRATUITA VERILAR
        </span>
      }
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-brand hover:bg-slate-800 dark:hover:bg-brand-hover text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar Comprovante
          </button>
        </div>
      }
    >
      <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold">
          {layerLabel}
        </div>

        <div>
          <span className="text-slate-600 dark:text-slate-400 font-semibold block mb-0.5">
            Órgão / Conferência
          </span>
          <span className="text-slate-900 dark:text-slate-200">{badge.issuer}</span>
        </div>

        <div>
          <span className="text-slate-600 dark:text-slate-400 font-semibold block mb-0.5">
            O que a família vê que foi checado
          </span>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{badge.details}</p>
        </div>

        <div>
          <span className="text-slate-600 dark:text-slate-400 font-semibold block mb-0.5">
            Protocolo de Validação Armazenado
          </span>
          <code className="p-2 bg-slate-100 dark:bg-slate-950 rounded-lg block font-mono text-[11px] break-all border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-emerald-400">
            {badge.documentHash}
          </code>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 tabular-nums">
          <div>
            <span className="text-slate-600 dark:text-slate-400 font-semibold block">
              Verificado em
            </span>
            <span className="text-slate-900 dark:text-white">{badge.verifiedAt}</span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400 font-semibold block">
              Validade ({badge.validityDays ?? 90} dias)
            </span>
            <span className="text-slate-900 dark:text-white">Até {badge.expiresAt}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400">
          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <span>
            {badge.lgpdNotice ||
              'Pela LGPD, a Verilar guarda apenas o resultado e o protocolo da verificação, nunca cópias permanentes do documento.'}
          </span>
        </div>
      </div>
    </Modal>
  );
};
