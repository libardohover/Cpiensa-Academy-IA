import React, { useState } from 'react';
import {
  Workflow as WorkflowIcon,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  RotateCcw,
  Plus,
  Terminal,
  Radio,
  FileCheck,
} from 'lucide-react';
import { Workflow, WorkflowNode } from '../../types';

interface AutomationStudioViewProps {
  workflows: Workflow[];
  onSaveWorkflow: (wf: Workflow) => void;
}

export const AutomationStudioView: React.FC<AutomationStudioViewProps> = ({
  workflows,
  onSaveWorkflow,
}) => {
  const [selectedWf, setSelectedWf] = useState<Workflow>(workflows[0]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(selectedWf.nodes[0]);
  const [executing, setExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [waitingApproval, setWaitingApproval] = useState<boolean>(false);
  const [simulatedPayload, setSimulatedPayload] = useState<string>(
    JSON.stringify(
      {
        studentEmail: 'laura.castro@cpiensa.edu.co',
        courseId: 'diplomado-ia-2-0',
        paymentStatus: 'PAID_APPROVED',
        channel: 'WhatsApp & Email',
      },
      null,
      2
    )
  );

  const handleSelectWorkflow = (wf: Workflow) => {
    setSelectedWf(wf);
    setSelectedNode(wf.nodes[0]);
    setExecutionResult(null);
    setWaitingApproval(false);
  };

  const handleExecuteWorkflow = async (forceApprove = false) => {
    setExecuting(true);
    setExecutionResult(null);

    try {
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(simulatedPayload);
      } catch (e) {
        parsedPayload = { text: simulatedPayload };
      }

      const response = await fetch('/api/automation/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: selectedWf.id,
          workflowName: selectedWf.title,
          inputPayload: parsedPayload,
          requireApproval: !forceApprove && selectedWf.nodes.some((n) => n.type === 'approval'),
        }),
      });

      const data = await response.json();
      setExecutionResult(data);

      if (data.status === 'waiting_for_human_approval') {
        setWaitingApproval(true);
      } else {
        setWaitingApproval(false);
      }
    } catch (err: any) {
      alert('Error ejecutando flujo');
    } finally {
      setExecuting(false);
    }
  };

  const handleApproveCheckpoint = () => {
    handleExecuteWorkflow(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Subsistema E</span>
            <span aria-hidden="true">·</span>
            <span>Estudio de Automatización & n8n Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Automation Studio: Flujos Orientados a Eventos, Aprobación y Resiliencia
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Editor visual de orquestación con disparadores webhooks, validación de condiciones, llamadas a IA y supervisión humana.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExecuteWorkflow(false)}
            disabled={executing}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            {executing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Ejecutando Flujo...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Simular Ejecución de Flujo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Workflows Navigator */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white p-4 overflow-y-auto space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Flujos Activos en Producción
            </span>
            <span className="text-xs font-mono text-slate-400 tabular-nums">{workflows.length} flujos</span>
          </div>

          <div className="space-y-2">
            {workflows.map((wf) => (
              <button
                key={wf.id}
                onClick={() => handleSelectWorkflow(wf)}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                  wf.id === selectedWf.id
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{wf.title}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{wf.description}</p>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-600">
                  <span>{wf.totalRuns} corridas</span>
                  <span className="text-emerald-700 font-semibold">{wf.successRate}% éxito</span>
                </div>
              </button>
            ))}
          </div>

          {/* Test Payload Box */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
              Payload del Disparador (JSON)
            </label>
            <textarea
              value={simulatedPayload}
              onChange={(e) => setSimulatedPayload(e.target.value)}
              rows={5}
              className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Center: Visual Canvas of Nodes */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedWf.title}</h3>
                <p className="text-xs text-slate-500">{selectedWf.description}</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded font-mono">
                ESTADO: ACTIVO
              </span>
            </div>

            {/* Visual Node Diagram (n8n-like horizontal workflow) */}
            <div className="py-6 overflow-x-auto">
              <div className="flex items-center gap-3 min-w-max">
                {selectedWf.nodes.map((node, index) => {
                  const isNodeActive = selectedNode?.id === node.id;
                  let badgeBg = 'bg-slate-100 text-slate-800 border-slate-300';
                  if (node.type === 'trigger') badgeBg = 'bg-blue-50 text-blue-900 border-blue-300';
                  if (node.type === 'condition') badgeBg = 'bg-amber-50 text-amber-900 border-amber-300';
                  if (node.type === 'ai_action') badgeBg = 'bg-indigo-50 text-indigo-900 border-indigo-300';
                  if (node.type === 'approval') badgeBg = 'bg-purple-50 text-purple-900 border-purple-300';
                  if (node.type === 'integration') badgeBg = 'bg-emerald-50 text-emerald-900 border-emerald-300';

                  return (
                    <React.Fragment key={node.id}>
                      <div
                        onClick={() => setSelectedNode(node)}
                        className={`w-52 p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                          isNodeActive
                            ? 'ring-2 ring-blue-600 shadow-md scale-102 bg-white'
                            : 'bg-white hover:shadow-xs'
                        } ${badgeBg}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                            {node.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Paso {index + 1}</span>
                        </div>
                        <div className="font-bold text-slate-900 text-xs mb-1">{node.label}</div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">
                          {JSON.stringify(node.config)}
                        </div>
                      </div>

                      {index < selectedWf.nodes.length - 1 && (
                        <div className="flex items-center text-slate-300">
                          <ArrowRight className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Human-in-the-Loop Checkpoint Modal/Card if paused */}
          {waitingApproval && (
            <div className="bg-purple-50 border-2 border-purple-400 rounded-xl p-5 text-xs text-purple-900 space-y-3 animate-fade-in shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-purple-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-700" />
                  <span>Punto de Aprobación Humana Requerido (Supervisor On-Duty)</span>
                </span>
                <span className="font-mono text-[11px] bg-purple-200 px-2 py-0.5 rounded text-purple-900 font-semibold">
                  TOKEN EXPIRA EN 23h 59m
                </span>
              </div>
              <p className="text-purple-800 leading-relaxed">
                El flujo de automatización ha pausado su ejecución antes de despachar notificaciones masivas. Por políticas institucionales de seguridad, se requiere que confirmes la emisión de credenciales.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleApproveCheckpoint}
                  disabled={executing}
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-800 hover:bg-purple-900 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Aprobar y Despachar Acción Externa</span>
                </button>
                <button
                  onClick={() => setWaitingApproval(false)}
                  className="px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  Rechazar / Cancelar Correcaminos
                </button>
              </div>
            </div>
          )}

          {/* Execution Telemetry & Step Logs */}
          {executionResult && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-700" />
                  <span className="font-bold text-slate-900 uppercase">
                    Registro de Ejecución en Vivo (Execution Logs)
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-slate-500">
                  <span>ID: {executionResult.executionId}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      executionResult.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {executionResult.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {executionResult.logs?.map((l: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-start justify-between p-2.5 rounded bg-slate-50 border border-slate-200 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-900">{l.step}</span>
                      <span className="text-slate-500">· {l.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(l.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
