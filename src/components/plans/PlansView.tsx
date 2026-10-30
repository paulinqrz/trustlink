import React, { useState } from 'react';
import {
  AuthUser,
  BillingCycle,
  FreelancerProfile,
  HighlightPlan,
} from '../../types';
import {
  ShieldCheck,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  AlertCircle,
  Scale,
} from 'lucide-react';

interface PlansViewProps {
  currentUser: AuthUser;
  ownProfile?: FreelancerProfile;
  onUpdatePlan: (plan: HighlightPlan, billingCycle: BillingCycle) => Promise<void>;
  onNavigateToProfile: () => void;
}

export const PlansView: React.FC<PlansViewProps> = ({
  currentUser,
  ownProfile,
  onUpdatePlan,
  onNavigateToProfile,
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    ownProfile?.billingCycle || 'monthly'
  );
  const [updatingPlan, setUpdatingPlan] = useState<HighlightPlan | null>(null);

  const isFreelancer = currentUser.role === 'freelancer';
  const currentPlan: HighlightPlan = ownProfile?.highlightPlan || 'free';
  const isVerified = ownProfile?.isVerified ?? false;

  const handleSelectPlan = async (plan: HighlightPlan) => {
    setUpdatingPlan(plan);
    try {
      await onUpdatePlan(plan, billingCycle);
    } finally {
      setUpdatingPlan(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 font-sans space-y-6">
      {/* Header & Core Principle */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-4 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Confiança e visibilidade nunca se misturam
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Planos Opcionais para Profissionais · 0% de Comissão
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Na Verilar, a família usa gratuitamente e a verificação em camadas (Identidade, Polícia Federal 90 dias e Curso) é{' '}
              <strong className="text-slate-900 dark:text-white">sempre obrigatória e 100% gratuita</strong>.
              Só assina plano quem já foi verificada e deseja mais posição nas buscas.
            </p>
          </div>

          {/* Monthly vs Annual Toggle (Slide 8: paga 10 meses e leva 12) */}
          <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1 self-start shrink-0 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Anual (Paga 10, leva 12)
            </button>
          </div>
        </div>

        {isFreelancer && !isVerified && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 text-amber-950 dark:text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  Regra do Destaque Justo: seu perfil ainda aguarda verificação gratuita
                </span>
                <span>
                  Apenas perfis já verificados podem comprar destaque. Conclua seu envio gratuito de documento e certidão da PF para liberar os planos.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onNavigateToProfile}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              Fazer Verificação Gratuita →
            </button>
          </div>
        )}
      </div>

      {/* 3 Pricing Tiers (Slide 8) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tier 1: Sempre Gratuito */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6 transition-colors">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Base obrigatória para todas
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Sempre Gratuito
              </h2>
              <div className="mt-3 flex items-baseline gap-1 tabular-nums">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  R$ 0
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  / para sempre · 0% comissão
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Tudo o que você precisa para provar sua confiança e fechar diárias sem depender só do boca a boca.
              </p>
            </div>

            <ul className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Cadastro e perfil completo com histórico</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Verificação gratuita em camadas (Identidade + PF 90 dias + Curso)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Aparição normal nas buscas das famílias</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Chat ilimitado, avaliações 1–5 estrelas e pagamento por Pix ou Plataforma</span>
              </li>
            </ul>
          </div>

          {isFreelancer ? (
            <button
              type="button"
              disabled={currentPlan === 'free' || updatingPlan !== null}
              onClick={() => void handleSelectPlan('free')}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                currentPlan === 'free'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default'
                  : 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800'
              }`}
            >
              {currentPlan === 'free' ? 'Plano Atual Ativo' : 'Voltar ao Plano Gratuito'}
            </button>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Para famílias clientes, toda a plataforma é 100% gratuita.
            </div>
          )}
        </div>

        {/* Tier 2: Verilar Destaque (R$ 9,90/mês) */}
        <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/80 rounded-xl p-6 flex flex-col justify-between space-y-6 transition-colors">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                ~1% da renda média da categoria
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Verilar Destaque
              </h2>
              <div className="mt-3 flex items-baseline gap-1.5 tabular-nums">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {billingCycle === 'monthly' ? 'R$ 9,90' : 'R$ 8,25'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  /mês {billingCycle === 'annual' ? '(R$ 99,00/ano)' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Ideal para diaristas, babás e cuidadoras que querem preencher dias vagos na agenda rapidamente.
              </p>
            </div>

            <ul className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>Tudo do plano Sempre Gratuito (0% comissão)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Etiqueta <strong>“Em destaque”</strong> (visualmente separada do selo de verificação)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>Melhor posição nos resultados de busca da sua profissão</span>
              </li>
            </ul>
          </div>

          {isFreelancer ? (
            <button
              type="button"
              disabled={currentPlan === 'destaque' || updatingPlan !== null}
              onClick={() => void handleSelectPlan('destaque')}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                currentPlan === 'destaque'
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 cursor-default'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {currentPlan === 'destaque'
                ? 'Plano Atual da Cida'
                : updatingPlan === 'destaque'
                ? 'Atualizando...'
                : 'Ativar Verilar Destaque'}
            </button>
          ) : (
            <div className="text-xs text-amber-800 dark:text-amber-300 pt-2 border-t border-slate-100 dark:border-slate-800">
              Exclusivo e opcional para profissionais verificadas.
            </div>
          )}
        </div>

        {/* Tier 3: Verilar Destaque Pro (R$ 19,90/mês) */}
        <div className="bg-white dark:bg-slate-900 border-2 border-brand dark:border-sky-500 rounded-xl p-6 flex flex-col justify-between space-y-6 transition-colors">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-brand dark:text-sky-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Máxima visibilidade + Estatísticas
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Verilar Destaque Pro
              </h2>
              <div className="mt-3 flex items-baseline gap-1.5 tabular-nums">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {billingCycle === 'monthly' ? 'R$ 19,90' : 'R$ 16,58'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  /mês {billingCycle === 'annual' ? '(R$ 199,00/ano)' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Uma única diária extra no mês (R$ 120 a R$ 300) já paga o plano várias vezes.
              </p>
            </div>

            <ul className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand dark:text-sky-400 shrink-0 mt-0.5" />
                <span>Tudo do Verilar Destaque</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand dark:text-sky-400 shrink-0 mt-0.5" />
                <span>Posição no topo da categoria escolhida</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand dark:text-sky-400 shrink-0 mt-0.5" />
                <span>
                  Aparição na vitrine especial <strong>“Profissionais em Alta”</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <BarChart3 className="w-4 h-4 text-brand dark:text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Estatísticas completas do perfil</strong> (buscas, cliques e pedidos de chat)
                </span>
              </li>
            </ul>
          </div>

          {isFreelancer ? (
            <button
              type="button"
              disabled={currentPlan === 'destaque_pro' || updatingPlan !== null}
              onClick={() => void handleSelectPlan('destaque_pro')}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                currentPlan === 'destaque_pro'
                  ? 'bg-blue-50 dark:bg-sky-950/60 text-brand dark:text-sky-300 border border-brand/30 cursor-default'
                  : 'bg-brand hover:bg-brand-hover text-white'
              }`}
            >
              {currentPlan === 'destaque_pro'
                ? 'Plano Destaque Pro Ativo'
                : updatingPlan === 'destaque_pro'
                ? 'Atualizando...'
                : 'Fazer Upgrade para Destaque Pro'}
            </button>
          ) : (
            <div className="text-xs text-brand dark:text-sky-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Alternar para o perfil da Cida no topo permite testar a troca de planos ao vivo.
            </div>
          )}
        </div>
      </div>

      {/* Destaque Justo + Viabilidade e Concorrência (Slides 6, 8 e 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3 transition-colors">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
             Compromisso de Destaque Justo
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <li>
              <strong className="text-slate-900 dark:text-white">1. Só verificadas compram destaque:</strong>{' '}
              nenhum pagamento substitui documento oficial, selfie ou certidão da Polícia Federal.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-white">2. Limite por busca:</strong>{' '}
              limitamos o número de perfis patrocinados por busca para que profissionais do plano gratuito continuem sendo encontradas.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-white">3. Etiqueta visual distinta:</strong>{' '}
              a família sabe exatamente o que é o Selo Verde de Verificação e o que é a etiqueta âmbar “Em destaque”.
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-3 transition-colors tabular-nums">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <BarChart3 className="w-4 h-4 text-brand dark:text-sky-400" />
            Preço Acessível vs. Mercado
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Outras plataformas (ex: Famyle)
              </span>
              <span className="text-sm font-bold text-rose-700 dark:text-rose-400 mt-0.5 block">
                R$ 129,99/mês p/ família
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Checagem presa no plano pago
              </span>
            </div>

            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/70">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block">
                Modelo Verilar
              </span>
              <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mt-0.5 block">
                Checagem R$ 0 · Planos 1%–2%
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Equilíbrio com ~233 assinantes (&lt;0,1% do setor)
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Com diária média entre <strong>R$ 120 e R$ 300</strong>, apenas uma faxina ou plantão extra fechado pela plataforma paga vários meses de assinatura.
          </p>
        </div>
      </div>
    </div>
  );
};
