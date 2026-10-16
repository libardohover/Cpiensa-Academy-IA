import React, { useState, useEffect } from 'react';
import { TopBar } from './components/navigation/TopBar';
import { Sidebar } from './components/navigation/Sidebar';
import { AccesoRestringido } from './components/navigation/AccesoRestringido';
import { NOMBRE_ROL, puedeAcceder } from './auth/permisos';
import { CampusView } from './components/campus/CampusView';
import { InicioView } from './components/inicio/InicioView';
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

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('inicio');
  const [leccionInicial, setLeccionInicial] = useState<string | undefined>(undefined);

  // Multi-Tenant & User State
  const [organizations, setOrganizations] = useState<TenantOrg[]>(INITIAL_ORGS);
  const [currentOrg, setCurrentOrg] = useState<TenantOrg>(INITIAL_ORGS[0]);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [currentRole, setCurrentRole] = useState<UserRole>(INITIAL_USER.role);

  // LMS Progress State (Persistent in localStorage)
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cpiensa_completed_lessons');
      return saved ? JSON.parse(saved) : INITIAL_USER.completedLessons;
    } catch {
      return INITIAL_USER.completedLessons;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cpiensa_completed_lessons', JSON.stringify(completedLessonIds));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }, [completedLessonIds]);

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
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setUser((prev) => ({ ...prev, role }));
    setAvisoRol(`Ahora navegas como ${NOMBRE_ROL[role]}`);
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
    </div>
  );
}
