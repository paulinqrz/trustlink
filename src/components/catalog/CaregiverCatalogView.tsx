import React, { useMemo, useState } from 'react';
import { FreelancerProfile } from '../../types';
import { getInitials } from '../../services/trustlinkService';
import {
  ShieldCheck,
  Search,
  Star,
  MapPin,
  CheckCircle2,
  Radio,
  UserCheck,
  Bookmark,
  Info,
  MessageSquare,
  Flame,
  Sparkles,
  FileText,
  EyeOff,
} from 'lucide-react';

const MAX_HIGHLIGHTED_PER_SEARCH = 2;

interface CaregiverCatalogViewProps {
  profiles: FreelancerProfile[];
  onSelectCaregiver: (profile: FreelancerProfile) => void;
  onOpenChat: (profile: FreelancerProfile) => void;
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
  onOpenChat,
  onOpenProposal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyUrgency, setOnlyUrgency] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(['fl-101']);
  const [expandedBioId, setExpandedBioId] = useState<string | null>(null);

  // Slide 4 Rule: O perfil só aparece nas buscas depois de verificado!
  const verifiedProfiles = useMemo(
    () => profiles.filter((p) => p.isVerified),
    [profiles]
  );

  const hiddenUnverifiedCount = profiles.length - verifiedProfiles.length;

  const categories = useMemo(() => {
    const countCat = (catKey: string) =>
      verifiedProfiles.filter((p) => p.category === catKey).length;

    return [
      { key: 'all', label: 'Todas as Profissões', count: verifiedProfiles.length },
      {
        key: 'Doméstica / Diarista',
        label: 'Doméstica / Diarista',
        count: countCat('Doméstica / Diarista'),
      },
      {
        key: 'Babá',
        label: 'Babá',
        count: countCat('Babá'),
      },
      {
        key: 'Cuidadora',
        label: 'Cuidadora de Idosos',
        count: countCat('Cuidadora'),
      },
    ];
  }, [verifiedProfiles]);

  // Seção "Profissionais em Alta" (Slide 4 & Slide 8 — Destaque Pro)
  const trendingProfiles = useMemo(
    () =>
      verifiedProfiles.filter(
        (p) =>
          p.highlightPlan === 'destaque_pro' &&
          (selectedCategory === 'all' || p.category === selectedCategory)
      ),
    [verifiedProfiles, selectedCategory]
  );

  // Busca principal com regra de "Destaque Justo" (Slide 8: limite de perfis em destaque por busca)
  const { orderedProfiles, highlightedIdsInSearch } = useMemo(() => {
    const query = searchTerm.toLowerCase();
    const matches = verifiedProfiles.filter((prof) => {
      const matchesSearch =
        prof.fullName.toLowerCase().includes(query) ||
        prof.title.toLowerCase().includes(query) ||
        prof.neighborhood.toLowerCase().includes(query) ||
        prof.bio.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'all' || prof.category === selectedCategory;
      const matchesUrgency = !onlyUrgency || prof.availability === 'urgency';

      return matchesSearch && matchesCategory && matchesUrgency;
    });

    const rankWeight = (plan: FreelancerProfile['highlightPlan']) =>
      plan === 'destaque_pro' ? 2 : plan === 'destaque' ? 1 : 0;

    const sorted = [...matches].sort((a, b) => {
      const diff = rankWeight(b.highlightPlan) - rankWeight(a.highlightPlan);
      if (diff !== 0) return diff;
      return b.publicRating - a.publicRating;
    });

    const allowedHighlightSet = new Set<string>();
    for (const item of sorted) {
      if (
        item.highlightPlan !== 'free' &&
        allowedHighlightSet.size < MAX_HIGHLIGHTED_PER_SEARCH
      ) {
        allowedHighlightSet.add(item.id);
      }
    }

    return {
      orderedProfiles: sorted,
      highlightedIdsInSearch: allowedHighlightSet,
    };
  }, [verifiedProfiles, searchTerm, selectedCategory, onlyUrgency]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 font-sans">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-7 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Busca Segura Verilar · 100% Checadas antes de Aparecer
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Domésticas, Diaristas, Babás e Cuidadoras Verificadas
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Todas as profissionais abaixo tiveram identidade (RG + selfie), Certidão de Antecedentes da Polícia Federal (validade 90 dias) e certificados conferidos. Combine valores no chat e pague pela plataforma ou Pix sem comissão.
            </p>
          </div>

          {hiddenUnverifiedCount > 0 && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs max-w-xs shrink-0 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 tabular-nums">
                <EyeOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                {hiddenUnverifiedCount} perfil(is) oculto(s) na triagem
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Cadastros sem verificação completa não aparecem nas buscas das famílias até a validação na PF.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Seção Profissionais em Alta (Slide 4 & Slide 8) */}
      {trendingProfiles.length > 0 && !searchTerm && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Profissionais em Alta na Sua Região
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Selos verificados gratuitamente · Visibilidade Destaque Pro
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingProfiles.slice(0, 2).map((prof) => (
              <div
                key={`trending-${prof.id}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand dark:hover:border-blue-400 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-brand text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {getInitials(prof.fullName)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {prof.fullName}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3" /> Verificada
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-1.5 py-0.5 rounded">
                        <Flame className="w-2.5 h-2.5" /> Em alta
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {prof.category} · {prof.neighborhood}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                      <span className="flex items-center gap-0.5 font-bold text-slate-900 dark:text-white">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {prof.publicRating}
                      </span>
                      <span>({prof.publicReviewCount} avaliações)</span>
                      <span>·</span>
                      <strong className="text-slate-900 dark:text-white">R$ {prof.dailyRate}/diária</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectCaregiver(prof)}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Ver Perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenChat(prof)}
                    className="px-3 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat / Pix
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search and Category Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <label htmlFor="catalog-search" className="sr-only">
              Buscar profissionais verificadas
            </label>
            <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-3" />
            <input
              id="catalog-search"
              type="text"
              placeholder="Buscar por nome, profissão ou bairro (ex: Cida, faxina, babá, Vila Mariana)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white dark:focus:bg-slate-950 transition-all placeholder:text-slate-500"
            />
          </div>

          <button
            type="button"
            aria-pressed={onlyUrgency}
            onClick={() => setOnlyUrgency((prev) => !prev)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              onlyUrgency
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Disponível p/ Urgência Hoje
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
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

      {/* Results Strip + Destaque Justo Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 px-1">
        <span className="tabular-nums">
          Exibindo <strong className="text-slate-900 dark:text-white">{orderedProfiles.length}</strong> profissional(is) verificada(s)
        </span>
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Info className="w-3.5 h-3.5 text-brand dark:text-sky-400 shrink-0" />
          <span>
            <strong className="text-slate-900 dark:text-white">Destaque Justo:</strong> Máximo de {MAX_HIGHLIGHTED_PER_SEARCH} etiquetas “Em destaque” por busca — separadas do selo gratuito de verificação.
          </span>
        </span>
      </div>

      {/* Professional Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {orderedProfiles.map((caregiver) => {
          const isFav = favorites.includes(caregiver.id);
          const isBioExpanded = expandedBioId === caregiver.id;
          const showHighlightTag = highlightedIdsInSearch.has(caregiver.id);

          return (
            <div
              key={caregiver.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:border-brand dark:hover:border-sky-500 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Separate Seal vs Paid Visibility Tag (Slide 6 & Slide 8) */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    Selo Verilar (PF 90d)
                  </span>

                  {showHighlightTag && (
                    <span
                      title="Visibilidade opcional paga pela profissional. Não altera nem substitui a verificação gratuita."
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-dashed border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-md"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      Em destaque
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0 relative border border-transparent dark:border-slate-700">
                      {getInitials(caregiver.fullName)}
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white dark:border-slate-900 rounded-full ${
                          caregiver.availability === 'offline'
                            ? 'bg-slate-400'
                            : caregiver.availability === 'urgency'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-brand dark:group-hover:text-sky-400 transition-colors">
                        {caregiver.fullName}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {caregiver.category} · {caregiver.experienceYears} anos exp.
                      </p>
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

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    {caregiver.neighborhood}
                  </span>

                  {caregiver.availability === 'urgency' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/70 px-2 py-0.5 rounded-md tabular-nums">
                      <Radio className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      Urgência ({caregiver.urgencyRadiusKm} km)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Agenda Aberta
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-100 dark:border-slate-800 text-xs tabular-nums">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block text-[11px]">Avaliações (1 a 5★)</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-slate-900 dark:text-white">{caregiver.publicRating}</span>
                      <span className="text-slate-600 dark:text-slate-400">
                        ({caregiver.publicReviewCount})
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block text-[11px]">Diária de Referência</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      R$ {caregiver.dailyRate}
                      <span className="text-[11px] font-normal text-slate-600 dark:text-slate-400">/dia</span>
                    </div>
                  </div>
                </div>

                {/* Camadas Verificadas */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                    Camadas Checadas pela Verilar
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {caregiver.badges.map((badge) => (
                      <span
                        key={badge.id}
                        className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/70 px-2 py-0.5 rounded-md flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        {badge.layer === 'identidade' || badge.type === 'identity'
                          ? 'RG + Selfie'
                          : badge.layer === 'antecedentes' || badge.type === 'criminal_record'
                          ? 'Antecedentes PF (90d)'
                          : 'Curso Conferido'}
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
                  className="flex-1 py-2 px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  Perfil & Avaliações
                </button>

                <button
                  type="button"
                  onClick={() => onOpenChat(caregiver)}
                  className="py-2 px-3 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
                  title="Combinar valor e pagamento por Pix ou Plataforma"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat / Pix
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
                  className="p-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0 cursor-pointer"
                  title="Gerar contrato digital opcional"
                  aria-label="Gerar contrato digital opcional"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {orderedProfiles.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Nenhuma profissional verificada encontrada com os filtros selecionados.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setOnlyUrgency(false);
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
