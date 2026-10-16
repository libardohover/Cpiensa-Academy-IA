/** Plantillas de correo. Ninguna incluye contraseñas ni credenciales. */
import type { Correo } from './correo';

const NARANJA = '#d4631a';
const CARBON = '#373435';

const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function marco(titulo: string, cuerpo: string): string {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f8f7f7;font-family:Arial,Helvetica,sans-serif;color:${CARBON}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e4e1e1;border-radius:12px;overflow:hidden">
<tr><td style="background:${CARBON};padding:18px 24px;border-bottom:4px solid #f38734">
<div style="color:#ffffff;font-size:18px;font-weight:bold">CPIENSA<span style="color:#f38734">+</span> ACADEMY IA</div>
<div style="color:#cfcaca;font-size:11px;letter-spacing:2px;text-transform:uppercase">Corporación Étnica Educativa</div>
</td></tr>
<tr><td style="padding:24px">
<h1 style="font-size:20px;margin:0 0 16px">${esc(titulo)}</h1>
${cuerpo}
</td></tr>
<tr><td style="padding:16px 24px;background:#f8f7f7;font-size:11px;color:#7a7475">
Este es un mensaje automático de CPIENSA+ ACADEMY IA. Nunca te pediremos tu contraseña por correo.
Tratamiento de datos conforme a la Ley 1581 de 2012.
</td></tr>
</table></td></tr></table></body></html>`;
}

const boton = (url: string, texto: string) =>
  `<p style="margin:24px 0"><a href="${esc(url)}" style="background:${NARANJA};color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:8px;display:inline-block">${esc(texto)}</a></p>
<p style="font-size:12px;color:#7a7475">Si el botón no funciona, copia este enlace en tu navegador:<br><span style="word-break:break-all">${esc(url)}</span></p>`;

const tabla = (filas: [string, string][]) =>
  `<table role="presentation" cellpadding="6" style="border-collapse:collapse;font-size:14px;width:100%">${filas
    .map(
      ([k, v]) =>
        `<tr><td style="border-bottom:1px solid #f1efef;color:#7a7475;width:40%">${esc(k)}</td><td style="border-bottom:1px solid #f1efef;font-weight:bold">${esc(v)}</td></tr>`,
    )
    .join('')}</table>`;

const fechaCO = (iso: string) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Bogota' });

export function correoVerificacion(para: string, nombre: string, url: string, horas: number): Correo {
  return {
    para,
    asunto: 'Confirma tu correo para solicitar acceso a CPIENSA+ ACADEMY IA',
    html: marco(
      'Confirma tu correo electrónico',
      `<p>Hola ${esc(nombre)}:</p><p>Recibimos tu solicitud de acceso. Confirma que este correo es tuyo para enviarla a revisión.</p>
${boton(url, 'Confirmar mi correo')}
<p style="font-size:13px">El enlace vence en ${horas} horas. Si no hiciste esta solicitud, ignora este mensaje.</p>`,
    ),
    texto: `Hola ${nombre}: confirma tu correo para enviar tu solicitud a revisión: ${url} (vence en ${horas} horas). Si no hiciste esta solicitud, ignora este mensaje.`,
  };
}

export type DatosSolicitud = {
  nombre: string;
  correo: string;
  institucion: string;
  rol: string;
  fecha: string;
  motivo?: string;
};

export function correoNuevaSolicitud(para: string, s: DatosSolicitud, urlPanel: string): Correo {
  const filas: [string, string][] = [
    ['Nombre', s.nombre],
    ['Correo (verificado)', s.correo],
    ['Institución', s.institucion],
    ['Rol solicitado', s.rol],
    ['Fecha de la solicitud', fechaCO(s.fecha)],
  ];
  if (s.motivo) filas.push(['Motivo', s.motivo]);
  return {
    para,
    asunto: `Nueva solicitud de acceso: ${s.nombre} (${s.rol})`,
    html: marco(
      'Nueva solicitud de acceso',
      `<p>Una persona verificó su correo y solicita ingresar a la plataforma.</p>${tabla(filas)}
${boton(urlPanel, 'Revisar en el panel administrativo')}
<p style="font-size:13px">Para aprobar, rechazar o pedir información debes iniciar sesión con una cuenta administradora autorizada. La cuenta permanece bloqueada hasta tu decisión.</p>`,
    ),
    texto: `Nueva solicitud de acceso\nNombre: ${s.nombre}\nCorreo: ${s.correo}\nInstitución: ${s.institucion}\nRol solicitado: ${s.rol}\nFecha: ${fechaCO(s.fecha)}${s.motivo ? `\nMotivo: ${s.motivo}` : ''}\n\nRevisar (requiere iniciar sesión como administrador): ${urlPanel}`,
  };
}

export function correoAprobada(para: string, nombre: string, institucion: string, rol: string, url: string, horas: number): Correo {
  return {
    para,
    asunto: 'Tu acceso a CPIENSA+ ACADEMY IA fue aprobado',
    html: marco(
      '¡Tu acceso fue aprobado!',
      `<p>Hola ${esc(nombre)}:</p><p>Tu solicitud fue aprobada.</p>${tabla([
        ['Institución', institucion],
        ['Rol asignado', rol],
      ])}
<p>Para ingresar, establece tu contraseña con este enlace personal:</p>${boton(url, 'Establecer mi contraseña')}
<p style="font-size:13px">El enlace es de un solo uso y vence en ${horas} horas. Si vence, usa «¿Olvidaste tu contraseña?» en la pantalla de ingreso.</p>`,
    ),
    texto: `Hola ${nombre}: tu acceso fue aprobado (institución: ${institucion}; rol: ${rol}). Establece tu contraseña aquí: ${url} (un solo uso, vence en ${horas} horas).`,
  };
}

export function correoRechazada(para: string, nombre: string, comentario?: string): Correo {
  return {
    para,
    asunto: 'Respuesta a tu solicitud de acceso a CPIENSA+ ACADEMY IA',
    html: marco(
      'Tu solicitud no fue aprobada',
      `<p>Hola ${esc(nombre)}:</p><p>Revisamos tu solicitud de acceso y en esta ocasión no fue aprobada.</p>
${comentario ? `<p><strong>Observación:</strong> ${esc(comentario)}</p>` : ''}
<p>Si crees que se trata de un error, puedes responder a este correo.</p>`,
    ),
    texto: `Hola ${nombre}: tu solicitud de acceso no fue aprobada.${comentario ? ` Observación: ${comentario}` : ''}`,
  };
}

export function correoInformacion(para: string, nombre: string, mensaje: string, respuestaA: string): Correo {
  return {
    para,
    asunto: 'Necesitamos información adicional para tu solicitud de acceso',
    html: marco(
      'Información adicional requerida',
      `<p>Hola ${esc(nombre)}:</p><p>Para decidir sobre tu solicitud de acceso necesitamos lo siguiente:</p>
<blockquote style="border-left:4px solid #f38734;margin:16px 0;padding:8px 16px;background:#fef6ee">${esc(mensaje)}</blockquote>
<p>Responde a <a href="mailto:${esc(respuestaA)}">${esc(respuestaA)}</a>. Tu solicitud sigue pendiente mientras tanto.</p>`,
    ),
    texto: `Hola ${nombre}: para decidir sobre tu solicitud necesitamos: ${mensaje}. Responde a ${respuestaA}.`,
  };
}

export function correoConfirmacionDecision(
  para: string,
  d: { decision: string; solicitante: string; correo: string; institucion: string; rol?: string; por: string; fecha: string; comentario?: string },
): Correo {
  const filas: [string, string][] = [
    ['Decisión', d.decision],
    ['Solicitante', `${d.solicitante} (${d.correo})`],
    ['Institución', d.institucion],
  ];
  if (d.rol) filas.push(['Rol asignado', d.rol]);
  filas.push(['Decidió', d.por], ['Fecha', fechaCO(d.fecha)]);
  if (d.comentario) filas.push(['Comentario', d.comentario]);
  return {
    para,
    asunto: `Decisión registrada: ${d.decision} — ${d.solicitante}`,
    html: marco('Decisión registrada', `<p>Se registró la siguiente decisión en la auditoría de la plataforma:</p>${tabla(filas)}`),
    texto: filas.map(([k, v]) => `${k}: ${v}`).join('\n'),
  };
}

export function correoRecuperacion(para: string, nombre: string, url: string, minutos: number): Correo {
  return {
    para,
    asunto: 'Restablece tu contraseña de CPIENSA+ ACADEMY IA',
    html: marco(
      'Restablecer contraseña',
      `<p>Hola ${esc(nombre)}:</p><p>Recibimos una solicitud para restablecer tu contraseña.</p>
${boton(url, 'Crear una nueva contraseña')}
<p style="font-size:13px">El enlace es de un solo uso y vence en ${minutos} minutos. Si no lo pediste, ignora este mensaje: tu contraseña actual sigue funcionando.</p>`,
    ),
    texto: `Hola ${nombre}: crea una nueva contraseña aquí: ${url} (vence en ${minutos} minutos). Si no lo pediste, ignora este mensaje.`,
  };
}

export function correoCodigoAdmin(para: string, nombre: string, codigo: string, minutos: number): Correo {
  return {
    para,
    asunto: `Tu código de verificación: ${codigo}`,
    html: marco(
      'Código de verificación',
      `<p>Hola ${esc(nombre)}:</p><p>Para completar el ingreso con tu cuenta administrativa, escribe este código:</p>
<p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:20px 0">${esc(codigo)}</p>
<p style="font-size:13px">Vence en ${minutos} minutos. Si no intentaste ingresar, cambia tu contraseña.</p>`,
    ),
    texto: `Tu código de verificación de CPIENSA+ ACADEMY IA es ${codigo}. Vence en ${minutos} minutos.`,
  };
}

export function correoCambioEstado(para: string, nombre: string, estado: string): Correo {
  return {
    para,
    asunto: `Tu cuenta de CPIENSA+ ACADEMY IA fue ${estado}`,
    html: marco(`Cuenta ${estado}`, `<p>Hola ${esc(nombre)}:</p><p>Un administrador cambió el estado de tu cuenta a <strong>${esc(estado)}</strong>.</p><p>Si tienes preguntas, responde a este correo.</p>`),
    texto: `Hola ${nombre}: tu cuenta fue ${estado}.`,
  };
}

export function correoAdministradorInicial(para: string, nombre: string, url: string, horas: number): Correo {
  return {
    para,
    asunto: 'Configura la cuenta administradora de CPIENSA+ ACADEMY IA',
    html: marco(
      'Configura tu cuenta administradora',
      `<p>Hola ${esc(nombre)}:</p><p>Esta es la cuenta <strong>SuperAdmin</strong> de la plataforma. Desde ella recibirás y gestionarás las solicitudes de ingreso.</p>
<p>Establece tu contraseña con este enlace personal:</p>${boton(url, 'Establecer mi contraseña')}
<p style="font-size:13px">El enlace es de un solo uso y vence en ${horas} horas. Cada ingreso administrativo pedirá además un código enviado a este correo.</p>`,
    ),
    texto: `Hola ${nombre}: establece la contraseña de la cuenta administradora de CPIENSA+ ACADEMY IA aquí: ${url} (un solo uso, vence en ${horas} horas).`,
  };
}
