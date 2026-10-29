import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { FreelancerView } from './components/freelancer/FreelancerView';
import { CaregiverCatalogView } from './components/catalog/CaregiverCatalogView';
import { RadarView } from './components/radar/RadarView';
import { EmployerView } from './components/employer/EmployerView';
import { TrustFeedView } from './components/feed/TrustFeedView';
import { TechLeadConsole } from './components/tech-lead/TechLeadConsole';
import { ContractModal } from './components/contracts/ContractModal';
import { LoginView } from './components/auth/LoginView';
import { LandingHomeView } from './components/home/LandingHomeView';
import { LinkedInJobsView } from './components/jobs/LinkedInJobsView';
import { 
  primaryFreelancer, 
  sampleCaregiverProfiles,
  sampleContracts, 
  samplePublicReviews, 
  sampleSecretEvaluations,
  sampleJobAnnouncements,
  testUsers
} from './data/mockData';
import { Contract, AuthUser, FreelancerProfile, JobAnnouncement, JobApplicant } from './types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  SwitchCamera, 
  UserCheck, 
  Briefcase,
  Terminal,
  X
} from 'lucide-react';

export default function App() {
  // If not logged in, user sees LandingHomeView ("tela inicial de começo")
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const [selectedCaregiverProfile, setSelectedCaregiverProfile] = useState<FreelancerProfile>(primaryFreelancer);
  const [contracts, setContracts] = useState<Contract[]>(sampleContracts);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contractNotification, setContractNotification] = useState<string | null>(null);
  const [showTechDocsModal, setShowTechDocsModal] = useState<boolean>(false);

  // Job announcements state for employer and job seeker LinkedIn view
  const [jobAnnouncements, setJobAnnouncements] = useState<JobAnnouncement[]>(sampleJobAnnouncements);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>(['ann-01', 'ann-03']);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    if (user.role === 'employer') {
      setActiveTab('catalog');
    } else {
      setSelectedCaregiverProfile(primaryFreelancer);
      setActiveTab('freelancer');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowLoginModal(false);
    setCurrentUser(null);
  };

  const handleSwitchUser = () => {
    if (!currentUser) return;
    if (currentUser.role === 'freelancer') {
      setCurrentUser(testUsers.employer);
      setActiveTab('catalog');
    } else {
      setCurrentUser(testUsers.freelancer);
      setSelectedCaregiverProfile(primaryFreelancer);
      setActiveTab('freelancer');
    }
  };

  const handleSelectCaregiver = (profile: FreelancerProfile) => {
    setSelectedCaregiverProfile(profile);
    setActiveTab('freelancer');
  };

  const handleSelectCandidateByName = (candidateName: string) => {
    const found = sampleCaregiverProfiles.find(p => p.fullName === candidateName);
    if (found) {
      setSelectedCaregiverProfile(found);
      setActiveTab('freelancer');
    }
  };

  const handleOpenContractModal = (contract: Contract) => {
    setSelectedContract(contract);
  };

  const handleOpenContractById = (contractId: string) => {
    const found = contracts.find(c => c.id === contractId);
    if (found) {
      setSelectedContract(found);
    } else {
      setSelectedContract(contracts[0]);
    }
  };

  const handleCreateProposalContract = (candidateName: string, role: string, rate: number) => {
    const newContract: Contract = {
      id: `ctr-${Date.now().toString().slice(-4)}`,
      jobId: `job-${Date.now().toString().slice(-3)}`,
      jobTitle: `Contrato de Prestação de Serviços - ${role}`,
      employerId: 'emp-501',
      employerName: 'Dra. Beatriz Fontana (Família Verificada)',
      freelancerId: 'fl-101',
      freelancerName: candidateName,
      category: role,
      type: 'diario',
      status: 'active',
      startDate: new Date().toLocaleDateString('pt-BR'),
      agreedRate: rate,
      rateType: 'daily',
      locationAddress: 'Rua Bela Cintra, 1420 - Consolação, São Paulo/SP',
      clauses: [
        'Cláusula 1ª: Objeto - Prestação de serviços com zelo profissional e humanizado.',
        'Cláusula 2ª: Sigilo e Confidencialidade - Obrigação de não divulgação de informações da residência.',
        'Cláusula 3ª: Dupla Avaliação - Inserção de relatórios sigilosos condicionada ao término do contrato.'
      ],
      securityHash: `TL-CTR-${Date.now()}-SHA256`,
      employerSignedAt: `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR').slice(0, 5)}`,
      canReview: false
    };

    setContracts([newContract, ...contracts]);
    setContractNotification(`Contrato gerado automaticamente para ${candidateName}!`);
    setTimeout(() => setContractNotification(null), 5000);
  };

  const handleSignContract = (contractId: string) => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          freelancerSignedAt: new Date().toLocaleString('pt-BR'),
          status: 'active'
        };
      }
      return c;
    }));
  };

  const handleApplyJob = (jobId: string, note: string) => {
    if (!appliedJobIds.includes(jobId)) {
      setAppliedJobIds(prev => [...prev, jobId]);
    }

    const newApplicant: JobApplicant = {
      id: `app-${Date.now().toString().slice(-4)}`,
      candidateId: currentUser?.id || 'fl-101',
      candidateName: currentUser?.name || 'Maria Clara Silveira',
      candidateRole: currentUser?.title || 'Cuidadora Geriátrica Sênior & COREN-SP',
      avatarSeed: 'maria',
      rating: 4.96,
      reviewCount: 14,
      distanceKm: 1.8,
      salaryExpectation: 340,
      stage: 'triagem',
      appliedDate: 'Hoje às ' + new Date().toLocaleTimeString('pt-BR').slice(0, 5),
      badges: ['Antecedentes PF', 'Check Facial 99.8%', 'COREN Ativo', 'CNH B'],
      coverNote: note,
      confidentialFeedbackSnippet: 'Avaliação sigilosa: Nota 10 em honestidade e discrição absoluta. Teve livre acesso à residência sem qualquer ocorrência.'
    };

    setJobAnnouncements(prev => prev.map(ann => {
      if (ann.id === jobId) {
        return {
          ...ann,
          applicants: [newApplicant, ...ann.applicants.filter(a => a.candidateId !== newApplicant.candidateId)]
        };
      }
      return ann;
    }));
  };

  const handleUpdateApplicantStage = (announcementId: string, applicantId: string, newStage: JobApplicant['stage']) => {
    setJobAnnouncements(prev => prev.map(ann => {
      if (ann.id === announcementId) {
        return {
          ...ann,
          applicants: ann.applicants.map(app => 
            app.id === applicantId ? { ...app, stage: newStage } : app
          )
        };
      }
      return ann;
    }));
  };

  const handleCreateNewAnnouncement = (newAnn: JobAnnouncement) => {
    setJobAnnouncements(prev => [newAnn, ...prev]);
    setContractNotification(`Novo anúncio publicado: "${newAnn.title}"! Aba criada com sucesso.`);
    setTimeout(() => setContractNotification(null), 5000);
  };

  // 1. If not logged in and clicked to open Login Form
  if (!isLoggedIn && showLoginModal) {
    return (
      <LoginView 
        onLogin={handleLogin} 
        onBackToHome={() => setShowLoginModal(false)}
      />
    );
  }

  // 2. If not logged in, render the clean initial home screen ("tela inicial de começo")
  if (!isLoggedIn || !currentUser) {
    return (
      <LandingHomeView 
        onSelectUser={handleLogin}
        onOpenLoginModal={() => setShowLoginModal(true)}
      />
    );
  }

  // 3. Logged in platform workspace
  return (
    <div className="min-h-screen bg-[#f3f2ef] text-[#191919] flex flex-col font-sans selection:bg-[#0a66c2] selection:text-white">
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
      />

      {/* Global Toast for Contract Generation */}
      {contractNotification && (
        <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800 flex items-center justify-between shadow-md">
          <div className="max-w-6xl mx-auto flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">{contractNotification}</span>
          </div>
          <button 
            onClick={() => setContractNotification(null)}
            className="text-slate-400 hover:text-white text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Role Context Bar */}
      <div className={`border-b text-xs py-2 px-4 ${
        currentUser.role === 'freelancer' 
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
          : 'bg-blue-50/70 border-blue-200 text-slate-900'
      }`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {currentUser.role === 'freelancer' ? (
              <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <Briefcase className="w-4 h-4 text-[#0a66c2] shrink-0" />
            )}
            <span>
              Conectado como <strong>{currentUser.name}</strong> ({currentUser.role === 'freelancer' ? 'Área do Profissional (Cuidador)' : 'Área do Contratante (Família)'}).
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSwitchUser}
              className="font-semibold underline flex items-center gap-1 text-[#0a66c2] hover:text-[#004182]"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
              <span>Alternar para {currentUser.role === 'freelancer' ? 'Área do Contratante' : 'Área do Profissional'}</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Sair p/ Tela Inicial
            </button>
          </div>
        </div>
      </div>

      {/* Main Views */}
      <main className="flex-1">
        {activeTab === 'catalog' && (
          <CaregiverCatalogView 
            currentUser={currentUser}
            onSelectCaregiver={handleSelectCaregiver}
            onOpenProposal={handleCreateProposalContract}
          />
        )}

        {activeTab === 'freelancer' && (
          <FreelancerView 
            profile={selectedCaregiverProfile}
            contracts={contracts}
            publicReviews={samplePublicReviews}
            secretEvaluations={sampleSecretEvaluations}
            onOpenContract={handleOpenContractModal}
            currentUser={currentUser}
            onBackToCatalog={currentUser.role === 'employer' ? () => setActiveTab('catalog') : undefined}
            onNavigateToJobs={() => setActiveTab('jobs')}
          />
        )}

        {activeTab === 'jobs' && (
          <LinkedInJobsView 
            currentUser={currentUser}
            jobAnnouncements={jobAnnouncements}
            appliedJobIds={appliedJobIds}
            onApplyJob={handleApplyJob}
          />
        )}

        {activeTab === 'radar' && (
          <RadarView 
            onSelectForContract={handleCreateProposalContract}
          />
        )}

        {activeTab === 'employer' && (
          <EmployerView 
            announcements={jobAnnouncements}
            onOpenContractModal={handleOpenContractById}
            onCreateProposalContract={handleCreateProposalContract}
            onNavigateToCatalog={() => setActiveTab('catalog')}
            onSelectCandidateProfile={handleSelectCandidateByName}
            onUpdateApplicantStage={handleUpdateApplicantStage}
            onCreateNewAnnouncement={handleCreateNewAnnouncement}
          />
        )}

        {activeTab === 'feed' && (
          <TrustFeedView />
        )}
      </main>

      {/* Contract Viewer Modal */}
      {selectedContract && (
        <ContractModal 
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          onSignContract={handleSignContract}
        />
      )}

      {/* Tech Docs Modal (Discreet Developer Access in Footer) */}
      {showTechDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-5xl my-8 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Documentação de Engenharia & Arquitetura (Fastify / PostGIS / Redis)</h3>
              </div>
              <button
                onClick={() => setShowTechDocsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-70px)]">
              <TechLeadConsole />
            </div>
          </div>
        </div>
      )}

      {/* Human, Institutional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#0a66c2] text-white flex items-center justify-center font-bold text-[10px]">
              TL
            </div>
            <span className="font-semibold text-slate-700">TrustLink Brasil</span>
            <span>· Plataforma de Serviços de Alta Confiança & Integridade</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Privacidade & Sigilo Garantidos</span>
            <span>·</span>
            <span>Termos de Uso</span>
            <span>·</span>
            {/* Discreet Link for Engineering & Architecture Audit */}
            <button
              onClick={() => setShowTechDocsModal(true)}
              className="text-slate-400 hover:text-slate-600 underline"
              title="Visualizar rotas REST, PostGIS e arquitetura de sessões Redis"
            >
              Documentação de Arquitetura (API)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
