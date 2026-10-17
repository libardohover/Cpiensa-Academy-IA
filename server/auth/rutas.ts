/**
 * Autenticación, solicitudes de acceso y panel de aprobación.
 *
 * Flujo:
 *  1. POST /api/auth/solicitudes      → cuenta "pendiente_verificacion" + correo de verificación.
 *  2. POST /api/auth/verificar        → "pendiente_aprobacion" + aviso a APROBACIONES_CORREO.
 *  3. POST /api/admin/solicitudes/:id/decision (administrador con sesión) → aprobar / rechazar / pedir información.
 *  4. Al aprobar: rol e institución asignados + enlace personal para establecer contraseña.
 *  5. POST /api/auth/contrasena       → contraseña guardada (scrypt). Ya puede ingresar.
 *  6. POST /api/auth/ingresar         → sesión (cookie HttpOnly). Cuentas administrativas: código adicional.
 */
import express from 'express';
import crypto from 'node:crypto';
import type { UserRole } from '../../src/types';
import {
  NOMBRE_ROL,
  ROLES_ADMINISTRATIVOS,
  ROLES_GESTORES,
  ROLES_SOLICITABLES,
  esRol,
  rolesAsignables,
  puedeAcceder,
} from '../../src/auth/permisos';
import { INSTITUCIONES, institucionPorId } from '../../src/data/instituciones';
import * as db from './almacen';
import type { Cuenta, Sesion } from './almacen';
import {
  COOKIE,
  borrarCookie,
  cifrarContrasena,
  correoValido,
  esperaPendiente,
  ipDe,
  leerCookie,
  limpiarIntentos,
  ponerCookie,
  problemaContrasena,
  registrarIntento,
  verificarContrasena,
} from './seguridad';
import { CORREO_APROBACIONES, enviarCorreo, smtpConfigurado } from './correo';
import * as P from './plantillas';
import { DOCUMENTOS, DOCUMENTOS_OBLIGATORIOS, TEXTO_CASILLA, type IdDocumento } from '../../src/legal/documentos';
import { HUELLA_EDAD, huellaDocumento, registrarConsentimiento } from '../legal/consentimientos';

const HORAS_VERIFICACION = 24;
const HORAS_ENLACE_CONTRASENA = 48;
const MINUTOS_RECUPERACION = 60;
const MINUTOS_CODIGO = 10;
const SEGUNDOS_SESION = (Number(process.env.SESION_HORAS) || 8) * 3600;

export const modoDemo = () =>
  process.env.MODO_DEMO === 'true' || (process.env.NODE_ENV !== 'production' && process.env.MODO_DEMO !== 'false');

