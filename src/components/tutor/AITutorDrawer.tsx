import { AvisoIA } from '../legal/AvisoIA';
import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User,
  BookOpen,
} from 'lucide-react';

interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
}

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({
  isOpen,
  onClose,
  initialContext = '',
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: '¡Hola! Soy tu Tutor Pedagógico Oficial en CPIENSA+ ACADEMY IA 2.0. Estoy aquí para acompañarte en tu estudio de los 10 módulos, guiarte con preguntas socráticas en tus ejercicios prácticos y ayudarte a dominar la ingeniería de prompts y la automatización con agentes. ¿Qué concepto o lección estamos trabajando hoy?',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { role: 'user' as const, text: query };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${initialContext ? `[Contexto de estudio activo]: ${initialContext}\n\n` : ''}Conversación previa:
${newMessages.map((m) => `${m.role}: ${m.text}`).join('\n')}

Responde como Tutor Socrático de CPIENSA+ ACADEMY IA: fomenta el razonamiento activo, orienta hacia las mejores prácticas pedagógicas y sugiere mejoras concretas.`,
          systemInstruction:
            'Eres el Tutor Académico Oficial de CPIENSA+ ACADEMY IA, de la Corporación CPIENSA+. Respondes con calidez pedagógica, rigor metodológico y método socrático en español formal. Tu formación tiene dos ejes transversales: los valores y principios cristianos (dignidad humana, verdad, servicio, justicia, mayordomía, sabiduría, comunidad y excelencia), que propones con respeto a la libertad de conciencia, y el enfoque etnoeducativo, que reconoce la diversidad étnica y cultural de Colombia (pueblos indígenas, comunidades negras, afrocolombianas, raizales, palenqueras y Rrom) según la Ley 70 de 1993 y el Decreto 804 de 1995. Cuando aporte al aprendizaje, conecta la respuesta con estos ejes sin forzarlos.',
          model: 'gemini-3.8-flash',
          servicio: 'tutor-ia',
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: data.text || 'Excelente reflexión. ¿Cómo aplicarías este principio en un caso real?',
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: 'Buen planteamiento. Para consolidar el aprendizaje, asegúrate de delimitar claramente el rol, el contexto y las restricciones no negociables.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 md:w-[420px] bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider">Tutor Pedagógico Socrático</h3>
            <span className="text-[11px] text-slate-400">CPIENSA+ ACADEMY IA 2.0</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleSend('¿Cómo aplico el marco R-C-T-R en mi trabajo?')}
          className="px-2 py-1 bg-white hover:bg-slate-100 rounded border border-slate-200 text-slate-700 whitespace-nowrap"
        >
          Marco R-C-T-R
        </button>
        <button
          onClick={() => handleSend('¿Cuál es la diferencia entre un agente y un flujo?')}
          className="px-2 py-1 bg-white hover:bg-slate-100 rounded border border-slate-200 text-slate-700 whitespace-nowrap"
        >
          Agente vs Flujo
        </button>
        <button
          onClick={() => handleSend('¿Qué exige la Ley 1581 sobre anonimización?')}
          className="px-2 py-1 bg-white hover:bg-slate-100 rounded border border-slate-200 text-slate-700 whitespace-nowrap"
        >
          Ley 1581
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 text-xs ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
            <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>El tutor está formulando su respuesta socrática...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta a tu tutor académico..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <AvisoIA className="px-4 pb-3" />
      </div>
    </div>
  );
};
