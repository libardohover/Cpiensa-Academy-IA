import React, { useState } from 'react';
import { LogIn, CheckCircle2 } from 'lucide-react';
import type { UserProfile, UserRole } from '../../types';
import { NOMBRE_ROL, ORDEN_ROLES } from '../../auth/permisos';
import logoCpiensa from '../../assets/images/cpiensa-logo.png';

interface PantallaIngresoProps {
  user: UserProfile;
  /** true cuando se llega aquí después de cerrar sesión. */
  sesionCerrada: boolean;
  onIngresar: (rol: UserRole) => void;
}

/**
 * Pantalla de ingreso de la demostración. No valida contraseñas: en producción
 * debe reemplazarse por la autenticación real de la institución.
 */
export const PantallaIngreso: React.FC<PantallaIngresoProps> = ({ user, sesionCerrada, onIngresar }) => {
  const [rol, setRol] = useState<UserRole>(user.role);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-blue-500/20" aria-hidden="true" />
      <div className="absolute -right-20 -bottom-28 w-96 h-96 rounded-full bg-blue-500/10" aria-hidden="true" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onIngresar(rol);
        }}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-7"
      >
        <div className="flex flex-col items-center text-center">
          <img src={logoCpiensa} alt="Corporación CPIENSA+" className="h-24 w-auto" />
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">Corporación Étnica Educativa</p>
          <h1 className="mt-1 text-xl font-extrabold text-slate-900">CPIENSA+ ACADEMY IA</h1>
        </div>

        {sesionCerrada && (
          <p role="status" className="mt-5 flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Cerraste sesión correctamente.
          </p>
        )}

        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Usuario</span>
            <input
              value={user.email}
              readOnly
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-700">Ingresar como</span>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as UserRole)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ORDEN_ROLES.map((r) => (
                <option key={r} value={r}>
                  {NOMBRE_ROL[r]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Ingresar a la plataforma
        </button>

        <p className="mt-4 text-[11px] text-center text-slate-500">
          Versión de demostración: el ingreso no solicita contraseña.
        </p>
      </form>
    </div>
  );
};
