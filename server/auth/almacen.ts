/**
 * Almacenamiento de cuentas, tokens, sesiones y auditoría.
 *
 * Usa archivos JSON en la carpeta `datos/` (excluida de Git) con escritura
 * atómica. Es adecuado para un piloto en un solo servidor. Para operar a
 * mayor escala se reemplaza este módulo por una base de datos (PostgreSQL),
 * manteniendo las mismas funciones.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { UserRole } from '../../src/types';

export type EstadoCuenta =
  | 'pendiente_verificacion'
  | 'pendiente_aprobacion'
  | 'activa'
  | 'suspendida'
  | 'desactivada';

export type Decision = {
  tipo: 'aprobada' | 'rechazada' | 'informacion';
  por: string; // correo del administrador
  fecha: string;
  comentario?: string;
};

export type Cuenta = {
  id: string;
  nombre: string;
  correo: string; // siempre en minúsculas
  institucionId: string;
  rolSolicitado: UserRole;
  rol: UserRole | null; // asignado por un administrador
  estado: EstadoCuenta;
  correoVerificado: boolean;
  aprobada: boolean;
  passwordHash: string | null;
  motivoSolicitud?: string;
  decisiones: Decision[];
  creada: string;
  actualizada: string;
  ultimoIngreso?: string;
  /** Última versión aceptada de cada documento legal (la prueba completa está en consentimientos.jsonl). */
  aceptaciones?: Partial<Record<'terminos' | 'privacidad', { version: string; fecha: string }>>;
  /** Declaró tener 18 años o más. */
  mayorDeEdad?: boolean;
};

export type TipoToken = 'verificacion' | 'contrasena' | 'recuperacion' | 'codigo_admin';

export type Token = {
  hash: string; // SHA-256 del valor; el valor nunca se guarda
  tipo: TipoToken;
  cuentaId: string;
  vence: number;
  usado: boolean;
  intentos: number;
};

export type Sesion = {
  hash: string;
  cuentaId: string | null; // null en sesiones de demostración
  demoRol?: UserRole;
  creada: number;
  ultimaActividad: number;
  vence: number;
  /** Sesión a medio camino: falta el código adicional de administrador. */
  pendienteCodigo?: boolean;
};

export type EventoAuditoria = {
  id: string;
  fecha: string;
  actor: string; // correo, "sistema" o id de servicio
  accion: string;
  objetivo?: string; // correo o id afectado
  institucionId?: string;
  detalle?: string;
  ip?: string;
};

type Datos = { cuentas: Cuenta[]; tokens: Token[]; sesiones: Sesion[] };

const DIR = path.resolve(process.env.DATOS_DIR || path.join(process.cwd(), 'datos'));
const ARCHIVO = path.join(DIR, 'cuentas.json');
const AUDITORIA = path.join(DIR, 'auditoria.jsonl');

let datos: Datos | null = null;

function cargar(): Datos {
  if (datos) return datos;
  fs.mkdirSync(DIR, { recursive: true });
  if (fs.existsSync(ARCHIVO)) {
    datos = JSON.parse(fs.readFileSync(ARCHIVO, 'utf8')) as Datos;
    datos.cuentas ??= [];
    datos.tokens ??= [];
    datos.sesiones ??= [];
  } else {
    datos = { cuentas: [], tokens: [], sesiones: [] };
  }
  return datos;
}

