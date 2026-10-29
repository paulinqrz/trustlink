import React, { useState } from 'react';
import { JobAnnouncement, AuthUser } from '../../types';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  Bookmark, 
  Share2, 
  Clock, 
  DollarSign, 
  Award, 
  Users, 
  ChevronRight, 
  AlertCircle,
  FileText,
  Building,
  Sparkles,
  Send,
  X
} from 'lucide-react';

interface LinkedInJobsViewProps {
  currentUser: AuthUser;
  jobAnnouncements: JobAnnouncement[];
  appliedJobIds: string[];
  onApplyJob: (jobId: string, note: string) => void;
  onOpenContractMinuta?: (role: string) => void;
}

export const LinkedInJobsView: React.FC<LinkedInJobsViewProps> = ({
  currentUser,
  jobAnnouncements,
  appliedJobIds,
  onApplyJob,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'urgency' | 'mensal' | 'diario' | 'nearby'>('all');
  const [selectedJobId, setSelectedJobId] = useState<string>(
    jobAnnouncements.length > 0 ? jobAnnouncements[0].id : ''
  );
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyNote, setApplyNote] = useState('');
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [applySuccessToast, setApplySuccessToast] = useState<string | null>(null);

  // Filter jobs
  const filteredJobs = jobAnnouncements.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.employerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'urgency') return job.urgency;
    if (selectedFilter === 'mensal') return job.contractType === 'mensal_fixo';
    if (selectedFilter === 'diario') return job.contractType === 'diario' || job.contractType === 'plantao_urgencia';
    if (selectedFilter === 'nearby') return job.location.includes('1.') || job.location.includes('2.');

    return true;
  });

  const selectedJob = jobAnnouncements.find(j => j.id === selectedJobId) || filteredJobs[0] || jobAnnouncements[0];
  const isSelectedApplied = selectedJob ? appliedJobIds.includes(selectedJob.id) : false;
  const isSelectedSaved = selectedJob ? savedJobIds.includes(selectedJob.id) : false;

  const handleToggleSave = (id: string) => {
    setSavedJobIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleConfirmApplication = () => {
    if (!selectedJob) return;
    onApplyJob(selectedJob.id, applyNote || 'Candidatura enviada com o perfil verificado TrustLink.');
    setShowApplyModal(false);
    setApplyNote('');
    setApplySuccessToast(`Candidatura enviada com sucesso para: ${selectedJob.title}!`);
    setTimeout(() => setApplySuccessToast(null), 4500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 font-sans">
      {/* Toast Notification */}
      {applySuccessToast && (
        <div className="mb-4 bg-emerald-900 text-white text-xs px-4 py-3 rounded-xl shadow-lg flex items-center justify-between border border-emerald-700 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{applySuccessToast}</span>
          </div>
          <button 
            onClick={() => setApplySuccessToast(null)} 
            className="text-emerald-300 hover:text-white text-sm ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* LinkedIn-style Search and Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 mb-4 shadow-2xs">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-2 w-full">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Pesquisar por cargo, especialidade (ex: Alzheimer, Cuidadora, Enfermagem)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] bg-slate-50/50"
              />
            </div>
            <div className="relative sm:w-64 w-full">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                readOnly
                value="São Paulo, SP (Raio 10km)"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-100 text-slate-600 font-medium cursor-default"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors whitespace-nowrap ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Todas ({jobAnnouncements.length})
            </button>
            <button
              onClick={() => setSelectedFilter('urgency')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors whitespace-nowrap flex items-center gap-1 ${
                selectedFilter === 'urgency'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
              }`}
            >
              <Sparkles className="w-3 h-3" /> Plantões Urgentes
            </button>
            <button
              onClick={() => setSelectedFilter('mensal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors whitespace-nowrap ${
                selectedFilter === 'mensal'
                  ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Vagas Mensais Fixas
            </button>
            <button
              onClick={() => setSelectedFilter('nearby')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors whitespace-nowrap ${
                selectedFilter === 'nearby'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Mais Próximas (&lt; 2km)
            </button>
          </div>
        </div>

        {/* Notice of candidate capability */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Você está na <strong>Visão de Candidatura de Empregos</strong>. Aqui você visualiza oportunidades de famílias verificadas e pode se <strong>candidatar com um clique</strong>.
            </span>
          </div>
          <span className="text-slate-400 font-medium hidden sm:inline">
            Interface no formato LinkedIn Vagas
          </span>
        </div>
      </div>

      {/* Main 2-Pane LinkedIn Jobs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Pane: Job Opportunities List (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
            <span>{filteredJobs.length} vagas encontradas em São Paulo</span>
            <span>Mais recentes</span>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {filteredJobs.length === 0 ? (
              <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Nenhuma vaga encontrada com os critérios pesquisados.
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = selectedJob && selectedJob.id === job.id;
                const isApplied = appliedJobIds.includes(job.id);

                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-150 relative ${
                      isSelected
                        ? 'bg-white border-[#0a66c2] ring-2 ring-[#0a66c2]/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    {job.urgency && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" /> Urgente
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-[#0a66c2] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                        <Building className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0 pr-12">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                          {job.title}
                        </h3>

                        <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1 font-medium">
                          <span>{job.employerName}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </div>

                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {job.location}
                          </span>
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {job.rateDescription}
                          </span>

                          <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                            Candidatura Fácil
                          </span>

                          {isApplied && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Candidatado
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                          <span>Publicada {job.postedAt}</span>
                          <span>{job.applicants.length} candidaturas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Sticky Job Details Pane (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto">
          {selectedJob ? (
            <div className="space-y-6">
              {/* Job Header */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {selectedJob.urgency && (
                      <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 mb-2">
                        Plantão Prioritário / Cobertura Rápida
                      </span>
                    )}
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                      {selectedJob.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1.5">
                      <span className="font-semibold text-slate-800">{selectedJob.employerName}</span>
                      <span>·</span>
                      <span className="text-slate-500">{selectedJob.location}</span>
                      <span>·</span>
                      <span className="text-slate-400">Publicado {selectedJob.postedAt}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-emerald-700 font-semibold bg-emerald-50/70 border border-emerald-200 px-3 py-1.5 rounded-lg w-fit">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{selectedJob.employerType}</span>
                    </div>
                  </div>

                  {/* Bookmark and Share */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleSave(selectedJob.id)}
                      title={isSelectedSaved ? 'Remover dos salvos' : 'Salvar vaga'}
                      className={`p-2 rounded-lg border transition-colors ${
                        isSelectedSaved
                          ? 'bg-blue-50 border-[#0a66c2] text-[#0a66c2]'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      title="Compartilhar vaga"
                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Key Job Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Remuneração</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedJob.rateDescription}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Escala / Regime</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block line-clamp-1">{selectedJob.workSchedule}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Candidaturas</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {selectedJob.applicants.length} profissionais interessados
                    </span>
                  </div>
                </div>

                {/* Action Area: Apply Button (Caregiver can only apply) */}
                <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
                  {isSelectedApplied ? (
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Candidatura Enviada com Sucesso</span>
                      <span className="text-emerald-600 text-xs font-normal">
                        (Seu dossiê e selos já foram entregues ao contratante)
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="px-6 py-3 text-sm font-bold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>Candidatar-se à Vaga (Candidatura Fácil)</span>
                    </button>
                  )}

                  <span className="text-[11px] text-slate-400">
                    Gera minuta de contrato e sigilo automaticamente ao ser aprovado.
                  </span>
                </div>
              </div>

              {/* Match Card with Candidate Profile */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#0a66c2]">
                  <Sparkles className="w-4 h-4" />
                  <span>Alta Compatibilidade com seu Perfil ({currentUser.name})</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Seus selos de <strong>Antecedentes Criminais da PF</strong>, <strong>Biometria Facial</strong> e <strong>Registro COREN</strong> correspondem a 100% das exigências solicitadas por esta família.
                </p>
              </div>

              {/* Job Description */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sobre a Vaga e a Assistência
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              {/* Responsibilities */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Responsabilidades Principais
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {selectedJob.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-[#0a66c2] shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Badges */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Selos & Requisitos de Confiança Exigidos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.requiredBadges.map((badge, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-lg font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Benefícios & Condições Oferecidas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {selectedJob.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* About the Employer */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Sobre a Residência Contratante
                </span>
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Building className="w-4 h-4 text-slate-600" />
                  <span>{selectedJob.employerName}</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Membro auditado da TrustLink desde 2024. Histórico com 100% de pontualidade de pagamentos e ambiente familiar aprovado por outros profissionais cadastrados.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Selecione uma vaga à esquerda para visualizar todos os detalhes.
            </div>
          )}
        </div>
      </div>

      {/* Application Modal (Candidatura Fácil) */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  CANDIDATURA FÁCIL TRUSTLINK
                </span>
                <h3 className="font-bold text-sm sm:text-base leading-tight mt-0.5">
                  Candidatar-se: {selectedJob.title}
                </h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
              {/* Profile being sent */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  SEU PERFIL VERIFICADO EM ANEXO
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                    {currentUser.avatarInitials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{currentUser.name}</h4>
                    <p className="text-slate-500 text-[11px]">{currentUser.title}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                    ✓ Antecedentes Criminais PF
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                    ✓ Biometria Facial 99.8%
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                    ✓ Registro COREN Ativo
                  </span>
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                    ★ 4.96 (14 avaliações)
                  </span>
                </div>
              </div>

              {/* Note for the employer */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Mensagem curta ou apresentação para {selectedJob.employerName} (Opcional):
                </label>
                <textarea
                  rows={3}
                  value={applyNote}
                  onChange={(e) => setApplyNote(e.target.value)}
                  placeholder="Ex: Olá Dra. Beatriz! Tenho experiência com o perfil solicitado, pontualidade rigorosa e disponibilidade imediata..."
                  className="w-full p-3 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Ao enviar, a família receberá seu dossiê verificado no painel dela. Seus dados de contato pessoal só serão liberados após aceite mútuo de conversa ou entrevista.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmApplication}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Confirmar e Enviar Candidatura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
