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
  EyeOff,
  Briefcase,
  ArrowLeft,
} from 'lucide-react';

interface FreelancerViewProps {
  profile: FreelancerProfile;
  contracts: Contract[];
  publicReviews: PublicReview[];
  secretEvaluations: SecretEvaluation[];
  onOpenContract: (contract: Contract) => void;
  onUpdateAvailability: (profileId: string, status: AvailabilityStatus) => void;
  onAddSecretEvaluation: (evaluation: SecretEvaluation) => Promise<void> | void;
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
  currentUser,
  onBackToCatalog,
  onNavigateToJobs,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<VerificationBadge | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [showReviewSimulator, setShowReviewSimulator] = useState(false);

  const initials = useMemo(() => getInitials(profile.fullName), [profile.fullName]);
  const verifiedBadgesCount = useMemo(
    () => profile.badges.filter((b) => b.status === 'verified').length,
    [profile.badges]
  );

  // Filtrar estritamente pelo ID do profissional visualizado (Checklist 2.1)
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

  // Médias calculadas dinamicamente dos dados reais do perfil (Checklist 2.3)
  const secretAggregates = useMemo(() => {
    if (profileSecretEvaluations.length === 0) {
      return {
        overall: null as string | null,
        honesty: '—',
        punctuality: '—',
        discretion: '—',
        maxHonestyCount: 0,
        rehireRate: 100,
      };
    }

    const total = profileSecretEvaluations.length;
    const sumHonesty = profileSecretEvaluations.reduce((acc, s) => acc + s.honestyScore, 0);
    const sumPunctuality = profileSecretEvaluations.reduce((acc, s) => acc + s.punctualityScore, 0);
    const sumDiscretion = profileSecretEvaluations.reduce(
      (acc, s) => acc + s.discretionConfidentialityScore,
      0
    );

    const avgHonesty = sumHonesty / total;
    const avgPunctuality = sumPunctuality / total;
    const avgDiscretion = sumDiscretion / total;
    const avgOverall = (avgHonesty + avgPunctuality + avgDiscretion) / 3;
    const maxHonestyCount = profileSecretEvaluations.filter((s) => s.honestyScore >= 9.9).length;
    const rehireCount = profileSecretEvaluations.filter((s) => s.wouldRehirePrivately).length;

    return {
      overall: avgOverall.toFixed(1),
      honesty: avgHonesty.toFixed(1),
      punctuality: avgPunctuality.toFixed(1),
      discretion: avgDiscretion.toFixed(1),
      maxHonestyCount,
      rehireRate: Math.round((rehireCount / total) * 100),
    };
  }, [profileSecretEvaluations]);

  const isOwnFreelancerProfile =
    currentUser?.role === 'freelancer' &&
    (currentUser.freelancerProfileId === profile.id || currentUser.id === profile.userId);

  const canViewSecretReports = currentUser?.role === 'employer';

