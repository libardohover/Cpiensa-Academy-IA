import React from 'react';
import { DOCUMENTOS, TEXTO_CASILLA } from '../../legal/documentos';

export type ValoresCasillas = { aceptaTerminos: boolean; aceptaPrivacidad: boolean; mayorDeEdad: boolean };
export const CASILLAS_VACIAS: ValoresCasillas = { aceptaTerminos: false, aceptaPrivacidad: false, mayorDeEdad: false };

/** Versiones que la persona tiene a la vista; el servidor rechaza la aceptación si ya no son las vigentes. */
export const versionesVigentes = () => ({ terminos: DOCUMENTOS.terminos.version, privacidad: DOCUMENTOS.privacidad.version });

interface Props {
  valores: ValoresCasillas;
  onCambio: (campo: keyof ValoresCasillas, valor: boolean) => void;
  errores?: Record<string, string>;
  mostrarEdad: boolean;
  /** Prefijo para los id (varias instancias en la misma página). */
  id: string;
}

const Enlace = ({ ruta, children }: { ruta: string; children: React.ReactNode }) => (
  <a href={ruta} target="_blank" rel="noopener" className="font-semibold text-blue-700 hover:underline">
    {children}
  </a>
);

type PropsCasilla = {
  id: string;
  campo: keyof ValoresCasillas;
  valores: ValoresCasillas;
  onCambio: (campo: keyof ValoresCasillas, valor: boolean) => void;
  errores: Record<string, string>;
  children: React.ReactNode;
};

function Casilla({ id, campo, valores, onCambio, errores, children }: PropsCasilla) {
  return (
    <div>
      <label htmlFor={`${id}-${campo}`} className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
        <input
          id={`${id}-${campo}`}
          type="checkbox"
          checked={valores[campo]}
          onChange={(e) => onCambio(campo, e.target.checked)}
          aria-invalid={Boolean(errores[campo])}
          aria-describedby={errores[campo] ? `${id}-${campo}-error` : undefined}
          className="mt-0.5 w-4 h-4 shrink-0 accent-blue-600"
        />
        <span>{children}</span>
      </label>
      {errores[campo] && (
        <p id={`${id}-${campo}-error`} className="mt-1 ml-6 text-[11px] font-medium text-rose-700">
          {errores[campo]}
        </p>
      )}
    </div>
  );
}

/**
 * Casillas separadas e independientes, sin marcar por defecto: el silencio
 * nunca se entiende como aceptación (Decreto 1377 de 2013, art. 7).
 */
export const CasillasLegales: React.FC<Props> = ({ valores, onCambio, errores = {}, mostrarEdad, id }) => {
  const comunes = { id, valores, onCambio, errores };
  return (
    <fieldset className="space-y-2.5 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <legend className="px-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Aceptaciones obligatorias</legend>
      <Casilla {...comunes} campo="aceptaTerminos">
        Acepto los <Enlace ruta={DOCUMENTOS.terminos.ruta}>Términos y condiciones de uso</Enlace> (versión {DOCUMENTOS.terminos.version}).
      </Casilla>
      <Casilla {...comunes} campo="aceptaPrivacidad">
        Acepto la <Enlace ruta={DOCUMENTOS.privacidad.ruta}>Política de tratamiento de datos personales</Enlace> (versión{' '}
        {DOCUMENTOS.privacidad.version}) y autorizo de manera previa, expresa e informada el tratamiento de mis datos para las finalidades allí
        descritas.
      </Casilla>
      {mostrarEdad && <Casilla {...comunes} campo="mayorDeEdad">{TEXTO_CASILLA.edad}</Casilla>}
      {errores.version && <p className="text-[11px] font-medium text-rose-700">{errores.version}</p>}
    </fieldset>
  );
};

/** Enlaces a todos los documentos legales y a la autoridad de protección al consumidor. */
export const EnlacesLegales: React.FC<{ className?: string }> = ({ className = '' }) => (
  <nav aria-label="Documentos legales" className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 ${className}`}>
    {Object.values(DOCUMENTOS).map((d) => (
      <a key={d.id} href={d.ruta} target="_blank" rel="noopener" className="hover:underline">
        {d.titulo.replace('Política de tratamiento de datos personales', 'Privacidad').replace('Política de retracto, reembolsos y reversión de pagos', 'Reembolsos').replace('Términos y condiciones de uso', 'Términos y condiciones').replace('Política de cookies', 'Cookies')}
      </a>
    ))}
    <a href="https://www.sic.gov.co" target="_blank" rel="noopener" className="hover:underline">
      SIC
    </a>
  </nav>
);
