import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, RefreshCw, Loader2, ShieldAlert, UserCheck, Clock, Ban, PlayCircle, Send, ScrollText, Users, Inbox } from 'lucide-react';
import type { UserRole } from '../../types';
import { NOMBRE_ROL } from '../../auth/permisos';
import { api, esErrorApi, type UsuarioSesion } from '../../auth/cliente';

type Decision = { tipo: 'aprobada' | 'rechazada' | 'informacion'; por: string; fecha: string; comentario?: string };
type CuentaVista = {
  id: string;
  nombre: string;
  correo: string;
  institucionId: string;
  institucionNombre: string;
  rolSolicitado: UserRole;
  rol: UserRole | null;
  estado: 'pendiente_verificacion' | 'pendiente_aprobacion' | 'activa' | 'suspendida' | 'desactivada';
  correoVerificado: boolean;
  aprobada: boolean;
  tieneContrasena: boolean;
  motivoSolicitud?: string;
  decisiones: Decision[];
  creada: string;
  ultimoIngreso?: string;
};
type Evento = { id: string; fecha: string; actor: string; accion: string; objetivo?: string; detalle?: string; ip?: string };

const ESTADOS: Record<CuentaVista['estado'], { texto: string; clase: string }> = {
  pendiente_verificacion: { texto: 'Pendiente de verificación', clase: 'bg-slate-100 text-slate-700 border-slate-200' },
  pendiente_aprobacion: { texto: 'Pendiente de aprobación', clase: 'bg-amber-50 text-amber-800 border-amber-200' },
  activa: { texto: 'Activa', clase: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  suspendida: { texto: 'Suspendida', clase: 'bg-rose-50 text-rose-800 border-rose-200' },
  desactivada: { texto: 'Desactivada', clase: 'bg-slate-200 text-slate-700 border-slate-300' },
};

const fecha = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

interface Props {
  usuario: UsuarioSesion;
  instituciones: { id: string; nombre: string }[];
  /** Solicitud que se abre al llegar desde el enlace del correo. */
  solicitudInicial?: string | null;
}

export const AccesosView: React.FC<Props> = ({ usuario, instituciones, solicitudInicial }) => {
  const [pestana, setPestana] = useState<'solicitudes' | 'cuentas' | 'auditoria'>('solicitudes');
  const [cuentas, setCuentas] = useState<CuentaVista[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [puedeDecidir, setPuedeDecidir] = useState(false);
  const [asignables, setAsignables] = useState<UserRole[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<string | null>(solicitudInicial ?? null);
  const [aviso, setAviso] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Formulario de decisión
  const [instDecision, setInstDecision] = useState('');
  const [rolDecision, setRolDecision] = useState<UserRole | ''>('');
  const [comentario, setComentario] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [s, a] = await Promise.all([
        api<{ cuentas: CuentaVista[]; puedeDecidir: boolean; rolesAsignables: UserRole[] }>('/admin/solicitudes'),
        api<{ eventos: Evento[] }>('/admin/auditoria'),
      ]);
      setCuentas(s.cuentas);
      setPuedeDecidir(s.puedeDecidir);
      setAsignables(s.rolesAsignables);
      setEventos(a.eventos);
    } catch (e) {
      setError(esErrorApi(e) ? e.error : 'No se pudo cargar la información.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const pendientes = useMemo(() => cuentas.filter((c) => c.estado === 'pendiente_aprobacion'), [cuentas]);
  const sinVerificar = useMemo(() => cuentas.filter((c) => c.estado === 'pendiente_verificacion'), [cuentas]);
  const decididas = useMemo(() => cuentas.filter((c) => c.aprobada || c.estado === 'desactivada'), [cuentas]);
  const actual = cuentas.find((c) => c.id === seleccion) ?? null;

  useEffect(() => {
    if (!actual) return;
    setInstDecision(actual.institucionId);
    setRolDecision(actual.rol ?? actual.rolSolicitado);
    setComentario('');
    setAviso(null);
  }, [actual?.id]);

  const actualizar = (c: CuentaVista) => setCuentas((prev) => prev.map((x) => (x.id === c.id ? c : x)));

  const decidir = async (tipo: 'aprobar' | 'rechazar' | 'informacion') => {
    if (!actual) return;
    if (tipo === 'informacion' && comentario.trim().length < 5) {
      setAviso({ tipo: 'error', texto: 'Escribe en el comentario qué información necesitas.' });
      return;
    }
    if (tipo === 'rechazar' && !window.confirm(`¿Rechazar la solicitud de ${actual.nombre}?`)) return;
    setEnviando(true);
    setAviso(null);
    try {
      const r = await api<{ cuenta: CuentaVista }>(`/admin/solicitudes/${actual.id}/decision`, {
        tipo,
        institucionId: instDecision,
        rol: rolDecision,
        comentario,
      });
      actualizar(r.cuenta);
      const textos = {
        aprobar: `Solicitud aprobada. ${actual.nombre} recibirá el enlace para establecer su contraseña.`,
        rechazar: 'Solicitud rechazada. Se notificó al solicitante.',
        informacion: 'Se pidió la información al solicitante. La solicitud sigue pendiente.',
      };
      setAviso({ tipo: 'exito', texto: `${textos[tipo]} La confirmación quedó en la auditoría.` });
      setComentario('');
      api<{ eventos: Evento[] }>('/admin/auditoria').then((a) => setEventos(a.eventos)).catch(() => undefined);
    } catch (e) {
      setAviso({ tipo: 'error', texto: esErrorApi(e) ? e.error : 'No se pudo registrar la decisión.' });
    } finally {
      setEnviando(false);
    }
  };

  const cambiarEstado = async (c: CuentaVista, estado: 'activa' | 'suspendida' | 'desactivada') => {
    const verbo = { activa: 'reactivar', suspendida: 'suspender', desactivada: 'desactivar' }[estado];
    if (!window.confirm(`¿Deseas ${verbo} la cuenta de ${c.nombre}?`)) return;
    try {
      const r = await api<{ cuenta: CuentaVista }>(`/admin/cuentas/${c.id}/estado`, { estado });
      actualizar(r.cuenta);
      setAviso({ tipo: 'exito', texto: `Cuenta de ${c.nombre}: ${ESTADOS[r.cuenta.estado].texto.toLowerCase()}.` });
    } catch (e) {
      setAviso({ tipo: 'error', texto: esErrorApi(e) ? e.error : 'No se pudo cambiar el estado.' });
    }
  };

  const reenviarEnlace = async (c: CuentaVista) => {
    try {
      await api(`/admin/cuentas/${c.id}/enlace`, {});
      setAviso({ tipo: 'exito', texto: `Se envió a ${c.correo} un nuevo enlace para establecer la contraseña.` });
    } catch (e) {
      setAviso({ tipo: 'error', texto: esErrorApi(e) ? e.error : 'No se pudo reenviar el enlace.' });
    }
  };

  const instDisponibles = usuario.rol === 'SuperAdmin' ? instituciones : instituciones.filter((i) => i.id === usuario.institucionId);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Subsistema L · Gestión de acceso</p>
            <h1 className="text-2xl font-extrabold text-slate-900">Solicitudes de acceso</h1>
            <p className="text-sm text-slate-600">
              {usuario.rol === 'SuperAdmin' ? 'Todas las instituciones' : usuario.institucionNombre}
              {!puedeDecidir && !cargando && ' · solo lectura'}
            </p>
          </div>
          <button
            onClick={cargar}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>

        {usuario.esDemo && (
          <p className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            Estás en modo demostración. Para ver y decidir solicitudes reales inicia sesión con una cuenta administradora autorizada.
          </p>
        )}

        {error && !usuario.esDemo && (
          <p role="alert" className="text-sm bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {aviso && (
          <p
            role={aviso.tipo === 'error' ? 'alert' : 'status'}
            className={`text-sm rounded-xl px-4 py-3 border ${
              aviso.tipo === 'exito' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {aviso.texto}
          </p>
        )}

        <div className="flex gap-1 border-b border-slate-200" role="tablist">
          {[
            { id: 'solicitudes' as const, texto: `Pendientes (${pendientes.length})`, icono: Inbox },
            { id: 'cuentas' as const, texto: `Cuentas (${cuentas.length})`, icono: Users },
            { id: 'auditoria' as const, texto: 'Auditoría', icono: ScrollText },
          ].map((t) => {
            const I = t.icono;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={pestana === t.id}
                onClick={() => setPestana(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${
                  pestana === t.id ? 'border-blue-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <I className="w-4 h-4" /> {t.texto}
              </button>
            );
          })}
        </div>

        {cargando && (
          <p className="text-sm text-slate-600 inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
          </p>
        )}

        {!cargando && pestana === 'solicitudes' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-2 space-y-2">
              {pendientes.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 text-sm text-slate-600">No hay solicitudes pendientes de aprobación.</div>
              )}
              {pendientes.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSeleccion(c.id)}
                  className={`w-full text-left bg-white border rounded-xl p-4 transition-colors ${
                    seleccion === c.id ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">{c.nombre}</span>
                    {c.decisiones.some((d) => d.tipo === 'informacion') && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 shrink-0">Info. pedida</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{c.correo}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {c.institucionNombre} · {NOMBRE_ROL[c.rolSolicitado]} · {fecha(c.creada)}
                  </p>
                </button>
              ))}
              {sinVerificar.length > 0 && (
                <p className="text-[11px] text-slate-500 px-1">
                  {sinVerificar.length} solicitud(es) más esperan que el solicitante verifique su correo.
                </p>
              )}
            </div>

            <div className="lg:col-span-3">
              {!actual ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-sm text-slate-500">
                  Elige una solicitud para revisarla.
                </div>
              ) : (
                <section className="bg-white border border-slate-200 rounded-xl overflow-hidden" aria-label={`Solicitud de ${actual.nombre}`}>
                  <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{actual.nombre}</h2>
                      <p className="text-sm text-slate-600">{actual.correo}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border shrink-0 ${ESTADOS[actual.estado].clase}`}>
                      {ESTADOS[actual.estado].texto}
                    </span>
                  </div>
                  <dl className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">Institución indicada</dt>
                      <dd className="font-semibold text-slate-900">{actual.institucionNombre}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Rol solicitado</dt>
                      <dd className="font-semibold text-slate-900">{NOMBRE_ROL[actual.rolSolicitado]}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Fecha de la solicitud</dt>
                      <dd className="font-semibold text-slate-900">{fecha(actual.creada)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Correo</dt>
                      <dd className="font-semibold text-emerald-700 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Verificado
                      </dd>
                    </div>
                    {actual.motivoSolicitud && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-slate-500">Motivo</dt>
                        <dd className="text-slate-800">{actual.motivoSolicitud}</dd>
                      </div>
                    )}
                  </dl>

                  {actual.decisiones.length > 0 && (
                    <div className="px-5 pb-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Historial</p>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {actual.decisiones.map((d, i) => (
                          <li key={i}>
                            {fecha(d.fecha)} · <strong>{d.tipo === 'informacion' ? 'Información pedida' : d.tipo}</strong> por {d.por}
                            {d.comentario ? ` — ${d.comentario}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {puedeDecidir && actual.estado === 'pendiente_aprobacion' && (
                    <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 space-y-3">
                      <p className="text-sm font-bold text-slate-900">Decisión</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="text-xs font-semibold text-slate-700">
                          Confirmar institución
                          <select
                            value={instDecision}
                            onChange={(e) => setInstDecision(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            {instDisponibles.map((i) => (
                              <option key={i.id} value={i.id}>
                                {i.nombre}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs font-semibold text-slate-700">
                          Rol y permisos que se asignan
                          <select
                            value={rolDecision}
                            onChange={(e) => setRolDecision(e.target.value as UserRole)}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            {asignables.map((r) => (
                              <option key={r} value={r}>
                                {NOMBRE_ROL[r]}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Comentario (obligatorio para pedir información)
                        <textarea
                          rows={2}
                          value={comentario}
                          onChange={(e) => setComentario(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          disabled={enviando}
                          onClick={() => decidir('aprobar')}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Aprobar
                        </button>
                        <button
                          disabled={enviando}
                          onClick={() => decidir('informacion')}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-60 text-sm font-semibold text-slate-800"
                        >
                          <HelpCircle className="w-4 h-4" /> Pedir información
                        </button>
                        <button
                          disabled={enviando}
                          onClick={() => decidir('rechazar')}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 disabled:opacity-60 text-sm font-semibold text-rose-700"
                        >
                          <XCircle className="w-4 h-4" /> Rechazar
                        </button>
                        {enviando && <Loader2 className="w-5 h-5 animate-spin text-slate-500 self-center" />}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Al aprobar, el solicitante recibe un enlace personal (vence en 48 horas) para establecer su contraseña. Cada decisión se
                        confirma por correo y queda en la auditoría.
                      </p>
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        )}

        {!cargando && pestana === 'cuentas' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Persona</th>
                  <th className="text-left px-4 py-3">Institución</th>
                  <th className="text-left px-4 py-3">Rol</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-left px-4 py-3">Último ingreso</th>
                  {puedeDecidir && <th className="text-right px-4 py-3">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cuentas.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{c.nombre}</p>
                      <p className="text-xs text-slate-500">{c.correo}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{c.institucionNombre}</td>
                    <td className="px-4 py-3 text-slate-700">{c.rol ? NOMBRE_ROL[c.rol] : <span className="text-slate-400">Sin asignar</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${ESTADOS[c.estado].clase}`}>{ESTADOS[c.estado].texto}</span>
                      {c.aprobada && !c.tieneContrasena && c.estado === 'activa' && (
                        <span className="flex text-[11px] text-amber-700 mt-1 items-center gap-1">
                          <Clock className="w-3 h-3" /> Falta establecer contraseña
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{fecha(c.ultimoIngreso)}</td>
                    {puedeDecidir && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5 flex-wrap">
                          {c.id !== usuario.id && c.aprobada && c.estado === 'activa' && (
                            <button onClick={() => cambiarEstado(c, 'suspendida')} className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border border-rose-200 text-rose-700 hover:bg-rose-50">
                              <Ban className="w-3.5 h-3.5" /> Suspender
                            </button>
                          )}
                          {c.id !== usuario.id && c.aprobada && c.estado !== 'activa' && (
                            <button onClick={() => cambiarEstado(c, 'activa')} className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                              <PlayCircle className="w-3.5 h-3.5" /> Reactivar
                            </button>
                          )}
                          {c.id !== usuario.id && c.aprobada && c.estado !== 'desactivada' && (
                            <button onClick={() => cambiarEstado(c, 'desactivada')} className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50">
                              Desactivar
                            </button>
                          )}
                          {c.aprobada && c.estado === 'activa' && !c.tieneContrasena && (
                            <button onClick={() => reenviarEnlace(c)} className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50">
                              <Send className="w-3.5 h-3.5" /> Reenviar enlace
                            </button>
                          )}
                          {c.estado === 'pendiente_aprobacion' && (
                            <button
                              onClick={() => {
                                setSeleccion(c.id);
                                setPestana('solicitudes');
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border border-amber-200 text-amber-800 hover:bg-amber-50"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Revisar
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {cuentas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Sin cuentas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <p className="px-4 py-2 text-[11px] text-slate-500 border-t border-slate-100">
              {decididas.length} cuenta(s) con decisión registrada.
            </p>
          </div>
        )}

        {!cargando && pestana === 'auditoria' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Fecha</th>
                  <th className="text-left px-4 py-3">Actor</th>
                  <th className="text-left px-4 py-3">Acción</th>
                  <th className="text-left px-4 py-3">Afectado</th>
                  <th className="text-left px-4 py-3">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {eventos.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-slate-600">{fecha(e.fecha)}</td>
                    <td className="px-4 py-2 text-slate-800">{e.actor}</td>
                    <td className="px-4 py-2 font-semibold text-slate-900">{e.accion.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-2 text-slate-700">{e.objetivo ?? '—'}</td>
                    <td className="px-4 py-2 text-slate-600">{e.detalle ?? ''}</td>
                  </tr>
                ))}
                {eventos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500 font-sans">
                      Sin registros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
