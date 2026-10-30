import React, { useState } from 'react';
import {
  AuthUser,
  FreelancerProfile,
  JobAnnouncement,
  JobApplicant,
  PublicReview,
  SecretEvaluation,
} from '../../types';
import { getInitials } from '../../services/trustlinkService';
import { StageBadge } from '../common/StageBadge';
import { CandidateDossierModal } from './CandidateDossierModal';
import { CreateAnnouncementModal } from './CreateAnnouncementModal';
import {
  Users,
  Star,
  MapPin,
  ShieldCheck,
  Plus,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface EmployerViewProps {
  currentUser: AuthUser;
  announcements: JobAnnouncement[];
  profiles: FreelancerProfile[];
  secretEvaluations: SecretEvaluation[];
  publicReviews: PublicReview[];
  onOpenContractModal: (contractId: string) => void;
  onCreateProposalContract: (
    freelancerId: string,
    candidateName: string,
    role: string,
    rate: number,
    jobId?: string,
    jobTitle?: string
  ) => Promise<string>;
  onNavigateToCatalog?: () => void;
  onSelectCandidateProfile?: (candidateId: string) => void;
  onUpdateApplicantStage: (
    announcementId: string,
    applicantId: string,
    stage: JobApplicant['stage'],
    contractId?: string
  ) => void;
  onCreateNewAnnouncement: (newAnn: JobAnnouncement) => void;
}

export const EmployerView: React.FC<EmployerViewProps> = ({
  currentUser,
  announcements,
  profiles,
  secretEvaluations,
  publicReviews,
  onOpenContractModal,
  onCreateProposalContract,
  onNavigateToCatalog,
  onSelectCandidateProfile,
  onUpdateApplicantStage,
  onCreateNewAnnouncement,
}) => {
  const [selectedAnnId, setSelectedAnnId] = useState<string>(
    announcements.length > 0 ? announcements[0].id : ''
  );
  const [selectedStageTab, setSelectedStageTab] = useState<
    'all' | 'triagem' | 'entrevista' | 'proposta' | 'contratado'
  >('all');
  const [activePopupApplicantId, setActivePopupApplicantId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const currentAnnouncement =
    announcements.find((a) => a.id === selectedAnnId) || announcements[0];

  const applicants = currentAnnouncement ? currentAnnouncement.applicants : [];

  const filteredApplicants = applicants.filter((app) => {
    if (selectedStageTab === 'all') return true;
    return app.stage === selectedStageTab;
  });

  const activePopupApplicant =
    applicants.find((a) => a.id === activePopupApplicantId) || null;

  const activeCandidateProfile = activePopupApplicant
    ? profiles.find((p) => p.id === activePopupApplicant.candidateId)
    : undefined;

  const handleStageChange = async (
    applicantId: string,
    newStage: JobApplicant['stage']
  ) => {
    if (!currentAnnouncement) return;
    const applicant = applicants.find((a) => a.id === applicantId);
    if (!applicant) return;

    // Checklist 2.4 & 2.5: Gerar contrato apenas na transição para 'proposta' (se ainda não tiver contractId)
    let linkedContractId = applicant.contractId;
    if (newStage === 'proposta' && !linkedContractId) {
      linkedContractId = await onCreateProposalContract(
        applicant.candidateId,
        applicant.candidateName,
        applicant.candidateRole,
        applicant.salaryExpectation,
        currentAnnouncement.id,
        currentAnnouncement.title
      );
    }

    onUpdateApplicantStage(
      currentAnnouncement.id,
      applicantId,
      newStage,
      linkedContractId
    );
  };

  const handleCreateAnnouncement = (created: JobAnnouncement) => {
    onCreateNewAnnouncement(created);
    setSelectedAnnId(created.id);
    setSelectedStageTab('all');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 font-sans space-y-5">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Área do Contratante · {currentUser.name}
              </span>
              <span>·</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Residência Auditada
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              Gestão de Anúncios & Candidaturas de Cuidadores
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Cada anúncio possui sua aba própria com os profissionais que se candidataram. Clique ou pressione Enter em qualquer candidato para abrir o dossiê detalhado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToCatalog && (
              <button
                type="button"
                onClick={onNavigateToCatalog}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                Catálogo de Cuidadores
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-brand hover:bg-brand-hover text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Publicar Novo Anúncio
            </button>
          </div>
        </div>
      </div>

      {/* Main Announcement Tabs Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden transition-colors">
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 px-4 pt-3 flex items-center gap-2 overflow-x-auto">
          {announcements.map((ann) => {
            const isSelected = currentAnnouncement && currentAnnouncement.id === ann.id;
            return (
              <button
                key={ann.id}
                type="button"
                onClick={() => {
                  setSelectedAnnId(ann.id);
                  setSelectedStageTab('all');
                }}
                className={`group px-4 py-3 text-xs font-bold rounded-t-lg transition-all border-t border-x -mb-px flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 border-b-white dark:border-b-slate-900 z-10 shadow-2xs'
                    : 'bg-slate-100/80 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isSelected ? 'bg-brand dark:bg-sky-400' : 'bg-slate-400 dark:bg-slate-600'}`}
                ></span>
                <span className="max-w-[200px] sm:max-w-xs truncate">{ann.title}</span>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-sky-950 text-brand dark:text-sky-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {ann.applicants.length}
                </span>

                {ann.urgency && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Urgente
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-2.5 text-xs font-semibold text-brand dark:text-sky-400 hover:text-brand-hover hover:bg-blue-50 dark:hover:bg-sky-950/50 rounded-lg flex items-center gap-1 shrink-0 mb-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Anúncio</span>
          </button>
        </div>

        {/* Selected Announcement Info Strip */}
        {currentAnnouncement && (
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase">
                    {currentAnnouncement.contractType === 'mensal_fixo'
                      ? 'Vaga Mensal CLT'
                      : 'Plantão / Diária'}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Publicado {currentAnnouncement.postedAt} · ID: {currentAnnouncement.id}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {currentAnnouncement.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1 tabular-nums">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    {currentAnnouncement.location}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    {currentAnnouncement.workSchedule}
                  </span>
                  <span>·</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {currentAnnouncement.rateDescription}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto tabular-nums">
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-center">
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-semibold block">
                    Total
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{applicants.length}</span>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 rounded-lg px-3 py-1.5 text-center">
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 uppercase font-semibold block">
                    Triagem
                  </span>
                  <span className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    {applicants.filter((a) => a.stage === 'triagem').length}
                  </span>
                </div>
                <div className="bg-blue-50 dark:bg-sky-950/50 border border-blue-200 dark:border-sky-800/70 rounded-lg px-3 py-1.5 text-center">
                  <span className="text-[10px] text-blue-800 dark:text-sky-300 uppercase font-semibold block">
                    Entrevista
                  </span>
                  <span className="text-sm font-bold text-brand dark:text-sky-300">
                    {applicants.filter((a) => a.stage === 'entrevista').length}
                  </span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 rounded-lg px-3 py-1.5 text-center">
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-semibold block">
                    Proposta
                  </span>
                  <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    {
                      applicants.filter(
                        (a) => a.stage === 'proposta' || a.stage === 'contratado'
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sub-tabs inside announcement */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 tabular-nums">
              {(
                [
                  {
                    id: 'all',
                    label: `Todos (${applicants.length})`,
                    activeCls: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
                  },
                  {
                    id: 'triagem',
                    label: `Em Triagem (${applicants.filter((a) => a.stage === 'triagem').length})`,
                    activeCls: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
                  },
                  {
                    id: 'entrevista',
                    label: `Entrevista Agendada (${applicants.filter((a) => a.stage === 'entrevista').length})`,
                    activeCls: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
                  },
                  {
                    id: 'proposta',
                    label: `Proposta Emitida (${applicants.filter((a) => a.stage === 'proposta').length})`,
                    activeCls: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900',
                  },
                  {
                    id: 'contratado',
                    label: `Contratados (${applicants.filter((a) => a.stage === 'contratado').length})`,
                    activeCls: 'bg-emerald-700 text-white',
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStageTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedStageTab === tab.id
                      ? tab.activeCls
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-slate-600 dark:text-slate-400">
              Clique em um candidato para inspecionar o dossiê completo
            </span>
          </div>

          {/* Applicants Grid (Accessible buttons - Checklist 5.2) */}
          {filteredApplicants.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center">
              <Users className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Nenhum candidato nesta etapa para o anúncio selecionado.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1">
                Conforme novos profissionais se candidatarem na interface LinkedIn Vagas, eles aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApplicants.map((cand) => (
                <button
                  key={cand.id}
                  type="button"
                  onClick={() => setActivePopupApplicantId(cand.id)}
                  className="p-4 sm:p-5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-brand dark:hover:border-sky-500 rounded-xl shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group text-left relative w-full focus:outline-2 focus:outline-brand"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs border border-transparent dark:border-slate-700">
                        {getInitials(cand.candidateName)}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand dark:group-hover:text-sky-400 transition-colors">
                            {cand.candidateName}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{cand.candidateRole}</p>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">
                          <span className="flex items-center gap-0.5 font-bold text-slate-800 dark:text-slate-200">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {cand.rating}
                          </span>
                          <span>({cand.reviewCount} avaliações)</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                            {cand.distanceKm} km
                          </span>
                        </div>
                      </div>
                    </div>

                    <StageBadge stage={cand.stage} />
                  </div>

                  {cand.coverNote && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-2 italic">
                      "{cand.coverNote}"
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1">
                    {cand.badges.slice(0, 3).map((b, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 px-2 py-0.5 rounded font-medium"
                      >
                        ✓ {b}
                      </span>
                    ))}
                    {cand.badges.length > 3 && (
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded tabular-nums">
                        +{cand.badges.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs tabular-nums">
                    <div>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-semibold block">
                        Pretensão
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        R$ {cand.salaryExpectation} / plantão
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-600 dark:text-slate-400">
                        Candidatou-se {cand.appliedDate}
                      </span>
                      <span className="text-xs font-bold text-brand dark:text-sky-400 group-hover:underline flex items-center gap-1">
                        Ver Dossiê <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <CandidateDossierModal
        applicant={activePopupApplicant}
        announcement={currentAnnouncement}
        candidateProfile={activeCandidateProfile}
        secretEvaluations={secretEvaluations}
        publicReviews={publicReviews}
        onClose={() => setActivePopupApplicantId(null)}
        onStageChange={handleStageChange}
        onOpenContractModal={onOpenContractModal}
        onSelectCandidateProfile={onSelectCandidateProfile}
      />

      <CreateAnnouncementModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        currentUser={currentUser}
        onCreate={handleCreateAnnouncement}
      />
    </div>
  );
};
