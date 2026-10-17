/**
 * Textos legales de CPIENSA+ ACADEMY IA.
 *
 * ⚠️ Borradores técnicos preparados con base en la normativa colombiana vigente.
 * Deben ser revisados y aprobados por un abogado de la Corporación antes de su
 * publicación. Los datos marcados [PENDIENTE: …] se completan en src/legal/documentos.ts.
 */
import { DOCUMENTOS, ENTIDAD, type IdDocumento } from '../../src/legal/documentos';

const E = ENTIDAD;
const fecha = (iso: string) =>
  new Date(`${iso}T12:00:00-05:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' });

const identificacion = `
<ul>
  <li><strong>Responsable:</strong> ${E.nombreComercial} — ${E.razonSocial}</li>
  <li><strong>NIT:</strong> ${E.nit}</li>
  <li><strong>Domicilio:</strong> ${E.domicilio}. <strong>Dirección:</strong> ${E.direccion}</li>
  <li><strong>Correo:</strong> <a href="mailto:${E.correo}">${E.correo}</a> · <strong>Teléfono:</strong> ${E.telefono}</li>
</ul>`;

const terminos = () => `
<p>Estos términos regulan el uso de <strong>${E.plataforma}</strong> (la «Plataforma»), ofrecida por ${E.nombreComercial} (la «Corporación»). Al marcar la casilla «Acepto los Términos y condiciones de uso» declaras que los leíste y los aceptas. Si no estás de acuerdo, no uses la Plataforma.</p>

<h2>1. Identificación del prestador</h2>
${identificacion}

<h2>2. Quién puede usar la Plataforma</h2>
<ul>
  <li>Personas de <strong>18 años o más</strong>. La Plataforma no está dirigida a menores de edad, porque integra servicios de inteligencia artificial de terceros cuyas condiciones exigen usuarios adultos y porque el tratamiento de datos de niños, niñas y adolescentes tiene restricciones especiales (Ley 1581 de 2012, art. 7; Decreto 1377 de 2013, art. 12).</li>
  <li>Solo con una <strong>cuenta aprobada</strong>: la solicitud se verifica por correo y la revisa un administrador autorizado, quien asigna la institución y el rol. Solicitar acceso no garantiza la aprobación.</li>
</ul>

<h2>3. Cuenta y credenciales</h2>
<ul>
  <li>La cuenta es personal e intransferible. Eres responsable de mantener tu contraseña en secreto.</li>
  <li>La Corporación nunca te pedirá tu contraseña por correo, mensaje o teléfono. Los enlaces para crearla o restablecerla son personales, de un solo uso y vencen.</li>
  <li>Si sospechas un uso indebido, cambia tu contraseña y avisa a <a href="mailto:${E.correo}">${E.correo}</a>.</li>
  <li>La Corporación puede suspender o desactivar cuentas por uso indebido, por solicitud de la institución o por razones de seguridad. Las decisiones quedan registradas.</li>
</ul>

<h2>4. Naturaleza del programa</h2>
<p>Los programas de la Plataforma, incluido el Diplomado de 120 horas, son <strong>educación informal</strong> en los términos del Decreto 1075 de 2015 (art. 2.6.6.8): tienen una duración inferior a 160 horas, <strong>no conducen a título</strong> y solo dan lugar a una <strong>constancia de asistencia</strong>. Las constancias pueden verificarse públicamente con su código.</p>

<h2>5. Uso responsable de la inteligencia artificial</h2>
<ul>
  <li>Las respuestas de la IA pueden contener errores. Verifica la información antes de usarla y declara cuándo usaste IA en tus trabajos.</li>
  <li><strong>No ingreses datos personales</strong> tuyos ni de terceros, ni datos sensibles, en el Tutor, el AI Hub u otras herramientas de IA.</li>
  <li>Respeta la dignidad de las personas y la propiedad colectiva de los saberes de los pueblos y comunidades étnicas: no los ingreses ni los publiques sin el consentimiento de sus autoridades propias.</li>
  <li>Está prohibido usar la Plataforma para actividades ilícitas, para suplantar a otras personas, para generar contenido que vulnere derechos de terceros o para intentar acceder sin autorización a cuentas o sistemas.</li>
</ul>

<h2>6. Ejes transversales</h2>
<p>La formación incorpora valores y principios cristianos y un enfoque etnoeducativo. Se proponen con respeto a la libertad de conciencia y de cultos (Constitución Política, arts. 18 y 19) y a la diversidad étnica y cultural (arts. 7 y 70); su adhesión personal no es condición para usar la Plataforma ni para obtener la constancia.</p>

<h2>7. Propiedad intelectual</h2>
<ul>
  <li>Los contenidos, la marca y el logotipo de la Corporación están protegidos (Ley 23 de 1982, Decisión Andina 351 de 1993). Puedes usarlos solo para tu formación personal.</li>
  <li>Conservas los derechos sobre lo que produces. Concedes a la Corporación una licencia limitada para almacenarlo y mostrarlo dentro de la Plataforma con fines académicos.</li>
  <li>Algunas imágenes ilustrativas fueron generadas con inteligencia artificial y se identifican como tales.</li>
</ul>

<h2>8. Precios, pagos y reembolsos</h2>
<p>Cuando un programa tenga costo, el precio total con impuestos se informará antes del pago. El retracto, los reembolsos y la reversión de pagos se rigen por la <a href="/legal/reembolsos">Política de retracto, reembolsos y reversión de pagos</a>.</p>

<h2>9. Disponibilidad y responsabilidad</h2>
<p>La Corporación procura que la Plataforma esté disponible y segura, pero puede haber interrupciones por mantenimiento o fallas. Nada en estos términos limita los derechos que te reconoce el Estatuto del Consumidor (Ley 1480 de 2011) ni las garantías legales irrenunciables.</p>

<h2>10. Datos personales y cookies</h2>
<p>El tratamiento de tus datos se rige por la <a href="/legal/privacidad">Política de tratamiento de datos personales</a>, que aceptas por separado. El uso de cookies se explica en la <a href="/legal/cookies">Política de cookies</a>.</p>

<h2>11. Peticiones, quejas y reclamos</h2>
<p>Puedes presentarlos a <a href="mailto:${E.correo}">${E.correo}</a> o desde «Mis datos y autorizaciones» en la Plataforma. Como consumidor, también puedes acudir a la <a href="https://www.sic.gov.co" target="_blank" rel="noopener">Superintendencia de Industria y Comercio</a>.</p>

<h2>12. Cambios</h2>
<p>Si estos términos cambian, se publicará una nueva versión con su fecha de vigencia y se te pedirá aceptarla de nuevo antes de seguir usando la Plataforma.</p>

<h2>13. Ley aplicable</h2>
<p>Estos términos se rigen por las leyes de la República de Colombia. La aceptación por medios electrónicos tiene plena validez (Ley 527 de 1999).</p>
`;

const privacidad = () => `
<p>Esta política explica cómo ${E.nombreComercial} trata los datos personales en ${E.plataforma}, en cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y la Circular Externa 002 de 2024 de la Superintendencia de Industria y Comercio sobre datos personales en sistemas de inteligencia artificial.</p>

<h2>1. Responsable del tratamiento</h2>
${identificacion}
<p><strong>Área que atiende consultas y reclamos:</strong> ${E.responsableDatos} — <a href="mailto:${E.correo}">${E.correo}</a>.</p>

<h2>2. Datos que tratamos</h2>
<p>Pedimos solo los datos necesarios:</p>
<table>
  <tr><th>Momento</th><th>Datos</th><th>Por qué</th></tr>
  <tr><td>Solicitud de acceso</td><td>Nombre completo, correo electrónico, institución, rol solicitado, motivo (opcional) y declaración de mayoría de edad</td><td>Identificarte, verificar tu correo y decidir sobre tu acceso</td></tr>
  <tr><td>Cuenta</td><td>Rol e institución asignados, estado de la cuenta, contraseña cifrada de forma irreversible, fecha del último ingreso</td><td>Darte acceso solo a lo que corresponde a tu rol</td></tr>
  <tr><td>Seguridad y prueba</td><td>Dirección IP, tipo de navegador, fecha y hora de ingresos, intentos fallidos y de cada aceptación de documentos</td><td>Proteger las cuentas y conservar la prueba de tu autorización (Decreto 1377 de 2013, art. 8)</td></tr>
  <tr><td>Uso académico</td><td>Progreso en las lecciones (guardado en tu navegador) y los textos que escribas en ejercicios y herramientas de IA</td><td>Prestar el servicio educativo</td></tr>
  <tr><td>Constancias</td><td>Nombre, programa, fecha, intensidad horaria y código</td><td>Emitir la constancia y permitir que terceros la verifiquen con el código</td></tr>
</table>
<p><strong>No pedimos datos sensibles</strong> (por ejemplo, origen étnico, creencias religiosas, salud o datos biométricos). El enfoque etnoeducativo y los ejes transversales del programa no requieren que reveles tu pertenencia étnica ni tu religión. Si alguna vez se pidiera un dato sensible, responder será <strong>facultativo</strong> (Ley 1581 de 2012, art. 6; Decreto 1377 de 2013, art. 6).</p>
<p><strong>Menores de edad:</strong> la Plataforma es solo para personas de 18 años o más; no recolectamos de forma intencional datos de niños, niñas y adolescentes.</p>

<h2>3. Finalidades</h2>
<ol>
  <li>Recibir, verificar y decidir tu solicitud de acceso.</li>
  <li>Crear y administrar tu cuenta, rol e institución.</li>
  <li>Prestar el servicio educativo, incluidas las herramientas de inteligencia artificial.</li>
  <li>Enviarte comunicaciones del servicio (verificaciones, decisiones, códigos de seguridad, restablecimiento de contraseña).</li>
  <li>Proteger la Plataforma, prevenir el fraude y llevar el registro de auditoría.</li>
  <li>Emitir y permitir la verificación de constancias.</li>
  <li>Atender tus derechos y cumplir obligaciones legales.</li>
</ol>
<p>No vendemos tus datos ni los usamos para publicidad de terceros.</p>

<h2>4. Inteligencia artificial</h2>
<ul>
  <li>El Tutor IA y el AI Hub envían el texto que escribes a <strong>Google LLC</strong> (servicio Gemini API), con servidores en Estados Unidos, para generar la respuesta. Esto constituye una transmisión internacional a un encargado del tratamiento.</li>
  <li>Según las condiciones de Google, en los servicios sin costo el contenido puede usarse para mejorar sus productos y ser leído por revisores humanos. Por eso <strong>no debes ingresar datos personales</strong> en estas herramientas.</li>
  <li>La IA <strong>no toma decisiones</strong> sobre tu acceso, tu rol ni tu evaluación final: esas decisiones las toma una persona autorizada.</li>
  <li>Cada consulta al Tutor se registra en la auditoría a nombre de quien la originó.</li>
</ul>

<h2>5. Encargados y transmisiones</h2>
<table>
  <tr><th>Encargado</th><th>Servicio</th><th>País</th></tr>
  <tr><td>Google LLC</td><td>Gemini API (inteligencia artificial)</td><td>Estados Unidos</td></tr>
  <tr><td>Google LLC</td><td>Gmail (envío de correos de la Plataforma)</td><td>Estados Unidos</td></tr>
  <tr><td>${'[PENDIENTE: proveedor de alojamiento del servidor]'}</td><td>Alojamiento</td><td>[PENDIENTE]</td></tr>
</table>
<p>Las transmisiones se hacen conforme a los artículos 24 y 25 del Decreto 1377 de 2013. [PENDIENTE: suscribir o aceptar los acuerdos de tratamiento de datos de cada encargado.]</p>

<h2>6. Tus derechos</h2>
<p>Como titular puedes (Ley 1581 de 2012, art. 8):</p>
<ul>
  <li>Conocer, actualizar y rectificar tus datos.</li>
  <li>Solicitar prueba de la autorización que otorgaste.</li>
  <li>Ser informado sobre el uso que se ha dado a tus datos.</li>
  <li>Revocar la autorización y pedir la supresión de tus datos cuando no exista un deber legal o contractual de conservarlos.</li>
  <li>Acceder gratuitamente a tus datos.</li>
  <li>Presentar quejas ante la <a href="https://www.sic.gov.co" target="_blank" rel="noopener">Superintendencia de Industria y Comercio</a>, después de haber agotado el trámite de consulta o reclamo ante la Corporación (art. 16).</li>
</ul>

<h2>7. Cómo ejercer tus derechos</h2>
<ul>
  <li><strong>Canales:</strong> «Mis datos y autorizaciones», en el menú de usuario de la Plataforma, o un correo a <a href="mailto:${E.correo}">${E.correo}</a> indicando tu nombre, correo registrado y lo que solicitas.</li>
  <li><strong>Consultas:</strong> se responden en máximo <strong>10 días hábiles</strong>, prorrogables por 5 días hábiles más, con aviso de los motivos (art. 14).</li>
  <li><strong>Reclamos</strong> (actualización, rectificación, supresión, revocatoria): se responden en máximo <strong>15 días hábiles</strong>, prorrogables por 8 días hábiles más (art. 15). Si el reclamo está incompleto, te pediremos completarlo dentro de los 5 días siguientes; si pasan 2 meses sin respuesta, se entenderá desistido.</li>
  <li>Cada solicitud recibe un número de radicado y queda registrada.</li>
</ul>

<h2>8. Seguridad</h2>
<p>Contraseñas cifradas de forma irreversible; sesiones protegidas que vencen; códigos adicionales para cuentas administrativas; enlaces de un solo uso con vencimiento; límites de intentos; control de acceso por rol e institución; y registro de auditoría.</p>

<h2>9. Conservación</h2>
<ul>
  <li>Solicitudes cuyo correo no se verifica: se eliminan a los <strong>7 días</strong>.</li>
  <li>Solicitudes rechazadas: se eliminan a los <strong>180 días</strong> de la decisión.</li>
  <li>Cuentas activas: mientras exista la relación con la Corporación.</li>
  <li>Registros de autorización y de auditoría: mientras exista la relación y hasta <strong>2 años</strong> después, para atender reclamaciones y requerimientos de autoridad, salvo que una norma exija un plazo mayor. [PENDIENTE: confirmar plazos con el abogado.]</li>
</ul>

<h2>10. Autorización</h2>
<p>Al marcar la casilla «Acepto la Política de tratamiento de datos personales…» otorgas una autorización previa, expresa e informada. La Corporación conserva la prueba de cuándo y cómo la otorgaste (fecha, hora, versión del documento, texto de la casilla, dirección IP y navegador). El silencio nunca se entiende como autorización (Decreto 1377 de 2013, art. 7).</p>

<h2>11. Vigencia y cambios</h2>
<p>Esta política rige desde el ${fecha(DOCUMENTOS.privacidad.vigencia)}. Las bases de datos estarán vigentes mientras la Corporación preste el servicio. Los cambios sustanciales se publicarán con una nueva versión y se te pedirá aceptarlos antes de seguir usando la Plataforma.</p>
`;

const cookies = () => `
<p>Esta política explica qué cookies y tecnologías similares usa ${E.plataforma}.</p>

<h2>1. Qué cookies usamos</h2>
<table>
  <tr><th>Nombre</th><th>Tipo</th><th>Para qué</th><th>Duración</th></tr>
  <tr><td><code>cpiensa_sesion</code></td><td>Cookie técnica, <strong>estrictamente necesaria</strong>, propia</td><td>Mantener tu sesión iniciada de forma segura. Es <em>HttpOnly</em> (no es accesible para otros programas de la página) y solo se envía a esta Plataforma.</td><td>Hasta 8 horas, o 60 minutos sin actividad, o hasta que cierres sesión</td></tr>
  <tr><td><code>cpiensa_progreso_*</code></td><td>Almacenamiento local del navegador, funcional</td><td>Recordar las lecciones que marcaste como completadas</td><td>Hasta que borres los datos del navegador</td></tr>
  <tr><td><code>cpiensa_aviso_cookies</code></td><td>Almacenamiento local del navegador, funcional</td><td>Recordar que ya viste este aviso</td><td>Hasta que borres los datos del navegador</td></tr>
</table>

<h2>2. Qué no usamos</h2>
<ul>
  <li>No usamos cookies de analítica, publicidad ni redes sociales.</li>
  <li>No hay cookies de terceros: las fuentes tipográficas se sirven desde nuestro propio servidor.</li>
  <li>Estas cookies no se usan para elaborar perfiles ni seguirte en otros sitios.</li>
</ul>

<h2>3. Tu elección</h2>
<p>Como solo usamos tecnologías necesarias o funcionales para prestar el servicio que solicitas, te informamos de ellas con un aviso al entrar. Puedes borrarlas o bloquearlas desde la configuración de tu navegador; si bloqueas la cookie de sesión, no podrás iniciar sesión.</p>
<p>Si en el futuro se incorporan cookies de analítica o publicidad, se activarán solo con tu autorización previa y expresa, conforme a la Ley 1581 de 2012.</p>

<h2>4. Más información</h2>
<p>El tratamiento de los datos asociados se rige por la <a href="/legal/privacidad">Política de tratamiento de datos personales</a>. Contacto: <a href="mailto:${E.correo}">${E.correo}</a>.</p>
`;

const reembolsos = () => `
<p>Esta política aplica cuando ${E.nombreComercial} cobre por sus programas a través de ${E.plataforma} o por otros medios a distancia, conforme al Estatuto del Consumidor (Ley 1480 de 2011) y al Decreto 1074 de 2015.</p>
<p class="nota">Actualmente la Plataforma no procesa pagos en línea. [PENDIENTE: confirmar los medios de pago y la política comercial de la Corporación.]</p>

<h2>1. Información antes del pago</h2>
<p>Antes de pagar se informará el precio total con impuestos, lo que incluye el programa, su duración, fechas, el medio para acceder y esta política.</p>

<h2>2. Derecho de retracto</h2>
<ul>
  <li>Si contrataste por un medio a distancia (internet, teléfono), puedes retractarte dentro de los <strong>5 días hábiles</strong> siguientes a la celebración del contrato (Ley 1480 de 2011, art. 47).</li>
  <li>La Corporación te devolverá <strong>todas las sumas pagadas, sin descuentos ni retenciones</strong>, en un plazo máximo de <strong>30 días calendario</strong> desde que ejerzas el derecho.</li>
  <li><strong>Excepción:</strong> el retracto no procede cuando la prestación del servicio ya comenzó con tu acuerdo; por ejemplo, si ya ingresaste a las lecciones del programa. Antes de habilitarte el acceso te lo informaremos.</li>
</ul>

<h2>3. Reversión del pago</h2>
<p>Si pagaste con tarjeta de crédito, débito u otro instrumento electrónico, puedes solicitar la reversión cuando (Ley 1480 de 2011, art. 51; Decreto 587 de 2016):</p>
<ul>
  <li>fuiste objeto de fraude;</li>
  <li>la operación no fue solicitada;</li>
  <li>el servicio no se prestó;</li>
  <li>el servicio no corresponde a lo solicitado o a lo informado; o</li>
  <li>el servicio presenta defectos.</li>
</ul>
<p>Debes presentar la queja ante la Corporación dentro de los <strong>5 días hábiles</strong> siguientes a la fecha en que tuviste conocimiento del hecho, y notificar en el mismo plazo al emisor de tu instrumento de pago. La Corporación te entregará constancia de la queja con su fecha y causal. Los participantes del proceso de pago tienen <strong>15 días hábiles</strong> para hacer efectiva la reversión.</p>

<h2>4. Cancelación por parte de la Corporación</h2>
<p>Si la Corporación cancela un programa antes de iniciarlo, te devolverá el 100 % de lo pagado o, si lo prefieres, te trasladará a otra cohorte.</p>

<h2>5. Garantía del servicio</h2>
<p>Si el servicio no se presta en las condiciones de calidad e idoneidad ofrecidas, puedes pedir que se preste de nuevo o la devolución de lo pagado (Ley 1480 de 2011, arts. 7 y 11).</p>

<h2>6. Retiro después de iniciado el programa</h2>
<p>[PENDIENTE: política comercial de la Corporación para retiros voluntarios después de iniciado el programa (por ejemplo, devolución proporcional o crédito para otra cohorte).]</p>

<h2>7. Cómo solicitarlo</h2>
<p>Escribe a <a href="mailto:${E.correo}">${E.correo}</a> con tu nombre, documento, fecha y medio de pago, valor, y el motivo. Recibirás constancia de radicación. Si no obtienes respuesta satisfactoria, puedes acudir a la <a href="https://www.sic.gov.co" target="_blank" rel="noopener">Superintendencia de Industria y Comercio</a>.</p>
`;

const CUERPOS: Record<IdDocumento, () => string> = { terminos, privacidad, cookies, reembolsos };

/** Contenido del documento (lo que se identifica con la huella SHA-256). */
export function cuerpoDocumento(id: IdDocumento): string {
  // Los campos pendientes se resaltan para que no pasen desapercibidos.
  return CUERPOS[id]().replace(/\[PENDIENTE: ([^\]]+)\]/g, '<mark>[PENDIENTE: $1]</mark>');
}

export function paginaDocumento(id: IdDocumento, huella: string): string {
  const d = DOCUMENTOS[id];
  const otros = (Object.keys(DOCUMENTOS) as IdDocumento[])
    .filter((k) => k !== id)
    .map((k) => `<a href="${DOCUMENTOS[k].ruta}">${DOCUMENTOS[k].titulo}</a>`)
    .join(' · ');
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${d.titulo} · ${E.plataforma}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#373435;background:#f8f7f7;margin:0;line-height:1.6}
main{max-width:820px;margin:0 auto;padding:28px 20px 48px;background:#fff;min-height:100vh}
header{border-bottom:4px solid #f38734;padding-bottom:12px;margin-bottom:20px}
.marca{color:#b04f17;font-weight:bold;letter-spacing:2px;font-size:12px;text-transform:uppercase;margin:0}
h1{font-size:26px;margin:6px 0}h2{font-size:18px;margin-top:28px}
.meta{font-size:13px;color:#5f5a5b}
.borrador{background:#fef6ee;border-left:4px solid #f38734;padding:10px 14px;font-size:14px;margin:16px 0}
mark{background:#fde9d6;color:#8c3f17;padding:0 3px;border-radius:3px}
table{border-collapse:collapse;width:100%;font-size:14px;margin:12px 0}th,td{border:1px solid #e4e1e1;padding:8px;text-align:left;vertical-align:top}th{background:#f1efef}
a{color:#b04f17}.nota{font-size:14px;color:#5f5a5b}
footer{margin-top:40px;border-top:1px solid #e4e1e1;padding-top:12px;font-size:12px;color:#7a7475}
@media print{.borrador{display:none}main{max-width:none}}
</style></head>
<body><main>
<header>
<p class="marca">${E.nombreComercial}</p>
<h1>${d.titulo}</h1>
<p class="meta">Versión ${d.version} · vigente desde el ${fecha(d.vigencia)}</p>
</header>
<p class="borrador">Borrador para revisión jurídica. Los datos resaltados deben completarse antes de publicar la plataforma.</p>
${cuerpoDocumento(id)}
<footer>
<p>${otros}</p>
<p>Huella del documento (SHA-256): <code>${huella}</code></p>
<p><a href="/">Volver a ${E.plataforma}</a></p>
</footer>
</main></body></html>`;
}
