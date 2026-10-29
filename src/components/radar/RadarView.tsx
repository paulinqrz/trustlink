import React, { useState } from 'react';
import { sampleRadarFreelancers } from '../../data/mockData';
import { 
  Radio, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Send, 
  CheckCircle2, 
  Sliders, 
  Zap, 
  Star
} from 'lucide-react';

interface RadarViewProps {
  onSelectForContract: (freelancerName: string, role: string, rate: number) => void;
}

export const RadarView: React.FC<RadarViewProps> = ({ onSelectForContract }) => {
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(10);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [urgencyOnly, setUrgencyOnly] = useState<boolean>(true);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);

  // Filter freelancers by distance and criteria
  const filteredFreelancers = sampleRadarFreelancers.filter((fl) => {
    if (fl.distanceKm > maxRadiusKm) return false;
    if (urgencyOnly && fl.urgencyStatus !== 'urgency') return false;
    if (categoryFilter !== 'all' && fl.category !== categoryFilter) return false;
    return true;
  });

  const handleInstantCall = (fl: typeof sampleRadarFreelancers[0]) => {
    setContactSuccess(`Solicitação de plantão enviada com prioridade para ${fl.name}! Previsão de resposta em aproximadamente ${fl.responseTimeMinutes} minutos.`);
    onSelectForContract(fl.name, fl.role, fl.dailyRate);
    setTimeout(() => setContactSuccess(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6 font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                Busca de Urgência em Tempo Real
              </span>
              <span className="text-xs text-slate-400">Cobertura de Plantão</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Substituição Emergencial & Cuidados Próximos
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Ocorreu um imprevisto ou falta de cuidadora? Encontre profissionais verificados com documentos auditados e prontos para atendimento em um raio de até 10km da sua casa.
            </p>
          </div>

          <div className="shrink-0 p-4 bg-slate-800 rounded-xl text-xs space-y-1.5 border border-slate-700">
            <div className="text-slate-400">Ponto de Referência da Família:</div>
            <div className="text-emerald-400 flex items-center gap-1.5 font-semibold text-sm">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Consolação / Jardins, São Paulo
            </div>
            <div className="text-xs text-slate-400">
              Raio de busca ajustável de 3km a 20km
            </div>
          </div>
        </div>
      </div>

      {contactSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2 shadow-xs">
          <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{contactSuccess}</span>
        </div>
      )}

      {/* Main Grid: Visual Radar Sweep + Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Controls & Radar Map Simulation (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-700" />
              Ajuste de Distância e Filtros
            </h2>

            {/* Radius Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-semibold">Distância Máxima da Residência</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  Até {maxRadiusKm} km
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={20}
                step={1}
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="w-full accent-[#0a66c2] cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>3 km (Bairro)</span>
                <span className="font-semibold text-slate-800">10 km (Recomendado)</span>
                <span>20 km (Grande SP)</span>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-3 pt-3 border-t border-slate-200 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Especialidade Desejada</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-[#0a66c2] focus:outline-hidden"
                >
                  <option value="all">Todas as Especialidades</option>
                  <option value="Cuidado de Idosos">Cuidado de Idosos (Alzheimer / Parkinson)</option>
                  <option value="Enfermagem & Acompanhamento">Técnico(a) de Enfermagem</option>
                  <option value="Cuidado Infantil">Babá & Cuidado Infantil</option>
                  <option value="Serviços Domésticos de Confiança">Governanta Residencial</option>
                  <option value="Pet Care de Alta Confiança">Pet Sitter Especializado</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-700 font-semibold">Apenas com Disponibilidade Imediata</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={urgencyOnly}
                    onChange={(e) => setUrgencyOnly(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0a66c2]"></div>
                </label>
              </div>
            </div>

            {/* Visual Radar Scope Canvas */}
            <div className="pt-2">
              <div className="relative w-full aspect-square bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
                {/* Concentric rings */}
                <div className="absolute w-[85%] h-[85%] rounded-full border border-slate-800/80 flex items-center justify-center">
                  <span className="absolute top-1 text-[10px] text-slate-500">
                    {maxRadiusKm} km
                  </span>
                </div>
                <div className="absolute w-[55%] h-[55%] rounded-full border border-slate-800/60 flex items-center justify-center">
                  <span className="absolute top-1 text-[10px] text-slate-500">
                    {(maxRadiusKm * 0.6).toFixed(1)} km
                  </span>
                </div>
                <div className="absolute w-[25%] h-[25%] rounded-full border border-slate-800/40"></div>

                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-slate-800/60"></div>
                <div className="absolute h-full w-[1px] bg-slate-800/60"></div>

                {/* Center point (Employer) */}
                <div className="relative z-10 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-md">
                  <div className="w-full h-full bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                </div>

                {/* Freelancer Dots inside Radar */}
                {filteredFreelancers.map((fl, idx) => {
                  const angle = (idx * 65 + 40) * (Math.PI / 180);
                  const normalizedDist = Math.min((fl.distanceKm / maxRadiusKm) * 40, 42);
                  const x = 50 + normalizedDist * Math.cos(angle);
                  const y = 50 + normalizedDist * Math.sin(angle);

                  return (
                    <div
                      key={fl.id}
                      style={{ top: `${y}%`, left: `${x}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
                    >
                      <div className="relative">
                        <div className="w-3 h-3 bg-amber-400 rounded-full shadow-md"></div>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[11px] text-white whitespace-nowrap shadow-lg">
                          {fl.name} ({fl.distanceKm} km)
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="absolute bottom-2 right-2 text-xs text-slate-400">
                  {filteredFreelancers.length} disponíveis no raio
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results List with Immediate Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Profissionais Próximos da Residência
              </h2>
              <p className="text-xs text-slate-500">
                Ordenados pela menor distância real da sua casa
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
              {filteredFreelancers.length} no raio de {maxRadiusKm}km
            </span>
          </div>

          {filteredFreelancers.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-2">
              <p className="text-sm font-semibold text-slate-800">Nenhum profissional encontrado no raio de {maxRadiusKm} km</p>
              <p className="text-xs text-slate-500">Aumente o raio para 15km ou 20km para localizar cuidadores na região vizinha.</p>
              <button
                onClick={() => setMaxRadiusKm(15)}
                className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg"
              >
                Expandir para 15 km
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFreelancers.map((fl) => (
                <div
                  key={fl.id}
                  className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 hover:border-slate-300 transition-colors shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{fl.name}</span>
                        <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <Radio className="w-3 h-3 text-amber-600" />
                          A {fl.distanceKm} km de você
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{fl.role}</p>
                    </div>

                    <div className="text-right sm:shrink-0">
                      <span className="text-base font-bold text-slate-900">R$ {fl.dailyRate}</span>
                      <span className="text-xs text-slate-500 block">por diária / plantão</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {fl.badges.map((b, idx) => (
                      <React.Fragment key={idx}>
                        <span className="font-medium text-slate-700">{b}</span>
                        {idx < fl.badges.length - 1 && <span className="text-slate-300">·</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Response time and action button */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Tempo estimado: <strong className="text-slate-900">~{fl.responseTimeMinutes} minutos</strong>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <strong className="text-slate-900">{fl.rating}</strong> ({fl.reviewsCount} plantões)
                      </span>
                    </div>

                    <button
                      onClick={() => handleInstantCall(fl)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Chamar p/ Plantão Urgente
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
