/** Documentos legales, aceptación de nuevas versiones, derechos del titular y registros para administración. */
import express from 'express';
import { DOCUMENTOS, ENTIDAD, TIPOS_SOLICITUD_TITULAR, plazoDiasHabiles, type IdDocumento, type TipoSolicitudTitular } from '../../src/legal/documentos';
import { ROLES_GESTORES } from '../../src/auth/permisos';
import { institucionPorId } from '../../src/data/instituciones';
import * as db from '../auth/almacen';
import { exigirSesion, guardarAceptaciones, pendientesLegales, validarCasillas, type ReqConSesion } from '../auth/rutas';
import { CORREO_APROBACIONES, enviarCorreo } from '../auth/correo';
import { ipDe, registrarIntento } from '../auth/seguridad';
import { aCsv, atenderSolicitud, crearSolicitudTitular, huellaDocumento, leerConsentimientos, solicitudesTitulares } from './consentimientos';
import { paginaDocumento } from './textos';

const texto = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function correoSimple(para: string, asunto: string, parrafos: string[]) {
  const html = `<!doctype html><html lang="es"><body style="font-family:Arial,sans-serif;color:#373435;max-width:560px;margin:auto;padding:20px">
<div style="border-bottom:4px solid #f38734;padding-bottom:8px;margin-bottom:16px"><strong>CPIENSA<span style="color:#f38734">+</span> ACADEMY IA</strong> · ${esc(ENTIDAD.nombreComercial)}</div>
${parrafos.map((p) => `<p>${p}</p>`).join('\n')}
<p style="font-size:11px;color:#7a7475">Ley 1581 de 2012. Nunca te pediremos tu contraseña por correo.</p></body></html>`;
  return enviarCorreo({ para, asunto, html, texto: parrafos.join('\n\n').replace(/<[^>]+>/g, '') });
}

/** Páginas públicas de los documentos: /legal/terminos, /legal/privacidad, /legal/cookies, /legal/reembolsos */
export function paginasLegales(): express.Router {
  const r = express.Router();
  r.get('/legal/:doc', (req, res, next) => {
    const id = req.params.doc as IdDocumento;
    if (!DOCUMENTOS[id]) return next();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(paginaDocumento(id, huellaDocumento(id)));
  });
  // Rutas antiguas
  r.get('/privacidad.html', (_req, res) => res.redirect(301, '/legal/privacidad'));
  r.get('/condiciones.html', (_req, res) => res.redirect(301, '/legal/terminos'));
  return r;
}

