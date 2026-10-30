import React, { useMemo, useState } from 'react';
import {
  AuthUser,
  ChatMessage,
  FreelancerProfile,
} from '../../types';
import { getInitials } from '../../services/trustlinkService';
import {
  ShieldCheck,
  Send,
  QrCode,
  CreditCard,
  CheckCircle2,
  Star,
  Copy,
  MessageSquare,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { useToast } from '../common/ToastContext';

interface ChatViewProps {
  currentUser: AuthUser;
  profiles: FreelancerProfile[];
  messages: ChatMessage[];
  initialFreelancerId?: string;
  onSendMessage: (payload: {
    freelancerId: string;
    employerId?: string;
    content: string;
    proposedAmount?: number;
    paymentMethod?: 'pix' | 'platform';
    serviceDate?: string;
  }) => Promise<void>;
  onConfirmPayment: (messageId: string) => Promise<void>;
  onOpenProfile: (profileId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentUser,
  profiles,
  messages,
  initialFreelancerId,
  onSendMessage,
  onConfirmPayment,
  onOpenProfile,
}) => {
  const { showToast } = useToast();
  const isEmployer = currentUser.role === 'employer';

  const verifiedProfiles = useMemo(
    () => profiles.filter((p) => p.isVerified),
    [profiles]
  );

  // Lista de conversas disponíveis
  const conversationTargets = useMemo(() => {
    if (isEmployer) {
      return verifiedProfiles.map((p) => ({
        key: p.id,
        freelancerId: p.id,
        employerId: currentUser.id,
        displayName: p.fullName,
        subtitle: `${p.category} · R$ ${p.dailyRate}/diária`,
        pixKey: p.pixKey || 'verilar.pagamentos@pix.com.br',
        dailyRate: p.dailyRate,
      }));
    }

    // Se logado como profissional, agrupa pelas famílias que mandaram mensagem (ou Marina padrão)
    const empMap = new Map<string, { employerId: string; employerName: string }>();
    for (const m of messages) {
      if (m.freelancerId === currentUser.freelancerProfileId) {
        empMap.set(m.employerId, {
          employerId: m.employerId,
          employerName: m.employerName,
        });
      }
    }
    if (empMap.size === 0) {
      empMap.set('emp-501', {
        employerId: 'emp-501',
        employerName: 'Marina Mendes',
      });
    }

    const ownProfile = profiles.find((p) => p.id === currentUser.freelancerProfileId);
    return Array.from(empMap.values()).map((emp) => ({
      key: emp.employerId,
      freelancerId: currentUser.freelancerProfileId || 'fl-101',
      employerId: emp.employerId,
      displayName: emp.employerName,
      subtitle: 'Família Cliente Verilar',
      pixKey: ownProfile?.pixKey || 'cida.oliveira@verilar.pix',
      dailyRate: ownProfile?.dailyRate || 180,
    }));
  }, [isEmployer, verifiedProfiles, currentUser, messages, profiles]);

  const [selectedKey, setSelectedKey] = useState<string>(() => {
    if (initialFreelancerId && isEmployer) return initialFreelancerId;
    return conversationTargets[0]?.key || '';
  });

  const activeTarget =
    conversationTargets.find((t) => t.key === selectedKey) || conversationTargets[0];

  const threadMessages = useMemo(() => {
    if (!activeTarget) return [];
    return messages.filter(
      (m) =>
        m.freelancerId === activeTarget.freelancerId &&
        m.employerId === activeTarget.employerId
    );
  }, [messages, activeTarget]);

  const [draftText, setDraftText] = useState('');
  const [showProposalBox, setShowProposalBox] = useState(false);
  const [proposedAmount, setProposedAmount] = useState<string>(
    String(activeTarget?.dailyRate || 180)
  );
  const [serviceDate, setServiceDate] = useState('Sexta-feira · 08h às 16h');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'platform'>('pix');
  const [sending, setSending] = useState(false);

  const handleSelectTarget = (key: string, defaultRate: number) => {
    setSelectedKey(key);
    setProposedAmount(String(defaultRate));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTarget) return;

    const amountNum = showProposalBox ? Number(proposedAmount) : undefined;
    const resolvedText =
      draftText.trim() ||
      (showProposalBox && amountNum
        ? `Proposta de atendimento enviada: R$ ${amountNum.toFixed(2)} (${
            paymentMethod === 'pix' ? 'Pix Direto' : 'Plataforma Verilar'
          }) para ${serviceDate}.`
        : '');

    if (!resolvedText) return;

    setSending(true);
    try {
      await onSendMessage({
        freelancerId: activeTarget.freelancerId,
        employerId: activeTarget.employerId,
        content: resolvedText,
        proposedAmount: amountNum && amountNum > 0 ? amountNum : undefined,
        paymentMethod: amountNum && amountNum > 0 ? paymentMethod : undefined,
        serviceDate: amountNum && amountNum > 0 ? serviceDate : undefined,
      });
      setDraftText('');
      setShowProposalBox(false);
    } finally {
      setSending(false);
    }
  };

  const handleCopyPixKey = (pixKey: string) => {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(pixKey);
      showToast(`Chave Pix copiada: ${pixKey}`, 'info');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 font-sans space-y-5">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              0% de comissão sobre o serviço
            </span>
            <span>·</span>
            <span>Combine valores livremente e pague pela plataforma ou por Pix</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Chat Direto & Pagamento Seguro
          </h1>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5">
          <span className="font-semibold text-slate-900 dark:text-white block">
            Sem taxas escondidas
          </span>
          <span>100% do valor combinado vai direto para a profissional</span>
        </div>
      </div>

      {/* Main Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Sidebar: Contacts */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-brand dark:text-sky-400" />
              {isEmployer ? 'Profissionais Verificadas' : 'Conversas com Famílias'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              {conversationTargets.length} contato(s)
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[520px] overflow-y-auto">
            {conversationTargets.map((item) => {
              const isSelected = activeTarget?.key === item.key;
              const lastMsg = messages
                .filter(
                  (m) =>
                    m.freelancerId === item.freelancerId &&
                    m.employerId === item.employerId
                )
                .slice(-1)[0];

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSelectTarget(item.key, item.dailyRate)}
                  className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-sky-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(item.displayName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.displayName}
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate tabular-nums">
                      {item.subtitle}
                    </p>
                    {lastMsg && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                        {lastMsg.content}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Active Thread */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col min-h-[540px] transition-colors">
          {activeTarget ? (
            <>
              {/* Thread Top Header */}
              <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                    {getInitials(activeTarget.displayName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        {activeTarget.displayName}
                      </h2>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">
                      {activeTarget.subtitle} · Chave Pix: {activeTarget.pixKey}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyPixKey(activeTarget.pixKey)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Pix
                  </button>
                  {isEmployer && (
                    <button
                      type="button"
                      onClick={() => onOpenProfile(activeTarget.freelancerId)}
                      className="px-3 py-1.5 text-xs font-semibold text-brand dark:text-sky-400 bg-blue-50 dark:bg-sky-950/50 border border-blue-200 dark:border-sky-800 rounded-lg hover:bg-blue-100 dark:hover:bg-sky-900/60 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Ver Selos & Avaliações
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[380px] bg-slate-50/60 dark:bg-slate-950/50">
                {threadMessages.length === 0 ? (
                  <div className="text-center py-12 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Inicie a conversa com {activeTarget.displayName}
                    </p>
                    <p>
                      Combine horário, tarefas da residência e escolha pagar por Pix ou pela plataforma Verilar.
                    </p>
                  </div>
                ) : (
                  threadMessages.map((msg) => {
                    const isMine = msg.senderRole === currentUser.role;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isMine ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-lg rounded-xl p-3.5 text-xs space-y-2.5 border ${
                            isMine
                              ? 'bg-brand text-white border-brand'
                              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 text-[11px] opacity-85">
                            <span className="font-semibold">{msg.senderName}</span>
                            <span>{msg.createdAt}</span>
                          </div>

                          <p className="leading-relaxed">{msg.content}</p>

                          {msg.proposedAmount && (
                            <div
                              className={`p-3 rounded-lg border text-xs space-y-2 tabular-nums ${
                                isMine
                                  ? 'bg-white/10 border-white/20 text-white'
                                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-bold flex items-center gap-1.5">
                                  {msg.paymentMethod === 'pix' ? (
                                    <QrCode className="w-4 h-4" />
                                  ) : (
                                    <CreditCard className="w-4 h-4" />
                                  )}
                                  {msg.paymentMethod === 'pix'
                                    ? 'Combinado via Pix Direto'
                                    : 'Pagamento pela Plataforma Verilar'}
                                </span>
                                <span className="text-sm font-bold">
                                  R$ {msg.proposedAmount.toFixed(2)}
                                </span>
                              </div>

                              {msg.serviceDate && (
                                <div className="text-[11px] opacity-90 flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{msg.serviceDate} · 0% de comissão descontada</span>
                                </div>
                              )}

                              {msg.paymentStatus === 'paid' ? (
                                <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 dark:text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Pagamento Confirmado · Serviço Registrado
                                  </span>
                                  {isEmployer && (
                                    <button
                                      type="button"
                                      onClick={() => onOpenProfile(msg.freelancerId)}
                                      className="text-[11px] font-bold underline inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Star className="w-3 h-3" />
                                      Avaliar 1 a 5 estrelas
                                    </button>
                                  )}
                                </div>
                              ) : isEmployer ? (
                                <button
                                  type="button"
                                  onClick={() => void onConfirmPayment(msg.id)}
                                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Confirmar Pagamento de R$ {msg.proposedAmount.toFixed(2)} (
                                  {msg.paymentMethod === 'pix' ? 'Pix' : 'Plataforma'})
                                </button>
                              ) : (
                                <span className="block text-[11px] opacity-85">
                                  Aguardando confirmação da família
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Composer & Payment Proposal */}
              <form
                onSubmit={(e) => void handleSend(e)}
                className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 rounded-b-xl"
              >
                {showProposalBox && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Combinar Valor e Pagamento (0% comissão)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowProposalBox(false)}
                        className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold cursor-pointer"
                      >
                        Fechar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label
                          htmlFor="chat-amount"
                          className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Valor da Diária / Serviço (R$)
                        </label>
                        <input
                          id="chat-amount"
                          type="number"
                          min={50}
                          step={5}
                          value={proposedAmount}
                          onChange={(e) => setProposedAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 tabular-nums"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="chat-date"
                          className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Dia e Horário Combinados
                        </label>
                        <input
                          id="chat-date"
                          type="text"
                          value={serviceDate}
                          onChange={(e) => setServiceDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="chat-method"
                          className="block font-semibold text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Forma de Pagamento
                        </label>
                        <select
                          id="chat-method"
                          value={paymentMethod}
                          onChange={(e) =>
                            setPaymentMethod(e.target.value as 'pix' | 'platform')
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                        >
                          <option value="pix">Pix Direto (0% taxa)</option>
                          <option value="platform">Pela Plataforma Verilar (0% taxa)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProposalBox((prev) => !prev)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                      showProposalBox
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    Combinar Valor / Pix
                  </button>

                  <input
                    type="text"
                    placeholder="Escreva uma mensagem para combinar horários, tarefas ou pagamento..."
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand"
                  />

                  <button
                    type="submit"
                    disabled={sending}
                    className="px-4 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar
                  </button>
                </div>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
