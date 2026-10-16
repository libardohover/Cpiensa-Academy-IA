import React, { useState, useEffect } from 'react';
import { TopBar } from './components/navigation/TopBar';
import { Sidebar } from './components/navigation/Sidebar';
import { CampusView } from './components/campus/CampusView';
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

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('campus');

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

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setUser((prev) => ({ ...prev, role }));
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
          {activeSection === 'campus' && (
            <CampusView
              modules={COURSE_MODULES}
              completedLessonIds={completedLessonIds}
              onToggleLessonCompletion={handleToggleLessonCompletion}
              onOpenCertificate={() => setCertificateOpen(true)}
              onSendToPlayground={handleSendToPlayground}
              onOpenTutorWithContext={handleOpenTutorWithContext}
            />
          )}

          {activeSection === 'aihub' && (
            <AIHubView
              models={models}
              initialPrompt={hubPreloadPrompt}
              onClearInitialPrompt={() => setHubPreloadPrompt('')}
            />
          )}

          {activeSection === 'promptlab' && (
            <PromptLabView
              templates={promptTemplates}
              onSavePrompt={handleSavePrompt}
            />
          )}

          {activeSection === 'agentstudio' && (
            <AgentStudioView
              agents={agents}
              tools={AVAILABLE_AGENT_TOOLS}
              onSaveAgent={handleSaveAgent}
              onPublishToMarketplace={handlePublishAgentToMarketplace}
            />
          )}

          {activeSection === 'automation' && (
            <AutomationStudioView
              workflows={workflows}
              onSaveWorkflow={handleSaveWorkflow}
            />
          )}

          {activeSection === 'knowledge' && (
            <KnowledgeHubView
              documents={knowledgeDocs}
              onUploadDocument={handleUploadDocument}
            />
          )}

          {activeSection === 'nocode' && (
            <NoCodeBuilderView
              tools={noCodeTools}
              onSaveTool={handleSaveTool}
            />
          )}

          {activeSection === 'analytics' && (
            <AnalyticsCenterView currentOrg={currentOrg} />
          )}

          {activeSection === 'marketplace' && <MarketplaceView />}

          {activeSection === 'integrations' && (
            <IntegrationsView connectors={connectors} />
          )}

          {activeSection === 'admin' && (
            <AdminView
              organizations={organizations}
              currentOrg={currentOrg}
              onSelectOrg={setCurrentOrg}
              onAddOrg={handleAddOrg}
            />
          )}
        </main>
      </div>

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
