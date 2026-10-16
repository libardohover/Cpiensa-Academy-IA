import React, { useState } from 'react';
import {
  ShoppingBag,
  Star,
  Download,
  Terminal,
  Bot,
  Workflow,
  BookOpen,
  Filter,
  CheckCircle2,
  Plus,
} from 'lucide-react';

export const MarketplaceView: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [items, setItems] = useState([
    {
      id: 'mkt-1',
      type: 'agent',
      title: 'Agente Auditor Legal y Contractual MinCiencias',
      author: 'Facultad de Derecho & CPIENSA+',
      rating: 4.9,
      downloads: 840,
      category: 'Legal',
      description: 'Agente especializado en revisión de términos de referencia y detección de riesgos legales según normativa colombiana.',
      verified: true,
    },
    {
      id: 'mkt-2',
      type: 'prompt',
      title: 'Plantilla Maestra de Negociación Minto para C-Level',
      author: 'Comité de Dirección Académica',
      rating: 5.0,
      downloads: 1250,
      category: 'Comunicación',
      description: 'Prompt Few-Shot calibrado para transformar informes operacionales en minutas de decisión estratégica.',
      verified: true,
    },
    {
      id: 'mkt-3',
      type: 'workflow',
      title: 'Flujo de Matrícula y Emisión de Certificado Verificable',
      author: 'Ingeniería LMS CPIENSA+',
      rating: 4.8,
      downloads: 620,
      category: 'Automatización',
      description: 'Orquestación completa n8n: pasarela de pago, creación de carpeta en Drive, emisión de hash SHA-256 y alerta WhatsApp.',
      verified: true,
    },
    {
      id: 'mkt-4',
      type: 'agent',
      title: 'Tutor Socrático de Álgebra Lineal y Programación',
      author: 'Departamento de Ciencias Básicas',
      rating: 4.9,
      downloads: 940,
      category: 'Pedagogía',
      description: 'Agente que no regala la respuesta, formula preguntas guiadas y sugiere ejercicios adaptados al nivel del estudiante.',
      verified: true,
    },
  ]);

  const [publishModal, setPublishModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newType, setNewType] = useState<string>('prompt');

  const filteredItems =
    filterCategory === 'all' ? items : items.filter((it) => it.type === filterCategory);

  const handleImport = (item: any) => {
    alert(`"${item.title}" importado exitosamente a tu espacio de trabajo de la organización.`);
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem = {
      id: `mkt-${Date.now()}`,
      type: newType,
      title: newTitle,
      author: 'Egresado Certificado CPIENSA+',
      rating: 5.0,
      downloads: 1,
      category: 'Comunidad',
      description: newDesc || 'Recurso académico sometido a revisión de pares.',
      verified: false,
    };

    setItems([newItem, ...items]);
    setPublishModal(false);
    setNewTitle('');
    setNewDesc('');
    alert('Tu recurso ha sido sometido a revisión técnica y pedagógica. Aparecerá en el Marketplace institucional tras aprobación.');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Subsistema J</span>
            <span aria-hidden="true">·</span>
            <span>Marketplace Académico & Ecosistema de Recursos</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Marketplace CPIENSA+: Prompts, Agentes y Automatizaciones Certificadas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Catálogo comunitario e institucional con revisión previa por comités pedagógicos y de seguridad.
          </p>
        </div>

        <button
          onClick={() => setPublishModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Someter Recurso a Revisión</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-8 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              filterCategory === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({items.length})
          </button>
          <button
            onClick={() => setFilterCategory('agent')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              filterCategory === 'agent' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agentes
          </button>
          <button
            onClick={() => setFilterCategory('prompt')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              filterCategory === 'prompt' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Prompts
          </button>
          <button
            onClick={() => setFilterCategory('workflow')}
            className={`px-3 py-1 font-semibold rounded-md transition-colors ${
              filterCategory === 'workflow' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Automatizaciones
          </button>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          {filteredItems.length} recursos disponibles
        </span>
      </div>

      {/* Marketplace Grid */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-blue-600 uppercase tracking-wider font-mono">
                    {item.type}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500 font-semibold font-mono">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{item.rating}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <div className="text-xs text-slate-500">Por {item.author}</div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  {item.downloads} descargas
                </span>
                <button
                  onClick={() => handleImport(item)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Importar al Workspace</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Modal */}
      {publishModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Someter Recurso para Publicación
            </h3>
            <form onSubmit={handlePublishSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Recurso</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                >
                  <option value="prompt">Prompt Profesional</option>
                  <option value="agent">Agente Autónomo</option>
                  <option value="workflow">Flujo de Automatización</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título del Recurso</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ej. Clasificador de Quejas Bancarias"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción y Casos de Uso</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                  placeholder="Explica qué problema resuelve y cómo fue probado..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPublishModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Enviar a Revisión de Pares
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