  const statusBadgeMap: Record<Contract['status'], { label: string; classes: string }> = {
    completed: {
      label: 'CONCLUÍDO',
      classes: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    active: {
      label: 'EM VIGÊNCIA',
      classes: 'bg-blue-50 dark:bg-sky-950/60 text-blue-800 dark:text-sky-300 border-blue-200 dark:border-sky-800',
    },
    pending_signature: {
      label: 'AGUARDANDO ASSINATURA',
      classes: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    draft: {
      label: 'RASCUNHO',
      classes: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    },
    cancelled: {
      label: 'CANCELADO',
      classes: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
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
            Voltar ao Catálogo de Cuidadores
          </button>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Visualizando dossiê de <strong className="text-slate-900 dark:text-white">{profile.fullName}</strong>
          </span>
        </div>
      )}

      {/* 1. Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors">
        <div className="h-16 sm:h-20 bg-slate-800 dark:bg-slate-950 border-b border-transparent dark:border-slate-800 px-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide">
              PERFIL AUDITADO · DOCUMENTAÇÃO E BIOMETRIA VERIFICADAS
            </span>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700 hidden sm:inline tabular-nums">
            {verifiedBadgesCount} Selo(s) Auditado(s)
          </span>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            {/* Avatar & Dados Básicos */}
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-bold text-2xl flex items-center justify-center font-mono border-2 border-slate-200 dark:border-slate-700 shadow-xs">
                  {initials}
                </div>
                <div
                  className="absolute bottom-0 right-0 p-1 bg-emerald-600 text-white rounded-full border-2 border-white dark:border-slate-900"
                  title="Identidade Biométrica Auditada"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    {profile.fullName}
                  </h1>
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                    Selo Blindado
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{profile.title}</p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-0.5 tabular-nums">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    {profile.neighborhood}, {profile.city}
                  </span>
                  <span>·</span>
                  <span>{profile.experienceYears} anos de experiência</span>
                  <span>·</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    {profile.completedContractsCount} atendimentos concluídos
                  </span>
                </div>
              </div>
            </div>

            {/* Controle de Status de Plantão */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5 shrink-0">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                {isOwnFreelancerProfile
                  ? 'Sua Disponibilidade para Atendimento:'
                  : 'Disponibilidade Atual do Profissional:'}
              </span>
              {isOwnFreelancerProfile ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateAvailability(profile.id, 'online')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      profile.availability === 'online'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Disponível (Online)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateAvailability(profile.id, 'urgency')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                      profile.availability === 'urgency'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    Plantão de Urgência
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateAvailability(profile.id, 'offline')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      profile.availability === 'offline'
                        ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Pausa (Offline)
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-0.5 tabular-nums">
                  {profile.availability === 'urgency' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <Radio className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      Plantão de Urgência Ativo (Raio {profile.urgencyRadiusKm}km)
                    </span>
                  )}
                  {profile.availability === 'online' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      Disponível para Propostas
                    </span>
                  )}
                  {profile.availability === 'offline' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Em Pausa (Offline)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Resumo Profissional */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <p className={`text-xs text-slate-700 dark:text-slate-300 leading-relaxed ${isBioExpanded ? '' : 'line-clamp-2'}`}>
              {profile.bio}
            </p>
            <button
              type="button"
              onClick={() => setIsBioExpanded((prev) => !prev)}
              className="text-xs font-semibold text-brand dark:text-sky-400 hover:underline mt-1 inline-flex items-center gap-0.5 cursor-pointer"
            >
              {isBioExpanded ? 'Recolher resumo' : '... ver descrição completa'}
            </button>
          </div>

          {currentUser?.role === 'freelancer' && onNavigateToJobs && (
            <div className="p-3.5 bg-blue-50/70 dark:bg-sky-950/50 border border-blue-200 dark:border-sky-800/70 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Briefcase className="w-4 h-4 text-brand dark:text-sky-400 shrink-0" />
                <span>
                  <strong className="text-slate-900 dark:text-white">Vagas Recomendadas para Você:</strong> Há oportunidades em aberto que aceitam candidatura direta com seus selos verificados.
                </span>
              </div>
              <button
                type="button"
                onClick={onNavigateToJobs}
                className="px-3.5 py-1.5 font-bold text-white bg-brand hover:bg-brand-hover rounded-lg text-xs whitespace-nowrap self-start sm:self-auto flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                Buscar Vagas (Estilo LinkedIn) →
              </button>
            </div>
          )}

          {/* Indicadores Resumidos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs tabular-nums">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 block text-[11px]">Nota Geral do Serviço</span>
              <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{profile.publicRating}</span>
                <span className="text-slate-500 dark:text-slate-400 font-normal">
                  ({profilePublicReviews.length || profile.publicReviewCount} aval.)
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 block text-[11px]">Rede Sigilosa (Privada)</span>
              <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white mt-0.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {canViewSecretReports ? (
                  <span>
                    {secretAggregates.overall ? `${secretAggregates.overall} / 10` : 'Sem registros'}
                  </span>
                ) : (
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Restrito a Contratantes</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 block text-[11px]">Valor da Diária / Hora</span>
              <div className="font-medium text-slate-800 dark:text-white mt-0.5">
                R$ {profile.dailyRate}{' '}
                <span className="text-slate-500 dark:text-slate-400 font-normal">(R$ {profile.hourlyRate}/h)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 block text-[11px]">Radar de Substituição</span>
              <div className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5" /> Raio até {profile.urgencyRadiusKm} km
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid com Selos de Verificação e Endossos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Selos e Certidões Oficiais
              </h2>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded font-semibold tabular-nums">
                {verifiedBadgesCount} Verificados
              </span>
            </div>

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
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 pl-5">{badge.issuer}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3 transition-colors">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Award className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              Cursos e Habilitações
            </h2>
            <div className="space-y-2 text-xs">
              {profile.certifications.map((c) => (
                <div key={c.id} className="p-2 border border-slate-100 dark:border-slate-800 rounded-md">
                  <span className="font-semibold text-slate-900 dark:text-white block">{c.title}</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">
                    {c.institution} · {c.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Endossos e Contratos deste profissional */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3 transition-colors">
            <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-brand dark:text-sky-400" />
                Habilidades Validadas em Contratos Anteriores
              </h2>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Só podem ser validadas por contratantes com quem {profile.fullName} efetivamente trabalhou.
              </p>
            </div>

            <div className="space-y-2.5">
              {profile.skills.map((skill) => {
                const isOpen = expandedSkillId === skill.id;
                return (
                  <div key={skill.id} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setExpandedSkillId(isOpen ? null : skill.id)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/80 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">{skill.skill}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded tabular-nums">
                          {skill.verifiedCount} validações
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-3 bg-white dark:bg-slate-900 space-y-2 border-t border-slate-200 dark:border-slate-800">
                        {skill.validations.map((v, i) => (
                          <div
                            key={i}
                            className="text-[11px] text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1.5 last:border-0 last:pb-0"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{v.employerName}</span>
                            <span className="text-slate-500 dark:text-slate-400"> ({v.employerRole})</span>
                            <p className="text-slate-600 dark:text-slate-400 italic mt-0.5">
                              "{v.contractTitle}" · Contrato: {v.verifiedContractId}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contratos Formais filtrados por profile.id */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3 transition-colors">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800 tabular-nums">
              <FileCheck2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              Contratos Registrados de {profile.fullName} ({profileContracts.length})
            </h2>

            {profileContracts.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-400 py-3">
                Nenhum contrato formal registrado para este perfil na sessão atual.
              </p>
            ) : (
              <div className="space-y-2">
                {profileContracts.map((c) => {
                  const badgeInfo = statusBadgeMap[c.status];
                  const unitLabel =
                    c.rateType === 'monthly' ? 'mês' : c.rateType === 'hourly' ? 'hora' : 'dia';
                  return (
                    <div
                      key={c.id}
                      className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs tabular-nums"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">{c.jobTitle}</span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badgeInfo.classes}`}
                          >
                            {badgeInfo.label}
                          </span>
                        </div>
                        <span className="text-slate-600 dark:text-slate-400 text-[11px] block mt-0.5">
                          Contratante: {c.employerName} · R$ {c.agreedRate}/{unitLabel} · Início:{' '}
                          {c.startDate}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenContract(c)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors shrink-0 cursor-pointer"
                      >
                        Abrir Minuta Digital
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. SISTEMA DE AVALIAÇÃO DUPLA E SIGILOSA (Oculto para profissionais - Checklist 2.2) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase text-slate-600 dark:text-slate-400 font-semibold">
                SISTEMA DE EQUIDADE E IMPARCIALIDADE
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                Exclusivo Contratantes Verificados
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Avaliações de Confiança & Relatórios Comportamentais
            </h2>
          </div>

          {canViewSecretReports && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReviewSimulator((prev) => !prev)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {showReviewSimulator ? 'Fechar Formulário' : `Avaliar ${profile.fullName.split(' ')[0]}`}
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900 dark:bg-slate-950 text-slate-200 text-xs border-b border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-emerald-400 font-mono">
            <EyeOff className="w-4 h-4" />
            REGRA DE IGUALDADE: TODOS OS COMENTÁRIOS SÃO PRIVADOS E RESTRITOS A CONTRATANTES
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Para evitar favoritismos, retaliações ou pressões sociais,{' '}
            <strong className="text-white">nenhum relato comportamental fica visível para profissionais ou público geral</strong>. Os relatórios
            abaixo são acessíveis exclusivamente por contratantes verificados na plataforma.
          </p>
        </div>

        {canViewSecretReports ? (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs tabular-nums">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block">Honestidade e Zelo</span>
                <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {secretAggregates.honesty} / 10
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5">
                  {secretAggregates.maxHonestyCount} de {profileSecretEvaluations.length} deram nota máxima
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block">Pontualidade nos Plantões</span>
                <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {secretAggregates.punctuality} / 10
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5">
                  Média auditada em contratos concluídos
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block">Discrição na Residência</span>
                <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {secretAggregates.discretion} / 10
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5">
                  Taxa de recontratação privada: {secretAggregates.rehireRate}%
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block font-mono tabular-nums">
                Relatórios Comportamentais Confidenciais ({profileSecretEvaluations.length})
              </span>

              {profileSecretEvaluations.length === 0 ? (
                <p className="text-xs text-slate-600 dark:text-slate-400 py-2">
                  Ainda não há relatórios confidenciais registrados para {profile.fullName}.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {profileSecretEvaluations.map((sec) => (
                    <div
                      key={sec.id}
                      className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          Família Contratante (Identidade Protegida) · {sec.relationshipDuration}
                        </span>
                        <span className="font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          Vínculo Contratual Auditado: {sec.contractId}
                        </span>
                      </div>

                      <p className="text-slate-700 dark:text-slate-200 italic bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800 leading-relaxed">
                        "{sec.privateNotes}"
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 font-mono tabular-nums">
                        <span>
                          Honestidade: <strong className="text-slate-900 dark:text-white">{sec.honestyScore}/10</strong>
                        </span>
                        <span>·</span>
                        <span>
                          Pontualidade: <strong className="text-slate-900 dark:text-white">{sec.punctualityScore}/10</strong>
                        </span>
                        <span>·</span>
                        <span>
                          Discrição:{' '}
                          <strong className="text-slate-900 dark:text-white">
                            {sec.discretionConfidentialityScore}/10
                          </strong>
                        </span>
                        <span>·</span>
                        <span>
                          Recontrataria:{' '}
                          <strong
                            className={
                              sec.wouldRehirePrivately
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-rose-700 dark:text-rose-400'
                            }
                          >
                            {sec.wouldRehirePrivately ? 'Sim' : 'Não'}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
            <Lock className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">
                Visualização Confidencial Protegida (Acesso Exclusivo para Contratantes Verificados)
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed tabular-nums">
                Conforme as regras de sigilo da TrustLink, relatos comportamentais internos não são exibidos na visão de profissional.
                Sua nota pública agregada atual é <strong className="text-slate-900 dark:text-white">{profile.publicRating} / 5.0</strong> com{' '}
                <strong className="text-slate-900 dark:text-white">{profile.completedContractsCount} contratos concluídos</strong>.
              </p>
            </div>
          </div>
        )}

        {showReviewSimulator && canViewSecretReports && (
          <ConfidentialEvaluationForm
            profile={profile}
            contracts={contracts}
            currentUser={currentUser}
            onAddSecretEvaluation={onAddSecretEvaluation}
          />
        )}
      </div>

      <BadgeAuditModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
    </div>
  );
};
