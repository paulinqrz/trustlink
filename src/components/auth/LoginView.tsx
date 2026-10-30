import React, { useState } from 'react';
import { AuthUser, ProfessionCategory } from '../../types';
import { DEMO_PREVIEW_CARDS, trustlinkService } from '../../services/trustlinkService';
import { ThemeToggleButton } from '../common/ThemeContext';
import {
  ShieldCheck,
  Mail,
  Key,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  HeartHandshake,
  Home,
  UserPlus,
  AlertCircle,
  User,
  MapPin,
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: AuthUser) => void;
  onBackToHome?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onBackToHome }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'freelancer' | 'employer'>('freelancer');
  const [category, setCategory] = useState<ProfessionCategory>('Doméstica / Diarista');
  const [neighborhood, setNeighborhood] = useState('Vila Mariana');
  const [dailyRate, setDailyRate] = useState('180');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const user = await trustlinkService.loginWithPassword(email, password, rememberMe);
        onLogin(user);
      } else {
        const user = await trustlinkService.registerAccount({
          name,
          email,
          password,
          role,
          category: role === 'freelancer' ? category : undefined,
          neighborhood: role === 'freelancer' ? neighborhood : undefined,
          dailyRate: role === 'freelancer' ? Number(dailyRate) || 180 : undefined,
        });
        onLogin(user);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Falha na autenticação.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectQuickUser = async (targetRole: 'freelancer' | 'employer') => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const user = await trustlinkService.demoLogin(targetRole);
      onLogin(user);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao iniciar sessão de demonstração.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 font-sans transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex items-center justify-between mb-6">
          {onBackToHome ? (
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar para a Apresentação Verilar
            </button>
          ) : (
            <span />
          )}
          <ThemeToggleButton />
        </div>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand text-white font-bold text-lg shadow-xs mb-3">
            VL
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Entrar ou Cadastrar na Verilar
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Cadastro gratuito de Família (Cliente) e de Prestadora (Doméstica/Diarista, Babá ou Cuidadora).
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
          {/* Acesso Rápido com Personas (Marina & Cida) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Personas do MVP Verilar (1 clique):
              </span>
              <span className="text-[11px] text-brand dark:text-blue-400 font-semibold">
                Sessão Real SQLite
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleSelectQuickUser('employer')}
                className="p-4 text-left border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-blue-400 disabled:opacity-60 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/30 dark:hover:bg-slate-800 rounded-xl transition-all duration-150 group flex flex-col justify-between shadow-2xs cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand dark:text-blue-400">
                      <Home className="w-3.5 h-3.5" />
                      Família / Cliente
                    </span>
                    <ArrowRight className="w-4 h-4 text-brand dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {DEMO_PREVIEW_CARDS.employer.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Mãe de 2 crianças · Uso gratuito
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pt-1.5 border-t border-slate-200/60 dark:border-slate-700 leading-relaxed">
                    <p className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-brand dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>Filtra apenas perfis já verificados (PF 90 dias).</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-brand dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>Combina no chat, paga por Pix e avalia de 1 a 5★.</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-xs font-semibold text-brand dark:text-blue-400">
                  Entrar como Marina →
                </div>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleSelectQuickUser('freelancer')}
                className="p-4 text-left border border-slate-200 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-500 disabled:opacity-60 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/30 dark:hover:bg-slate-800 rounded-xl transition-all duration-150 group flex flex-col justify-between shadow-2xs cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      <HeartHandshake className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      Prestadora Verificada
                    </span>
                    <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {DEMO_PREVIEW_CARDS.freelancer.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Diarista há 15 anos · 0% comissão
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pt-1.5 border-t border-slate-200/60 dark:border-slate-700 leading-relaxed">
                    <p className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>Verificação gratuita por camadas e renovação 90 dias.</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>Planos opcionais Destaque (R$ 9,90) e Pro (R$ 19,90).</span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Entrar como Cida →
                </div>
              </button>
            </div>
          </div>

          {/* Alternador Login / Cadastro */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-md transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Entrar com Senha
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Cadastrar Cliente / Prestadora
            </button>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={(e) => void handleManualSubmit(e)} className="space-y-4 text-xs">
            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="reg-name" className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="reg-name"
                      type="text"
                      required
                      minLength={3}
                      placeholder="Ex: Maria Aparecida Santos"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand focus:outline-hidden text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reg-role" className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      Tipo de Cadastro
                    </label>
                    <select
                      id="reg-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'freelancer' | 'employer')}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                    >
                      <option value="freelancer">Prestadora (Profissional)</option>
                      <option value="employer">Cliente (Família)</option>
                    </select>
                  </div>

                  {role === 'freelancer' && (
                    <div>
                      <label htmlFor="reg-category" className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        Profissão na Verilar
                      </label>
                      <select
                        id="reg-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ProfessionCategory)}
                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="Doméstica / Diarista">Doméstica / Faxineira / Diarista</option>
                        <option value="Babá">Babá</option>
                        <option value="Cuidadora">Cuidadora de Idosos</option>
                      </select>
                    </div>
                  )}
                </div>

                {role === 'freelancer' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reg-neighborhood" className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          Bairro de Atendimento
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            id="reg-neighborhood"
                            type="text"
                            required
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="reg-rate" className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                          Valor Base da Diária (R$)
                        </label>
                        <input
                          id="reg-rate"
                          type="number"
                          min={80}
                          max={1000}
                          required
                          value={dailyRate}
                          onChange={(e) => setDailyRate(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                      <strong>Regra de Segurança Verilar:</strong> Ao concluir o cadastro, seu perfil ficará oculto nas buscas até você enviar a verificação gratuita (RG + Selfie, Certidão PF 90 dias{category !== 'Doméstica / Diarista' ? ' e Certificado do Curso' : ''}).
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label htmlFor="login-email" className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                E-mail de acesso
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="Ex: marina@verilar.com.br ou cida@verilar.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand focus:outline-hidden text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              {mode === 'login' && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Contas demo no SQLite: <strong>marina@verilar.com.br</strong> ou{' '}
                  <strong>cida@verilar.com.br</strong> · Senha: <code>verilar123</code>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Senha {mode === 'register' ? '(mínimo 6 caracteres)' : ''}
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="login-password"
                  type="password"
                  required
                  minLength={mode === 'register' ? 6 : 4}
                  placeholder={
                    mode === 'login'
                      ? 'Digite sua senha (ex: verilar123)'
                      : 'Crie uma senha segura'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand focus:outline-hidden text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {mode === 'login' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                <label
                  htmlFor="login-remember"
                  className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-200 font-medium"
                >
                  <input
                    id="login-remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 text-brand focus:ring-brand"
                  />
                  <span>Manter sessão conectada neste dispositivo</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 font-semibold text-white bg-brand hover:bg-brand-hover disabled:opacity-60 rounded-lg transition-colors shadow-xs text-sm cursor-pointer"
            >
              {submitting
                ? 'Autenticando no servidor...'
                : mode === 'login'
                ? 'Entrar na Verilar'
                : 'Criar Conta Gratuita na Verilar'}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Proteção LGPD · Guarda apenas do resultado da verificação</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
