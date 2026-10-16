import React, { useEffect } from 'react';
import { X, Cross, Users, Scale } from 'lucide-react';
import {
  VALORES_CRISTIANOS,
  PRINCIPIOS_ETNOEDUCACION,
  MARCO_NORMATIVO_ETNO,
} from '../../data/ejesTransversales';

interface MarcoEjesModalProps {
  onClose: () => void;
}

/** Marco completo de los ejes transversales del diplomado. */
export const MarcoEjesModal: React.FC<MarcoEjesModalProps> = ({ onClose }) => {
  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/70 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Ejes transversales del diplomado"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-900 text-white shrink-0 border-b-4 border-blue-500">
          <h2 className="text-sm sm:text-base font-bold">Ejes transversales del Diplomado</h2>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg"
          >
            <X className="w-4 h-4" />
            Cerrar
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-8">
          <p className="text-sm text-slate-700 leading-relaxed">
            La Corporación CPIENSA+ forma en inteligencia artificial desde una visión integral de la persona. Dos ejes
            atraviesan los 10 módulos y las 50 lecciones: los <strong>valores y principios cristianos</strong>, que
            orientan el uso de la tecnología al servicio de la dignidad humana y del bien común, y el{' '}
            <strong>enfoque etnoeducativo</strong>, que reconoce y valora la diversidad étnica y cultural de Colombia.
            Ambos se proponen con respeto a la libertad de conciencia y de cultos (art. 19 de la Constitución) y en
            diálogo con las espiritualidades y cosmovisiones de cada pueblo.
          </p>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
              <Cross className="w-4 h-4 text-blue-600" />
              Valores y principios cristianos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VALORES_CRISTIANOS.map((v) => (
                <article key={v.id} className="border border-slate-200 rounded-xl p-4 border-l-4 border-l-blue-500">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{v.nombre}</h4>
                    <span className="text-[11px] font-mono text-blue-700 whitespace-nowrap">{v.referencia}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 italic">{v.fundamento}</p>
                  <p className="text-xs text-slate-700 mt-2">
                    <strong>En el uso de la IA: </strong>
                    {v.enIA}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">
              <Users className="w-4 h-4 text-emerald-700" />
              Enfoque etnoeducativo
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              Para pueblos indígenas; comunidades negras, afrocolombianas, raizales y palenqueras; y pueblo Rrom.
              Principios del Decreto 804 de 1995:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRINCIPIOS_ETNOEDUCACION.map((p) => (
                <div key={p.nombre} className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-emerald-900">{p.nombre}</h4>
                  <p className="text-xs text-slate-700 mt-0.5">{p.descripcion}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
              <Scale className="w-4 h-4 text-slate-700" />
              Marco normativo
            </h3>
            <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {MARCO_NORMATIVO_ETNO.map((n) => (
                <li key={n.norma} className="px-4 py-2.5 text-xs flex flex-col sm:flex-row sm:gap-4">
                  <span className="font-semibold text-slate-900 sm:w-72 shrink-0">{n.norma}</span>
                  <span className="text-slate-600">{n.tema}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
