import React, { useState } from 'react';
import { AuthUser, Contract, FreelancerProfile, SecretEvaluation } from '../../types';
import { AlertTriangle, CheckCircle2, Lock, ShieldAlert } from 'lucide-react';
import { useToast } from '../common/ToastContext';

interface ConfidentialEvaluationFormProps {
  profile: FreelancerProfile;
  contracts: Contract[];
  currentUser: AuthUser | null | undefined;
  onAddSecretEvaluation: (evaluation: SecretEvaluation) => Promise<void> | void;
}

export const ConfidentialEvaluationForm: React.FC<ConfidentialEvaluationFormProps> = ({
  profile,
  contracts,
  currentUser,
  onAddSecretEvaluation,
}) => {
  const { showToast } = useToast();

  // Apenas contratos concluídos pertencentes a ESTE contratante e a ESTE profissional
  const eligibleCompletedContracts = contracts.filter(
    (c) =>
      c.freelancerId === profile.id &&
      c.employerId === currentUser?.id &&
      c.status === 'completed'
  );

  const [selectedContractId, setSelectedContractId] = useState<string>(
    eligibleCompletedContracts[0]?.id ?? ''
  );
  const [evalHonesty, setEvalHonesty] = useState<string>('10');
  const [evalPunctuality, setEvalPunctuality] = useState<string>('10');
  const [evalDiscretion, setEvalDiscretion] = useState<string>('10');
  const [wouldRehire, setWouldRehire] = useState<boolean>(true);
  const [privateFeedback, setPrivateFeedback] = useState<string>('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const parseScore = (raw: string): number | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const value = Number(trimmed);
    if (Number.isNaN(value) || value < 1 || value > 10) return null;
    return Math.round(value * 10) / 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);

    if (!currentUser || currentUser.role !== 'employer') {
      setReviewError(
        'Acesso bloqueado: Apenas contratantes com contrato concluído têm permissão para registrar avaliações.'
      );
      return;
    }

    const contract = eligibleCompletedContracts.find((c) => c.id === selectedContractId);
    if (!contract) {
      setReviewError('Selecione um contrato concluído válido vinculado à sua conta.');
      return;
    }

    const honesty = parseScore(evalHonesty);
    const punctuality = parseScore(evalPunctuality);
    const discretion = parseScore(evalDiscretion);

    if (honesty === null || punctuality === null || discretion === null) {
      setReviewError('Todas as notas devem ser números válidos entre 1,0 e 10,0.');
      return;
    }

    if (!privateFeedback.trim()) {
      setReviewError(`Por favor descreva como foi a experiência com ${profile.fullName}.`);
      return;
    }

    const newSecret: SecretEvaluation = {
      id: `sec-${crypto.randomUUID().slice(0, 8)}`,
      contractId: contract.id,
      freelancerId: profile.id,
      evaluatedAt: new Date().toLocaleDateString('pt-BR'),
      relationshipDuration: `Contrato concluído (${contract.startDate})`,
      honestyScore: honesty,
      punctualityScore: punctuality,
      emotionalStabilityScore: Math.round(((honesty + punctuality) / 2) * 10) / 10,
      discretionConfidentialityScore: discretion,
      reactionUnderCrisisScore: honesty,
      wouldRehirePrivately: wouldRehire,
      privateNotes: privateFeedback.trim(),
      hasVerifiedContract: true,
    };

    try {
      await onAddSecretEvaluation(newSecret);
      setPrivateFeedback('');
      showToast('Avaliação confidencial gravada com sucesso no banco SQLite!');
    } catch (err) {
      setReviewError(
        err instanceof Error
          ? err.message
          : 'Erro ao registrar avaliação confidencial no servidor.'
      );
    }
  };

  return (
    <div className="p-5 sm:p-6 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Registrar Avaliação Confidencial de Serviço
          </h3>
        </div>
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          Validação de Vínculo Contratual Obrigatória
        </span>
      </div>

      {currentUser?.role === 'freelancer' ? (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200 space-y-1">
          <span className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Você está conectado como profissional ({currentUser.name})
          </span>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            Profissionais não avaliam serviços nem acessam relatos confidenciais. Para testar o envio de uma avaliação confidencial,
            clique em <strong>"Alternar Perfil"</strong> no topo da página para entrar como contratante.
          </p>
        </div>
      ) : eligibleCompletedContracts.length === 0 ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-900 dark:text-rose-200 space-y-1">
          <span className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Contrato Concluído Obrigatório com sua Conta
          </span>
          <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed">
            Sua conta ({currentUser?.name}) ainda não possui um contrato no status <strong>CONCLUÍDO</strong> com{' '}
            <strong>{profile.fullName}</strong>. A plataforma bloqueia avaliações sem vínculo formal concluído.
          </p>
        </div>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5 max-w-2xl" noValidate>
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Vínculo de Contratação Comprovado:
            </span>
            <span>
              Você possui {eligibleCompletedContracts.length} contrato(s) concluído(s) com {profile.fullName}.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="eval-contract-select" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Contrato Concluído Elegível
              </label>
              <select
                id="eval-contract-select"
                value={selectedContractId}
                onChange={(e) => setSelectedContractId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-mono"
              >
                {eligibleCompletedContracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} [CONCLUÍDO] — {c.jobTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="eval-honesty" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Honestidade & Integridade (1 a 10)
              </label>
              <input
                id="eval-honesty"
                type="number"
                min={1}
                max={10}
                step={0.1}
                required
                value={evalHonesty}
                onChange={(e) => setEvalHonesty(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="eval-punctuality" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Pontualidade nos Plantões (1 a 10)
              </label>
              <input
                id="eval-punctuality"
                type="number"
                min={1}
                max={10}
                step={0.1}
                required
                value={evalPunctuality}
                onChange={(e) => setEvalPunctuality(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-mono tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="eval-discretion" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Discrição e Sigilo Familiar (1 a 10)
              </label>
              <input
                id="eval-discretion"
                type="number"
                min={1}
                max={10}
                step={0.1}
                required
                value={evalDiscretion}
                onChange={(e) => setEvalDiscretion(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
            <input
              id="eval-rehire"
              type="checkbox"
              checked={wouldRehire}
              onChange={(e) => setWouldRehire(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600 text-brand focus:ring-brand"
            />
            <label htmlFor="eval-rehire" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
              Recontrataria este(a) profissional em uma futura necessidade familiar
            </label>
          </div>

          <div>
            <label htmlFor="eval-notes" className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Relato Comportamental Privado (Visível apenas na Rede Sigilosa)
            </label>
            <textarea
              id="eval-notes"
              rows={3}
              required
              value={privateFeedback}
              onChange={(e) => setPrivateFeedback(e.target.value)}
              placeholder="Descreva a rotina, o cuidado com medicação e postura na residência..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md text-xs"
            />
          </div>

          {reviewError && (
            <div role="alert" className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded text-rose-800 dark:text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{reviewError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-brand hover:bg-slate-800 dark:hover:bg-brand-hover rounded-md transition-colors cursor-pointer"
            >
              Salvar Relatório Confidencial
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
