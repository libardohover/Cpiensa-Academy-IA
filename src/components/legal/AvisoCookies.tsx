import React, { useState } from 'react';
import { Cookie } from 'lucide-react';
import { DOCUMENTOS } from '../../legal/documentos';

const CLAVE = 'cpiensa_aviso_cookies';

/**
 * Aviso informativo: la plataforma solo usa una cookie técnica necesaria y
 * almacenamiento local funcional. No hay cookies de analítica ni publicidad,
 * por eso no se piden preferencias; si se agregan, este aviso debe pasar a
 * pedir autorización previa por categoría.
 */
export const AvisoCookies: React.FC = () => {
  const [visto, setVisto] = useState<boolean>(() => {
    try {
      return localStorage.getItem(CLAVE) === DOCUMENTOS.cookies.version;
    } catch {
      return false;
    }
  });
  if (visto) return null;
  const cerrar = () => {
    try {
      localStorage.setItem(CLAVE, DOCUMENTOS.cookies.version);
    } catch {
      /* sin almacenamiento: el aviso volverá a mostrarse */
    }
    setVisto(true);
  };
  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:max-w-md z-[70] bg-white border border-slate-200 shadow-xl rounded-xl p-4 text-xs text-slate-700"
    >
      <p className="flex items-start gap-2">
        <Cookie className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <span>
          Usamos <strong>solo una cookie técnica necesaria</strong> para mantener tu sesión segura y almacenamiento local para recordar tu progreso.
          No usamos cookies de analítica ni de publicidad.{' '}
          <a href={DOCUMENTOS.cookies.ruta} target="_blank" rel="noopener" className="font-semibold text-blue-700 hover:underline">
            Política de cookies
          </a>
        </span>
      </p>
      <div className="mt-3 flex justify-end">
        <button onClick={cerrar} className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold">
          Entendido
        </button>
      </div>
    </div>
  );
};
