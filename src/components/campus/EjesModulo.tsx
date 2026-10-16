import React from 'react';
import { Cross, Users, BookMarked, Lightbulb } from 'lucide-react';
import { EJES_POR_MODULO, valorPorId } from '../../data/ejesTransversales';

interface EjesModuloProps {
  moduloId: number;
  onVerMarco: () => void;
}

/** Tarjeta con los dos ejes transversales del módulo actual. */
export const EjesModulo: React.FC<EjesModuloProps> = ({ moduloId, onVerMarco }) => {
  const eje = EJES_POR_MODULO[moduloId];
  if (!eje) return null;
  const valores = eje.valores.map(valorPorId).filter((v): v is NonNullable<typeof v> => Boolean(v));

  return (
    <section
      aria-label={`Ejes transversales del módulo ${moduloId}`}
      className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Ejes transversales del Módulo {moduloId}
        </h3>
        <button onClick={onVerMarco} className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline">
          Ver marco completo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* Valores y principios cristianos */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Cross className="w-4 h-4 text-blue-600" />
            </span>
            <h4 className="text-sm font-bold text-slate-900">Valores y principios cristianos</h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {valores.map((v) => (
              <span
                key={v.id}
                title={v.fundamento}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200"
              >
                {v.nombre} · <span className="font-normal">{v.referencia}</span>
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{eje.reflexion}</p>
          <p className="text-xs text-slate-600 flex items-start gap-1.5 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-800">Compromiso práctico: </strong>
              {eje.practica}
            </span>
          </p>
        </div>

        {/* Enfoque etnoeducativo */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-700" />
            </span>
            <h4 className="text-sm font-bold text-slate-900">Enfoque etnoeducativo</h4>
          </div>
          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Principio: {eje.etno.principio} · Decreto 804 de 1995
          </span>
          <p className="text-sm text-slate-700 leading-relaxed">{eje.etno.enfoque}</p>
          <p className="text-xs text-slate-600 flex items-start gap-1.5 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
            <BookMarked className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-800">Actividad etnoeducativa: </strong>
              {eje.etno.actividad}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};