function guardar() {
  const d = cargar();
  const ahora = Date.now();
  d.tokens = d.tokens.filter((t) => t.vence > ahora && !t.usado);
  d.sesiones = d.sesiones.filter((s) => s.vence > ahora);
  const tmp = `${ARCHIVO}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(d, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, ARCHIVO);
}

export const carpetaDatos = () => DIR;

// ---------- Cuentas ----------

export const normalizarCorreo = (c: string) => String(c || '').trim().toLowerCase();

export function cuentas(): Cuenta[] {
  return cargar().cuentas;
}

export function cuentaPorCorreo(correo: string): Cuenta | undefined {
  const c = normalizarCorreo(correo);
  return cargar().cuentas.find((x) => x.correo === c);
}

export function cuentaPorId(id: string): Cuenta | undefined {
  return cargar().cuentas.find((x) => x.id === id);
}

export function crearCuenta(c: Omit<Cuenta, 'id' | 'creada' | 'actualizada' | 'decisiones'>): Cuenta {
  const ahora = new Date().toISOString();
  const nueva: Cuenta = { ...c, id: `usr_${crypto.randomUUID()}`, creada: ahora, actualizada: ahora, decisiones: [] };
  cargar().cuentas.push(nueva);
  guardar();
  return nueva;
}

export function actualizarCuenta(id: string, cambios: Partial<Cuenta>): Cuenta {
  const c = cuentaPorId(id);
  if (!c) throw new Error('Cuenta no encontrada');
  Object.assign(c, cambios, { actualizada: new Date().toISOString() });
  guardar();
  return c;
}

// ---------- Tokens (enlaces y códigos de un solo uso) ----------

export const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');

/** Crea un token y devuelve su valor en claro (solo para el enlace o el correo). */
export function crearToken(tipo: TipoToken, cuentaId: string, minutos: number, valor?: string): string {
  const d = cargar();
  // Un enlace nuevo invalida los anteriores del mismo tipo.
  d.tokens.forEach((t) => {
    if (t.cuentaId === cuentaId && t.tipo === tipo) t.usado = true;
  });
  const claro = valor ?? crypto.randomBytes(32).toString('base64url');
  d.tokens.push({ hash: sha256(claro), tipo, cuentaId, vence: Date.now() + minutos * 60_000, usado: false, intentos: 0 });
  guardar();
  return claro;
}

/** Valida un token; si `consumir`, lo marca como usado. */
export function usarToken(tipo: TipoToken, claro: string, consumir = true): Token | null {
  const h = sha256(String(claro || ''));
  const t = cargar().tokens.find((x) => x.hash === h && x.tipo === tipo);
  if (!t || t.usado || t.vence < Date.now()) return null;
  if (consumir) {
    t.usado = true;
    guardar();
  }
  return t;
}

/** Comprueba un código corto ligado a una cuenta (máximo 5 intentos). */
export function verificarCodigo(cuentaId: string, codigo: string): 'ok' | 'invalido' | 'agotado' {
  const t = cargar().tokens.find((x) => x.cuentaId === cuentaId && x.tipo === 'codigo_admin' && !x.usado);
  if (!t || t.vence < Date.now()) return 'agotado';
  if (t.intentos >= 5) return 'agotado';
  const ok = crypto.timingSafeEqual(Buffer.from(t.hash), Buffer.from(sha256(String(codigo || '').trim())));
  if (ok) {
    t.usado = true;
  } else {
    t.intentos += 1;
  }
  guardar();
  return ok ? 'ok' : t.intentos >= 5 ? 'agotado' : 'invalido';
}

// ---------- Sesiones ----------

const HORAS_SESION = Number(process.env.SESION_HORAS) || 8;
const MINUTOS_INACTIVIDAD = Number(process.env.SESION_INACTIVIDAD_MIN) || 60;

export function crearSesion(datosSesion: Pick<Sesion, 'cuentaId' | 'demoRol' | 'pendienteCodigo'>): string {
  const claro = crypto.randomBytes(32).toString('base64url');
  const ahora = Date.now();
  cargar().sesiones.push({
    hash: sha256(claro),
    creada: ahora,
    ultimaActividad: ahora,
    vence: ahora + (datosSesion.pendienteCodigo ? 10 * 60_000 : HORAS_SESION * 3_600_000),
    ...datosSesion,
  });
  guardar();
  return claro;
}

export type ResultadoSesion = { sesion: Sesion } | { vencida: true } | null;

export function leerSesion(claro: string | undefined): ResultadoSesion {
  if (!claro) return null;
  const s = cargar().sesiones.find((x) => x.hash === sha256(claro));
  if (!s) return null;
  const ahora = Date.now();
  if (s.vence < ahora || ahora - s.ultimaActividad > MINUTOS_INACTIVIDAD * 60_000) {
    cerrarSesion(claro);
    return { vencida: true };
  }
  // Se actualiza la actividad como máximo una vez por minuto para no escribir en cada petición.
  if (ahora - s.ultimaActividad > 60_000) {
    s.ultimaActividad = ahora;
    guardar();
  }
  return { sesion: s };
}

export function cerrarSesion(claro: string) {
  const d = cargar();
  const h = sha256(claro);
  d.sesiones = d.sesiones.filter((s) => s.hash !== h);
  guardar();
}

export function cerrarSesionesDe(cuentaId: string) {
  const d = cargar();
  d.sesiones = d.sesiones.filter((s) => s.cuentaId !== cuentaId);
  guardar();
}

export function completarCodigo(claro: string) {
  const s = cargar().sesiones.find((x) => x.hash === sha256(claro));
  if (!s) return;
  s.pendienteCodigo = false;
  s.vence = Date.now() + HORAS_SESION * 3_600_000;
  s.ultimaActividad = Date.now();
  guardar();
}

// ---------- Auditoría (solo se agregan registros) ----------

export function auditar(ev: Omit<EventoAuditoria, 'id' | 'fecha'>) {
  fs.mkdirSync(DIR, { recursive: true });
  const linea: EventoAuditoria = { id: crypto.randomUUID(), fecha: new Date().toISOString(), ...ev };
  fs.appendFileSync(AUDITORIA, JSON.stringify(linea) + '\n', { mode: 0o600 });
}

export function leerAuditoria(limite = 300): EventoAuditoria[] {
  if (!fs.existsSync(AUDITORIA)) return [];
  const lineas = fs.readFileSync(AUDITORIA, 'utf8').trim().split('\n').filter(Boolean);
  return lineas
    .slice(-limite)
    .map((l) => JSON.parse(l) as EventoAuditoria)
    .reverse();
}

// ---------- Conservación de datos (Decreto 1377 de 2013, art. 11) ----------

const DIA = 24 * 3_600_000;
export const RETENCION = {
  sinVerificarDias: 7,
  rechazadasDias: 180,
  auditoriaDias: 730,
};

/** Elimina lo que ya cumplió su finalidad. Devuelve cuántos registros se eliminaron. */
export function purgarDatosVencidos(): { cuentas: number; auditoria: number } {
  const d = cargar();
  const ahora = Date.now();
  const eliminar = d.cuentas.filter((c) => {
    if (c.estado === 'pendiente_verificacion') return ahora - Date.parse(c.creada) > RETENCION.sinVerificarDias * DIA;
    const ultima = c.decisiones[c.decisiones.length - 1];
    if (c.estado === 'desactivada' && !c.aprobada && ultima?.tipo === 'rechazada') {
      return ahora - Date.parse(ultima.fecha) > RETENCION.rechazadasDias * DIA;
    }
    return false;
  });
  if (eliminar.length) {
    const ids = new Set(eliminar.map((c) => c.id));
    d.cuentas = d.cuentas.filter((c) => !ids.has(c.id));
    d.tokens = d.tokens.filter((t) => !ids.has(t.cuentaId));
    d.sesiones = d.sesiones.filter((s) => !s.cuentaId || !ids.has(s.cuentaId));
    guardar();
    for (const c of eliminar) {
      auditar({
        actor: 'sistema',
        accion: 'datos_eliminados_por_conservacion',
        objetivo: `${c.correo.slice(0, 2)}***@${c.correo.split('@')[1] ?? ''}`,
        institucionId: c.institucionId,
        detalle: c.estado === 'pendiente_verificacion' ? `Correo no verificado en ${RETENCION.sinVerificarDias} días` : `Solicitud rechazada hace más de ${RETENCION.rechazadasDias} días`,
      });
    }
  }
  // Auditoría: se conservan los últimos RETENCION.auditoriaDias días
  let auditoria = 0;
  if (fs.existsSync(AUDITORIA)) {
    const limite = new Date(ahora - RETENCION.auditoriaDias * DIA).toISOString();
    const lineas = fs.readFileSync(AUDITORIA, 'utf8').split('\n').filter(Boolean);
    const vigentes = lineas.filter((l) => (JSON.parse(l) as EventoAuditoria).fecha >= limite);
    auditoria = lineas.length - vigentes.length;
    if (auditoria) {
      const tmp = `${AUDITORIA}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, vigentes.map((l) => l + '\n').join(''), { mode: 0o600 });
      fs.renameSync(tmp, AUDITORIA);
    }
  }
  return { cuentas: eliminar.length, auditoria };
}
