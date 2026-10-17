# Cumplimiento legal — CPIENSA+ ACADEMY IA

> Revisión técnica del 17 de octubre de 2026, con base en la normativa colombiana vigente consultada en esa fecha.
> **No es una opinión jurídica.** Debe ser revisada y aprobada por un abogado de la Corporación antes de publicar la plataforma.

Leyenda: ✅ cumplido en el sistema · 🟡 cumplido en el sistema, requiere acción o validación de la Corporación · 🔴 pendiente de la Corporación

## 1. Resumen de lo solicitado

| # | Solicitud | Estado | Dónde |
|---|---|:-:|---|
| 1 | Términos y condiciones | 🟡 | `/legal/terminos` — falta completar datos de la entidad y revisión jurídica |
| 2 | Política de cookies | ✅ | `/legal/cookies` + aviso al entrar |
| 3 | ¿Se necesita consentimiento? | ✅ | Sí, para tratar datos personales (ver §3). Implementado |
| 4 | Dos casillas separadas | ✅ | Solicitud de acceso, creación de contraseña de cuentas sin aceptación y nueva versión de documentos |
| 5 | Registro de cuándo y cómo aceptó | ✅ | `datos/consentimientos.jsonl`; panel «Consentimientos» con exportación CSV; «Mis datos y autorizaciones» |
| 6 | Política de reembolso | 🟡 | `/legal/reembolsos` — falta la política comercial para retiros después de iniciado el programa |
| 7 | Pedir solo los datos necesarios | ✅ | Ver §4 |
| 8 | Derechos sobre las imágenes | 🟡 | Ver `docs/ATRIBUCIONES.md` |
| 9 | Leyes colombianas y locales | 🟡 | Esta matriz |

## 2. Matriz normativa

| Norma | Exigencia | Cómo lo cumple el sistema | Estado |
|---|---|---|:-:|
| **Ley 1581 de 2012**, art. 9 | Autorización previa, expresa e informada | Casilla específica de privacidad, sin marcar por defecto; el servidor rechaza la solicitud sin ella | ✅ |
| Decreto 1377 de 2013, art. 7 | El silencio no es autorización | Ninguna casilla viene marcada; la aceptación exige una acción | ✅ |
| Decreto 1377 de 2013, art. 8 | Conservar prueba de la autorización | Registro inalterable con fecha, versión, huella SHA-256 del documento, texto de la casilla, medio, IP y navegador | ✅ |
| Decreto 1377 de 2013, art. 13 | Política de tratamiento con contenido mínimo | `/legal/privacidad`: responsable, finalidades, derechos, área responsable, procedimiento, vigencia | 🟡 completar NIT, dirección y teléfono |
| Ley 1581, art. 4 (principios de finalidad y libertad) y Decreto 1377, art. 4 | Recolectar solo lo necesario | Ver §4 | ✅ |
| Ley 1581, arts. 5 y 6 | Datos sensibles (el origen étnico lo es) | No se piden. El campo «motivo» advierte no incluirlos | ✅ |
| Ley 1581, art. 7; Decreto 1377, art. 12 | Datos de niños, niñas y adolescentes | Plataforma solo para mayores de 18 años, con declaración obligatoria registrada | ✅ |
| Ley 1581, art. 8 | Derechos del titular | «Mis datos y autorizaciones»: ver datos, prueba de autorización, descarga, y radicar consulta, actualización, rectificación, supresión o revocatoria | ✅ |
| Ley 1581, arts. 14 y 15 | Consultas en 10 días hábiles; reclamos en 15 | Radicado, fecha límite, aviso a piensacorporacion@gmail.com y respuesta desde el panel | 🟡 la fecha límite no descuenta festivos |
| Ley 1581, art. 17 lit. k | Manual interno de políticas y procedimientos | — | 🔴 |
| Decreto 1377 de 2013 (art. 23) | Designar persona o área de protección de datos | Campo `responsableDatos` en `src/legal/documentos.ts` | 🔴 designar formalmente |
| Decreto 1377, art. 11 | Conservar solo el tiempo necesario | Borrado automático: no verificadas a los 7 días; rechazadas a los 180 días; auditoría a los 2 años | 🟡 validar plazos |
| Decreto 1377, arts. 24 y 25 | Transmisión a encargados (Google) con contrato | Informada en la política | 🔴 suscribir acuerdos de tratamiento (ver §5) |
| Decreto 090 de 2018 | Registro Nacional de Bases de Datos (RNBD) | Solo obligatorio si los activos totales superan 100.000 UVT | 🔴 verificar con el contador |
| **SIC, Circular Externa 002 de 2024** (IA y datos personales) | Necesidad y proporcionalidad, gestión de riesgos, información al titular, seguridad | Aviso en Tutor y AI Hub; la IA no decide sobre acceso ni evaluación final; auditoría de cada consulta del Tutor | 🟡 recomendado: estudio de impacto de privacidad |
| **Ley 1480 de 2011** (Estatuto del Consumidor), art. 47 | Retracto: 5 días hábiles; devolución en 30 días calendario | `/legal/reembolsos` | ✅ |
| Ley 1480, art. 51; Decreto 587 de 2016 | Reversión del pago: 5 causales, 5 días hábiles, 15 días hábiles | `/legal/reembolsos` | ✅ |
| Ley 1480, art. 50 | Identidad del proveedor, mecanismo de PQR, enlace a la autoridad | Datos en términos y políticas; enlace a la SIC en el ingreso y en los documentos | 🟡 completar datos |
| **Ley 527 de 1999** | Validez de la aceptación electrónica | Registro de cada aceptación como mensaje de datos con su huella | ✅ |
| **Decreto 1075 de 2015**, art. 2.6.6.8 | Educación informal (< 160 h): solo constancia de asistencia | Se cambió «Diploma de certificación profesional» por **«Constancia de asistencia»** y se agregó la nota «No conduce a título». Se retiró «Superior» de «Diplomado Superior» | ✅ |
| **Ley 23 de 1982; Decisión Andina 351 de 1993** | Derechos de autor | Inventario en `docs/ATRIBUCIONES.md`; fuentes con licencia OFL servidas localmente | 🟡 |
| Constitución, arts. 7, 18, 19 y 70 | Diversidad étnica y libertad de conciencia y cultos | Términos: los ejes cristiano y etnoeducativo se proponen con respeto a la libertad de conciencia; no condicionan el acceso ni la constancia | ✅ |
| Condiciones de la API de Gemini (Google) | Usuarios de 18 años o más; no usar en servicios dirigidos a menores | Restricción a mayores de 18 años | ✅ |
| Ley 1618 de 2013 (accesibilidad) | Recomendado para sitios privados | Etiquetas en formularios, mensajes de error asociados, navegación por teclado | 🟡 falta una auditoría completa |

