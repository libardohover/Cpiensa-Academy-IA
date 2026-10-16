import React from 'react';
import { Lock, GraduationCap } from 'lucide-react';
import type { UserRole } from '../../types';
import { NOMBRE_ROL, rolMinimo } from '../../auth/permisos';

interface Props {
  seccion: string;
  nombreSeccion: string;
  rolActual: UserRole;
  onIrAlCampus: () => void;
}

/** Pantalla que se muestra cuando el rol activo no tiene acceso a un subsistema. */
export const AccesoRestringido: React.FC<Props> = ({ seccion, nombreSeccion, rolActual, onIrAlCampus }) => {
  const minimo = rolMinimo(seccion);
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
      <div role="alert" className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Lock className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Acceso restringido</h2>
        <p className="mt-2 text-sm text-slate-600">
          El rol <strong>{NOMBRE_ROL[rolActual]}</strong> no tiene acceso a <strong>{nombreSeccion}</strong>.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Disponible desde el rol <strong>{NOMBRE_ROL[minimo]}</strong>. Cambia el rol activo en el menú lateral o
          solicita el permiso al administrador de tu institución.
        </p>
        <button
          onClick={onIrAlCampus}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <GraduationCap className="w-4 h-4" />
          Ir al Campus LMS
        </button>
      </div>
    </div>
  );
};
