import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, LogIn, CheckCircle2, AlertCircle, Info, ArrowLeft, Loader2, MailCheck, KeyRound, ShieldCheck, UserPlus } from 'lucide-react';
import type { UserRole } from '../../types';
import { NOMBRE_ROL, ORDEN_ROLES } from '../../auth/permisos';
import { acceso, esErrorApi, type ConfigAcceso, type UsuarioSesion } from '../../auth/cliente';
import logoCpiensa from '../../assets/images/cpiensa-logo.png';
import { CasillasLegales, CASILLAS_VACIAS, EnlacesLegales, versionesVigentes, type ValoresCasillas } from '../legal/CasillasLegales';

export type Vista =
  | { tipo: 'ingresar' }
  | { tipo: 'codigo'; mensaje?: string }
  | { tipo: 'solicitar' }
  | { tipo: 'recuperar' }
  | { tipo: 'verificar'; token: string }
  | { tipo: 'contrasena'; token: string; modo: 'contrasena' | 'recuperar' }
  | { tipo: 'listo'; titulo: string; texto: string };

export type Aviso = { tipo: 'exito' | 'info' | 'error'; texto: string };

interface Props {
  config: ConfigAcceso | null;
  vistaInicial: Vista;
  avisoInicial?: Aviso | null;
  onIngreso: (u: UsuarioSesion) => void;
}

const claseCampo = (error?: string) =>
  `mt-1 w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    error ? 'border-rose-400' : 'border-slate-300'
  }`;

function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-slate-700">
        {etiqueta}
      </label>
      {children}
      {ayuda && !error && <p className="mt-1 text-[11px] text-slate-500">{ayuda}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11px] font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}

