import React from 'react';
import { Sparkles, User, Globe, Menu } from 'lucide-react';
import { UserProfile, TenantOrg } from '../../types';
import { NOMBRE_ROL, puedeAcceder } from '../../auth/permisos';

interface TopBarProps {
  user: UserProfile;
  currentOrg: TenantOrg;
  onOpenTutor: () => void;
  onNavigate: (section: string) => void;
  activeSection: string;
  onAbrirMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  currentOrg,
  onOpenTutor,
  onNavigate,
  activeSection,
  onAbrirMenu,
}) => {
  return (
    <header className="flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onAbrirMenu}
          className="lg:hidden -ml-2 p-2 rounded-md text-slate-700 hover:bg-slate-100"
          aria-label="Abrir menú de subsistemas"
        >
          <Menu className="w-5 h-5" />
        </button>
        <a
          href="#campus"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('campus');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-700 transition-colors"
        >
          CPIENSA+ ACADEMY IA
        </a>
        <span className="hidden 2xl:inline-block text-xs text-slate-400" aria-hidden="true">
          ·
        </span>
        <span className="hidden 2xl:inline-block text-xs font-medium text-slate-600 truncate max-w-[200px]">
          {currentOrg.name}
        </span>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden min-[1400px]:flex items-center gap-5 text-sm font-medium text-slate-600">
        <button
          onClick={() => onNavigate('campus')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'campus' ? 'text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5' : ''
          }`}
        >
          Campus LMS
        </button>
        <button
          onClick={() => onNavigate('aihub')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'aihub' ? 'text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5' : ''
          }`}
        >
          AI Hub
        </button>
        <button
          onClick={() => onNavigate('promptlab')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'promptlab' ? 'text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5' : ''
          }`}
        >
          Prompt Lab
        </button>
        {puedeAcceder(user.role, 'automation') && (
          <button
            onClick={() => onNavigate('automation')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'automation' ? 'text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5' : ''
            }`}
          >
            Automatizaciones
          </button>
        )}
        <button
          onClick={() => onNavigate('marketplace')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'marketplace' ? 'text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5' : ''
          }`}
        >
          Marketplace
        </button>
      </nav>

      {/* Zone 3: 1 primary action with secondary user info */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenTutor}
          aria-label="Tutor Socrático"
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Tutor Socrático</span>
        </button>

        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs text-slate-600">
          <span className="hidden 2xl:inline font-medium text-slate-800 truncate max-w-[140px]">{user.name}</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-semibold whitespace-nowrap">
            {NOMBRE_ROL[user.role]}
          </span>
        </div>
      </div>
    </header>
  );
};
