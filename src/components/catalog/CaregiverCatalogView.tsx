import React, { useState } from 'react';
import { FreelancerProfile, AuthUser } from '../../types';
import { sampleCaregiverProfiles } from '../../data/mockData';
import { TextStream } from '../common/TextStream';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Radio, 
  UserCheck, 
  Award, 
  HeartHandshake, 
  Send, 
  Bookmark, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface CaregiverCatalogViewProps {
  currentUser?: AuthUser | null;
  onSelectCaregiver: (profile: FreelancerProfile) => void;
  onOpenProposal: (candidateName: string, role: string, rate: number) => void;
}

export const CaregiverCatalogView: React.FC<CaregiverCatalogViewProps> = ({
  currentUser,
  onSelectCaregiver,
  onOpenProposal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyUrgency, setOnlyUrgency] = useState<boolean>(false);
  const [onlyCouncilBadge, setOnlyCouncilBadge] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(['fl-101']);
  const [expandedBioId, setExpandedBioId] = useState<string | null>(null);

  const categories = [
    { key: 'all', label: 'Todos os Profissionais', count: sampleCaregiverProfiles.length },
    { key: 'Cuidadora de Idosos', label: 'Cuidado de Idosos & Alzheimer', count: 2 },
    { key: 'Técnica de Enfermagem', label: 'Enfermagem & Pós-Cirúrgico', count: 1 },
    { key: 'Babá / Cuidadora Infantil', label: 'Babás & Neonatal', count: 1 },
    { key: 'Governanta Doméstica', label: 'Governança & Gestão', count: 1 },
    { key: 'Pet Sitter Especializado', label: 'Pet Care Veterinário', count: 1 },
  ];

  const filteredCaregivers = sampleCaregiverProfiles.filter(caregiver => {
    // Search
    const matchesSearch = 
      caregiver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caregiver.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caregiver.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caregiver.bio.toLowerCase().includes(searchTerm.toLowerCase());

    // Category
    const matchesCategory = selectedCategory === 'all' || caregiver.category === selectedCategory;

    // Urgency filter
    const matchesUrgency = !onlyUrgency || caregiver.availability === 'urgency';

    // Council filter (COREN or CRMV)
    const matchesCouncil = !onlyCouncilBadge || caregiver.badges.some(b => b.type === 'nursing_council');

    return matchesSearch && matchesCategory && matchesUrgency && matchesCouncil;
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 font-sans">
      {/* Hero Header with requested TextStream reel animation */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-[#0a66c2]" />
              Catálogo Oficial de Profissionais Verificados
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Banco de Cuidadores & Talentos de Confiança
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
              Navegue pelos profissionais auditados da TrustLink. Todos possuem antecedentes checados 
              pela Polícia Federal, checagem facial biométrica e acesso liberado à <strong>Rede Sigilosa de Avaliações</strong> para contratantes com residência verificada.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                100% Antecedentes Criminais Limpos
              </span>
              <span className="flex items-center gap-1.5 text-blue-800 font-semibold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                4 Profissionais no Radar de Urgência
              </span>
            </div>
          </div>

          {/* Interactive Reel Animation requested by user */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/80 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-2xs">
            <TextStream
              items={[
                "Cuidados Geriátricos & Alzheimer",
                "Técnicos de Enfermagem Domiciliar",
                "Acompanhamento Pós-Cirúrgico",
                "Babás Especialistas em Neonatais",
                "Governança & Gestão Residencial",
                "Pet Sitter com Formação Veterinária"
              ]}
              prefix="Especialidades Disponíveis"
              height="150px"
              fontSize="clamp(1.15rem, 2.2vw, 1.45rem)"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Role a página para acelerar a rolagem contínua
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        {/* Search input & direct toggles */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input 
              type="text"
              placeholder="Buscar por nome, especialidade, bairro ou procedimento (ex: curativo, Alzheimer, Moema)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setOnlyUrgency(!onlyUrgency)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                onlyUrgency 
                  ? 'bg-amber-500 text-white border-amber-600' 
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Plantão Urgência Ativo
            </button>

            <button
              onClick={() => setOnlyCouncilBadge(!onlyCouncilBadge)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                onlyCouncilBadge 
                  ? 'bg-emerald-700 text-white border-emerald-800' 
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Com COREN / CRMV
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat.key
                  ? 'bg-[#0a66c2] text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Exibindo <strong>{filteredCaregivers.length}</strong> cuidadores e especialistas disponíveis em São Paulo
        </span>
        <span className="flex items-center gap-1 text-slate-600">
          <Info className="w-3.5 h-3.5 text-[#0a66c2]" />
          Clique em <strong>Ver Perfil Completo</strong> para consultar o dossiê e a Rede Sigilosa
        </span>
      </div>

      {/* Caregiver Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCaregivers.map((caregiver) => {
          const isFav = favorites.includes(caregiver.id);
          const isBioExpanded = expandedBioId === caregiver.id;

          return (
            <div 
              key={caregiver.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-[#0a66c2] transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header: Avatar, Name, Availability, Favorite */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0 relative">
                      {caregiver.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[#0a66c2] transition-colors">
                          {caregiver.fullName}
                        </h3>
                        <span title="Verificado TrustLink">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {caregiver.title}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleFavorite(caregiver.id, e)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isFav 
                        ? 'text-amber-500 bg-amber-50 border-amber-200' 
                        : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-slate-600'
                    }`}
                    title={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                  >
                    <Bookmark className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Location and Availability Badge */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {caregiver.neighborhood}
                  </span>

                  {caregiver.availability === 'urgency' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      <Radio className="w-3 h-3 text-amber-600 animate-pulse" />
                      Plantão Urgente (10km)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Disponível
                    </span>
                  )}
                </div>

                {/* Metrics: Rating, Experience, Rates */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Avaliação Pública</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-slate-900">{caregiver.publicRating}</span>
                      <span className="text-slate-500">({caregiver.completedContractsCount} plantões)</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Valor de Referência</span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      R$ {caregiver.dailyRate}<span className="text-[11px] font-normal text-slate-500">/diária</span>
                    </div>
                  </div>
                </div>

                {/* Badges List */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Selos de Integridade Auditados
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {caregiver.badges.map((badge) => (
                      <span 
                        key={badge.id}
                        className="text-[11px] font-medium text-emerald-800 bg-emerald-50/80 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        {badge.title.replace(' Verificados', '').replace(' Regularizada', '')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio Snippet */}
                <div className="text-xs text-slate-600 leading-relaxed">
                  <p className={isBioExpanded ? '' : 'line-clamp-2'}>
                    {caregiver.bio}
                  </p>
                  {caregiver.bio.length > 90 && (
                    <button
                      onClick={() => setExpandedBioId(isBioExpanded ? null : caregiver.id)}
                      className="text-[11px] font-semibold text-[#0a66c2] hover:underline mt-1 block"
                    >
                      {isBioExpanded ? 'Recolher resumo' : 'Ler mais...'}
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => onSelectCaregiver(caregiver)}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                  Ver Perfil Completo
                </button>

                <button
                  onClick={() => onOpenProposal(caregiver.fullName, caregiver.title, caregiver.dailyRate)}
                  className="py-2 px-3 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  title="Emitir proposta de plantão formal"
                >
                  <Send className="w-3.5 h-3.5" />
                  Contratar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCaregivers.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
          <p className="text-slate-500 text-sm">
            Nenhum cuidador encontrado com os filtros selecionados.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setOnlyUrgency(false);
              setOnlyCouncilBadge(false);
            }}
            className="text-xs font-semibold text-[#0a66c2] underline hover:text-[#004182]"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </div>
  );
};
