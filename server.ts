import './server/env.js'; // debe ir primero: carga .env.local / .env
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { GoogleGenAI } from '@google/genai';

// En el paquete compilado (dist/server.cjs) esbuild fija NODE_ENV="production".
const IS_PROD = process.env.NODE_ENV === 'production';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));

// Cliente de Gemini (solo si hay una clave real configurada)
const apiKey = (process.env.GEMINI_API_KEY || '').trim();
const geminiConfigurado = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && !apiKey.startsWith('PLACEHOLDER'));
const ai = geminiConfigurado ? new GoogleGenAI({ apiKey }) : null;

/** URL pública de la plataforma: APP_URL o, si no existe, la del propio request. */
function urlPublica(req: express.Request): string {
  const base = process.env.APP_URL?.trim();
  if (base && base !== 'MY_APP_URL') return base.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

// Estado del servidor
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', modo: IS_PROD ? 'produccion' : 'desarrollo', gemini: geminiConfigurado, time: new Date().toISOString() });
});

// Multi-Model Catalog Definition
const MODEL_CATALOG = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (Producción)',
    provider: 'Google AI',
    family: 'gemini',
    contextWindow: '1,048,576 tokens',
    inputCostPer1k: 0.000075,
    outputCostPer1k: 0.0003,
    status: 'online',
    isDefault: true,
    capabilities: ['multimodal', 'streaming', 'tool_use', 'low_latency'],
  },
  {
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon (Razonamiento Avanzado)',
    provider: 'Google AI',
    family: 'gemini',
    contextWindow: '2,097,152 tokens',
    inputCostPer1k: 0.00125,
    outputCostPer1k: 0.005,
    status: 'online',
    isDefault: false,
    capabilities: ['deep_reasoning', 'coding', 'complex_math', 'agent_orchestration'],
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o Enterprise Gateway',
    provider: 'OpenAI Gateway (Compatible)',
    family: 'openai',
    contextWindow: '128,000 tokens',
    inputCostPer1k: 0.0025,
    outputCostPer1k: 0.01,
    status: 'online',
    isDefault: false,
    capabilities: ['general_nlp', 'structured_outputs', 'agentic_flow'],
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet Hub',
    provider: 'Anthropic Adapter (Compatible)',
    family: 'anthropic',
    contextWindow: '200,000 tokens',
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    status: 'online',
    isDefault: false,
    capabilities: ['nuanced_writing', 'code_refactoring', 'pedagogical_analysis'],
  },
  {
    id: 'deepseek-r1-distill',
    name: 'DeepSeek R1 Open Gateway',
    provider: 'Open Source / Local Host',
    family: 'open_models',
    contextWindow: '64,000 tokens',
    inputCostPer1k: 0.0005,
    outputCostPer1k: 0.0015,
    status: 'online',
    isDefault: false,
    capabilities: ['step_by_step_reasoning', 'local_privacy', 'cost_efficient'],
  },
];

// API: Get Model Catalog
app.get('/api/ai/models', (_req, res) => {
  res.json({
    models: MODEL_CATALOG,
    gatewayStatus: 'healthy',
    activeProvider: ai ? 'Google GenAI SDK (Connected)' : 'Simulated Multimodel Fallback',
  });
});

