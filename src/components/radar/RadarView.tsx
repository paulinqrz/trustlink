import React, { useEffect, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  Pin,
} from '@vis.gl/react-google-maps';
import { FreelancerProfile, RadarFreelancer } from '../../types';
import { trustlinkService } from '../../services/trustlinkService';
import { useToast } from '../common/ToastContext';
import {
  Radio,
  MapPin,
  ShieldCheck,
  Clock,
  Sliders,
  Zap,
  Star,
  Compass,
  Map as MapIcon,
} from 'lucide-react';

interface RadarViewProps {
  profiles: FreelancerProfile[];
  onSelectForContract: (
    freelancerId: string,
    freelancerName: string,
    role: string,
    rate: number
  ) => void;
}

interface OriginOption {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

const ORIGIN_OPTIONS: OriginOption[] = [
  {
    id: 'consolacao',
    label: 'Consolação / Jardins, São Paulo',
    lat: -23.5558,
    lng: -46.6601,
  },
  {
    id: 'pinheiros',
    label: 'Pinheiros / Vila Madalena, São Paulo',
    lat: -23.5615,
    lng: -46.6905,
  },
  {
    id: 'moema',
    label: 'Moema / Ibirapuera, São Paulo',
    lat: -23.6005,
    lng: -46.6648,
  },
  {
    id: 'vila-mariana',
    label: 'Vila Mariana / Paraíso, São Paulo',
    lat: -23.5892,
    lng: -46.6347,
  },
  {
    id: 'itaim',
    label: 'Itaim Bibi / Vila Olímpia, São Paulo',
    lat: -23.5844,
    lng: -46.6784,
  },
];

const GOOGLE_MAPS_API_KEY = (
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
)?.trim() || '';

export const RadarView: React.FC<RadarViewProps> = ({
  profiles,
  onSelectForContract,
}) => {
  const { showToast } = useToast();
  const [selectedOriginId, setSelectedOriginId] = useState<string>(ORIGIN_OPTIONS[0].id);
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(10);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [urgencyOnly, setUrgencyOnly] = useState<boolean>(true);
  const [filteredFreelancers, setFilteredFreelancers] = useState<RadarFreelancer[]>([]);
  const [isLoadingRadar, setIsLoadingRadar] = useState<boolean>(true);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'google_map' | 'spatial_radar'>(
    GOOGLE_MAPS_API_KEY ? 'google_map' : 'spatial_radar'
  );

  const selectedOrigin =
    ORIGIN_OPTIONS.find((opt) => opt.id === selectedOriginId) || ORIGIN_OPTIONS[0];

  useEffect(() => {
    let active = true;
    setIsLoadingRadar(true);
    trustlinkService
      .fetchNearbyRadar({
        lat: selectedOrigin.lat,
        lng: selectedOrigin.lng,
        radiusKm: maxRadiusKm,
        category: categoryFilter,
        urgencyOnly,
      })
      .then((list) => {
        if (active) {
          setFilteredFreelancers(list);
          setSelectedFreelancerId((prev) =>
            list.some((item) => item.id === prev) ? prev : list[0]?.id ?? null
          );
        }
      })
      .catch(() => {
        if (active) {
          setFilteredFreelancers([]);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingRadar(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    selectedOrigin.lat,
    selectedOrigin.lng,
    maxRadiusKm,
    categoryFilter,
    urgencyOnly,
    profiles,
  ]);

  const activeMapFreelancer =
    filteredFreelancers.find((f) => f.id === selectedFreelancerId) || null;

  const handleInstantCall = (fl: RadarFreelancer) => {
    onSelectForContract(fl.id, fl.name, fl.role, fl.dailyRate);
    showToast(
      `Solicitação prioritária enviada para ${fl.name}! Previsão de retorno: ~${fl.responseTimeMinutes} min.`
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 font-sans">
      {/* Top Dark Header Banner — explicit white contrast in both Light and Dark themes */}
      <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                Busca de Urgência em Tempo Real
              </span>
              <span className="text-slate-500" aria-hidden="true">
                ·
              </span>
              <span className="text-slate-300">Cobertura de Plantão Auditada</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
              Substituição Emergencial & Cuidados Próximos
            </h1>
            <p className="text-sm text-slate-200 max-w-2xl leading-relaxed">
              Ocorreu um imprevisto ou falta de cuidadora? Encontre profissionais verificados com documentos auditados e prontos para atendimento em um raio de até 20 km da sua casa.
            </p>
          </div>

          <div className="shrink-0 p-4 bg-slate-800/90 rounded-xl text-xs space-y-2 border border-slate-700 min-w-[260px]">
            <label htmlFor="radar-origin-select" className="text-slate-300 block font-medium">
              Ponto de Referência da Família:
            </label>
            <div className="relative flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <select
                id="radar-origin-select"
                value={selectedOriginId}
                onChange={(e) => setSelectedOriginId(e.target.value)}
                className="w-full bg-slate-900 text-emerald-300 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-hidden focus:border-emerald-400 cursor-pointer"
              >
                {ORIGIN_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[11px] text-slate-300 tabular-nums">
              Coord. geodésica: {selectedOrigin.lat.toFixed(4)}, {selectedOrigin.lng.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls & Interactive Map / Spatial Radar */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                Ajuste de Distância e Filtros
              </h2>

              {GOOGLE_MAPS_API_KEY && (
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setViewMode('google_map')}
                    className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                      viewMode === 'google_map'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <MapIcon className="w-3 h-3" />
                    Mapa
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('spatial_radar')}
                    className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                      viewMode === 'spatial_radar'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Compass className="w-3 h-3" />
                    Radar
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="radar-radius"
                  className="text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Distância Máxima da Residência
                </label>
                <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 tabular-nums">
                  Até {maxRadiusKm} km
                </span>
              </div>
              <input
                id="radar-radius"
                type="range"
                min={3}
                max={20}
                step={1}
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="w-full accent-brand cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                <span>3 km (Bairro)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  10 km (Recomendado)
                </span>
                <span>20 km (Grande SP)</span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <label
                  htmlFor="radar-category"
                  className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
                >
                  Especialidade Desejada
                </label>
                <select
                  id="radar-category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-brand focus:outline-hidden"
                >
                  <option value="all">Todas as Especialidades</option>
                  <option value="Cuidado de Idosos">
                    Cuidado de Idosos (Alzheimer / Parkinson)
                  </option>
                  <option value="Enfermagem & Acompanhamento">
                    Técnico(a) de Enfermagem
                  </option>
                  <option value="Cuidado Infantil">Babá & Cuidado Infantil</option>
                  <option value="Serviços Domésticos de Confiança">
                    Governanta Residencial
                  </option>
                  <option value="Pet Care de Alta Confiança">
                    Pet Sitter Especializado
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label
                  htmlFor="radar-urgency-only"
                  className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Apenas com Disponibilidade Imediata
                </label>
                <input
                  id="radar-urgency-only"
                  type="checkbox"
                  checked={urgencyOnly}
                  onChange={(e) => setUrgencyOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand focus:ring-brand cursor-pointer"
                />
              </div>
            </div>

            {/* Map / Spatial Radar Viewport */}
            <div className="pt-2 space-y-2">
              {GOOGLE_MAPS_API_KEY && viewMode === 'google_map' ? (
                <div className="relative w-full h-[360px] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <APIProvider
                    apiKey={GOOGLE_MAPS_API_KEY}
                    language="pt-BR"
                    region="BR"
                    libraries={['marker']}
                  >
                    <Map
                      key={selectedOrigin.id}
                      mapId="DEMO_MAP_ID"
                      defaultCenter={{ lat: selectedOrigin.lat, lng: selectedOrigin.lng }}
                      defaultZoom={13}
                      gestureHandling="cooperative"
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    >
                      {/* Family Reference Origin Marker */}
                      <AdvancedMarker
                        position={{ lat: selectedOrigin.lat, lng: selectedOrigin.lng }}
                        title={`Residência de referência: ${selectedOrigin.label}`}
                      >
                        <Pin
                          background="#10b981"
                          borderColor="#065f46"
                          glyphColor="#ffffff"
                        />
                      </AdvancedMarker>

                      {/* Caregiver Markers */}
                      {filteredFreelancers.map((fl) => {
                        const isSelected = fl.id === selectedFreelancerId;
                        return (
                          <AdvancedMarker
                            key={fl.id}
                            position={{ lat: fl.lat, lng: fl.lng }}
                            onClick={() => setSelectedFreelancerId(fl.id)}
                            title={`${fl.name} · ${fl.distanceKm} km`}
                          >
                            <Pin
                              background={isSelected ? '#0a66c2' : '#f59e0b'}
                              borderColor={isSelected ? '#004182' : '#92400e'}
                              glyphColor="#ffffff"
                              scale={isSelected ? 1.2 : 1}
                            />
                          </AdvancedMarker>
                        );
                      })}

                      {activeMapFreelancer && (
                        <InfoWindow
                          position={{
                            lat: activeMapFreelancer.lat,
                            lng: activeMapFreelancer.lng,
                          }}
                          maxWidth={240}
                          onCloseClick={() => setSelectedFreelancerId(null)}
                        >
                          <div className="text-slate-900 space-y-1 text-xs p-0.5">
                            <div className="font-bold">{activeMapFreelancer.name}</div>
                            <div className="text-[11px] text-slate-600">
                              {activeMapFreelancer.role}
                            </div>
                            <div className="text-[11px] font-semibold text-emerald-700 tabular-nums">
                              A {activeMapFreelancer.distanceKm} km · R${' '}
                              {activeMapFreelancer.dailyRate}/diária
                            </div>
                          </div>
                        </InfoWindow>
                      )}
                    </Map>
                  </APIProvider>
                </div>
              ) : (
                <div className="relative w-full aspect-square bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
                  <div className="absolute w-[85%] h-[85%] rounded-full border border-slate-800/90 flex items-center justify-center">
                    <span className="absolute top-1.5 text-[10px] text-slate-300 font-mono tabular-nums">
                      {maxRadiusKm} km
                    </span>
                  </div>
                  <div className="absolute w-[55%] h-[55%] rounded-full border border-slate-800/75 flex items-center justify-center">
                    <span className="absolute top-1.5 text-[10px] text-slate-300 font-mono tabular-nums">
                      {(maxRadiusKm * 0.6).toFixed(1)} km
                    </span>
                  </div>
                  <div className="absolute w-[25%] h-[25%] rounded-full border border-slate-800/60" />

                  <div className="absolute w-full h-[1px] bg-slate-800/70" />
                  <div className="absolute h-full w-[1px] bg-slate-800/70" />

                  {/* Reference Origin Center */}
                  <div
                    className="relative z-10 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-md"
                    title={selectedOrigin.label}
                  />

                  {filteredFreelancers.map((fl, idx) => {
                    const angle = (idx * 65 + 40) * (Math.PI / 180);
                    const normalizedDist = Math.min(
                      (fl.distanceKm / maxRadiusKm) * 40,
                      42
                    );
                    const x = 50 + normalizedDist * Math.cos(angle);
                    const y = 50 + normalizedDist * Math.sin(angle);
                    const isSelected = fl.id === selectedFreelancerId;

                    return (
                      <button
                        key={fl.id}
                        type="button"
                        onClick={() => setSelectedFreelancerId(fl.id)}
                        style={{ top: `${y}%`, left: `${x}%` }}
                        aria-label={`Selecionar ${fl.name} a ${fl.distanceKm} km`}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20 focus:outline-none"
                      >
                        <div className="relative flex items-center justify-center">
                          <span
                            className={`w-3.5 h-3.5 rounded-full shadow-md transition-transform duration-150 ${
                              isSelected
                                ? 'bg-sky-400 ring-4 ring-sky-400/30 scale-125'
                                : 'bg-amber-400 group-hover:scale-125'
                            }`}
                          />
                          <div
                            className={`absolute -top-8 left-1/2 -translate-x-1/2 ${
                              isSelected ? 'flex' : 'hidden group-hover:flex'
                            } bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[11px] text-white whitespace-nowrap shadow-lg tabular-nums`}
                          >
                            {fl.name} ({fl.distanceKm} km)
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 tabular-nums">
                    <span className="truncate max-w-[60%] text-emerald-300 font-medium">
                      Origem: {selectedOrigin.label.split(',')[0]}
                    </span>
                    <span>{filteredFreelancers.length} no raio</span>
                  </div>
                </div>
              )}

              {!GOOGLE_MAPS_API_KEY && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Radar geodésico ativo (Haversine). Para exibir também o mapa interativo do Google Maps, defina{' '}
                  <code className="font-mono text-slate-700 dark:text-slate-300">
                    VITE_GOOGLE_MAPS_API_KEY
                  </code>{' '}
                  nas variáveis de ambiente.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Nearby Caregiver Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Profissionais Próximos da Residência
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Ordenados pela menor distância real de {selectedOrigin.label.split(',')[0]}
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md tabular-nums whitespace-nowrap">
              {filteredFreelancers.length} no raio de {maxRadiusKm} km
            </span>
          </div>

          {isLoadingRadar ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400">
              Calculando distâncias geodésicas (Haversine) no servidor...
            </div>
          ) : filteredFreelancers.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Nenhum profissional encontrado no raio de {maxRadiusKm} km
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Aumente o raio para 15 km ou 20 km para localizar cuidadores na região vizinha.
              </p>
              <button
                type="button"
                onClick={() => setMaxRadiusKm(15)}
                className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg cursor-pointer"
              >
                Expandir para 15 km
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFreelancers.map((fl) => {
                const isSelected = fl.id === selectedFreelancerId;
                return (
                  <div
                    key={fl.id}
                    onClick={() => setSelectedFreelancerId(fl.id)}
                    className={`p-5 bg-white dark:bg-slate-900 border rounded-xl space-y-3 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-brand dark:border-blue-400 ring-1 ring-brand/25 dark:ring-blue-400/25 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold text-slate-900 dark:text-white">
                            {fl.name}
                          </span>
                          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1 tabular-nums">
                            <Radio className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            A {fl.distanceKm} km de você
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {fl.role}
                        </p>
                      </div>

                      <div className="text-right sm:shrink-0 tabular-nums">
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                          R$ {fl.dailyRate}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400 block">
                          por diária / plantão
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      {fl.badges.map((b, idx) => (
                        <React.Fragment key={idx}>
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {b}
                          </span>
                          {idx < fl.badges.length - 1 && (
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 tabular-nums">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          Retorno:{' '}
                          <strong className="text-slate-900 dark:text-slate-100">
                            ~{fl.responseTimeMinutes} min
                          </strong>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <strong className="text-slate-900 dark:text-slate-100">
                            {fl.rating}
                          </strong>{' '}
                          ({fl.reviewsCount} plantões)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInstantCall(fl);
                        }}
                        className="px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        Chamar p/ Plantão Urgente
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