function CampoContrasena(props: {
  id: string;
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  error?: string;
  autoComplete: 'current-password' | 'new-password';
  ayuda?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  const [ver, setVer] = useState(false);
  return (
    <Campo id={props.id} etiqueta={props.etiqueta} error={props.error} ayuda={props.ayuda}>
      <div className="relative">
        <input
          ref={props.inputRef}
          id={props.id}
          name={props.autoComplete === 'current-password' ? 'password' : 'new-password'}
          type={ver ? 'text' : 'password'}
          autoComplete={props.autoComplete}
          value={props.valor}
          onChange={(e) => props.onCambio(e.target.value)}
          aria-invalid={Boolean(props.error)}
          aria-describedby={props.error ? `${props.id}-error` : undefined}
          className={`${claseCampo(props.error)} pr-11`}
        />
        <button
          type="button"
          onClick={() => setVer((v) => !v)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 mt-0.5 p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={ver}
        >
          {ver ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </Campo>
  );
}

function Mensaje({ aviso }: { aviso: Aviso | null }) {
  if (!aviso) return null;
  const estilos = {
    exito: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    info: 'text-slate-700 bg-slate-50 border-slate-200',
    error: 'text-rose-800 bg-rose-50 border-rose-200',
  }[aviso.tipo];
  const Icono = aviso.tipo === 'exito' ? CheckCircle2 : aviso.tipo === 'error' ? AlertCircle : Info;
  return (
    <p role={aviso.tipo === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2 text-xs border rounded-lg px-3 py-2.5 ${estilos}`}>
      <Icono className="w-4 h-4 shrink-0 mt-px" />
      <span>{aviso.texto}</span>
    </p>
  );
}

function Boton({ cargando, children, texto }: { cargando: boolean; children: React.ReactNode; texto: string }) {
  return (
    <button
      type="submit"
      disabled={cargando}
      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-wait text-white text-sm font-bold py-2.5 transition-colors"
    >
      {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
      {cargando ? texto : null}
    </button>
  );
}

const Enlace = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onClick} className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline">
    {children}
  </button>
);

export const PantallaIngreso: React.FC<Props> = ({ config, vistaInicial, avisoInicial, onIngreso }) => {
  const [vista, setVista] = useState<Vista>(vistaInicial);
  const [aviso, setAviso] = useState<Aviso | null>(avisoInicial ?? null);
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Ingreso
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [codigo, setCodigo] = useState('');
  // Solicitud
  const [sol, setSol] = useState({ nombre: '', correo: '', institucionId: '', rol: '', motivo: '' });
  // Casillas de aceptación: independientes y sin marcar por defecto
  const [casillas, setCasillas] = useState<ValoresCasillas>(CASILLAS_VACIAS);
  // Enlace de contraseña: qué falta aceptar (p. ej., la cuenta administradora inicial)
  const [faltaAceptar, setFaltaAceptar] = useState<{ documentos: boolean; edad: boolean }>({ documentos: false, edad: false });
  // Contraseña nueva
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [titularEnlace, setTitularEnlace] = useState<string | null>(null);
  // Demostración
  const [rolDemo, setRolDemo] = useState<UserRole>('Estudiante');

  const primerCampo = useRef<HTMLInputElement>(null);

  /** Al corregir un campo, su mensaje de error desaparece. */
  const limpiar = (campo: string) =>
    setErrores((prev) => {
      if (!prev[campo]) return prev;
      const n = { ...prev };
      delete n[campo];
      return n;
    });
  const cambiarSol = (campo: keyof typeof sol, valor: string | boolean) => {
    setSol((prev) => ({ ...prev, [campo]: valor }));
    limpiar(campo);
  };

  const ir = (v: Vista, a: Aviso | null = null) => {
    setVista(v);
    setAviso(a);
    setErrores({});
  };

  useEffect(() => {
    primerCampo.current?.focus();
  }, [vista.tipo]);

  // Al abrir un enlace de contraseña, se comprueba antes de mostrar el formulario.
  useEffect(() => {
    if (vista.tipo !== 'contrasena') return;
    setTitularEnlace(null);
    acceso
      .enlace(vista.modo, vista.token)
      .then((d) => {
        setFaltaAceptar({ documentos: d.pendientesLegales.length > 0 || !d.declaroEdad, edad: !d.declaroEdad });
        setTitularEnlace(d.correo);
      })
      .catch((e) => ir({ tipo: 'ingresar' }, { tipo: 'error', texto: esErrorApi(e) ? e.error : 'El enlace no es válido.' }));
  }, [vista]);

  const manejarError = (e: unknown) => {
    if (esErrorApi(e)) {
      setErrores(e.errores ?? {});
      setAviso({ tipo: 'error', texto: e.error });
    } else {
      setAviso({ tipo: 'error', texto: 'Ocurrió un error temporal. Inténtalo de nuevo.' });
    }
  };

  const enviarIngreso = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!correo.trim()) err.correo = 'Escribe tu correo electrónico.';
    if (!contrasena) err.contrasena = 'Escribe tu contraseña.';
    if (Object.keys(err).length) {
      setErrores(err);
      setAviso({ tipo: 'error', texto: 'Completa los campos marcados.' });
      return;
    }
    setCargando(true);
    setAviso(null);
    setErrores({});
    try {
      const r = await acceso.ingresar(correo.trim(), contrasena);
      setContrasena('');
      if (r.requiereCodigo) ir({ tipo: 'codigo' }, { tipo: 'info', texto: r.mensaje ?? 'Revisa tu correo.' });
      else if (r.usuario) onIngreso(r.usuario);
    } catch (e2) {
      setContrasena('');
      manejarError(e2);
    } finally {
      setCargando(false);
    }
  };

  const enviarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(codigo.trim())) {
      setErrores({ codigo: 'Escribe los 6 dígitos del código.' });
      return;
    }
    setCargando(true);
    try {
      const r = await acceso.codigo(codigo.trim());
      onIngreso(r.usuario);
    } catch (e2) {
      setCodigo('');
      if (esErrorApi(e2) && e2.codigo === 'sesion_vencida') ir({ tipo: 'ingresar' }, { tipo: 'error', texto: e2.error });
      else manejarError(e2);
    } finally {
      setCargando(false);
    }
  };

  const enviarSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (sol.nombre.trim().length < 3) err.nombre = 'Escribe tu nombre completo.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(sol.correo.trim())) err.correo = 'Escribe un correo válido.';
    if (!sol.institucionId) err.institucionId = 'Elige tu institución.';
    if (!sol.rol) err.rol = 'Elige el rol que solicitas.';
    if (!casillas.aceptaTerminos) err.aceptaTerminos = 'Debes aceptar los Términos y condiciones.';
    if (!casillas.aceptaPrivacidad) err.aceptaPrivacidad = 'Debes aceptar la Política de tratamiento de datos personales.';
    if (!casillas.mayorDeEdad) err.mayorDeEdad = 'La plataforma es solo para personas de 18 años o más.';
    if (Object.keys(err).length) {
      setErrores(err);
      setAviso({ tipo: 'error', texto: 'Revisa los campos marcados.' });
      return;
    }
    setCargando(true);
    try {
      const r = await acceso.solicitar({ ...sol, nombre: sol.nombre.trim(), correo: sol.correo.trim(), ...casillas, versiones: versionesVigentes() });
      ir({ tipo: 'listo', titulo: 'Revisa tu correo', texto: r.mensaje });
    } catch (e2) {
      manejarError(e2);
    } finally {
      setCargando(false);
    }
  };

  const enviarRecuperacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim()) {
      setErrores({ correo: 'Escribe tu correo electrónico.' });
      return;
    }
    setCargando(true);
    try {
      const r = await acceso.recuperar(correo.trim());
      ir({ tipo: 'listo', titulo: 'Revisa tu correo', texto: r.mensaje });
    } catch (e2) {
      manejarError(e2);
    } finally {
      setCargando(false);
    }
  };

  const confirmarCorreo = async () => {
    if (vista.tipo !== 'verificar') return;
    setCargando(true);
    try {
      const r = await acceso.verificar(vista.token);
      ir({ tipo: 'listo', titulo: 'Correo verificado', texto: r.mensaje });
    } catch (e2) {
      manejarError(e2);
    } finally {
      setCargando(false);
    }
  };

  const enviarContrasena = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vista.tipo !== 'contrasena') return;
    const err: Record<string, string> = {};
    if (nueva.length < 10) err.nueva = 'Usa al menos 10 caracteres, con letras y números.';
    if (nueva !== confirmar) err.confirmar = 'Las contraseñas no coinciden.';
    if (faltaAceptar.documentos) {
      if (!casillas.aceptaTerminos) err.aceptaTerminos = 'Debes aceptar los Términos y condiciones.';
      if (!casillas.aceptaPrivacidad) err.aceptaPrivacidad = 'Debes aceptar la Política de tratamiento de datos personales.';
      if (faltaAceptar.edad && !casillas.mayorDeEdad) err.mayorDeEdad = 'La plataforma es solo para personas de 18 años o más.';
    }
    if (Object.keys(err).length) {
      setErrores(err);
      return;
    }
    setCargando(true);
    try {
      const r = await acceso.contrasena(vista.modo, vista.token, nueva, faltaAceptar.documentos ? { ...casillas, versiones: versionesVigentes() } : {});
      setNueva('');
      setConfirmar('');
      setCorreo(titularEnlace ?? '');
      ir({ tipo: 'ingresar' }, { tipo: 'exito', texto: r.mensaje });
    } catch (e2) {
      if (esErrorApi(e2) && e2.errores?.contrasena) {
        setErrores({ nueva: e2.errores.contrasena });
        setAviso(null);
      } else manejarError(e2);
    } finally {
      setCargando(false);
    }
  };

  const entrarDemo = async () => {
    setCargando(true);
    try {
      const r = await acceso.demo(rolDemo);
      onIngreso(r.usuario);
    } catch (e2) {
      manejarError(e2);
    } finally {
      setCargando(false);
    }
  };

  const ancho = vista.tipo === 'solicitar' ? 'max-w-lg' : 'max-w-md';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4 sm:p-6 relative overflow-y-auto">
      <div className="fixed -left-24 -top-24 w-96 h-96 rounded-full bg-blue-500/20 pointer-events-none" aria-hidden="true" />
      <div className="fixed -right-20 -bottom-28 w-96 h-96 rounded-full bg-emerald-400/10 pointer-events-none" aria-hidden="true" />

      <main className={`relative w-full ${ancho} bg-white rounded-2xl shadow-2xl p-6 sm:p-8 my-6`}>
        <header className="flex flex-col items-center text-center">
          <img src={logoCpiensa} alt="" className="h-20 w-auto" />
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">Corporación Étnica Educativa</p>
          <h1 className="mt-1 text-xl font-extrabold text-slate-900">CPIENSA+ ACADEMY IA</h1>
          {vista.tipo === 'ingresar' && (
            <p className="mt-1 text-sm text-slate-600">Ingresa y continúa transformando tus ideas en conocimiento</p>
          )}
        </header>

        <div className="mt-5 space-y-4">
          <Mensaje aviso={aviso} />

          {vista.tipo === 'ingresar' && (
            <form onSubmit={enviarIngreso} noValidate className="space-y-4" aria-label="Ingreso">
              <Campo id="correo" etiqueta="Correo electrónico" error={errores.correo}>
                <input
                  ref={primerCampo}
                  id="correo"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    limpiar('correo');
                  }}
                  aria-invalid={Boolean(errores.correo)}
                  aria-describedby={errores.correo ? 'correo-error' : undefined}
                  className={claseCampo(errores.correo)}
                />
              </Campo>
              <CampoContrasena
                id="contrasena"
                etiqueta="Contraseña"
                valor={contrasena}
                onCambio={(v) => {
                  setContrasena(v);
                  limpiar('contrasena');
                }}
                error={errores.contrasena}
                autoComplete="current-password"
              />
              <div className="flex justify-end -mt-2">
                <Enlace onClick={() => ir({ tipo: 'recuperar' })}>¿Olvidaste tu contraseña?</Enlace>
              </div>
              <Boton cargando={cargando} texto="Validando…">
                <LogIn className="w-4 h-4" /> Ingresar a mi academia
              </Boton>
              <p className="flex items-start gap-2 text-[11px] text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                El acceso está disponible para usuarios con cuenta aprobada.
              </p>
              <p className="text-center text-xs text-slate-600">
                ¿No tienes cuenta? <Enlace onClick={() => ir({ tipo: 'solicitar' })}>Solicitar acceso</Enlace>
              </p>
            </form>
          )}

          {vista.tipo === 'codigo' && (
            <form onSubmit={enviarCodigo} noValidate className="space-y-4" aria-label="Código de verificación">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <KeyRound className="w-4 h-4 text-blue-600" /> Verificación adicional
              </div>
              <p className="text-xs text-slate-600">Las cuentas administrativas confirman cada ingreso con un código enviado a su correo.</p>
              <Campo id="codigo" etiqueta="Código de 6 dígitos" error={errores.codigo}>
                <input
                  ref={primerCampo}
                  id="codigo"
                  name="one-time-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => {
                    setCodigo(e.target.value.replace(/\D/g, ''));
                    limpiar('codigo');
                  }}
                  aria-invalid={Boolean(errores.codigo)}
                  className={`${claseCampo(errores.codigo)} text-center text-2xl tracking-[0.5em] font-bold`}
                />
              </Campo>
              <Boton cargando={cargando} texto="Validando…">
                <ShieldCheck className="w-4 h-4" /> Confirmar código
              </Boton>
              <button type="button" onClick={() => ir({ tipo: 'ingresar' })} className="w-full text-xs text-slate-600 hover:text-slate-900 inline-flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Volver al ingreso
              </button>
            </form>
          )}

          {vista.tipo === 'solicitar' && (
            <form onSubmit={enviarSolicitud} noValidate className="space-y-4" aria-label="Solicitar acceso">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-600" /> Solicitar acceso
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Verificaremos tu correo y un administrador revisará tu solicitud. El registro no concede acceso hasta que sea aprobado.
                </p>
              </div>
              <Campo id="sol-nombre" etiqueta="Nombre completo" error={errores.nombre}>
                <input
                  ref={primerCampo}
                  id="sol-nombre"
                  autoComplete="name"
                  value={sol.nombre}
                  onChange={(e) => cambiarSol('nombre', e.target.value)}
                  aria-invalid={Boolean(errores.nombre)}
                  className={claseCampo(errores.nombre)}
                />
              </Campo>
              <Campo id="sol-correo" etiqueta="Correo electrónico" error={errores.correo}>
                <input
                  id="sol-correo"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={sol.correo}
                  onChange={(e) => cambiarSol('correo', e.target.value)}
                  aria-invalid={Boolean(errores.correo)}
                  className={claseCampo(errores.correo)}
                />
              </Campo>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo id="sol-inst" etiqueta="Institución" error={errores.institucionId}>
                  <select
                    id="sol-inst"
                    value={sol.institucionId}
                    onChange={(e) => cambiarSol('institucionId', e.target.value)}
                    aria-invalid={Boolean(errores.institucionId)}
                    className={claseCampo(errores.institucionId)}
                  >
                    <option value="">Elige…</option>
                    {config?.instituciones.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nombre}
                      </option>
                    ))}
                  </select>
                </Campo>
                <Campo id="sol-rol" etiqueta="Rol que solicitas" error={errores.rol}>
                  <select
                    id="sol-rol"
                    value={sol.rol}
                    onChange={(e) => cambiarSol('rol', e.target.value)}
                    aria-invalid={Boolean(errores.rol)}
                    className={claseCampo(errores.rol)}
                  >
                    <option value="">Elige…</option>
                    {config?.rolesSolicitables.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </Campo>
              </div>
              <Campo id="sol-motivo" etiqueta="Motivo (opcional)" ayuda="Por ejemplo: cohorte o programa. No incluyas datos sensibles (salud, origen étnico, religión, etc.).">
                <textarea
                  id="sol-motivo"
                  rows={2}
                  maxLength={500}
                  value={sol.motivo}
                  onChange={(e) => cambiarSol('motivo', e.target.value)}
                  className={claseCampo()}
                />
              </Campo>
              <CasillasLegales
                id="sol"
                valores={casillas}
                onCambio={(campo, v) => {
                  setCasillas((p) => ({ ...p, [campo]: v }));
                  limpiar(campo);
                }}
                errores={errores}
                mostrarEdad
              />
              <Boton cargando={cargando} texto="Enviando…">
                <MailCheck className="w-4 h-4" /> Enviar solicitud
              </Boton>
              <button type="button" onClick={() => ir({ tipo: 'ingresar' })} className="w-full text-xs text-slate-600 hover:text-slate-900 inline-flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Ya tengo cuenta
              </button>
            </form>
          )}

          {vista.tipo === 'recuperar' && (
            <form onSubmit={enviarRecuperacion} noValidate className="space-y-4" aria-label="Recuperar contraseña">
              <h2 className="text-base font-bold text-slate-900">¿Olvidaste tu contraseña?</h2>
              <p className="text-xs text-slate-600">Escribe tu correo y te enviaremos un enlace personal para crear una nueva.</p>
              <Campo id="rec-correo" etiqueta="Correo electrónico" error={errores.correo}>
                <input
                  ref={primerCampo}
                  id="rec-correo"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    limpiar('correo');
                  }}
                  aria-invalid={Boolean(errores.correo)}
                  className={claseCampo(errores.correo)}
                />
              </Campo>
              <Boton cargando={cargando} texto="Enviando…">
                <MailCheck className="w-4 h-4" /> Enviar enlace
              </Boton>
              <button type="button" onClick={() => ir({ tipo: 'ingresar' })} className="w-full text-xs text-slate-600 hover:text-slate-900 inline-flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Volver al ingreso
              </button>
            </form>
          )}

          {vista.tipo === 'verificar' && (
            <div className="space-y-4 text-center">
              <MailCheck className="w-10 h-10 text-blue-600 mx-auto" />
              <h2 className="text-base font-bold text-slate-900">Confirma tu correo electrónico</h2>
              <p className="text-xs text-slate-600">Al confirmar, tu solicitud se enviará a revisión de la administración.</p>
              <button
                type="button"
                onClick={confirmarCorreo}
                disabled={cargando}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-bold py-2.5"
              >
                {cargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {cargando ? 'Confirmando…' : 'Confirmar mi correo'}
              </button>
            </div>
          )}

          {vista.tipo === 'contrasena' && (
            <form onSubmit={enviarContrasena} noValidate className="space-y-4" aria-label="Establecer contraseña">
              <h2 className="text-base font-bold text-slate-900">
                {vista.modo === 'recuperar' ? 'Crea una nueva contraseña' : 'Establece tu contraseña'}
              </h2>
              {titularEnlace === null ? (
                <p className="text-xs text-slate-600 inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Comprobando el enlace…
                </p>
              ) : (
                <>
                  {/* Campo de usuario oculto para que los gestores de contraseñas asocien la cuenta */}
                  <input type="email" name="username" autoComplete="username" value={titularEnlace} readOnly className="sr-only" tabIndex={-1} aria-hidden="true" />
                  <p className="text-xs text-slate-600">
                    Cuenta: <strong>{titularEnlace}</strong>
                  </p>
                  <CampoContrasena
                    id="nueva"
                    etiqueta="Nueva contraseña"
                    valor={nueva}
                    onCambio={(v) => {
                      setNueva(v);
                      limpiar('nueva');
                    }}
                    error={errores.nueva}
                    autoComplete="new-password"
                    ayuda="Mínimo 10 caracteres, con letras y números. No uses partes de tu correo."
                    inputRef={primerCampo}
                  />
                  <CampoContrasena
                    id="confirmar"
                    etiqueta="Confirmar contraseña"
                    valor={confirmar}
                    onCambio={(v) => {
                      setConfirmar(v);
                      limpiar('confirmar');
                    }}
                    error={errores.confirmar}
                    autoComplete="new-password"
                  />
                  {faltaAceptar.documentos && (
                    <CasillasLegales
                      id="pass"
                      valores={casillas}
                      onCambio={(campo, v) => {
                        setCasillas((p) => ({ ...p, [campo]: v }));
                        limpiar(campo);
                      }}
                      errores={errores}
                      mostrarEdad={faltaAceptar.edad}
                    />
                  )}
                  <Boton cargando={cargando} texto="Guardando…">
                    <KeyRound className="w-4 h-4" /> Guardar contraseña
                  </Boton>
                </>
              )}
            </form>
          )}

          {vista.tipo === 'listo' && (
            <div className="space-y-4 text-center" role="status">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h2 className="text-base font-bold text-slate-900">{vista.titulo}</h2>
              <p className="text-sm text-slate-600">{vista.texto}</p>
              <button
                type="button"
                onClick={() => ir({ tipo: 'ingresar' })}
                className="w-full rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-semibold text-slate-800 py-2.5"
              >
                Volver al ingreso
              </button>
            </div>
          )}

          {config?.modoDemo && vista.tipo === 'ingresar' && (
            <div className="border border-dashed border-amber-300 bg-amber-50/60 rounded-xl p-3.5 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">Entorno de pruebas</p>
              <div className="flex gap-2">
                <label htmlFor="rol-demo" className="sr-only">
                  Rol de demostración
                </label>
                <select
                  id="rol-demo"
                  value={rolDemo}
                  onChange={(e) => setRolDemo(e.target.value as UserRole)}
                  className="flex-1 min-w-0 rounded-lg border border-amber-300 bg-white px-2 py-2 text-xs"
                >
                  {ORDEN_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {NOMBRE_ROL[r]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={entrarDemo}
                  disabled={cargando}
                  className="shrink-0 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3"
                >
                  Entrar en demostración
                </button>
              </div>
              <p className="text-[10px] text-amber-800">Sin datos reales. No disponible en el servidor de producción.</p>
            </div>
          )}
        </div>

        <footer className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
          <EnlacesLegales />
          <p className="text-center text-[10px] text-slate-400">Plataforma para personas de 18 años o más.</p>
        </footer>
      </main>
    </div>
  );
};
