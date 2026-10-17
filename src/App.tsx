import React, { useState, useEffect } from 'react';
import { TopBar } from './components/navigation/TopBar';
import { Sidebar } from './components/navigation/Sidebar';
import { AccesoRestringido } from './components/navigation/AccesoRestringido';
import { NOMBRE_ROL, puedeAcceder } from './auth/permisos';
import { CampusView } from './components/campus/CampusView';
import { InicioView } from './components/inicio/InicioView';
import { PantallaIngreso, type Vista, type Aviso } from './components/navigation/PantallaIngreso';
import { AccesosView } from './components/accesos/AccesosView';
import { MisDatosView } from './components/legal/MisDatosView';
import { AceptacionPendiente } from './components/legal/AceptacionPendiente';
import { AvisoCookies } from './components/legal/AvisoCookies';
import { acceso, esErrorApi, vigilarSesion, type ConfigAcceso, type UsuarioSesion } from './auth/cliente';
import { AIHubView } from './components/aihub/AIHubView';
import { PromptLabView } from './components/promptlab/PromptLabView';
import { AgentStudioView } from './components/agentstudio/AgentStudioView';
import { AutomationStudioView } from './components/automation/AutomationStudioView';
import { KnowledgeHubView } from './components/knowledge/KnowledgeHubView';
import { NoCodeBuilderView } from './components/nocode/NoCodeBuilderView';
import { AnalyticsCenterView } from './components/analytics/AnalyticsCenterView';
import { AdminView } from './components/admin/AdminView';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { CertificateModal } from './components/certificate/CertificateModal';
import { AITutorDrawer } from './components/tutor/AITutorDrawer';

import { COURSE_MODULES } from './data/coursesData';
import {
  INITIAL_ORGS,
  INITIAL_USER,
  INITIAL_MODELS,
  INITIAL_PROMPT_TEMPLATES,
  AVAILABLE_AGENT_TOOLS,
  INITIAL_AGENTS,
  INITIAL_WORKFLOWS,
  INITIAL_KNOWLEDGE_DOCS,
  INITIAL_NO_CODE_TOOLS,
  INITIAL_CONNECTORS,
} from './data/initialData';
import { TenantOrg, UserRole, UserProfile, PromptVersion, AgentDefinition, Workflow, KnowledgeDocument, NoCodeTool } from './types';

const NOMBRES_SECCION: Record<string, string> = {
  misdatos: 'Mis datos y autorizaciones',
  solicitudes: 'Solicitudes de acceso',
  inicio: 'Inicio',
  campus: 'Campus LMS',
  aihub: 'AI Hub Gateway',
  promptlab: 'Prompt Lab',
  agentstudio: 'Agent Studio',
  automation: 'Automation Studio',
  knowledge: 'Knowledge Hub (RAG)',
  nocode: 'No-Code Builder',
  analytics: 'Analytics Center',
  marketplace: 'Marketplace',
  integrations: 'Conectores Enterprise',
  admin: 'Administración & RBAC',
};

/** Lee los parámetros de los enlaces enviados por correo (verificación, contraseña, panel). */
const PARAMS = new URLSearchParams(window.location.search);
const TOKEN = PARAMS.get('token') ?? '';
const VISTA_DESDE_ENLACE: Vista | null =
  PARAMS.get('accion') === 'verificar' && TOKEN
    ? { tipo: 'verificar', token: TOKEN }
    : PARAMS.get('accion') === 'contrasena' && TOKEN
      ? { tipo: 'contrasena', token: TOKEN, modo: 'contrasena' }
      : PARAMS.get('accion') === 'recuperar' && TOKEN
        ? { tipo: 'contrasena', token: TOKEN, modo: 'recuperar' }
        : null;
const PANEL_DESDE_ENLACE = PARAMS.get('panel') === 'solicitudes' ? PARAMS.get('id') : null;