export function rutasLegales(): express.Router {
  const r = express.Router();

  r.get('/legal/documentos', (_req, res) => {
    res.json({
      entidad: ENTIDAD,
      documentos: Object.values(DOCUMENTOS).map((d) => ({ ...d, huella: huellaDocumento(d.id) })),
    });
  });

  // Aceptar la versión vigente (al ingresar después de un cambio)
  r.post('/legal/aceptar', exigirSesion, (req: ReqConSesion, res) => {
    const c = req.cuenta;
    if (!c) return res.json({ ok: true, pendientesLegales: [] }); // demostración
    const errores = validarCasillas(req.body, !c.mayorDeEdad);
    if (Object.keys(errores).length) return res.status(400).json({ error: 'Marca las casillas para continuar.', codigo: 'validacion', errores });
    guardarAceptaciones(c, 'nueva_version_al_ingresar', req, !c.mayorDeEdad);
    res.json({ ok: true, pendientesLegales: pendientesLegales(db.cuentaPorId(c.id)!) });
  });

  // Mis datos y autorizaciones
  r.get('/legal/mis-datos', exigirSesion, (req: ReqConSesion, res) => {
    const c = req.cuenta;
    if (!c) return res.json({ demo: true });
    res.json({
      cuenta: {
        nombre: c.nombre,
        correo: c.correo,
        institucion: institucionPorId(c.institucionId)?.name ?? c.institucionId,
        rol: c.rol,
        estado: c.estado,
        solicitada: c.creada,
        motivoSolicitud: c.motivoSolicitud ?? null,
        ultimoIngreso: c.ultimoIngreso ?? null,
        mayorDeEdad: Boolean(c.mayorDeEdad),
      },
      autorizaciones: leerConsentimientos((x) => x.cuentaId === c.id).map(({ cuentaId: _c, institucionId: _i, ...resto }) => resto),
      solicitudes: solicitudesTitulares()
        .filter((s) => s.cuentaId === c.id)
        .map(({ cuentaId: _c, institucionId: _i, ...resto }) => resto),
      tipos: TIPOS_SOLICITUD_TITULAR,
    });
  });

  // Radicar una solicitud del titular (consulta, prueba, actualización, rectificación, supresión, revocatoria)
  r.post('/legal/solicitudes-titular', exigirSesion, async (req: ReqConSesion, res) => {
    const c = req.cuenta;
    if (!c) return res.status(403).json({ error: 'Disponible solo con una cuenta real.', codigo: 'solo_cuenta_real' });
    if (registrarIntento(`titular:${c.id}`, 5, 60, 60)) return res.status(429).json({ error: 'Has enviado varias solicitudes. Intenta más tarde.', codigo: 'limite' });
    const tipo = req.body?.tipo as TipoSolicitudTitular;
    const mensaje = texto(req.body?.mensaje, 2000);
    if (!TIPOS_SOLICITUD_TITULAR[tipo]) return res.status(400).json({ error: 'Elige el tipo de solicitud.', codigo: 'validacion', errores: { tipo: 'Elige el tipo de solicitud.' } });
    if (tipo !== 'consulta' && tipo !== 'prueba' && mensaje.length < 5) {
      return res.status(400).json({ error: 'Describe lo que solicitas.', codigo: 'validacion', errores: { mensaje: 'Describe lo que solicitas.' } });
    }
    const s = crearSolicitudTitular({ correo: c.correo, nombre: c.nombre, cuentaId: c.id, institucionId: c.institucionId, tipo, mensaje });
    const plazo = plazoDiasHabiles(tipo);
    await correoSimple(CORREO_APROBACIONES, `Solicitud de titular ${s.radicado}: ${TIPOS_SOLICITUD_TITULAR[tipo]}`, [
      `<strong>Radicado:</strong> ${s.radicado}`,
      `<strong>Titular:</strong> ${esc(c.nombre)} (${esc(c.correo)})`,
      `<strong>Tipo:</strong> ${TIPOS_SOLICITUD_TITULAR[tipo]}`,
      `<strong>Mensaje:</strong> ${esc(mensaje || '—')}`,
      `<strong>Responder a más tardar:</strong> ${s.fechaLimite} (${plazo} días hábiles; verifica festivos).`,
      'Gestiónala en Solicitudes de acceso → Derechos de titulares.',
    ]);
    await correoSimple(c.correo, `Recibimos tu solicitud ${s.radicado}`, [
      `Hola ${esc(c.nombre)}:`,
      `Recibimos tu solicitud «${TIPOS_SOLICITUD_TITULAR[tipo]}» con el radicado <strong>${s.radicado}</strong>.`,
      `Te responderemos en un plazo máximo de ${plazo} días hábiles, conforme a la Ley 1581 de 2012.`,
    ]);
    db.auditar({ actor: c.correo, accion: 'solicitud_titular_radicada', objetivo: s.radicado, institucionId: c.institucionId, detalle: TIPOS_SOLICITUD_TITULAR[tipo], ip: ipDe(req) });
    res.json({ ok: true, radicado: s.radicado, fechaLimite: s.fechaLimite });
  });

  // ---------- Administración ----------

  const alcance = (req: ReqConSesion, institucionId?: string) =>
    req.usuario!.rol === 'SuperAdmin' || (Boolean(institucionId) && req.usuario!.institucionId === institucionId);
  const soloAdmin = (lectura: boolean) => (req: ReqConSesion, res: express.Response, next: express.NextFunction) => {
    const u = req.usuario!;
    if (u.esDemo) return res.status(403).json({ error: 'Requiere una cuenta administradora real.', codigo: 'solo_cuenta_real' });
    const ok = lectura ? [...ROLES_GESTORES, 'Auditor'].includes(u.rol) : ROLES_GESTORES.includes(u.rol);
    if (!ok) return res.status(403).json({ error: 'Se requiere una cuenta administradora autorizada.', codigo: 'sin_permiso' });
    next();
  };

  r.get('/admin/consentimientos', exigirSesion, soloAdmin(true), (req: ReqConSesion, res) => {
    const lista = leerConsentimientos((x) => alcance(req, x.institucionId));
    if (req.query.formato === 'csv') {
      db.auditar({ actor: req.usuario!.correo, accion: 'consentimientos_exportados', institucionId: req.usuario!.institucionId, detalle: `${lista.length} registros`, ip: ipDe(req) });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="consentimientos-${new Date().toISOString().slice(0, 10)}.csv"`);
      return res.send(aCsv(lista));
    }
    res.json({ registros: lista.slice(0, 1000), total: lista.length });
  });

  r.get('/admin/solicitudes-titular', exigirSesion, soloAdmin(true), (req: ReqConSesion, res) => {
    res.json({ solicitudes: solicitudesTitulares().filter((s) => alcance(req, s.institucionId)), tipos: TIPOS_SOLICITUD_TITULAR });
  });

  r.post('/admin/solicitudes-titular/:id/atender', exigirSesion, soloAdmin(false), async (req: ReqConSesion, res) => {
    const respuesta = texto(req.body?.respuesta, 3000);
    if (respuesta.length < 5) return res.status(400).json({ error: 'Escribe la respuesta que recibirá el titular.', codigo: 'validacion' });
    const actual = solicitudesTitulares().find((s) => s.id === req.params.id);
    if (!actual || !alcance(req, actual.institucionId)) return res.status(404).json({ error: 'Solicitud no encontrada.', codigo: 'no_encontrada' });
    const s = atenderSolicitud(actual.id, req.usuario!.correo, respuesta)!;
    await correoSimple(s.correo, `Respuesta a tu solicitud ${s.radicado}`, [
      `Hola ${esc(s.nombre)}:`,
      `Respondemos tu solicitud «${TIPOS_SOLICITUD_TITULAR[s.tipo]}» (radicado ${s.radicado}):`,
      esc(respuesta).replace(/\n/g, '<br>'),
      'Si no estás de acuerdo, puedes acudir a la Superintendencia de Industria y Comercio (www.sic.gov.co).',
    ]);
    db.auditar({ actor: req.usuario!.correo, accion: 'solicitud_titular_atendida', objetivo: s.radicado, institucionId: s.institucionId, detalle: TIPOS_SOLICITUD_TITULAR[s.tipo], ip: ipDe(req) });
    res.json({ ok: true, solicitud: s });
  });

  return r;
}
