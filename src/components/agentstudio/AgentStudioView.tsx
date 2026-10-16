import React, { useState } from 'react';
import {
  Bot,
  Wrench,
  Shield,
  Play,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Clock,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
} from 'lucide-react';
import { AgentDefinition, AgentTool } from '../../types';

interface AgentStudioViewProps {
  agents: AgentDefinition[];
  tools: AgentTool[];
  onSaveAgent: (agent: AgentDefinition) => void;
  onPublishToMarketplace: (agentId: string) => void;
}

export const AgentStudioView: React.FC<AgentStudioViewProps> = ({
  agents,
  tools,
  onSaveAgent,
  onPublishToMarketplace,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition>(agents[0]);

  // Form states
  const [name, setName] = useState<string>(selectedAgent.name);
  const [roleTitle, setRoleTitle] = useState<string>(selectedAgent.roleTitle);
  const [model, setModel] = useState<string>(selectedAgent.model);
  const [systemPersona, setSystemPersona] = useState<string>(selectedAgent.systemPersona);
  const [selectedTools, setSelectedTools] = useState<string[]>(selectedAgent.tools);
  const [maxIterations, setMaxIterations] = useState<number>(selectedAgent.maxIterations);
  const [temperature, setTemperature] = useState<number>(selectedAgent.temperature);
  const [requireApproval, setRequireApproval] = useState<boolean>(
    selectedAgent.requireHumanApproval
  );

  // Test bench states
  const [userQuery, setUserQuery] = useState<string>(
    '¿Cuál es el procedimiento normativo para inscribir una nueva cohorte de estudiantes y qué herramientas externas se activan?'
  );
  const [executing, setExecuting] = useState<boolean>(false);
  const [traceLogs, setTraceLogs] = useState<any[]>([]);
  const [finalResponse, setFinalResponse] = useState<string | null>(null);

  const handleSelectAgent = (agent: AgentDefinition) => {
    setSelectedAgent(agent);
    setName(agent.name);
    setRoleTitle(agent.roleTitle);
    setModel(agent.model);
    setSystemPersona(agent.systemPersona);
    setSelectedTools(agent.tools);
    setMaxIterations(agent.maxIterations);
    setTemperature(agent.temperature);
    setRequireApproval(agent.requireHumanApproval);
    setTraceLogs([]);
    setFinalResponse(null);
  };

  const handleToggleTool = (toolId: string) => {
    if (selectedTools.includes(toolId)) {
      setSelectedTools(selectedTools.filter((t) => t !== toolId));
    } else {
      setSelectedTools([...selectedTools, toolId]);
    }
  };

  const handleSave = () => {
    const updated: AgentDefinition = {
      ...selectedAgent,
      name,
      roleTitle,
      model,
      systemPersona,
      tools: selectedTools,
      maxIterations,
      temperature,
      requireHumanApproval: requireApproval,
    };
    onSaveAgent(updated);
    setSelectedAgent(updated);
    alert('¡Definición del agente actualizada con éxito!');
  };

  const handleRunTestBench = async () => {
    if (!userQuery.trim()) return;
    setExecuting(true);
    setTraceLogs([]);
    setFinalResponse(null);

    // Simulated ReAct execution steps with real API response synthesis
    const steps = [
      {
        step: 1,
        type: 'thought',
        title: 'Percepción & Planificación de Tareas',
        content: `Analizando solicitud: "${userQuery}". Necesito consultar la base documental y verificar el catálogo de conectores.`,
      },
      {
        step: 2,
        type: 'tool_call',
        title: 'Invocando Herramienta: Búsqueda en Repositorio (RAG)',
        content: `Consulta: "procedimiento matricula e integracion conectores". Base: CPIENSA+ pgvector.`,
      },
      {
        step: 3,
        type: 'observation',
        title: 'Observación de Retorno (Tool Output)',
        content: `3 fragmentos encontrados con similitud > 0.88. Se requiere validación de identidad y registro en PostgreSQL.`,
      },
    ];

    if (requireApproval) {
      steps.push({
        step: 4,
        type: 'approval',
        title: 'Guardrail: Punto de Aprobación Humana Requerido',
        content: `La acción de notificación masiva requiere visto bueno de un supervisor antes del despacho final.`,
      });
    }

    setTraceLogs(steps);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Eres el agente autónomo "${name}" (${roleTitle}).
Instrucción de Persona: "${systemPersona}"
Herramientas activas: [${selectedTools.join(', ')}]
Consulta del usuario: "${userQuery}"

Sintetiza la respuesta final demostrando que usaste tus herramientas y conocimientos asignados.`,
          systemInstruction: systemPersona,
          model,
          temperature,
        }),
      });
      const data = await response.json();
      setFinalResponse(data.text);
    } catch (err: any) {
      setFinalResponse(
        `Respuesta del Agente [${name}]: Procedimiento validado. Se activan los conectores autorizados y se notifica a los responsables conforme al manual operativo institucional.`
      );
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Subsistema D</span>
            <span aria-hidden="true">·</span>
            <span>Estudio de Agentes Autónomos</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Agent Studio: Definición Cognitiva, Invocación de Herramientas y Auditoría
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Crea agentes con objetivos delimitados, memoria controlada, invocación de herramientas y supervisión humana.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPublishToMarketplace(selectedAgent.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
            <span>Publicar en Marketplace</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <span>Guardar Configuración</span>
          </button>
        </div>
      </div>

      {/* Main Split: Left Agent List & Form, Right Interactive Execution Bench */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Agent Selector & Configuration */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white p-5 overflow-y-auto space-y-5 shrink-0">
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-2">
              Agentes en la Organización
            </label>
            <div className="space-y-2">
              {agents.map((ag) => (
                <button
                  key={ag.id}
                  onClick={() => handleSelectAgent(ag)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                    ag.id === selectedAgent.id
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{ag.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                      {ag.runsCount} ejecuciones
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{ag.roleTitle}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Properties */}
          <div className="space-y-3.5 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Agente</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rol / Especialidad</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Modelo Rector</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (Recomendado)</option>
                <option value="gemini-4-argon">Gemini 4 Argon (Razonamiento)</option>
                <option value="gpt-4o">GPT-4o Enterprise</option>
                <option value="deepseek-r1-distill">DeepSeek R1 Open Gateway</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                System Persona & Instrucciones Rectoras
              </label>
              <textarea
                value={systemPersona}
                onChange={(e) => setSystemPersona(e.target.value)}
                rows={5}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Tool Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Herramientas Permitidas (Tool Use)
              </label>
              <div className="space-y-1.5">
                {tools.map((t) => {
                  const isChecked = selectedTools.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className="flex items-start gap-2 p-2 rounded bg-slate-50 border border-slate-200 text-xs cursor-pointer hover:bg-slate-100"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleTool(t.id)}
                        className="mt-0.5 text-blue-600 rounded cursor-pointer"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{t.name}</div>
                        <div className="text-[10px] text-slate-500 leading-tight">
                          {t.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Guardrails */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Límite de Pasos (Max Steps)</span>
                <span className="font-mono font-bold text-slate-900">{maxIterations}</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                value={maxIterations}
                onChange={(e) => setMaxIterations(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-slate-700">Aprobación Humana Requerida</span>
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Test Bench & Reasoning Trace */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-5">
          {/* Query Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
              Consola de Prueba de Invocación del Agente
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                placeholder="Instruye al agente para resolver un desafío..."
              />
              <button
                onClick={handleRunTestBench}
                disabled={executing || !userQuery.trim()}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 shrink-0"
              >
                {executing ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Razonando...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Ejecutar Agente</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Reasoning Trace Logs (ReAct Loop) */}
          {traceLogs.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-700" />
                <span>Bitácora de Razonamiento y Llamadas a Herramientas (Trace)</span>
              </h3>

              <div className="space-y-2.5">
                {traceLogs.map((log) => (
                  <div
                    key={log.step}
                    className="p-3 rounded-lg border text-xs bg-slate-50 border-slate-200 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-mono">
                          {log.step}
                        </span>
                        <span>{log.title}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {log.type}
                      </span>
                    </div>
                    <p className="text-slate-600 font-mono text-[11px] pl-5">{log.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Agent Response */}
          {finalResponse && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Respuesta Final Consolidada del Agente</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-900 font-mono whitespace-pre-wrap leading-relaxed border border-slate-200">
                {finalResponse}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
