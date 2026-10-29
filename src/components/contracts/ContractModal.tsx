import React, { useState } from 'react';
import { Contract } from '../../types';
import { ShieldCheck, CheckCircle2, Download, X, Lock } from 'lucide-react';

interface ContractModalProps {
  contract: Contract;
  onClose: () => void;
  onSignContract?: (contractId: string) => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({ contract, onClose, onSignContract }) => {
  const [isSigned, setIsSigned] = useState(Boolean(contract.freelancerSignedAt));
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleSign = () => {
    setIsSigned(true);
    if (onSignContract) {
      onSignContract(contract.id);
    }
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="relative w-full max-w-3xl my-8 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">CONTRATO FORMAL DE PRESTAÇÃO DE SERVIÇOS</span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-emerald-400 font-medium">Autenticação Digital Ativa</span>
              </div>
              <h2 className="text-base font-bold text-white">{contract.jobTitle}</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contract Body Document */}
        <div className="p-6 md:p-8 space-y-5 text-sm text-slate-700 bg-white max-h-[65vh] overflow-y-auto">
          {/* Metadata bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Família Contratante</span>
              <span className="font-bold text-slate-900">{contract.employerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Profissional Cuidadora</span>
              <span className="font-bold text-slate-900">{contract.freelancerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Remuneração Combinada</span>
              <span className="font-bold text-slate-900">R$ {contract.agreedRate},00 / {contract.rateType === 'daily' ? 'plantão' : 'hora'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Situação Jurídica</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {contract.status === 'completed' ? 'Concluído com Êxito' : 'Em Vigência'}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
              TERMO DE PRESTAÇÃO DE SERVIÇOS E PROTOCOLO DE CONFIANÇA RESIDENCIAL
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs mb-3">
              Pelo presente instrumento, de um lado <strong>{contract.employerName}</strong> (Contratante) e de outro 
              <strong> {contract.freelancerName}</strong> (Profissional Cuidadora), celebram acordo de prestação de serviços com 
              registro formal e garantia de integridade pela plataforma <strong>TrustLink</strong> sob as cláusulas:
            </p>

            <div className="space-y-2.5">
              {contract.clauses.map((clause, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {clause}
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Dual Review Mandatory Clause */}
          <div className="p-4 bg-slate-900 text-slate-200 rounded-lg border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Lock className="w-4 h-4" />
              CLÁUSULA DE PRIVACIDADE E AVALIAÇÃO SIGILOSA
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              As partes acordam que quaisquer avaliações ou relatos comportamentais (positivos ou negativos) 
              <strong> serão sempre mantidos em total sigilo na Rede Sigilosa</strong> para garantir igualdade e proteção mútua. 
              A emissão de relatos só é permitida após o término formal da prestação do serviço.
            </p>
          </div>

          {/* Digital Signatures Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Assinatura da Contratante</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Assinado
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Validado por Dra. Beatriz Fontana · {contract.employerSignedAt || '14/06/2026 às 19:42'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Assinatura da Cuidadora</span>
                {isSigned ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Assinado
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">Pendente de Aceite</span>
                )}
              </div>
              <p className="text-slate-500 text-[11px]">
                {isSigned 
                  ? `Validado por Maria Clara Silveira · ${contract.freelancerSignedAt || '14/06/2026 às 20:15'}` 
                  : 'Aguardando validação da profissional'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Documento com validade civil e termos de confidencialidade
          </div>

          <div className="flex items-center gap-2.5">
            {!isSigned && (
              <button
                onClick={handleSign}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                Assinar Digitalmente
              </button>
            )}

            <button
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-4 h-4 text-slate-600" />
              {downloadSuccess ? 'Documento Baixado!' : 'Baixar Minuta em PDF'}
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
