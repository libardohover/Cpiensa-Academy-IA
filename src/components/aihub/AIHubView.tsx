import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  DollarSign,
  Clock,
  Layers,
  ShieldAlert,
  Server,
  ArrowRightLeft,
} from 'lucide-react';
import { AIModel } from '../../types';

interface AIHubViewProps {
  models: AIModel[];
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const AIHubView: React.FC<AIHubViewProps> = ({
  models,
  initialPrompt = '',
  onClearInitialPrompt,
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini-3.8-flash');
  const [prompt, setPrompt] = useState<string>(
    initialPrompt ||
      `Actúa como Arquitecto de Software Senior en IA. Explica cómo desacoplar la capa de modelos de lenguaje en una aplicación empresarial para evitar el vendor lock-in y permitir el cambio transparente entre Google Gemini, OpenAI y modelos de código abierto.`
  );
  const [systemInstruction, setSystemInstruction] = useState<string>(
    'Eres un consultor experto en arquitectura de software desacoplada y soberanía de datos. Responde con rigor técnico y claridad pedagógica.'
  );
  const [temperature, setTemperature] = useState<number>(0.7);
  const [fallbackEnabled, setFallbackEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const currentModel = models.find((m) => m.id === selectedModelId) || models[0];

  const handleExecute = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          model: selectedModelId,
          temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      if (onClearInitialPrompt) onClearInitialPrompt();
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el Gateway de IA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* AI Hub Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Subsistema B</span>
            <span aria-hidden="true">·</span>
            <span>Gateway Multi-Modelo Desacoplado</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            AI Hub: Orquestación, Políticas de Fallback y Medición de Tokens
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Conexión con adaptadores para Google Gemini (SDK Nativo), OpenAI, Anthropic y modelos abiertos con cálculo de costos en tiempo real.
          </p>
        </div>

        {/* Quota & Cost Gauge */}
        <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0 text-xs">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Consumo de Hoy</div>
            <div className="font-mono font-bold text-slate-900 tabular-nums">42,850 tokens</div>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Costo Acumulado</div>
            <div className="font-mono font-bold text-emerald-700 tabular-nums">$0.0084 USD</div>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Gateway Operativo</span>
          </div>
        </div>
      </div>

      {/* Main Content Split: Left Model Grid & Config, Right Live Playground */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Model Catalog & Parameter Deck */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white p-5 overflow-y-auto space-y-5 shrink-0">
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-2">
              Seleccionar Modelo Activo
            </label>
            <div className="space-y-2">
              {models.map((mod) => {
                const isSelected = mod.id === selectedModelId;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModelId(mod.id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{mod.name}</span>
                      <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                        {mod.contextWindow}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{mod.provider}</div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-600">
                      <span>In: ${mod.inputCostPer1k}/1k</span>
                      <span>Out: ${mod.outputCostPer1k}/1k</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Parameters */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Parámetros de Inferencia</span>
            </h3>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                <span>Temperatura (Creatividad / Variabilidad)</span>
                <span className="font-mono font-bold">{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0.0 (Determinista)</span>
                <span>0.7 (Equilibrado)</span>
                <span>1.2 (Exploratorio)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Política de Fallback Automático
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Si el proveedor primario falla, re-enrutar a Gemini 3.8 Flash.
                </span>
              </div>
              <input
                type="checkbox"
                checked={fallbackEnabled}
                onChange={(e) => setFallbackEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Architecture Reference */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-700" />
              <span>Contrato de Gateway CPIENSA+</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Las aplicaciones cliente se comunican exclusivamente con <code className="font-mono text-blue-950 font-bold">/api/ai/generate</code>. Los adaptadores gestionan autenticación, cuotas y métricas de forma transparente.
            </p>
          </div>
        </div>

        {/* Right: Interactive Prompt Playground & Results */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-5">
          {/* System Persona Input */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-1.5">
              Instrucción del Sistema (System Persona / Guardrails)
            </label>
            <input
              type="text"
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
              placeholder="Define las directrices del modelo..."
            />
          </div>

          {/* User Prompt Input */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Prompt de Entrada
              </label>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                ~{Math.ceil(prompt.length / 3.8)} tokens estimados
              </span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="w-full flex-1 bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white resize-y"
              placeholder="Escribe tu prompt técnico..."
            />

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => setPrompt('')}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>

              <button
                onClick={handleExecute}
                disabled={loading || !prompt.trim()}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Invocando Gateway...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Ejecutar en {currentModel.name}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Execution Result & Observability Telemetry */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Error en inferencia</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              {/* Telemetry Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 text-white rounded-lg text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Modelo:</span>
                  <span className="text-blue-400 font-bold">{result.modelUsed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="tabular-nums">{result.latencyMs} ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Tokens:</span>
                  <span className="text-amber-400 tabular-nums">
                    {result.tokenUsage?.totalTokens} total ({result.tokenUsage?.promptTokens} in /{' '}
                    {result.tokenUsage?.completionTokens} out)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 tabular-nums">
                    ${result.estimatedCostUsd} USD
                  </span>
                </div>
              </div>

              {/* Response Body */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 whitespace-pre-wrap leading-relaxed font-mono">
                {result.text}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
