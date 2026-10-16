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

La interfaz usa los colores de la **Corporación CPIENSA+**: naranja `#F38734` y gris carbón `#373435`, con fondos blancos. Están definidos una sola vez en `src/index.css` (bloque `@theme`), así que todos los componentes los toman automáticamente. El logo está en `src/assets/images/` (`cpiensa-logo.png` y `cpiensa-simbolo.png`).

## Ejes transversales del diplomado

Los 10 módulos tienen dos ejes transversales, visibles en cada lección (tarjeta **Ejes transversales del Módulo**) y en el marco completo (botón **Ejes transversales** del Campus):

- **Valores y principios cristianos:** dignidad humana, verdad e integridad, amor y servicio, justicia y equidad, mayordomía responsable, sabiduría y discernimiento, comunidad y trabajo con excelencia, cada uno con su referencia bíblica, su aplicación a la IA y un compromiso práctico por módulo.
- **Enfoque etnoeducativo:** por módulo, cómo se aplica la etnoeducación, el principio del Decreto 804 de 1995 que se trabaja y una actividad etnoeducativa. Incluye el marco normativo (Constitución, Ley 21 de 1991, Ley 70 de 1993, Ley 115 de 1994, Decreto 804 de 1995 y Decreto 1122 de 1998).

El Tutor Socrático, el evaluador de ejercicios, el Knowledge Hub y el certificado también incorporan ambos ejes. Los textos se editan en `src/data/ejesTransversales.ts`.

## Roles y permisos (RBAC)

El selector **Rol Activo** del menú lateral cambia lo que puede usar cada persona:

| Subsistema | Estudiante | Profesor / Tutor | Administrador Institucional | SuperAdmin |
|---|:-:|:-:|:-:|:-:|
| Inicio, Campus, AI Hub, Prompt Lab, Agent Studio, Knowledge Hub, No-Code Builder, Marketplace | ✓ | ✓ | ✓ | ✓ |
| Automation Studio, Analytics Center | | ✓ | ✓ | ✓ |
| Conectores Enterprise, Administración | | | ✓ | ✓ |
| Cambiar de institución y gestionar instituciones (multi-tenant), asignar rol SuperAdmin | | | | ✓ |

- Los subsistemas no permitidos aparecen con 🔒 en el menú; al abrirlos se muestra **Acceso restringido** con el rol mínimo requerido.
- La matriz está en `src/auth/permisos.ts` (`SECCIONES_POR_ROL`).
- Es control de acceso **en la interfaz** para la demostración. En producción, cada ruta de la API también debe validar el rol del usuario autenticado.

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
| `GET` | `/api/certificates/:codigo` | Verificación de certificado (404 si el código no existe) |

## Qué es real y qué es demostración

| Componente | Estado |
|---|---|
| Modelos **Gemini 3.8 Flash** y **Gemini 4 Argon** | Reales si hay `GEMINI_API_KEY`; simulados sin clave |
| Modelos GPT-4o, Claude y DeepSeek del catálogo | **Simulados**: no hay adaptadores conectados a esos proveedores |
| Knowledge Hub | Corpus de demostración de 4 fragmentos con búsqueda por palabras clave |
| Automation Studio | Ejecución simulada (registra los pasos, no envía mensajes reales) |
| Certificados | Registro de demostración en memoria con dos códigos: `CPI-2026-9481` y `CPI-2026-3021`. Cualquier otro código se muestra como **no verificado** |
| Usuarios, cursos, analítica y marketplace | Datos de ejemplo en `src/data/` |

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
├── scripts/build-server.mjs   # Compila el servidor con esbuild
├── src/
│   ├── App.tsx                # Navegación entre subsistemas
│   ├── auth/permisos.ts       # Matriz de roles y permisos (RBAC)
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
