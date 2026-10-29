import React, { useState } from 'react';
import { JobAnnouncement, JobApplicant, FreelancerProfile } from '../../types';
import { 
  Briefcase, 
  Users, 
  Star, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  FileCheck2, 
  Plus, 
  Calendar, 
  Clock, 
  Lock, 
  X, 
  ChevronRight, 
  Phone, 
  Mail, 
  AlertCircle,
  Eye,
  Send,
  Sparkles,
  Building,
  UserCheck,
  Award
} from 'lucide-react';

interface EmployerViewProps {
  announcements: JobAnnouncement[];
  onOpenContractModal: (contractId: string) => void;
  onCreateProposalContract: (candidateName: string, role: string, rate: number) => void;
  onNavigateToCatalog?: () => void;
  onSelectCandidateProfile?: (candidateName: string) => void;
  onUpdateApplicantStage: (announcementId: string, applicantId: string, stage: JobApplicant['stage']) => void;
  onCreateNewAnnouncement: (newAnn: JobAnnouncement) => void;
}

export const EmployerView: React.FC<EmployerViewProps> = ({ 
  announcements,
  onOpenContractModal, 
  onCreateProposalContract,
  onNavigateToCatalog,
  onSelectCandidateProfile,
  onUpdateApplicantStage,
  onCreateNewAnnouncement
}) => {
  // Selected Announcement Tab
  const [selectedAnnId, setSelectedAnnId] = useState<string>(
    announcements.length > 0 ? announcements[0].id : ''
  );

  // Sub-tab for applicants inside the announcement
  const [selectedStageTab, setSelectedStageTab] = useState<'all' | 'triagem' | 'entrevista' | 'proposta' | 'contratado'>('all');

  // Candidate clicked -> Large blurred popup
  const [activePopupApplicant, setActivePopupApplicant] = useState<JobApplicant | null>(null);

  // Modal for creating a new announcement
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('Jardins, São Paulo');
  const [newSchedule, setNewSchedule] = useState('Segunda a Sexta · 08h às 17h');
  const [newContractType, setNewContractType] = useState<'diario' | 'mensal_fixo' | 'plantao_urgencia'>('diario');
  const [newRate, setNewRate] = useState('350');
  const [newDescription, setNewDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const currentAnnouncement = announcements.find(a => a.id === selectedAnnId) || announcements[0];

  const applicants = currentAnnouncement ? currentAnnouncement.applicants : [];

  const filteredApplicants = applicants.filter(app => {
    if (selectedStageTab === 'all') return true;
    return app.stage === selectedStageTab;
  });

  const handleStageChange = (applicantId: string, newStage: JobApplicant['stage']) => {
    if (!currentAnnouncement) return;
    onUpdateApplicantStage(currentAnnouncement.id, applicantId, newStage);

    if (newStage === 'proposta' || newStage === 'contratado') {
      const applicant = applicants.find(a => a.id === applicantId);
      if (applicant) {
        onCreateProposalContract(applicant.candidateName, applicant.candidateRole, applicant.salaryExpectation);
      }
    }

    if (activePopupApplicant && activePopupApplicant.id === applicantId) {
      setActivePopupApplicant({
        ...activePopupApplicant,
        stage: newStage
      });
    }
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: JobAnnouncement = {
      id: `ann-${Date.now().toString().slice(-4)}`,
      title: newTitle,
      employerId: 'emp-501',
      employerName: 'Dra. Beatriz Fontana (Família Fontana)',
      employerType: 'Residência Verificada · Membro Auditado TrustLink',
      location: newLocation,
      workSchedule: newSchedule,
      contractType: newContractType,
      rateDescription: newContractType === 'mensal_fixo' ? `R$ ${newRate} / mês` : `R$ ${newRate} / plantão`,
      rateAmount: Number(newRate) || 350,
      postedAt: 'Agora mesmo',
      status: 'active',
      urgency: isUrgent,
      description: newDescription || 'Oportunidade para assistência com cuidado humanizado e compromisso ético.',
      responsibilities: [
        'Acompanhamento e suporte com zêlo às necessidades diárias',
        'Controle dos horários de medicação e rotina do assistido',
        'Registro transparente dos acontecimentos do dia'
      ],
      requiredBadges: [
        'Antecedentes Criminais PF e TJ',
        'Checagem Facial Biometrica',
        'Referências de Famílias Verificadas'
      ],
      benefits: [
        'Ambiente familiar seguro e respeitoso',
        'Alimentação no local',
        'Contrato digital com garantia TrustLink'
      ],
      applicants: []
    };

    onCreateNewAnnouncement(created);
    setSelectedAnnId(created.id);
    setShowCreateModal(false);
    // Reset form
    setNewTitle('');
    setNewDescription('');
    setIsUrgent(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 font-sans space-y-5">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Área do Contratante · Família Fontana</span>
              <span>·</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Residência Auditada
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Gestão de Anúncios & Candidaturas de Cuidadores
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cada anúncio possui sua aba própria com os profissionais que se candidataram. Clique em qualquer candidato para abrir o dossiê detalhado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToCatalog && (
              <button
                onClick={onNavigateToCatalog}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                Catálogo de Cuidadores
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-[#0a66c2] hover:bg-[#004182] text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Publicar Novo Anúncio
            </button>
          </div>
        </div>
      </div>

      {/* 1. Main Announcement Tabs Bar (Aba para cada anúncio) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 pt-3 flex items-center gap-2 overflow-x-auto">
          {announcements.map((ann, idx) => {
            const isSelected = currentAnnouncement && currentAnnouncement.id === ann.id;
            return (
              <button
                key={ann.id}
                onClick={() => {
                  setSelectedAnnId(ann.id);
                  setSelectedStageTab('all');
                }}
                className={`group px-4 py-3 text-xs font-bold rounded-t-lg transition-all border-t border-x -mb-px flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 border-slate-200 border-b-white z-10 shadow-2xs'
                    : 'bg-slate-100/80 text-slate-600 border-transparent hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#0a66c2]' : 'bg-slate-400'}`}></span>
                <span className="max-w-[200px] sm:max-w-xs truncate">
                  {ann.title}
                </span>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isSelected 
                    ? 'bg-blue-100 text-[#0a66c2]' 
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {ann.applicants.length}
                </span>

                {ann.urgency && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    Urgente
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-2.5 text-xs font-semibold text-[#0a66c2] hover:text-[#004182] hover:bg-blue-50 rounded-lg flex items-center gap-1 shrink-0 mb-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Anúncio</span>
          </button>
        </div>

        {/* Selected Announcement Info Strip */}
        {currentAnnouncement && (
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                    {currentAnnouncement.contractType === 'mensal_fixo' ? 'Vaga Mensal CLT' : 'Plantão / Diária'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Publicado {currentAnnouncement.postedAt} · ID: {currentAnnouncement.id}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {currentAnnouncement.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {currentAnnouncement.location}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {currentAnnouncement.workSchedule}
                  </span>
                  <span>·</span>
                  <span className="font-bold text-slate-900">
                    {currentAnnouncement.rateDescription}
                  </span>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
                  <span className="text-sm font-bold text-slate-900">{applicants.length}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-center">
                  <span className="text-[10px] text-amber-700 uppercase font-semibold block">Triagem</span>
                  <span className="text-sm font-bold text-amber-900">
                    {applicants.filter(a => a.stage === 'triagem').length}
                  </span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-center">
                  <span className="text-[10px] text-blue-700 uppercase font-semibold block">Entrevista</span>
                  <span className="text-sm font-bold text-[#0a66c2]">
                    {applicants.filter(a => a.stage === 'entrevista').length}
                  </span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-center">
                  <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Proposta</span>
                  <span className="text-sm font-bold text-emerald-800">
                    {applicants.filter(a => a.stage === 'proposta' || a.stage === 'contratado').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Sub-tabs inside announcement showing who applied */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedStageTab('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  selectedStageTab === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({applicants.length})
              </button>
              <button
                onClick={() => setSelectedStageTab('triagem')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  selectedStageTab === 'triagem'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Em Triagem ({applicants.filter(a => a.stage === 'triagem').length})
              </button>
              <button
                onClick={() => setSelectedStageTab('entrevista')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  selectedStageTab === 'entrevista'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Entrevista Agendada ({applicants.filter(a => a.stage === 'entrevista').length})
              </button>
              <button
                onClick={() => setSelectedStageTab('proposta')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  selectedStageTab === 'proposta'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Proposta Emitida ({applicants.filter(a => a.stage === 'proposta').length})
              </button>
              <button
                onClick={() => setSelectedStageTab('contratado')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                  selectedStageTab === 'contratado'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Contratados ({applicants.filter(a => a.stage === 'contratado').length})
              </button>
            </div>

            <span className="text-[11px] text-slate-400">
              Clique em qualquer candidato para abrir o dossiê com fundo em blur
            </span>
          </div>

          {/* Applicants Grid */}
          {filteredApplicants.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-slate-200 rounded-xl text-center">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">
                Nenhum candidato nesta etapa para o anúncio selecionado.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Conforme novos profissionais se candidatarem na interface LinkedIn Vagas, eles aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredApplicants.map((cand) => {
                const stageColor = {
                  triagem: 'bg-amber-50 text-amber-900 border-amber-200',
                  entrevista: 'bg-blue-50 text-blue-900 border-blue-200',
                  proposta: 'bg-purple-50 text-purple-900 border-purple-200',
                  contratado: 'bg-emerald-50 text-emerald-900 border-emerald-200'
                }[cand.stage];

                const stageLabel = {
                  triagem: '1. Em Triagem',
                  entrevista: '2. Entrevista Agendada',
                  proposta: '3. Proposta Emitida',
                  contratado: '4. Plantão Contratado'
                }[cand.stage];

                return (
                  <div
                    key={cand.id}
                    onClick={() => setActivePopupApplicant(cand)}
                    className="p-4 sm:p-5 bg-white border border-slate-200 hover:border-[#0a66c2] rounded-xl shadow-2xs hover:shadow-md transition-all cursor-pointer group text-left relative"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                          {cand.candidateName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0a66c2] transition-colors">
                              {cand.candidateName}
                            </h3>
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          </div>

                          <p className="text-xs text-slate-500 mt-0.5">
                            {cand.candidateRole}
                          </p>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-0.5 font-bold text-slate-800">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {cand.rating}
                            </span>
                            <span>({cand.reviewCount} avaliações)</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {cand.distanceKm} km
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${stageColor}`}>
                        {stageLabel}
                      </span>
                    </div>

                    {/* Cover note snippet */}
                    {cand.coverNote && (
                      <p className="text-xs text-slate-600 mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 line-clamp-2 italic">
                        "{cand.coverNote}"
                      </p>
                    )}

                    {/* Badges preview */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {cand.badges.slice(0, 3).map((b, i) => (
                        <span key={i} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                          ✓ {b}
                        </span>
                      ))}
                      {cand.badges.length > 3 && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          +{cand.badges.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pretensão</span>
                        <span className="font-bold text-slate-900">
                          R$ {cand.salaryExpectation} / plantão
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">
                          Candidatou-se {cand.appliedDate}
                        </span>
                        <span className="text-xs font-bold text-[#0a66c2] group-hover:underline flex items-center gap-1">
                          Ver Dossiê <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. LARGE POP-UP MODAL WITH BLURRED BACKGROUND (Fundo em Blur) */}
      {activePopupApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md transition-all">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            {/* Pop-up Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {activePopupApplicant.candidateName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg">
                      {activePopupApplicant.candidateName}
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Dossiê Verificado
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {activePopupApplicant.candidateRole} · Candidatura para "{currentAnnouncement?.title}"
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActivePopupApplicant(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Fechar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pop-up Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Application Pitch */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#0a66c2] tracking-wider">
                    APRESENTAÇÃO ENVIADA NA CANDIDATURA
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Enviada {activePopupApplicant.appliedDate}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed italic">
                  "{activePopupApplicant.coverNote || 'Tenho total compromisso e disponibilidade com o cuidado humanizado da sua família.'}"
                </p>

                <div className="pt-2 border-t border-blue-200/70 flex flex-wrap items-center justify-between text-xs text-slate-600">
                  <span>Pretensão informada: <strong>R$ {activePopupApplicant.salaryExpectation} / plantão</strong></span>
                  <span>Distância calculada: <strong>{activePopupApplicant.distanceKm} km</strong> da sua residência</span>
                </div>
              </div>

              {/* Verified Trust Badges */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                    Selos de Verificação Oficiais (Checagem TrustLink)
                  </h4>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    100% Autenticados
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Antecedentes Criminais (PF & TJ)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Certidão Negativa emitida sem apontamentos judiciais (Validade: 6 meses).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Biometria Facial e Checagem de RG</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Correspondência de 99.8% com documento emitido pelo governo. Prova de vida aprovada.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>Registro Profissional / COREN-SP</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Habilitação ativa para administração de medicamentos e cuidados clínicos.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span>CNH e Mobilidade Urbana</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Habilitação ativa categoria B para acompanhamento em deslocamentos ou urgências.
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidential Behavioral Evaluation (Secret Evaluation - Core Business) */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                      Rede Sigilosa de Confiança (Exclusivo Empregadores Auditados)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Oculto para o público em geral
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Relatório confidencial registrado por famílias anteriores após a conclusão formal de contratos. Não visível no perfil público da cuidadora.
                </p>

                {/* Score meters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800">
                  <div className="bg-slate-800/80 p-2 rounded-lg text-center">
                    <span className="text-[10px] text-slate-400 block">Honestidade</span>
                    <span className="text-sm font-bold text-emerald-400">10 / 10</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg text-center">
                    <span className="text-[10px] text-slate-400 block">Pontualidade</span>
                    <span className="text-sm font-bold text-emerald-400">9.9 / 10</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg text-center">
                    <span className="text-[10px] text-slate-400 block">Discrição / Sigilo</span>
                    <span className="text-sm font-bold text-emerald-400">10 / 10</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg text-center">
                    <span className="text-[10px] text-slate-400 block">Reação sob Crise</span>
                    <span className="text-sm font-bold text-emerald-400">9.8 / 10</span>
                  </div>
                </div>

                {/* Secret Note Quote */}
                <div className="p-3 bg-slate-800/90 rounded-lg border border-slate-700 text-[11px] text-slate-200">
                  <span className="font-semibold text-amber-400 block mb-1">
                    Relato confidencial de ex-família contratante (Auditada):
                  </span>
                  <p className="italic">
                    "{activePopupApplicant.confidentialFeedbackSnippet || 'Profissional de conduta impecável. Teve livre trânsito pela casa durante 4 meses sem qualquer desvio ou quebra de confiança. Discrição máxima.'}"
                  </p>
                </div>
              </div>

              {/* Public Reviews summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                    Avaliações Públicas ({activePopupApplicant.reviewCount} serviços concluídos)
                  </h4>
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{activePopupApplicant.rating} de 5.0</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900">Família Albuquerque</span>
                    <span className="text-slate-400">Plantão de Urgência</span>
                  </div>
                  <p className="text-[11px] text-slate-600 italic">
                    "Atendimento exemplar. Extremamente técnica na administração de medicamentos e muito afetuosa."
                  </p>
                </div>
              </div>
            </div>

            {/* Pop-up Footer (Pipeline Action Controls) */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Etapa Atual:</span>
                <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                  {activePopupApplicant.stage.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activePopupApplicant.stage === 'triagem' && (
                  <button
                    onClick={() => handleStageChange(activePopupApplicant.id, 'entrevista')}
                    className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-2xs"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#0a66c2]" /> Agendar Entrevista
                  </button>
                )}

                {(activePopupApplicant.stage === 'triagem' || activePopupApplicant.stage === 'entrevista') && (
                  <button
                    onClick={() => handleStageChange(activePopupApplicant.id, 'proposta')}
                    className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" /> Emitir Proposta & Minuta
                  </button>
                )}

                {activePopupApplicant.stage === 'proposta' && (
                  <button
                    onClick={() => handleStageChange(activePopupApplicant.id, 'contratado')}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar Contratação Formal
                  </button>
                )}

                {activePopupApplicant.contractId && (
                  <button
                    onClick={() => onOpenContractModal(activePopupApplicant.contractId || 'ctr-012')}
                    className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg flex items-center gap-1"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" /> Ver Minuta Digital
                  </button>
                )}

                <button
                  onClick={() => setActivePopupApplicant(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW ANNOUNCEMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  PUBLICAR NOVO ANÚNCIO DE VAGA
                </span>
                <h3 className="font-bold text-sm sm:text-base leading-tight mt-0.5">
                  Criar Vaga para Residência
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Título da Vaga / Anúncio:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cuidadora Diurna Especialista em Parkinson"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#0a66c2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Tipo de Contrato:
                  </label>
                  <select
                    value={newContractType}
                    onChange={(e) => setNewContractType(e.target.value as any)}
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#0a66c2] bg-white"
                  >
                    <option value="diario">Plantão Diário</option>
                    <option value="mensal_fixo">Vaga Mensal CLT</option>
                    <option value="plantao_urgencia">Plantão de Urgência</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Remuneração (R$):
                  </label>
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#0a66c2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Localidade / Bairro:
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#0a66c2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Escala de Trabalho:
                  </label>
                  <input
                    type="text"
                    value={newSchedule}
                    onChange={(e) => setNewSchedule(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#0a66c2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Descrição detalhada das necessidades:
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descreva as condições da residência, rotina do assistido e requisitos esperados..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#0a66c2]"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  type="checkbox"
                  id="urgentCheck"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded text-[#0a66c2] focus:ring-0"
                />
                <label htmlFor="urgentCheck" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Marcar como Plantão de Urgência Prioritário (Notificação no Radar)
                </label>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900">
                Uma aba exclusiva será criada para este anúncio, permitindo acompanhar individualmente os cuidadores que se candidatarem.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg shadow-xs"
                >
                  Publicar Anúncio & Criar Aba
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
