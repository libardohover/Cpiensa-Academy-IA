# CPIENSA+ ACADEMY IA 2.0

Plataforma académica multimodelo y multiinstitución para formación en inteligencia artificial y automatización: Campus LMS, AI Hub, Prompt Lab, Agent Studio, Automation Studio, Knowledge Hub, No-Code Builder, Analytics, Marketplace, conectores y administración.

## Subsistemas

| Código | Subsistema | Qué hace |
|---|---|---|
| — | **Inicio** | Saludo, meta semanal, indicadores, módulos para continuar, actividades, valor de la semana y accesos según el rol |
| A | **Campus LMS** | Diplomado de 10 módulos y 50 lecciones, progreso y certificado |
| B | **AI Hub Gateway** | Catálogo multimodelo, parámetros de inferencia, tokens y costos |
| C | **Prompt Lab** | Versionado de prompts, pruebas A/B y rúbricas |
| D | **Agent Studio** | Definición de agentes, herramientas y supervisión humana |
| E | **Automation Studio** | Flujos por eventos con aprobación humana |
| F | **Knowledge Hub (RAG)** | Documentos indexados y consulta con citas |
| G | **No-Code Builder** | Micro-herramientas a partir de requerimientos |
| H | **Analytics Center** | Indicadores de aprendizaje, costos de IA y desempeño |
| J | **Marketplace** | Prompts, agentes y automatizaciones certificadas |
| K | **Conectores Enterprise** | Google Workspace, Microsoft 365, WhatsApp, webhooks |
| I | **Administración & RBAC** | Usuarios, roles, instituciones y auditoría |

Incluye además el **Tutor Socrático** (panel lateral) y la **verificación de certificados**.

## Identidad corporativa

La interfaz usa los colores de la **Corporación Étnica Educativa CPIENSA+**: naranja `#F38734` y gris carbón `#373435`, con fondos blancos. Están definidos una sola vez en `src/index.css` (bloque `@theme`), así que todos los componentes los toman automáticamente. El logo está en `src/assets/images/` (`cpiensa-logo.png` y `cpiensa-simbolo.png`).

## Ejes transversales del diplomado

Los 10 módulos tienen dos ejes transversales, visibles en cada lección (tarjeta **Ejes transversales del Módulo**) y en el marco completo (botón **Ejes transversales** del Campus):

- **Valores y principios cristianos:** dignidad humana, verdad e integridad, amor y servicio, justicia y equidad, mayordomía responsable, sabiduría y discernimiento, comunidad y trabajo con excelencia, cada uno con su referencia bíblica, su aplicación a la IA y un compromiso práctico por módulo.
- **Enfoque etnoeducativo:** por módulo, cómo se aplica la etnoeducación, el principio del Decreto 804 de 1995 que se trabaja y una actividad etnoeducativa. Incluye el marco normativo (Constitución, Ley 21 de 1991, Ley 70 de 1993, Ley 115 de 1994, Decreto 804 de 1995 y Decreto 1122 de 1998).

El Tutor Socrático, el evaluador de ejercicios, el Knowledge Hub y el certificado también incorporan ambos ejes. Los textos se editan en `src/data/ejesTransversales.ts`.

## Acceso y aprobación de cuentas

La plataforma tiene ingreso real con correo y contraseña. Solo entran las cuentas **verificadas, aprobadas y activas**; registrarse no concede acceso.

### Recorrido

1. **Solicitar acceso** (pantalla de ingreso): nombre, correo, institución, rol solicitado, motivo opcional y tres casillas separadas: términos y condiciones, política de privacidad y declaración de mayoría de edad.
2. El solicitante recibe un **enlace de verificación** (vence en 24 h) y confirma su correo.
3. La plataforma envía la solicitud a **piensacorporacion@gmail.com** (`APROBACIONES_CORREO`) con nombre, correo, institución, rol solicitado, fecha y un enlace al panel. El enlace **no autoriza nada por sí solo**: hay que iniciar sesión con una cuenta administradora.
4. En **Solicitudes de acceso** (subsistema L), el administrador **aprueba** (confirma la institución y asigna el rol y sus permisos), **rechaza** o **pide información adicional**.
5. El solicitante recibe la decisión por correo y, si fue aprobada, un **enlace personal de un solo uso** para establecer su contraseña (vence en 48 h).
6. piensacorporacion@gmail.com recibe la **confirmación de cada decisión**, que queda en la **auditoría**.

