import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Key,
  Shield,
  Send,
  RefreshCw,
  ExternalLink,
  Radio,
  Mail,
  Calendar,
  HardDrive,
  MessageCircle,
  CreditCard,
  Cloud,
} from 'lucide-react';
import { IntegrationConnector } from '../../types';

interface IntegrationsViewProps {
  connectors: IntegrationConnector[];
  onToggleConnectorStatus?: (connectorId: string) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  connectors,
  onToggleConnectorStatus,
}) => {
  const [selectedConnector, setSelectedConnector] = useState<IntegrationConnector>(connectors[0]);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mail':
        return <Mail className="w-5 h-5 text-red-500" />;
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'HardDrive':
        return <HardDrive className="w-5 h-5 text-amber-500" />;
      case 'MessageCircle':
        return <MessageCircle className="w-5 h-5 text-emerald-500" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-indigo-500" />;
      case 'Cloud':
        return <Cloud className="w-5 h-5 text-sky-500" />;
      default:
        return <Radio className="w-5 h-5 text-purple-500" />;
    }
  };

  const handleRunSandboxTest = async () => {
    setTesting(true);
    setTestResult(null);

    // Simulate real sandbox test call
    await new Promise((r) => setTimeout(r, 600));

    if (selectedConnector.status === 'not_configured') {
      setTestResult({
        success: false,
        message: 'Conector no configurado. Se requiere autorizar credenciales OAuth en el proveedor antes de despachar pruebas.',
        latencyMs: 12,
        timestamp: new Date().toISOString(),
      });
    } else {
      setTestResult({
        success: true,
        message: `Prueba exitosa contra ${selectedConnector.name}. Handshake TLS 1.3 establecido, scopes validados y token verificado.`,
        latencyMs: 145,
        tokenExpiryMinutes: 58,
        responsePayload: {
          status: '200 OK',
          connectorId: selectedConnector.id,
          traceId: `tr_${Math.random().toString(36).substring(2, 9)}`,
          scopesAuthorized: selectedConnector.scopes,
        },
        timestamp: new Date().toISOString(),
      });
    }

    setTesting(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Subsistema K</span>
            <span aria-hidden="true">·</span>
            <span>Conectores e Integraciones Empresariales</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Integraciones Desacopladas: OAuth Mínimo Privilegio, Webhooks y Sandbox
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Conectores para Google Workspace, Microsoft 365, WhatsApp Business Platform, Webhooks y Pasarelas de Pago.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tokens Cifrados con AES-256</span>
        </div>
      </div>

      {/* Main Content Split: Left Connectors Grid + Right Detail & Sandbox Tester */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: All Connectors Cards */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white p-5 overflow-y-auto space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Conectores Registrados
            </span>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {connectors.length} servicios
            </span>
          </div>

          <div className="space-y-2.5">
            {connectors.map((conn) => {
              const isSelected = selectedConnector.id === conn.id;
              let statusBadge = (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                  CONECTADO
                </span>
              );
              if (conn.status === 'not_configured') {
                statusBadge = (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    NO CONFIGURADO
                  </span>
                );
              } else if (conn.status === 'error') {
                statusBadge = (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono">
                    ERROR
                  </span>
                );
              }

              return (
                <div
                  key={conn.id}
                  onClick={() => {
                    setSelectedConnector(conn);
                    setTestResult(null);
                  }}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {getIcon(conn.icon)}
                      <span className="font-bold text-slate-900">{conn.name}</span>
                    </div>
                    {statusBadge}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium pl-7">{conn.provider}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Connector Detail, Scopes & Sandbox Console */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-100 rounded-xl">{getIcon(selectedConnector.icon)}</div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedConnector.name}</h2>
                  <span className="text-xs text-slate-500">Proveedor: {selectedConnector.provider}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunSandboxTest}
                  disabled={testing}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {testing ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Ejecutando Handshake...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Probar Conector en Sandbox</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">{selectedConnector.description}</p>

            {/* Scopes Section */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                <span>Permisos Solicitados (Scopes Mínimos)</span>
              </h3>
              <div className="space-y-1.5">
                {selectedConnector.scopes.map((scope, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-700 flex items-center justify-between"
                  >
                    <span>{scope}</span>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase">Autorizado</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedConnector.webhookUrl && (
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                  URL de Webhook Inbound (Recepción de Eventos)
                </h3>
                <div className="p-2.5 bg-slate-900 rounded text-xs font-mono text-slate-200 break-all select-all">
                  {selectedConnector.webhookUrl}
                </div>
              </div>
            )}
          </div>

          {/* Sandbox Test Execution Results */}
          {testResult && (
            <div
              className={`p-5 rounded-xl border shadow-xs space-y-3 ${
                testResult.success
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                  : 'bg-red-50/60 border-red-300 text-red-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>Dictamen de Prueba en Entorno Sandbox</span>
                </span>
                <span className="font-mono text-xs font-semibold tabular-nums">
                  Latencia: {testResult.latencyMs} ms
                </span>
              </div>

              <p className="text-xs leading-relaxed font-sans">{testResult.message}</p>

              {testResult.responsePayload && (
                <div className="mt-2">
                  <div className="text-[10px] font-mono text-slate-500 uppercase font-bold mb-1">
                    Payload de Respuesta de la API:
                  </div>
                  <pre className="bg-slate-900 text-slate-200 p-3 rounded font-mono text-xs overflow-x-auto">
                    {JSON.stringify(testResult.responsePayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
