import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { ContractModal } from './components/contracts/ContractModal';
import { LoginView } from './components/auth/LoginView';
import { LandingHomeView } from './components/home/LandingHomeView';
import { ThemeProvider } from './components/common/ThemeContext';
import { ToastProvider, useToast } from './components/common/ToastContext';
import { trustlinkService } from './services/trustlinkService';
import {
  AvailabilityStatus,
  AuthUser,
  Contract,
  FeedPost,
  FreelancerProfile,
  JobAnnouncement,
  JobApplicant,
  PublicReview,
  SecretEvaluation,
} from './types';
import {
  SwitchCamera,
  UserCheck,
  Briefcase,
  RotateCcw,
} from 'lucide-react';

const CaregiverCatalogView = lazy(() =>
  import('./components/catalog/CaregiverCatalogView').then((m) => ({
    default: m.CaregiverCatalogView,
  }))
);
const FreelancerView = lazy(() =>
  import('./components/freelancer/FreelancerView').then((m) => ({
    default: m.FreelancerView,
  }))
);
const LinkedInJobsView = lazy(() =>
  import('./components/jobs/LinkedInJobsView').then((m) => ({
    default: m.LinkedInJobsView,
  }))
);
const RadarView = lazy(() =>
  import('./components/radar/RadarView').then((m) => ({
    default: m.RadarView,
  }))
);
const EmployerView = lazy(() =>
  import('./components/employer/EmployerView').then((m) => ({
    default: m.EmployerView,
  }))
);
const TrustFeedView = lazy(() =>
  import('./components/feed/TrustFeedView').then((m) => ({
    default: m.TrustFeedView,
  }))
);

const ViewFallback: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs text-slate-600 dark:text-slate-400">
    Carregando dados verificados do servidor...
  </div>
);

interface ProfileRouteWrapperProps {
  profiles: FreelancerProfile[];
  defaultProfileId: string;
  contracts: Contract[];
  publicReviews: PublicReview[];
  secretEvaluations: SecretEvaluation[];
  currentUser: AuthUser;
  onOpenContract: (contract: Contract) => void;
  onUpdateAvailability: (profileId: string, status: AvailabilityStatus) => void;
  onAddSecretEvaluation: (evaluation: SecretEvaluation) => Promise<void>;
  onBackToCatalog?: () => void;
  onNavigateToJobs: () => void;
}

const ProfileRouteWrapper: React.FC<ProfileRouteWrapperProps> = ({
  profiles,
  defaultProfileId,
  contracts,
  publicReviews,
  secretEvaluations,
  currentUser,
  onOpenContract,
  onUpdateAvailability,
  onAddSecretEvaluation,
  onBackToCatalog,
  onNavigateToJobs,
}) => {
  const { id } = useParams<{ id: string }>();
  const resolvedProfile =
    profiles.find((p) => p.id === (id || defaultProfileId)) || profiles[0];

  if (!resolvedProfile) {
    return <ViewFallback />;
  }

  return (
    <FreelancerView
      key={resolvedProfile.id}
      profile={resolvedProfile}
      contracts={contracts}
      publicReviews={publicReviews}
      secretEvaluations={secretEvaluations}
      onOpenContract={onOpenContract}
      onUpdateAvailability={onUpdateAvailability}
      onAddSecretEvaluation={onAddSecretEvaluation}
      currentUser={currentUser}
      onBackToCatalog={onBackToCatalog}
      onNavigateToJobs={onNavigateToJobs}
    />
  );
};

function WorkspaceShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [workspaceLoading, setWorkspaceLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [profiles, setProfiles] = useState<FreelancerProfile[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [publicReviews, setPublicReviews] = useState<PublicReview[]>([]);
  const [secretEvaluations, setSecretEvaluations] = useState<SecretEvaluation[]>([]);
  const [jobAnnouncements, setJobAnnouncements] = useState<JobAnnouncement[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);

  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  const loadWorkspaceFromServer = useCallback(async () => {
    setWorkspaceLoading(true);
    try {
      const payload = await trustlinkService.fetchBootstrap();
      if (payload.user) {
        setCurrentUser(payload.user);
      }
      setProfiles(payload.profiles);
      setContracts(payload.contracts);
      setPublicReviews(payload.publicReviews);
      setSecretEvaluations(payload.secretEvaluations);
      setJobAnnouncements(payload.jobAnnouncements);
      setAppliedJobIds(payload.appliedJobIds);
      setFeedPosts(payload.feedPosts);
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Erro ao sincronizar dados com o servidor.',
        'error'
      );
    } finally {
      setWorkspaceLoading(false);
    }
  }, [showToast]);

  // Restore session on initial load
  useEffect(() => {
    let active = true;
    trustlinkService
      .restoreSession()
      .then(async (restoredUser) => {
        if (!active) return;
        if (restoredUser) {
          setCurrentUser(restoredUser);
          await loadWorkspaceFromServer();
        }
      })
      .finally(() => {
        if (active) setAuthChecking(false);
      });

    return () => {
      active = false;
    };
  }, [loadWorkspaceFromServer]);

  const selectedContract = useMemo(
    () => contracts.find((c) => c.id === selectedContractId) ?? null,
    [contracts, selectedContractId]
  );

  const activeTab: ActiveTab = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/catalog')) return 'catalog';
    if (path.startsWith('/profile')) return 'freelancer';
    if (path.startsWith('/jobs')) return 'jobs';
    if (path.startsWith('/radar')) return 'radar';
    if (path.startsWith('/employer')) return 'employer';
    if (path.startsWith('/feed')) return 'feed';
    return currentUser?.role === 'employer' ? 'catalog' : 'freelancer';
  }, [location.pathname, currentUser?.role]);

  const defaultFreelancerProfileId =
    currentUser?.freelancerProfileId || profiles[0]?.id || 'fl-101';

  const loggedInFreelancerProfile = useMemo(
    () => profiles.find((p) => p.id === defaultFreelancerProfileId),
    [profiles, defaultFreelancerProfileId]
  );

  const handleTabChange = (tab: ActiveTab) => {
    const map: Record<ActiveTab, string> = {
      catalog: '/catalog',
      freelancer: `/profile/${defaultFreelancerProfileId}`,
      jobs: '/jobs',
      radar: '/radar',
      employer: '/employer',
      feed: '/feed',
    };
    navigate(map[tab]);
  };

  const handleLoginSuccess = async (user: AuthUser) => {
    setCurrentUser(user);
    await loadWorkspaceFromServer();
    if (user.role === 'employer') {
      navigate('/catalog');
    } else {
      navigate(`/profile/${user.freelancerProfileId || 'fl-101'}`);
    }
    showToast(`Bem-vindo(a), ${user.name}!`);
  };

  const handleDemoLogin = async (role: 'freelancer' | 'employer') => {
    try {
      const user = await trustlinkService.demoLogin(role);
      await handleLoginSuccess(user);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Falha ao iniciar sessão de demonstração.',
        'error'
      );
    }
  };

  const handleLogout = async () => {
    await trustlinkService.logout();
    setCurrentUser(null);
    setSecretEvaluations([]);
    navigate('/');
  };

  const handleSwitchUser = async () => {
    if (!currentUser) return;
    const nextRole = currentUser.role === 'freelancer' ? 'employer' : 'freelancer';
    try {
      const switchedUser = await trustlinkService.demoLogin(nextRole);
      setCurrentUser(switchedUser);
      await loadWorkspaceFromServer();
      if (switchedUser.role === 'employer') {
        navigate('/catalog');
        showToast(
          `Sessão autenticada como ${switchedUser.name} (Contratante).`,
          'info'
        );
      } else {
        navigate(`/profile/${switchedUser.freelancerProfileId || 'fl-101'}`);
        showToast(
          `Sessão autenticada como ${switchedUser.name} (Profissional).`,
          'info'
        );
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao alternar conta.',
        'error'
      );
    }
  };

  const handleSelectCaregiver = (profile: FreelancerProfile) => {
    navigate(`/profile/${profile.id}`);
  };

  const handleSelectCandidateById = (candidateId: string) => {
    const found = profiles.find((p) => p.id === candidateId);
    if (found) {
      navigate(`/profile/${found.id}`);
    } else {
      showToast('Perfil detalhado do candidato não encontrado.', 'error');
    }
  };

  const handleOpenContractModal = (contract: Contract) => {
    setSelectedContractId(contract.id);
  };

  const handleOpenContractById = (contractId: string) => {
    const found = contracts.find((c) => c.id === contractId);
    if (!found) {
      showToast(`Contrato ${contractId} não encontrado nos registros.`, 'error');
      return;
    }
    setSelectedContractId(found.id);
  };

  const handleCreateProposalContract = async (
    freelancerId: string,
    candidateName: string,
    role: string,
    rate: number,
    jobId?: string,
    jobTitle?: string
  ): Promise<string> => {
    const created = await trustlinkService.createProposalContract({
      freelancerId,
      candidateName,
      role,
      rate,
      jobId,
      jobTitle,
    });
    setContracts((prev) => [created, ...prev]);
    setSelectedContractId(created.id);
    showToast(
      `Proposta e minuta (${created.id}) gravadas no SQLite para ${candidateName}! Aguardando assinatura digital.`
    );
    return created.id;
  };

  const handleSignContract = async (contractId: string) => {
    try {
      const updated = await trustlinkService.signContract(contractId);
      setContracts((prev) =>
        prev.map((c) => (c.id === contractId ? updated : c))
      );
      showToast('Contrato assinado digitalmente no servidor! Status: EM VIGÊNCIA.');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Falha ao assinar contrato.',
        'error'
      );
    }
  };

  const handleCompleteContract = async (contractId: string) => {
    try {
      const updated = await trustlinkService.completeContract(contractId);
      setContracts((prev) =>
        prev.map((c) => (c.id === contractId ? updated : c))
      );
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === updated.freelancerId
            ? { ...p, completedContractsCount: p.completedContractsCount + 1 }
            : p
        )
      );
      showToast(
        'Contrato marcado como CONCLUÍDO! Avaliação confidencial liberada para este vínculo.'
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao concluir contrato.',
        'error'
      );
    }
  };

  const handleApplyJob = async (jobId: string, note: string) => {
    try {
      const updatedJob = await trustlinkService.applyToJob(jobId, note);
      if (!appliedJobIds.includes(jobId)) {
        setAppliedJobIds((prev) => [...prev, jobId]);
      }
      setJobAnnouncements((prev) =>
        prev.map((ann) => (ann.id === jobId ? updatedJob : ann))
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao enviar candidatura.',
        'error'
      );
    }
  };

  const handleUpdateApplicantStage = async (
    announcementId: string,
    applicantId: string,
    newStage: JobApplicant['stage'],
    contractId?: string
  ) => {
    try {
      const updatedJob = await trustlinkService.updateApplicantStage(
        announcementId,
        applicantId,
        newStage,
        contractId
      );
      setJobAnnouncements((prev) =>
        prev.map((ann) => (ann.id === announcementId ? updatedJob : ann))
      );
      if (newStage === 'contratado') {
        showToast('Contratação confirmada no pipeline!');
      } else if (newStage === 'entrevista') {
        showToast('Candidato movido para Entrevista Agendada.', 'info');
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao atualizar etapa.',
        'error'
      );
    }
  };

  const handleCreateNewAnnouncement = async (newAnn: JobAnnouncement) => {
    try {
      const rawLocation = newAnn.location.split(' · ')[0] || newAnn.location;
      const saved = await trustlinkService.createJobAnnouncement({
        title: newAnn.title,
        location: rawLocation,
        distanceKm: newAnn.distanceKm,
        workSchedule: newAnn.workSchedule,
        contractType: newAnn.contractType,
        rateAmount: newAnn.rateAmount,
        urgency: newAnn.urgency,
        description: newAnn.description,
      });
      setJobAnnouncements((prev) => [saved, ...prev]);
      showToast(`Novo anúncio gravado no banco: "${saved.title}"!`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao publicar anúncio.',
        'error'
      );
    }
  };

  const handleUpdateAvailability = async (
    profileId: string,
    status: AvailabilityStatus
  ) => {
    try {
      const updatedProfile = await trustlinkService.updateAvailability(
        profileId,
        status
      );
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? updatedProfile : p))
      );
      const labelMap: Record<AvailabilityStatus, string> = {
        online: 'Disponível (Online)',
        urgency: 'Plantão de Urgência Ativo',
        offline: 'Em Pausa (Offline)',
      };
      showToast(`Disponibilidade sincronizada no servidor: ${labelMap[status]}`, 'info');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao alterar disponibilidade.',
        'error'
      );
    }
  };

  const handleAddSecretEvaluation = async (evaluation: SecretEvaluation) => {
    const saved = await trustlinkService.createSecretEvaluation({
      contractId: evaluation.contractId,
      freelancerId: evaluation.freelancerId,
      honestyScore: evaluation.honestyScore,
      punctualityScore: evaluation.punctualityScore,
      discretionConfidentialityScore: evaluation.discretionConfidentialityScore,
      wouldRehirePrivately: evaluation.wouldRehirePrivately,
      privateNotes: evaluation.privateNotes,
    });
    setSecretEvaluations((prev) => [saved, ...prev]);
  };

  const handleCreateFeedPost = async (post: FeedPost) => {
    try {
      const saved = await trustlinkService.createFeedPost({
        content: post.content,
        type: post.type,
        mediaTitle: post.mediaTitle,
      });
      setFeedPosts((prev) => [saved, ...prev]);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao publicar no feed.',
        'error'
      );
    }
  };

  const handleLikeFeedPost = async (postId: string) => {
    try {
      const updated = await trustlinkService.likeFeedPost(postId);
      setFeedPosts((prev) =>
        prev.map((p) => (p.id === postId ? updated : p))
      );
    } catch {
      // Ignore transient error
    }
  };

  const handleResetDemo = async () => {
    try {
      const refreshedUser = await trustlinkService.resetDemoDatabase();
      setCurrentUser(refreshedUser);
      await loadWorkspaceFromServer();
      showToast(
        'Banco de dados SQLite restaurado para o seed inicial de demonstração!',
        'info'
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao restaurar banco.',
        'error'
      );
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-slate-950 flex items-center justify-center text-xs text-slate-600 dark:text-slate-400 font-medium">
        Conectando ao servidor TrustLink...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <LoginView
              onLogin={(u) => void handleLoginSuccess(u)}
              onBackToHome={() => navigate('/')}
            />
          }
        />
        <Route
          path="*"
          element={
            <LandingHomeView
              onDemoLogin={(role) => void handleDemoLogin(role)}
              onOpenLoginModal={() => navigate('/login')}
            />
          }
        />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-brand selection:text-white transition-colors duration-200">
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentUser={currentUser}
        onSwitchUser={() => void handleSwitchUser()}
        onLogout={() => void handleLogout()}
      />

      {/* Role Context Bar */}
      <div
        className={`border-b text-xs py-2 px-4 transition-colors ${
          currentUser.role === 'freelancer'
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-100'
            : 'bg-blue-50/70 border-blue-200 text-slate-900 dark:bg-blue-950/40 dark:border-blue-900/60 dark:text-slate-100'
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {currentUser.role === 'freelancer' ? (
              <UserCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            ) : (
              <Briefcase className="w-4 h-4 text-brand dark:text-blue-400 shrink-0" />
            )}
            <span>
              Conectado como <strong>{currentUser.name}</strong> (
              {currentUser.role === 'freelancer'
                ? 'Área do Profissional'
                : 'Área do Contratante'}
              ).
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => void handleSwitchUser()}
              className="font-semibold underline flex items-center gap-1 text-brand dark:text-blue-400 hover:text-brand-hover dark:hover:text-blue-300 cursor-pointer"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
              <span>
                Alternar para{' '}
                {currentUser.role === 'freelancer'
                  ? 'Área do Contratante'
                  : 'Área do Profissional'}
              </span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium cursor-pointer"
            >
              Sair p/ Tela Inicial
            </button>
          </div>
        </div>
      </div>

      {/* Main Routed Views */}
      <main className="flex-1">
        {workspaceLoading && profiles.length === 0 ? (
          <ViewFallback />
        ) : (
          <Suspense fallback={<ViewFallback />}>
            <Routes>
              <Route
                path="/"
                element={
                  <Navigate
                    to={
                      currentUser.role === 'employer'
                        ? '/catalog'
                        : `/profile/${defaultFreelancerProfileId}`
                    }
                    replace
                  />
                }
              />
              <Route
                path="/login"
                element={
                  <Navigate
                    to={
                      currentUser.role === 'employer'
                        ? '/catalog'
                        : `/profile/${defaultFreelancerProfileId}`
                    }
                    replace
                  />
                }
              />
              <Route
                path="/catalog"
                element={
                  <CaregiverCatalogView
                    profiles={profiles}
                    onSelectCaregiver={handleSelectCaregiver}
                    onOpenProposal={(id, name, role, rate) => {
                      void handleCreateProposalContract(id, name, role, rate).catch(
                        (err) =>
                          showToast(
                            err instanceof Error ? err.message : 'Erro ao emitir proposta.',
                            'error'
                          )
                      );
                    }}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <Navigate to={`/profile/${defaultFreelancerProfileId}`} replace />
                }
              />
              <Route
                path="/profile/:id"
                element={
                  <ProfileRouteWrapper
                    profiles={profiles}
                    defaultProfileId={defaultFreelancerProfileId}
                    contracts={contracts}
                    publicReviews={publicReviews}
                    secretEvaluations={secretEvaluations}
                    currentUser={currentUser}
                    onOpenContract={handleOpenContractModal}
                    onUpdateAvailability={(id, status) =>
                      void handleUpdateAvailability(id, status)
                    }
                    onAddSecretEvaluation={handleAddSecretEvaluation}
                    onBackToCatalog={
                      currentUser.role === 'employer'
                        ? () => navigate('/catalog')
                        : undefined
                    }
                    onNavigateToJobs={() => navigate('/jobs')}
                  />
                }
              />
              <Route
                path="/jobs"
                element={
                  <LinkedInJobsView
                    currentUser={currentUser}
                    userProfile={loggedInFreelancerProfile}
                    jobAnnouncements={jobAnnouncements}
                    appliedJobIds={appliedJobIds}
                    onApplyJob={(jobId, note) => void handleApplyJob(jobId, note)}
                  />
                }
              />
              <Route
                path="/radar"
                element={
                  <RadarView
                    profiles={profiles}
                    onSelectForContract={(id, name, role, rate) => {
                      void handleCreateProposalContract(id, name, role, rate).catch(
                        (err) =>
                          showToast(
                            err instanceof Error ? err.message : 'Erro ao emitir proposta.',
                            'error'
                          )
                      );
                    }}
                  />
                }
              />
              <Route
                path="/employer"
                element={
                  <EmployerView
                    currentUser={currentUser}
                    announcements={jobAnnouncements}
                    profiles={profiles}
                    secretEvaluations={secretEvaluations}
                    publicReviews={publicReviews}
                    onOpenContractModal={handleOpenContractById}
                    onCreateProposalContract={handleCreateProposalContract}
                    onNavigateToCatalog={() => navigate('/catalog')}
                    onSelectCandidateProfile={handleSelectCandidateById}
                    onUpdateApplicantStage={(annId, appId, stage, ctrId) =>
                      void handleUpdateApplicantStage(annId, appId, stage, ctrId)
                    }
                    onCreateNewAnnouncement={(ann) =>
                      void handleCreateNewAnnouncement(ann)
                    }
                  />
                }
              />
              <Route
                path="/feed"
                element={
                  <TrustFeedView
                    currentUser={currentUser}
                    posts={feedPosts}
                    onCreatePost={(post) => void handleCreateFeedPost(post)}
                    onLikePost={(postId) => void handleLikeFeedPost(postId)}
                  />
                }
              />
              <Route
                path="*"
                element={
                  <Navigate
                    to={
                      currentUser.role === 'employer'
                        ? '/catalog'
                        : `/profile/${defaultFreelancerProfileId}`
                    }
                    replace
                  />
                }
              />
            </Routes>
          </Suspense>
        )}
      </main>

      {selectedContract && (
        <ContractModal
          contract={selectedContract}
          currentUser={currentUser}
          onClose={() => setSelectedContractId(null)}
          onSignContract={(id) => void handleSignContract(id)}
          onCompleteContract={(id) => void handleCompleteContract(id)}
        />
      )}

      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-600 dark:text-slate-400 transition-colors">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-brand text-white flex items-center justify-center font-bold text-[10px]">
              TL
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">TrustLink Brasil</span>
            <span>· Rede Auditada de Cuidados e Serviços Familiares</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => void handleResetDemo()}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 underline cursor-pointer"
              title="Restaurar banco de dados SQLite para o seed inicial"
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar Banco Demo
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <WorkspaceShell />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
