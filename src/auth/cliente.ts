/** Cliente de la API de acceso. La sesión viaja en una cookie HttpOnly: el navegador nunca ve el token. */
import type { UserRole } from '../types';

export type UsuarioSesion = {
  id: string;
  nombre: string;
  correo: string;
  rol: UserRole;
  institucionId: string;
  institucionNombre: string;
  esDemo: boolean;
};

export type ConfigAcceso = {
  modoDemo: boolean;
  correoAprobaciones: string;
  correoReal: boolean;
  instituciones: { id: string; nombre: string }[];
  rolesSolicitables: { id: UserRole; nombre: string }[];
};

export type ErrorApi = { status: number; error: string; codigo?: string; errores?: Record<string, string> };

export async function api<T>(ruta: string, cuerpo?: unknown, metodo?: string): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`/api${ruta}`, {
      method: metodo ?? (cuerpo === undefined ? 'GET' : 'POST'),
      credentials: 'same-origin',
      headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw { status: 0, error: 'No hay conexión con el servidor. Revisa tu conexión e inténtalo de nuevo.', codigo: 'red' } as ErrorApi;
  }
  let datos: any = null;
  try {
    datos = await r.json();
  } catch {
    /* respuesta sin cuerpo JSON */
  }
  if (!r.ok) {
    throw {
      status: r.status,
      error: datos?.error || (r.status >= 500 ? 'Ocurrió un error temporal. Inténtalo de nuevo en unos minutos.' : 'No se pudo completar la operación.'),
      codigo: datos?.codigo,
      errores: datos?.errores,
    } as ErrorApi;
  }
  return datos as T;
}

export const esErrorApi = (e: unknown): e is ErrorApi => typeof e === 'object' && e !== null && 'error' in e;

export const acceso = {
  config: () => api<ConfigAcceso>('/auth/config'),
  sesion: () => api<{ usuario: UsuarioSesion }>('/auth/sesion'),
  ingresar: (correo: string, contrasena: string) =>
    api<{ usuario?: UsuarioSesion; requiereCodigo?: boolean; mensaje?: string }>('/auth/ingresar', { correo, contrasena }),
  codigo: (codigo: string) => api<{ usuario: UsuarioSesion }>('/auth/codigo', { codigo }),
  salir: () => api<{ ok: true }>('/auth/salir', {}),
  solicitar: (d: { nombre: string; correo: string; institucionId: string; rol: string; motivo: string; aceptaDatos: boolean }) =>
    api<{ mensaje: string }>('/auth/solicitudes', d),
  verificar: (token: string) => api<{ mensaje: string }>('/auth/verificar', { token }),
  recuperar: (correo: string) => api<{ mensaje: string }>('/auth/recuperar', { correo }),
  enlace: (tipo: 'contrasena' | 'recuperar', token: string) => api<{ correo: string; nombre: string }>('/auth/enlace', { tipo, token }),
  contrasena: (tipo: 'contrasena' | 'recuperar', token: string, contrasena: string) =>
    api<{ mensaje: string }>('/auth/contrasena', { tipo, token, contrasena }),
  demo: (rol: UserRole) => api<{ usuario: UsuarioSesion }>('/auth/demo', { rol }),
  demoRol: (rol: UserRole) => api<{ usuario: UsuarioSesion }>('/auth/demo/rol', { rol }),
};

/**
 * Avisa a la aplicación cuando cualquier llamada a la API responde que la sesión
 * venció o la cuenta perdió el acceso, para volver a la pantalla de ingreso.
 */
export function vigilarSesion(alPerderla: (mensaje: string) => void) {
  const original = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const r = await original(...args);
    const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof Request ? args[0].url : String(args[0]);
    if (r.status === 401 && url.includes('/api/') && !url.includes('/api/auth/')) {
      r.clone()
        .json()
        .then((d) => {
          if (['sesion_vencida', 'sin_sesion', 'cuenta_inactiva'].includes(d?.codigo)) alPerderla(d.error || 'Tu sesión terminó.');
        })
        .catch(() => undefined);
    }
    return r;
  };
  return () => {
    window.fetch = original;
  };
}
