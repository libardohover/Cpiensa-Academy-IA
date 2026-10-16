import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Home, LogOut, UserCheck, Check, Sparkles } from 'lucide-react';
import type { TenantOrg, UserProfile, UserRole } from '../../types';
import { NOMBRE_ROL, ORDEN_ROLES } from '../../auth/permisos';

interface MenuUsuarioProps {
  user: UserProfile;
  organizacion: TenantOrg;
  onIrAInicio: () => void;
  onAbrirTutor: () => void;
  onCambiarRol: (rol: UserRole) => void;
  onCerrarSesion: () => void;
}

/** Menú desplegable del usuario: datos de la cuenta, cambio de rol y cierre de sesión. */
export const MenuUsuario: React.FC<MenuUsuarioProps> = ({
  user,
  organizacion,
  onIrAInicio,
  onAbrirTutor,
  onCambiarRol,
  onCerrarSesion,
}) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', tecla);
    };
  }, [abierto]);

  const iniciales = user.name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const elegir = (accion: () => void) => {
    setAbierto(false);
    accion();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label="Menú de usuario"
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-colors"
      >
        <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0">
          {iniciales}
        </span>
        <span className="hidden min-[1700px]:inline text-xs font-medium text-slate-800 truncate max-w-[140px]">{user.name}</span>
        <span className="hidden md:inline px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold whitespace-nowrap">
          {NOMBRE_ROL[user.role]}
        </span>
        <ChevronDown className={`hidden sm:block w-4 h-4 text-slate-500 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
              {iniciales}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              <p className="text-[11px] text-slate-500 truncate">{organizacion.name}</p>
            </div>
          </div>

          <div className="py-1">
            <button role="menuitem" onClick={() => elegir(onIrAInicio)} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <Home className="w-4 h-4 text-slate-500" /> Ir al Inicio
            </button>
            <button role="menuitem" onClick={() => elegir(onAbrirTutor)} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <Sparkles className="w-4 h-4 text-slate-500" /> Tutor Socrático
            </button>
          </div>

          <div className="py-1 border-t border-slate-100">
            <p className="px-4 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-3 h-3" /> Cambiar rol
            </p>
            {ORDEN_ROLES.map((r) => (
              <button
                key={r}
                role="menuitemradio"
                aria-checked={user.role === r}
                onClick={() => elegir(() => onCambiarRol(r))}
                className={`w-full flex items-center justify-between px-4 py-1.5 text-sm hover:bg-slate-50 ${
                  user.role === r ? 'text-blue-700 font-semibold' : 'text-slate-700'
                }`}
              >
                {NOMBRE_ROL[r]}
                {user.role === r && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>

          <div className="py-1 border-t border-slate-100">
            <button
              role="menuitem"
              onClick={() => elegir(onCerrarSesion)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
