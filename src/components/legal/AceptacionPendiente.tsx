import React, { useState } from 'react';
import { FileCheck2, Loader2, LogOut } from 'lucide-react';
import { acceso, esErrorApi } from '../../auth/cliente';
import { DOCUMENTOS, type IdDocumento } from '../../legal/documentos';
import { CasillasLegales, CASILLAS_VACIAS, versionesVigentes, type ValoresCasillas } from './CasillasLegales';

interface Props {
  pendientes: string[];
  onAceptado: () => void;
  onSalir: () => void;
}

/** Se muestra después de ingresar cuando hay una versión nueva de los documentos obligatorios. */
export const AceptacionPendiente: React.FC<Props> = ({ pendientes, onAceptado, onSalir }) => {
  const [valores, setValores] = useState<ValoresCasillas>(CASILLAS_VACIAS);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!valores.aceptaTerminos) err.aceptaTerminos = 'Debes aceptar los Términos y condiciones.';
    if (!valores.aceptaPrivacidad) err.aceptaPrivacidad = 'Debes aceptar la Política de tratamiento de datos personales.';
    setErrores(err);
    if (Object.keys(err).length) return;
    setCargando(true);
    setError(null);
    try {
      // La declaración de edad ya consta en la cuenta; el servidor la pide solo si falta.
      await acceso.aceptarDocumentos({ ...valores, mayorDeEdad: true, versiones: versionesVigentes() });
      onAceptado();
    } catch (e2) {
      setError(esErrorApi(e2) ? e2.error : 'No se pudo registrar la aceptación.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4">
      <form onSubmit={enviar} noValidate className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-4" aria-label="Aceptar documentos actualizados">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-bold text-slate-900">Actualizamos nuestros documentos</h1>
        </div>
        <p className="text-sm text-slate-600">Para seguir usando la plataforma, revisa y acepta la versión vigente de:</p>
        <ul className="text-sm list-disc pl-5 text-slate-700">
          {pendientes.map((id) => {
            const d = DOCUMENTOS[id as IdDocumento];
            return d ? (
              <li key={id}>
                <a href={d.ruta} target="_blank" rel="noopener" className="font-semibold text-blue-700 hover:underline">
                  {d.titulo}
                </a>{' '}
                (versión {d.version})
              </li>
            ) : null;
          })}
        </ul>
        <CasillasLegales
          id="nueva-version"
          valores={valores}
          onCambio={(campo, v) => setValores((p) => ({ ...p, [campo]: v }))}
          errores={errores}
          mostrarEdad={false}
        />
        {error && (
          <p role="alert" className="text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            disabled={cargando}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-bold py-2.5"
          >
            {cargando && <Loader2 className="w-4 h-4 animate-spin" />}
            Aceptar y continuar
          </button>
          <button
            type="button"
            onClick={onSalir}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-700 px-4 py-2.5"
          >
            <LogOut className="w-4 h-4" /> No acepto, cerrar sesión
          </button>
        </div>
      </form>
    </div>
  );
};