function urlBase(req: express.Request): string {
  const base = process.env.APP_URL?.trim();
  if (base && base !== 'MY_APP_URL') return base.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

const nombreInstitucion = (id: string) => institucionPorId(id)?.name ?? id;

export type UsuarioPublico = {
  id: string;
  nombre: string;
  correo: string;
  rol: UserRole;
  institucionId: string;
  institucionNombre: string;
  esDemo: boolean;
  /** Documentos obligatorios cuya versión vigente aún no ha aceptado. */
  pendientesLegales: IdDocumento[];
};

/** Documentos obligatorios que la cuenta no ha aceptado en su versión vigente. */
export const pendientesLegales = (c: Cuenta): IdDocumento[] =>
  DOCUMENTOS_OBLIGATORIOS.filter((id) => c.aceptaciones?.[id as 'terminos' | 'privacidad']?.version !== DOCUMENTOS[id].version);

/** Valida las casillas enviadas desde un formulario. Devuelve errores por campo. */
export function validarCasillas(body: any, exigirEdad: boolean): Record<string, string> {
  const e: Record<string, string> = {};
  if (body?.aceptaTerminos !== true) e.aceptaTerminos = 'Debes aceptar los Términos y condiciones.';
  if (body?.aceptaPrivacidad !== true) e.aceptaPrivacidad = 'Debes aceptar la Política de tratamiento de datos personales.';
  if (exigirEdad && body?.mayorDeEdad !== true) e.mayorDeEdad = 'La plataforma es solo para personas de 18 años o más.';
  // Las versiones que vio la persona deben ser las vigentes
  for (const id of DOCUMENTOS_OBLIGATORIOS) {
    const v = body?.versiones?.[id];
    if (v !== undefined && v !== DOCUMENTOS[id].version) e.version = 'Los documentos se actualizaron. Recarga la página para ver la versión vigente.';
  }
  return e;
}

/** Guarda la prueba de la aceptación y la última versión aceptada en la cuenta. */
export function guardarAceptaciones(c: Cuenta, medio: string, req: express.Request, conEdad: boolean) {
  const ahora = new Date().toISOString();
  const base = {
    correo: c.correo,
    cuentaId: c.id,
    institucionId: c.institucionId,
    accion: 'aceptar' as const,
    medio,
    ip: ipDe(req),
    navegador: String(req.get('user-agent') || '').slice(0, 300),
  };
  for (const id of DOCUMENTOS_OBLIGATORIOS) {
    registrarConsentimiento({ ...base, documento: id, version: DOCUMENTOS[id].version, huella: huellaDocumento(id), casilla: TEXTO_CASILLA[id as 'terminos' | 'privacidad'] });
  }
  if (conEdad) registrarConsentimiento({ ...base, documento: 'declaracion_edad', version: '1', huella: HUELLA_EDAD, casilla: TEXTO_CASILLA.edad });
  db.actualizarCuenta(c.id, {
    aceptaciones: {
      ...c.aceptaciones,
      terminos: { version: DOCUMENTOS.terminos.version, fecha: ahora },
      privacidad: { version: DOCUMENTOS.privacidad.version, fecha: ahora },
    },
    ...(conEdad ? { mayorDeEdad: true } : {}),
  });
  db.auditar({ actor: c.correo, accion: 'documentos_aceptados', institucionId: c.institucionId, detalle: `${medio}: términos v${DOCUMENTOS.terminos.version}, privacidad v${DOCUMENTOS.privacidad.version}${conEdad ? ', declaración de mayoría de edad' : ''}`, ip: ipDe(req) });
}

function publico(c: Cuenta): UsuarioPublico {
  return {
    id: c.id,
    nombre: c.nombre,
    correo: c.correo,
    rol: c.rol!,
    institucionId: c.institucionId,
    institucionNombre: nombreInstitucion(c.institucionId),
    esDemo: false,
    pendientesLegales: pendientesLegales(c),
  };
}

function usuarioDemo(rol: UserRole): UsuarioPublico {
  return {
    id: 'demo',
    nombre: 'Ana María Restrepo',
    correo: 'ana.restrepo@cpiensa.edu.co',
    rol,
    institucionId: INSTITUCIONES[0].id,
    institucionNombre: INSTITUCIONES[0].name,
    esDemo: true,
    pendientesLegales: [],
  };
}

/** Una cuenta puede usar la plataforma solo si está verificada, aprobada y activa. */
const puedeIngresar = (c: Cuenta) => c.correoVerificado && c.aprobada && c.estado === 'activa' && Boolean(c.rol);

// ---------- Middleware de sesión (para el resto de la API) ----------

export type ReqConSesion = express.Request & { usuario?: UsuarioPublico; sesion?: Sesion; cuenta?: Cuenta };

/** Exige una sesión válida y completa. Vuelve a leer la cuenta en cada petición. */
export function exigirSesion(req: ReqConSesion, res: express.Response, next: express.NextFunction) {
  const r = db.leerSesion(leerCookie(req));
  if (!r) return res.status(401).json({ error: 'Inicia sesión para continuar.', codigo: 'sin_sesion' });
  if ('vencida' in r) {
    borrarCookie(req, res);
    return res.status(401).json({ error: 'Tu sesión venció. Ingresa de nuevo.', codigo: 'sesion_vencida' });
  }
  const s = r.sesion;
  if (s.pendienteCodigo) return res.status(401).json({ error: 'Falta el código de verificación.', codigo: 'codigo_pendiente' });
  if (s.cuentaId) {
    const c = db.cuentaPorId(s.cuentaId);
    if (!c || !puedeIngresar(c)) {
      db.cerrarSesion(leerCookie(req)!);
      borrarCookie(req, res);
      return res.status(401).json({ error: 'Tu cuenta ya no tiene acceso.', codigo: 'cuenta_inactiva' });
    }
    req.cuenta = c;
    req.usuario = publico(c);
    // Con documentos nuevos sin aceptar, solo se permite aceptarlos o consultar los datos propios.
    const libre = req.originalUrl.startsWith('/api/legal/') || req.originalUrl.startsWith('/api/auth/');
    if (req.usuario.pendientesLegales.length && !libre) {
      return res.status(403).json({ error: 'Debes aceptar la versión vigente de los documentos legales para continuar.', codigo: 'aceptacion_pendiente' });
    }
  } else if (s.demoRol && modoDemo()) {
    req.usuario = usuarioDemo(s.demoRol);
  } else {
    return res.status(401).json({ error: 'Inicia sesión para continuar.', codigo: 'sin_sesion' });
  }
  req.sesion = s;
  next();
}

/** Exige que el rol de la sesión tenga acceso a alguna de las secciones indicadas. */
export const exigirSeccion =
  (...secciones: string[]) =>
  (req: ReqConSesion, res: express.Response, next: express.NextFunction) => {
    const rol = req.usuario!.rol;
    if (secciones.some((s) => puedeAcceder(rol, s))) return next();
    res.status(403).json({ error: 'Tu rol no tiene permiso para esta operación.', codigo: 'sin_permiso' });
  };

/** Solo cuentas reales con rol gestor o auditor (las sesiones de demostración no deciden). */
function exigirAdmin(soloLectura: boolean) {
  return (req: ReqConSesion, res: express.Response, next: express.NextFunction) => {
    const u = req.usuario!;
    if (u.esDemo) return res.status(403).json({ error: 'Las decisiones requieren una cuenta administradora real.', codigo: 'solo_cuenta_real' });
    const permitidos: UserRole[] = soloLectura ? [...ROLES_GESTORES, 'Auditor'] : ROLES_GESTORES;
    if (!permitidos.includes(u.rol)) return res.status(403).json({ error: 'Se requiere una cuenta administradora autorizada.', codigo: 'sin_permiso' });
    next();
  };
}

/** El SuperAdmin ve todas las instituciones; los demás, solo la suya. */
const enAlcance = (u: UsuarioPublico, institucionId: string | undefined) =>
  u.rol === 'SuperAdmin' || (Boolean(institucionId) && u.institucionId === institucionId);

const texto = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

function vistaCuenta(c: Cuenta) {
  return {
    id: c.id,
    nombre: c.nombre,
    correo: c.correo,
    institucionId: c.institucionId,
    institucionNombre: nombreInstitucion(c.institucionId),
    rolSolicitado: c.rolSolicitado,
    rol: c.rol,
    estado: c.estado,
    correoVerificado: c.correoVerificado,
    aprobada: c.aprobada,
    tieneContrasena: Boolean(c.passwordHash),
    motivoSolicitud: c.motivoSolicitud,
    decisiones: c.decisiones,
    creada: c.creada,
    actualizada: c.actualizada,
    ultimoIngreso: c.ultimoIngreso,
  };
}

// ---------- Rutas ----------

export function rutasAutenticacion(): express.Router {
  const r = express.Router();

  r.get('/auth/config', (_req, res) => {
    res.json({
      modoDemo: modoDemo(),
      correoAprobaciones: CORREO_APROBACIONES,
      correoReal: smtpConfigurado(),
      instituciones: INSTITUCIONES.map((i) => ({ id: i.id, nombre: i.name })),
      rolesSolicitables: ROLES_SOLICITABLES.map((id) => ({ id, nombre: NOMBRE_ROL[id] })),
    });
  });

  // 1. Solicitud de acceso
  r.post('/auth/solicitudes', async (req, res) => {
    const ip = ipDe(req);
    const nombre = texto(req.body?.nombre, 120);
    const correo = db.normalizarCorreo(req.body?.correo);
    const institucionId = texto(req.body?.institucionId, 80);
    const rol = req.body?.rol;
    const motivo = texto(req.body?.motivo, 500);
    const errores: Record<string, string> = {};
    if (nombre.length < 3) errores.nombre = 'Escribe tu nombre completo.';
    if (!correoValido(correo)) errores.correo = 'Escribe un correo válido.';
    if (!institucionPorId(institucionId)) errores.institucionId = 'Elige una institución.';
    if (!esRol(rol) || !ROLES_SOLICITABLES.includes(rol)) errores.rol = 'Elige un rol.';
    Object.assign(errores, validarCasillas(req.body, true));
    if (Object.keys(errores).length) return res.status(400).json({ error: 'Revisa los campos marcados.', codigo: 'validacion', errores });
    // Límite por IP: solo cuentan las solicitudes válidas (las que generan correos)
    if (registrarIntento(`solicitud:${ip}`, 5, 60, 60)) {
      return res.status(429).json({ error: 'Has enviado muchas solicitudes. Intenta más tarde.', codigo: 'limite' });
    }

    const mensaje =
      'Si los datos son correctos, recibirás en tu correo un enlace para confirmarlo. Revisa también la carpeta de spam.';
    const existente = db.cuentaPorCorreo(correo);
    if (existente) {
      // No se revela si el correo ya existe. Solo se reenvía la verificación si sigue pendiente.
      if (existente.estado === 'pendiente_verificacion') {
        const token = db.crearToken('verificacion', existente.id, HORAS_VERIFICACION * 60);
        await enviarCorreo(P.correoVerificacion(correo, existente.nombre, `${urlBase(req)}/?accion=verificar&token=${token}`, HORAS_VERIFICACION));
      }
      db.auditar({ actor: correo, accion: 'solicitud_repetida', objetivo: correo, institucionId: existente.institucionId, ip });
      return res.status(202).json({ ok: true, mensaje });
    }
    const cuenta = db.crearCuenta({
      nombre,
      correo,
      institucionId,
      rolSolicitado: rol,
      rol: null,
      estado: 'pendiente_verificacion',
      correoVerificado: false,
      aprobada: false,
      passwordHash: null,
      motivoSolicitud: motivo || undefined,
    });
    guardarAceptaciones(cuenta, 'formulario_solicitud_acceso', req, true);
    const token = db.crearToken('verificacion', cuenta.id, HORAS_VERIFICACION * 60);
    await enviarCorreo(P.correoVerificacion(correo, nombre, `${urlBase(req)}/?accion=verificar&token=${token}`, HORAS_VERIFICACION));
    db.auditar({ actor: correo, accion: 'solicitud_creada', objetivo: correo, institucionId, detalle: `Rol solicitado: ${NOMBRE_ROL[rol as UserRole]}`, ip });
    res.status(202).json({ ok: true, mensaje });
  });

  // 2. Verificación del correo → aviso a la cuenta de aprobaciones
  r.post('/auth/verificar', async (req, res) => {
    const t = db.usarToken('verificacion', texto(req.body?.token, 200));
    if (!t) return res.status(400).json({ error: 'El enlace no es válido o ya venció. Solicita acceso de nuevo.', codigo: 'token_invalido' });
    const c = db.cuentaPorId(t.cuentaId);
    if (!c || c.estado !== 'pendiente_verificacion') {
      return res.json({ ok: true, mensaje: 'Tu correo ya estaba verificado. La solicitud está en revisión.' });
    }
    db.actualizarCuenta(c.id, { correoVerificado: true, estado: 'pendiente_aprobacion' });
    const ahora = new Date().toISOString();
    await enviarCorreo(
      P.correoNuevaSolicitud(
        CORREO_APROBACIONES,
        {
          nombre: c.nombre,
          correo: c.correo,
          institucion: nombreInstitucion(c.institucionId),
          rol: NOMBRE_ROL[c.rolSolicitado],
          fecha: c.creada,
          motivo: c.motivoSolicitud,
        },
        `${urlBase(req)}/?panel=solicitudes&id=${encodeURIComponent(c.id)}`,
      ),
    );
    db.auditar({ actor: c.correo, accion: 'correo_verificado', objetivo: c.correo, institucionId: c.institucionId, ip: ipDe(req) });
    db.auditar({ actor: 'sistema', accion: 'solicitud_notificada', objetivo: c.correo, institucionId: c.institucionId, detalle: `Aviso enviado a ${CORREO_APROBACIONES} (${ahora})` });
    res.json({
      ok: true,
      mensaje: 'Tu correo fue verificado. Tu solicitud se envió a revisión; recibirás la decisión por correo.',
    });
  });

  // 6. Ingreso
  r.post('/auth/ingresar', async (req, res) => {
    const ip = ipDe(req);
    const correo = db.normalizarCorreo(req.body?.correo);
    const contrasena = String(req.body?.contrasena ?? '');
    if (!correo || !contrasena) {
      return res.status(400).json({
        error: 'Escribe tu correo y tu contraseña.',
        codigo: 'validacion',
        errores: { ...(!correo && { correo: 'Escribe tu correo.' }), ...(!contrasena && { contrasena: 'Escribe tu contraseña.' }) },
      });
    }
    const espera = Math.max(esperaPendiente(`login:${correo}`), esperaPendiente(`loginip:${ip}`));
    if (espera) {
      return res.status(429).json({ error: `Demasiados intentos. Espera ${Math.ceil(espera / 60)} minuto(s) e inténtalo de nuevo.`, codigo: 'limite' });
    }
    const c = db.cuentaPorCorreo(correo);
    const ok = await verificarContrasena(contrasena, c?.passwordHash ?? null);
    if (!c || !ok) {
      registrarIntento(`login:${correo}`, 5, 15, 15);
      registrarIntento(`loginip:${ip}`, 30, 15, 15);
      db.auditar({ actor: correo, accion: 'ingreso_fallido', institucionId: c?.institucionId, ip });
      return res.status(401).json({
        error: 'Correo o contraseña incorrectos. Si solicitaste acceso, podrás ingresar cuando tu cuenta sea aprobada y establezcas tu contraseña.',
        codigo: 'credenciales',
      });
    }
    limpiarIntentos(`login:${correo}`);
    // Con la contraseña correcta sí se informa el estado de la cuenta.
    if (c.estado === 'suspendida') {
      db.auditar({ actor: correo, accion: 'ingreso_rechazado', detalle: 'Cuenta suspendida', institucionId: c.institucionId, ip });
      return res.status(403).json({ error: 'Tu cuenta está suspendida. Comunícate con la administración de tu institución.', codigo: 'cuenta_suspendida' });
    }
    if (c.estado === 'desactivada') {
      db.auditar({ actor: correo, accion: 'ingreso_rechazado', detalle: 'Cuenta desactivada', institucionId: c.institucionId, ip });
      return res.status(403).json({ error: 'Tu cuenta no está activa.', codigo: 'cuenta_inactiva' });
    }
    if (!puedeIngresar(c)) {
      return res.status(403).json({ error: 'Tu acceso todavía está pendiente de aprobación.', codigo: 'acceso_pendiente' });
    }
    if (ROLES_ADMINISTRATIVOS.includes(c.rol!)) {
      const codigo = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
      db.crearToken('codigo_admin', c.id, MINUTOS_CODIGO, codigo);
      await enviarCorreo(P.correoCodigoAdmin(c.correo, c.nombre, codigo, MINUTOS_CODIGO));
      const s = db.crearSesion({ cuentaId: c.id, pendienteCodigo: true });
      ponerCookie(req, res, s, MINUTOS_CODIGO * 60);
      db.auditar({ actor: correo, accion: 'codigo_admin_enviado', institucionId: c.institucionId, ip });
      return res.json({ requiereCodigo: true, mensaje: `Enviamos un código de 6 dígitos a ${ocultar(c.correo)}.` });
    }
    const s = db.crearSesion({ cuentaId: c.id });
    ponerCookie(req, res, s, SEGUNDOS_SESION);
    db.actualizarCuenta(c.id, { ultimoIngreso: new Date().toISOString() });
    db.auditar({ actor: correo, accion: 'ingreso', institucionId: c.institucionId, ip });
    res.json({ usuario: publico(c) });
  });

  // Código adicional para cuentas administrativas
  r.post('/auth/codigo', (req, res) => {
    const claro = leerCookie(req);
    const rs = db.leerSesion(claro);
    if (!rs || 'vencida' in rs || !rs.sesion.pendienteCodigo || !rs.sesion.cuentaId) {
      borrarCookie(req, res);
      return res.status(401).json({ error: 'El código venció. Ingresa de nuevo.', codigo: 'sesion_vencida' });
    }
    const c = db.cuentaPorId(rs.sesion.cuentaId)!;
    const r2 = db.verificarCodigo(c.id, texto(req.body?.codigo, 10));
    if (r2 !== 'ok') {
      db.auditar({ actor: c.correo, accion: 'codigo_admin_fallido', institucionId: c.institucionId, ip: ipDe(req) });
      if (r2 === 'agotado') {
        db.cerrarSesion(claro!);
        borrarCookie(req, res);
        return res.status(401).json({ error: 'El código venció o superaste los intentos. Ingresa de nuevo.', codigo: 'sesion_vencida' });
      }
      return res.status(400).json({ error: 'El código no es correcto.', codigo: 'codigo_invalido' });
    }
    db.completarCodigo(claro!);
    ponerCookie(req, res, claro!, SEGUNDOS_SESION);
    db.actualizarCuenta(c.id, { ultimoIngreso: new Date().toISOString() });
    db.auditar({ actor: c.correo, accion: 'ingreso', detalle: 'Con código adicional', institucionId: c.institucionId, ip: ipDe(req) });
    res.json({ usuario: publico(c) });
  });

  r.get('/auth/sesion', (req: ReqConSesion, res) => {
    const rs = db.leerSesion(leerCookie(req));
    if (!rs) return res.status(401).json({ codigo: 'sin_sesion' });
    if ('vencida' in rs) {
      borrarCookie(req, res);
      return res.status(401).json({ codigo: 'sesion_vencida', error: 'Tu sesión venció. Ingresa de nuevo.' });
    }
    if (rs.sesion.pendienteCodigo) return res.status(401).json({ codigo: 'codigo_pendiente' });
    exigirSesion(req, res, () => res.json({ usuario: req.usuario }));
  });

  r.post('/auth/salir', (req, res) => {
    const claro = leerCookie(req);
    if (claro) {
      const rs = db.leerSesion(claro);
      if (rs && 'sesion' in rs && rs.sesion.cuentaId) {
        const c = db.cuentaPorId(rs.sesion.cuentaId);
        db.auditar({ actor: c?.correo ?? 'desconocido', accion: 'salida', institucionId: c?.institucionId, ip: ipDe(req) });
      }
      db.cerrarSesion(claro);
    }
    borrarCookie(req, res);
    res.json({ ok: true });
  });

  // Recuperación de contraseña (respuesta siempre igual)
  r.post('/auth/recuperar', async (req, res) => {
    const ip = ipDe(req);
    const correo = db.normalizarCorreo(req.body?.correo);
    const mensaje = 'Si el correo corresponde a una cuenta aprobada, recibirás un enlace para crear una nueva contraseña.';
    if (!correoValido(correo)) return res.status(400).json({ error: 'Escribe un correo válido.', codigo: 'validacion', errores: { correo: 'Escribe un correo válido.' } });
    if (registrarIntento(`recuperar:${ip}`, 5, 60, 60) || registrarIntento(`recuperar:${correo}`, 3, 60, 60)) {
      return res.status(202).json({ ok: true, mensaje });
    }
    const c = db.cuentaPorCorreo(correo);
    if (c && puedeIngresar(c)) {
      const token = db.crearToken('recuperacion', c.id, MINUTOS_RECUPERACION);
      await enviarCorreo(P.correoRecuperacion(c.correo, c.nombre, `${urlBase(req)}/?accion=recuperar&token=${token}`, MINUTOS_RECUPERACION));
      db.auditar({ actor: c.correo, accion: 'recuperacion_solicitada', institucionId: c.institucionId, ip });
    }
    res.status(202).json({ ok: true, mensaje });
  });

  // Consulta un enlace de contraseña sin consumirlo (para mostrar el formulario)
  r.post('/auth/enlace', (req, res) => {
    const tipo = req.body?.tipo === 'recuperar' ? 'recuperacion' : 'contrasena';
    const t = db.usarToken(tipo, texto(req.body?.token, 200), false);
    const c = t && db.cuentaPorId(t.cuentaId);
    if (!c || !puedeIngresar(c)) return res.status(400).json({ error: 'El enlace no es válido o ya venció.', codigo: 'token_invalido' });
    res.json({ correo: c.correo, nombre: c.nombre, pendientesLegales: pendientesLegales(c), declaroEdad: Boolean(c.mayorDeEdad) });
  });

  // 5. Establecer o restablecer contraseña
  r.post('/auth/contrasena', async (req, res) => {
    const tipo = req.body?.tipo === 'recuperar' ? 'recuperacion' : 'contrasena';
    const claro = texto(req.body?.token, 200);
    const t = db.usarToken(tipo, claro, false);
    const c = t && db.cuentaPorId(t.cuentaId);
    if (!c || !puedeIngresar(c)) return res.status(400).json({ error: 'El enlace no es válido o ya venció.', codigo: 'token_invalido' });
    const contrasena = String(req.body?.contrasena ?? '');
    const problema = problemaContrasena(contrasena, c.correo);
    if (problema) return res.status(400).json({ error: problema, codigo: 'validacion', errores: { contrasena: problema } });
    // Cuentas que aún no aceptaron los documentos vigentes (p. ej., la administradora inicial) los aceptan aquí.
    const faltan = pendientesLegales(c).length > 0 || !c.mayorDeEdad;
    if (faltan) {
      const errores = validarCasillas(req.body, !c.mayorDeEdad);
      if (Object.keys(errores).length) return res.status(400).json({ error: 'Revisa las casillas marcadas.', codigo: 'validacion', errores });
    }
    db.usarToken(tipo, claro, true);
    if (faltan) guardarAceptaciones(c, tipo === 'recuperacion' ? 'restablecer_contrasena' : 'establecer_contrasena', req, !c.mayorDeEdad);
    db.actualizarCuenta(c.id, { passwordHash: await cifrarContrasena(contrasena) });
    db.cerrarSesionesDe(c.id);
    db.auditar({ actor: c.correo, accion: tipo === 'recuperacion' ? 'contrasena_restablecida' : 'contrasena_establecida', institucionId: c.institucionId, ip: ipDe(req) });
    res.json({ ok: true, mensaje: 'Tu contraseña quedó guardada. Ya puedes ingresar.' });
  });

  // Sesión de demostración (solo en el entorno de pruebas)
  r.post('/auth/demo', (req, res) => {
    if (!modoDemo()) return res.status(404).json({ error: 'No disponible.', codigo: 'no_disponible' });
    const rol = req.body?.rol;
    if (!esRol(rol)) return res.status(400).json({ error: 'Rol inválido.', codigo: 'validacion' });
    const s = db.crearSesion({ cuentaId: null, demoRol: rol });
    ponerCookie(req, res, s, SEGUNDOS_SESION);
    res.json({ usuario: usuarioDemo(rol) });
  });

  r.post('/auth/demo/rol', (req: ReqConSesion, res) => {
    if (!modoDemo()) return res.status(404).json({ error: 'No disponible.', codigo: 'no_disponible' });
    exigirSesion(req, res, () => {
      if (!req.usuario!.esDemo) return res.status(403).json({ error: 'El rol de una cuenta real lo asigna un administrador.', codigo: 'sin_permiso' });
      const rol = req.body?.rol;
      if (!esRol(rol)) return res.status(400).json({ error: 'Rol inválido.', codigo: 'validacion' });
      req.sesion!.demoRol = rol;
      res.json({ usuario: usuarioDemo(rol) });
    });
  });

  // ---------- Panel administrativo ----------

  r.get('/admin/solicitudes', exigirSesion, exigirAdmin(true), (req: ReqConSesion, res) => {
    const u = req.usuario!;
    const lista = db
      .cuentas()
      .filter((c) => enAlcance(u, c.institucionId))
      .sort((a, b) => b.creada.localeCompare(a.creada))
      .map(vistaCuenta);
    res.json({ cuentas: lista, puedeDecidir: ROLES_GESTORES.includes(u.rol), rolesAsignables: rolesAsignables(u.rol) });
  });

  r.post('/admin/solicitudes/:id/decision', exigirSesion, exigirAdmin(false), async (req: ReqConSesion, res) => {
    const u = req.usuario!;
    const c = db.cuentaPorId(String(req.params.id));
    if (!c || !enAlcance(u, c.institucionId)) return res.status(404).json({ error: 'Solicitud no encontrada.', codigo: 'no_encontrada' });
    if (c.estado !== 'pendiente_aprobacion') {
      return res.status(409).json({ error: 'Esta solicitud ya no está pendiente de aprobación.', codigo: 'estado' });
    }
    const tipo = req.body?.tipo;
    const comentario = texto(req.body?.comentario, 1000);
    const ahora = new Date().toISOString();
    const base = urlBase(req);

    if (tipo === 'aprobar') {
      const institucionId = texto(req.body?.institucionId, 80);
      const rol = req.body?.rol;
      if (!institucionPorId(institucionId) || !enAlcance(u, institucionId)) {
        return res.status(400).json({ error: 'Confirma una institución dentro de tu alcance.', codigo: 'validacion' });
      }
      if (!esRol(rol) || !rolesAsignables(u.rol).includes(rol)) {
        return res.status(400).json({ error: 'No puedes asignar ese rol.', codigo: 'validacion' });
      }
      db.actualizarCuenta(c.id, {
        institucionId,
        rol,
        aprobada: true,
        estado: 'activa',
        decisiones: [...c.decisiones, { tipo: 'aprobada', por: u.correo, fecha: ahora, comentario: comentario || undefined }],
      });
      const token = db.crearToken('contrasena', c.id, HORAS_ENLACE_CONTRASENA * 60);
      await enviarCorreo(
        P.correoAprobada(c.correo, c.nombre, nombreInstitucion(institucionId), NOMBRE_ROL[rol], `${base}/?accion=contrasena&token=${token}`, HORAS_ENLACE_CONTRASENA),
      );
      await enviarCorreo(
        P.correoConfirmacionDecision(CORREO_APROBACIONES, {
          decision: 'Aprobada',
          solicitante: c.nombre,
          correo: c.correo,
          institucion: nombreInstitucion(institucionId),
          rol: NOMBRE_ROL[rol],
          por: u.correo,
          fecha: ahora,
          comentario,
        }),
      );
      db.auditar({
        actor: u.correo,
        accion: 'solicitud_aprobada',
        objetivo: c.correo,
        institucionId,
        detalle: `Rol: ${NOMBRE_ROL[rol]}; institución: ${nombreInstitucion(institucionId)}${comentario ? `; ${comentario}` : ''}`,
        ip: ipDe(req),
      });
      return res.json({ ok: true, cuenta: vistaCuenta(db.cuentaPorId(c.id)!) });
    }

    if (tipo === 'rechazar') {
      db.actualizarCuenta(c.id, {
        estado: 'desactivada',
        aprobada: false,
        decisiones: [...c.decisiones, { tipo: 'rechazada', por: u.correo, fecha: ahora, comentario: comentario || undefined }],
      });
      await enviarCorreo(P.correoRechazada(c.correo, c.nombre, comentario || undefined));
      await enviarCorreo(
        P.correoConfirmacionDecision(CORREO_APROBACIONES, {
          decision: 'Rechazada',
          solicitante: c.nombre,
          correo: c.correo,
          institucion: nombreInstitucion(c.institucionId),
          por: u.correo,
          fecha: ahora,
          comentario,
        }),
      );
      db.auditar({ actor: u.correo, accion: 'solicitud_rechazada', objetivo: c.correo, institucionId: c.institucionId, detalle: comentario || undefined, ip: ipDe(req) });
      return res.json({ ok: true, cuenta: vistaCuenta(db.cuentaPorId(c.id)!) });
    }

    if (tipo === 'informacion') {
      if (comentario.length < 5) return res.status(400).json({ error: 'Escribe qué información necesitas.', codigo: 'validacion' });
      db.actualizarCuenta(c.id, {
        decisiones: [...c.decisiones, { tipo: 'informacion', por: u.correo, fecha: ahora, comentario }],
      });
      await enviarCorreo(P.correoInformacion(c.correo, c.nombre, comentario, CORREO_APROBACIONES));
      await enviarCorreo(
        P.correoConfirmacionDecision(CORREO_APROBACIONES, {
          decision: 'Información adicional solicitada',
          solicitante: c.nombre,
          correo: c.correo,
          institucion: nombreInstitucion(c.institucionId),
          por: u.correo,
          fecha: ahora,
          comentario,
        }),
      );
      db.auditar({ actor: u.correo, accion: 'informacion_solicitada', objetivo: c.correo, institucionId: c.institucionId, detalle: comentario, ip: ipDe(req) });
      return res.json({ ok: true, cuenta: vistaCuenta(db.cuentaPorId(c.id)!) });
    }

    res.status(400).json({ error: 'Decisión no reconocida.', codigo: 'validacion' });
  });

  r.post('/admin/cuentas/:id/estado', exigirSesion, exigirAdmin(false), async (req: ReqConSesion, res) => {
    const u = req.usuario!;
    const c = db.cuentaPorId(String(req.params.id));
    if (!c || !enAlcance(u, c.institucionId)) return res.status(404).json({ error: 'Cuenta no encontrada.', codigo: 'no_encontrada' });
    if (c.id === u.id) return res.status(400).json({ error: 'No puedes cambiar el estado de tu propia cuenta.', codigo: 'validacion' });
    if (c.rol === 'SuperAdmin' && u.rol !== 'SuperAdmin') return res.status(403).json({ error: 'No puedes modificar una cuenta SuperAdmin.', codigo: 'sin_permiso' });
    const estado = req.body?.estado;
    if (!['activa', 'suspendida', 'desactivada'].includes(estado)) return res.status(400).json({ error: 'Estado no válido.', codigo: 'validacion' });
    if (!c.aprobada) return res.status(409).json({ error: 'Primero debe decidirse la solicitud.', codigo: 'estado' });
    db.actualizarCuenta(c.id, { estado });
    if (estado !== 'activa') db.cerrarSesionesDe(c.id);
    const etiqueta = { activa: 'reactivada', suspendida: 'suspendida', desactivada: 'desactivada' }[estado as 'activa'];
    await enviarCorreo(P.correoCambioEstado(c.correo, c.nombre, etiqueta));
    db.auditar({ actor: u.correo, accion: `cuenta_${etiqueta}`, objetivo: c.correo, institucionId: c.institucionId, detalle: texto(req.body?.comentario, 500) || undefined, ip: ipDe(req) });
    res.json({ ok: true, cuenta: vistaCuenta(db.cuentaPorId(c.id)!) });
  });

  r.post('/admin/cuentas/:id/enlace', exigirSesion, exigirAdmin(false), async (req: ReqConSesion, res) => {
    const u = req.usuario!;
    const c = db.cuentaPorId(String(req.params.id));
    if (!c || !enAlcance(u, c.institucionId)) return res.status(404).json({ error: 'Cuenta no encontrada.', codigo: 'no_encontrada' });
    if (!puedeIngresar(c)) return res.status(409).json({ error: 'La cuenta no está activa.', codigo: 'estado' });
    const token = db.crearToken('contrasena', c.id, HORAS_ENLACE_CONTRASENA * 60);
    await enviarCorreo(
      P.correoAprobada(c.correo, c.nombre, nombreInstitucion(c.institucionId), NOMBRE_ROL[c.rol!], `${urlBase(req)}/?accion=contrasena&token=${token}`, HORAS_ENLACE_CONTRASENA),
    );
    db.auditar({ actor: u.correo, accion: 'enlace_contrasena_reenviado', objetivo: c.correo, institucionId: c.institucionId, ip: ipDe(req) });
    res.json({ ok: true });
  });

  r.get('/admin/auditoria', exigirSesion, exigirAdmin(true), (req: ReqConSesion, res) => {
    const u = req.usuario!;
    res.json({ eventos: db.leerAuditoria(500).filter((e) => u.rol === 'SuperAdmin' || e.institucionId === u.institucionId) });
  });

  return r;
}

function ocultar(correo: string) {
  const [u, d] = correo.split('@');
  return `${u.slice(0, 2)}${'•'.repeat(Math.max(1, u.length - 2))}@${d}`;
}

/**
 * Primera ejecución: si no existe ningún SuperAdmin, crea la cuenta administradora
 * inicial (ADMIN_INICIAL_CORREO o APROBACIONES_CORREO) y le envía el enlace para
 * establecer su contraseña. No se crea ninguna contraseña por defecto.
 */
export async function prepararAdministradorInicial(urlBaseServidor: string) {
  if (db.cuentas().some((c) => c.rol === 'SuperAdmin')) return;
  const correo = db.normalizarCorreo(process.env.ADMIN_INICIAL_CORREO || CORREO_APROBACIONES);
  const nombre = process.env.ADMIN_INICIAL_NOMBRE || 'Administración CPIENSA+';
  const existente = db.cuentaPorCorreo(correo);
  const cuenta = existente
    ? db.actualizarCuenta(existente.id, { rol: 'SuperAdmin', aprobada: true, correoVerificado: true, estado: 'activa' })
    : db.crearCuenta({
        nombre,
        correo,
        institucionId: INSTITUCIONES[0].id,
        rolSolicitado: 'SuperAdmin' as UserRole,
        rol: 'SuperAdmin',
        estado: 'activa',
        correoVerificado: true,
        aprobada: true,
        passwordHash: null,
      });
  const token = db.crearToken('contrasena', cuenta.id, 72 * 60);
  await enviarCorreo(
    P.correoAdministradorInicial(correo, cuenta.nombre, `${urlBaseServidor}/?accion=contrasena&token=${token}`, 72),
  );
  db.auditar({ actor: 'sistema', accion: 'administrador_inicial_creado', objetivo: correo, institucionId: cuenta.institucionId });
  console.log(`[acceso] Cuenta administradora inicial: ${correo}. Se envió el enlace para establecer la contraseña (vence en 72 horas).`);
}

export { COOKIE };
