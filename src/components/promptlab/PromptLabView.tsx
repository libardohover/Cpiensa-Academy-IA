import React, { useState } from 'react';
import {
  Terminal,
  Columns,
  GitBranch,
  Play,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  Check,
  Bookmark,
  FileCode,
  Scale,
} from 'lucide-react';
import { PromptVersion } from '../../types';

interface PromptLabViewProps {
  templates: PromptVersion[];
  onSavePrompt: (prompt: PromptVersion) => void;
}

export const PromptLabView: React.FC<PromptLabViewProps> = ({ templates, onSavePrompt }) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'ab_test' | 'library'>('editor');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptVersion>(templates[0]);

  // Editor states
  const [title, setTitle] = useState<string>(selectedPrompt.title);
  const [systemPrompt, setSystemPrompt] = useState<string>(selectedPrompt.systemPrompt);
  const [userPrompt, setUserPrompt] = useState<string>(selectedPrompt.userPromptTemplate);
  const [notes, setNotes] = useState<string>(selectedPrompt.notes);

  // A/B test states
  const [promptA, setPromptA] = useState<string>(
    'Corrige y resume el siguiente texto corporativo en 3 viñetas breves:\n\n{{input}}'
  );
  const [promptB, setPromptB] = useState<string>(
    'Actúa como Consultor de Comunicación. Aplica el principio de Minto para resumir el texto en una conclusión rectora y 3 puntos clave con formato Markdown estricto:\n\n{{input}}'
  );
  const [testInput, setTestInput] = useState<string>(
    'El proyecto de migración al nuevo sistema de base de datos ha experimentado un retraso de tres semanas debido a incompatibilidades con el proveedor anterior. El equipo ya identificó los parches necesarios y proyectamos reanudar operaciones normales el 1 de noviembre sin sobrecostos en licencias.'
  );
  const [runningAB, setRunningAB] = useState<boolean>(false);
  const [resultA, setResultA] = useState<any>(null);
  const [resultB, setResultB] = useState<any>(null);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);

  const handleSelectTemplate = (tmpl: PromptVersion) => {
    setSelectedPrompt(tmpl);
    setTitle(tmpl.title);
    setSystemPrompt(tmpl.systemPrompt);
    setUserPrompt(tmpl.userPromptTemplate);
    setNotes(tmpl.notes);
    setActiveTab('editor');
  };

  const handleSaveVersion = () => {
    const newVersion: PromptVersion = {
      id: `pv-${Date.now()}`,
      versionNumber: selectedPrompt.versionNumber + 1,
      title,
      category: selectedPrompt.category,
      systemPrompt,
      userPromptTemplate: userPrompt,
      model: selectedPrompt.model,
      temperature: selectedPrompt.temperature,
      scoreAvg: 4.9,
      createdAt: new Date().toISOString().split('T')[0],
      notes: notes || `Versión ${selectedPrompt.versionNumber + 1} guardada por el usuario`,
    };
    onSavePrompt(newVersion);
    setSelectedPrompt(newVersion);
    alert(`¡Versión v${newVersion.versionNumber} registrada exitosamente en Prompt Lab!`);
  };

  const handleRunABTest = async () => {
    if (!testInput.trim()) return;
    setRunningAB(true);
    setResultA(null);
    setResultB(null);

    try {
      const fullPromptA = promptA.replace('{{input}}', testInput);
      const fullPromptB = promptB.replace('{{input}}', testInput);

      const [resA, resB] = await Promise.all([
        fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: fullPromptA, model: 'gemini-3.8-flash' }),
        }).then((r) => r.json()),
        fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: fullPromptB, model: 'gemini-3.8-flash' }),
        }).then((r) => r.json()),
      ]);

      setResultA(resA);
      setResultB(resB);
    } catch (err: any) {
      alert('Error ejecutando prueba A/B');
    } finally {
      setRunningAB(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(selectedPrompt, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${selectedPrompt.id}_v${selectedPrompt.versionNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Subsistema C</span>
            <span aria-hidden="true">·</span>
            <span>Laboratorio de Ingeniería de Prompts</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Prompt Lab: Versionado Git-like, Pruebas A/B y Rúbricas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Desarrollo sistemático de prompts con Golden Datasets, trazabilidad de cambios y exportación de esquemas.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Editor & Versiones
          </button>
          <button
            onClick={() => setActiveTab('ab_test')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'ab_test' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pruebas A/B Split
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'library' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Biblioteca Curada
          </button>
        </div>
      </div>

      {/* Main Tab Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Editor */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-bold font-mono bg-blue-100 text-blue-800 rounded">
                      v{selectedPrompt.versionNumber}
                    </span>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-base font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none px-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportJSON}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar JSON</span>
                    </button>
                    <button
                      onClick={handleSaveVersion}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Guardar Nueva Versión</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                    System Prompt (Directrices Inmutables & Rol)
                  </label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                    User Prompt Template (Con variables {'{{variable}}'})
                  </label>
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                    Notas de la Versión / Changelog
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    placeholder="Describe los cambios respecto a la versión anterior..."
                  />
                </div>
              </div>
            </div>

            {/* Right Col: Version History & Rubric */}
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-blue-600" />
                  <span>Historial de Versiones en Repositorio</span>
                </h3>

                <div className="space-y-3">
                  {templates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                        tmpl.id === selectedPrompt.id
                          ? 'border-blue-600 bg-blue-50/60'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {tmpl.title} (v{tmpl.versionNumber})
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{tmpl.createdAt}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tmpl.notes}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600">
                        <span>Modelo: {tmpl.model}</span>
                        <span className="font-semibold text-emerald-700">★ {tmpl.scoreAvg}/5.0</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ab_test' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-600" />
                    <span>Configuración de Prueba A/B Simultánea</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evalúa dos formulaciones distintas de prompt sobre el mismo dato de prueba para comparar consistencia, latencia y tokens.
                  </p>
                </div>

                <button
                  onClick={handleRunABTest}
                  disabled={runningAB || !testInput.trim()}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {runningAB ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Ejecutando en paralelo...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Ejecutar Test A/B</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                  Texto de Entrada Compartido (Payload de Prueba)
                </label>
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-1">
                    Variante A (Prompt Simple)
                  </span>
                  <textarea
                    value={promptA}
                    onChange={(e) => setPromptA(e.target.value)}
                    rows={4}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-mono text-slate-800"
                  />
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wide block mb-1">
                    Variante B (Prompt Estructurado Minto)
                  </span>
                  <textarea
                    value={promptB}
                    onChange={(e) => setPromptB(e.target.value)}
                    rows={4}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-mono text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Results Comparison Side-by-Side */}
            {(resultA || resultB) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 uppercase">Resultado Variante A</span>
                    {resultA && (
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        {resultA.latencyMs} ms · {resultA.tokenUsage?.totalTokens} tokens
                      </span>
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed min-h-[160px]">
                    {resultA?.text || 'Esperando resultado...'}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-blue-900 uppercase">
                      Resultado Variante B (Optimizada)
                    </span>
                    {resultB && (
                      <span className="text-xs font-mono text-blue-700 font-semibold tabular-nums">
                        {resultB.latencyMs} ms · {resultB.tokenUsage?.totalTokens} tokens
                      </span>
                    )}
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-lg text-xs font-mono text-slate-900 whitespace-pre-wrap leading-relaxed min-h-[160px]">
                    {resultB?.text || 'Esperando resultado...'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'library' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-blue-600 uppercase tracking-wider">
                      {tmpl.category}
                    </span>
                    <span className="font-mono tabular-nums">v{tmpl.versionNumber}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{tmpl.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 font-mono bg-slate-50 p-2.5 rounded border border-slate-100">
                    {tmpl.systemPrompt}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 font-semibold">★ {tmpl.scoreAvg} Calidad</span>
                  <button
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    Cargar en Editor
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
