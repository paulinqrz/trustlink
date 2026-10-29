import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Radio, 
  Briefcase, 
  Sparkles, 
  LogOut, 
  ChevronDown, 
  Users, 
  SwitchCamera,
  FileCheck2,
  Search
} from 'lucide-react';
import { AuthUser } from '../../types';

export type ActiveTab = 'catalog' | 'freelancer' | 'radar' | 'employer' | 'feed' | 'tech_lead' | 'jobs';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentUser: AuthUser;
  onSwitchUser: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  onTabChange, 
  currentUser,
  onSwitchUser,
  onLogout
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Logo Brand & Subtitle */}
          <div 
            onClick={() => onTabChange(currentUser.role === 'employer' ? 'catalog' : 'freelancer')}
            className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              TL
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  TrustLink
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-500 font-medium">
                  · LinkedIn da Confiança
                </span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-slate-700">
                  {currentUser.role === 'freelancer' ? 'Área do Profissional (Maria Clara)' : 'Área do Contratante (Dra. Beatriz)'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            {currentUser.role === 'employer' ? (
              <>
                <button
                  onClick={() => onTabChange('catalog')}
                  className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'catalog'
                      ? 'bg-slate-100 text-[#0a66c2] font-bold border border-slate-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#0a66c2]" />
                  Catálogo de Cuidadores
                </button>

                <button
                  onClick={() => onTabChange('employer')}
                  className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'employer'
                      ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-slate-600" />
                  Meus Anúncios & Candidaturas
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onTabChange('freelancer')}
                  className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'freelancer'
                      ? 'bg-slate-100 text-emerald-800 font-bold border border-slate-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  Meu Perfil & Selos
                </button>

                <button
                  onClick={() => onTabChange('jobs')}
                  className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'jobs'
                      ? 'bg-slate-100 text-[#0a66c2] font-bold border border-slate-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-[#0a66c2]" />
                  Vagas Disponíveis
                </button>
              </>
            )}

            <button
              onClick={() => onTabChange('radar')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'radar'
                  ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Radio className="w-4 h-4 text-amber-600" />
              Radar de Urgência (10km)
            </button>

            <button
              onClick={() => onTabChange('feed')}
              className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'feed'
                  ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-slate-600" />
              Feed da Confiança
            </button>
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={onSwitchUser}
              title={currentUser.role === 'freelancer' ? 'Alternar para Área do Contratante' : 'Alternar para Área do Profissional'}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
            >
              <SwitchCamera className="w-3.5 h-3.5 text-[#0a66c2]" />
              <span>Alternar Perfil</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.name.split(' ')[0]} {currentUser.name.split(' ').slice(-1)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {currentUser.role === 'freelancer' ? 'Profissional / Cuidadora' : 'Contratante / Família'}
                  </div>
                </div>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  currentUser.role === 'freelancer' ? 'bg-emerald-700' : 'bg-[#0a66c2]'
                }`}>
                  {currentUser.avatarInitials}
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      CONECTADO COMO
                    </span>
                    <span className="font-bold text-slate-900 text-sm block mt-0.5">
                      {currentUser.name}
                    </span>
                    <span className="text-slate-500 text-[11px] block">
                      {currentUser.email}
                    </span>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {currentUser.role === 'freelancer' ? 'Conta de Profissional Verificada' : 'Conta de Contratante Residencial'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onSwitchUser();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between text-slate-700 font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#0a66c2]" />
                        <span>Alternar para {currentUser.role === 'freelancer' ? 'Área do Contratante (Dra. Beatriz)' : 'Área do Profissional (Maria Clara)'}</span>
                      </div>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair / Ir para Tela Inicial</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile secondary tab bar */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 border-t border-slate-100 text-xs">
          {currentUser.role === 'employer' ? (
            <>
              <button
                onClick={() => onTabChange('catalog')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-medium ${
                  activeTab === 'catalog' ? 'bg-[#0a66c2] text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Catálogo de Cuidadores
              </button>
              <button
                onClick={() => onTabChange('employer')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-medium ${
                  activeTab === 'employer' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Meus Anúncios
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onTabChange('freelancer')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-medium ${
                  activeTab === 'freelancer' ? 'bg-emerald-800 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Meu Perfil
              </button>
              <button
                onClick={() => onTabChange('jobs')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-medium ${
                  activeTab === 'jobs' ? 'bg-[#0a66c2] text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Vagas LinkedIn
              </button>
            </>
          )}

          <button
            onClick={() => onTabChange('radar')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-medium ${
              activeTab === 'radar' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Radar Urgência (10km)
          </button>
          <button
            onClick={() => onTabChange('feed')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-medium ${
              activeTab === 'feed' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Feed
          </button>
          <button
            onClick={onSwitchUser}
            className="px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-medium text-[#0a66c2] bg-blue-50 border border-blue-200"
          >
            Alternar Perfil
          </button>
        </div>
      </div>
    </header>
  );
};