Los correos nunca incluyen contraseñas ni credenciales.

### Estados de una cuenta

| Estado | Puede ingresar |
|---|:-:|
| Pendiente de verificación | No |
| Pendiente de aprobación | No |
| Activa (aprobada y con contraseña establecida) | Sí |
| Suspendida | No (se cierran sus sesiones) |
| Desactivada (incluye solicitudes rechazadas) | No |

### Primer arranque: cuenta administradora

Si no existe ningún SuperAdmin, el servidor crea la cuenta **piensacorporacion@gmail.com** (o `ADMIN_INICIAL_CORREO`) y le envía un enlace para establecer la contraseña (vence en 72 h). No hay contraseñas por defecto. Si el enlace vence, usa **¿Olvidaste tu contraseña?** con ese correo.

### Envío de correos

- **Con SMTP** (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` en `.env.local`): los correos se envían de verdad. Para Gmail, `SMTP_PASS` es una **contraseña de aplicación** (Cuenta de Google → Seguridad → Verificación en dos pasos → Contraseñas de aplicaciones), no la contraseña normal.
- **Sin SMTP**: cada correo se guarda como archivo `.html` en `datos/correos/`. Ábrelo con el navegador para usar sus enlaces. Sirve para probar en el equipo.
- Los enlaces de los correos usan `APP_URL`. Si otros equipos usarán la plataforma, define allí la dirección real.

### Seguridad

| Medida | Cómo |
|---|---|
| Contraseñas | `scrypt` con sal aleatoria; mínimo 10 caracteres con letras y números, sin partes del correo |
| Sesiones | Cookie `HttpOnly` + `SameSite=Strict` (+ `Secure` con HTTPS); vencen a las 8 h o tras 60 min sin actividad; el servidor guarda solo su hash |
| Enlaces y códigos | Aleatorios, de un solo uso, con vencimiento; se guardan solo como hash; se quitan de la barra de direcciones al abrirlos |
| Cuentas administrativas | Código adicional de 6 dígitos enviado al correo en cada ingreso (vence en 10 min, máx. 5 intentos) |
| Intentos repetidos | 5 intentos fallidos por correo en 15 min → bloqueo de 15 min; límites por IP en ingreso, solicitudes y recuperación |
| Mensajes | Generales cuando revelarían si una cuenta existe (ingreso fallido, recuperación, solicitud repetida) |
| Permisos | El servidor comprueba sesión, rol e institución en **cada** operación protegida; el rol viene de la cuenta aprobada |
| Instituciones | El Administrador Institucional y el Auditor solo ven y gestionan su institución; el SuperAdmin, todas |
| Origen | Las peticiones que cambian datos deben venir de la propia plataforma |
| Auditoría | Registro de solo adición en `datos/auditoria.jsonl` (solicitudes, decisiones, ingresos, fallos, suspensiones, uso del Tutor) |

`datos/` contiene información personal y está excluida de Git. Haz copia de seguridad de esa carpeta.

### Modo demostración (solo pruebas)

Con `MODO_DEMO=true` (o con `npm run dev`), la pantalla de ingreso muestra **Entrar en demostración** con selector de rol, y el rol se puede cambiar desde el menú. Las sesiones de demostración no ven ni deciden solicitudes reales. En el servidor de producción (`npm start`) está **desactivado** salvo que se active de forma explícita.

## Cumplimiento legal

- **Documentos** versionados en `/legal/…`; su contenido está en `server/legal/textos.ts` y los datos de la entidad, las versiones y las fechas en `src/legal/documentos.ts`. Cada documento tiene una huella SHA-256.
- **Aceptación**: casillas separadas y sin marcar para términos, privacidad y mayoría de edad. Si sube la versión de un documento obligatorio, todas las personas deben aceptarla al ingresar.
- **Prueba del consentimiento**: `datos/consentimientos.jsonl` guarda fecha, versión, huella, texto de la casilla, medio, IP y navegador. Se consulta y exporta en CSV desde **Solicitudes de acceso → Consentimientos**.
- **Derechos del titular**: **Mis datos y autorizaciones**, en el menú de usuario. Las solicitudes llevan radicado y fecha límite (10 o 15 días hábiles) y se atienden en **Solicitudes de acceso → Derechos de titulares**.
- **Cookies**: solo la cookie técnica de sesión y almacenamiento local funcional. Se informan con un aviso. Las fuentes se sirven desde la plataforma.
- **Conservación**: borrado automático de solicitudes no verificadas (7 días) y rechazadas (180 días), y de la auditoría con más de 2 años.
- Matriz normativa y pendientes de la Corporación: [`docs/CUMPLIMIENTO-LEGAL.md`](docs/CUMPLIMIENTO-LEGAL.md). Imágenes y licencias: [`docs/ATRIBUCIONES.md`](docs/ATRIBUCIONES.md).

> Los textos legales son borradores técnicos: deben ser revisados por un abogado antes de publicar la plataforma.

## Roles y permisos (RBAC)

| Rol | Puede usar |
|---|---|
| Invitado autorizado | Inicio y Campus (contenidos habilitados) |
| Estudiante | Inicio, Campus, AI Hub, Prompt Lab, Agent Studio, Knowledge Hub, No-Code Builder, Marketplace |
| Instructor / Evaluador | Lo del estudiante + Automation Studio y Analytics Center |
| Coordinador | Inicio, Campus, Knowledge Hub, Analytics Center, Marketplace |
| Creador IA | Inicio, Campus, laboratorios de IA (AI Hub, Prompt Lab, Agent Studio, No-Code, Automation), Knowledge Hub, Marketplace |
| Auditor | Inicio, Analytics Center y Solicitudes de acceso **en solo lectura** |
| Administrador Institucional | Todo, incluidas Solicitudes de acceso, Conectores y Administración, **solo de su institución** |
| SuperAdmin | Todo, en todas las instituciones; único que asigna el rol SuperAdmin |

- La matriz está en `src/auth/permisos.ts` y la usan **el navegador y el servidor**.
- El **Tutor IA** es un servicio de la plataforma (`servicio:tutor-ia`), con permisos propios y sin cuenta humana; cada consulta queda en la auditoría a nombre de quien la originó.

## Tecnologías

React 19 · TypeScript 7 · Vite 8 · Tailwind CSS 4 · Express 4 · Google Gemini (`@google/genai`)

## Requisitos

- [Node.js](https://nodejs.org/) **20.19 o superior** (recomendado 22 LTS)
- Opcional: clave de API de Gemini ([Google AI Studio](https://aistudio.google.com/apikey))

## Instalación

```bash
git clone https://github.com/<usuario>/<repositorio>.git
cd <repositorio>
npm install
cp .env.example .env.local     # en Windows: copy .env.example .env.local
```

En `.env.local`, define `GEMINI_API_KEY` para usar Gemini y, opcionalmente, `APP_URL` con la dirección pública de la plataforma.

> La clave **solo se usa en el servidor**; nunca se envía al navegador. `.env.local` está excluido de Git.

## Uso

### Desarrollo (con recarga en caliente)

```bash
npm run dev
```

### Servidor local (producción)

```bash
npm run build   # compila el frontend (dist/) y el servidor (dist/server.cjs)
npm start       # inicia en http://localhost:3000
```

O en un solo paso: `npm run serve`. También puedes usar los scripts incluidos:

- **Windows:** doble clic en `iniciar-servidor.bat`
- **Linux / macOS:** `./iniciar-servidor.sh`

Otros equipos de la red pueden entrar con `http://<IP-del-equipo>:3000`. Para otro puerto, cambia `PORT` en `.env.local`.

#### PM2 (opcional)

```bash
npm install -g pm2
npm run build
pm2 start ecosystem.config.cjs
```

#### Docker (opcional)

```bash
docker build -t cpiensa-academy .
docker run -d -p 3000:3000 --env-file .env.local --name cpiensa-academy cpiensa-academy
```

## API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado del servidor y si Gemini está configurado |
| `GET` | `/api/ai/models` | Catálogo de modelos del AI Hub |
| `POST` | `/api/ai/generate` | Generación: `{ prompt, systemInstruction?, model?, temperature? }` |
| `POST` | `/api/knowledge/query` | Consulta al Knowledge Hub: `{ query, topK? }` |
| `POST` | `/api/automation/execute` | Ejecución de un flujo: `{ workflowId, inputPayload?, requireApproval? }` |
| `GET` | `/api/certificates/:codigo` | Verificación de certificado (pública; 404 si el código no existe) |
| `POST` | `/api/auth/solicitudes` · `/verificar` | Solicitud de acceso y verificación del correo |
| `POST` | `/api/auth/ingresar` · `/codigo` · `/salir` | Ingreso, código administrativo y cierre de sesión |
| `GET` | `/api/auth/sesion` | Usuario de la sesión actual |
| `POST` | `/api/auth/recuperar` · `/contrasena` | Recuperación y establecimiento de contraseña |
| `GET` | `/api/admin/solicitudes` · `/api/admin/auditoria` | Panel administrativo (gestores y auditor) |
| `POST` | `/api/admin/solicitudes/:id/decision` | Aprobar, rechazar o pedir información |
| `POST` | `/api/admin/cuentas/:id/estado` | Suspender, reactivar o desactivar |

Todas las rutas, salvo `/api/health`, la verificación de certificados y las de ingreso, exigen sesión y comprueban el rol en el servidor.

## Qué es real y qué es demostración

| Componente | Estado |
|---|---|
| Modelos **Gemini 3.8 Flash** y **Gemini 4 Argon** | Reales si hay `GEMINI_API_KEY`; simulados sin clave |
| Modelos GPT-4o, Claude y DeepSeek del catálogo | **Simulados**: no hay adaptadores conectados a esos proveedores |
| Knowledge Hub | Corpus de demostración de 4 fragmentos con búsqueda por palabras clave |
| Automation Studio | Ejecución simulada (registra los pasos, no envía mensajes reales) |
| Certificados | Registro de demostración en memoria con dos códigos: `CPI-2026-9481` y `CPI-2026-3021`. Cualquier otro código se muestra como **no verificado** |
| **Ingreso, solicitudes, aprobación, contraseñas, sesiones, permisos y auditoría** | **Reales** (servidor). Se guardan en archivos JSON en `datos/`: adecuado para un piloto en un solo servidor; para mayor escala, migrar a PostgreSQL |
| Envío de correos | Real con SMTP configurado; sin SMTP se guardan en `datos/correos/` |
| Progreso del Campus | Se guarda por persona **en el navegador** (no en el servidor) |
| Pestaña Usuarios de «Administración & RBAC», cursos, analítica y marketplace | Datos de ejemplo en `src/data/` (las cuentas reales se gestionan en «Solicitudes de acceso») |
| Documentos legales (`/legal/terminos`, `/legal/privacidad`, `/legal/cookies`, `/legal/reembolsos`) | Funcionales y versionados; **borradores para revisión jurídica** con datos de la entidad por completar |

Para producción, el registro de certificados, el corpus RAG y los flujos deben conectarse a una base de datos y a los servicios reales.

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo (Express + Vite) |
| `npm run build` | Compila frontend y servidor en `dist/` |
| `npm start` | Servidor de producción |
| `npm run serve` | `build` + `start` |
| `npm run typecheck` | Verificación de tipos |

## Estructura

```
├── server.ts                  # API y servidor (Express)
├── server/env.ts              # Carga .env.local / .env
├── server/auth/               # Ingreso, aprobación, correo, sesiones y auditoría
├── datos/                     # (se crea solo) cuentas, auditoría y correos de prueba — fuera de Git
├── scripts/build-server.mjs   # Compila el servidor con esbuild
├── src/
│   ├── App.tsx                # Navegación entre subsistemas
│   ├── auth/permisos.ts       # Matriz de roles y permisos (navegador y servidor)
│   ├── auth/cliente.ts        # Cliente de la API de acceso
│   ├── components/            # Un directorio por subsistema
│   ├── data/                  # Cursos, ejes transversales y datos de ejemplo
│   ├── assets/images/         # Imágenes
│   └── types/
├── public/                    # favicon
├── extras/github-ci.yml       # CI opcional
├── Dockerfile · ecosystem.config.cjs
└── iniciar-servidor.bat / .sh
```

## Integración continua (opcional)

`extras/github-ci.yml` compila el proyecto en cada `push`. Para activarlo, cópialo a `.github/workflows/ci.yml`. Necesitas un token de GitHub con permiso **workflow**, o puedes crearlo desde la pestaña **Actions** del repositorio.
