import React from 'react';
import { ShieldAlert } from 'lucide-react';

/**
 * Aviso en las herramientas de IA: el texto se procesa con Google Gemini (EE. UU.)
 * y no debe incluir datos personales (Circular Externa 002 de 2024 de la SIC).
 */
export const AvisoIA: React.FC<{ className?: string }> = ({ className = '' }) => (
  <p className={`flex items-start gap-1.5 text-[11px] leading-snug text-slate-500 ${className}`}>
    <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-px text-amber-600" />
    <span>
      No escribas datos personales ni sensibles. El texto se procesa con Google Gemini (EE. UU.) y la IA puede equivocarse: verifica sus respuestas.{' '}
      <a href="/legal/privacidad" target="_blank" rel="noopener" className="underline hover:text-slate-800">
        Más información
      </a>
    </span>
  </p>
);