**Normas locales (Barrancabermeja, Santander):** no se encontró regulación distrital específica para plataformas educativas virtuales. La educación informal no requiere registro ante la Secretaría de Educación (Decreto 1075 de 2015). Si se dictan sesiones presenciales, aplica el artículo 47 del Decreto Ley 2150 de 1995: uso del suelo, condiciones sanitarias y de seguridad, derechos de autor, matrícula mercantil e impuestos locales. A la fecha consultada no hay una ley de inteligencia artificial vigente en Colombia; el CONPES 4144 de 2025 es una política pública, no una norma obligatoria para particulares.

## 3. ¿Se necesita consentimiento?

| Uso | ¿Requiere autorización? | Implementado |
|---|---|---|
| Datos de la solicitud y de la cuenta (nombre, correo, institución, rol) | **Sí**: autorización previa, expresa e informada (Ley 1581, art. 9) | Casilla de privacidad obligatoria y registrada |
| Aceptación del contrato de uso | **Sí**: aceptación de los términos | Casilla de términos, separada |
| Cookie de sesión (estrictamente necesaria) | No se requiere autorización: no recoge datos para fines distintos de prestar el servicio solicitado; se **informa** | Aviso de cookies y política |
| Cookies de analítica o publicidad | **Sí**, si se agregan en el futuro | No se usan |
| Envío de texto a Google Gemini | Cubierto por la política, como transmisión a un encargado, siempre que exista el contrato del art. 25 | Aviso en las herramientas de IA |
| Verificación pública de constancias (nombre del titular) | Cubierta por la finalidad informada | Política, finalidad 6 |
| Datos de menores de edad | Requeriría autorización del representante legal | Excluidos: solo mayores de 18 |

## 4. Minimización de datos

