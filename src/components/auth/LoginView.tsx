import React, { useState } from 'react';
import { AuthUser } from '../../types';
import { testUsers } from '../../data/mockData';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key, 
  UserCheck, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  ArrowLeft,
  HeartHandshake,
  Home,
  Clock,
  Sparkles
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: AuthUser) => void;
  onBackToHome?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onBackToHome }) => {
  const [email, setEmail] = useState('maria.clara@trustlink.org');
  const [password, setPassword] = useState('senha123');
  const [rememberMe, setRememberMe] = useState(true);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('beatriz')) {
      onLogin(testUsers.employer);
    } else {
      onLogin(testUsers.freelancer);
    }
  };

  const handleSelectQuickUser = (role: 'freelancer' | 'employer') => {
    const user = testUsers[role];
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col justify-center py-10 px-4 sm:px-6 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 mb-4 font-semibold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para a Página Inicial
          </button>
        )}

        {/* Logo and Header */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0a66c2] text-white font-bold text-lg shadow-xs mb-3">
          TL
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Acesse sua conta no TrustLink
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          A rede profissional de confiança para contratação segura de cuidadores de idosos, técnicos de enfermagem e serviços domésticos.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Seção 1: Escolha do Perfil de Demonstração com Explicações Claras */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Escolha um perfil para testar em 1 clique:
              </span>
              <span className="text-[11px] text-[#0a66c2] font-semibold">
                Demonstração Interativa
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Opção 1: Visão Cuidadora / Empregada */}
              <button
                type="button"
                onClick={() => handleSelectQuickUser('freelancer')}
                className="p-4 text-left border-2 border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/30 rounded-xl transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                      <HeartHandshake className="w-3 h-3 text-emerald-700" />
                      Perfil Profissional & Especialista
                    </span>
                    <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Maria Clara Silveira
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      Cuidadora Geriátrica & Enfermagem
                    </p>
                  </div>

                  {/* Explicação clara do que este perfil faz */}
                  <div className="text-[11px] text-slate-600 space-y-1 pt-1.5 border-t border-slate-200/60 leading-relaxed">
                    <p className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Exibe certidões e antecedentes criminais da Polícia Federal auditados.</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Ativa status de plantão urgente no Radar 10km para cobrir faltas.</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Recebe propostas com contrato digital e termos de sigilo.</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  Acessar Área do Profissional →
                </div>
              </button>

              {/* Opção 2: Contratante / Família */}
              <button
                type="button"
                onClick={() => handleSelectQuickUser('employer')}
                className="p-4 text-left border-2 border-slate-200 hover:border-[#0a66c2] bg-slate-50 hover:bg-blue-50/30 rounded-xl transition-all group flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0a66c2] bg-blue-100/80 px-2 py-0.5 rounded">
                      <Home className="w-3 h-3 text-[#0a66c2]" />
                      Perfil Contratante & Família
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#0a66c2] group-hover:translate-x-1 transition-transform" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Dra. Beatriz Fontana
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      Família Contratante Auditada
                    </p>
                  </div>

                  {/* Explicação clara do que este perfil faz */}
                  <div className="text-[11px] text-slate-600 space-y-1 pt-1.5 border-t border-slate-200/60 leading-relaxed">
                    <p className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#0a66c2] shrink-0 mt-0.5" />
                      <span>Catálogo completo de cuidadores e especialistas certificados.</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#0a66c2] shrink-0 mt-0.5" />
                      <span>Acesso exclusivo à Rede Sigilosa com notas de honestidade e discrição.</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#0a66c2] shrink-0 mt-0.5" />
                      <span>Gerencia vagas de plantão e pipeline de contratação em Kanban.</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-xs font-semibold text-[#0a66c2] group-hover:text-[#004182]">
                  Acessar Área do Contratante →
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-3 text-slate-400 text-xs font-semibold">
              Ou entre com e-mail cadastrado
            </span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Seção 2: Formulário Tradicional com Linguagem Amigável */}
          <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                E-mail cadastrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0a66c2] focus:outline-hidden text-xs text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Use <strong>maria.clara@trustlink.org</strong> ou <strong>beatriz.fontana@hospital.org</strong>
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Senha de acesso
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0a66c2] focus:outline-hidden text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Explicação da Manutenção de Sessão */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#0a66c2] focus:ring-[#0a66c2]"
                />
                <span>Lembrar de mim neste dispositivo (Sessão contínua de 30 dias)</span>
              </label>
              <p className="text-[11px] text-slate-500 pl-5 leading-relaxed">
                Você não será deslogado inesperadamente ao fechar a aba ou navegar pela plataforma.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] rounded-lg transition-colors shadow-xs text-sm"
            >
              Entrar na Plataforma
            </button>
          </form>

          {/* Garantias de Segurança e Privacidade no Rodapé */}
          <div className="pt-3 border-t border-slate-100 space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Ambiente Protegido e Confiável</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
              Todos os relatos e avaliações são confidenciais e sigilosos para manter a igualdade de oportunidades. 
              Apenas contratantes com serviços concluídos podem registrar avaliações.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
