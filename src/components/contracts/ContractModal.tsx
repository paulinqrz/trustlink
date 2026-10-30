import React from 'react';
import { AuthUser, Contract } from '../../types';
import { ShieldCheck, CheckCircle2, Download, Lock, Clock, XCircle, FileText } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useToast } from '../common/ToastContext';

interface ContractModalProps {
  contract: Contract;
  currentUser: AuthUser;
  onClose: () => void;
  onSignContract?: (contractId: string) => void;
  onCompleteContract?: (contractId: string) => void;
}

const RATE_UNIT_LABELS: Record<Contract['rateType'], string> = {
  daily: 'plantão',
  hourly: 'hora',
  monthly: 'mês',
};

export const ContractModal: React.FC<ContractModalProps> = ({
  contract,
  currentUser,
  onClose,
  onSignContract,
  onCompleteContract,
}) => {
  const { showToast } = useToast();
  const isSignedByFreelancer = Boolean(contract.freelancerSignedAt);

  const canCurrentUserSign =
    !isSignedByFreelancer &&
    contract.status !== 'cancelled' &&
    currentUser.role === 'freelancer' &&
    (currentUser.freelancerProfileId === contract.freelancerId ||
      currentUser.name === contract.freelancerName);

  const canCurrentUserComplete =
    contract.status === 'active' &&
    currentUser.role === 'employer' &&
    currentUser.id === contract.employerId;

  const handleSign = () => {
    if (!canCurrentUserSign) return;
    if (onSignContract) {
      onSignContract(contract.id);
    }
  };

  const handleComplete = () => {
    if (!canCurrentUserComplete) return;
    if (onCompleteContract) {
      onCompleteContract(contract.id);
    }
  };

  const handleDownloadDocument = () => {
    const statusLabelMap: Record<Contract['status'], string> = {
      draft: 'RASCUNHO',
      pending_signature: 'AGUARDANDO ASSINATURA DO PROFISSIONAL',
      active: 'EM VIGÊNCIA',
      completed: 'CONCLUÍDO COM ÊXITO',
      cancelled: 'CANCELADO',
    };

    const content = [
      '========================================================================',
      'VERILAR BRASIL - COMPROVANTE FORMAL DE PRESTAÇÃO DE SERVIÇOS',
      '========================================================================',
      `ID do Contrato: ${contract.id}`,
      `Título: ${contract.jobTitle}`,
      `Situação Jurídica: ${statusLabelMap[contract.status]}`,
      `Contratante: ${contract.employerName} (${contract.employerId})`,
      `Profissional: ${contract.freelancerName} (${contract.freelancerId})`,
      `Local da Prestação: ${contract.locationAddress}`,
      `Início: ${contract.startDate}${contract.endDate ? ` | Término: ${contract.endDate}` : ''}`,
      `Remuneração: R$ ${contract.agreedRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ${RATE_UNIT_LABELS[contract.rateType]}`,
      '',
      'CLÁUSULAS PACTUADAS:',
      ...contract.clauses.map((c) => `  - ${c}`),
      '',
      'ASSINATURAS DIGITAIS:',
      `  • Contratante (${contract.employerName}): ${contract.employerSignedAt ? `Assinado em ${contract.employerSignedAt}` : 'Pendente'}`,
      `  • Profissional (${contract.freelancerName}): ${contract.freelancerSignedAt ? `Assinado em ${contract.freelancerSignedAt}` : 'Pendente de Aceite'}`,
      '',
      `Hash SHA-256 de Integridade: ${contract.securityHash}`,
      '========================================================================',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `minuta-contrato-${contract.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Minuta do contrato ${contract.id} baixada com sucesso!`, 'info');
  };

  const renderStatusBadge = () => {
    switch (contract.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Concluído com Êxito
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Em Vigência
          </span>
        );
      case 'pending_signature':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            Aguardando Assinatura
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 font-bold text-rose-700 dark:text-rose-400">
            <XCircle className="w-3.5 h-3.5" />
            Cancelado
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
            <FileText className="w-3.5 h-3.5" />
            Rascunho
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={contract.jobTitle}
      subtitle={`ID: ${contract.id} · Hash SHA-256: ${contract.securityHash.slice(0, 18)}...`}
      maxWidthClass="max-w-3xl"
      headerBadge={
        <div className="flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">CONTRATO FORMAL DE PRESTAÇÃO DE SERVIÇOS</span>
          <span className="text-slate-500">·</span>
          <span className="text-emerald-400 font-medium">Autenticação Digital Ativa</span>
        </div>
      }
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {!isSignedByFreelancer && currentUser.role === 'employer'
              ? `Aguardando assinatura digital de ${contract.freelancerName}`
              : 'Documento com validade civil e termos de confidencialidade'}
          </div>

          <div className="flex items-center gap-2.5">
            {canCurrentUserSign && (
              <button
                type="button"
                onClick={handleSign}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Assinar Digitalmente como {contract.freelancerName.split(' ')[0]}
              </button>
            )}

            {canCurrentUserComplete && (
              <button
                type="button"
                onClick={handleComplete}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Encerrar & Marcar como Concluído
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadDocument}
              className="px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              Baixar Minuta (.txt)
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-sm text-slate-700 dark:text-slate-300">
        {/* Metadata bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs tabular-nums">
          <div>
            <span className="text-slate-600 dark:text-slate-400 block mb-0.5">Família Contratante</span>
            <span className="font-bold text-slate-900 dark:text-white">{contract.employerName}</span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400 block mb-0.5">Profissional</span>
            <span className="font-bold text-slate-900 dark:text-white">{contract.freelancerName}</span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400 block mb-0.5">Remuneração Combinada</span>
            <span className="font-bold text-slate-900 dark:text-white">
              R$ {contract.agreedRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /{' '}
              {RATE_UNIT_LABELS[contract.rateType]}
            </span>
          </div>
          <div>
            <span className="text-slate-600 dark:text-slate-400 block mb-0.5">Situação Jurídica</span>
            {renderStatusBadge()}
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-2">
            TERMO DE PRESTAÇÃO DE SERVIÇOS E PROTOCOLO DE CONFIANÇA RESIDENCIAL
          </h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs mb-3">
            Pelo presente instrumento, de um lado <strong className="text-slate-900 dark:text-white">{contract.employerName}</strong> (Contratante) e de outro{' '}
            <strong className="text-slate-900 dark:text-white">{contract.freelancerName}</strong> (Profissional), celebram acordo de prestação de serviços em{' '}
            <strong className="text-slate-900 dark:text-white">{contract.locationAddress}</strong> sob as cláusulas:
          </p>

          <div className="space-y-2.5">
            {contract.clauses.map((clause, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
              >
                {clause}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-900 dark:bg-slate-950 text-slate-200 rounded-lg border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Lock className="w-4 h-4" />
            CLÁUSULA DE PRIVACIDADE E AVALIAÇÃO SIGILOSA
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            As partes acordam que quaisquer avaliações ou relatos comportamentais (positivos ou negativos){' '}
            <strong className="text-white">serão sempre mantidos em total sigilo na Rede Sigilosa</strong> para garantir igualdade e proteção mútua.
            A emissão de relatos só é permitida após o término formal da prestação do serviço.
          </p>
        </div>

        {/* Digital Signatures Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white">Assinatura da Contratante</span>
              {contract.employerSignedAt ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Assinado
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400 font-medium">Pendente</span>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              {contract.employerSignedAt
                ? `Validado por ${contract.employerName} · ${contract.employerSignedAt}`
                : `Aguardando assinatura de ${contract.employerName}`}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white">Assinatura do Profissional</span>
              {isSignedByFreelancer ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Assinado
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400 font-medium">Pendente de Aceite</span>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              {isSignedByFreelancer
                ? `Validado por ${contract.freelancerName} · ${contract.freelancerSignedAt}`
                : `Aguardando validação de ${contract.freelancerName}`}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
