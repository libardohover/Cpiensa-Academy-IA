import React from 'react';
import {
  GraduationCap,
  Cpu,
  Terminal,
  Bot,
  Workflow,
  BookOpen,
  Layout,
  BarChart3,
  ShieldCheck,
  ShoppingBag,
  Layers,
  Building2,
  UserCheck,
  Lock,
  Home,
} from 'lucide-react';
import { TenantOrg, UserRole } from '../../types';
import simboloCpiensa from '../../assets/images/cpiensa-simbolo.png';
import { DESCRIPCION_ROL, NOMBRE_ROL, SECCIONES_POR_ROL, puedeAcceder, puedeCambiarInstitucion, rolMinimo } from '../../auth/permisos';

interface SidebarProps {
  /** En pantallas pequeñas el menú es un panel deslizable. */
  abierto: boolean;
  onCerrar: () => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
  organizations: TenantOrg[];
  currentOrg: TenantOrg;
  onSelectOrg: (org: TenantOrg) => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  abierto,
  onCerrar,
  activeSection,
  onSelectSection,
  organizations,
  currentOrg,
  onSelectOrg,
  currentRole,
  onChangeRole,
}) => {
  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home, code: '' },
    { id: 'campus', label: 'Campus LMS', icon: GraduationCap, code: 'A' },
    { id: 'aihub', label: 'AI Hub Gateway', icon: Cpu, code: 'B' },
    { id: 'promptlab', label: 'Prompt Lab', icon: Terminal, code: 'C' },
    { id: 'agentstudio', label: 'Agent Studio', icon: Bot, code: 'D' },
    { id: 'automation', label: 'Automation Studio', icon: Workflow, code: 'E' },
    { id: 'knowledge', label: 'Knowledge Hub (RAG)', icon: BookOpen, code: 'F' },
    { id: 'nocode', label: 'No-Code Builder', icon: Layout, code: 'G' },
    { id: 'analytics', label: 'Analytics Center', icon: BarChart3, code: 'H' },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, code: 'J' },
    { id: 'integrations', label: 'Conectores Enterprise', icon: Layers, code: 'K' },
    { id: 'admin', label: 'Administración & RBAC', icon: ShieldCheck, code: 'I' },
  ];

  return (
    <>
    {/* Fondo oscuro que cierra el menú en celular/tablet */}
    <div
      className={`fixed inset-0 z-40 bg-slate-950/60 lg:hidden ${abierto ? 'block' : 'hidden'}`}
      onClick={onCerrar}
      aria-hidden="true"
    />
    <aside
      className={`w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0 ${
        abierto ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-label="Menú de subsistemas"
    >
      {/* Identidad corporativa */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-white rounded-lg p-1.5 shrink-0 shadow-sm">
          <img src={simboloCpiensa} alt="" className="h-8 w-auto" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-white tracking-tight">
            CPIENSA<span className="text-blue-500">+</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Corporación</p>
        </div>
      </div>

      {/* Organization Switcher (Multi-Tenant) */}
      <div className="p-4 border-b border-slate-800">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Institución / Tenant</span>
        </label>
        <select
          value={currentOrg.id}
          onChange={(e) => {
            const org = organizations.find((o) => o.id === e.target.value);
            if (org) onSelectOrg(org);
          }}
          disabled={!puedeCambiarInstitucion(currentRole)}
          title={puedeCambiarInstitucion(currentRole) ? undefined : 'Solo el SuperAdmin puede cambiar de institución'}
          className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>{currentOrg.activePlan}</span>
          <span className="font-mono tabular-nums">{currentOrg.studentCount} usuarios</span>
        </div>
      </div>

      {/* Navigation Subsystems */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Subsistemas Académicos
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const permitido = puedeAcceder(currentRole, item.id);
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              title={permitido ? undefined : `Requiere rol ${NOMBRE_ROL[rolMinimo(item.id)]} o superior`}
              aria-disabled={!permitido}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? permitido
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-800 text-slate-400 font-semibold'
                  : permitido
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-500 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {permitido && !item.code ? null : permitido ? (
                <span
                  className={`text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.code}
                </span>
              ) : (
                <Lock className="w-3.5 h-3.5 shrink-0 text-slate-500" aria-label="Bloqueado para este rol" />
              )}
            </button>
          );
        })}
      </div>

      {/* Role Switcher & Security Footnote */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-emerald-400" />
            <span>Rol Activo</span>
          </span>
        </div>
        <select
          value={currentRole}
          onChange={(e) => onChangeRole(e.target.value as UserRole)}
          className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="Estudiante">Estudiante</option>
          <option value="Profesor/Tutor">Profesor / Tutor</option>
          <option value="OrgAdmin">Administrador Institucional</option>
          <option value="SuperAdmin">SuperAdmin CPIENSA+</option>
        </select>
        <p className="mt-1.5 text-[10px] leading-snug text-slate-400">
          {DESCRIPCION_ROL[currentRole]}{' '}
          <span className="font-mono text-emerald-400">
            {SECCIONES_POR_ROL[currentRole].length}/{menuItems.length} subsistemas
          </span>
        </p>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Ley 1581 Habeas Data</span>
          <span className="font-mono text-emerald-400">Verificado</span>
        </div>
      </div>
    </aside>
    </>
  );
};