- **Solicitud de acceso:** nombre, correo, institución, rol y motivo opcional, con advertencia de no incluir datos sensibles. No se piden documento de identidad, teléfono, fecha de nacimiento, dirección, género, pertenencia étnica ni religión.
- **Edad:** se pide una declaración (casilla), no la fecha de nacimiento.
- **Avatar:** se eliminó la fotografía del perfil; se muestran iniciales.
- **Progreso académico:** se guarda solo en el navegador de la persona.
- **Registros técnicos:** IP y navegador, únicamente como prueba de autorización y por seguridad.
- **Borrado automático:** solicitudes no verificadas a los 7 días; rechazadas a los 180 días; auditoría a los 2 años.
- **Sin terceros en el navegador:** se eliminó la carga de Google Fonts, que enviaba la IP de cada visitante a Google.

## 5. Pendientes de la Corporación (no se pueden resolver con código)

1. Completar en `src/legal/documentos.ts` la razón social, el NIT, la dirección y el teléfono, tal como aparecen en el RUT y en el certificado de existencia y representación legal.
2. Revisión jurídica de los cuatro documentos y de los plazos de conservación. Para publicar una nueva versión, subir `version` y `vigencia`: el sistema pedirá aceptarla de nuevo a todas las personas.
3. Designar formalmente el área o persona responsable de protección de datos y adoptar el manual interno (Ley 1581, art. 17 lit. k).
4. **Encargados:**
   - **Gemini:** usar el nivel de pago, donde Google no usa los contenidos para mejorar sus productos, y aceptar sus condiciones de tratamiento de datos.
   - **Correo:** para el envío, preferir Google Workspace o un proveedor transaccional con acuerdo de tratamiento de datos, en lugar de una cuenta personal de Gmail.
   - **Alojamiento:** definir el proveedor y completarlo en la política.
5. Verificar con el contador si los activos superan 100.000 UVT (obligación de inscribir las bases de datos en el RNBD).
6. Recomendado: estudio de impacto de privacidad para las funciones de IA (SIC, Circular Externa 002 de 2024).
7. Si se cobra por los programas: definir la política de retiro después de iniciado el programa, la pasarela de pago y el formulario de reversión (Decreto 587 de 2016), y mantener la facturación electrónica.
8. Publicar solo con **HTTPS**. Hacer copias de seguridad cifradas de la carpeta `datos/`.
9. Confirmar los derechos sobre el logotipo (ver `docs/ATRIBUCIONES.md`) y considerar el registro de la marca ante la SIC.

## 6. Fuentes consultadas

- [SIC — Circular Externa 002 de 2024 (resumen, Brigard Urrutia)](https://www.bu.com.co/es/insights/noticias/sic-instruye-sobre-el-uso-de-datos-personales-en-sistemas-de-ia)
- [Decreto 1377 de 2013](https://www.unidadvictimas.gov.co/wp-content/uploads/Documentos/decretos/DECRETO_1377_2013.pdf)
- [Decreto 090 de 2018 (RNBD)](https://www.saludcapital.gov.co/Normo/tic/decreto_0090_de_2018.pdf)
- [SIC — Concepto sobre el derecho de retracto (art. 47, Ley 1480)](https://sedeelectronica.sic.gov.co/sites/default/files/normatividad/Concepto_12208265.pdf)
- [Decreto 587 de 2016 (reversión del pago)](https://sedeelectronica.sic.gov.co/sites/default/files/normatividad/Decreto_587_2016.pdf)
- [Normatividad de educación informal (Secretaría de Educación de Bogotá)](https://reaperturagradual.educacionbogota.edu.co/sites/default/files/NORMATIVIDAD_EDUCACION_INFORMAL.pdf)
- [Condiciones adicionales de la API de Gemini](https://ai.google.dev/gemini-api/terms)
- [Cookies y Ley 1581 (Asuntos Legales)](https://www.asuntoslegales.com.co/consumidor/conozca-los-aspectos-legales-que-debe-tener-en-cuenta-al-usar-cookies-en-sitios-web-3375211)
- [Derechos de autor de obras creadas con IA en Colombia (El Tiempo)](https://www.eltiempo.com/justicia/servicios/de-quien-son-los-derechos-de-autor-de-una-obra-creada-con-ia-esto-dice-la-ley-en-colombia-3439621)
- [CONPES 4144 de 2025](https://ambitojuridico.com/sites/default/files/2025-02/Conpes-4144-2025.pdf)
