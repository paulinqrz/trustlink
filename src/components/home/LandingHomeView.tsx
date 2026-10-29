import React, { useState } from 'react';
import { AuthUser } from '../../types';
import { testUsers } from '../../data/mockData';
import { 
  ShieldCheck, 
  Lock, 
  Radio, 
  UserCheck, 
  Briefcase, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  CheckCircle2, 
  Award,
  HeartHandshake,
  Home
} from 'lucide-react';
import { TextStream } from '../common/TextStream';

interface LandingHomeViewProps {
  onSelectUser: (user: AuthUser) => void;
  onOpenLoginModal: () => void;
}

export const LandingHomeView: React.FC<LandingHomeViewProps> = ({ 
  onSelectUser, 
  onOpenLoginModal 
}) => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const faqItems = [
    {
      title: 'Como a plataforma protege contra falsas avaliações e difamação?',
      content: 'A regra fundamental é simples: ninguém pode avaliar sem ter contratado e concluído um serviço com a profissional. Não existem perfis anônimos avulsos nem comentários públicos que exponham a intimidade da família ou da cuidadora.'
    },
    {
      title: 'Por que os relatos e comentários são sempre confidenciais?',
      content: 'Para manter a igualdade e a imparcialidade total. No perfil aberto, apenas a nota geral e o número de atendimentos são visíveis. Relatos sobre pontualidade, rotina e honestidade ficam guardados em sigilo, acessíveis apenas a famílias verificadas durante contratações.'
    },
    {
      title: 'Como funciona a conferência de antecedentes e documentos?',
      content: 'Validamos certidões criminais negativas de 1º e 2º grau da Polícia Federal e dos Tribunais de Justiça estaduais, além da conferência de foto oficial e registros profissionais em conselhos como o COREN.'
    },
    {
      title: 'Como funciona o Radar de Urgência de 10km para cobrir faltas?',
      content: 'Se a sua cuidadora de plantão tiver um imprevisto, o radar localiza profissionais verificados que estão disponíveis no momento e a menos de 10km da sua casa, permitindo contato imediato para início do atendimento.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f3f2ef] text-[#262626] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              TL
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">TrustLink</span>
              <span className="hidden sm:inline-block text-xs text-slate-500 ml-1.5 font-medium">
                · LinkedIn da Confiança
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectUser(testUsers.freelancer)}
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Acessar como Profissional
            </button>

            <button
              onClick={() => onSelectUser(testUsers.employer)}
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-[#0a66c2] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              Acessar como Contratante
            </button>

            <button
              onClick={onOpenLoginModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg transition-colors shadow-xs"
            >
              Entrar / Acessar
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-10 sm:py-14 space-y-10 flex-1">
        {/* Hero Banner Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 shadow-xs space-y-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-[#0a66c2]" />
            Rede Profissional de Cuidados e Serviços de Alta Confiança
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            O LinkedIn da Confiança para Cuidadores, Saúde e Serviços Familiares
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Elimine a insegurança ao receber um profissional na sua casa. Cuidadores e enfermeiros com 
            antecedentes checados pela Polícia Federal, contratos digitais com termos de sigilo e avaliações confidenciais.
          </p>

          {/* Reel Animation of Verified Specialties */}
          <div className="py-2 px-4 max-w-xl mx-auto bg-slate-50 border border-slate-200/80 rounded-xl">
            <TextStream
              items={[
                "Cuidado Geriátrico & Alzheimer",
                "Técnicos de Enfermagem Domiciliar",
                "Acompanhamento Pós-Operatório",
                "Babás Especialistas em Neonatais",
                "Governança & Gestão Residencial",
                "Pet Sitter com Formação Veterinária"
              ]}
              prefix="Especialidades Auditadas"
              height="110px"
              fontSize="clamp(1.1rem, 2.5vw, 1.4rem)"
            />
          </div>

          {/* Quick Access Two Cards */}
          <div className="pt-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-3">
              Experimente a plataforma em 1 clique:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {/* Card 1: Área do Profissional */}
              <button
                onClick={() => onSelectUser(testUsers.freelancer)}
                className="p-5 border-2 border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-white rounded-xl transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5" />
                      Área do Profissional & Cuidador
                    </span>
                    <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Maria Clara Silveira
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Cuidadora Geriátrica Sênior & COREN-SP
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    4 Selos Oficiais · Plantão de Urgência · Portfólio
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  Acessar Área do Profissional →
                </div>
              </button>

              {/* Card 2: Área do Contratante */}
              <button
                onClick={() => onSelectUser(testUsers.employer)}
                className="p-5 border-2 border-slate-200 hover:border-[#0a66c2] bg-slate-50 hover:bg-white rounded-xl transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#0a66c2] bg-blue-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <Home className="w-3.5 h-3.5" />
                      Área da Família & Contratante
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#0a66c2] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Dra. Beatriz Fontana
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Família Contratante Residencial
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Catálogo de Cuidadores · Rede Sigilosa · Radar 10km
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-semibold text-[#0a66c2] flex items-center gap-1">
                  Acessar Área do Contratante →
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pilares Resumidos e Objetivos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              1. Documentos e Selos Auditados
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Checagem em órgãos oficiais: certidões negativas da Polícia Federal, Tribunais de Justiça, biometria com foto e conselhos de classe como o COREN.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              2. Comentários 100% Confidenciais
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Para assegurar igualdade e evitar difamação ou pressões, <strong>todos os relatos são sigilosos</strong>. Apenas quem <strong>efetivamente contratou e concluiu o serviço</strong> pode avaliar.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              3. Radar de Plantão Urgente (10km)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A cuidadora faltou? Encontre profissionais verificados disponíveis imediatamente num raio de até 10km da sua casa, com resposta rápida para socorro do plantão.
            </p>
          </div>
        </div>

        {/* Collapsible Accordion: Detalhes e Perguntas Frequentes ("Abre e Fecha") */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Dúvidas Frequentes e Regras da Plataforma
              </h2>
              <p className="text-xs text-slate-500">
                Clique nos tópicos para expandir detalhes sem poluir a visualização.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {faqItems.map((item, idx) => (
              <div 
                key={idx}
                className="border border-slate-200 rounded-lg overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full px-4 py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-4"
                >
                  <span>{item.title}</span>
                  {openAccordion === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {openAccordion === idx && (
                  <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200">
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">TrustLink</span>
            <span>·</span>
            <span>O LinkedIn da Confiança para Serviços de Cuidado e Domésticos</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span>Privacidade e Igualdade Asseguradas</span>
            <span>·</span>
            <span>Contratos com Validade Jurídica</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