function leerProgreso(u: UsuarioSesion): string[] {
  try {
    const guardado = localStorage.getItem(`cpiensa_progreso_${u.id}`);
    if (guardado) return JSON.parse(guardado);
  } catch {
    /* sin almacenamiento disponible */
  }
  // La cuenta de demostración arranca con el progreso de ejemplo; las reales, en cero.
  return u.esDemo ? INITIAL_USER.completedLessons : [];
}

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('inicio');
  const [leccionInicial, setLeccionInicial] = useState<string | undefined>(undefined);

  // Multi-Tenant & User State
  const [organizations, setOrganizations] = useState<TenantOrg[]>(INITIAL_ORGS);
  const [currentOrg, setCurrentOrg] = useState<TenantOrg>(INITIAL_ORGS[0]);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [currentRole, setCurrentRole] = useState<UserRole>(INITIAL_USER.role);

  // Progreso del Campus (se carga por persona al iniciar sesión)
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  // Subsystems States
  const [models] = useState(INITIAL_MODELS);
  const [promptTemplates, setPromptTemplates] = useState<PromptVersion[]>(INITIAL_PROMPT_TEMPLATES);
  const [agents, setAgents] = useState<AgentDefinition[]>(INITIAL_AGENTS);
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>(INITIAL_KNOWLEDGE_DOCS);
  const [noCodeTools, setNoCodeTools] = useState<NoCodeTool[]>(INITIAL_NO_CODE_TOOLS);
  const [connectors] = useState(INITIAL_CONNECTORS);

  // Playground pre-population bridge
  const [hubPreloadPrompt, setHubPreloadPrompt] = useState<string>('');

  // Modals & Drawers
  const [certificateOpen, setCertificateOpen] = useState<boolean>(false);
  const [tutorOpen, setTutorOpen] = useState<boolean>(false);
  const [tutorContext, setTutorContext] = useState<string>('');

  const handleToggleLessonCompletion = (lessonId: string) => {
    setCompletedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const handleSendToPlayground = (prompt: string) => {
    setHubPreloadPrompt(prompt);
    setActiveSection('aihub');
  };

  const handleOpenTutorWithContext = (context: string) => {
    setTutorContext(context);
    setTutorOpen(true);
  };

  const [avisoRol, setAvisoRol] = useState<string | null>(null);
  // Solo en el entorno de pruebas: el rol de una cuenta real lo asigna un administrador.
  const handleRoleChange = async (role: UserRole) => {
    if (!usuarioSesion?.esDemo) return;
    try {
      const r = await acceso.demoRol(role);
      aplicarUsuario(r.usuario, false);
      setAvisoRol(`Ahora navegas como ${NOMBRE_ROL[role]}`);
    } catch (e) {
      setAvisoRol(esErrorApi(e) ? e.error : 'No se pudo cambiar el rol.');
    }
    window.setTimeout(() => setAvisoRol(null), 3000);
  };

  const handleAddOrg = (newOrg: TenantOrg) => {
    setOrganizations((prev) => [...prev, newOrg]);
    setCurrentOrg(newOrg);
  };

  const handleSavePrompt = (newPrompt: PromptVersion) => {
    setPromptTemplates((prev) => [newPrompt, ...prev]);
  };

  const handleSaveAgent = (updated: AgentDefinition) => {
    setAgents((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handlePublishAgentToMarketplace = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, publishedToMarketplace: true } : a))
    );
    alert('Agente publicado en el Marketplace institucional para revisión.');
  };

  const handleSaveWorkflow = (updated: Workflow) => {
    setWorkflows((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
  };

  const handleUploadDocument = (doc: KnowledgeDocument) => {
    setKnowledgeDocs((prev) => [doc, ...prev]);
  };

  const handleSaveTool = (tool: NoCodeTool) => {
    setNoCodeTools((prev) => [tool, ...prev]);
  };

  const [menuAbierto, setMenuAbierto] = useState(false);
  const irASeccion = (seccion: string) => {
    setActiveSection(seccion);
    setMenuAbierto(false);
  };

  // ---------- Sesión real (servidor) ----------
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [usuarioSesion, setUsuarioSesion] = useState<UsuarioSesion | null>(null);
  const [configAcceso, setConfigAcceso] = useState<ConfigAcceso | null>(null);
  const [vistaIngreso, setVistaIngreso] = useState<Vista>(VISTA_DESDE_ENLACE ?? { tipo: 'ingresar' });
  const [avisoIngreso, setAvisoIngreso] = useState<Aviso | null>(null);
  const [solicitudInicial, setSolicitudInicial] = useState<string | null>(PANEL_DESDE_ENLACE);

  const aplicarUsuario = (u: UsuarioSesion, irAInicio = true) => {
    setUsuarioSesion(u);
    setCurrentRole(u.rol);
    setUser((prev) => ({ ...prev, id: u.id, name: u.nombre, email: u.correo, role: u.rol, orgId: u.institucionId }));
    setCurrentOrg((prev) => organizations.find((o) => o.id === u.institucionId) ?? prev);
    setCompletedLessonIds(leerProgreso(u));
    if (irAInicio) {
      setActiveSection(solicitudInicial && puedeAcceder(u.rol, 'solicitudes') ? 'solicitudes' : 'inicio');
    }
  };

  useEffect(() => {
    // Se quitan los tokens de la barra de direcciones apenas se leen.
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname);
    acceso.config().then(setConfigAcceso).catch(() => setConfigAcceso(null));
    if (VISTA_DESDE_ENLACE) {
      setCargandoSesion(false);
      return;
    }
    acceso
      .sesion()
      .then((r) => aplicarUsuario(r.usuario))
      .catch((e) => {
        if (esErrorApi(e) && e.codigo === 'sesion_vencida') setAvisoIngreso({ tipo: 'error', texto: e.error });
      })
      .finally(() => setCargandoSesion(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si el servidor dice que la sesión terminó, se vuelve al ingreso.
  useEffect(
    () =>
      vigilarSesion((mensaje) => {
        setUsuarioSesion(null);
        setTutorOpen(false);
        setCertificateOpen(false);
        setVistaIngreso({ tipo: 'ingresar' });
        setAvisoIngreso({ tipo: 'error', texto: mensaje });
      }),
    [],
  );

  // El progreso del Campus se guarda por persona en este navegador.
  useEffect(() => {
    if (!usuarioSesion) return;
    try {
      localStorage.setItem(`cpiensa_progreso_${usuarioSesion.id}`, JSON.stringify(completedLessonIds));
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [completedLessonIds, usuarioSesion]);

  const handleCerrarSesion = async () => {
    try {
      await acceso.salir();
    } catch {
      /* aunque falle la red, se cierra en la interfaz */
    }
    setTutorOpen(false);
    setCertificateOpen(false);
    setMenuAbierto(false);
    setUsuarioSesion(null);
    setVistaIngreso({ tipo: 'ingresar' });
    setAvisoIngreso({ tipo: 'exito', texto: 'Cerraste sesión correctamente.' });
  };

  if (cargandoSesion) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-slate-300 text-sm" role="status">
        Cargando CPIENSA+ ACADEMY IA…
      </div>
    );
  }

  if (!usuarioSesion) {
    return (
      <>
      <AvisoCookies />
      <PantallaIngreso
        key={`${vistaIngreso.tipo}-${avisoIngreso?.texto ?? ''}`}
        config={configAcceso}
        vistaInicial={vistaIngreso}
        avisoInicial={avisoIngreso}
        onIngreso={(u) => {
          setAvisoIngreso(null);
          aplicarUsuario(u);
        }}
      />
      </>
    );
  }

  // Documentos obligatorios con versión nueva: se aceptan antes de continuar.
  if (usuarioSesion.pendientesLegales.length > 0) {
    return (
      <AceptacionPendiente
        pendientes={usuarioSesion.pendientesLegales}
        onAceptado={() => setUsuarioSesion({ ...usuarioSesion, pendientesLegales: [] })}
        onSalir={handleCerrarSesion}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 antialiased font-sans select-none">
      {/* Lateral Navigation Sidebar */}
      <Sidebar
        abierto={menuAbierto}
        onCerrar={() => setMenuAbierto(false)}
        activeSection={activeSection}
        onSelectSection={irASeccion}
        organizations={organizations}
        currentOrg={currentOrg}
        onSelectOrg={setCurrentOrg}
        currentRole={currentRole}
        onChangeRole={handleRoleChange}
        rolEditable={usuarioSesion.esDemo}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Strict Top Bar Contract (Brand, 4-5 text links, 1 primary action) */}
        <TopBar
          user={user}
          currentOrg={currentOrg}
          onOpenTutor={() => {
            setTutorContext('Consulta libre al tutor pedagógico de CPIENSA+');
            setTutorOpen(true);
          }}
          onNavigate={irASeccion}
          activeSection={activeSection}
          onAbrirMenu={() => setMenuAbierto(true)}
          onCambiarRol={handleRoleChange}
          onCerrarSesion={handleCerrarSesion}
          rolEditable={usuarioSesion.esDemo}
        />

        {/* View Router */}
        <main className="flex-1 flex overflow-hidden">
          {!puedeAcceder(currentRole, activeSection) && (
            <AccesoRestringido
              seccion={activeSection}
              nombreSeccion={NOMBRES_SECCION[activeSection] ?? activeSection}
              rolActual={currentRole}
              onIrAlCampus={() => irASeccion('campus')}
            />
          )}
          {activeSection === 'inicio' && puedeAcceder(currentRole, 'inicio') && (
            <InicioView
              user={user}
              rol={currentRole}
              organizacion={currentOrg}
              modulos={COURSE_MODULES}
              leccionesCompletadas={completedLessonIds}
              onIrASeccion={irASeccion}
              onAbrirLeccion={(id) => {
                setLeccionInicial(id);
                irASeccion('campus');
              }}
              onAbrirTutor={() => {
                setTutorContext('Consulta libre al tutor pedagógico de CPIENSA+');
                setTutorOpen(true);
              }}
              onAbrirCertificado={() => setCertificateOpen(true)}
            />
          )}

          {activeSection === 'campus' && puedeAcceder(currentRole, 'campus') && (
            <CampusView
              key={leccionInicial ?? 'campus'}
              leccionInicial={leccionInicial}
              modules={COURSE_MODULES}
              completedLessonIds={completedLessonIds}
              onToggleLessonCompletion={handleToggleLessonCompletion}
              onOpenCertificate={() => setCertificateOpen(true)}
              onSendToPlayground={handleSendToPlayground}
              onOpenTutorWithContext={handleOpenTutorWithContext}
            />
          )}

          {activeSection === 'aihub' && puedeAcceder(currentRole, 'aihub') && (
            <AIHubView
              models={models}
              initialPrompt={hubPreloadPrompt}
              onClearInitialPrompt={() => setHubPreloadPrompt('')}
            />
          )}

          {activeSection === 'promptlab' && puedeAcceder(currentRole, 'promptlab') && (
            <PromptLabView
              templates={promptTemplates}
              onSavePrompt={handleSavePrompt}
            />
          )}

          {activeSection === 'agentstudio' && puedeAcceder(currentRole, 'agentstudio') && (
            <AgentStudioView
              agents={agents}
              tools={AVAILABLE_AGENT_TOOLS}
              onSaveAgent={handleSaveAgent}
              onPublishToMarketplace={handlePublishAgentToMarketplace}
            />
          )}

          {activeSection === 'automation' && puedeAcceder(currentRole, 'automation') && (
            <AutomationStudioView
              workflows={workflows}
              onSaveWorkflow={handleSaveWorkflow}
            />
          )}

          {activeSection === 'knowledge' && puedeAcceder(currentRole, 'knowledge') && (
            <KnowledgeHubView
              documents={knowledgeDocs}
              onUploadDocument={handleUploadDocument}
            />
          )}

          {activeSection === 'nocode' && puedeAcceder(currentRole, 'nocode') && (
            <NoCodeBuilderView
              tools={noCodeTools}
              onSaveTool={handleSaveTool}
            />
          )}

          {activeSection === 'analytics' && puedeAcceder(currentRole, 'analytics') && (
            <AnalyticsCenterView currentOrg={currentOrg} />
          )}

          {activeSection === 'marketplace' && puedeAcceder(currentRole, 'marketplace') && <MarketplaceView />}

          {activeSection === 'integrations' && puedeAcceder(currentRole, 'integrations') && (
            <IntegrationsView connectors={connectors} />
          )}

          {activeSection === 'misdatos' && puedeAcceder(currentRole, 'misdatos') && <MisDatosView />}

          {activeSection === 'solicitudes' && puedeAcceder(currentRole, 'solicitudes') && (
            <AccesosView
              usuario={usuarioSesion}
              instituciones={configAcceso?.instituciones ?? organizations.map((o) => ({ id: o.id, nombre: o.name }))}
              solicitudInicial={solicitudInicial}
            />
          )}

          {activeSection === 'admin' && puedeAcceder(currentRole, 'admin') && (
            <AdminView
              rolActual={currentRole}
              organizations={organizations}
              currentOrg={currentOrg}
              onSelectOrg={setCurrentOrg}
              onAddOrg={handleAddOrg}
            />
          )}
        </main>
      </div>

      {avisoRol && (
        <div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium shadow-lg">
          {avisoRol}
        </div>
      )}

      {/* Official Verifiable Certificate Modal */}
      <CertificateModal
        isOpen={certificateOpen}
        onClose={() => setCertificateOpen(false)}
        certificateCode="CPI-2026-9481"
      />

      {/* Socratic Academic Tutor Drawer */}
      <AITutorDrawer
        isOpen={tutorOpen}
        onClose={() => setTutorOpen(false)}
        initialContext={tutorContext}
      />
      <AvisoCookies />
    </div>
  );
}
