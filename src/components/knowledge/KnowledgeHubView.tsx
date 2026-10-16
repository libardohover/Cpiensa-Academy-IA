import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Upload,
  FileText,
  CheckCircle2,
  ExternalLink,
  Layers,
  Database,
  Sparkles,
  Shield,
} from 'lucide-react';
import { KnowledgeDocument } from '../../types';

interface KnowledgeHubViewProps {
  documents: KnowledgeDocument[];
  onUploadDocument: (doc: KnowledgeDocument) => void;
}

export const KnowledgeHubView: React.FC<KnowledgeHubViewProps> = ({
  documents,
  onUploadDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(
    '¿Qué responsabilidades y sanciones establece la ley colombiana para la transmisión de datos a proveedores de IA?'
  );
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument>(documents[0]);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'Legal' | 'Metodología' | 'Casos' | 'Gobernanza'>(
    'Legal'
  );
  const [newSummary, setNewSummary] = useState<string>('');

  const handleQuery = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch('/api/knowledge/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, topK: 3 }),
      });
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err: any) {
      alert('Error consultando el repositorio vectorial');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const doc: KnowledgeDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      fileType: 'PDF',
      chunksCount: Math.floor(Math.random() * 40) + 15,
      uploadedAt: new Date().toISOString().split('T')[0],
      sizeKb: Math.floor(Math.random() * 1200) + 400,
      status: 'indexed',
      summary: newSummary || 'Documento indexado con embeddings pgvector normalizados.',
    };
    onUploadDocument(doc);
    setUploadModalOpen(false);
    setNewTitle('');
    setNewSummary('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Subsistema F</span>
            <span aria-hidden="true">·</span>
            <span>Knowledge Hub & Recuperación Vectorial (RAG)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Knowledge Hub: Búsqueda Híbrida, Fragmentación y Citas Verificables
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Indexación en PostgreSQL/pgvector con distancia coseno y recuperación con atribución exacta para mitigar alucinaciones.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs shrink-0"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Indexar Nuevo Documento</span>
        </button>
      </div>

      {/* Main Split: Left Documents Repository + Right Vector Search & Chunks */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Document Repository */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white p-5 overflow-y-auto space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Documentos Indexados en la Bóveda
            </span>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {documents.length} archivos
            </span>
          </div>

          <div className="space-y-2.5">
            {documents.map((doc) => {
              const isSelected = selectedDoc.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-blue-700 text-[10px] uppercase tracking-wider font-mono">
                      {doc.category}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {doc.fileType} · {doc.sizeKb} KB
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{doc.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{doc.summary}</p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                    <span className="font-mono">{doc.chunksCount} chunks vectorizados</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{doc.status}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1">
            <div className="font-bold flex items-center gap-1 text-slate-900">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>pgvector HNSW Index</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Métricas de similitud: Cosine Distance normalizado a rango [0.0 - 1.0]. Permisos de lectura aislados por institución.
            </p>
          </div>
        </div>

        {/* Right Column: Semantic Search & Verifiable Citations */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-5">
          {/* Query Bar */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
              Consulta Semántica RAG (Recuperación con Atribución)
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  placeholder="Formula una pregunta técnica o jurídica para buscar en el corpus..."
                />
              </div>

              <button
                onClick={handleQuery}
                disabled={searching || !searchQuery.trim()}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 shrink-0"
              >
                {searching ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Calculando Cosine...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Consultar RAG</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Results with Citations */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-800 uppercase tracking-wide">
                  Fragmentos Recuperados con Similitud Coseno
                </span>
                <span className="font-mono">Top {searchResults.length} matches</span>
              </div>

              <div className="space-y-3">
                {searchResults.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-mono text-[10px] font-bold">
                          #{idx + 1}
                        </span>
                        <span>{item.docTitle}</span>
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Score: {(item.score * 100).toFixed(1)}% Similitud
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold text-blue-800 font-mono">
                      Sección: {item.section}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-mono bg-slate-50 p-3 rounded-lg border border-slate-100">
                      "{item.content}"
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        <span>Cita Verificable: {item.citation}</span>
                      </span>
                      <span className="font-mono text-slate-400">ID: {item.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Inspection Preview */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Detalle del Documento Seleccionado: {selectedDoc.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{selectedDoc.summary}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block">FORMATO</span>
                <span className="font-bold text-slate-900">{selectedDoc.fileType}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block">CHUNKS</span>
                <span className="font-bold text-slate-900">{selectedDoc.chunksCount}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block">TAMAÑO</span>
                <span className="font-bold text-slate-900">{selectedDoc.sizeKb} KB</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block">ESTADO</span>
                <span className="font-bold text-emerald-700">100% Indexado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">Indexar Documento en Bóveda</h3>
            <form onSubmit={handleCreateDocument} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título del Documento</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ej. Manual de Auditoría y Control Interno"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                >
                  <option value="Legal">Legal & Privacidad</option>
                  <option value="Metodología">Metodología Pedagógica</option>
                  <option value="Casos">Casos de Estudio</option>
                  <option value="Gobernanza">Gobernanza & Operaciones</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resumen del Contenido</label>
                <textarea
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs text-slate-900"
                  placeholder="Breve sinopsis del documento..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Procesar y Fragmentar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
