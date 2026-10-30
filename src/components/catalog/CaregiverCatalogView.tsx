import React, { useMemo, useState } from 'react';
import { FreelancerProfile } from '../../types';
import { getInitials } from '../../services/trustlinkService';
import { TextStream } from '../common/TextStream';
import {
  ShieldCheck,
  Search,
  Star,
  MapPin,
  CheckCircle2,
  Radio,
  UserCheck,
  Award,
  Send,
  Bookmark,
  Info,
} from 'lucide-react';

const CATALOG_SPECIALTIES = [
  'Cuidados Geriátricos & Alzheimer',
  'Técnicos de Enfermagem Domiciliar',
  'Acompanhamento Pós-Cirúrgico',
  'Babás Especialistas em Neonatais',
  'Governança & Gestão Residencial',
  'Pet Sitter com Formação Veterinária',
];

interface CaregiverCatalogViewProps {
  profiles: FreelancerProfile[];
  onSelectCaregiver: (profile: FreelancerProfile) => void;
  onOpenProposal: (
    freelancerId: string,
    candidateName: string,
    role: string,
    rate: number
  ) => void;
}

export const CaregiverCatalogView: React.FC<CaregiverCatalogViewProps> = ({
  profiles,
  onSelectCaregiver,
  onOpenProposal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyUrgency, setOnlyUrgency] = useState<boolean>(false);
  const [onlyCouncilBadge, setOnlyCouncilBadge] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(['fl-101']);
  const [expandedBioId, setExpandedBioId] = useState<string | null>(null);

  const urgencyCount = useMemo(
    () => profiles.filter((p) => p.availability === 'urgency').length,
    [profiles]
  );

  const categories = useMemo(() => {
    const countCat = (catKey: string) =>
      profiles.filter((p) => p.category === catKey).length;

    return [
      { key: 'all', label: 'Todos os Profissionais', count: profiles.length },
      {
        key: 'Cuidadora de Idosos',
        label: 'Cuidado de Idosos & Alzheimer',
        count: countCat('Cuidadora de Idosos'),
      },
      {
        key: 'Técnica de Enfermagem',
        label: 'Enfermagem & Pós-Cirúrgico',
        count: countCat('Técnica de Enfermagem'),
      },
      {
        key: 'Babá / Cuidadora Infantil',
        label: 'Babás & Neonatal',
        count: countCat('Babá / Cuidadora Infantil'),
      },
      {
        key: 'Governanta Doméstica',
        label: 'Governança & Gestão',
        count: countCat('Governanta Doméstica'),
      },
      {
        key: 'Pet Sitter Especializado',
        label: 'Pet Care Veterinário',
        count: countCat('Pet Sitter Especializado'),
      },
    ];
  }, [profiles]);

  const filteredCaregivers = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return profiles.filter((caregiver) => {
      const matchesSearch =
        caregiver.fullName.toLowerCase().includes(query) ||
        caregiver.title.toLowerCase().includes(query) ||
        caregiver.neighborhood.toLowerCase().includes(query) ||
        caregiver.bio.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'all' || caregiver.category === selectedCategory;
      const matchesUrgency = !onlyUrgency || caregiver.availability === 'urgency';
      const matchesCouncil =
        !onlyCouncilBadge || caregiver.badges.some((b) => b.type === 'nursing_council');

      return matchesSearch && matchesCategory && matchesUrgency && matchesCouncil;
    });
  }, [profiles, searchTerm, selectedCategory, onlyUrgency, onlyCouncilBadge]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <ShieldCheck className="w-4 h-4 text-brand dark:text-sky-400" />
              Catálogo Oficial de Profissionais Verificados
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Banco de Cuidadores & Talentos de Confiança
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Navegue pelos profissionais auditados da TrustLink. Todos possuem antecedentes checados
              pela Polícia Federal, checagem facial biométrica e acesso liberado à{' '}
              <strong className="text-slate-900 dark:text-white">Rede Sigilosa de Avaliações</strong> para contratantes com residência verificada.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/70">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                100% Antecedentes Criminais Limpos
              </span>
              <span className="flex items-center gap-1.5 text-blue-800 dark:text-sky-300 font-semibold bg-blue-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-sky-800/70 tabular-nums">
                <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                {urgencyCount} Profissional(is) no Radar de Urgência
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-2xs">
            <TextStream
              items={CATALOG_SPECIALTIES}
              prefix="Especialidades Disponíveis"
              height="150px"
              fontSize="clamp(1.15rem, 2.2vw, 1.45rem)"
            />
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
              Role a página para acelerar a rolagem contínua
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <label htmlFor="catalog-search" className="sr-only">
              Buscar cuidadores
            </label>
            <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-3" />
            <input
              id="catalog-search"
              type="text"
              placeholder="Buscar por nome, especialidade, bairro ou procedimento (ex: curativo, Alzheimer, Moema)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white dark:focus:bg-slate-950 transition-all placeholder:text-slate-500 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-pressed={onlyUrgency}
              onClick={() => setOnlyUrgency((prev) => !prev)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                onlyUrgency
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Plantão Urgência Ativo
            </button>

            <button
              type="button"
              aria-pressed={onlyCouncilBadge}
              onClick={() => setOnlyCouncilBadge((prev) => !prev)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                onlyCouncilBadge
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Com COREN / CRMV
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-brand text-white font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md tabular-nums ${
                  selectedCategory === cat.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
        <span className="tabular-nums">
          Exibindo <strong className="text-slate-900 dark:text-white">{filteredCaregivers.length}</strong> cuidador(es) em São Paulo
        </span>
        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <Info className="w-3.5 h-3.5 text-brand dark:text-sky-400" />
          Clique em <strong className="text-slate-900 dark:text-white">Ver Perfil Completo</strong> para consultar o dossiê e a Rede Sigilosa
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
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:border-brand dark:hover:border-sky-500 hover:-translate-y-0.5 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0 relative border border-transparent dark:border-slate-700">
                      {getInitials(caregiver.fullName)}
                      <span
                        className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white dark:border-slate-900 rounded-full ${
                          caregiver.availability === 'offline'
                            ? 'bg-slate-400'
                            : caregiver.availability === 'urgency'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      ></span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-brand dark:group-hover:text-sky-400 transition-colors">
                          {caregiver.fullName}
                        </h3>
                        <span title="Verificado TrustLink">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{caregiver.title}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(caregiver.id)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isFav
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
                        : 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                    aria-label={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                  >
                    <Bookmark className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    {caregiver.neighborhood}
                  </span>

                  {caregiver.availability === 'urgency' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 px-2 py-0.5 rounded-md tabular-nums">
                      <Radio className="w-3 h-3 text-amber-600 dark:text-amber-400 animate-pulse" />
                      Plantão Urgente ({caregiver.urgencyRadiusKm}km)
                    </span>
                  ) : caregiver.availability === 'online' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Disponível
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                      Offline
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-100 dark:border-slate-800 text-xs tabular-nums">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block text-[11px]">Avaliação Pública</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-slate-900 dark:text-white">{caregiver.publicRating}</span>
                      <span className="text-slate-600 dark:text-slate-400">
                        ({caregiver.completedContractsCount} plantões)
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block text-[11px]">Valor de Referência</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      R$ {caregiver.dailyRate}
                      <span className="text-[11px] font-normal text-slate-600 dark:text-slate-400">/diária</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                    Selos de Integridade Auditados
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {caregiver.badges.map((badge) => (
                      <span
                        key={badge.id}
                        className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 px-2 py-0.5 rounded-md flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        {badge.title.replace(' Verificados', '').replace(' Regularizada', '')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <p className={isBioExpanded ? '' : 'line-clamp-2'}>{caregiver.bio}</p>
                  {caregiver.bio.length > 90 && (
                    <button
                      type="button"
                      onClick={() => setExpandedBioId(isBioExpanded ? null : caregiver.id)}
                      className="text-[11px] font-semibold text-brand dark:text-sky-400 hover:underline mt-1 block cursor-pointer"
                    >
                      {isBioExpanded ? 'Recolher resumo' : 'Ler mais...'}
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectCaregiver(caregiver)}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  Ver Perfil Completo
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onOpenProposal(
                      caregiver.id,
                      caregiver.fullName,
                      caregiver.title,
                      caregiver.dailyRate
                    )
                  }
                  className="py-2 px-3 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Nenhum cuidador encontrado com os filtros selecionados.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setOnlyUrgency(false);
              setOnlyCouncilBadge(false);
            }}
            className="text-xs font-semibold text-brand dark:text-sky-400 underline hover:text-brand-hover cursor-pointer"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </div>
  );
};
