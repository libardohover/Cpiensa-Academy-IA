import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, Loader2, Send, FileText, Download } from 'lucide-react';
import { api, esErrorApi } from '../../auth/cliente';
import { DOCUMENTOS, ENTIDAD, TIPOS_SOLICITUD_TITULAR, plazoDiasHabiles, type IdDocumento, type TipoSolicitudTitular } from '../../legal/documentos';
import { NOMBRE_ROL } from '../../auth/permisos';
import type { UserRole } from '../../types';

type Autorizacion = {
  id: string;
  fecha: string;
  correo: string;
  documento: string;
  version: string;
  huella: string;
  accion: string;
  medio: string;
  casilla: string;
  ip: string;
  navegador: string;
};
type Solicitud = { id: string; radicado: string; fecha: string; tipo: TipoSolicitudTitular; mensaje: string; estado: string; fechaLimite: string; respuesta?: { fecha: string; texto: string } };
type MisDatos = {
  demo?: boolean;
  cuenta: { nombre: string; correo: string; institucion: string; rol: UserRole; estado: string; solicitada: string; motivoSolicitud: string | null; ultimoIngreso: string | null; mayorDeEdad: boolean };
  autorizaciones: Autorizacion[];
  solicitudes: Solicitud[];
};

const fecha = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const MEDIOS: Record<string, string> = {
  formulario_solicitud_acceso: 'Formulario de solicitud de acceso',
  establecer_contrasena: 'Al establecer la contraseña',
  restablecer_contrasena: 'Al restablecer la contraseña',
  nueva_version_al_ingresar: 'Al ingresar, por nueva versión del documento',
};
const nombreDocumento = (d: string) => (d === 'declaracion_edad' ? 'Declaración de mayoría de edad' : DOCUMENTOS[d as IdDocumento]?.titulo ?? d);

