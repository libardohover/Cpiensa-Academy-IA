/**
 * Envío de correos.
 *
 * Con SMTP configurado (SMTP_HOST, SMTP_USER, SMTP_PASS) los correos se envían
 * de verdad. Sin SMTP, se guardan como archivos .html en `datos/correos/` para
 * poder revisarlos en el equipo (modo de prueba). Nunca se envían contraseñas.
 */
import fs from 'node:fs';
import path from 'node:path';
import nodemailer, { type Transporter } from 'nodemailer';
import { carpetaDatos } from './almacen';

export type Correo = { para: string; asunto: string; html: string; texto: string };

export const CORREO_APROBACIONES = (process.env.APROBACIONES_CORREO || 'piensacorporacion@gmail.com').trim().toLowerCase();

let transporte: Transporter | null | undefined;

export function smtpConfigurado(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function obtenerTransporte(): Transporter | null {
  if (transporte !== undefined) return transporte;
  if (!smtpConfigurado()) return (transporte = null);
  const puerto = Number(process.env.SMTP_PORT) || 465;
  transporte = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: puerto,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : puerto === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporte;
}

const remitente = () => process.env.SMTP_FROM || `CPIENSA+ ACADEMY IA <${process.env.SMTP_USER || CORREO_APROBACIONES}>`;

/** Envía un correo. Si falla, lo deja en la bandeja local y lo informa en consola. */
export async function enviarCorreo(c: Correo): Promise<'enviado' | 'bandeja_local'> {
  const t = obtenerTransporte();
  if (t) {
    try {
      await t.sendMail({ from: remitente(), to: c.para, subject: c.asunto, html: c.html, text: c.texto });
      return 'enviado';
    } catch (err) {
      console.error(`[correo] No se pudo enviar "${c.asunto}" a ${c.para}:`, (err as Error).message);
    }
  }
  guardarEnBandeja(c);
  return 'bandeja_local';
}

function guardarEnBandeja(c: Correo) {
  const dir = path.join(carpetaDatos(), 'correos');
  fs.mkdirSync(dir, { recursive: true });
  const marca = new Date().toISOString().replace(/[:.]/g, '-');
  const seguro = c.para.replace(/[^a-z0-9@._-]/gi, '_');
  const archivo = path.join(dir, `${marca}__${seguro}.html`);
  const encabezado = `<!-- Para: ${c.para}\n     Asunto: ${c.asunto} -->\n`;
  fs.writeFileSync(archivo, encabezado + c.html, { mode: 0o600 });
  console.log(`[correo] SMTP no configurado: "${c.asunto}" para ${c.para} → ${path.relative(process.cwd(), archivo)}`);
}
