import React, { useMemo, useState } from 'react';
import {
  FreelancerProfile,
  PublicReview,
  SecretEvaluation,
  Contract,
  AvailabilityStatus,
  VerificationBadge,
  AuthUser,
} from '../../types';
import { getInitials } from '../../services/trustlinkService';
import { BadgeAuditModal } from './BadgeAuditModal';
import { ConfidentialEvaluationForm } from './ConfidentialEvaluationForm';
import { useToast } from '../common/ToastContext';
import {
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  CheckCircle2,
  Lock,
  FileCheck2,
  Radio,
  Award,
  UserCheck,
  Send,
  ChevronDown,
  ChevronUp,
  Briefcase,
  ArrowLeft,
  MessageSquare,
  Crown,
  BarChart3,
  EyeOff,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface VerifyPayload {
  documentType: string;
  selfieConfirmed: boolean;
  pfCertificateNumber: string;
  pfValidationCode: string;
  courseTitle?: string;
  courseInstitution?: string;
}

interface FreelancerViewProps {
  profile: FreelancerProfile;
  contracts: Contract[];
  publicReviews: PublicReview[];
  secretEvaluations: SecretEvaluation[];
  onOpenContract: (contract: Contract) => void;
  onUpdateAvailability: (profileId: string, status: AvailabilityStatus) => void;
  onAddSecretEvaluation: (evaluation: SecretEvaluation) => Promise<void> | void;
  onVerifyProfile?: (profileId: string, payload: VerifyPayload) => Promise<void>;
  onAddPublicReview?: (payload: {
    freelancerId: string;
    rating: number;
    comment: string;
    employerType?: string;
  }) => Promise<void>;
  onOpenChatWithProfile?: (profileId: string) => void;
  onNavigateToPlans?: () => void;
  currentUser?: AuthUser | null;
  onBackToCatalog?: () => void;
  onNavigateToJobs?: () => void;
}

export const FreelancerView: React.FC<FreelancerViewProps> = ({
  profile,
  contracts,
  publicReviews,
  secretEvaluations,
  onOpenContract,
  onUpdateAvailability,
  onAddSecretEvaluation,
  onVerifyProfile,
  onAddPublicReview,
  onOpenChatWithProfile,
  onNavigateToPlans,
  currentUser,
  onBackToCatalog,
  onNavigateToJobs,
}) => {
  const { showToast } = useToast();
  const [selectedBadge, setSelectedBadge] = useState<VerificationBadge | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [showReviewSimulator, setShowReviewSimulator] = useState(false);

  // Simulador de Verificação Gratuita em Camadas (Slide 5 & Slide 11)
  const [showVerifyForm, setShowVerifyForm] = useState(!profile.isVerified);
  const [docType, setDocType] = useState('RG Oficial com Foto + CPF');
  const [selfieConfirmed, setSelfieConfirmed] = useState(true);
  const [pfNumber, setPfNumber] = useState('2026.08491234-PF');
  const [pfCode, setPfCode] = useState('9482-7710-3321-8804');
  const [courseTitle, setCourseTitle] = useState(
    profile.category === 'Babá'
      ? 'Curso de Babá Profissional e Primeiros Socorros Infantis'
      : profile.category === 'Cuidadora'
      ? 'Formação de Cuidadora de Idosos e Mobilidade Segura'
      : ''
  );
  const [courseInstitution, setCourseInstitution] = useState('Cruz Vermelha / Senac SP');
  const [submittingVerify, setSubmittingVerify] = useState(false);

  // Formulário de Avaliação Pública 1 a 5 Estrelas com Comentário (Slide 4)
  const [showPublicReviewForm, setShowPublicReviewForm] = useState(false);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingPublicReview, setSubmittingPublicReview] = useState(false);

  const initials = useMemo(() => getInitials(profile.fullName), [profile.fullName]);
  const verifiedBadgesCount = useMemo(
    () => profile.badges.filter((b) => b.status === 'verified').length,
    [profile.badges]
  );

  const profileContracts = useMemo(
    () => contracts.filter((c) => c.freelancerId === profile.id),
    [contracts, profile.id]
  );

  const profilePublicReviews = useMemo(
    () => publicReviews.filter((r) => r.freelancerId === profile.id),
    [publicReviews, profile.id]
  );

  const profileSecretEvaluations = useMemo(
    () => secretEvaluations.filter((s) => s.freelancerId === profile.id),
    [secretEvaluations, profile.id]
  );

  const isOwnFreelancerProfile =
    currentUser?.role === 'freelancer' &&
    (currentUser.freelancerProfileId === profile.id || currentUser.id === profile.userId);

  const canViewSecretReports = currentUser?.role === 'employer';
  const requiresCourseLayer =
    profile.category === 'Babá' || profile.category === 'Cuidadora';

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onVerifyProfile) return;
    setSubmittingVerify(true);
    try {
      await onVerifyProfile(profile.id, {
        documentType: docType,
        selfieConfirmed,
        pfCertificateNumber: pfNumber,
        pfValidationCode: pfCode,
        courseTitle: requiresCourseLayer ? courseTitle : undefined,
        courseInstitution: requiresCourseLayer ? courseInstitution : undefined,
      });
      setShowVerifyForm(false);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao validar camadas na Polícia Federal.',
        'error'
      );
    } finally {
      setSubmittingVerify(false);
    }
  };

  const handleSubmitPublicReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddPublicReview) return;
    if (commentInput.trim().length < 8) {
      showToast('Escreva um comentário curto sobre o atendimento (mín. 8 caracteres).', 'error');
      return;
    }
    setSubmittingPublicReview(true);
    try {
      await onAddPublicReview({
        freelancerId: profile.id,
        rating: ratingInput,
        comment: commentInput.trim(),
      });
      setCommentInput('');
      setShowPublicReviewForm(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao registrar avaliação.', 'error');
    } finally {
      setSubmittingPublicReview(false);
    }
  };

  const statusBadgeMap: Record<Contract['status'], { label: string; classes: string }> = {
    completed: {
      label: 'CONCLUÍDO',
      classes:
        'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    active: {
      label: 'EM VIGÊNCIA',
      classes:
        'bg-blue-50 dark:bg-sky-950/60 text-blue-800 dark:text-sky-300 border-blue-200 dark:border-sky-800',
    },
    pending_signature: {
      label: 'AGUARDANDO ASSINATURA',
      classes:
        'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    draft: {
      label: 'RASCUNHO',
      classes:
        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    },
    cancelled: {
      label: 'CANCELADO',
      classes:
        'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6 font-sans">
      {onBackToCatalog && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand dark:text-sky-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para Busca de Profissionais
          </button>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Perfil verificado de <strong className="text-slate-900 dark:text-white">{profile.fullName}</strong>
          </span>
        </div>
      )}

      {/* 1. Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors">
        <div
          className={`h-14 sm:h-16 px-6 flex items-center justify-between text-white ${
            profile.isVerified
              ? 'bg-slate-900 dark:bg-slate-950 border-b border-transparent dark:border-slate-800'
              : 'bg-amber-800 dark:bg-amber-950 border-b border-amber-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {profile.isVerified ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold tracking-wide">
                  PERFIL VERIFICADO VERILAR · VISÍVEL NAS BUSCAS (RENOVAÇÃO PF A CADA 90 DIAS)
                </span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-amber-200 shrink-0" />
                <span className="text-xs font-semibold tracking-wide">
                  PERFIL OCULTO NAS BUSCAS · CONCLUA A VERIFICAÇÃO GRATUITA ABAIXO PARA APARECER
                </span>
              </>
            )}
          </div>
          <span className="text-xs font-semibold text-emerald-300 bg-slate-950/60 px-2.5 py-1 rounded border border-slate-700 hidden sm:inline tabular-nums">
            {verifiedBadgesCount} Camada(s) Ativa(s)
          </span>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            {/* Avatar & Dados Básicos */}
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-2xl flex items-center justify-center font-mono border-2 border-slate-200 dark:border-slate-700 shadow-xs">
                  {initials}
                </div>
                {profile.isVerified && (
                  <div
                    className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 text-white rounded-full border-2 border-white dark:border-slate-900"
                    title="Identidade + Antecedentes PF Verificados"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    {profile.fullName}
                    {profile.age ? `, ${profile.age}` : ''}
                  </h1>

                  {profile.isVerified ? (
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                      Selo Verilar Gratuito
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded">
                      Aguardando Verificação
                    </span>
                  )}

                  {profile.highlightPlan !== 'free' && (
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-dashed border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded">
                      {profile.highlightPlan === 'destaque_pro'
                        ? 'Plano Destaque Pro'
                        : 'Em destaque'}
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {profile.category} · {profile.title}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-0.5 tabular-nums">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    {profile.neighborhood}, {profile.city}
                  </span>
                  <span>·</span>
                  <span>{profile.experienceYears} anos de experiência</span>
                  <span>·</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    {profile.completedContractsCount} diárias / serviços no histórico
                  </span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas (Chat/Pix para Família ou Disponibilidade para Prestadora) */}
            <div className="space-y-2 shrink-0">
              {currentUser?.role === 'employer' && onOpenChatWithProfile && (
                <button
                  type="button"
                  onClick={() => onOpenChatWithProfile(profile.id)}
                  className="w-full px-4 py-2.5 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <MessageSquare className="w-4 h-4" />
                  Combinar Valor & Pagar (Chat / Pix)
                </button>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                  {isOwnFreelancerProfile
                    ? 'Sua Disponibilidade na Busca:'
                    : 'Disponibilidade Atual:'}
                </span>
                {isOwnFreelancerProfile ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateAvailability(profile.id, 'online')}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        profile.availability === 'online'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Disponível
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateAvailability(profile.id, 'urgency')}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                        profile.availability === 'urgency'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      Urgência
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateAvailability(profile.id, 'offline')}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        profile.availability === 'offline'
                          ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Pausa
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-0.5 tabular-nums">
                    {profile.availability === 'urgency' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <Radio className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        Disponível Hoje (Raio {profile.urgencyRadiusKm} km)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        Agenda Aberta
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumo Profissional */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <p
              className={`text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed ${
                isBioExpanded ? '' : 'line-clamp-2'
              }`}
            >
              {profile.bio}
            </p>
            <button
              type="button"
              onClick={() => setIsBioExpanded((prev) => !prev)}
              className="text-xs font-semibold text-brand dark:text-sky-400 hover:underline mt-1 inline-flex items-center gap-0.5 cursor-pointer"
            >
              {isBioExpanded ? 'Recolher apresentação' : 'Ver apresentação completa'}
            </button>
          </div>

          {/* Indicadores Resumidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs tabular-nums">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 block text-[11px]">
                Avaliações Públicas (1 a 5★)
              </span>
              <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{profile.publicRating || 'Novo'}</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">
                  ({profilePublicReviews.length || profile.publicReviewCount} aval.)
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 block text-[11px]">
                Valor Base da Diária
              </span>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                R$ {profile.dailyRate}{' '}
                <span className="text-slate-500 dark:text-slate-400 font-normal">
                  (0% comissão)
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 block text-[11px]">
                Recebimento Aceito
              </span>
              <div className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                Plataforma ou Pix Direto
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 block text-[11px]">
                Validade Antecedentes PF
              </span>
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Renovado a cada 90 dias
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Simulador de Verificação Gratuita em Camadas (Slide 5 & Slide 11 — Visível para a própria prestadora) */}
      {isOwnFreelancerProfile && onVerifyProfile && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Central de Verificação Gratuita Verilar (Ciclo de 90 Dias + LGPD)
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {profile.isVerified
                  ? 'Seus selos estão ativos! Você pode simular a renovação trimestral da PF quando quiser.'
                  : 'Envie sua verificação gratuita agora para liberar seu perfil nas buscas das famílias'}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowVerifyForm((prev) => !prev)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {showVerifyForm
                ? 'Fechar Validador'
                : profile.isVerified
                ? 'Simular Renovação (90 dias)'
                : 'Iniciar Verificação Gratuita'}
            </button>
          </div>

          {!profile.isVerified && (
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Seu perfil ainda não aparece nas buscas:</strong> Na Verilar, toda doméstica/diarista, babá ou cuidadora passa pela checagem gratuita antes de ficar visível para as famílias.
              </span>
            </div>
          )}

          {showVerifyForm && (
            <form
              onSubmit={(e) => void handleSubmitVerification(e)}
              className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-bold text-slate-900 dark:text-white block">
                    Camada 1 · Documento Oficial com Foto + Selfie
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="RG Oficial com Foto + CPF">RG Oficial com Foto + CPF</option>
                    <option value="CNH Digital com QR Code">CNH Digital com QR Code</option>
                    <option value="CIN (Carteira de Identidade Nacional)">
                      CIN (Carteira de Identidade Nacional)
                    </option>
                  </select>
                  <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selfieConfirmed}
                      onChange={(e) => setSelfieConfirmed(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-700"
                    />
                    <span>Selfie ao vivo conferida com a foto do documento</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-900 dark:text-white block">
                    Camada 2 · Certidão Antecedentes Polícia Federal (gov.br · 90 dias)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Nº da Certidão PF"
                      value={pfNumber}
                      onChange={(e) => setPfNumber(e.target.value)}
                      className="p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 font-mono"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Código de Validação PF"
                      value={pfCode}
                      onChange={(e) => setPfCode(e.target.value)}
                      className="p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Conferência gratuita no portal da PF. Gera validade automática de 90 dias.
                  </p>
                </div>
              </div>

              {requiresCourseLayer && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-900 dark:text-white block mb-1">
                      Camada 3 · Certificado do Curso ({profile.category})
                    </label>
                    <input
                      type="text"
                      required
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="Nome do curso de formação"
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-900 dark:text-white block mb-1">
                      Instituição Emissora (Conferida pela Moderação)
                    </label>
                    <input
                      type="text"
                      required
                      value={courseInstitution}
                      onChange={(e) => setCourseInstitution(e.target.value)}
                      placeholder="Ex: Senac, Cruz Vermelha, COREN"
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 dark:text-white">Conformidade LGPD:</strong> A Verilar guarda apenas o resultado da verificação, o protocolo e o prazo de 90 dias — nunca armazenamos cópias dos documentos enviados.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submittingVerify}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold rounded-lg shrink-0 cursor-pointer whitespace-nowrap"
                >
                  {submittingVerify
                    ? 'Validando na PF...'
                    : 'Confirmar & Emitir Selos (90 dias)'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 3. Estatísticas do Perfil (Slide 8 — Recurso do Plano Verilar Destaque Pro) */}
      {isOwnFreelancerProfile && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Estatísticas de Alcance do Seu Perfil (Últimos 30 dias)
              </h2>
            </div>

            {onNavigateToPlans && (
              <button
                type="button"
                onClick={onNavigateToPlans}
                className="text-xs font-semibold text-brand dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                {profile.highlightPlan === 'destaque_pro'
                  ? 'Gerenciar Plano Destaque Pro'
                  : 'Desbloquear no Destaque Pro (R$ 19,90/mês) →'}
              </button>
            )}
          </div>

          {profile.highlightPlan === 'destaque_pro' && profile.profileStats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Aparições nas Buscas
                </span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {profile.profileStats.searchAppearances}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Visitas ao Perfil
                </span>
                <span className="text-lg font-extrabold text-brand dark:text-blue-400">
                  {profile.profileStats.profileViews}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Conversas no Chat / Pix
                </span>
                <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                  {profile.profileStats.chatRequests}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Taxa de Contato
                </span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {profile.profileStats.profileViews > 0
                    ? Math.round(
                        (profile.profileStats.chatRequests /
                          profile.profileStats.profileViews) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Seu perfil continua <strong>100% gratuito e verificado nas buscas</strong>. Com o plano opcional <strong>Verilar Destaque Pro (R$ 19,90/mês)</strong>, você acompanha aparições, cliques no chat e aparece em “Profissionais em Alta”.
              </p>
              {onNavigateToPlans && (
                <button
                  type="button"
                  onClick={onNavigateToPlans}
                  className="px-3.5 py-2 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg shrink-0 cursor-pointer whitespace-nowrap"
                >
                  Ver Planos Opcionais
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Selos por Camada + Avaliações de 1 a 5 Estrelas com Comentários e Histórico (Slides 4 & 5) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Selos por Camada
              </h2>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-semibold tabular-nums">
                {verifiedBadgesCount} Checados
              </span>
            </div>

            {profile.badges.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                Nenhum selo emitido ainda. Envie a verificação gratuita acima.
              </p>
            ) : (
              <div className="space-y-2">
                {profile.badges.map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => setSelectedBadge(badge)}
                    className="w-full text-left p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer transition-colors text-xs focus:outline-2 focus:outline-brand"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                      <span className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        {badge.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 pl-5 tabular-nums">
                      {badge.issuer} · Validade até {badge.expiresAt}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>LGPD:</strong> A família vê exatamente o que foi checado; a Verilar guarda só o resultado, nunca o documento.
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3 transition-colors">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Award className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              Formação e Cursos
            </h2>
            {profile.certifications.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formação prática comprovada em histórico residencial.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {profile.certifications.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 border border-slate-100 dark:border-slate-800 rounded-md"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {c.title}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">
                      {c.institution} · {c.year}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna Principal: Avaliações 1-5 Estrelas com Comentários + Histórico */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  Avaliações de Famílias (1 a 5 Estrelas) & Histórico ({profilePublicReviews.length})
                </h2>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Comentários reais de clientes que contrataram {profile.fullName.split(' ')[0]} pela Verilar.
                </p>
              </div>

              {currentUser?.role === 'employer' && onAddPublicReview && (
                <button
                  type="button"
                  onClick={() => setShowPublicReviewForm((prev) => !prev)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <Star className="w-3.5 h-3.5" />
                  {showPublicReviewForm ? 'Cancelar Avaliação' : 'Avaliar de 1 a 5 Estrelas'}
                </button>
              )}
            </div>

            {showPublicReviewForm && currentUser?.role === 'employer' && (
              <form
                onSubmit={(e) => void handleSubmitPublicReview(e)}
                className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Sua nota para {profile.fullName}:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        className="p-1 cursor-pointer"
                        aria-label={`${star} estrelas`}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= ratingInput
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={3}
                  required
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Conte como foi a pontualidade, o cuidado e a confiança no atendimento..."
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingPublicReview}
                    className="px-4 py-2 bg-brand hover:bg-brand-hover text-white font-bold rounded-lg cursor-pointer"
                  >
                    {submittingPublicReview ? 'Publicando...' : 'Publicar Avaliação no Perfil'}
                  </button>
                </div>
              </form>
            )}

            {profilePublicReviews.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-400 py-3">
                Ainda não há avaliações registradas para este perfil.
              </p>
            ) : (
              <div className="space-y-3">
                {profilePublicReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {rev.employerName}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                          · {rev.employerType}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5 tabular-nums">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-3.5 h-3.5 ${
                              n <= Math.round(rev.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                        <span className="ml-1 font-bold text-slate-900 dark:text-white">
                          {rev.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                      “{rev.comment}”
                    </p>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>{rev.serviceCategory}</span>
                      <span>{rev.contractPeriod}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Habilidades & Histórico de Contratos */}
          {profile.skills.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3 transition-colors">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <UserCheck className="w-4 h-4 text-brand dark:text-sky-400" />
                Especialidades Comprovadas no Histórico
              </h2>
              <div className="space-y-2">
                {profile.skills.map((skill) => {
                  const isOpen = expandedSkillId === skill.id;
                  return (
                    <div
                      key={skill.id}
                      className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs"
                    >
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setExpandedSkillId(isOpen ? null : skill.id)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/80 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {skill.skill}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-brand dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded tabular-nums">
                            {skill.verifiedCount} famílias
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="p-3 bg-white dark:bg-slate-900 space-y-2 border-t border-slate-200 dark:border-slate-800">
                          {skill.validations.map((v, i) => (
                            <div
                              key={i}
                              className="text-[11px] text-slate-600 dark:text-slate-400"
                            >
                              <strong className="text-slate-800 dark:text-slate-200">
                                {v.employerName}
                              </strong>{' '}
                              ({v.employerRole}) — “{v.contractTitle}”
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Histórico de Serviços / Contratos Registrados */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 tabular-nums">
                <FileCheck2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                Histórico de Serviços Registrados ({profileContracts.length})
              </h2>
              {currentUser?.role === 'freelancer' && onNavigateToJobs && (
                <button
                  type="button"
                  onClick={onNavigateToJobs}
                  className="text-xs font-semibold text-brand dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Ver Vagas Abertas
                </button>
              )}
            </div>

            {profileContracts.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-400 py-2">
                Nenhum atendimento formal registrado ainda neste perfil.
              </p>
            ) : (
              <div className="space-y-2">
                {profileContracts.map((c) => {
                  const badgeInfo = statusBadgeMap[c.status];
                  const unitLabel =
                    c.rateType === 'monthly' ? 'mês' : c.rateType === 'hourly' ? 'hora' : 'diária';
                  return (
                    <div
                      key={c.id}
                      className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs tabular-nums"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {c.jobTitle}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badgeInfo.classes}`}
                          >
                            {badgeInfo.label}
                          </span>
                        </div>
                        <span className="text-slate-600 dark:text-slate-400 text-[11px] block mt-0.5">
                          Cliente: {c.employerName} · R$ {c.agreedRate}/{unitLabel} · Data:{' '}
                          {c.startDate}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenContract(c)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors shrink-0 cursor-pointer"
                      >
                        Ver Comprovante
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Relatos Internos Opcionais para Famílias */}
          {canViewSecretReports && profileSecretEvaluations.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Notas Adicionais de Confiança Residencial ({profileSecretEvaluations.length})
                </span>
                <button
                  type="button"
                  onClick={() => setShowReviewSimulator((prev) => !prev)}
                  className="text-xs font-semibold text-brand dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  {showReviewSimulator ? 'Fechar' : 'Adicionar nota de contrato'}
                </button>
              </div>
              {showReviewSimulator && (
                <ConfidentialEvaluationForm
                  profile={profile}
                  contracts={contracts}
                  currentUser={currentUser}
                  onAddSecretEvaluation={onAddSecretEvaluation}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <BadgeAuditModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
    </div>
  );
};
