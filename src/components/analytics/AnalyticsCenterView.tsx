import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  DollarSign,
  Cpu,
  Workflow,
  Users,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { TenantOrg } from '../../types';

interface AnalyticsCenterViewProps {
  currentOrg: TenantOrg;
}

export const AnalyticsCenterView: React.FC<AnalyticsCenterViewProps> = ({ currentOrg }) => {
  // Academic competencies scores
  const competencies = [
    { name: 'Ingeniería de Prompts & R-C-T-R', score: 96, level: 'Avanzado' },
    { name: 'Agentes Autónomos & ReAct Loop', score: 88, level: 'Competente' },
    { name: 'Recuperación RAG & pgvector', score: 92, level: 'Avanzado' },
    { name: 'Automatización n8n & Webhooks', score: 90, level: 'Avanzado' },
    { name: 'Ética, Privacidad (Ley 1581) & OWASP', score: 98, level: 'Experto' },
  ];

  // Provider cost breakdown
  const providerSpend = [
    { provider: 'Google AI (Gemini 3.8 / 4)', tokens: '1,420,000', cost: '$1.42', share: 45 },
    { provider: 'OpenAI Gateway (GPT-4o)', tokens: '380,000', cost: '$1.90', share: 25 },
    { provider: 'Anthropic Adapter (Claude 3.5)', tokens: '290,000', cost: '$1.74', share: 18 },
    { provider: 'DeepSeek / Modelos Locales', tokens: '640,000', cost: '$0.32', share: 12 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Subsistema H</span>
            <span aria-hidden="true">·</span>
            <span>Centro de Analítica & Telemetría Institucional</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Analytics Center: Indicadores de Aprendizaje, Costos IA y Desempeño
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de retención estudiantil, radar de competencias, eficiencia de tokens y trazabilidad de flujos.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Filtro: Año Académico 2026 (Cohortes I y II)</span>
        </div>
      </div>

      {/* Main Analytics Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        {/* Top KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider">Tasa de Finalización</span>
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">91.4%</div>
            <div className="text-[11px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+6.2% vs cohorte anterior</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider">Estudiantes Activos</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {currentOrg.studentCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">En {currentOrg.name}</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider">Gasto Total en IA</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">$5.38 USD</div>
            <div className="text-[11px] text-slate-500 mt-1">2.7M tokens procesados</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider">Éxito de Automatización</span>
              <Workflow className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">99.6%</div>
            <div className="text-[11px] text-slate-500 mt-1">615 ejecuciones sin error</div>
          </div>
        </div>

        {/* Middle Row: Competency Radar & Module Completion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Competencies Progress Bars */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Evaluación de Competencias Profesionales (Rúbrica CPIENSA+)
              </h3>
              <span className="text-xs font-mono text-emerald-700 font-bold">Promedio: 92.8/100</span>
            </div>

            <div className="space-y-4">
              {competencies.map((c, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-blue-700 font-semibold">{c.level}</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {c.score}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module Progression Timeline */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Progreso por Módulo Académico
              </h3>
              <span className="text-xs font-mono text-slate-500">10 Módulos</span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Módulo 1: Fundamentos y Privacidad', pct: 100 },
                { name: 'Módulo 2: Ingeniería de Prompts', pct: 95 },
                { name: 'Módulo 3: Comunicación Profesional', pct: 88 },
                { name: 'Módulo 4: Investigación y Verificación', pct: 75 },
                { name: 'Módulo 5: Creación de Contenido', pct: 60 },
                { name: 'Módulo 6: Automatización de Procesos', pct: 85 },
                { name: 'Módulo 7: Desarrollo No-Code', pct: 70 },
                { name: 'Módulo 8: Productividad Personal', pct: 65 },
                { name: 'Módulo 9: Agentes y Razonamiento', pct: 50 },
                { name: 'Módulo 10: Proyecto Final y Grado', pct: 40 },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between text-xs gap-3">
                  <span className="truncate text-slate-700 flex-1">{m.name}</span>
                  <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                    <div
                      className={`h-full rounded-full ${
                        m.pct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                  <span className="w-9 text-right font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                    {m.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Gateway Cost Breakdown Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Desglose de Consumo y Costos por Adaptador de IA
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Demostración de soberanía económica: optimización de costos mediante enrutamiento inteligente.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Ahorro de $12.40 USD/mes con Fallback Flash
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Adaptador / Familia</th>
                  <th className="p-3 text-right">Tokens In/Out</th>
                  <th className="p-3 text-right">Costo Acumulado</th>
                  <th className="p-3 text-right">Participación (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {providerSpend.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      <span>{row.provider}</span>
                    </td>
                    <td className="p-3 text-right font-mono tabular-nums">{row.tokens}</td>
                    <td className="p-3 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                      {row.cost}
                    </td>
                    <td className="p-3 text-right font-mono tabular-nums">{row.share}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
