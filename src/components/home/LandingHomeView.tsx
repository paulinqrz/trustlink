import React, { useState } from 'react';
import { DEMO_PREVIEW_CARDS } from '../../services/trustlinkService';
import {
  ShieldCheck,
  Lock,
  Radio,
  UserCheck,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  HeartHandshake,
  Home,
} from 'lucide-react';
import { TextStream } from '../common/TextStream';
import { ThemeToggleButton } from '../common/ThemeContext';

const LANDING_SPECIALTIES = [
  'Cuidado Geriátrico & Alzheimer',
  'Técnicos de Enfermagem Domiciliar',
  'Acompanhamento Pós-Operatório',
  'Babás Especialistas em Neonatais',
  'Governança & Gestão Residencial',
  'Pet Sitter com Formação Veterinária',
];

const FAQ_ITEMS = [
  {
    title: 'Como a plataforma protege contra falsas avaliações e difamação?',
    content:
      'A regra fundamental é simples: ninguém pode avaliar sem ter contratado e concluído um serviço com a profissional. Não existem perfis anônimos avulsos nem comentários públicos que exponham a intimidade da família ou da cuidadora.',
  },
  {
    title: 'Por que os relatos e comentários são sempre confidenciais?',
    content:
      'Para manter a igualdade e a imparcialidade total. No perfil aberto, apenas a nota geral e o número de atendimentos são visíveis. Relatos sobre pontualidade, rotina e honestidade ficam guardados em sigilo, acessíveis apenas a famílias verificadas durante contratações.',
  },
  {
    title: 'Como funciona a conferência de antecedentes e documentos?',
    content:
      'Validamos certidões criminais negativas de 1º e 2º grau da Polícia Federal e dos Tribunais de Justiça estaduais, além da conferência de foto oficial e registros profissionais em conselhos como o COREN.',
  },
  {
    title: 'Como funciona o Radar de Urgência para cobrir faltas?',
    content:
      'Se a sua cuidadora de plantão tiver um imprevisto, o radar localiza profissionais verificados que estão disponíveis no momento num raio configurável de até 20 km da sua casa, permitindo contato imediato para início do atendimento.',
  },
];

interface LandingHomeViewProps {
  onDemoLogin: (role: 'freelancer' | 'employer') => void;
  onOpenLoginModal: () => void;
}

export const LandingHomeView: React.FC<LandingHomeViewProps> = ({
  onDemoLogin,
  onOpenLoginModal,
}) => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-sm shadow-xs">
              TL
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                TrustLink
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-600 dark:text-slate-400 ml-1.5 font-medium">
                · LinkedIn da Confiança
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggleButton />

            <button
              type="button"
              onClick={() => onDemoLogin('freelancer')}
              className="hidden lg:inline-flex px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-lg transition-colors items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Acessar como Profissional
            </button>

            <button
              type="button"
              onClick={() => onDemoLogin('employer')}
              className="hidden lg:inline-flex px-3 py-1.5 text-xs font-semibold text-brand dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 rounded-lg transition-colors items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Briefcase className="w-3.5 h-3.5" />
              Acessar como Contratante
            </button>

            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              Entrar / Cadastrar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 sm:py-14 space-y-10 flex-1">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-10 shadow-xs space-y-6 text-center max-w-4xl mx-auto transition-colors">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand dark:text-blue-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Rede Profissional de Cuidados e Serviços de Alta Confiança</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight text-balance">
            O LinkedIn da Confiança para Cuidadores, Saúde e Serviços Familiares
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Elimine a insegurança ao receber um profissional na sua casa. Cuidadores e enfermeiros com
            antecedentes checados pela Polícia Federal, contratos digitais com termos de sigilo e avaliações confidenciais.
          </p>

          <div className="py-2 px-4 max-w-xl mx-auto bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-xl">
            <TextStream
              items={LANDING_SPECIALTIES}
              prefix="Especialidades Auditadas"
              height="110px"
              fontSize="clamp(1.1rem, 2.5vw, 1.4rem)"
            />
          </div>

          <div className="pt-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 tracking-wide block mb-3">
              Experimente a plataforma em 1 clique:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <button
                type="button"
                onClick={() => onDemoLogin('freelancer')}
                className="p-5 border border-slate-200 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all duration-150 group flex flex-col justify-between shadow-2xs cursor-pointer active:scale-[0.99]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5" />
                      Área do Profissional & Cuidador
                    </span>
                    <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {DEMO_PREVIEW_CARDS.freelancer.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {DEMO_PREVIEW_CARDS.freelancer.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    4 Selos Oficiais · Plantão de Urgência · Portfólio
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  Acessar Área do Profissional →
                </div>
              </button>

              <button
                type="button"
                onClick={() => onDemoLogin('employer')}
                className="p-5 border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-blue-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all duration-150 group flex flex-col justify-between shadow-2xs cursor-pointer active:scale-[0.99]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-brand dark:text-blue-400 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5" />
                      Área da Família & Contratante
                    </span>
                    <ArrowRight className="w-4 h-4 text-brand dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {DEMO_PREVIEW_CARDS.employer.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Família Contratante Residencial
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Catálogo de Cuidadores · Rede Sigilosa · Radar
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs font-semibold text-brand dark:text-blue-400 flex items-center gap-1">
                  Acessar Área do Contratante →
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-2.5 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              01. Documentos e Selos Auditados
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Checagem em órgãos oficiais: certidões negativas da Polícia Federal, Tribunais de Justiça, biometria com foto e conselhos de classe como o COREN.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-2.5 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              02. Comentários 100% Confidenciais
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Para assegurar igualdade e evitar difamação ou pressões, <strong>todos os relatos são sigilosos</strong>. Apenas quem <strong>efetivamente contratou e concluiu o serviço</strong> pode avaliar.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-2.5 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              03. Radar de Plantão Urgente
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              A cuidadora faltou? Encontre profissionais verificados disponíveis imediatamente num raio de até 20 km da sua casa, com resposta rápida para socorro do plantão.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Dúvidas Frequentes e Regras da Plataforma
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Clique nos tópicos para expandir detalhes sem poluir a visualização.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  aria-expanded={openAccordion === idx}
                  onClick={() => toggleAccordion(idx)}
                  className="w-full px-4 py-3.5 text-left text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>{item.title}</span>
                  {openAccordion === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  )}
                </button>

                {openAccordion === idx && (
                  <div className="p-4 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800">
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-600 dark:text-slate-400 transition-colors">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">TrustLink</span>
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