/** Derechos del titular (Ley 1581 de 2012, art. 8): ver sus datos, la prueba de su autorización y radicar solicitudes. */
export const MisDatosView: React.FC = () => {
  const [datos, setDatos] = useState<MisDatos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoSolicitudTitular | ''>('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const cargar = useCallback(() => {
    api<MisDatos>('/legal/mis-datos')
      .then(setDatos)
      .catch((e) => setError(esErrorApi(e) ? e.error : 'No se pudieron cargar tus datos.'));
  }, []);
  useEffect(cargar, [cargar]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipo) {
      setAviso({ tipo: 'error', texto: 'Elige el tipo de solicitud.' });
      return;
    }
    setEnviando(true);
    setAviso(null);
    try {
      const r = await api<{ radicado: string; fechaLimite: string }>('/legal/solicitudes-titular', { tipo, mensaje });
      setAviso({ tipo: 'exito', texto: `Solicitud radicada con el número ${r.radicado}. Recibirás respuesta a tu correo a más tardar el ${r.fechaLimite}.` });
      setTipo('');
      setMensaje('');
      cargar();
    } catch (e2) {
      setAviso({ tipo: 'error', texto: esErrorApi(e2) ? e2.error : 'No se pudo radicar la solicitud.' });
    } finally {
      setEnviando(false);
    }
  };

  const descargarPrueba = () => {
    if (!datos) return;
    const blob = new Blob([JSON.stringify({ titular: datos.cuenta, autorizaciones: datos.autorizaciones }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mis-datos-cpiensa-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Habeas data · Ley 1581 de 2012</p>
          <h1 className="text-2xl font-extrabold text-slate-900">Mis datos y autorizaciones</h1>
          <p className="text-sm text-slate-600">Consulta qué datos tenemos, cuándo y cómo aceptaste cada documento, y ejerce tus derechos.</p>
        </div>

        {error && <p role="alert" className="text-sm bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3">{error}</p>}
        {!datos && !error && (
          <p className="text-sm text-slate-600 inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
          </p>
        )}
        {datos?.demo && (
          <p className="text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-3">
            Estás en modo demostración: no hay datos personales reales asociados a esta sesión.
          </p>
        )}

        {datos && !datos.demo && (
          <>
            <section className="bg-white border border-slate-200 rounded-xl p-5" aria-labelledby="t-datos">
              <h2 id="t-datos" className="text-base font-bold text-slate-900 mb-3">Datos que tenemos</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  ['Nombre', datos.cuenta.nombre],
                  ['Correo', datos.cuenta.correo],
                  ['Institución', datos.cuenta.institucion],
                  ['Rol asignado', NOMBRE_ROL[datos.cuenta.rol] ?? datos.cuenta.rol],
                  ['Estado de la cuenta', datos.cuenta.estado],
                  ['Fecha de la solicitud', fecha(datos.cuenta.solicitada)],
                  ['Motivo indicado', datos.cuenta.motivoSolicitud ?? '—'],
                  ['Último ingreso', fecha(datos.cuenta.ultimoIngreso)],
                  ['Declaración de mayoría de edad', datos.cuenta.mayorDeEdad ? 'Sí' : 'No consta'],
                  ['Contraseña', 'Guardada cifrada de forma irreversible (nadie puede leerla)'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-slate-500">{k}</dt>
                    <dd className="font-semibold text-slate-900 break-words">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[11px] text-slate-500">
                También guardamos registros de seguridad (fecha, IP y navegador de ingresos y aceptaciones). El progreso del Campus se guarda solo en tu navegador.
              </p>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden" aria-labelledby="t-aut">
              <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100">
                <h2 id="t-aut" className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Prueba de mis autorizaciones
                </h2>
                <button onClick={descargarPrueba} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50">
                  <Download className="w-3.5 h-3.5" /> Descargar mis datos
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[720px]">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-2">Fecha y hora</th>
                      <th className="text-left px-4 py-2">Documento</th>
                      <th className="text-left px-4 py-2">Cómo</th>
                      <th className="text-left px-4 py-2">Desde</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {datos.autorizaciones.map((a) => (
                      <tr key={a.id}>
                        <td className="px-4 py-2 whitespace-nowrap">{fecha(a.fecha)}</td>
                        <td className="px-4 py-2">
                          <span className="font-semibold">{nombreDocumento(a.documento)}</span>
                          {a.documento !== 'declaracion_edad' && <span className="text-slate-500"> · v{a.version}</span>}
                          <span className="block text-[10px] text-slate-500 italic">«{a.casilla}»</span>
                        </td>
                        <td className="px-4 py-2">{MEDIOS[a.medio] ?? a.medio} · casilla marcada</td>
                        <td className="px-4 py-2 font-mono text-[10px] text-slate-600">
                          IP {a.ip}
                          <span className="block truncate max-w-[220px]" title={a.navegador}>
                            {a.navegador}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {datos.autorizaciones.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-slate-500">
                          Sin registros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-5" aria-labelledby="t-der">
              <h2 id="t-der" className="text-base font-bold text-slate-900">Ejercer mis derechos</h2>
              <p className="text-xs text-slate-600 mt-1">
                Consultas: respuesta en máximo 10 días hábiles. Reclamos (actualizar, rectificar, suprimir, revocar): máximo 15 días hábiles. También puedes escribir a{' '}
                <a className="text-blue-700 font-semibold" href={`mailto:${ENTIDAD.correo}`}>
                  {ENTIDAD.correo}
                </a>
                .
              </p>
              <form onSubmit={enviar} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3" noValidate>
                <label className="text-xs font-semibold text-slate-700">
                  Tipo de solicitud
                  <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoSolicitudTitular)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                    <option value="">Elige…</option>
                    {(Object.keys(TIPOS_SOLICITUD_TITULAR) as TipoSolicitudTitular[]).map((t) => (
                      <option key={t} value={t}>
                        {TIPOS_SOLICITUD_TITULAR[t]} ({plazoDiasHabiles(t)} días hábiles)
                      </option>
                    ))}
                  </select>
                </label>
                <label className="sm:col-span-2 text-xs font-semibold text-slate-700">
                  Detalle
                  <textarea
                    rows={2}
                    maxLength={2000}
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Por ejemplo: qué dato corregir y cuál es el correcto."
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </label>
                {tipo === 'revocatoria' || tipo === 'supresion' ? (
                  <p className="sm:col-span-3 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Revocar la autorización o suprimir tus datos implica cerrar tu cuenta, salvo los datos que la ley obligue a conservar.
                  </p>
                ) : null}
                <div className="sm:col-span-3 flex items-center gap-3">
                  <button type="submit" disabled={enviando} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold">
                    {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Radicar solicitud
                  </button>
                </div>
              </form>
              {aviso && (
                <p role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`mt-3 text-sm rounded-lg px-3 py-2 border ${aviso.tipo === 'exito' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                  {aviso.texto}
                </p>
              )}
              {datos.solicitudes.length > 0 && (
                <ul className="mt-4 divide-y divide-slate-100 text-sm border-t border-slate-100">
                  {datos.solicitudes.map((s) => (
                    <li key={s.id} className="py-2">
                      <span className="font-mono text-xs">{s.radicado}</span> · {TIPOS_SOLICITUD_TITULAR[s.tipo]} · {fecha(s.fecha)} ·{' '}
                      <strong>{s.estado === 'atendida' ? 'Atendida' : `En trámite (límite ${s.fechaLimite})`}</strong>
                      {s.respuesta && <p className="text-xs text-slate-600 mt-1">Respuesta: {s.respuesta.texto}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        <section className="bg-white border border-slate-200 rounded-xl p-5" aria-labelledby="t-docs">
          <h2 id="t-docs" className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" /> Documentos legales vigentes
          </h2>
          <ul className="mt-2 text-sm space-y-1">
            {Object.values(DOCUMENTOS).map((d) => (
              <li key={d.id}>
                <a href={d.ruta} target="_blank" rel="noopener" className="font-semibold text-blue-700 hover:underline">
                  {d.titulo}
                </a>{' '}
                <span className="text-slate-500">· versión {d.version} · vigente desde {d.vigencia}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