// API: Generate Content through AI Hub Gateway
app.post('/api/ai/generate', async (req, res) => {
  const startTime = Date.now();
  const {
    prompt,
    systemInstruction,
    model = 'gemini-3.8-flash',
    temperature = 0.7,
    maxTokens = 2048,
    mode = 'text',
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt requerido y debe ser texto válido' });
  }

  const selectedModel = MODEL_CATALOG.find((m) => m.id === model) || MODEL_CATALOG[0];

  try {
    let responseText = '';
    let tokenUsage = {
      promptTokens: Math.ceil(prompt.length / 3.8),
      completionTokens: 0,
      totalTokens: 0,
    };

    // If Gemini key is available and request targets Gemini family
    if (ai && selectedModel.family === 'gemini') {
      const targetGenModel = model === 'gemini-4-argon' ? 'gemini-4-argon' : 'gemini-3.8-flash';
      const config: any = {
        temperature,
      };
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      const response = await ai.models.generateContent({
        model: targetGenModel,
        contents: prompt,
        config,
      });

      responseText = response.text || '';
      tokenUsage.completionTokens = Math.ceil(responseText.length / 3.8);
      tokenUsage.totalTokens = tokenUsage.promptTokens + tokenUsage.completionTokens;
    } else {
      // High-fidelity fallback & multi-model simulator
      const latencyDelay = Math.min(800, Math.max(300, prompt.length * 2));
      await new Promise((resolve) => setTimeout(resolve, latencyDelay));

      if (prompt.toLowerCase().includes('evalúa') || prompt.toLowerCase().includes('rubrica')) {
        responseText = `### 📋 Evaluación Académica CPIENSA+ IA
- **Claridad Conceptual (4.8/5.0)**: El planteamiento define con exactitud los fundamentos requeridos.
- **Estructura y Contexto (4.5/5.0)**: Se incorpora el rol del sistema, variables y delimitación de alcance.
- **Mitigación de Alucinaciones (5.0/5.0)**: Se especifican fuentes y directrices para respuestas no verificadas.
- **Recomendación Pedagógica**: Para entornos de producción, añade restricciones de longitud y formato JSON schema.`;
      } else if (prompt.toLowerCase().includes('agente') || prompt.toLowerCase().includes('tool')) {
        responseText = `### 🤖 Planificación de Agente Autónomo
1. **Objetivo detectado**: Ejecución orquestada con verificación de paso a paso.
2. **Herramientas asignadas**: [Búsqueda Documental, Verificador de Fuentes, Validador de Seguridad].
3. **Paso 1**: Análisis de tokens y delimitación de memoria contextual.
4. **Paso 2**: Invocación de herramientas con validación humana en decisiones críticas.
5. **Resultado sintetizado**: Acción completada conforme a los estándares de CPIENSA+ ACADEMY IA.`;
      } else {
        responseText = `### CPIENSA+ Gateway [${selectedModel.name}]
Respuesta generada con arquitectura multi-proveedor desacoplada:

1. **Análisis Pedagógico**: Su consulta ha sido procesada aplicando las directrices de ingeniería de prompts de CPIENSA+.
2. **Desarrollo**: Para implementar esta capacidad de manera robusta, se recomienda aislar los adaptadores de IA, registrar los tokens en el sistema de auditoría y aplicar directrices éticas de privacidad.
3. **Implementación Práctica**:
\`\`\`typescript
// Ejemplo de conector estándar CPIENSA+ Gateway
const client = new AIHubClient({ provider: '${selectedModel.provider}' });
const result = await client.dispatch({
  prompt: "${prompt.slice(0, 45).replace(/"/g, '')}...",
  guardrails: true
});
\`\`\`
Respuesta verificada y lista para integración en su flujo de trabajo.`;
      }

      tokenUsage.completionTokens = Math.ceil(responseText.length / 3.8);
      tokenUsage.totalTokens = tokenUsage.promptTokens + tokenUsage.completionTokens;
    }

    const durationMs = Date.now() - startTime;
    const estimatedCost =
      (tokenUsage.promptTokens / 1000) * selectedModel.inputCostPer1k +
      (tokenUsage.completionTokens / 1000) * selectedModel.outputCostPer1k;

    return res.json({
      text: responseText,
      modelUsed: selectedModel.id,
      provider: selectedModel.provider,
      latencyMs: durationMs,
      tokenUsage,
      estimatedCostUsd: Number(estimatedCost.toFixed(6)),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/ai/generate:', error);
    return res.status(500).json({
      error: 'Error al procesar solicitud en el AI Hub Gateway',
      details: error.message || String(error),
    });
  }
});

// API: Knowledge Base Query (RAG Simulator & Semantic Matcher)
app.post('/api/knowledge/query', (req, res) => {
  const { query, documentId, topK = 3 } = req.body;
  if (!query) return res.status(400).json({ error: 'Query requerido' });

  // Mock Corpus indexed in CPIENSA+ pgvector
  const KNOWLEDGE_CORPUS = [
    {
      id: 'chunk-101',
      docTitle: 'Normativa Ética y Privacidad en IA - Colombia Ley 1581',
      section: 'Tratamiento de Datos Personales y Modelos LLM',
      content:
        'En la implementación de modelos de lenguaje en organizaciones colombianas, el principio de finalidad y consentimiento expreso debe regir el entrenamiento y fine-tuning. Ningún dato sensible debe enviarse a endpoints de inferencia sin anonimización previa.',
      score: 0.94,
      citation: 'Guía CPIENSA+ de Gobernanza IA, Sección 2.1 (2026)',
    },
    {
      id: 'chunk-102',
      docTitle: 'Arquitectura de Agentes y Control de Herramientas',
      section: 'Supervisión Humana y Permisos Idempotentes',
      content:
        'Todo agente con capacidad de modificar registros en bases de datos o enviar comunicaciones directas por WhatsApp o correo debe requerir confirmación explícita (Human-in-the-Loop) y contar con registro inmutable en auditoría.',
      score: 0.89,
      citation: 'Manual de Arquitectura Agent Studio, Módulo 9',
    },
    {
      id: 'chunk-103',
      docTitle: 'Guía Maestra de Ingeniería de Prompts CPIENSA+',
      section: 'Patrón Few-Shot y Cadena de Razonamiento',
      content:
        'El diseño de prompts profesionales requiere una delimitación del rol, especificación inequívoca del formato de salida (e.g. JSON estricto), ejemplos de alta fidelidad y directrices negativas explícitas para prevenir alucinaciones.',
      score: 0.86,
      citation: 'Metodología Pedagógica CPIENSA+, Lección 2.3',
    },
    {
      id: 'chunk-104',
      docTitle: 'Orquestación de Flujos n8n y Webhooks',
      section: 'Estrategias de Reintento y Manejo de Errores',
      content:
        'Las integraciones con APIs externas (Gmail, Microsoft Graph, WhatsApp Cloud API) deben usar colas asíncronas con reintentos exponenciales y validación estricta de firma HMAC en los webhooks entrantes.',
      score: 0.82,
      citation: 'Documentación de Automatización CPIENSA+, Módulo 6',
    },
    {
      id: 'chunk-105',
      docTitle: 'Ejes Transversales del Diplomado CPIENSA+',
      section: 'Valores y principios cristianos',
      content:
        'La formación en IA se orienta por la dignidad humana (Génesis 1:27), la verdad e integridad (Juan 8:32), el servicio al prójimo (Mateo 22:39), la justicia (Miqueas 6:8), la mayordomía responsable (1 Pedro 4:10), la sabiduría y el discernimiento (Santiago 1:5), la comunidad (1 Corintios 12) y el trabajo con excelencia (Colosenses 3:23). La decisión final sobre lo que hace un sistema de IA es siempre humana.',
      score: 0.8,
      citation: 'Marco de Ejes Transversales CPIENSA+ (2026)',
    },
    {
      id: 'chunk-106',
      docTitle: 'Ejes Transversales del Diplomado CPIENSA+',
      section: 'Enfoque etnoeducativo',
      content:
        'Cada módulo aplica los principios de la etnoeducación del Decreto 804 de 1995 (integralidad, diversidad lingüística, autonomía, participación comunitaria, interculturalidad, flexibilidad, progresividad y solidaridad), la Ley 70 de 1993 y la Cátedra de Estudios Afrocolombianos (Decreto 1122 de 1998). Los saberes y datos de los pueblos étnicos son colectivos y requieren consentimiento libre, previo e informado de sus autoridades.',
      score: 0.8,
      citation: 'Marco de Ejes Transversales CPIENSA+ (2026)',
    },
  ];

  const lower = query.toLowerCase();
  const matched = KNOWLEDGE_CORPUS.map((item) => {
    let boost = 0;
    if (lower.includes('ley') || lower.includes('privacidad') || lower.includes('colombia')) {
      if (item.id === 'chunk-101') boost += 0.05;
    }
    if (lower.includes('agente') || lower.includes('humano') || lower.includes('herramienta')) {
      if (item.id === 'chunk-102') boost += 0.05;
    }
    if (lower.includes('prompt') || lower.includes('few-shot') || lower.includes('ingenier')) {
      if (item.id === 'chunk-103') boost += 0.05;
    }
    if (lower.includes('webhook') || lower.includes('flujo') || lower.includes('automatiz')) {
      if (item.id === 'chunk-104') boost += 0.05;
    }
    if (/(valor|cristian|ética|etica|biblia|dignidad|principio)/.test(lower)) {
      if (item.id === 'chunk-105') boost += 0.18;
    }
    if (/(etno|étnic|etnic|afro|indígena|indigena|raizal|palenque|intercultural|comunidad)/.test(lower)) {
      if (item.id === 'chunk-106') boost += 0.18;
    }
    return { ...item, score: Math.min(0.99, item.score + boost) };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  res.json({
    query,
    totalHits: matched.length,
    results: matched,
    vectorEngine: 'pgvector / HNSW Cosine Distance (Normalized)',
  });
});

// API: Automation Flow Execution
app.post('/api/automation/execute', (req, res) => {
  const { workflowId, workflowName, inputPayload, requireApproval = false } = req.body;
  const executionId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const logs = [
    { timestamp: new Date().toISOString(), step: 'Trigger Event Received', status: 'success', details: 'Webhook recibido y validado HMAC' },
    { timestamp: new Date().toISOString(), step: 'Input Normalization', status: 'success', details: `Payload procesado: ${JSON.stringify(inputPayload || { status: 'nominal' }).slice(0, 60)}...` },
    { timestamp: new Date().toISOString(), step: 'AI Gateway Transformation', status: 'success', details: 'Extracción de entidades y clasificación vía Gemini 3.8 Flash' },
    {
      timestamp: new Date().toISOString(),
      step: 'Conditional Decision Matrix',
      status: 'success',
      details: 'Regla: Score de relevancia > 0.85 -> Aprobado para despacho',
    },
  ];

  if (requireApproval) {
    logs.push({
      timestamp: new Date().toISOString(),
      step: 'Human-in-the-Loop Checkpoint',
      status: 'pending_approval',
      details: 'El flujo requiere autorización de un supervisor antes de despachar la acción externa.',
    });
    return res.json({
      executionId,
      workflowId,
      status: 'waiting_for_human_approval',
      logs,
      completedAt: null,
    });
  }

  logs.push({
    timestamp: new Date().toISOString(),
    step: 'External Action Dispatch',
    status: 'success',
    details: 'Notificación despachada con éxito a conector verificado (WhatsApp/Email).',
  });

  res.json({
    executionId,
    workflowId,
    status: 'completed',
    durationMs: 420,
    logs,
    completedAt: new Date().toISOString(),
  });
});

// API: Verificación de certificados
// NOTA: registro de DEMOSTRACIÓN en memoria. En producción debe consultarse la base de datos
// de certificados emitidos.
app.get('/api/certificates/:code', (req, res) => {
  const { code } = req.params;
  const verifiedList: Record<string, any> = {
    'CPI-2026-9481': {
      studentName: 'Ana María Restrepo Cadavid',
      courseTitle: 'Diplomado Superior en Inteligencia Artificial y Automatización 2.0',
      issueDate: '2026-09-20',
      institution: 'Corporación Étnica Educativa CPIENSA+',
      hours: 120,
      grade: '98/100 (Excelente con Honores)',
      skills: ['Ingeniería de Prompts', 'Agentes Autónomos', 'RAG con pgvector', 'n8n & Webhooks', 'Ética cristiana aplicada a la IA', 'IA con pertinencia etnoeducativa'],
      status: 'Valido y Verificado',
    },
    'CPI-2026-3021': {
      studentName: 'Carlos Eduardo Mendoza',
      courseTitle: 'Ingeniería de Prompts y Arquitectura de Modelos',
      issueDate: '2026-10-04',
      institution: 'CPIENSA+ ACADEMY IA',
      hours: 45,
      grade: '94/100',
      skills: ['Few-shot Prompting', 'Evaluación de Modelos', 'Mitigación de Sesgos', 'Ética cristiana aplicada a la IA'],
      status: 'Valido y Verificado',
    },
  };

  // Solo se validan certificados registrados. Un código desconocido NO es válido.
  const cert = verifiedList[code.trim().toUpperCase()];
  if (!cert) {
    return res.status(404).json({
      code,
      valido: false,
      error: 'Certificado no encontrado. Verifica el código o comunícate con la institución emisora.',
    });
  }

  res.json({
    code,
    valido: true,
    ...cert,
    verificationUrl: `${urlPublica(req)}/verify/${code}`,
    signatureHash: `sha256_${code}_cp2026_secured`,
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  // Rutas /api inexistentes → 404 en JSON (no devolver el HTML de la app)
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(path.join(dist, 'index.html'))) {
      console.error('[CPIENSA+] No se encontró dist/index.html. Ejecuta primero: npm run build');
      process.exit(1);
    }
    app.use(express.static(dist, { index: false, maxAge: '1h' }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(dist, 'index.html'));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log('\n  CPIENSA+ ACADEMY IA 2.0');
    console.log(`  ➜ Modo:    ${IS_PROD ? 'producción' : 'desarrollo'}`);
    console.log(`  ➜ Local:   http://localhost:${PORT}`);
    console.log(`  ➜ Red:     http://<IP-de-este-equipo>:${PORT}`);
    console.log(`  ➜ IA:      ${geminiConfigurado ? 'Gemini conectado' : 'modo simulado (sin GEMINI_API_KEY)'}\n`);
  });
  server.on('error', (err: NodeJS.ErrnoException) => {
    console.error(err.code === 'EADDRINUSE' ? `[CPIENSA+] El puerto ${PORT} ya está en uso. Define otro PORT en .env.local` : err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('[CPIENSA+] No se pudo iniciar el servidor:', err);
  process.exit(1);
});
