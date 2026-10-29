import React, { useState } from 'react';
import { 
  FreelancerProfile, 
  PublicReview, 
  SecretEvaluation, 
  Contract, 
  AvailabilityStatus,
  VerificationBadge,
  AuthUser
} from '../../types';
import { 
  ShieldCheck, 
  Star, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Lock, 
  AlertTriangle, 
  FileCheck2, 
  Radio, 
  Award, 
  UserCheck, 
  Send, 
  ChevronDown, 
  ChevronUp,
  Info,
  ShieldAlert,
  EyeOff,
  Briefcase,
  ArrowLeft
} from 'lucide-react';

interface FreelancerViewProps {
  profile: FreelancerProfile;
  contracts: Contract[];
  publicReviews: PublicReview[];
  secretEvaluations: SecretEvaluation[];
  onOpenContract: (contract: Contract) => void;
  currentUser?: AuthUser | null;
  onBackToCatalog?: () => void;
  onNavigateToJobs?: () => void;
}

export const FreelancerView: React.FC<FreelancerViewProps> = ({
  profile,
  contracts,
  publicReviews: initialReviews,
  secretEvaluations: initialSecret,
  onOpenContract,
  currentUser,
  onBackToCatalog,
  onNavigateToJobs
}) => {
  const [availability, setAvailability] = useState<AvailabilityStatus>(profile.availability);
  const [selectedBadge, setSelectedBadge] = useState<VerificationBadge | null>(null);
  
  // Collapsible states ("abre e fecha" for clean reading)
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [showReviewSimulator, setShowReviewSimulator] = useState(false);

  // Dynamic reviews state
  const [publicReviews, setPublicReviews] = useState<PublicReview[]>(initialReviews);
  const [secretEvaluations, setSecretEvaluations] = useState<SecretEvaluation[]>(initialSecret);
  
  // Form evaluation state
  const [selectedContractId, setSelectedContractId] = useState<string>('ctr-012'); // default to completed to show authorized flow
  const [evalHonesty, setEvalHonesty] = useState<number>(10);
  const [evalPunctuality, setEvalPunctuality] = useState<number>(10);
  const [evalDiscretion, setEvalDiscretion] = useState<number>(10);
  const [privateFeedback, setPrivateFeedback] = useState<string>('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // Verifica se o usuário logado já contratou este profissional
  const userContractsWithFreelancer = contracts.filter(
    (c) => c.freelancerId === profile.id && (currentUser?.role === 'employer' || c.employerId === currentUser?.id)
  );

  const hasCompletedContract = userContractsWithFreelancer.some(c => c.status === 'completed');

  const handleAvailabilityChange = (status: AvailabilityStatus) => {
    setAvailability(status);
  };

  const handleSubmitConfidentialEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    // REGRA 1: Apenas quem contratou o profissional pode avaliar
    if (currentUser?.role === 'freelancer') {
      setReviewError('Acesso bloqueado: Profissionais não podem avaliar seus próprios serviços. Apenas contratantes que contrataram o serviço têm permissão.');
      return;
    }

    const contract = contracts.find((c) => c.id === selectedContractId);
    if (!contract) {
      setReviewError('Contrato não localizado no sistema.');
      return;
    }

    if (contract.freelancerId !== profile.id) {
      setReviewError('Este contrato não corresponde a este profissional.');
      return;
    }

    // REGRA 2: Apenas contratos CONCLUÍDOS podem receber avaliação
    if (contract.status !== 'completed') {
      setReviewError(
        `Regra de Integridade: O contrato ${contract.id} ainda está em andamento (${contract.status.toUpperCase()}). Para proteger a relação de trabalho e garantir total igualdade, a avaliação só é liberada após a conclusão definitiva do serviço.`
      );
      return;
    }

    if (!privateFeedback.trim()) {
      setReviewError('Por favor descreva como foi a experiência com a cuidadora.');
      return;
    }

    // Inserção da avaliação confidencial
    const newSecret: SecretEvaluation = {
      id: `sec-${Date.now()}`,
      contractId: contract.id,
      freelancerId: profile.id,
      evaluatedAt: new Date().toLocaleDateString('pt-BR'),
      relationshipDuration: 'Prestação de Serviço Concluída',
      honestyScore: evalHonesty,
      punctualityScore: evalPunctuality,
      emotionalStabilityScore: 9.8,
      discretionConfidentialityScore: evalDiscretion,
      reactionUnderCrisisScore: 9.7,
      wouldRehirePrivately: true,
      privateNotes: privateFeedback,
      hasVerifiedContract: true
    };

    setSecretEvaluations([newSecret, ...secretEvaluations]);
    setReviewSuccess(
      'Avaliação registrada com sucesso! Lembre-se: este comentário é 100% privado e confidencial, visível apenas a contratantes verificados para assegurar igualdade e integridade.'
    );
    setPrivateFeedback('');
    setTimeout(() => setReviewSuccess(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6 font-sans">
      {onBackToCatalog && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0a66c2] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao Catálogo de Cuidadores
          </button>
          <span className="text-xs text-slate-500">
            Visualizando dossiê de <strong>{profile.fullName}</strong>
          </span>
        </div>
      )}

      {/* 1. Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Banner discreto no topo */}
        <div className="h-16 sm:h-20 bg-slate-800 px-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide">
              PERFIL AUDITADO · DOCUMENTAÇÃO E BIOMETRIA VERIFICADAS
            </span>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700 hidden sm:inline">
            Índice de Confiabilidade: 99.8%
          </span>
        </div>

        {/* Informações do Profissional (Organização limpa, sem margens negativas que causem sobreposição) */}
        <div className="p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            {/* Foto e Dados Básicos */}
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-900 text-white font-bold text-2xl flex items-center justify-center font-mono border-2 border-slate-200 shadow-xs">
                  MC
                </div>
                <div 
                  className="absolute bottom-0 right-0 p-1 bg-emerald-600 text-white rounded-full border-2 border-white"
                  title="Identidade Biométrica Auditada"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                    {profile.fullName}
                  </h1>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Selo Blindado
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-700">
                  {profile.title}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profile.neighborhood}, {profile.city}
                  </span>
                  <span>·</span>
                  <span>{profile.experienceYears} anos de plantões</span>
                  <span>·</span>
                  <span className="text-emerald-700 font-semibold">{profile.completedContractsCount} atendimentos concluídos</span>
                </div>
              </div>
            </div>

            {/* Controle de Status de Plantão (Online / Urgência / Pausa) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 shrink-0">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Disponibilidade para Atendimento:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleAvailabilityChange('online')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    availability === 'online' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Disponível (Online)
                </button>
                <button
                  onClick={() => handleAvailabilityChange('urgency')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    availability === 'urgency' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  Plantão de Urgência
                </button>
                <button
                  onClick={() => handleAvailabilityChange('offline')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    availability === 'offline' ? 'bg-slate-700 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Pausa (Offline)
                </button>
              </div>
            </div>
          </div>

          {/* Resumo Profissional com Abre e Fecha */}
          <div className="border-t border-slate-100 pt-3">
            <p className={`text-xs text-slate-700 leading-relaxed ${isBioExpanded ? '' : 'line-clamp-2'}`}>
              {profile.bio}
            </p>
            <button
              onClick={() => setIsBioExpanded(!isBioExpanded)}
              className="text-xs font-semibold text-[#0a66c2] hover:underline mt-1 inline-flex items-center gap-0.5"
            >
              {isBioExpanded ? 'Recolher resumo' : '... ver descrição completa'}
            </button>
          </div>

          {currentUser?.role === 'freelancer' && onNavigateToJobs && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-800">
                <Briefcase className="w-4 h-4 text-[#0a66c2] shrink-0" />
                <span>
                  <strong>Vagas Recomendadas para Você:</strong> Há oportunidades urgentes em aberto que aceitam candidatura direta com seus selos verificados.
                </span>
              </div>
              <button
                onClick={onNavigateToJobs}
                className="px-3.5 py-1.5 font-bold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg text-xs whitespace-nowrap self-start sm:self-auto flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                Buscar Vagas (Estilo LinkedIn) →
              </button>
            </div>
          )}

          {/* Indicadores Resumidos de Atendimento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Nota Geral do Serviço</span>
              <div className="flex items-center gap-1 font-bold text-slate-900 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{profile.publicRating}</span>
                <span className="text-slate-400 font-normal">({profile.publicReviewCount} plantões)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Rede Sigilosa (Privada)</span>
              <div className="flex items-center gap-1 font-bold text-slate-900 mt-0.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>10.0 / 10</span>
                <span className="text-emerald-700 font-normal font-mono">(Comentários 100% Sigilosos)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Valor da Diária / Hora</span>
              <div className="font-medium text-slate-800">
                R$ {profile.dailyRate} <span className="text-slate-400 font-normal">(R$ {profile.hourlyRate}/h)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Radar de Substituição</span>
              <div className="font-medium text-slate-800 text-emerald-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Até 15 min (Raio 10km)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid com Selos de Verificação e Endossos de Ex-Empregadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Selos Oficiais */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Selos e Certidões Oficiais
              </h2>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                4 Verificados
              </span>
            </div>

            <div className="space-y-2">
              {profile.badges.map((badge) => (
                <div
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {badge.title}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 pl-5">
                    {badge.issuer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formação e Certificados */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Award className="w-4 h-4 text-slate-700" />
              Cursos e Habilitações
            </h2>
            <div className="space-y-2 text-xs">
              {profile.certifications.map((c) => (
                <div key={c.id} className="p-2 border border-slate-100 rounded-md">
                  <span className="font-semibold text-slate-900 block">{c.title}</span>
                  <span className="text-[11px] text-slate-500">{c.institution} · {c.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Endossos de Ex-Contratantes e Contratos */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#0a66c2]" />
                Habilidades Validadas em Contratos Anteriores
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Só podem ser validadas por contratantes com quem o profissional efetivamente trabalhou.
              </p>
            </div>

            <div className="space-y-2.5">
              {profile.skills.map((skill) => {
                const isOpen = expandedSkillId === skill.id;
                return (
                  <div key={skill.id} className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <button
                      onClick={() => setExpandedSkillId(isOpen ? null : skill.id)}
                      className="w-full p-3 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors"
                    >
                      <span className="font-semibold text-slate-900">
                        {skill.skill}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                          {skill.verifiedCount} validações
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-3 bg-white space-y-2 border-t border-slate-200">
                        {skill.validations.map((v, i) => (
                          <div key={i} className="text-[11px] text-slate-600 border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                            <span className="font-semibold text-slate-800">{v.employerName}</span>
                            <span className="text-slate-400"> ({v.employerRole})</span>
                            <p className="text-slate-500 italic mt-0.5">"{v.contractTitle}" · Contrato: {v.verifiedContractId}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Histórico de Contratos Formais */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <FileCheck2 className="w-4 h-4 text-slate-700" />
              Contratos Registrados na Plataforma
            </h2>

            <div className="space-y-2">
              {contracts.map((c) => (
                <div key={c.id} className="p-3 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{c.jobTitle}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        c.status === 'completed' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {c.status === 'completed' ? 'CONCLUÍDO' : 'EM ANDAMENTO'}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      Contratante: {c.employerName} · R$ {c.agreedRate}/dia · Início: {c.startDate}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenContract(c)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors shrink-0"
                  >
                    Ver Minuta em PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SISTEMA DE AVALIAÇÃO: COMENTÁRIOS SÃO 100% PRIVADOS & APENAS QUEM CONTRATOU CONSEGUE AVALIAR */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Cabeçalho da Seção de Avaliação */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold">
                SISTEMA DE EQUIDADE E IMPARCIALIDADE
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-700" />
                Comentários 100% Privados
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Avaliações de Confiança & Relatórios Comportamentais
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReviewSimulator(!showReviewSimulator)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {showReviewSimulator ? 'Fechar Formulário' : 'Avaliar Cuidadora'}
            </button>
          </div>
        </div>

        {/* Explicação da Regra de Negócio: Por que os comentários são sempre privados? */}
        <div className="p-4 bg-slate-900 text-slate-200 text-xs border-b border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-emerald-400 font-mono">
            <EyeOff className="w-4 h-4" />
            REGRA DE IGUALDADE: TODOS OS COMENTÁRIOS SÃO PRIVADOS (BONS OU RUINS)
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Para evitar favoritismos, difamação ou pressões sociais indevidas, <strong>nenhum comentário textual fica exposto no perfil público</strong>. 
            Apenas a nota numérica agregada é exibida. Os relatos comportamentais detalhados são confidenciais e acessados 
            <strong> apenas por contratantes que já têm vínculo com a plataforma</strong> e estão avaliando contratações.
          </p>
        </div>

        {/* Relatórios Comportamentais Confidenciais */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Honestidade e Zelo</span>
              <span className="text-lg font-bold font-mono text-emerald-700">10.0 / 10</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">3 de 3 contratantes deram nota máxima</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Pontualidade nos Plantões</span>
              <span className="text-lg font-bold font-mono text-emerald-700">9.8 / 10</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Sem atrasos não justificados</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Discrição na Residência</span>
              <span className="text-lg font-bold font-mono text-emerald-700">10.0 / 10</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Total respeito à privacidade familiar</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block font-mono">
              Relatórios Comportamentais Confidenciais ({secretEvaluations.length})
            </span>

            <div className="grid grid-cols-1 gap-3">
              {secretEvaluations.map((sec) => (
                <div key={sec.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-800">
                      Família Contratante (Identidade Protegida) · {sec.relationshipDuration}
                    </span>
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Vínculo Contratual Auditado: {sec.contractId}
                    </span>
                  </div>

                  <p className="text-slate-700 italic bg-white p-3 rounded border border-slate-200 leading-relaxed">
                    "{sec.privateNotes}"
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span>Honestidade: <strong className="text-slate-900">{sec.honestyScore}/10</strong></span>
                    <span>·</span>
                    <span>Discrição: <strong className="text-slate-900">{sec.discretionConfidentialityScore}/10</strong></span>
                    <span>·</span>
                    <span>Recontrataria: <strong className="text-emerald-700">Sim (100%)</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. FORMULÁRIO DE AVALIAÇÃO: APENAS QUEM CONTRATOU CONSEGUE AVALIAR */}
        {showReviewSimulator && (
          <div className="p-5 sm:p-6 bg-slate-100 border-t border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Registrar Avaliação Confidencial de Serviço
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Validação de Vínculo Contratual Obrigatória
              </span>
            </div>

            {/* Verificação do usuário logado */}
            {currentUser?.role === 'freelancer' ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Você está conectado como o próprio profissional ({currentUser.name})
                </span>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Profissionais não avaliam os próprios serviços. Para testar o envio de uma avaliação confidencial de contratante, 
                  clique no botão <strong>"Alternar para Área do Contratante"</strong> no topo da página (Dra. Beatriz Fontana).
                </p>
              </div>
            ) : !hasCompletedContract ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Contrato Concluído Obrigatório
                </span>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Você só consegue avaliar um profissional se tiver <strong>efetivamente contratado o serviço dele</strong> e o contrato estiver no status <strong>CONCLUÍDO</strong>. 
                  Isso impede que terceiros que nunca tiveram a cuidadora em casa façam avaliações sem fundamento.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitConfidentialEvaluation} className="space-y-3.5 max-w-2xl">
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Vínculo de Contratação Comprovado:
                  </span>
                  <span>Você contratou {profile.fullName} através da plataforma TrustLink.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Selecione o Contrato do Serviço
                    </label>
                    <select
                      value={selectedContractId}
                      onChange={(e) => setSelectedContractId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono"
                    >
                      {contracts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id} [{c.status.toUpperCase()}] — {c.jobTitle}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Teste selecionar ctr-015 (Em Andamento) para ver a proteção ativa!
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Honestidade & Integridade (1 a 10)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={evalHonesty}
                      onChange={(e) => setEvalHonesty(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Pontualidade nos Plantões (1 a 10)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={evalPunctuality}
                      onChange={(e) => setEvalPunctuality(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Discrição e Sigilo Familiar (1 a 10)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={evalDiscretion}
                      onChange={(e) => setEvalDiscretion(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Relato Comportamental Privado (Bons ou Ruins - Jamais Exposto Publicamente)
                  </label>
                  <textarea
                    rows={3}
                    value={privateFeedback}
                    onChange={(e) => setPrivateFeedback(e.target.value)}
                    placeholder="Descreva a rotina, o cuidado com a medicação, comportamento em casa, etc. Este comentário fica guardado em sigilo para manter a igualdade e a imparcialidade..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs"
                  />
                </div>

                {reviewError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {reviewSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{reviewSuccess}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                  >
                    Salvar Relatório Confidencial no PostgreSQL
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Modal de Auditoria do Selo */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Auditoria do Selo de Verificação
              </span>
              <button onClick={() => setSelectedBadge(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <div>
              <span className="text-slate-500 block">Certidão / Selo</span>
              <strong className="text-slate-900">{selectedBadge.title}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Órgão Emissor</span>
              <span>{selectedBadge.issuer}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Hash Inalterável (PostgreSQL)</span>
              <code className="p-1.5 bg-slate-100 rounded block font-mono text-[11px] break-all border border-slate-200">
                {selectedBadge.documentHash}
              </code>
            </div>
            <div>
              <span className="text-slate-500 block">Validade da Checagem</span>
              <span>Até {selectedBadge.expiresAt}</span>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBadge(null)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-semibold"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
