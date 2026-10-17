/**
 * Registro de autorizaciones (prueba del consentimiento, Decreto 1377 de 2013, art. 8)
 * y solicitudes de titulares (Ley 1581 de 2012, arts. 8, 14 y 15).
 *
 * - datos/consentimientos.jsonl : solo se agregan registros; nunca se modifican.
 * - datos/solicitudes_titulares.json
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { carpetaDatos } from '../auth/almacen';
import { DOCUMENTOS, type IdDocumento, type TipoSolicitudTitular, plazoDiasHabiles } from '../../src/legal/documentos';
import { cuerpoDocumento } from './textos';

export type RegistroConsentimiento = {
  id: string;
  fecha: string; // ISO 8601 (UTC)
  correo: string;
  cuentaId: string | null;
  institucionId?: string;
  /** terminos | privacidad | declaracion_edad */
  documento: IdDocumento | 'declaracion_edad';
  version: string;
  /** SHA-256 del texto exacto del documento aceptado. */
  huella: string;
  accion: 'aceptar' | 'revocar';
  /** Dónde se otorgó: formulario de solicitud, establecer contraseña, nueva versión… */
  medio: string;
  /** Texto literal de la casilla que marcó la persona. */
  casilla: string;
  ip: string;
  navegador: string;
};

const archivoConsentimientos = () => path.join(carpetaDatos(), 'consentimientos.jsonl');
const archivoSolicitudes = () => path.join(carpetaDatos(), 'solicitudes_titulares.json');

// ---------- Huellas de los documentos ----------

const huellas = new Map<IdDocumento, string>();
export function huellaDocumento(id: IdDocumento): string {
  if (!huellas.has(id)) {
    huellas.set(id, crypto.createHash('sha256').update(`${DOCUMENTOS[id].version}\n${cuerpoDocumento(id)}`).digest('hex'));
  }
  return huellas.get(id)!;
}
export const HUELLA_EDAD = crypto.createHash('sha256').update('declaracion_edad:v1').digest('hex');

// ---------- Consentimientos ----------

export function registrarConsentimiento(r: Omit<RegistroConsentimiento, 'id' | 'fecha'>): RegistroConsentimiento {
  fs.mkdirSync(carpetaDatos(), { recursive: true });
  const reg: RegistroConsentimiento = { id: `cons_${crypto.randomUUID()}`, fecha: new Date().toISOString(), ...r };
  fs.appendFileSync(archivoConsentimientos(), JSON.stringify(reg) + '\n', { mode: 0o600 });
  return reg;
}

export function leerConsentimientos(filtro?: (r: RegistroConsentimiento) => boolean): RegistroConsentimiento[] {
  const f = archivoConsentimientos();
  if (!fs.existsSync(f)) return [];
  const todos = fs
    .readFileSync(f, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l) as RegistroConsentimiento);
  return (filtro ? todos.filter(filtro) : todos).reverse();
}

export function aCsv(registros: RegistroConsentimiento[]): string {
  const cols: (keyof RegistroConsentimiento)[] = ['fecha', 'correo', 'cuentaId', 'institucionId', 'documento', 'version', 'accion', 'medio', 'casilla', 'huella', 'ip', 'navegador', 'id'];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  // BOM para que Excel abra bien las tildes
  return '﻿' + [cols.join(';'), ...registros.map((r) => cols.map((c) => esc(r[c])).join(';'))].join('\r\n');
}

// ---------- Solicitudes de titulares ----------

export type SolicitudTitular = {
  id: string;
  radicado: string;
  fecha: string;
  correo: string;
  nombre: string;
  cuentaId: string | null;
  institucionId?: string;
  tipo: TipoSolicitudTitular;
  mensaje: string;
  estado: 'recibida' | 'atendida';
  fechaLimite: string; // AAAA-MM-DD
  respuesta?: { por: string; fecha: string; texto: string };
};

function leerSolicitudes(): SolicitudTitular[] {
  const f = archivoSolicitudes();
  return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, 'utf8')) as SolicitudTitular[]) : [];
}
function guardarSolicitudes(l: SolicitudTitular[]) {
  fs.mkdirSync(carpetaDatos(), { recursive: true });
  const tmp = `${archivoSolicitudes()}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(l, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, archivoSolicitudes());
}

/**
 * Suma días hábiles (lunes a viernes). No descuenta festivos: la fecha es
 * orientativa y el área responsable debe ajustarla al calendario oficial.
 */
export function sumarDiasHabiles(desde: Date, dias: number): string {
  const d = new Date(desde);
  let n = 0;
  while (n < dias) {
    d.setDate(d.getDate() + 1);
    const dia = d.getDay();
    if (dia !== 0 && dia !== 6) n++;
  }
  return d.toISOString().slice(0, 10);
}

export function crearSolicitudTitular(s: Pick<SolicitudTitular, 'correo' | 'nombre' | 'cuentaId' | 'institucionId' | 'tipo' | 'mensaje'>): SolicitudTitular {
  const lista = leerSolicitudes();
  const ahora = new Date();
  const radicado = `HD-${ahora.getFullYear()}-${String(lista.length + 1).padStart(5, '0')}`;
  const nueva: SolicitudTitular = {
    id: `sol_${crypto.randomUUID()}`,
    radicado,
    fecha: ahora.toISOString(),
    estado: 'recibida',
    fechaLimite: sumarDiasHabiles(ahora, plazoDiasHabiles(s.tipo)),
    ...s,
  };
  lista.push(nueva);
  guardarSolicitudes(lista);
  return nueva;
}

export function solicitudesTitulares(): SolicitudTitular[] {
  return leerSolicitudes().sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function atenderSolicitud(id: string, por: string, texto: string): SolicitudTitular | null {
  const lista = leerSolicitudes();
  const s = lista.find((x) => x.id === id);
  if (!s) return null;
  s.estado = 'atendida';
  s.respuesta = { por, fecha: new Date().toISOString(), texto };
  guardarSolicitudes(lista);
  return s;
}
