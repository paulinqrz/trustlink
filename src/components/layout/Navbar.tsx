import React, { useEffect, useRef, useState } from 'react';
import {
  UserCheck,
  Radio,
  Briefcase,
  Sparkles,
  LogOut,
  ChevronDown,
  Users,
  SwitchCamera,
  MessageSquare,
  Crown,
} from 'lucide-react';
import { AuthUser } from '../../types';
import { ThemeToggleButton } from '../common/ThemeContext';

export type ActiveTab =
  | 'catalog'
  | 'freelancer'
  | 'chat'
  | 'plans'
  | 'radar'
  | 'employer'
  | 'feed'
  | 'jobs';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentUser: AuthUser;
  onSwitchUser: () => void;
  onLogout: () => void;
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  activeClassName?: string;
  mobile?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({
  active,
  onClick,
  icon,
  label,
  activeClassName = 'bg-slate-100 text-slate-900 font-bold border border-slate-200 shadow-2xs dark:bg-slate-800 dark:text-white dark:border-slate-700',
  mobile = false,
}) => {
  if (mobile) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-medium transition-all duration-150 cursor-pointer ${
          active
            ? activeClassName
            : 'text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700'
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
        active
          ? activeClassName
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onSwitchUser,
  onLogout,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand Lockup — clean mark + Verilar name */}
          <button
            type="button"
            onClick={() => onTabChange(currentUser.role === 'employer' ? 'catalog' : 'freelancer')}
            className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group text-left rounded-lg focus:outline-2 focus:outline-brand"
          >
            <div className="w-9 h-9 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-sm shadow-xs">
              VL
            </div>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-brand dark:group-hover:text-blue-400 transition-colors">
              Verilar
            </span>
          </button>

          {/* Primary Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold" aria-label="Navegação principal">
            {currentUser.role === 'employer' ? (
              <>
                <TabButton
                  active={activeTab === 'catalog'}
                  onClick={() => onTabChange('catalog')}
                  icon={<Users className="w-4 h-4 text-brand dark:text-blue-400" />}
                  label="Buscar Profissionais"
                  activeClassName="bg-slate-100 text-brand font-bold border border-slate-200 shadow-2xs dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700"
                />
                <TabButton
                  active={activeTab === 'chat'}
                  onClick={() => onTabChange('chat')}
                  icon={<MessageSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
                  label="Chat & Pix"
                />
                <TabButton
                  active={activeTab === 'employer'}
                  onClick={() => onTabChange('employer')}
                  icon={<Briefcase className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                  label="Minhas Vagas"
                />
                <TabButton
                  active={activeTab === 'radar'}
                  onClick={() => onTabChange('radar')}
                  icon={<Radio className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                  label="Radar"
                />
                <TabButton
                  active={activeTab === 'plans'}
                  onClick={() => onTabChange('plans')}
                  icon={<Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                  label="Planos & Modelo"
                />
              </>
            ) : (
              <>
                <TabButton
                  active={activeTab === 'freelancer'}
                  onClick={() => onTabChange('freelancer')}
                  icon={<UserCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
                  label="Meu Perfil & Verificação"
                  activeClassName="bg-slate-100 text-emerald-800 font-bold border border-slate-200 shadow-2xs dark:bg-slate-800 dark:text-emerald-300 dark:border-slate-700"
                />
                <TabButton
                  active={activeTab === 'chat'}
                  onClick={() => onTabChange('chat')}
                  icon={<MessageSquare className="w-4 h-4 text-brand dark:text-blue-400" />}
                  label="Chat & Pix"
                />
                <TabButton
                  active={activeTab === 'plans'}
                  onClick={() => onTabChange('plans')}
                  icon={<Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                  label="Planos Destaque"
                />
                <TabButton
                  active={activeTab === 'jobs'}
                  onClick={() => onTabChange('jobs')}
                  icon={<Briefcase className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                  label="Vagas"
                />
                <TabButton
                  active={activeTab === 'radar'}
                  onClick={() => onTabChange('radar')}
                  icon={<Radio className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                  label="Radar"
                />
              </>
            )}
          </nav>

          {/* User & Theme Controls */}
          <div className="flex items-center gap-2 relative shrink-0">
            <ThemeToggleButton showLabel={false} className="px-2.5 py-2" />

            <button
              type="button"
              onClick={onSwitchUser}
              title={
                currentUser.role === 'freelancer'
                  ? 'Alternar para Família (Marina)'
                  : 'Alternar para Profissional (Cida)'
              }
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <SwitchCamera className="w-3.5 h-3.5 text-brand dark:text-blue-400" />
              <span>Alternar Perfil</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={menuContainerRef}>
              <button
                type="button"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 pl-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight whitespace-nowrap">
                    {currentUser.name.split(' ')[0]} {currentUser.name.split(' ').slice(-1)}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                    {currentUser.role === 'freelancer'
                      ? 'Prestadora Verificada'
                      : 'Família / Cliente'}
                  </div>
                </div>

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                    currentUser.role === 'freelancer' ? 'bg-emerald-700' : 'bg-brand'
                  }`}
                >
                  {currentUser.avatarInitials}
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 text-xs"
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 block">
                      CONECTADO NA VERILAR
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm block mt-0.5">
                      {currentUser.name}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-[11px] block">
                      {currentUser.email}
                    </span>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {currentUser.role === 'freelancer'
                        ? 'Prestadora · 0% Comissão nos Serviços'
                        : 'Família Cliente · Busca 100% Gratuita'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onTabChange('feed');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Mural de Conquistas & Certificados</span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onSwitchUser();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-brand dark:text-blue-400" />
                        <span>
                          Alternar para{' '}
                          {currentUser.role === 'freelancer'
                            ? 'Família (Marina, 38)'
                            : 'Prestadora (Cida, 47)'}
                        </span>
                      </div>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair / Ver Apresentação Verilar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile secondary tab bar */}
        <nav
          className="md:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 border-t border-slate-100 dark:border-slate-800 text-xs"
          aria-label="Navegação móvel"
        >
          {currentUser.role === 'employer' ? (
            <>
              <TabButton
                mobile
                active={activeTab === 'catalog'}
                onClick={() => onTabChange('catalog')}
                label="Buscar"
                activeClassName="bg-brand text-white"
              />
              <TabButton
                mobile
                active={activeTab === 'chat'}
                onClick={() => onTabChange('chat')}
                label="Chat & Pix"
                activeClassName="bg-emerald-700 text-white"
              />
              <TabButton
                mobile
                active={activeTab === 'employer'}
                onClick={() => onTabChange('employer')}
                label="Vagas"
                activeClassName="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              />
            </>
          ) : (
            <>
              <TabButton
                mobile
                active={activeTab === 'freelancer'}
                onClick={() => onTabChange('freelancer')}
                label="Meu Perfil"
                activeClassName="bg-emerald-800 text-white"
              />
              <TabButton
                mobile
                active={activeTab === 'chat'}
                onClick={() => onTabChange('chat')}
                label="Chat & Pix"
                activeClassName="bg-brand text-white"
              />
              <TabButton
                mobile
                active={activeTab === 'jobs'}
                onClick={() => onTabChange('jobs')}
                label="Vagas"
                activeClassName="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              />
            </>
          )}

          <TabButton
            mobile
            active={activeTab === 'plans'}
            onClick={() => onTabChange('plans')}
            label="Planos"
            activeClassName="bg-amber-600 text-white"
          />
          <TabButton
            mobile
            active={activeTab === 'radar'}
            onClick={() => onTabChange('radar')}
            label="Radar"
            activeClassName="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
          />
          <button
            type="button"
            onClick={onSwitchUser}
            className="px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-medium text-brand dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60"
          >
            Alternar Perfil
          </button>
        </nav>
      </div>
    </header>
  );
};
