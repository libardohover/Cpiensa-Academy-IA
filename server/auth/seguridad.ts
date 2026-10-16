/** Contraseñas, cookies de sesión, límites de intentos y protección de origen. */
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import type express from 'express';

const scrypt = promisify(crypto.scrypt) as (pw: string, salt: Buffer, len: number, opts: crypto.ScryptOptions) => Promise<Buffer>;
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

/** Deriva la contraseña con scrypt y sal aleatoria. Formato: scrypt$N$r$p$sal$hash */
export async function cifrarContrasena(contrasena: string): Promise<string> {
  const sal = crypto.randomBytes(16);
  const hash = await scrypt(contrasena.normalize('NFKC'), sal, 64, PARAMS);
  return ['scrypt', PARAMS.N, PARAMS.r, PARAMS.p, sal.toString('base64'), hash.toString('base64')].join('$');
}

export async function verificarContrasena(contrasena: string, guardado: string | null): Promise<boolean> {
  // Sin hash guardado se hace igual el cálculo para que el tiempo de respuesta no revele si la cuenta existe.
  const partes = (guardado || 'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$').split('$');
  const [, N, r, p, salB64, hashB64] = partes;
  const esperado = Buffer.from(hashB64 || '', 'base64');
  const calculado = await scrypt(String(contrasena || '').normalize('NFKC'), Buffer.from(salB64, 'base64'), 64, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: PARAMS.maxmem,
  });
  return Boolean(guardado) && esperado.length === calculado.length && crypto.timingSafeEqual(esperado, calculado);
}

/** Reglas de contraseña. Devuelve el problema o null si es válida. */
export function problemaContrasena(contrasena: string, correo: string): string | null {
  const c = String(contrasena || '');
  if (c.length < 10) return 'La contraseña debe tener al menos 10 caracteres.';
  if (c.length > 128) return 'La contraseña no puede superar 128 caracteres.';
  if (!/[a-záéíóúñ]/i.test(c) || !/\d/.test(c)) return 'Usa letras y números.';
  const usuario = correo.split('@')[0]?.toLowerCase();
  if (usuario && usuario.length >= 4 && c.toLowerCase().includes(usuario)) return 'La contraseña no debe contener tu correo.';
  if (/^(.)\1+$/.test(c) || /(1234567890|contraseña|password|qwerty)/i.test(c)) return 'Elige una contraseña menos predecible.';
  return null;
}

// ---------- Cookies ----------

export const COOKIE = 'cpiensa_sesion';

export function leerCookie(req: express.Request, nombre = COOKIE): string | undefined {
  const cab = req.headers.cookie;
  if (!cab) return undefined;
  for (const parte of cab.split(';')) {
    const i = parte.indexOf('=');
    if (i > -1 && parte.slice(0, i).trim() === nombre) return decodeURIComponent(parte.slice(i + 1).trim());
  }
  return undefined;
}

const esSeguro = (req: express.Request) =>
  req.secure || req.headers['x-forwarded-proto'] === 'https' || (process.env.APP_URL || '').startsWith('https://');

export function ponerCookie(req: express.Request, res: express.Response, valor: string, segundos: number) {
  const partes = [`${COOKIE}=${encodeURIComponent(valor)}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${segundos}`];
  if (esSeguro(req)) partes.push('Secure');
  res.setHeader('Set-Cookie', partes.join('; '));
}

export function borrarCookie(req: express.Request, res: express.Response) {
  ponerCookie(req, res, '', 0);
}

// ---------- Límite de intentos (en memoria) ----------

type Ventana = { n: number; desde: number; bloqueoHasta?: number };
const contadores = new Map<string, Ventana>();

/**
 * Cuenta un intento para `clave`. Devuelve los segundos de espera si se superó
 * el límite (`max` intentos en `ventanaMin` minutos → bloqueo de `bloqueoMin`).
 */
export function registrarIntento(clave: string, max: number, ventanaMin: number, bloqueoMin: number): number {
  const ahora = Date.now();
  const v = contadores.get(clave) ?? { n: 0, desde: ahora };
  if (v.bloqueoHasta && v.bloqueoHasta > ahora) return Math.ceil((v.bloqueoHasta - ahora) / 1000);
  if (ahora - v.desde > ventanaMin * 60_000) {
    v.n = 0;
    v.desde = ahora;
    v.bloqueoHasta = undefined;
  }
  v.n += 1;
  if (v.n > max) v.bloqueoHasta = ahora + bloqueoMin * 60_000;
  contadores.set(clave, v);
  return v.bloqueoHasta ? Math.ceil((v.bloqueoHasta - ahora) / 1000) : 0;
}

export function esperaPendiente(clave: string): number {
  const v = contadores.get(clave);
  const ahora = Date.now();
  return v?.bloqueoHasta && v.bloqueoHasta > ahora ? Math.ceil((v.bloqueoHasta - ahora) / 1000) : 0;
}

export function limpiarIntentos(clave: string) {
  contadores.delete(clave);
}

export const ipDe = (req: express.Request) => (req.ip || req.socket.remoteAddress || 'desconocida').replace(/^::ffff:/, '');

/**
 * Las peticiones que cambian datos deben venir de la propia plataforma
 * (cabecera Origin o Referer del mismo host). Complementa SameSite=Strict.
 */
export function verificarOrigen(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origen = req.get('origin') || req.get('referer');
  if (!origen) return next(); // herramientas sin navegador (curl, pruebas): no envían cookies de terceros
  try {
    const host = new URL(origen).host;
    const permitidos = new Set([req.get('host')]);
    if (process.env.APP_URL) permitidos.add(new URL(process.env.APP_URL).host);
    if (permitidos.has(host)) return next();
  } catch {
    /* origen inválido */
  }
  res.status(403).json({ error: 'Origen no permitido.', codigo: 'origen' });
}

export const correoValido = (c: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c) && c.length <= 254;
