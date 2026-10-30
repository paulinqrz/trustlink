import React from 'react';
import {
  FreelancerProfile,
  JobAnnouncement,
  JobApplicant,
  PublicReview,
  SecretEvaluation,
} from '../../types';
import { getInitials } from '../../services/trustlinkService';
import { Modal } from '../common/Modal';
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Calendar,
  Lock,
  Send,
  Star,
  UserCheck,
  ExternalLink,
} from 'lucide-react';

interface CandidateDossierModalProps {
  applicant: JobApplicant | null;
  announcement: JobAnnouncement | undefined;
  candidateProfile: FreelancerProfile | undefined;
  secretEvaluations: SecretEvaluation[];
  publicReviews: PublicReview[];
  onClose: () => void;
  onStageChange: (applicantId: string, newStage: JobApplicant['stage']) => void;
  onOpenContractModal: (contractId: string) => void;
  onSelectCandidateProfile?: (candidateId: string) => void;
}

export const CandidateDossierModal: React.FC<CandidateDossierModalProps> = ({
  applicant,
  announcement,
  candidateProfile,
  secretEvaluations,
  publicReviews,
  onClose,
  onStageChange,
  onOpenContractModal,
  onSelectCandidateProfile,
}) => {
  if (!applicant) return null;

  const candidateSecrets = secretEvaluations.filter((s) => s.freelancerId === applicant.candidateId);
  const candidatePublics = publicReviews.filter((r) => r.freelancerId === applicant.candidateId);

  const avgScore = (getter: (s: SecretEvaluation) => number): string => {
    if (candidateSecrets.length === 0) return '—';
    const sum = candidateSecrets.reduce((acc, item) => acc + getter(item), 0);
    return (sum / candidateSecrets.length).toFixed(1);
  };

  const latestSecret = candidateSecrets[0];
  const latestPublic = candidatePublics[0];

  return (
    <Modal
      isOpen={Boolean(applicant)}
      onClose={onClose}
      title={applicant.candidateName}
      subtitle={`${applicant.candidateRole} · Candidatura para "${announcement?.title ?? 'Vaga'}"`}
      maxWidthClass="max-w-4xl"
      headerBadge={
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Dossiê Verificado · {getInitials(applicant.candidateName)}
        </span>
      }
      footer={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400">Etapa Atual:</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
              {applicant.stage.toUpperCase()}
            </span>
            {onSelectCandidateProfile && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectCandidateProfile(applicant.candidateId);
                }}
                className="text-xs font-semibold text-brand dark:text-sky-400 hover:underline inline-flex items-center gap-1 ml-2 cursor-pointer"
              >
                Abrir Perfil Completo <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {applicant.stage === 'triagem' && (
              <button
                type="button"
                onClick={() => onStageChange(applicant.id, 'entrevista')}
                className="px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-brand dark:text-sky-400" /> Agendar Entrevista
              </button>
            )}

            {(applicant.stage === 'triagem' || applicant.stage === 'entrevista') && (
              <button
                type="button"
                onClick={() => onStageChange(applicant.id, 'proposta')}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-brand hover:bg-slate-800 dark:hover:bg-brand-hover rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400 dark:text-white" /> Emitir Proposta & Minuta
              </button>
            )}

            {applicant.stage === 'proposta' && (
              <button
                type="button"
                onClick={() => onStageChange(applicant.id, 'contratado')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar Contratação Formal
              </button>
            )}

            {applicant.contractId && (
              <button
                type="button"
                onClick={() => onOpenContractModal(applicant.contractId!)}
                className="px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" /> Ver Minuta Digital
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-xs text-slate-700 dark:text-slate-300">
        {/* Application Pitch */}
        <div className="p-4 bg-blue-50/70 dark:bg-sky-950/40 border border-blue-200 dark:border-sky-800/70 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-brand dark:text-sky-400 tracking-wider">
              APRESENTAÇÃO ENVIADA NA CANDIDATURA
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">Enviada {applicant.appliedDate}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed italic">
            "{applicant.coverNote || 'Tenho total compromisso e disponibilidade com o cuidado humanizado da sua família.'}"
          </p>

          <div className="pt-2 border-t border-blue-200/70 dark:border-sky-800/60 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300 tabular-nums">
            <span>
              Pretensão informada: <strong className="text-slate-900 dark:text-white">R$ {applicant.salaryExpectation} / plantão</strong>
            </span>
            <span>
              Distância calculada: <strong className="text-slate-900 dark:text-white">{applicant.distanceKm} km</strong> da sua residência
            </span>
          </div>
        </div>

        {/* Verified Trust Badges from actual profile */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wide">
              Selos de Verificação Oficiais ({candidateProfile ? candidateProfile.badges.length : applicant.badges.length})
            </h4>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              100% Autenticados
            </span>
          </div>

          {candidateProfile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {candidateProfile.badges.map((badge) => (
                <div key={badge.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{badge.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{badge.details}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {applicant.badges.map((b, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-lg"
                >
                  ✓ {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Confidential Behavioral Evaluation */}
        <div className="p-4 bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white rounded-xl space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                Rede Sigilosa de Confiança (Exclusivo Empregadores Auditados)
              </span>
            </div>
            <span className="text-[11px] text-slate-300 tabular-nums">
              {candidateSecrets.length} relato(s) auditado(s)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800 tabular-nums">
            <div className="bg-slate-800/80 p-2 rounded-lg text-center">
              <span className="text-[10px] text-slate-300 block">Honestidade</span>
              <span className="text-sm font-bold text-emerald-400">{avgScore((s) => s.honestyScore)} / 10</span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-lg text-center">
              <span className="text-[10px] text-slate-300 block">Pontualidade</span>
              <span className="text-sm font-bold text-emerald-400">{avgScore((s) => s.punctualityScore)} / 10</span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-lg text-center">
              <span className="text-[10px] text-slate-300 block">Discrição / Sigilo</span>
              <span className="text-sm font-bold text-emerald-400">
                {avgScore((s) => s.discretionConfidentialityScore)} / 10
              </span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-lg text-center">
              <span className="text-[10px] text-slate-300 block">Reação sob Crise</span>
              <span className="text-sm font-bold text-emerald-400">
                {avgScore((s) => s.reactionUnderCrisisScore)} / 10
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/90 rounded-lg border border-slate-700 text-[11px] text-slate-200">
            <span className="font-semibold text-amber-400 block mb-1">
              Relato confidencial de ex-família contratante ({latestSecret?.relationshipDuration ?? 'Auditada'}):
            </span>
            <p className="italic">
              "{latestSecret?.privateNotes ?? applicant.confidentialFeedbackSnippet ?? 'Conduta ética e profissionalismo verificados em contratos anteriores.'}"
            </p>
          </div>
        </div>

        {/* Public Reviews summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between tabular-nums">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide">
              Referência de Contrato Concluído ({applicant.reviewCount} avaliações)
            </h4>
            <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{applicant.rating} de 5.0</span>
            </div>
          </div>

          {latestPublic ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-900 dark:text-white">{latestPublic.employerName}</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {latestPublic.serviceCategory} · {latestPublic.contractPeriod}
                </span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 italic">"{latestPublic.comment}"</p>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-600 dark:text-slate-400">
              Nenhuma referência pública adicional cadastrada para este candidato.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
