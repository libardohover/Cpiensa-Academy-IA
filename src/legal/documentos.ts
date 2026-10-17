/**
 * Datos legales de la entidad y versiones vigentes de los documentos.
 * Lo usan el navegador y el servidor.
 *
 * ⚠️ Los campos marcados como PENDIENTE deben completarse con los datos del RUT
 *    y del certificado de existencia y representación legal de la Corporación,
 *    y todos los textos deben ser revisados por un abogado antes de publicarse.
 *
 * Cuando cambie el contenido de un documento, sube su `version` y su `vigencia`:
 * a todas las personas se les pedirá aceptar de nuevo al ingresar.
 */

export const PENDIENTE = (campo: string) => `[PENDIENTE: ${campo}]`;

export const ENTIDAD = {
  nombreComercial: 'Corporación Étnica Educativa CPIENSA+',
  razonSocial: PENDIENTE('razón social completa según el RUT'),
  nit: PENDIENTE('NIT'),
  domicilio: 'Barrancabermeja, Santander, Colombia',
  direccion: PENDIENTE('dirección de notificaciones'),
  telefono: PENDIENTE('teléfono de contacto'),
  correo: 'piensacorporacion@gmail.com',
  /** Área o persona que atiende peticiones, consultas y reclamos de datos personales (Decreto 1377 de 2013, art. 13). */
  responsableDatos: 'Oficial de protección de datos de la Corporación',
  plataforma: 'CPIENSA+ ACADEMY IA',
};

export type IdDocumento = 'terminos' | 'privacidad' | 'cookies' | 'reembolsos';

export type DocumentoLegal = {
  id: IdDocumento;
  titulo: string;
  version: string;
  vigencia: string; // AAAA-MM-DD
  ruta: string;
  /** Si su aceptación es obligatoria para usar la plataforma. */
  requiereAceptacion: boolean;
};

export const DOCUMENTOS: Record<IdDocumento, DocumentoLegal> = {
  terminos: {
    id: 'terminos',
    titulo: 'Términos y condiciones de uso',
    version: '1.0',
    vigencia: '2026-10-17',
    ruta: '/legal/terminos',
    requiereAceptacion: true,
  },
  privacidad: {
    id: 'privacidad',
    titulo: 'Política de tratamiento de datos personales',
    version: '1.0',
    vigencia: '2026-10-17',
    ruta: '/legal/privacidad',
    requiereAceptacion: true,
  },
  cookies: {
    id: 'cookies',
    titulo: 'Política de cookies',
    version: '1.0',
    vigencia: '2026-10-17',
    ruta: '/legal/cookies',
    requiereAceptacion: false,
  },
  reembolsos: {
    id: 'reembolsos',
    titulo: 'Política de retracto, reembolsos y reversión de pagos',
    version: '1.0',
    vigencia: '2026-10-17',
    ruta: '/legal/reembolsos',
    requiereAceptacion: false,
  },
};

export const DOCUMENTOS_OBLIGATORIOS: IdDocumento[] = ['terminos', 'privacidad'];

/** Texto exacto de cada casilla. Se guarda tal cual en el registro de consentimiento. */
export const TEXTO_CASILLA: Record<'terminos' | 'privacidad' | 'edad', string> = {
  terminos: 'Acepto los Términos y condiciones de uso.',
  privacidad:
    'Acepto la Política de tratamiento de datos personales y autorizo de manera previa, expresa e informada el tratamiento de mis datos para las finalidades allí descritas.',
  edad: 'Declaro que tengo 18 años o más.',
};

/** Tipos de solicitud del titular (Ley 1581 de 2012, art. 8). */
export const TIPOS_SOLICITUD_TITULAR = {
  consulta: 'Consultar mis datos',
  prueba: 'Solicitar prueba de mi autorización',
  actualizacion: 'Actualizar mis datos',
  rectificacion: 'Rectificar (corregir) mis datos',
  supresion: 'Suprimir mis datos',
  revocatoria: 'Revocar mi autorización',
} as const;
export type TipoSolicitudTitular = keyof typeof TIPOS_SOLICITUD_TITULAR;

/** Consultas: 10 días hábiles (art. 14). Reclamos: 15 días hábiles (art. 15). */
export const plazoDiasHabiles = (t: TipoSolicitudTitular) => (t === 'consulta' || t === 'prueba' ? 10 : 15);
