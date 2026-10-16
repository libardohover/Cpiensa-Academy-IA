import React from 'react';
import { Sparkles, User, Globe, Menu } from 'lucide-react';
import simboloCpiensa from '../../assets/images/cpiensa-simbolo.png';
import { UserProfile, TenantOrg, UserRole } from '../../types';
import { MenuUsuario } from './MenuUsuario';
import { NOMBRE_ROL, puedeAcceder } from '../../auth/permisos';

interface TopBarProps {
  user: UserProfile;
  currentOrg: TenantOrg;
  onOpenTutor: () => void;
  onNavigate: (section: string) => void;
  activeSection: string;
  onAbrirMenu: () => void;
  onCambiarRol: (rol: UserRole) => void;
  onCerrarSesion: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  currentOrg,
  onOpenTutor,
  onNavigate,
  activeSection,
  onAbrirMenu,
  onCambiarRol,
  onCerrarSesion,
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
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('inicio');
          }}
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-700 transition-colors"
        >
          <img src={simboloCpiensa} alt="" className="h-7 w-auto" />
          <span>
            CPIENSA<span className="text-blue-500">+</span>
            <span className="hidden sm:inline"> ACADEMY IA</span>
          </span>
        </a>
        <span className="hidden min-[1800px]:inline-block text-xs text-slate-400" aria-hidden="true">
          ·
        </span>
        <span className="hidden min-[1800px]:inline-block text-xs font-medium text-slate-600 truncate max-w-[200px]">
          {currentOrg.name}
        </span>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden min-[1560px]:flex items-center gap-5 text-sm font-medium text-slate-600">
        <button
          onClick={() => onNavigate('inicio')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'inicio' ? 'text-slate-900 font-semibold border-b-2 border-blue-500 pb-0.5' : ''
          }`}
        >
          Inicio
        </button>
        <button
          onClick={() => onNavigate('campus')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'campus' ? 'text-slate-900 font-semibold border-b-2 border-blue-500 pb-0.5' : ''
          }`}
        >
          Campus LMS
        </button>
        <button
          onClick={() => onNavigate('aihub')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'aihub' ? 'text-slate-900 font-semibold border-b-2 border-blue-500 pb-0.5' : ''
          }`}
        >
          AI Hub
        </button>
        <button
          onClick={() => onNavigate('promptlab')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'promptlab' ? 'text-slate-900 font-semibold border-b-2 border-blue-500 pb-0.5' : ''
          }`}
        >
          Prompt Lab
        </button>
        {puedeAcceder(user.role, 'automation') && (
          <button
            onClick={() => onNavigate('automation')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              activeSection === 'automation' ? 'text-slate-900 font-semibold border-b-2 border-blue-500 pb-0.5' : ''
            }`}
          >
            Automatizaciones
          </button>
        )}
        <button
          onClick={() => onNavigate('marketplace')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            activeSection === 'marketplace' ? 'text-slate-900 font-semibold border-b-2 border-blue-500 pb-0.5' : ''
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

        <div className="pl-2 sm:pl-3 border-l border-slate-200">
          <MenuUsuario
            user={user}
            organizacion={currentOrg}
            onIrAInicio={() => onNavigate('inicio')}
            onAbrirTutor={onOpenTutor}
            onCambiarRol={onCambiarRol}
            onCerrarSesion={onCerrarSesion}
          />
        </div>
      </div>
    </header>
  );
};
