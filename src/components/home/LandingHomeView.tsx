import React, { useState } from 'react';
import { DEMO_PREVIEW_CARDS } from '../../services/trustlinkService';
import {
  ShieldCheck,
  UserCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  HeartHandshake,
  Home,
  CheckCircle2,
  QrCode,
  FileBadge2,
  Fingerprint,
  Clock,
  Scale,
  Crown,
} from 'lucide-react';
import { TextStream } from '../common/TextStream';
import { ThemeToggleButton } from '../common/ThemeContext';

const VERILAR_CATEGORIES = [
  'Domésticas & Diaristas Verificadas',
  'Babás com Curso Conferido',
  'Cuidadoras de Idosos Auditadas',
  'Certidão Polícia Federal (90 dias)',
  'Chat Direto & Pagamento via Pix',
  'Zero Comissão Sobre a Diária',
];

const FAQ_ITEMS = [
  {
    title: 'Como funciona a verificação gratuita em 3 camadas e a renovação de 90 dias?',
    content:
      'Toda profissional envia documento oficial com foto + selfie (Camada 1) e a Certidão de Antecedentes Criminais da Polícia Federal (Camada 2), cuja autenticidade é conferida gratuitamente no portal gov.br pelo número e código de validação. Como a certidão da PF vale 90 dias, o selo da Verilar também é renovado a cada 90 dias. Babás e cuidadoras enviam ainda o certificado do curso (Camada 3), conferido pela moderação.',
  },
  {
    title: 'O que a Verilar guarda dos documentos enviados (LGPD)?',
    content:
      'Em conformidade estrita com a LGPD, a Verilar guarda apenas o resultado da verificação, o protocolo de validação e a data de validade de 90 dias — nunca armazenamos cópias permanentes dos documentos pessoais da trabalhadora.',
  },
  {
    title: 'Qual a diferença entre o Selo de Verificação e os planos Verilar Destaque?',
    content:
      'Confiança e visibilidade são coisas separadas. O selo de verificação é obrigatório e 100% gratuito para aparecer nas buscas. Os planos opcionais pagos apenas pela profissional (Destaque R$ 9,90/mês e Destaque Pro R$ 19,90/mês) dão melhor posição nas buscas e estatísticas, com limite de perfis patrocinados por busca e etiqueta visualmente distinta do selo.',
  },
  {
    title: 'Por que a Verilar é diferente de Famyle, Clicare e FlagCheck?',
    content:
      'Na Famyle, checar antecedentes exige assinar o plano Premium de R$ 129,99/mês pago pela família. A Clicare verifica certificados, mas atende apenas cuidadoras de idosos. O FlagCheck faz somente consulta avulsa de antecedentes, sem ser marketplace. Na Verilar, toda família busca de graça e toda doméstica, diarista, babá ou cuidadora só aparece nas buscas depois de verificada gratuitamente.',
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
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-sm shadow-xs">
              VL
            </div>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Verilar
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggleButton />

            <button
              type="button"
              onClick={() => onDemoLogin('freelancer')}
              className="hidden lg:inline-flex px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-lg transition-colors items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Entrar como Cida (Profissional)
            </button>

            <button
              type="button"
              onClick={() => onDemoLogin('employer')}
              className="hidden lg:inline-flex px-3 py-1.5 text-xs font-semibold text-brand dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 rounded-lg transition-colors items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Home className="w-3.5 h-3.5" />
              Entrar como Marina (Família)
            </button>

            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0"
            >
              Entrar / Cadastrar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 sm:py-14 space-y-12 flex-1">
        {/* Slide 1 & Slide 3 — Hero + Opening Question + Personas Marina & Cida */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xs transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="text-xs font-bold uppercase tracking-wider text-brand dark:text-blue-400">
                VERI (VERDADEIRO, VERIFICADO) + LAR
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight text-balance">
                “Você deixaria alguém que nunca viu entrar na sua casa, ou cuidar da sua mãe, só porque disseram que é de confiança?”
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                A <strong className="text-slate-900 dark:text-white">Verilar</strong> conecta famílias a{' '}
                <strong className="text-slate-900 dark:text-white">domésticas, diaristas, babás e cuidadoras</strong>{' '}
                onde nenhum perfil aparece nas buscas antes de ter identidade, antecedentes na Polícia Federal (renovados a cada 90 dias) e certificados checados gratuitamente.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-700 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Verificação Obrigatória e 100% Gratuita
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">
                  <QrCode className="w-4 h-4 text-brand dark:text-blue-400" />
                  Chat + Pagamento Plataforma ou Pix (0% Comissão)
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl">
                <TextStream
                  items={VERILAR_CATEGORIES}
                  prefix="Confiança Verificada"
                  height="108px"
                  fontSize="clamp(1.05rem, 2.2vw, 1.3rem)"
                />
              </div>

              <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Navegue no MVP com as duas personas da apresentação (1 clique):
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => onDemoLogin('employer')}
                  className="w-full p-4 text-left border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-blue-400 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all duration-150 group shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-brand dark:text-blue-400 flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5" />
                      Família / Cliente (Uso 100% Gratuito)
                    </span>
                    <ArrowRight className="w-4 h-4 text-brand dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {DEMO_PREVIEW_CARDS.employer.name}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    Mãe de duas crianças, trabalha fora o dia todo, sem tempo de entrevistar e com medo de abrir a porta para desconhecidos.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onDemoLogin('freelancer')}
                  className="w-full p-4 text-left border border-slate-200 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all duration-150 group shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5" />
                      Profissional Verificada (0% Comissão)
                    </span>
                    <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {DEMO_PREVIEW_CARDS.freelancer.name}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    Diarista há 15 anos que antes dependia apenas de indicação boca a boca para conseguir clientes.
                  </p>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Slides 2 & 7 — O Problema & Oportunidade de Mercado no Brasil */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
                O Problema Real
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
                Insegurança dentro de casa de um lado; falta de renda sem indicação do outro.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                A maioria das contratações domésticas no Brasil ainda acontece no escuro — por boca a boca ou grupos de redes sociais — enquanto plataformas existentes cobram caro da família para mostrar antecedentes.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pais que trabalham fora o dia todo e famílias com crianças</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Filhos de idosos dependentes e idosos que moram sozinhos</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Informalidade Alta
              </span>
              <div className="my-4">
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  23,6%
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Apenas 23,6% dos trabalhadores domésticos têm carteira assinada; a maioria depende de indicações informais.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Fonte: Poder360</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Força de Trabalho
              </span>
              <div className="my-4">
                <div className="text-3xl font-extrabold text-brand dark:text-blue-400 tabular-nums">
                  5,5 mi
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Trabalhadores domésticos no Brasil buscando clientes recorrentes com segurança e dignidade.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Fonte: gov.br</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Envelhecimento (+52%)
              </span>
              <div className="my-4">
                <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  32,1 mi
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  Brasileiros com 60 anos ou mais (~15,6% da população), crescimento de 52% em 12 anos.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Clicare / Congresso em Foco</span>
            </div>
          </div>
        </section>

        {/* Slide 5 — Como Funciona a Verificação em 3 Camadas + LGPD */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Verificação Obrigatória e Gratuita por Camadas
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                O perfil só entra nas buscas depois de verificado. A família vê exatamente o que foi checado.
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap">
              LGPD: guardamos só o resultado, nunca o documento
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-brand dark:text-blue-400 flex items-center justify-center">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono font-bold text-brand dark:text-blue-400">
                CAMADA 1 · IDENTIDADE
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Documento Oficial com Foto + Selfie
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Conferência visual entre documento oficial (RG ou CNH) e selfie enviada no cadastro para impedir perfis falsos ou uso de terceiros.
              </p>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                CAMADA 2 · ANTECEDENTES PF (90 DIAS)
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Certidão Polícia Federal Validada
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Certidão gratuita conferida no portal da PF pelo número e código de validação. Como a certidão vale <strong>90 dias</strong>, o selo exige renovação trimestral.
              </p>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <FileBadge2 className="w-5 h-5" />
              </div>
              <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                CAMADA 3 · FORMAÇÃO
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Certificado de Curso (Babás e Cuidadoras)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Cuidadoras e babás enviam o certificado do curso profissionalizante ou primeiros socorros, conferido individualmente pela moderação.
              </p>
            </div>
          </div>
        </section>

        {/* Slides 6, 8 & 9 — Concorrência e Modelo de Negócio (Confiança ≠ Visibilidade) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Comparativo com Concorrentes */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <Scale className="w-4 h-4 text-brand dark:text-blue-400" />
              Proposta de Valor vs. Concorrência
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Por que ninguém resolve os dois lados juntos como a Verilar?
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="font-bold text-emerald-900 dark:text-emerald-200">
                  Verilar — Verificação gratuita nas 3 categorias + 0% comissão
                </div>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                  Domésticas/diaristas, babás e cuidadoras verificadas sem custo. Família usa de graça; só a profissional paga se quiser mais destaque.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                  Famyle — Cobra R$ 129,99/mês da família no Premium
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  A checagem de antecedentes fica bloqueada como recurso pago pela família contratante.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white">
                  Clicare & FlagCheck — Escopo restrito
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  A Clicare atende apenas cuidadoras de idosos; o FlagCheck faz consulta avulsa e não é marketplace (indiretos: GetNinjas, Mary Help e Parafuzo).
                </p>
              </div>
            </div>
          </div>

          {/* Modelo de Negócio Justo */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              <Crown className="w-4 h-4" />
              Modelo de Negócio · Confiança ≠ Visibilidade
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Só a profissional paga, de forma opcional. Uma diária extra paga o plano várias vezes.
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs tabular-nums">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Sempre Gratuito</span>
                <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">R$ 0</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Cadastro, verificação, selo 90 dias, busca, chat, avaliações e Pix.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Verilar Destaque</span>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">R$ 9,90<span className="text-xs font-normal">/mês</span></div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Etiqueta “Em destaque” + melhor posição. (~1% da renda média).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">Destaque Pro</span>
                <div className="text-xl font-extrabold text-brand dark:text-blue-400">R$ 19,90<span className="text-xs font-normal">/mês</span></div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Topo da categoria, “Em alta” e estatísticas do perfil. (Anual: paga 10, leva 12).
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1 tabular-nums">
              <strong className="text-slate-900 dark:text-white">Viabilidade:</strong> Uma faxina simples custa de R$ 120 a R$ 300 a diária. Com ticket médio de R$ 12,90 e custo fixo estimado em R$ 3.000/mês, o ponto de equilíbrio é atingido com apenas <strong>~233 assinantes</strong> (&lt; 0,1% da categoria).
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Perguntas Frequentes sobre Segurança, LGPD e Destaque Justo
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Transparência total para famílias e profissionais domésticas.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors"
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
        </section>
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-600 dark:text-slate-400 transition-colors">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Verilar</span>
            <span>·</span>
            <span>Contratação de domésticas, diaristas, babás e cuidadoras com confiança verificada</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span>Conformidade LGPD</span>
            <span>·</span>
            <span>Certidão PF renovada a cada 90 dias</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
