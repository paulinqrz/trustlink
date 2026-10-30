import React, { useMemo, useState } from 'react';
import { JobAnnouncement, AuthUser, FreelancerProfile } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/ToastContext';
import {
  Search,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Share2,
  ChevronRight,
  AlertCircle,
  Building,
  Sparkles,
  Send,
} from 'lucide-react';

interface LinkedInJobsViewProps {
  currentUser: AuthUser;
  userProfile?: FreelancerProfile;
  jobAnnouncements: JobAnnouncement[];
  appliedJobIds: string[];
  onApplyJob: (jobId: string, note: string) => void;
}

export const LinkedInJobsView: React.FC<LinkedInJobsViewProps> = ({
  currentUser,
  userProfile,
  jobAnnouncements,
  appliedJobIds,
  onApplyJob,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'urgency' | 'mensal' | 'diario' | 'nearby'
  >('all');
  const [selectedJobId, setSelectedJobId] = useState<string>(
    jobAnnouncements.length > 0 ? jobAnnouncements[0].id : ''
  );
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyNote, setApplyNote] = useState('');
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return jobAnnouncements.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.employerName.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (selectedFilter === 'urgency') return job.urgency;
      if (selectedFilter === 'mensal') return job.contractType === 'mensal_fixo';
      if (selectedFilter === 'diario')
        return job.contractType === 'diario' || job.contractType === 'plantao_urgencia';
      if (selectedFilter === 'nearby') return job.distanceKm <= 2.5;

      return true;
    });
  }, [jobAnnouncements, searchQuery, selectedFilter]);

  // Checklist 2.14: painel de detalhe reflete apenas vagas presentes na lista filtrada
  const selectedJob = useMemo(
    () => filteredJobs.find((j) => j.id === selectedJobId) || filteredJobs[0] || null,
    [filteredJobs, selectedJobId]
  );

  const isSelectedApplied = selectedJob ? appliedJobIds.includes(selectedJob.id) : false;
  const isSelectedSaved = selectedJob ? savedJobIds.includes(selectedJob.id) : false;

  const handleToggleSave = (id: string) => {
    setSavedJobIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleShareJob = (job: JobAnnouncement) => {
    const url = `${window.location.origin}/jobs?job=${encodeURIComponent(job.id)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Link direto da vaga copiado para a área de transferência!', 'info');
    }
  };

  const handleConfirmApplication = () => {
    if (!selectedJob) return;
    onApplyJob(
      selectedJob.id,
      applyNote.trim() || 'Candidatura enviada com perfil verificado na Verilar.'
    );
    setShowApplyModal(false);
    setApplyNote('');
    showToast(`Candidatura enviada com sucesso para "${selectedJob.title}"!`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 font-sans">
      {/* LinkedIn-style Search and Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 mb-4 shadow-2xs transition-colors">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-2 w-full">
            <div className="relative flex-1 w-full">
              <label htmlFor="jobs-search" className="sr-only">
                Pesquisar vagas
              </label>
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
              <input
                id="jobs-search"
                type="text"
                placeholder="Pesquisar por cargo, especialidade (ex: Alzheimer, Cuidadora, Enfermagem)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div className="relative sm:w-64 w-full">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                readOnly
                aria-label="Localização da busca"
                value="São Paulo, SP (Raio 10km)"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-default"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer tabular-nums ${
                selectedFilter === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Todas ({jobAnnouncements.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('urgency')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedFilter === 'urgency'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/70 hover:bg-amber-50 dark:hover:bg-amber-950/60'
              }`}
            >
              <Sparkles className="w-3 h-3" /> Plantões Urgentes
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('mensal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                selectedFilter === 'mensal'
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Vagas Mensais Fixas
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('nearby')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                selectedFilter === 'nearby'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Mais Próximas (&le; 2,5 km)
            </button>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Você está no <strong className="text-slate-900 dark:text-white">Mural de Vagas de Famílias</strong>. Candidate-se em 1 clique com seus selos Verilar.
            </span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            0% Comissão sobre o Serviço
          </span>
        </div>
      </div>

      {/* Main 2-Pane LinkedIn Jobs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between px-1 text-xs text-slate-600 dark:text-slate-400 font-medium tabular-nums">
            <span>{filteredJobs.length} vaga(s) encontrada(s) em São Paulo</span>
            <span>Mais recentes</span>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {filteredJobs.length === 0 ? (
              <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-600 dark:text-slate-400">
                Nenhuma vaga encontrada com os critérios pesquisados.
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = selectedJob && selectedJob.id === job.id;
                const isApplied = appliedJobIds.includes(job.id);

                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedJobId(job.id)}
                    className={`w-full p-4 rounded-xl border text-left cursor-pointer transition-all duration-150 relative ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 border-brand dark:border-sky-500 ring-2 ring-brand/20 dark:ring-sky-500/20 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {job.urgency && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/70 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" /> Urgente
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-sky-950/60 border border-blue-100 dark:border-sky-800/70 text-brand dark:text-sky-400 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                        <Building className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0 pr-12">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {job.title}
                        </h3>

                        <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1 font-medium">
                          <span>{job.employerName}</span>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        </div>

                        <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                            {job.location}
                          </span>
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 tabular-nums">
                          <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {job.rateDescription}
                          </span>

                          <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 px-2 py-0.5 rounded font-semibold">
                            Candidatura Fácil
                          </span>

                          {isApplied && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Candidatado
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 flex items-center justify-between tabular-nums">
                          <span>Publicada {job.postedAt}</span>
                          <span>{job.applicants.length} candidaturas</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Sticky Job Details */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto transition-colors">
          {selectedJob ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    {selectedJob.urgency && (
                      <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/70 mb-2">
                        Plantão Prioritário / Cobertura Rápida
                      </span>
                    )}
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                      {selectedJob.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-1.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedJob.employerName}</span>
                      <span>·</span>
                      <span>{selectedJob.location}</span>
                      <span>·</span>
                      <span>Publicado {selectedJob.postedAt}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 px-3 py-1.5 rounded-lg w-fit">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{selectedJob.employerType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSave(selectedJob.id)}
                      title={isSelectedSaved ? 'Remover dos salvos' : 'Salvar vaga'}
                      aria-label={isSelectedSaved ? 'Remover dos salvos' : 'Salvar vaga'}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                        isSelectedSaved
                          ? 'bg-blue-50 dark:bg-sky-950/60 border-brand dark:border-sky-500 text-brand dark:text-sky-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareJob(selectedJob)}
                      title="Copiar link da vaga"
                      aria-label="Copiar link da vaga"
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs tabular-nums">
                  <div className="bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-semibold block">
                      Remuneração
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">
                      {selectedJob.rateDescription}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-semibold block">
                      Escala / Regime
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block line-clamp-1">
                      {selectedJob.workSchedule}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-semibold block">
                      Candidaturas
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {selectedJob.applicants.length} profissionais interessados
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
                  {isSelectedApplied ? (
                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Candidatura Enviada com Sucesso</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(true)}
                      className="px-6 py-3 text-sm font-bold text-white bg-brand hover:bg-brand-hover rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Candidatar-se à Vaga (Candidatura Fácil)</span>
                    </button>
                  )}

                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    Gera minuta de contrato e sigilo ao avançar para proposta.
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/60 dark:bg-sky-950/50 border border-blue-200 dark:border-sky-800/70 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-brand dark:text-sky-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Alta Compatibilidade com seu Perfil ({currentUser.name})</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Seus {userProfile ? userProfile.badges.length : 4} selos verificados serão encaminhados diretamente para análise da família contratante.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Sobre a Vaga e a Assistência
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Responsabilidades Principais
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {selectedJob.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-brand dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Selos & Requisitos de Confiança Exigidos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.requiredBadges.map((badge, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs px-3 py-1.5 rounded-lg font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Benefícios & Condições Oferecidas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  {selectedJob.benefits.map((benefit, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950/70 rounded-lg border border-slate-100 dark:border-slate-800"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-600 dark:text-slate-400">
              Nenhuma vaga corresponde aos filtros ativos no momento.
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <Modal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          title={`Candidatar-se: ${selectedJob.title}`}
          maxWidthClass="max-w-lg"
          headerBadge={
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
              CANDIDATURA DIRETA VERILAR
            </span>
          }
          footer={
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmApplication}
                className="px-5 py-2 text-xs font-bold text-white bg-brand hover:bg-brand-hover rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Confirmar e Enviar Candidatura
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold">
                SEU PERFIL VERIFICADO EM ANEXO
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.avatarInitials}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{currentUser.name}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">{currentUser.title}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap gap-1.5">
                {(userProfile?.badges ?? []).map((b) => (
                  <span
                    key={b.id}
                    className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded"
                  >
                    ✓ {b.title}
                  </span>
                ))}
                {userProfile && (
                  <span className="text-[10px] font-semibold bg-blue-50 dark:bg-sky-950/60 text-blue-800 dark:text-sky-300 border border-blue-200 dark:border-sky-800 px-2 py-0.5 rounded tabular-nums">
                    ★ {userProfile.publicRating} ({userProfile.publicReviewCount} avaliações)
                  </span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="apply-note" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Mensagem curta ou apresentação para {selectedJob.employerName} (Opcional):
              </label>
              <textarea
                id="apply-note"
                rows={3}
                value={applyNote}
                onChange={(e) => setApplyNote(e.target.value)}
                placeholder="Ex: Olá! Tenho experiência com o perfil solicitado, pontualidade rigorosa e disponibilidade imediata..."
                className="w-full p-3 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 rounded-lg text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                Ao enviar, a família receberá seu dossiê verificado no painel dela. Seus dados de contato pessoal só serão liberados após aceite mútuo de entrevista.
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
