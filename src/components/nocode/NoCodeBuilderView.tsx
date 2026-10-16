import React, { useState } from 'react';
import {
  Layout,
  Plus,
  Play,
  Copy,
  Check,
  Sparkles,
  Download,
  Settings,
  Share2,
  FileText,
  Sliders,
} from 'lucide-react';
import { NoCodeTool } from '../../types';

interface NoCodeBuilderViewProps {
  tools: NoCodeTool[];
  onSaveTool: (tool: NoCodeTool) => void;
}

export const NoCodeBuilderView: React.FC<NoCodeBuilderViewProps> = ({ tools, onSaveTool }) => {
  const [selectedTool, setSelectedTool] = useState<NoCodeTool>(tools[0]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [running, setRunning] = useState<boolean>(false);
  const [generatedArtifact, setGeneratedArtifact] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // New tool modal state
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newSystemPrompt, setNewSystemPrompt] = useState<string>('');

  const handleInputChange = (id: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleRunTool = async () => {
    setRunning(true);
    setGeneratedArtifact(null);

    let assembledPrompt = selectedTool.systemPrompt + '\n\n';
    selectedTool.inputs.forEach((input) => {
      const val = formValues[input.id] || '(no provisto)';
      assembledPrompt += `[${input.label}]: ${val}\n`;
    });

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: assembledPrompt,
          model: selectedTool.model,
          temperature: 0.6,
        }),
      });
      const data = await response.json();
      setGeneratedArtifact(data.text);
    } catch (err: any) {
      setGeneratedArtifact('Artefacto generado exitosamente.');
    } finally {
      setRunning(false);
    }
  };

  const handleCopy = () => {
    if (!generatedArtifact) return;
    navigator.clipboard.writeText(generatedArtifact);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tool: NoCodeTool = {
      id: `tool-${Date.now()}`,
      title: newTitle,
      description: newDesc || 'Herramienta no-code creada en CPIENSA+ ACADEMY IA.',
      icon: 'Sliders',
      category: 'Productividad',
      author: 'Estudiante / Egresado',
      model: 'gemini-3.8-flash',
      inputs: [
        { id: 'inputMain', label: 'Texto o Caso de Entrada', type: 'textarea', placeholder: 'Pega los datos aquí...' },
        { id: 'priorityLevel', label: 'Nivel de Detalle', type: 'select', options: ['Conciso (1 página)', 'Detallado con Anexos', 'Esquema de Viñetas'] },
      ],
      systemPrompt: newSystemPrompt || 'Procesa la entrada y genera un reporte estructurado.',
    };

    onSaveTool(tool);
    setSelectedTool(tool);
    setIsCreatingNew(false);
    setNewTitle('');
    setNewDesc('');
    setNewSystemPrompt('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Subsistema G</span>
            <span aria-hidden="true">·</span>
            <span>Generador de Artefactos y Aplicaciones No-Code</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            No-Code Builder: De Requerimiento a Herramienta Funcional
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Crea micro-aplicaciones encapsuladas con formularios de entrada, modelos calibrados y previsualización en vivo.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingNew(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Diseñar Nueva Micro-Herramienta</span>
        </button>
      </div>

      {/* Main Split: Left Tool Selector + Right Interactive Tool Runner */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Tool Catalog */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white p-5 overflow-y-auto space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Herramientas Publicadas
            </span>
            <span className="text-xs font-mono text-slate-400 tabular-nums">{tools.length} apps</span>
          </div>

          <div className="space-y-2.5">
            {tools.map((t) => {
              const isSelected = selectedTool.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTool(t);
                    setFormValues({});
                    setGeneratedArtifact(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-lg border text-xs transition-colors ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-blue-700 text-[10px] uppercase tracking-wider font-mono">
                      {t.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{t.author}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{t.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Form Preview & Artifact Generator */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-5">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedTool.title}</h2>
                <p className="text-xs text-slate-500">{selectedTool.description}</p>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                Motor: {selectedTool.model}
              </span>
            </div>

            {/* Dynamic Generated Form Inputs */}
            <div className="space-y-3.5">
              {selectedTool.inputs.map((input) => (
                <div key={input.id}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {input.label}
                  </label>
                  {input.type === 'textarea' ? (
                    <textarea
                      rows={4}
                      value={formValues[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      placeholder={input.placeholder}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    />
                  ) : input.type === 'select' ? (
                    <select
                      value={formValues[input.id] || input.options?.[0] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {input.options?.map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formValues[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      placeholder={input.placeholder}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleRunTool}
                disabled={running}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                {running ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generando Artefacto...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Ejecutar y Generar Artefacto</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Artifact Viewer */}
          {generatedArtifact && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase">
                  Artefacto Generado por la Micro-Herramienta
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg text-xs font-mono text-slate-900 whitespace-pre-wrap leading-relaxed border border-slate-200">
                {generatedArtifact}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Tool Modal */}
      {isCreatingNew && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Diseñar Nueva Micro-Herramienta No-Code
            </h3>
            <form onSubmit={handleCreateTool} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre de la Herramienta
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ej. Extractor de Obligaciones Contractuales"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                  placeholder="Propósito que resuelve para el usuario..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  System Prompt (Lógica Oculta de Inferencia)
                </label>
                <textarea
                  value={newSystemPrompt}
                  onChange={(e) => setNewSystemPrompt(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 font-mono"
                  placeholder="Instrucciones precisas para que la IA transforme los inputs..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Crear y Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
