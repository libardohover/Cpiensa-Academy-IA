import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  X,
  ExternalLink,
  Download,
  Printer,
  QrCode,
  ShieldCheck,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { Certificate } from '../../types';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateCode?: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificateCode = 'CPI-2026-9481',
}) => {
  const [certCode, setCertCode] = useState<string>(certificateCode);
  const [certData, setCertData] = useState<Certificate>({
    code: certificateCode,
    studentName: 'Ana María Restrepo Cadavid',
    courseTitle: 'Diplomado Superior en Inteligencia Artificial y Automatización 2.0',
    issueDate: '2026-09-20',
    institution: 'Corporación CPIENSA+ & CPIENSA+ ACADEMY IA',
    hours: 120,
    grade: '98/100 (Excelente con Honores)',
    skills: [
      'Ingeniería de Prompts R-C-T-R',
      'Agentes Autónomos & ReAct',
      'Recuperación Vectorial RAG',
      'Orquestación n8n & Webhooks',
      'Gobernanza y Ley 1581',
    ],
    verificationUrl: `https://cpiensa.edu.co/verify/${certificateCode}`,
    signatureHash: 'sha256_e9c30f4812a03b519cf781_cp2026_verified',
  });
  const [verifying, setVerifying] = useState<boolean>(false);
  const [apiVerificationResult, setApiVerificationResult] = useState<any>(null);

  // Cerrar con la tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const alPresionar = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleVerifyAgainstApi = async () => {
    setVerifying(true);
    setApiVerificationResult(null);

    try {
      const response = await fetch(`/api/certificates/${encodeURIComponent(certCode.trim())}`);
      const data = await response.json();
      setApiVerificationResult(data);
      if (data.valido) {
        setCertData((prev) => ({
          ...prev,
          code: data.code,
          studentName: data.studentName,
          courseTitle: data.courseTitle,
          issueDate: data.issueDate,
          institution: data.institution,
          hours: data.hours,
          grade: data.grade,
          skills: data.skills,
          verificationUrl: data.verificationUrl,
          signatureHash: data.signatureHash,
        }));
      }
    } catch (e) {
      setApiVerificationResult({ valido: false, error: 'No se pudo conectar con el servidor de verificación.' });
    } finally {
      setVerifying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Certificado CPIENSA+"
    >
      {/* La ventana nunca supera el alto de la pantalla: solo el diploma se desplaza */}
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">
              <span className="hidden sm:inline">Certificación Oficial Verificable </span>CPIENSA+ ACADEMY IA
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar certificado"
              title="Cerrar (Esc)"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cerrar</span>
            </button>
          </div>
        </div>

        {/* Certificate Ornamental Frame */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 md:p-10 bg-slate-50 border-8 border-slate-100 text-center relative">
          {apiVerificationResult && !apiVerificationResult.valido && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <span className="-rotate-12 border-4 border-rose-600 text-rose-600 bg-white/90 font-extrabold text-2xl sm:text-3xl tracking-widest px-6 py-2 rounded-lg">
                NO VERIFICADO
              </span>
            </div>
          )}
          <div
            className={`border-2 border-slate-300 p-5 sm:p-8 md:p-10 bg-white shadow-xs relative transition-opacity ${
              apiVerificationResult && !apiVerificationResult.valido ? 'opacity-25' : ''
            }`}
          >
            {/* Institution Badge */}
            <div className="flex flex-col items-center justify-center mb-6">
              <span className="text-[11px] font-bold tracking-widest text-blue-700 uppercase font-mono">
                Corporación Educativa & Tecnológica
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                CPIENSA+ ACADEMY IA
              </h1>
              <div className="w-16 h-0.5 bg-blue-600 my-2" />
              <span className="text-xs text-slate-500 font-medium">
                Por cuanto ha acreditado satisfactoriamente los requisitos académicos y de sustentación, otorga el presente:
              </span>
            </div>

            <div className="my-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                DIPLOMA DE CERTIFICACIÓN PROFESIONAL A
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
                {certData.studentName}
              </h2>
            </div>

            <div className="my-6 max-w-xl mx-auto">
              <p className="text-xs text-slate-600 leading-relaxed">
                Por haber completado con distinción académica el programa de formación integral:
              </p>
              <div className="text-base md:text-lg font-bold text-blue-900 mt-1">
                {certData.courseTitle}
              </div>
              <p className="text-xs text-slate-500 mt-2 font-mono">
                Intensidad: {certData.hours} Horas Académicas · Calificación Final: {certData.grade}
              </p>
            </div>

            {/* Competencies Badges */}
            <div className="my-6 pt-4 border-t border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Competencias Profesionales Validadas en Sustentación
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-700">
                {certData.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Signatures & Verification Hash Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-end text-xs">
              <div className="text-center">
                <div className="font-serif italic text-slate-800 text-sm mb-1">Dr. Alejandro Posada M.</div>
                <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                  Director Académico CPIENSA+
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="p-2 bg-slate-900 text-white rounded-lg">
                  <QrCode className="w-12 h-12" />
                </div>
                <span className="font-mono text-[10px] text-slate-500">
                  CÓDIGO: {certData.code}
                </span>
              </div>

              <div className="text-center">
                <div className="font-serif italic text-slate-800 text-sm mb-1">Dra. Claudia Gómez R.</div>
                <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                  Comité de Certificación IA
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 text-[10px] font-mono text-slate-400 break-all select-all">
              Firma Digital SHA-256: {certData.signatureHash}
            </div>
          </div>
        </div>

        {/* Live API Verification Test Bar */}
        <div className="bg-slate-100 p-3 sm:p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold text-slate-700 whitespace-nowrap">Verificar Código:</span>
            <input
              type="text"
              value={certCode}
              onChange={(e) => setCertCode(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1 font-mono text-slate-900 text-xs w-36 uppercase"
            />
            <button
              onClick={handleVerifyAgainstApi}
              disabled={verifying}
              className="flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Search className="w-3 h-3" />
              <span>Verificar en API</span>
            </button>
          </div>

          {apiVerificationResult?.valido && (
            <span className="text-emerald-700 font-semibold flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Registro Verificado Oficialmente en Servidor</span>
            </span>
          )}
          {apiVerificationResult && !apiVerificationResult.valido && (
            <span role="alert" className="text-rose-700 font-semibold flex items-center gap-1.5">
              <X className="w-4 h-4 text-rose-600" />
              <span>{apiVerificationResult.error || 'Certificado no encontrado.'}</span>
            </span>
          )}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap sm:ml-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Campus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
